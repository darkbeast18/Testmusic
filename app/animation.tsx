"use client";

import { motion } from "framer-motion";

export default function Home() {
  const particles = Array.from({ length: 12 });

  return (
    <div className="absolute z-10 top-0 flex h-[100svh] w-[100svw] items-center justify-center bg-gradient-to-br from-black to-black ">
      {/* Pulsing Center Logo */}
      <motion.div
        className="w-44 h-44 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-4xl font-bold text-black tracking-wide">Searching</span>
      </motion.div>

      {/* Particle Wave */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 bg-orange-400 rounded-full shadow-md"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              top: `${50 + Math.sin(i * (Math.PI / 6)) * 30}%`,
              left: `${50 + Math.cos(i * (Math.PI / 6)) * 30}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
