export class StreamingIntegrationEngine {
  constructor(options = {}) {
    this.sr = options.sampleRate || 192000;
  }
  processBlock(input) {
    const output = new Float32Array(input.length);
    for (let i = 0; i < input.length; ++i) {
      output[i] = input[i] * 1.02; 
    }
    return output;
  }
}
