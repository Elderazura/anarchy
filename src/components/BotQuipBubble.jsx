export default function BotQuipBubble({ text, visible }) {
  if (!visible || !text) {
    return null;
  }

  return (
    <div className="bot-quip-bubble" role="status" aria-live="polite">
      <span className="bot-quip-dot" />
      <p>{text}</p>
    </div>
  );
}
