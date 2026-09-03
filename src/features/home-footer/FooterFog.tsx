"use client";

import { useEffect, useRef } from "react";

import styles from "./HomeAudioFooter.module.css";

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform float uTime;
  uniform float uMotion;
  uniform vec2 uResolution;

  float hash(vec2 point) {
    if (uResolution.x < 768.0) {
      point = fract(point * vec2(0.3183099, 0.3678794));
      return fract(sin(point.x * 12.9898 + point.y * 78.233) * 43.75854);
    }
    point = fract(point * vec2(127.34, 311.7));
    point += dot(point, point + 19.19);
    return fract(point.x * point.y);
  }

  float valueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 offset = fract(point);
    vec2 curve = offset * offset * (3.0 - 2.0 * offset);
    if (uResolution.x < 768.0) cell = mod(cell, 100.0);
    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), curve.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), curve.x),
      curve.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 3; octave += 1) {
      value += amplitude * valueNoise(point);
      point = point * 2.1 + vec2(3.7, 8.3);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float y = uv.y;
    float aspect = uResolution.x / uResolution.y;
    float verticalMask = 1.0 - smoothstep(0.0, 1.0, y);
    verticalMask = pow(verticalMask, 0.22);
    verticalMask *= 1.0 - smoothstep(0.95, 1.0, y);
    if (verticalMask < 0.002) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float rise = uTime * 0.07;
    float loopLength = 32.0;
    float motionA = mod(uMotion, loopLength);
    float motionB = mod(uMotion + loopLength * 0.5, loopLength);
    float blend = abs(mod(uMotion, loopLength) / loopLength - 0.5) * 2.0;
    vec2 domain;
    vec2 warpDomain;

    if (uResolution.x < 768.0) {
      float domainY = (uResolution.y - gl_FragCoord.y) / 88.88;
      domain = vec2(gl_FragCoord.x / 133.33, domainY + rise);
      warpDomain = vec2(
        gl_FragCoord.x / 153.84,
        domainY * 0.8444 + rise * 0.6
      );
    } else {
      domain = vec2(uv.x * aspect * 3.0, (1.0 - y) * 4.5 + rise);
      warpDomain = vec2(uv.x * aspect * 2.6, (1.0 - y) * 3.8 + rise * 0.6);
    }

    vec2 warpA = vec2(
      fbm(warpDomain + vec2(0.0, motionA * 0.15)),
      fbm(warpDomain + vec2(4.3, 2.7 + motionA * 0.10))
    );
    float fogA = fbm(domain + 1.4 * warpA + vec2(0.0, motionA * 0.06));
    vec2 warpB = vec2(
      fbm(warpDomain + vec2(7.3, motionB * 0.15)),
      fbm(warpDomain + vec2(1.8, 5.4 + motionB * 0.10))
    );
    float fogB = fbm(domain + 1.4 * warpB + vec2(3.7, motionB * 0.06));
    float fog = mix(fogA, fogB, blend);

    fog = max(0.0, fog - 0.36);
    fog = smoothstep(0.0, 0.36, fog);
    fog = pow(fog, 0.85);
    float baseFog = smoothstep(0.35, 0.0, y) * 0.14
      + smoothstep(0.18, 0.0, y) * 0.11;
    float alpha = clamp((fog + baseFog) * verticalMask * 0.94, 0.0, 0.82);
    vec3 charcoal = vec3(0.02, 0.03, 0.05);
    vec3 ashGrey = vec3(0.12, 0.14, 0.18);
    vec3 lightGrey = vec3(0.28, 0.31, 0.36);
    vec3 color = mix(charcoal, ashGrey, pow(fog, 1.0));
    color = mix(color, lightGrey, pow(fog, 2.2));
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

function compileShader(
  context: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = context.createShader(type);
  if (!shader) return null;
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (context.getShaderParameter(shader, context.COMPILE_STATUS)) return shader;
  console.error("[FooterFog]", context.getShaderInfoLog(shader));
  context.deleteShader(shader);
  return null;
}

export function FooterFog() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const context = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!context) return;

    const vertex = compileShader(context, context.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(context, context.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = context.createProgram();
    if (!vertex || !fragment || !program) return;

    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      console.error("[FooterFog]", context.getProgramInfoLog(program));
      return;
    }

    const buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      context.STATIC_DRAW,
    );
    const position = context.getAttribLocation(program, "position");
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
    context.enable(context.BLEND);
    context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);
    context.clearColor(0, 0, 0, 0);
    context.useProgram(program);

    const timeUniform = context.getUniformLocation(program, "uTime");
    const motionUniform = context.getUniformLocation(program, "uMotion");
    const resolutionUniform = context.getUniformLocation(program, "uResolution");
    const startedAt = performance.now();
    let previousFrame = startedAt;
    let motion = 0;
    let noteEnergy = 0;
    let active = false;
    let frame: number | null = null;

    const handleFooterNote = (event: Event) => {
      const strength =
        event instanceof CustomEvent &&
        typeof event.detail?.strength === "number"
          ? event.detail.strength
          : 0.5;
      noteEnergy = Math.min(1, noteEnergy + strength * 0.55);
    };

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      canvas.width = width;
      canvas.height = height;
      context.viewport(0, 0, width, height);
    };

    const render = (now: number) => {
      frame = null;
      if (!active) return;
      const delta = Math.min((now - previousFrame) / 1000, 0.05);
      previousFrame = now;
      noteEnergy += (0 - noteEnergy) * (1 - Math.exp(-delta * 5.2));
      motion += (4 + noteEnergy * 11) * delta;
      context.clear(context.COLOR_BUFFER_BIT);
      context.uniform1f(timeUniform, (now - startedAt) / 1000);
      context.uniform1f(motionUniform, motion);
      context.uniform2f(resolutionUniform, canvas.width, canvas.height);
      context.drawArrays(context.TRIANGLES, 0, 6);
      frame = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    window.addEventListener("trionn:footer-note", handleFooterNote);
    resizeObserver.observe(root);
    resize();
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        previousFrame = performance.now();
        if (active && frame === null) frame = window.requestAnimationFrame(render);
        if (!active && frame !== null) {
          window.cancelAnimationFrame(frame);
          frame = null;
        }
      },
      { rootMargin: "160px 0px" },
    );
    intersectionObserver.observe(root);

    return () => {
      active = false;
      window.removeEventListener("trionn:footer-note", handleFooterNote);
      if (frame !== null) window.cancelAnimationFrame(frame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
      context.deleteShader(vertex);
      context.deleteShader(fragment);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className={styles.smokeField}>
      <canvas ref={canvasRef} className={styles.fogCanvas} />
    </div>
  );
}
