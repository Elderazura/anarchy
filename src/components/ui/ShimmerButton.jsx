import { motion } from "framer-motion";

export default function ShimmerButton({ children, onClick, className = "", style = {} }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`shimmer-btn ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={style}
    >
      <span className="shimmer-btn-content">{children}</span>
      <span className="shimmer-btn-shine" aria-hidden="true" />
    </motion.button>
  );
}
