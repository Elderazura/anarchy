import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CtaBanner() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      }
    );
    // Subtle parallax on the headline
    gsap.to(el.querySelector(".cta-headline"), {
      y: -24,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  }, []);

  return (
    <section className="cta-banner" ref={ref}>
      <div className="cta-banner-inner">
        <p className="cta-kicker">Ready to break things?</p>
        <h2 className="cta-headline">
          Let's make something<br />
          <em>the world hasn't seen.</em>
        </h2>
        <div className="cta-actions">
          <a
            href="mailto:hello@anarchystudios.io"
            className="cta-primary"
          >
            Start a project
          </a>
          <a
            href="mailto:hello@anarchystudios.io?subject=Collab"
            className="cta-secondary"
          >
            Collaborate
          </a>
        </div>
      </div>
      <div className="cta-banner-bg" aria-hidden="true" />
    </section>
  );
}
