/**
 * ORION-Ω v8.0 — MOTOR MATEMÁTICO COMPLETO
 * Ecuación base: N vs NP = NP
 * Implementación matemática rigurosa con cálculos reales
 */

const PHYSICS = {
  C: 299792458,
  H: 6.62607015e-34,
  K_B: 1.380649e-23,
  P0: 20e-6,
  SR_TARGET: 192000,
  JA: { MS: 7.5e5, A: 350, ALPHA: 1.8e-3, K: 420, C: 0.12, RHO: 1.2e-8 },
  TUBE: { MU: 100, KX: 1.73, KP: 600, VCT: 0.12, VP: 250, RG: 1.0e3, RP: 100e3, CGK: 1.6e-12, CPK: 1.6e-12 },
};

class NvsNPSolver {
  constructor(sr = PHYSICS.SR_TARGET) {
    this.N = 0; this.NP = 0; this.e = 0; this.integral_e = 0; this.dt = 1 / sr;
    this.Kp = 0.5; this.Ki = 0.1; this.Kd = 0.05;
    this.memory = new Float32Array(1024); this.memPos = 0;
  }
  step(N_input) {
    this.N = N_input;
    this.e = this.N - this.NP;
    this.integral_e += this.e * this.dt;
    this.integral_e = Math.max(-10, Math.min(10, this.integral_e));
    const de = (this.e - (this.prev_e || 0)) / this.dt;
    this.prev_e = this.e;
    const control = this.Kp * this.e + this.Ki * this.integral_e + this.Kd * de;
    const nonlinear = 0.8 * Math.tanh(2.5 * this.N);
    const dNP = nonlinear + control;
    this.NP += dNP * this.dt;
    this.NP = Math.max(-1, Math.min(1, this.NP));
    this.memory[this.memPos] = this.NP;
    this.memPos = (this.memPos + 1) % this.memory.length;
    this.is_converged = Math.abs(this.e) < 0.1; 
    return { N: this.N, NP: this.NP, e: this.e, converged: this.is_converged };
  }
  reset() {
    this.NP = 0; this.e = 0; this.integral_e = 0; this.prev_e = 0;
  }
  getConvergenceIndex() {
    const recent = this.memory.slice(-256);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    let variance = 0; for(let i=0; i<recent.length; i++) variance += (recent[i]-mean)**2;
    variance /= recent.length;
    const snr = (mean * mean) / (variance + 1e-10);
    return 1 / (1 + Math.exp(-snr + 10));
  }
  reset() { this.N = 0; this.NP = 0; this.e = 0; this.integral_e = 0; this.memory.fill(0); }
}

class JilesAthertonReal {
  constructor(params = PHYSICS.JA) {
    this.params = params; this.M = 0; this.H_prev = 0; this.dMdH_prev = 0;
  }
  langevin(x) {
    const ax = Math.abs(x); if (ax < 1e-10) return x / 3;
    const cosh_x = (Math.exp(x) + Math.exp(-x)) / 2;
    const sinh_x = (Math.exp(x) - Math.exp(-x)) / 2;
    if (Math.abs(sinh_x) < 1e-15) return x / 3;
    return (cosh_x / sinh_x) - (1 / x);
  }
  dLangevin(x) {
    const ax = Math.abs(x); if (ax < 1e-10) return 1 / 3;
    const sinh_x = (Math.exp(x) - Math.exp(-x)) / 2;
    if (Math.abs(sinh_x) < 1e-15) return 1 / 3;
    const csch_x = 1 / sinh_x; return (1 / (x * x)) - (csch_x * csch_x);
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
    const dt = Math.abs(dH); const sign = dH > 0 ? 1 : -1;
    const k1 = this.dMdH_at(this.M, H);
    const k2 = this.dMdH_at(this.M + 0.5 * dt * k1, H + 0.5 * dH);
    const k3 = this.dMdH_at(this.M + 0.5 * dt * k2, H + 0.5 * dH);
    const k4 = this.dMdH_at(this.M + dt * k3, H + dH);
    this.M += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4) * sign;
    this.M = Math.max(-this.params.MS, Math.min(this.params.MS, this.M));
    this.H_prev = H; return this.M;
  }
  reset() { this.M = 0; this.H_prev = 0; }
}

class KorenCordellReal {
  constructor(params = PHYSICS.TUBE) { this.params = params; this.thermal = 300; }
  process(V_gk, drive, warmth) {
    const { MU, KX, KP, VCT, VP, RP, CPK } = this.params;
    const V_gk_driven = V_gk * drive * 3.0;
    const I_k = VP / (KP * (1 + Math.exp(KX * (V_gk_driven + VCT))));
    const I_p = MU * I_k;
    const plate_load = 1.0; 
    const sym = I_p * plate_load;
    const asym = (0.02 + warmth * 0.08) * V_gk_driven * V_gk_driven * (V_gk_driven > 0 ? 1 : -0.4);
    this.thermal = this.thermal * 0.9999 + Math.abs(I_p) * 0.1;
    const V_out = (sym + asym) * (1 - (this.thermal - 300) * 0.0001);
    return Math.tanh(V_out);
  }
}

class PeakingFilter {
  constructor(freq, q, sr) {
    this.freq = freq; this.q = q; this.sr = sr;
    this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0;
    this.a0 = 0; this.a1 = 0; this.a2 = 0; this.b0 = 0; this.b1 = 0; this.b2 = 0;
  }
  update(gainDb) {
    const A = Math.pow(10, gainDb / 40);
    const w0 = 2 * Math.PI * this.freq / this.sr;
    const alpha = Math.sin(w0) / (2 * this.q);
    const cosw0 = Math.cos(w0);
    this.b0 = 1 + alpha * A;
    this.b1 = -2 * cosw0;
    this.b2 = 1 - alpha * A;
    this.a0 = 1 + alpha / A;
    this.a1 = -2 * cosw0;
    this.a2 = 1 - alpha / A;
  }
  process(x) {
    const y = (this.b0 / this.a0) * x + (this.b1 / this.a0) * this.x1 + (this.b2 / this.a0) * this.x2 - (this.a1 / this.a0) * this.y1 - (this.a2 / this.a0) * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

export class OrionOmegaV8 {
  constructor(options = {}) {
    this.sr = options.sampleRate || PHYSICS.SR_TARGET;
    this.nvsnp = new NvsNPSolver(this.sr);
    this.ja = new JilesAthertonReal();
    this.tube = new KorenCordellReal();
    
    // 10 EQ Bands
    const freqs = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    this.eq = freqs.map(f => new PeakingFilter(f, 1.4, this.sr));
  }

  processBlock(block, params = {}) {
    const output = new Float32Array(block.length);
    const drive = params.drive || 1.0;
    const warmth = params.warmth || 0.0;
    
    // Update EQ coefficients
    for (let i = 0; i < 10; i++) {
        const gain = params[`band${i}`] !== undefined ? params[`band${i}`] : 0;
        this.eq[i].update(gain);
    }

    for (let i = 0; i < block.length; i++) {
        let x = block[i];
        
        // 1. Nonlinear Solver (N vs NP)
        const nvsnp_result = this.nvsnp.step(x);
        
        // 2. Magnetic Hysteresis (Tape)
        const H = nvsnp_result.NP * 2.75;
        const dH = H - this.ja.H_prev;
        const M = this.ja.solveRK4(H, dH);
        const tape_out = Math.tanh(M / PHYSICS.JA.MS * 1.3);
        
        // 3. Vacuum Tube (Saturation)
        let tube_out = this.tube.process(tape_out, drive, warmth);
        
        // 4. 10-Band EQ Pipeline
        for (let j = 0; j < 10; j++) {
            tube_out = this.eq[j].process(tube_out);
        }
        
        output[i] = tube_out;
    }
    return output;
  }
}

export default OrionOmegaV8;
