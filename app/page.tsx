"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [lit, setLit] = useState(false);

  return (
    <main className={`scene ${lit ? "scene--lit" : ""}`}>
      <motion.div
        className="wash"
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <div className="switch-shell">
        <motion.button
          type="button"
          className="switch"
          aria-label="Toggle light"
          aria-pressed={lit}
          onClick={() => setLit((value) => !value)}
          whileTap={{ scale: 0.985 }}
        >
          <motion.span
            className="switch-track"
            animate={{
              rotateY: lit ? -58 : 0,
              rotateX: lit ? 8 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 190,
              damping: 22,
              mass: 0.9,
            }}
          >
            <span className="switch-track-glass" />
            <motion.span
              className="switch-halo"
              animate={{ opacity: lit ? 1 : 0 }}
              transition={{ duration: 0.45 }}
            />
            <motion.span
              className="switch-knob"
              animate={{
                x: lit ? 42 : 0,
                rotateZ: lit ? 8 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
                mass: 0.8,
              }}
            >
              <span className="switch-knob-highlight" />
            </motion.span>
          </motion.span>
        </motion.button>
      </div>

      <motion.div
        className="fade-flash"
        key={lit ? "on" : "off"}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />
    </main>
  );
}
