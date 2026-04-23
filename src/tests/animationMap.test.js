import { describe, expect, it } from "vitest";
import { animationOptions, resolveAnimationPath } from "../lib/animationMap";

describe("resolveAnimationPath", () => {
  it("returns known animation path when key exists", () => {
    expect(resolveAnimationPath("walking")).toBe("/models/walking.glb");
  });

  it("falls back to idle animation when key is unknown", () => {
    expect(resolveAnimationPath("missing-clip")).toBe("/models/idle.glb");
  });

  it("includes expected options for UI", () => {
    expect(animationOptions.map((opt) => opt.value)).toEqual([
      "agree-gesture",
      "alert",
      "all-night-dance",
      "arise",
      "attack",
      "boom-dance",
      "boxing-practice",
      "casual-walk",
      "dead",
      "idle",
      "run-03",
      "run-fast",
      "running",
      "skill-01",
      "skill-03",
      "unsteady-walk",
      "walking",
    ]);
  });
});
