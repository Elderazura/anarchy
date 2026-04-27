import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyContact() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 2200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="sticky-contact"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <AnimatePresence mode="wait">
            {expanded ? (
              <motion.a
                key="expanded"
                href="mailto:hello@anarchystudios.io"
                className="sticky-contact-link"
                initial={{ opacity: 0, width: 36 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 36 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="sticky-dot" />
                <span className="sticky-text">Start a project</span>
              </motion.a>
            ) : (
              <motion.div
                key="dot"
                className="sticky-dot-only"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
