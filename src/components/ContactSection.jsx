import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <>
      <style>{`
        .contact-section { background: linear-gradient(180deg, transparent, rgba(4,7,13,0.98)); padding: 80px 22px 60px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; align-items: center; text-align: center; }
        .contact-heading { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700; color: #e8f4fc; margin: 0 0 16px; line-height: 1.2; }
        .contact-heading em { font-style: italic; color: #7ee8c0; }
        .contact-sub { font-size: 0.9rem; color: #6a8898; max-width: 440px; line-height: 1.7; margin: 0 0 32px; }
        .contact-email { font-size: 1.4rem; color: #7ee8c0; text-decoration: none; font-weight: 500; transition: text-decoration 180ms ease; }
        .contact-email:hover { text-decoration: underline; }
        .contact-socials { display: flex; flex-direction: row; gap: 24px; margin-top: 28px; }
        .contact-social-link { font-size: 0.75rem; color: #6a8898; text-decoration: none; transition: color 180ms ease; }
        .contact-social-link:hover { color: #a0c8d8; }
        .contact-footer { font-size: 0.65rem; color: #3a5060; margin-top: 40px; text-align: center; }
      `}</style>
      <motion.section
        className="contact-section"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-kicker">Get In Touch</p>
        <h2 className="contact-heading">Ready to make something <em>wild</em>?</h2>
        <p className="contact-sub">We take on select projects. Reach out and let's see if we're the right chaos for your brand.</p>
        <a href="mailto:hello@anarchystudios.io" className="contact-email">hello@anarchystudios.io</a>
        <div className="contact-socials">
          <a href="#" className="contact-social-link">Twitter / X</a>
          <a href="#" className="contact-social-link">Instagram</a>
          <a href="#" className="contact-social-link">Behance</a>
        </div>
        <p className="contact-footer">© 2026 Anarchy Studios. All rights reserved.</p>
      </motion.section>
    </>
  );
}
