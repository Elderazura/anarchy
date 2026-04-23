import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_res;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p  = p * 2.0 + vec2(3.1, 1.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t  = u_time * 0.05;

  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_res.x / u_res.y;

  float n1 = fbm(p * 1.6 + t);
  float n2 = fbm(p * 2.2 - t * 0.7 + n1 * 0.8);
  float n3 = fbm(p * 3.4 + t * 0.35 + n2 * 0.5);

  float intensity = n3 * 0.55 + n1 * 0.3 + n2 * 0.15;

  vec3 c1 = vec3(0.012, 0.022, 0.055);
  vec3 c2 = vec3(0.028, 0.095, 0.165);
  vec3 c3 = vec3(0.055, 0.22,  0.28);
  vec3 c4 = vec3(0.008, 0.032, 0.095);

  vec3 col = mix(c1, c4, uv.y * 0.7);
  col = mix(col, c2, smoothstep(0.28, 0.58, intensity));
  col = mix(col, c3, smoothstep(0.52, 0.72, intensity) * 0.38);

  // scanlines
  float scan = sin(gl_FragCoord.y * 3.14159 * 0.9) * 0.5 + 0.5;
  col *= 0.955 + scan * 0.045;

  // vignette
  vec2 vig_uv = uv * 2.0 - 1.0;
  col *= 1.0 - dot(vig_uv, vig_uv) * 0.28;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export default function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const posLoc  = gl.getAttribLocation(prog, "a_position");
    const timeLoc = gl.getUniformLocation(prog, "u_time");
    const resLoc  = gl.getUniformLocation(prog, "u_res");

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    let rafId;
    let startTime = performance.now();

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const t = (performance.now() - startTime) / 1000;
      gl.uniform1f(timeLoc, t);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
