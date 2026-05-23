export class HolographicUpmixer {
  constructor(sampleRate = 192000) {
    this.sr = sampleRate;
    this.channels = 8;
  }

  processBlock(leftInput, rightInput) {
    const out = new Float32Array(this.channels);
    out[0] = leftInput;          // FL
    out[1] = rightInput;         // FR
    out[2] = leftInput * 0.7;    // SL
    out[3] = rightInput * 0.7;   // SR
    out[4] = leftInput * 0.5;    // RL
    out[5] = rightInput * 0.5;   // RR
    out[6] = (leftInput + rightInput) * 0.25; // Top
    out[7] = (leftInput - rightInput) * 0.25; // Bottom
    return out;
  }
}
