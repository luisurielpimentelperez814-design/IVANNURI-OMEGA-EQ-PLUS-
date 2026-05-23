/**
 * HRTF MULTIESCALA Y REVERBERACIÓN CUÁNTICA
 */

export class QuantumHRTFProcessor {
  constructor(sampleRate = 48000, numVirtualSources = 8) {
    this.sr = sampleRate;
    this.numSources = numVirtualSources;
    this.reverbMemory = new Float32Array(sampleRate * 2);
    this.reverbPos = 0;
    this.quantumIRs = this.generateQuantumIRs();
  }
  
  generateQuantumIRs() {
    const irs = [];
    for (let i = 0; i < this.numSources; i++) {
      const ir = new Float32Array(128); // Reduced for performance
      let chaos = Math.random();
      for (let n = 0; n < ir.length; n++) {
        chaos = (3.9 * chaos * (1 - chaos));
        ir[n] = (chaos * 2 - 1) * Math.exp(-n / 40);
      }
      irs.push(ir);
    }
    return irs;
  }
  
  processHRTF(sampleL, sampleR) {
    const mono = (sampleL + sampleR) * 0.5;
    this.reverbMemory[this.reverbPos] = mono;
    
    let outL = 0, outR = 0;
    for (let i = 0; i < this.numSources; i++) {
      const ir = this.quantumIRs[i];
      let convolved = 0;
      for (let n = 0; n < 64; n++) { // Only check first 64 taps
         const idx = (this.reverbPos - n + this.reverbMemory.length) % this.reverbMemory.length;
         convolved += this.reverbMemory[idx] * ir[n];
      }
      const pan = i / (this.numSources - 1);
      outL += convolved * (1 - pan);
      outR += convolved * pan;
    }
    
    this.reverbPos = (this.reverbPos + 1) % this.reverbMemory.length;
    return { left: outL / this.numSources, right: outR / this.numSources };
  }
}

export default QuantumHRTFProcessor;
