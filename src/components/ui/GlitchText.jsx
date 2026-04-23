import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!@#$%^&*<>?/\\|░▒▓█▄▀■~`±§";

export default function GlitchText({ children, as: Tag = "span", className, style }) {
  const [display, setDisplay] = useState(children);
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const text = typeof children === "string" ? children : "";

    const glitch = () => {
      setActive(true);
      setDisplay(
        text
          .split("")
          .map((c) =>
            c !== " " && Math.random() < 0.32
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : c,
          )
          .join(""),
      );
      timerRef.current = window.setTimeout(() => {
        setActive(false);
        setDisplay(text);
        timerRef.current = window.setTimeout(glitch, 3500 + Math.random() * 6000);
      }, 90 + Math.random() * 80);
    };

    timerRef.current = window.setTimeout(glitch, 1500 + Math.random() * 2500);
    return () => window.clearTimeout(timerRef.current);
  }, [children]);

  return (
    <Tag
      className={className}
      style={{
        ...style,
        fontVariantNumeric: "tabular-nums",
        ...(active ? { color: "#7ee8c0", textShadow: "0 0 8px rgba(126,232,192,0.6)" } : {}),
      }}
    >
      {display}
    </Tag>
  );
}
