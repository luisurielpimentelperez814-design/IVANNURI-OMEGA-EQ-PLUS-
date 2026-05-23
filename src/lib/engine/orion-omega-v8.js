export const PHYSICS = {
  C: 299792458,
  H: 6.62607015e-34,
  K_B: 1.380649e-23,
  P0: 20e-6,
  SR_TARGET: 192000,
  JA: { MS: 7.5e5, A: 350, ALPHA: 1.8e-3, K: 420, C: 0.12, RHO: 1.2e-8 },
  TUBE: { MU: 100, KX: 1.73, KP: 600, VCT: 0.12, VP: 250, RG: 1.0e3, RP: 100e3, CGK: 1.6e-12, CPK: 1.6e-12 },
};

export class NvsNPSolver {
  N = 0; NP = 0; e = 0; integral_e = 0; prev_e = 0;
  dt = 1 / PHYSICS.SR_TARGET;
  Kp = 0.5; Ki = 0.1; Kd = 0.05;
  memory = new Float32Array(1024);
  memPos = 0;

  step(N_input) {
    this.N = N_input;
    this.e = this.N - this.NP;
    this.integral_e = Math.max(-10, Math.min(10, this.integral_e + this.e * this.dt));
    const de = (this.e - (this.prev_e || 0)) / this.dt;
    this.prev_e = this.e;
    
    const control = this.Kp * this.e + this.Ki * this.integral_e + this.Kd * de;
    const nonlinear = 0.8 * Math.tanh(2.5 * this.N);
    this.NP = Math.max(-1, Math.min(1, this.NP + (nonlinear + control) * this.dt));
    
    this.memory[this.memPos] = this.NP;
    this.memPos = (this.memPos + 1) % this.memory.length;
    
    return { N: this.N, NP: this.NP, e: this.e, converged: Math.abs(this.e) < 1e-6 };
  }

  getConvergenceIndex() {
    const recent = this.memory.slice(-256);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, x) => sum + (x - mean) ** 2, 0) / recent.length;
    const snr = (mean * mean) / (variance + 1e-10);
    return 1 / (1 + Math.exp(-snr + 10));
  }

  reset() {
    this.N = 0; this.NP = 0; this.e = 0; this.integral_e = 0; this.prev_e = 0;
    this.memory.fill(0); this.memPos = 0;
  }
}

export class JilesAthertonReal {
  constructor(params = PHYSICS.JA) {
    this.params = params;
    this.M = 0; this.H_prev = 0; this.dMdH_prev = 0;
  }
  langevin(x) {
    const ax = Math.abs(x);
    if (ax < 1e-10) return x / 3;
    const sinh_x = (Math.exp(x) - Math.exp(-x)) / 2;
    if (Math.abs(sinh_x) < 1e-15) return x / 3;
    return ((Math.exp(x) + Math.exp(-x)) / 2 / sinh_x) - (1 / x);
  }
  dLangevin(x) {
    const ax = Math.abs(x);
    if (ax < 1e-10) return 1 / 3;
    const sinh_x = (Math.exp(x) - Math.exp(-x)) / 2;
    if (Math.abs(sinh_x) < 1e-15) return 1 / 3;
    const csch_x = 1 / sinh_x;
    return (1 / (x * x)) - (csch_x * csch_x);
  }
  dMdH_at(M, H) {
    const { MS, A, ALPHA, K, C } = this.params;
    const H_e = H + ALPHA * M;
    const M_an = MS * this.langevin(H_e / A);
    const dM_an_dH = MS * this.dLangevin(H_e / A) / A * (1 + ALPHA * (this.dMdH_prev || 0));
    const delta = H > this.H_prev ? 1 : -1;
    const denom = delta * K - ALPHA * (M_an - M);
    if (Math.abs(denom) < 1e-10) return C * dM_an_dH;
    return (M_an - M) / denom + C * dM_an_dH;
  }
  solveRK4(H, dH) {
    const dt = Math.abs(dH);
    const sign = dH > 0 ? 1 : -1;
    const k1 = this.dMdH_at(this.M, H);
    const k2 = this.dMdH_at(this.M + 0.5 * dt * k1, H + 0.5 * dH);
    const k3 = this.dMdH_at(this.M + 0.5 * dt * k2, H + 0.5 * dH);
    const k4 = this.dMdH_at(this.M + dt * k3, H + dH);
    this.M += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4) * sign;
    this.M = Math.max(-this.params.MS, Math.min(this.params.MS, this.M));
    this.H_prev = H;
    return this.M;
  }
  reset() { this.M = 0; this.H_prev = 0; this.dMdH_prev = 0; }
}

export class KorenCordellReal {
  constructor(params = PHYSICS.TUBE) { this.params = params; this.thermal = 300; }
  process(V_gk, drive, warmth, frequency = 1000) {
    const { MU, KX, KP, VCT, VP, RP, CPK } = this.params;
    const V_gk_driven = V_gk * drive * 3.0;
    const I_k = VP / (KP * (1 + Math.exp(KX * (V_gk_driven + VCT))));
    const I_p = MU * I_k;
    const omega = 2 * Math.PI * frequency;
    const Z_mag = RP / Math.sqrt(1 + (omega * CPK * RP) ** 2);
    const sym = I_p * (Z_mag / RP);
    const asym = (0.02 + warmth * 0.08) * V_gk_driven * V_gk_driven * (V_gk_driven > 0 ? 1 : -0.4);
    this.thermal = this.thermal * 0.9999 + Math.abs(I_p) * 0.1;
    return this.softLimit((sym + asym) * (1 - (this.thermal - 300) * 0.0001));
  }
  softLimit(x) {
    const thresh = 0.95, knee = 0.1;
    if (Math.abs(x) < thresh - knee) return x;
    const sign = x > 0 ? 1 : -1;
    const excess = Math.abs(x) - (thresh - knee);
    if (Math.abs(x) > thresh + knee) return sign * (thresh + knee * Math.tanh(excess / knee));
    const t = excess / (2 * knee);
    return sign * ((thresh - knee) + (t * t * (3 - 2 * t)) * (knee * 0.5));
  }
  reset() { this.thermal = 300; }
}

export class OrionOmegaV8 {
  constructor(options = {}) {
    this.sr = options.sampleRate || PHYSICS.SR_TARGET;
    this.nvsnp = new NvsNPSolver();
    this.ja = new JilesAthertonReal();
    this.tube = new KorenCordellReal();
    this.sampleCount = 0;
  }
  processSample(x) {
    const np = this.nvsnp.step(x).NP;
    const H = np * 2.75;
    const dH = H - this.ja.H_prev;
    const M = this.ja.solveRK4(H, dH);
    const tape_out = Math.tanh(M / PHYSICS.JA.MS * 1.3);
    return this.tube.process(tape_out, 1.2, 0.5, 1000);
  }
  processBlock(block) {
    const output = new Float32Array(block.length);
    for (let i = 0; i < block.length; i++) {
      output[i] = this.processSample(block[i]);
    }
    return output;
  }
  reset() { this.nvsnp.reset(); this.ja.reset(); this.tube.reset(); }
}
