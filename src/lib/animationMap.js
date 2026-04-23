export const animationMap = {
  "agree-gesture": "/models/agree-gesture.glb",
  alert: "/models/alert.glb",
  "all-night-dance": "/models/all-night-dance.glb",
  arise: "/models/arise.glb",
  attack: "/models/attack.glb",
  "boom-dance": "/models/boom-dance.glb",
  "boxing-practice": "/models/boxing-practice.glb",
  "casual-walk": "/models/casual-walk.glb",
  dead: "/models/dead.glb",
  idle: "/models/idle.glb",
  "run-03": "/models/run-03.glb",
  "run-fast": "/models/run-fast.glb",
  running: "/models/running.glb",
  "skill-01": "/models/skill-01.glb",
  "skill-03": "/models/skill-03.glb",
  "unsteady-walk": "/models/unsteady-walk.glb",
  walking: "/models/walking.glb",
};

export const animationOptions = [
  { value: "agree-gesture", label: "Agree Gesture" },
  { value: "alert", label: "Alert" },
  { value: "all-night-dance", label: "All Night Dance" },
  { value: "arise", label: "Arise" },
  { value: "attack", label: "Attack" },
  { value: "boom-dance", label: "Boom Dance" },
  { value: "boxing-practice", label: "Boxing Practice" },
  { value: "casual-walk", label: "Casual Walk" },
  { value: "dead", label: "Dead" },
  { value: "idle", label: "Idle" },
  { value: "run-03", label: "Run 03" },
  { value: "run-fast", label: "Run Fast" },
  { value: "running", label: "Running" },
  { value: "skill-01", label: "Skill 01" },
  { value: "skill-03", label: "Skill 03" },
  { value: "unsteady-walk", label: "Unsteady Walk" },
  { value: "walking", label: "Walking" },
];

export const locomotionClips = ["walking", "casual-walk", "running", "run-fast", "unsteady-walk"];
export const activityClips = [
  "idle",
  "agree-gesture",
  "alert",
  "all-night-dance",
  "arise",
  "attack",
  "boom-dance",
  "boxing-practice",
  "skill-01",
  "skill-03",
];

export function resolveAnimationPath(key) {
  return animationMap[key] ?? animationMap.idle;
}
