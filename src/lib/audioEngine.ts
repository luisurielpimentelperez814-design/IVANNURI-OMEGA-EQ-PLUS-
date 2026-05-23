import orionCode from "./orion-omega-v8.js?raw";
import hrtfCode from "./1-hrtf-quantum-reverb.js?raw";
import neuralCode from "./2-neural-harmonic-engine.js?raw";
import klCode from "./3-kl-frame-adaptive.js?raw";
import holoCode from "./4-holographic-upmixer.js?raw";
import pllCode from "./5-aerospace-pll.js?raw";
import streamingCode from "./6-streaming-integration.js?raw";
import mutationCode from "./7-quantum-mutation.js?raw";

export class AudioEngine {
  ctx: AudioContext;
  sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  eqBands: BiquadFilterNode[] = [];
  gainNode: GainNode;
  analyserNode: AnalyserNode;
  workletNode: AudioWorkletNode | null = null;

  frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  constructor() {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx({ latencyHint: 'interactive' });
    this.gainNode = this.ctx.createGain();
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.initBands();

    // Fallback path: EQ -> Gain -> Destination (until worklet replaces it)
    if (this.eqBands.length > 0) {
      this.eqBands[this.eqBands.length - 1].connect(this.gainNode);
    }
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
  }

  async initWorklet() {
    if (this.workletNode) return;

    const clean = (code: string) => code
      .replace(/export\s+default\s+.*?;/gm, '')
      .replace(/export\s+\{\s*[\s\S]*?\s*\};/gm, '')
      .replace(/export\s+class\s+/gm, 'class ')
      .replace(/export\s+const\s+/gm, 'const ')
      .replace(/export\s+function\s+/gm, 'function ');

    const workletCode = `
${clean(orionCode)}
${clean(hrtfCode)}
${clean(neuralCode)}
${clean(klCode)}
${clean(holoCode)}
${clean(pllCode)}
${clean(streamingCode)}
${clean(mutationCode)}

class IVANNURIProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'drive', defaultValue: 1.2, minValue: 0.1, maxValue: 10.0 },
      { name: 'warmth', defaultValue: 1.1, minValue: 0.0, maxValue: 5.0 },
      { name: 'reverbMix', defaultValue: 0.15, minValue: 0.0, maxValue: 1.0 },
      { name: 'neuralDepth', defaultValue: 0.3, minValue: 0.0, maxValue: 1.0 },
      { name: 'neuralBoost', defaultValue: 0.5, minValue: 0.0, maxValue: 1.0 },
      { name: 'band0', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band1', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band2', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band3', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band4', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band5', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band6', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band7', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band8', defaultValue: 0, minValue: -24, maxValue: 24 },
      { name: 'band9', defaultValue: 0, minValue: -24, maxValue: 24 },
    ];
  }

  constructor() {
    super();
    const sr = sampleRate; 

    this.enginesL = {
        orion: new OrionOmegaV8({ sampleRate: sr }),
        neural: new NeuralHarmonicEngine(sr),
        mutation: new QuantumMutationEngine(sr),
        hrtf: new QuantumHRTFProcessor(sr)
    };
    this.enginesR = {
        orion: new OrionOmegaV8({ sampleRate: sr }),
        neural: new NeuralHarmonicEngine(sr),
        mutation: new QuantumMutationEngine(sr),
        hrtf: new QuantumHRTFProcessor(sr)
    };

    this.features = {
        quantumReverb: false, neuralHarmonics: false, klAdaptive: false, holographic: false,
        pll: false, streaming: false, quantumMutation: false, neuralAutoEq: false
    };

    this.bypass = false;
    this.currentHash = "AE-77-F4-12-00-B1";
    this.isConverged = true;

    this.port.onmessage = (e) => {
      if (e.data.type === 'TOGGLE_BYPASS') this.bypass = e.data.value;
      if (e.data.type === 'TOGGLE_FEATURE') this.features[e.data.feature] = e.data.value;
      if (e.data.type === 'GET_HASH') {
        this.port.postMessage({ type: 'HASH_RESULT', value: this.currentHash, converged: this.isConverged });
      }
      if (e.data.type === 'RESET_SYNC') {
        this.enginesL.orion.nvsnp.reset();
        this.enginesR.orion.nvsnp.reset();
      }
    };
  }

  calculateHash(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 4) {
        sum += Math.abs(buffer[i]);
    }
    const seed = (sum * 1000000) % 0xFFFFFF;
    const hex = Math.floor(seed).toString(16).toUpperCase().padStart(6, '0');
    const part2 = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    return hex.slice(0,2)+"-"+hex.slice(2,4)+"-"+hex.slice(4,6)+"-"+part2.slice(0,2)+"-"+part2.slice(2,4)+"-"+part2.slice(4,6);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]; 
    if (!input || !input[0] || input[0].length === 0) return true;
    
    const output = outputs[0];
    if (!output || !output[0]) return true;

    if (Math.random() < 0.01) {
        this.currentHash = this.calculateHash(input[0]);
    }

    if (this.bypass) {
        for (let c = 0; c < Math.min(input.length, output.length); c++) {
            output[c].set(input[c]);
        }
        return true;
    }

    const p = {}; 
    const paramNames = ['drive', 'warmth', 'reverbMix', 'neuralDepth', 'neuralBoost', 'band0', 'band1', 'band2', 'band3', 'band4', 'band5', 'band6', 'band7', 'band8', 'band9'];
    for (const k of paramNames) {
        p[k] = parameters[k] ? parameters[k][0] : 0;
    }
    
    const inputL = input[0];
    const inputR = input.length > 1 ? input[1] : inputL;
    const bufferLen = inputL.length;

    // 1. Orion Engine (Non-linear saturation + Multi-band EQ)
    let outL = this.enginesL.orion.processBlock(inputL, p);
    let outR = input.length > 1 ? this.enginesR.orion.processBlock(inputR, p) : outL;

    // 2. Neural Harmonic Engine
    if (this.features.neuralHarmonics || p.neuralDepth > 0) {
        outL = this.enginesL.neural.processBlock(outL, { rms: p.neuralDepth, boost: p.neuralBoost });
        outR = this.enginesR.neural.processBlock(outR, { rms: p.neuralDepth, boost: p.neuralBoost });
    }

    // 3. Quantum Mutation
    if (this.features.quantumMutation) {
        this.enginesL.mutation.isActive = true;
        this.enginesR.mutation.isActive = true;
        outL = this.enginesL.mutation.processBlock(outL);
        outR = this.enginesR.mutation.processBlock(outR);
    }

    // 4. Quantum HRTF Reverb (Sample-by-sample loop)
    if (p.reverbMix > 0) {
        for (let i = 0; i < bufferLen; i++) {
            const resL = this.enginesL.hrtf.processHRTF(outL[i], outL[i]);
            const resR = this.enginesR.hrtf.processHRTF(outR[i], outR[i]);
            outL[i] = (outL[i] * (1 - p.reverbMix)) + (resL.left * p.reverbMix);
            outR[i] = (outR[i] * (1 - p.reverbMix)) + (resR.right * p.reverbMix);
        }
    }

    // 5. Output Sanitation
    for (let i = 0; i < bufferLen; i++) {
        const sL = Number.isFinite(outL[i]) ? outL[i] : 0;
        const sR = Number.isFinite(outR[i]) ? outR[i] : 0;
        output[0][i] = sL;
        if (output.length > 1) output[1][i] = sR;
    }

    return true;
  }
}

registerProcessor('ivannuri-processor', IVANNURIProcessor);
    `;

    const blob = new Blob([workletCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    await this.ctx.audioWorklet.addModule(url);

    this.workletNode = new AudioWorkletNode(this.ctx, "ivannuri-processor", {
      numberOfInputs: 1,
      numberOfOutputs: 1
    });

    if (this.eqBands.length > 0) {
      // Remove fallback connection
      this.eqBands[this.eqBands.length - 1].disconnect(this.gainNode);
      // Connect to worklet
      this.eqBands[this.eqBands.length - 1].connect(this.workletNode);
    }

    this.workletNode.connect(this.gainNode);
  }

  get inputNode() { return this.eqBands[0]; }

  private initBands() {
    let prevNode: AudioNode | null = null;
    this.frequencies.forEach((freq, i) => {
      const filter = this.ctx.createBiquadFilter();
      filter.type = i === 0 ? "lowshelf" : i === this.frequencies.length - 1 ? "highshelf" : "peaking";
      filter.frequency.value = freq;
      filter.gain.value = 0;
      this.eqBands.push(filter);
      if (prevNode) prevNode.connect(filter);
      prevNode = filter;
    });
  }

  setFeatureToggle(feature: string, value: boolean) {
      this.workletNode?.port.postMessage({ type: 'TOGGLE_FEATURE', feature, value });
  }

  setWarmth(v: number) { this.workletNode?.parameters.get("warmth")?.setTargetAtTime(v, this.ctx.currentTime, 0.05); }
  setDrive(v: number) { this.workletNode?.parameters.get("drive")?.setTargetAtTime(v, this.ctx.currentTime, 0.05); }
  setNeuralBoost(v: number) { this.workletNode?.parameters.get("neuralBoost")?.setTargetAtTime(v, this.ctx.currentTime, 0.05); }
  setBypass(v: boolean) { this.workletNode?.port.postMessage({ type: "TOGGLE_BYPASS", value: v }); }
  toggleAI(v: boolean) { this.workletNode?.port.postMessage({ type: "TOGGLE_AI", value: v }); }

  async setOutputDevice(deviceId: string) {
    if (this.ctx && typeof (this.ctx as any).setSinkId === 'function') {
        await (this.ctx as any).setSinkId(deviceId);
    }
  }

  async captureSystemAudio() {
    try {
      // Try display capture first (desktop/Chrome)
      const constraints: any = { video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } };
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(t => t.stop());
        throw new Error("NO_AUDIO_TRACK");
      }
      stream.getVideoTracks().forEach(t => t.stop());
      const audioStream = new MediaStream(audioTracks);
      // Init worklet before connecting
      if (!this.workletNode) await this.initWorklet();
      this.connectStream(audioStream);
      return true;
    } catch (err: any) {
      // Fallback to microphone capture on mobile
      console.warn("Display capture failed, trying microphone fallback:", err.message);
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      if (!this.workletNode) await this.initWorklet();
      this.connectStream(micStream);
      return "mic";
    }
  }

  connectStream(stream: MediaStream) {
    if (this.sourceNode) this.sourceNode.disconnect();
    this.sourceNode = this.ctx.createMediaStreamSource(stream);
    this.sourceNode.connect(this.inputNode);
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  connectMediaElement(audioElement: HTMLAudioElement) {
    if (this.sourceNode) this.sourceNode.disconnect();
    if (!(audioElement as any).__sourceNode) {
      (audioElement as any).__sourceNode = this.ctx.createMediaElementSource(audioElement);
    }
    this.sourceNode = (audioElement as any).__sourceNode;
    this.sourceNode!.connect(this.inputNode);
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  setBandGain(index: number, gain: number) {
    // Sync both native and worklet for visualization/fallback, but worklet is primary
    this.eqBands[index]?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05); 
    this.workletNode?.parameters.get(`band${index}`)?.setTargetAtTime(gain, this.ctx.currentTime, 0.05);
  }

  setMasterGain(gain: number) {
    this.gainNode.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.05);
  }

  resetSync() {
    this.workletNode?.port.postMessage({ type: 'RESET_SYNC' });
  }

  getHash(): Promise<{hash: string, converged: boolean}> {
    return new Promise((resolve) => {
      if (!this.workletNode) return resolve({ hash: "NO_NODE", converged: false });
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'HASH_RESULT') {
          this.workletNode!.port.removeEventListener('message', handler);
          resolve({ hash: e.data.value, converged: e.data.converged });
        }
      };
      this.workletNode.port.addEventListener('message', handler);
      this.workletNode.port.start();
      this.workletNode.port.postMessage({ type: 'GET_HASH' });
      // Timeout fallback
      setTimeout(() => {
        this.workletNode?.port.removeEventListener('message', handler);
        resolve({ hash: "TIMEOUT", converged: false });
      }, 500);
    });
  }
}
