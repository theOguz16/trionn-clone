import { mkdirSync, writeFileSync } from "node:fs";

const sampleRate = 48_000;
const duration = 24;
const channels = 2;
const frames = sampleRate * duration;
const bytesPerSample = 2;
const dataBytes = frames * channels * bytesPerSample;
const buffer = Buffer.alloc(44 + dataBytes);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
buffer.writeUInt16LE(channels * bytesPerSample, 32);
buffer.writeUInt16LE(bytesPerSample * 8, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataBytes, 40);

const tau = Math.PI * 2;

function softClip(value) {
  return Math.tanh(value * 1.18) * 0.82;
}

for (let frame = 0; frame < frames; frame += 1) {
  const time = frame / sampleRate;
  const slowBreath = 0.72 + 0.28 * Math.sin(tau * 0.0625 * time - Math.PI / 2);
  const pulse = Math.pow(0.5 + 0.5 * Math.sin(tau * 0.5 * time - 0.8), 7);
  const shimmerEnvelope = 0.5 + 0.5 * Math.sin(tau * 0.125 * time);

  for (let channel = 0; channel < channels; channel += 1) {
    const side = channel === 0 ? -1 : 1;
    const phase = side * 0.16;
    const sub = Math.sin(tau * 55 * time + phase) * 0.13;
    const fundamental = Math.sin(tau * 82.5 * time + side * 0.25) * 0.095;
    const pad =
      Math.sin(tau * 110 * time + 0.32 * Math.sin(tau * 0.125 * time) + phase) * 0.054 +
      Math.sin(tau * 165 * time + side * 0.48) * 0.035 +
      Math.sin(tau * 220 * time + side * 0.7) * 0.021;
    const shimmer =
      Math.sin(tau * 880 * time + side * 0.9) * 0.007 +
      Math.sin(tau * 1320 * time - side * 0.52) * 0.004;
    const heartbeat =
      Math.sin(tau * 68.5 * time) * pulse * 0.052 +
      Math.sin(tau * 274 * time) * pulse * 0.009;
    const sample = softClip(
      (sub + fundamental + pad) * slowBreath +
      shimmer * shimmerEnvelope +
      heartbeat,
    );
    const offset = 44 + (frame * channels + channel) * bytesPerSample;
    buffer.writeInt16LE(Math.round(sample * 32767), offset);
  }
}

mkdirSync("public/audio", { recursive: true });
writeFileSync("/tmp/footer-experience.wav", buffer);
