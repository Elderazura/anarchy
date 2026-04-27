import { useCallback, useRef } from "react";

/**
 * useBotPhysics — connects bot 3D position to DOM element reactions.
 *
 * Returns:
 *   onBotUpdate(sx, sy, clip) — pass to SiteBackgroundBot
 *   registerTarget(el)        — call with a DOM element to make it react
 */
export function useBotPhysics() {
  const targetsRef = useRef([]);
  const shatterTimersRef = useRef(new Map());

  const registerTarget = useCallback((el) => {
    if (!el || targetsRef.current.includes(el)) return;
    targetsRef.current.push(el);
    return () => {
      targetsRef.current = targetsRef.current.filter((t) => t !== el);
    };
  }, []);

  const onBotUpdate = useCallback((sx, sy, clip) => {
    const isBoxing = clip === "boxing-practice";
    const targets = targetsRef.current;

    for (const el of targets) {
      if (!el || !document.body.contains(el)) continue;

      const rect = el.getBoundingClientRect();
      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;
      const botScreenY = sy - window.scrollY;

      const dx = sx - elCx;
      const dy = botScreenY - elCy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // ── Proximity push (bot within 280px of element center) ──
      const PUSH_RADIUS = 280;
      if (dist < PUSH_RADIUS && dist > 0) {
        const strength = (1 - dist / PUSH_RADIUS) * 22;
        const nx = -dx / dist;
        const ny = -dy / dist;
        el.style.transform = `translate(${nx * strength}px, ${ny * strength * 0.5}px)`;
        el.style.transition = "transform 0.4s ease-out";
      } else {
        el.style.transform = "";
      }

      // ── Boxing shatter (bot within 500px while boxing) ──
      const SHATTER_RADIUS = 500;
      if (isBoxing && dist < SHATTER_RADIUS && !shatterTimersRef.current.has(el)) {
        el.classList.add("bot-shatter");
        const timer = window.setTimeout(() => {
          el.classList.remove("bot-shatter");
          el.style.transform = "";
          shatterTimersRef.current.delete(el);
        }, 2800);
        shatterTimersRef.current.set(el, timer);
      }
    }
  }, []);

  return { onBotUpdate, registerTarget };
}
