/**
 * KL-FRAME-ADAPTIVE ANTI-GRANULARIDAD
 */

export class KLFrameAdaptiveProcessor {
  constructor(sampleRate = 192000) {
    this.sr = sampleRate; this.currentFrameSize = 512;
  }
  processBlock(input) {
    return { adaptedFrameSize: this.currentFrameSize };
  }
}

export default KLFrameAdaptiveProcessor;
