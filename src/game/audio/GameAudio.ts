import { synthMusic, synthSound, type SoundName } from "./synth";

export class GameAudio {
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private music: AudioBufferSourceNode | null = null;
  private sounds = new Map<SoundName, AudioBuffer>();
  private voices = new Set<AudioBufferSourceNode>();
  private musicEnabled = true;
  private effectsEnabled = true;
  private playing = false;

  // Called from a user gesture; no audio is created on page load.
  unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        const compressor = this.context.createDynamicsCompressor();
        compressor.connect(this.context.destination);
        this.musicGain = this.context.createGain(); this.musicGain.gain.value = .3;
        this.effectsGain = this.context.createGain(); this.effectsGain.gain.value = this.effectsEnabled ? .55 : 0;
        this.musicGain.connect(compressor); this.effectsGain.connect(compressor);
      }
      void this.context.resume().catch(() => {});
    } catch { /* Audio unavailable: combat remains playable. */ }
  }

  private buffer(samples: Float32Array): AudioBuffer {
    const context = this.context!;
    const buffer = context.createBuffer(1, samples.length, context.sampleRate);
    buffer.getChannelData(0).set(samples);
    return buffer;
  }

  start() {
    this.unlock(); this.playing = true;
    this.stopMusic();
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
    this.startMusic();
  }

  private startMusic() {
    if (!this.context || !this.musicGain || !this.musicEnabled || !this.playing || this.music) return;
    this.musicBuffer ??= this.buffer(synthMusic(this.context.sampleRate));
    this.music = this.context.createBufferSource();
    this.music.buffer = this.musicBuffer; this.music.loop = true;
    this.music.connect(this.musicGain); this.music.start();
  }

  private stopMusic() { this.music?.stop(); this.music?.disconnect(); this.music = null; }

  finish(won: boolean) {
    this.playing = false; this.stopMusic(); this.play(won ? "victory" : "gameover");
  }

  play(name: SoundName) {
    if (!this.context || !this.effectsGain || !this.effectsEnabled || this.context.state !== "running") return;
    let buffer = this.sounds.get(name);
    if (!buffer) { buffer = this.buffer(synthSound(name, this.context.sampleRate)); this.sounds.set(name, buffer); }
    if (this.voices.size >= 24) {
      const oldest = this.voices.values().next().value;
      oldest?.stop(); if (oldest) this.voices.delete(oldest);
    }
    const voice = this.context.createBufferSource(); voice.buffer = buffer; voice.connect(this.effectsGain);
    this.voices.add(voice);
    voice.onended = () => { voice.disconnect(); this.voices.delete(voice); };
    voice.start();
  }

  setMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) { this.unlock(); this.startMusic(); } else this.stopMusic();
  }
  setEffects(enabled: boolean) {
    this.effectsEnabled = enabled;
    if (enabled) this.unlock();
    if (this.effectsGain && this.context) this.effectsGain.gain.setTargetAtTime(enabled ? .55 : 0, this.context.currentTime, .015);
  }
  visibility(hidden: boolean) {
    if (!this.context) return;
    void (hidden ? this.context.suspend() : this.context.resume()).catch(() => {});
  }
  dispose() {
    this.stopMusic();
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
    void this.context?.close().catch(() => {});
    this.context = null;
  }
}
