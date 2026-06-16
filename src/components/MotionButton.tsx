import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

export interface MotionButtonProps extends HTMLMotionProps<"button"> {
  // Standard Framer Motion button props, with our sensible defaults
}

export const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  whileHover = { scale: 1.02 },
  whileTap = { scale: 0.95 },
  transition = { type: "spring", stiffness: 400, damping: 17 },
  ...props
}) => {
  return (
    <motion.button
      whileHover={whileHover}
      whileTap={whileTap}
      transition={transition}
      {...props}
    >
      {children}
    </motion.button>
  );
};
