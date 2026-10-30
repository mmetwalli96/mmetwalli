import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { viridis, LIGHT_RANGE } from '@/lib/viridis';
import styles from '@/components/hero/ParticleName.module.css';

const FAMILY = '"Archivo Variable", "Archivo", "Helvetica Neue", Arial, sans-serif';
const WEIGHT = 800;
const BUCKETS = 32;
const TAU = Math.PI * 2;

type Layout = {
  w: number;
  h: number;
  fontSize: number;
  radius: number;
  count: number;
  tx: Float32Array;
  ty: Float32Array;
  order: Int32Array;
  bucketStart: Int32Array;
  colors: string[];
};

type TweenOptions = {
  base: number;
  sweep: number;
  jitter: number;
  duration: number;
  durationJitter: number;
  curve: number;
  ease: (t: number) => number;
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

function setFont(ctx: CanvasRenderingContext2D, size: number) {
  ctx.font = `${WEIGHT} ${size}px ${FAMILY}`;
  if ('fontStretch' in ctx) ctx.fontStretch = 'expanded';
}

function computeLayout(width: number, lines: readonly string[]): Layout {
  const measure = document.createElement('canvas').getContext('2d')!;
  setFont(measure, 100);
  const inkWidth = (text: string) => {
    const m = measure.measureText(text);
    return m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  };
  const widest = Math.max(...lines.map(inkWidth));
  const fontSize = Math.min(232, (width / widest) * 100 * 0.995);

  setFont(measure, fontSize);
  const metrics = lines.map((line) => measure.measureText(line));
  const lineGap = fontSize * 0.13;
  const pad = Math.max(10, fontSize * 0.08);

  let h = pad;
  const baselines: number[] = [];
  metrics.forEach((m, i) => {
    h += m.actualBoundingBoxAscent;
    baselines.push(h);
    h += m.actualBoundingBoxDescent + (i < metrics.length - 1 ? lineGap : 0);
  });
  h = Math.ceil(h + pad);
  const w = Math.floor(width);

  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d', { willReadFrequently: true })!;
  setFont(octx, fontSize);
  octx.fillStyle = '#000';
  octx.textBaseline = 'alphabetic';
  lines.forEach((line, i) => octx.fillText(line, metrics[i].actualBoundingBoxLeft, baselines[i]));

  const data = octx.getImageData(0, 0, w, h).data;
  const gap = Math.max(2.6, fontSize / 37);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = gap / 2; y < h; y += gap) {
    const yi = Math.round(y);
    if (yi >= h) break;
    for (let x = gap / 2; x < w; x += gap) {
      const xi = Math.round(x);
      if (xi >= w) break;
      if (data[(yi * w + xi) * 4 + 3] > 128) {
        xs.push(x);
        ys.push(y);
      }
    }
  }

  const count = xs.length;
  const tx = Float32Array.from(xs);
  const ty = Float32Array.from(ys);

  const bucketOf = new Int32Array(count);
  const bucketCount = new Int32Array(BUCKETS);
  for (let i = 0; i < count; i++) {
    const t = clamp01((tx[i] / w) * 0.86 + (ty[i] / h) * 0.14);
    const b = Math.min(BUCKETS - 1, Math.floor(t * BUCKETS));
    bucketOf[i] = b;
    bucketCount[b]++;
  }
  const bucketStart = new Int32Array(BUCKETS + 1);
  for (let b = 0; b < BUCKETS; b++) bucketStart[b + 1] = bucketStart[b] + bucketCount[b];
  const cursor = bucketStart.slice(0, BUCKETS);
  const order = new Int32Array(count);
  for (let i = 0; i < count; i++) order[cursor[bucketOf[i]]++] = i;

  const colors = Array.from({ length: BUCKETS }, (_, b) => {
    const t = LIGHT_RANGE[0] + ((b + 0.5) / BUCKETS) * (LIGHT_RANGE[1] - LIGHT_RANGE[0]);
    const [r, g, bl] = viridis(t);
    return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(bl)})`;
  });

  return { w, h, fontSize, radius: gap * 0.36, count, tx, ty, order, bucketStart, colors };
}

export function ParticleName({ lines }: { lines: readonly string[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() ?? false;
  const key = lines.join('\n');

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const text = key.split('\n');
    const trendColor = getComputedStyle(document.documentElement).getPropertyValue('--teal-ink').trim() || '#136f6b';

    let disposed = false;
    let raf = 0;
    let layout: Layout | null = null;
    let dpr = 1;
    let lastWidth = 0;
    let introPlayed = false;

    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let fromX = new Float32Array(0);
    let fromY = new Float32Array(0);
    let toX = new Float32Array(0);
    let toY = new Float32Array(0);
    let nx = new Float32Array(0);
    let ny = new Float32Array(0);
    let bend = new Float32Array(0);
    let delay = new Float32Array(0);
    let duration = new Float32Array(0);
    let scatterX = new Float32Array(0);
    let scatterY = new Float32Array(0);

    let mode: 'still' | 'tween' | 'physics' = 'still';
    let tweenStart = 0;
    let tweenEnd = 0;
    let tweenEase = easeInOutCubic;
    let tweenDone: (() => void) | null = null;

    let appearStart = 0;
    let appear = 1;
    let line = { from: 0, to: 0, start: 0, duration: 1 };
    let lineAlpha = { from: 0, to: 0, start: 0, duration: 1 };
    const trend = { slope: 0, cx: 0, cy: 0 };

    const pointer = { x: -1e4, y: -1e4, active: false };

    const allocate = (n: number) => {
      x = new Float32Array(n);
      y = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      fromX = new Float32Array(n);
      fromY = new Float32Array(n);
      toX = new Float32Array(n);
      toY = new Float32Array(n);
      nx = new Float32Array(n);
      ny = new Float32Array(n);
      bend = new Float32Array(n);
      delay = new Float32Array(n);
      duration = new Float32Array(n);
      scatterX = new Float32Array(n);
      scatterY = new Float32Array(n);
    };

    
    const makeScatter = () => {
      if (!layout) return;
      const { w, h, radius, count } = layout;
      trend.cx = w * 0.5;
      trend.cy = h * 0.52;
      trend.slope = -(h / w) * 0.62;
      for (let i = 0; i < count; i++) {
        let sx = 0;
        let sy = 0;
        for (let attempt = 0; attempt < 12; attempt++) {
          sx = trend.cx + gaussian() * w * 0.2;
          sy = trend.cy + (sx - trend.cx) * trend.slope + gaussian() * h * 0.15;
          if (sx > radius && sx < w - radius && sy > radius && sy < h - radius) break;
        }
        scatterX[i] = Math.min(w - radius, Math.max(radius, sx));
        scatterY[i] = Math.min(h - radius, Math.max(radius, sy));
      }
    };

    const startTween = (destX: Float32Array, destY: Float32Array, o: TweenOptions, done?: () => void) => {
      if (!layout) return;
      const { w, count } = layout;
      let end = 0;
      for (let i = 0; i < count; i++) {
        fromX[i] = x[i];
        fromY[i] = y[i];
        toX[i] = destX[i];
        toY[i] = destY[i];
        const dx = toX[i] - fromX[i];
        const dy = toY[i] - fromY[i];
        const len = Math.hypot(dx, dy) || 1;
        nx[i] = -dy / len;
        ny[i] = dx / len;
        bend[i] = (Math.random() - 0.5) * 2 * o.curve;
        delay[i] = o.base + (toX[i] / w) * o.sweep + Math.random() * o.jitter;
        duration[i] = o.duration + Math.random() * o.durationJitter;
        end = Math.max(end, delay[i] + duration[i]);
      }
      tweenStart = performance.now();
      tweenEnd = end;
      tweenEase = o.ease;
      tweenDone = done ?? null;
      mode = 'tween';
      kick();
    };

    const fitToName = (base: number) => {
      if (!layout) return;
      lineAlpha = { from: 1, to: 0, start: performance.now() + (base + 0.35) * 1000, duration: 0.45 };
      startTween(
        layout.tx,
        layout.ty,
        {
          base,
          sweep: 0.5,
          jitter: 0.22,
          duration: 0.78,
          durationJitter: 0.32,
          curve: layout.h * 0.28,
          ease: easeInOutCubic,
        },
        () => {
          mode = pointer.active ? 'physics' : 'still';
        },
      );
    };

    const playIntro = () => {
      if (!layout) return;
      makeScatter();
      x.set(scatterX);
      y.set(scatterY);
      const now = performance.now();
      appearStart = now;
      appear = 0;
      line = { from: 0, to: 1, start: now + 180, duration: 0.5 };
      lineAlpha = { from: 1, to: 1, start: now, duration: 0.01 };
      introPlayed = true;
      fitToName(0.5);
    };

    const refit = () => {
      if (!layout || reduced || mode === 'tween') return;
      makeScatter();
      const now = performance.now();
      line = { from: 0, to: 1, start: now + 150, duration: 0.4 };
      lineAlpha = { from: 0, to: 1, start: now, duration: 0.25 };
      startTween(
        scatterX,
        scatterY,
        { base: 0, sweep: 0, jitter: 0.12, duration: 0.45, durationJitter: 0.2, curve: layout.h * 0.12, ease: easeOutCubic },
        () => fitToName(0.12),
      );
    };

    const interpolate = (state: { from: number; to: number; start: number; duration: number }, now: number) => {
      const t = clamp01((now - state.start) / (state.duration * 1000));
      return state.from + (state.to - state.from) * easeInOutCubic(t);
    };

    const draw = (now: number) => {
      if (!layout) return;
      const { w, h, radius, order, bucketStart, colors } = layout;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Fitted trend line through the cloud
      const progress = interpolate(line, now);
      const alpha = interpolate(lineAlpha, now);
      if (progress > 0 && alpha > 0.01) {
        const x0 = w * 0.03;
        const x1 = w * 0.97;
        const yAt = (px: number) => trend.cy + (px - trend.cx) * trend.slope;
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = trendColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([7, 6]);
        ctx.beginPath();
        ctx.moveTo(x0, yAt(x0));
        const xe = x0 + (x1 - x0) * progress;
        ctx.lineTo(xe, yAt(xe));
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = appear;
      for (let b = 0; b < BUCKETS; b++) {
        const start = bucketStart[b];
        const end = bucketStart[b + 1];
        if (start === end) continue;
        ctx.fillStyle = colors[b];
        ctx.beginPath();
        for (let k = start; k < end; k++) {
          const i = order[k];
          ctx.moveTo(x[i] + radius, y[i]);
          ctx.arc(x[i], y[i], radius, 0, TAU);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const stepPhysics = () => {
      if (!layout) return 0;
      const { tx, ty, count, fontSize } = layout;
      const reach = fontSize * 0.62;
      const reach2 = reach * reach;
      const push = 2.6;
      const k = 0.075;
      const damping = 0.82;
      let energy = 0;
      for (let i = 0; i < count; i++) {
        let ax = (tx[i] - x[i]) * k;
        let ay = (ty[i] - y[i]) * k;
        if (pointer.active) {
          const dx = x[i] - pointer.x;
          const dy = y[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach2 && d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const f = 1 - d / reach;
            ax += (dx / d) * f * f * push;
            ay += (dy / d) * f * f * push;
          }
        }
        vx[i] = (vx[i] + ax) * damping;
        vy[i] = (vy[i] + ay) * damping;
        x[i] += vx[i];
        y[i] += vy[i];
        energy += Math.abs(vx[i]) + Math.abs(vy[i]) + Math.abs(tx[i] - x[i]) + Math.abs(ty[i] - y[i]);
      }
      return energy / Math.max(1, count);
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed || !layout) return;
      let again = false;

      if (appear < 1) {
        appear = clamp01((now - appearStart) / 380);
        again = true;
      }

      if (mode === 'tween') {
        const elapsed = (now - tweenStart) / 1000;
        for (let i = 0; i < layout.count; i++) {
          const t = clamp01((elapsed - delay[i]) / duration[i]);
          const e = tweenEase(t);
          const arc = Math.sin(Math.PI * e) * bend[i];
          x[i] = fromX[i] + (toX[i] - fromX[i]) * e + nx[i] * arc;
          y[i] = fromY[i] + (toY[i] - fromY[i]) * e + ny[i] * arc;
        }
        if (elapsed >= tweenEnd) {
          x.set(toX);
          y.set(toY);
          vx.fill(0);
          vy.fill(0);
          mode = 'still';
          const done = tweenDone;
          tweenDone = null;
          done?.();
        }
        again = again || mode !== 'still';
      } else if (mode === 'physics') {
        const energy = stepPhysics();
        if (energy < 0.02 && !pointer.active) {
          x.set(layout.tx);
          y.set(layout.ty);
          mode = 'still';
        } else {
          again = true;
        }
      }

      if (now < line.start + line.duration * 1000 || now < lineAlpha.start + lineAlpha.duration * 1000) again = true;

      draw(now);
      if (again) kick();
    };

    function kick() {
      if (!raf && !disposed) raf = requestAnimationFrame(frame);
    }

    const build = (animate: boolean) => {
      const width = wrap.clientWidth;
      if (!width) return;
      lastWidth = width;
      layout = computeLayout(width, text);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(layout.w * dpr);
      canvas.height = Math.round(layout.h * dpr);
      canvas.style.width = `${layout.w}px`;
      canvas.style.height = `${layout.h}px`;
      wrap.style.height = `${layout.h}px`;
      wrap.style.aspectRatio = 'auto';
      allocate(layout.count);
      mode = 'still';
      tweenDone = null;

      if (animate && !reduced) {
        playIntro();
      } else {
        x.set(layout.tx);
        y.set(layout.ty);
        appear = 1;
        line = { from: 0, to: 0, start: 0, duration: 0.01 };
        lineAlpha = { from: 0, to: 0, start: 0, duration: 0.01 };
        draw(performance.now());
      }
    };

    const fontsReady = document.fonts?.load
      ? Promise.race([
          document.fonts.load(`${WEIGHT} 100px "Archivo Variable"`, text.join('')),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ])
      : Promise.resolve();
    fontsReady.catch(() => undefined).then(() => {
      if (!disposed) build(true);
    });

    let resizeTimer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (disposed || !layout || Math.abs(wrap.clientWidth - lastWidth) < 1) return;
        build(!introPlayed);
      }, 120);
    });
    observer.observe(wrap);

    const localPoint = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
    };
    const onMove = (event: PointerEvent) => {
      if (reduced) return;
      localPoint(event);
      pointer.active = true;
      if (mode === 'still') {
        vx.fill(0);
        vy.fill(0);
        mode = 'physics';
      }
      if (mode === 'physics') kick();
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -1e4;
      pointer.y = -1e4;
      kick();
    };
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      refit();
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointercancel', onLeave);
    canvas.addEventListener('pointerdown', onDown);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointercancel', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [key, reduced]);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
