"use client";

import { motion } from "framer-motion";

export default function Reveal({ children, delay = 0, y = 20, direction = "up" }) {
  const getInitialY = () => {
    if (direction === "up") return y;
    if (direction === "down") return -y;
    return 0;
  };

  const getInitialX = () => {
    if (direction === "left") return y;
    if (direction === "right") return -y;
    return 0;
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: getInitialY(),
        x: getInitialX()
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        x: 0
      }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ 
        duration: 0.6, 
        delay, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
}
