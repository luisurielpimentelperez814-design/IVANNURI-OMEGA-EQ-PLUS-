export class KLFrameAdaptiveProcessor {
  constructor(sampleRate = 192000) {
    this.sr = sampleRate;
    this.MIN_FRAME = 128;
    this.MAX_FRAME = 2048;
    this.DEFAULT_FRAME = 512;
    this.currentFrameSize = this.DEFAULT_FRAME;
    this.prevSpectrum = new Float32Array(1024);
    
    this.klThresholdLow = 0.01;
    this.klThresholdHigh = 0.5;
    this.adaptationSpeed = 0.3;
  }
  
  besselI0(x) {
    let sum = 1, term = 1;
    for (let k = 1; k < 25; k++) {
      term *= (x * x) / (4 * k * k);
      sum += term;
      if (Math.abs(term) < 1e-15) break;
    }
    return sum;
  }
  
  calculateKLDivergence(currentSpectrum, previousSpectrum) {
    let kl = 0;
    let epsilon = 1e-10;
    for(let i = 0; i < currentSpectrum.length; i++) {
        let p = currentSpectrum[i] + epsilon;
        let q = previousSpectrum[i] + epsilon;
        kl += p * Math.log(p / q);
    }
    return kl;
  }

  adaptFrameSize(currentSpectrum) {
    const kl = this.calculateKLDivergence(currentSpectrum, this.prevSpectrum);
    this.prevSpectrum.set(currentSpectrum);

    if (kl < this.klThresholdLow) {
        this.currentFrameSize = Math.min(this.MAX_FRAME, this.currentFrameSize + this.adaptationSpeed * this.MAX_FRAME);
    } else if (kl > this.klThresholdHigh) {
        this.currentFrameSize = Math.max(this.MIN_FRAME, this.currentFrameSize - this.adaptationSpeed * this.MAX_FRAME);
    }

    return Math.pow(2, Math.round(Math.log2(this.currentFrameSize)));
  }

  processBlock(input) {
      const spectrum = new Float32Array(input.length);
      for(let i = 0; i < input.length; i++) spectrum[i] = Math.abs(input[i]);
      
      const newFrame = this.adaptFrameSize(spectrum);
      return { adaptedFrameSize: newFrame, divergence: this.calculateKLDivergence(spectrum, this.prevSpectrum) };
  }
}
