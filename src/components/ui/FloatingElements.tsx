"use client";

import { motion } from "framer-motion";

function FloatingRing({ size, top, left, delay, color }: { size: number; top: string; left: string; delay: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 0.15, rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear", delay }}
      className="absolute pointer-events-none"
      style={{ top, left }}
    >
      <div
        className="rounded-full border animate-pulse-neon"
        style={{
          width: size,
          height: size,
          borderColor: color,
          boxShadow: `0 0 15px ${color}33`,
        }}
      />
    </motion.div>
  );
}

function FloatingOrb({ size, top, left, delay, color }: { size: number; top: string; left: string; delay: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 0.2, y: [-10, 10, -10] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute pointer-events-none"
      style={{ top, left }}
    >
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

function EnergyLine({ top, delay }: { top: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 0.08, scaleX: 1 }}
      transition={{ duration: 2, delay }}
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        top,
        background: "linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent)",
      }}
    />
  );
}

export default function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <FloatingRing size={200} top="15%" left="-5%" delay={0} color="var(--primary)" />
      <FloatingRing size={150} top="60%" left="85%" delay={3} color="var(--secondary)" />
      <FloatingRing size={100} top="40%" left="90%" delay={6} color="var(--accent)" />

      <FloatingOrb size={300} top="10%" left="70%" delay={0} color="var(--primary)" />
      <FloatingOrb size={200} top="70%" left="20%" delay={2} color="var(--secondary)" />
      <FloatingOrb size={150} top="50%" left="50%" delay={4} color="var(--accent)" />

      <EnergyLine top="30%" delay={1} />
      <EnergyLine top="60%" delay={3} />
      <EnergyLine top="85%" delay={5} />
    </div>
  );
}
