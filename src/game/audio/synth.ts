export const BPM = 128;
export const LOOP_SECONDS = 4 * 4 * 60 / BPM;
export type SoundName = "slash" | "fireSlash" | "heavySlash" | "heal" | "hit" | "evade" | "dodge" | "perfect" | "victory" | "gameover";

function tone(data: Float32Array, rate: number, start: number, duration: number, frequency: number, volume: number, endFrequency = frequency, noise = 0) {
  const offset = Math.floor(start * rate);
  const length = Math.floor(duration * rate);
  let phase = 0;
  for (let i = 0; i < length && offset + i < data.length; i++) {
    const progress = i / length;
    phase += 2 * Math.PI * frequency * Math.pow(endFrequency / frequency, progress) / rate;
    const envelope = Math.min(1, i / (rate * .003)) * Math.pow(1 - progress, 3);
    const wave = Math.sin(phase) * (1 - noise) + (Math.random() * 2 - 1) * noise;
    data[offset + i] += wave * envelope * volume;
  }
}

export function synthMusic(rate: number): Float32Array {
  const data = new Float32Array(Math.ceil(LOOP_SECONDS * rate));
  const step = 60 / BPM / 4;
  // Four bars in A minor: steady four-on-the-floor, offbeat bass, short repeating hook.
  const roots = [55, 55, 43.6535, 48.9994];
  const hook = [440, 0, 659.255, 0, 523.251, 0, 659.255, 587.33];
  for (let i = 0; i < 64; i++) {
    const at = i * step;
    const beat = i % 16;
    if (i % 4 === 0) tone(data, rate, at, .21, 145, .62, 42);
    if (beat === 4 || beat === 12) {
      tone(data, rate, at, .13, 180, .2, 100, .8);
      tone(data, rate, at + .012, .09, 1200, .07, 800, 1);
    }
    if (i % 2 === 0) tone(data, rate, at, i % 4 === 2 ? .09 : .035, 8000, i % 4 === 2 ? .075 : .04, 5000, .8);
    if (i % 4 === 2 || beat === 15) {
      const root = roots[Math.floor(i / 16)];
      tone(data, rate, at, .17, root, .25);
      tone(data, rate, at, .12, root * 2, .05);
    }
    const note = hook[i % 8];
    if (note) {
      tone(data, rate, at, .12, note, .065);
      // Short delay, wrapped into the loop for a seamless repeat.
      tone(data, rate, (at + step * 3) % LOOP_SECONDS, .1, note, .02);
    }
  }
  // Micro-fades prevent clicks where a sustained tail meets the loop boundary.
  const fade = Math.floor(rate * .003);
  for (let i = 0; i < fade; i++) { data[i] *= i / fade; data[data.length - 1 - i] *= i / fade; }
  return data;
}

export function synthSound(name: SoundName, rate: number): Float32Array {
  const data = new Float32Array(Math.ceil(rate * 1.2));
  switch (name) {
    case "slash": tone(data, rate, 0, .12, 1900, .4, 300, .65); break;
    case "fireSlash":
      tone(data, rate, 0, .2, 1700, .35, 140, .7);
      tone(data, rate, .035, .35, 110, .35, 45, .35); break;
    case "heavySlash":
      tone(data, rate, 0, .15, 2200, .35, 100, .75);
      tone(data, rate, .04, .6, 100, .7, 28);
      tone(data, rate, .04, .35, 500, .3, 50, .8); break;
    case "hit": tone(data, rate, 0, .28, 150, .5, 35, .5); break;
    case "evade": tone(data, rate, 0, .18, 300, .23, 1800, .5); break;
    case "dodge": tone(data, rate, 0, .16, 900, .23, 1900); break;
    case "heal":
    case "perfect":
    case "victory":
    case "gameover": {
      const notes = name === "heal" ? [523.25, 659.25, 783.99] : name === "perfect" ? [1318.51, 1760] : name === "victory" ? [440, 554.37, 659.25, 880] : [220, 196, 174.61, 110];
      notes.forEach((note, index) => tone(data, rate, index * .12, .42, note, name === "perfect" ? .16 : .22));
      break;
    }
  }
  return data;
}
