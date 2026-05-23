export class QuantumHRTFProcessor {
  constructor(sampleRate = 192000, numVirtualSources = 64) {
    this.sr = sampleRate;
    this.numSources = numVirtualSources;
    this.headRadius = 0.0875; 
    this.soundSpeed = 343;    
    
    this.virtualSources = new Array(numVirtualSources).fill(null).map(() => ({
      delay: 0, gain: 0, phase: 0, chaosState: Math.random()
    }));
    
    this.quantumIRs = this.generateQuantumIRs();
    this.reverbMemory = new Float32Array(sampleRate * 3);
    this.reverbPos = 0;
  }
  
  quantumChaos(seed, iterations = 1) {
    let x = seed;
    const r = 3.999999;
    for (let i = 0; i < iterations; i++) {
      x = r * x * (1 - x);
      x += (Math.random() - 0.5) * 1e-9;
      if (x <= 0 || x >= 1) x = 0.5;
    }
    return x;
  }
  
  generateQuantumIRs() {
    const irs = [];
    for (let i = 0; i < this.numSources; i++) {
      const length = 2048 + Math.floor(this.quantumChaos(i * 0.1) * 4096);
      const ir = new Float32Array(length);
      let chaos = this.quantumChaos(i * 0.137);
      for (let n = 0; n < length; n++) {
        chaos = this.quantumChaos(chaos, 3);
        ir[n] = (chaos * 2 - 1) * Math.exp(-n / (length * 0.3));
      }
      irs.push(ir);
    }
    return irs;
  }
  
  calculateILD(azimuth, elevation) {
    const theta = azimuth * Math.PI / 180;
    const r_d = this.headRadius / 1.0;
    return {
      left: 20 * Math.log10(Math.max(1 + r_d * Math.sin(theta), 0.01)),
      right: 20 * Math.log10(Math.max(1 - r_d * Math.sin(theta), 0.01))
    };
  }
  
  calculateITD(azimuth) {
    const theta = azimuth * Math.PI / 180;
    const tau = (this.headRadius / this.soundSpeed) * (theta + Math.sin(theta));
    return { left: tau > 0 ? 0 : Math.abs(tau), right: tau > 0 ? tau : 0 };
  }
  
  processHRTF(leftInput, rightInput) {
    const outputs = new Float32Array(this.numSources);
    
    for (let i = 0; i < this.numSources; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / this.numSources);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const azimuth = theta * 180 / Math.PI;
      
      const ild = this.calculateILD(azimuth, 90 - phi * 180 / Math.PI);
      
      const gainL = Math.pow(10, ild.left / 20);
      const gainR = Math.pow(10, ild.right / 20);
      const sourceSignal = (leftInput * gainL + rightInput * gainR) * 0.5;
      
      const ir = this.quantumIRs[i];
      let convolved = 0;
      for (let n = 0; n < Math.min(ir.length, 512); n++) {
        convolved += this.reverbMemory[(this.reverbPos - n + ir.length) % ir.length] * ir[n];
      }
      outputs[i] = sourceSignal * 0.7 + convolved * 0.3;
      this.virtualSources[i].chaosState = this.quantumChaos(this.virtualSources[i].chaosState);
    }
    
    let outL = 0, outR = 0;
    for (let i = 0; i < this.numSources; i++) {
      const pan = (i / (this.numSources - 1)) * 2 - 1;
      outL += outputs[i] * Math.cos((pan + 1) * Math.PI / 4) * (1 / this.numSources);
      outR += outputs[i] * Math.sin((pan + 1) * Math.PI / 4) * (1 / this.numSources);
    }
    
    this.reverbMemory[this.reverbPos] = (leftInput + rightInput) * 0.5;
    this.reverbPos = (this.reverbPos + 1) % this.reverbMemory.length;
    
    return { left: outL, right: outR, holographicField: outputs };
  }
  
  mutateEnvironment() { this.quantumIRs = this.generateQuantumIRs(); }
  reset() { this.reverbMemory.fill(0); this.reverbPos = 0; }
}
