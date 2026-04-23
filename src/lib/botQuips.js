const fallbackQuips = [
  "Great, another human with excellent taste. What a surprise.",
  "I guard this studio 24/7 and still look better than your loading bar.",
  "Yes, this is my casual pose. No, you cannot replicate it.",
  "If this reel gets any sharper, it might cut reality.",
  "I came for security. I stayed for dramatic lighting.",
  "Relax, I only judge weak camera angles.",
  "Anarchy status report: dangerously stylish, mildly feral.",
  "I am not showing off. The environment insists.",
];

const recent = [];
const RECENT_MAX = 12;

function pickFallback() {
  const available = fallbackQuips.filter((line) => !recent.includes(line));
  const source = available.length > 0 ? available : fallbackQuips;
  const chosen = source[Math.floor(Math.random() * source.length)];
  recent.push(chosen);
  if (recent.length > RECENT_MAX) {
    recent.shift();
  }
  return chosen;
}

export async function generateBotQuip(context = "website") {
  try {
    const endpoint = import.meta.env.VITE_QUIP_ENDPOINT ?? "http://127.0.0.1:8787/api/bot-quips";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      throw new Error("Quip endpoint unavailable");
    }

    const data = await response.json();
    if (typeof data?.text === "string" && data.text.trim().length > 0) {
      const next = data.text.trim();
      if (recent.includes(next)) {
        throw new Error("Repeated quip");
      }
      recent.push(next);
      if (recent.length > RECENT_MAX) {
        recent.shift();
      }
      return next;
    }

    throw new Error("Invalid quip payload");
  } catch {
    return pickFallback();
  }
}
