import { animationOptions } from "../lib/animationMap";

const sliderFields = [
  { key: "speed", label: "Orbit Speed", min: 0.05, max: 0.5, step: 0.01 },
  { key: "radius", label: "Orbit Radius", min: 2, max: 9, step: 0.1 },
  { key: "baseHeight", label: "Camera Height", min: 0.5, max: 4, step: 0.1 },
  { key: "swayAmount", label: "Vertical Sway", min: 0, max: 0.8, step: 0.01 },
  { key: "targetHeight", label: "Look Target", min: 0.2, max: 2.5, step: 0.1 },
];

export default function SceneUI({
  activeClip,
  onSelectClip,
  autonomousMode,
  onAutonomousModeChange,
  error,
  cameraSettings,
  onCameraSettingChange,
  onResetCamera,
}) {
  return (
    <div className="ui-shell">
      <div className="panel">
        <h1>Emerald Sentinel</h1>
        <label htmlFor="clip">Animation</label>
        <select
          id="clip"
          value={activeClip}
          disabled={autonomousMode}
          onChange={(event) => onSelectClip(event.target.value)}
        >
          {animationOptions.map((clip) => (
            <option key={clip.value} value={clip.value}>
              {clip.label}
            </option>
          ))}
        </select>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={autonomousMode}
            onChange={(event) => onAutonomousModeChange(event.target.checked)}
          />
          <span>Autonomous bot behavior</span>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={cameraSettings.autoCamera}
            onChange={(event) => onCameraSettingChange("autoCamera", event.target.checked)}
          />
          <span>Auto cinematic camera</span>
        </label>
        {sliderFields.map((field) => (
          <div key={field.key} className="control-row">
            <label htmlFor={field.key}>
              {field.label}: {Number(cameraSettings[field.key]).toFixed(2)}
            </label>
            <input
              id={field.key}
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={cameraSettings[field.key]}
              onChange={(event) =>
                onCameraSettingChange(field.key, Number.parseFloat(event.target.value))
              }
            />
          </div>
        ))}
        <button type="button" className="reset-btn" onClick={onResetCamera}>
          Reset Orbit Controls
        </button>
        {error ? (
          <p className="error">{error}</p>
        ) : (
          <p className="hint">
            {cameraSettings.autoCamera
              ? "Auto mode enabled. Disable it for manual orbit."
              : "Manual orbit enabled. Drag to inspect freely."}
          </p>
        )}
      </div>
    </div>
  );
}
