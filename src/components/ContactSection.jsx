import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import "./contact.css";

function AnimatedHeadline({ text, color = "#ffffff", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} style={{ display: "block" }}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          style={{
            display: "inline-block",
            color,
            whiteSpace: char === " " ? "pre" : "normal",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: delay + i * 0.04,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </div>
  );
}

const FORM_STATES = { idle: "idle", sending: "sending", success: "success", error: "error" };

export default function ContactSection() {
  const emailRef = useRef(null);
  const emailInView = useInView(emailRef, { once: true, margin: "-100px" });

  const [formState, setFormState] = useState(FORM_STATES.idle);
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!fields.name.trim()) e.name = "Name is required";
    if (!fields.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e.email = "Enter a valid email";
    if (!fields.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setFormState(FORM_STATES.sending);

    try {
      const body = new URLSearchParams({
        "form-name": "contact",
        ...fields,
      });

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (res.ok) {
        setFormState(FORM_STATES.success);
        setFields({ name: "", email: "", message: "" });
      } else {
        setFormState(FORM_STATES.error);
      }
    } catch {
      setFormState(FORM_STATES.error);
    }
  };

  return (
    <section className="signal-section">
      {/* Background layers */}
      <div className="signal-bg-scanlines" aria-hidden="true" />
      <div className="signal-bg-glow" aria-hidden="true" />

      {/* Main content */}
      <div className="signal-content">
        <p className="signal-label">04 / Contact</p>

        <h2 className="signal-headline">
          <AnimatedHeadline text="LET'S BUILD" color="#ffffff" delay={0} />
          <AnimatedHeadline text="A WORLD" color="#7ec8e8" delay={0.15} />
        </h2>

        <motion.a
          ref={emailRef}
          href="mailto:hello@anarchystudios.io"
          className="signal-email"
          initial={{ opacity: 0, y: 20 }}
          animate={emailInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          hello@anarchystudios.io
        </motion.a>

        {/* ── Contact form ── */}
        <motion.div
          className="signal-form-wrap"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            {formState === FORM_STATES.success ? (
              <motion.div
                key="success"
                className="signal-form-success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="signal-form-success__icon">✓</span>
                <p className="signal-form-success__title">Message received.</p>
                <p className="signal-form-success__body">
                  We'll be in touch within 24 hours.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                name="contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                className="signal-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                noValidate
              >
                {/* Netlify required hidden fields */}
                <input type="hidden" name="form-name" value="contact" />
                <p hidden><label>Don't fill this out: <input name="bot-field" /></label></p>

                <div className="signal-form-row">
                  <div className="signal-form-field">
                    <label htmlFor="contact-name" className="signal-form-label">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      className={`signal-form-input${errors.name ? " signal-form-input--error" : ""}`}
                      placeholder="Your name"
                      value={fields.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                    {errors.name && <p className="signal-form-error">{errors.name}</p>}
                  </div>
                  <div className="signal-form-field">
                    <label htmlFor="contact-email" className="signal-form-label">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      className={`signal-form-input${errors.email ? " signal-form-input--error" : ""}`}
                      placeholder="your@email.com"
                      value={fields.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    {errors.email && <p className="signal-form-error">{errors.email}</p>}
                  </div>
                </div>

                <div className="signal-form-field">
                  <label htmlFor="contact-message" className="signal-form-label">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    className={`signal-form-input signal-form-textarea${errors.message ? " signal-form-input--error" : ""}`}
                    placeholder="Tell us about your project…"
                    value={fields.message}
                    onChange={handleChange}
                  />
                  {errors.message && <p className="signal-form-error">{errors.message}</p>}
                </div>

                {formState === FORM_STATES.error && (
                  <p className="signal-form-error signal-form-error--global">
                    Something went wrong. Try emailing us directly at hello@anarchystudios.io
                  </p>
                )}

                <button
                  type="submit"
                  className="signal-form-submit"
                  disabled={formState === FORM_STATES.sending}
                >
                  {formState === FORM_STATES.sending ? "Sending…" : "Send message →"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <hr className="signal-divider" />

        <nav className="signal-socials" aria-label="Social links">
          <a
            href="https://www.instagram.com/anarchystudios.io"
            target="_blank"
            rel="noopener noreferrer"
            className="signal-social-link"
          >
            Instagram
          </a>
          <a
            href="https://www.behance.net/anarchystudios"
            target="_blank"
            rel="noopener noreferrer"
            className="signal-social-link"
          >
            Behance
          </a>
          <a
            href="https://www.linkedin.com/company/anarchystudios"
            target="_blank"
            rel="noopener noreferrer"
            className="signal-social-link"
          >
            LinkedIn
          </a>
        </nav>
      </div>

      {/* Footer credit */}
      <p className="signal-footer">© 2026 Anarchy Studios. All rights reserved.</p>
    </section>
  );
}
