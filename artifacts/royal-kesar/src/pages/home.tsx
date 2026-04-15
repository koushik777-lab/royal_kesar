import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { ArrowRight, Star } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   PARTICLE CANVAS — gold dust that reacts to mouse
──────────────────────────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const COLORS = ["#D4AF37", "#C1440E", "#E8CC6A", "#A0832A", "#F5E09A"];

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      radius: number; color: string; alpha: number;
      baseX: number; baseY: number; density: number;
    }

    const particles: Particle[] = Array.from({ length: 120 }, () => {
      const x = Math.random() * W;
      const y = Math.random() * H;
      return {
        x, y,
        baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        radius: Math.random() * 2 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.6 + 0.1,
        density: Math.random() * 30 + 10,
      };
    });

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (120 - dist) / 120;

        if (dist < 120) {
          p.x -= (dx / dist) * force * 2.5;
          p.y -= (dy / dist) * force * 2.5;
        } else {
          p.x += (p.baseX - p.x) * 0.04 + p.vx;
          p.y += (p.baseY - p.y) * 0.04 + p.vy;
        }

        // drift slowly upward and wrap
        p.baseY -= 0.08;
        if (p.baseY < -10) { p.baseY = H + 10; p.baseX = Math.random() * W; }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />;
}

/* ─────────────────────────────────────────────────────────────────────────
   LIGHT RAYS SVG — animated slow sweeping golden rays
──────────────────────────────────────────────────────────────────────────── */
function LightRays() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[0]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#C1440E" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#0F0F0F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ray1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ray2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C1440E" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#C1440E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#centerGlow)" />
      <motion.polygon
        points="720,0 200,900 1240,900"
        fill="url(#ray1)"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.polygon
        points="720,0 100,900 700,900"
        fill="url(#ray2)"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.polygon
        points="720,0 900,900 1440,600"
        fill="url(#ray1)"
        animate={{ opacity: [0.1, 0.5, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   KASHMIRI FLORAL ORNAMENT SVG
──────────────────────────────────────────────────────────────────────────── */
function KashmiriFloral({ className }: { className?: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      animate={{ rotate: 360, opacity: [0.12, 0.22, 0.12] }}
      transition={{ rotate: { duration: 60, repeat: Infinity, ease: "linear" }, opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
    >
      {/* Outer petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.path
          key={i}
          d={`M100,100 C${100 + 30 * Math.cos((angle - 20) * Math.PI / 180)},${100 + 30 * Math.sin((angle - 20) * Math.PI / 180)} ${100 + 80 * Math.cos(angle * Math.PI / 180)},${100 + 80 * Math.sin(angle * Math.PI / 180)} ${100 + 30 * Math.cos((angle + 20) * Math.PI / 180)},${100 + 30 * Math.sin((angle + 20) * Math.PI / 180)} Z`}
          stroke="#D4AF37"
          strokeWidth="0.8"
          fill="#D4AF37"
          fillOpacity="0.08"
          animate={{ strokeOpacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Inner circle */}
      <circle cx="100" cy="100" r="18" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
      <circle cx="100" cy="100" r="8" stroke="#C1440E" strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
      {/* Small dots on petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <circle
          key={`dot-${i}`}
          cx={100 + 70 * Math.cos(angle * Math.PI / 180)}
          cy={100 + 70 * Math.sin(angle * Math.PI / 180)}
          r="2.5"
          fill="#D4AF37"
          fillOpacity="0.5"
        />
      ))}
      {/* Connecting ornamental ring */}
      <circle cx="100" cy="100" r="70" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.25" strokeDasharray="4 8" fill="none" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   GLASS SPHERE with saffron strand inside
──────────────────────────────────────────────────────────────────────────── */
function GlassSphere({ className }: { className?: string }) {
  return (
    // <motion.div
    //   className={`relative ${className}`}
    //   animate={{ rotate: 360 }}
    //   transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
    // >
    //   <svg viewBox="0 0 200 200" fill="none" className="w-full h-full drop-shadow-2xl">
    //     <defs>
    //       <radialGradient id="sphereGlass" cx="35%" cy="30%" r="70%">
    //         <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
    //         <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.08" />
    //         <stop offset="80%" stopColor="#C1440E" stopOpacity="0.05" />
    //         <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
    //       </radialGradient>
    //       <radialGradient id="sphereInner" cx="50%" cy="50%" r="50%">
    //         <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
    //         <stop offset="100%" stopColor="transparent" />
    //       </radialGradient>
    //       <filter id="sphereBlur">
    //         <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
    //       </filter>
    //     </defs>
    //     {/* Outer sphere */}
    //     <circle cx="100" cy="100" r="88" fill="url(#sphereGlass)" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.4" />
    //     {/* Inner glow */}
    //     <circle cx="100" cy="100" r="60" fill="url(#sphereInner)" />
    //     {/* Saffron strand 1 */}
    //     <motion.path
    //       d="M70,80 Q100,100 130,85 Q150,75 160,100 Q150,125 130,115 Q100,100 70,120"
    //       stroke="#C1440E"
    //       strokeWidth="1.5"
    //       strokeLinecap="round"
    //       fill="none"
    //       animate={{ pathLength: [0.6, 1, 0.6], opacity: [0.5, 0.9, 0.5] }}
    //       transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    //     />
    //     {/* Saffron strand 2 */}
    //     <motion.path
    //       d="M80,120 Q110,95 120,110 Q135,130 110,135 Q85,140 80,120"
    //       stroke="#D4AF37"
    //       strokeWidth="1"
    //       strokeLinecap="round"
    //       fill="none"
    //       animate={{ pathLength: [0.4, 1, 0.4], opacity: [0.4, 0.7, 0.4] }}
    //       transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    //     />
    //     {/* Highlight */}
    //     <ellipse cx="75" cy="72" rx="18" ry="12" fill="white" fillOpacity="0.1" transform="rotate(-30 75 72)" />
    //   </svg>
    // </motion.div>
    <motion.div
      className={`relative ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
    > <img src="/images/kesar.png" alt="" />  </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ANIMATED SAFFRON STRANDS with depth/parallax
──────────────────────────────────────────────────────────────────────────── */
function SaffronStrand({ style, delay }: { style: React.CSSProperties; delay: number }) {
  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={style}
      viewBox="0 0 40 120"
      fill="none"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        y: [0, -60, -120],
        rotateZ: [-8, 8, -8],
        rotateX: [0, 20, 0],
      }}
      transition={{
        duration: 12 + delay * 2,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      <path d="M20 110 Q15 80 20 60 Q25 40 18 20 Q22 10 20 5" stroke="#C1440E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 90 Q28 75 25 60" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <circle cx="20" cy="5" r="3" fill="#C1440E" />
      <circle cx="18" cy="20" r="2" fill="#D4AF37" opacity="0.7" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LETTER-BY-LETTER TEXT REVEAL
──────────────────────────────────────────────────────────────────────────── */
function AnimatedText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap mr-[0.25em] last:mr-0">
          {word.split("").map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                delay: delay + (wi * 6 + ci) * 0.025,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN HOME PAGE
──────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();

  /* Mouse-based parallax */
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const springX = useSpring(rawMouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(rawMouseY, { stiffness: 50, damping: 20 });

  const layer1X = useTransform(springX, [-1, 1], [-18, 18]);
  const layer1Y = useTransform(springY, [-1, 1], [-12, 12]);
  const layer2X = useTransform(springX, [-1, 1], [-30, 30]);
  const layer2Y = useTransform(springY, [-1, 1], [-20, 20]);
  const layer3X = useTransform(springX, [-1, 1], [12, -12]);
  const layer3Y = useTransform(springY, [-1, 1], [8, -8]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    rawMouseX.set(((clientX - left) / width) * 2 - 1);
    rawMouseY.set(((clientY - top) / height) * 2 - 1);
  }, [rawMouseX, rawMouseY]);

  /* Strand positions */
  const strands = [
    { style: { left: "8%", bottom: "10%", width: 30, zIndex: 2 } as React.CSSProperties, delay: 0 },
    { style: { left: "20%", bottom: "5%", width: 22, zIndex: 2 } as React.CSSProperties, delay: 2 },
    { style: { left: "35%", bottom: "0%", width: 26, zIndex: 3 } as React.CSSProperties, delay: 4 },
    { style: { right: "30%", bottom: "5%", width: 20, zIndex: 2 } as React.CSSProperties, delay: 1.5 },
    { style: { right: "18%", bottom: "8%", width: 28, zIndex: 2 } as React.CSSProperties, delay: 3 },
    { style: { right: "6%", bottom: "2%", width: 24, zIndex: 2 } as React.CSSProperties, delay: 5 },
    { style: { left: "50%", bottom: "12%", width: 18, zIndex: 2 } as React.CSSProperties, delay: 2.5 },
    { style: { left: "62%", bottom: "3%", width: 32, zIndex: 3 } as React.CSSProperties, delay: 6 },
  ];

  return (
    <Layout>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center select-none"
        onMouseMove={handleMouseMove}
      >
        {/* ── Dark base ── */}
        <div className="absolute inset-0 bg-[#0F0F0F] z-0" />

        {/* ── Light rays ── */}
        <LightRays />

        {/* ── Gold particle canvas ── */}
        <ParticleCanvas />

        {/* ── Kashmiri floral ornaments (parallax layer 3) ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{ x: layer3X, y: layer3Y }}
        >
          <KashmiriFloral className="absolute top-[5%] left-[3%] w-[200px] opacity-20" />
          <KashmiriFloral className="absolute bottom-[5%] right-[3%] w-[160px] opacity-15" />
          <KashmiriFloral className="absolute top-[40%] right-[6%] w-[120px] opacity-12" />
        </motion.div>

        {/* ── Saffron strands (parallax layer 2) ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{ x: layer2X, y: layer2Y }}
        >
          {strands.map((s, i) => (
            <SaffronStrand key={i} style={s.style} delay={s.delay} />
          ))}
        </motion.div>

        {/* ── Glass sphere (parallax layer 1) ── */}
        <motion.div
          className="absolute pointer-events-none z-[3]"
          style={{ x: layer1X, y: layer1Y, right: "6%", top: "12%", width: "min(280px, 22vw)" }}
        >
          <GlassSphere />
        </motion.div>

        {/* ── Vignette edges for cinematic framing ── */}
        <div className="absolute inset-0 pointer-events-none z-[4]"
          style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
        />

        {/* ── Soft bottom fade ── */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[4]"
          style={{ background: "linear-gradient(to bottom, transparent, #0F0F0F)" }}
        />

        {/* ── Gold ambient glow behind content ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none z-[4]"
          style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)", filter: "blur(40px)" }}
        />

        {/* ── Main content (parallax layer 1) ── */}
        <motion.div
          className="relative z-[5] flex flex-col items-center text-center px-4 max-w-5xl mx-auto"
          style={{ x: layer1X, y: layer1Y }}
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-3 px-5 py-2 border border-[#D4AF37]/30 rounded-full text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]"
              style={{ background: "rgba(212,175,55,0.06)", backdropFilter: "blur(12px)" }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C1440E] animate-pulse" />
              Pampore, Kashmir &bull; Hand-Harvested
            </span>
          </motion.div>

          {/* Headline — letter by letter */}
          <h1 className="font-serif font-medium leading-[1.05] mb-6" style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}>
            <span className="block" style={{ color: "#D4AF37", textShadow: "0 0 80px rgba(212,175,55,0.35)" }}>
              <AnimatedText text="Kashmir's" delay={0.1} />
            </span>
            <span className="block text-white/90">
              <AnimatedText text="Rarest Gold" delay={0.5} />
            </span>
          </h1>

          {/* Ornamental divider */}
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-[#D4AF37] opacity-70">
              <path d="M10 2 L11.5 8 L18 10 L11.5 12 L10 18 L8.5 12 L2 10 L8.5 8 Z" fill="currentColor" />
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </motion.div>

          {/* Glassmorphism content card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mb-10 px-8 py-6 max-w-2xl"
            style={{
              background: "rgba(15,15,15,0.5)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: "2px",
              boxShadow: "inset 0 1px 0 rgba(212,175,55,0.1), 0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <p className="text-white/65 text-base md:text-lg leading-relaxed font-light tracking-wide">
              Hand-harvested saffron, royal dry fruits, and timeless Pashmina —
              <span className="text-[#D4AF37]/80"> crafted for those who value purity and luxury.</span>
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.7 }}
          >
            {/* Gold solid CTA */}
            <Link href="/products?category=saffron">
              <motion.button
                className="relative px-10 h-14 text-[11px] uppercase tracking-[0.22em] font-medium overflow-hidden group"
                style={{ background: "#D4AF37", color: "#0F0F0F" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="relative z-10">Explore Saffron</span>
                {/* Glow sweep on hover */}
                <motion.span
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)", backgroundSize: "200% 100%", backgroundPosition: "-100% 0" }}
                  whileHover={{ backgroundPosition: "200% 0" }}
                  transition={{ duration: 0.6 }}
                />
                {/* Bottom glow */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.7) 0%, transparent 70%)", filter: "blur(4px)" }}
                />
              </motion.button>
            </Link>

            {/* Ghost CTA with gold border */}
            <Link href="/products">
              <motion.button
                className="relative px-10 h-14 text-[11px] uppercase tracking-[0.22em] font-medium group overflow-hidden"
                style={{ background: "transparent", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.5)" }}
                whileHover={{ scale: 1.03, borderColor: "rgba(212,175,55,0.9)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Fill sweep on hover */}
                <motion.span
                  className="absolute inset-0"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  style={{ originX: 0, background: "rgba(212,175,55,0.1)" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-2.5">
                  Discover Collection
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
                {/* Bottom glow */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.4) 0%, transparent 70%)", filter: "blur(4px)" }}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Subtle scroll hint */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#D4AF37]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
          >
            <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
            <motion.div
              className="w-px h-8 bg-gradient-to-b from-[#D4AF37]/40 to-transparent"
              animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">The Royal Treasury</h2>
            <div className="w-16 h-px bg-primary/50 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Premium Saffron", image: "/images/saffron-closeup.png", link: "/products?categoryId=1" },
              { title: "Kashmiri Dry Fruits", image: "/images/walnuts.png", link: "/products?categoryId=2" },
              { title: "Pashmina Shawls", image: "/images/pashmina.png", link: "/products?categoryId=3" }
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
              >
                <Link href={cat.link} className="group relative h-[400px] overflow-hidden rounded-sm border border-primary/10 block">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="font-serif text-2xl text-white mb-2">{cat.title}</h3>
                    <span className="text-primary text-sm uppercase tracking-widest flex items-center gap-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      Discover <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ──────────────────────────────────────────── */}
      <section className="py-24 border-t border-primary/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Curated Collection</h2>
              <p className="text-muted-foreground max-w-xl">Exceptional quality sourced directly from the growers and artisans of Kashmir.</p>
            </div>
            <Link href="/products" className="text-primary hover:text-primary-foreground hover:bg-primary border border-primary px-6 py-2 transition-all text-sm uppercase tracking-widest">
              View All
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted h-[300px] w-full mb-4 rounded-sm" />
                  <div className="h-4 bg-muted w-3/4 mb-2" />
                  <div className="h-4 bg-muted w-1/4" />
                </div>
              ))
            ) : Array.isArray(featuredProducts) ? (
              featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/products/${product.id}`} className="group block">
                    <div className="relative h-[350px] overflow-hidden bg-card border border-primary/10 mb-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/20 font-serif text-2xl">RKC</div>
                      )}
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-primary/20 px-3 py-1 text-xs text-primary uppercase tracking-wider">
                        {product.weight || "Premium"}
                      </div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(212,175,55,0.08))" }} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors mb-1 truncate">{product.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{product.categoryName}</p>
                      <p className="text-primary font-serif tracking-wide">₹{product.price.toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* ─── HERITAGE TEASER ────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-card border-y border-primary/20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600"
            alt="Kashmir landscape"
            className="w-full h-full object-cover opacity-15"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex justify-center">
          <motion.div
            className="glass-panel p-8 md:p-16 max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-gradient-gold mb-6">A Century of Purity</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-sm md:text-base">
              "For us, saffron is not just a crop — it is a way of life. Every strand is nurtured with dedication in the unique karewa soil of Pampore. Our heritage is woven into every product we offer."
            </p>
            <p className="font-serif italic text-primary mb-8">— Sirajuddin Bhat, Founder</p>
            <Link href="/about">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none uppercase tracking-widest text-xs px-8">
                Read Our Story
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-3xl text-primary mb-4">Words of Appreciation</h2>
            <div className="w-16 h-px bg-primary/50 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "The most fragrant saffron I have ever used. A single strand transforms my culinary creations.", author: "Chef Aisha R.", location: "New Delhi" },
              { text: "Their Pashmina shawls are exquisite. You can feel the generations of craftsmanship in the weave.", author: "Sarah M.", location: "Mumbai" },
              { text: "The walnuts are incredibly fresh and rich. True Kashmiri quality that is hard to find elsewhere.", author: "Vikram S.", location: "Bangalore" }
            ].map((test, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="bg-card border border-primary/10 p-8 rounded-sm relative"
              >
                <div className="absolute top-4 right-4 flex gap-1 text-primary">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <p className="text-muted-foreground italic mb-6 mt-4 line-clamp-4">"{test.text}"</p>
                <div>
                  <p className="font-serif text-foreground">{test.author}</p>
                  <p className="text-xs text-primary/70 uppercase tracking-widest mt-1">{test.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
