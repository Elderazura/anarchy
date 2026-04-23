import { motion } from "framer-motion";

export default function ScrollRevealText({ text, className, stagger = 0.06, delay = 0, once = true }) {
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text} style={{ display: "inline" }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", marginRight: "0.28em", verticalAlign: "bottom" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "105%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once, margin: "-30px" }}
            transition={{
              duration: 0.72,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
