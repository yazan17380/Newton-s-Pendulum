import { physicsParams, trailState } from './physics.js';
import { setSoundLevel, setMuted } from './sound.js';


const DEFAULTS = {
  gravity: 9.81,
  drag: 0.15,
  restitution: 0.97,
  initialAngle: 38,
  simSpeed: 1.0,
  soundLevel: 0.55,
};

let stylesInjected = false;
function injectPanelStyles() {
  if (stylesInjected || document.getElementById('cradle-panel-styles')) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.id = 'cradle-panel-styles';
  style.textContent = `
    .cradle-panel {
      position: fixed;
      z-index: 10;
      background: rgba(18, 16, 14, 0.88);
      color: #f0e6d8;
      font-family: 'Segoe UI', sans-serif;
      font-size: 12px;
      border-radius: 10px;
      padding: 14px 16px;
      min-width: 230px;
      border: 1px solid rgba(217, 166, 92, 0.25);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .cradle-panel-title {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cradle-section-label {
      color: #d9a65c;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 12px 0 6px;
    }
    .cradle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      gap: 8px;
    }
    .cradle-pill {
      background: rgba(217, 166, 92, 0.12);
      color: #e8c078;
      border: 1px solid rgba(217, 166, 92, 0.35);
      border-radius: 6px;
      padding: 2px 8px;
      font-family: 'Consolas', monospace;
      font-size: 11px;
      white-space: nowrap;
    }
    .cradle-label {
      opacity: 0.85;
      white-space: nowrap;
    }
    .cradle-slider {
      width: 100%;
      margin-bottom: 10px;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.15);
      outline: none;
    }
    .cradle-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #d9a65c;
      cursor: pointer;
      box-shadow: 0 0 4px rgba(217,166,92,0.7);
    }
    .cradle-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #d9a65c;
      border: none;
      cursor: pointer;
    }
    .cradle-btn {
      background: rgba(255,255,255,0.06);
      color: #f0e6d8;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 11px;
      cursor: pointer;
      text-align: center;
    }
    .cradle-btn:hover { background: rgba(255,255,255,0.12); }
    .cradle-btn.active {
      background: rgba(217, 166, 92, 0.22);
      border-color: #d9a65c;
      color: #e8c078;
    }
    .cradle-btn-danger {
      background: rgba(139, 58, 58, 0.55);
      border: 1px solid #a34848;
      color: #f2c9c9;
      font-weight: 700;
    }
    .cradle-btn-danger:hover { background: rgba(139, 58, 58, 0.75); }
    .cradle-actions-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 6px; }
    .cradle-actions-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; }
    .cradle-ops-row { display: flex; gap: 6px; margin-bottom: 10px; }
    .cradle-ops-row .cradle-btn { flex: 1; }
  `;
  document.head.appendChild(style);
}

export function createControlPanel({
  initialBallCount = 5,
  initialRadius = 0.12,
  onGeometryChange,
  onPauseToggle,
  onPullPreset, 
  onReset, 
  onTrailsToggle, 
  onSimSpeedChange, 
  initialPaused = false,
} = {}) {
  injectPanelStyles();

  const existing = document.getElementById('control-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'control-panel';
  panel.className = 'cradle-panel';
  Object.assign(panel.style, { bottom: '16px', left: '16px' });

  const title = document.createElement('div');
  title.className = 'cradle-panel-title';
  title.innerHTML = '<span>لوحة التحكم</span><span>⚙</span>';
  panel.appendChild(title);

  const opsLabel = document.createElement('div');
  opsLabel.className = 'cradle-section-label';
  opsLabel.textContent = 'OPERATION';
  panel.appendChild(opsLabel);

  const opsRow = document.createElement('div');
  opsRow.className = 'cradle-ops-row';

  let trailsOn = trailState.enabled;
  const trailsBtn = document.createElement('button');
  trailsBtn.className = 'cradle-btn' + (trailsOn ? ' active' : '');
  trailsBtn.textContent = trailsOn ? 'Trails ●' : 'Trails ○';
  trailsBtn.addEventListener('click', () => {
    trailsOn = !trailsOn;
    trailsBtn.textContent = trailsOn ? 'Trails ●' : 'Trails ○';
    trailsBtn.classList.toggle('active', trailsOn);
    if (onTrailsToggle) onTrailsToggle(trailsOn);
  });
  opsRow.appendChild(trailsBtn);

  let soundMuted = false;
  const soundBtn = document.createElement('button');
  soundBtn.className = 'cradle-btn';
  soundBtn.textContent = '🔊';
  soundBtn.addEventListener('click', () => {
    soundMuted = !soundMuted;
    soundBtn.textContent = soundMuted ? '🔇' : '🔊';
    soundBtn.classList.toggle('active', soundMuted);
    setMuted(soundMuted);
  });
  opsRow.appendChild(soundBtn);

  let isPaused = initialPaused;
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'cradle-btn';
  pauseBtn.textContent = isPaused ? '▶' : '⏸';
  pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶' : '⏸';
    pauseBtn.classList.toggle('active', isPaused);
    if (onPauseToggle) onPauseToggle(isPaused);
  });
  opsRow.appendChild(pauseBtn);

  panel.appendChild(opsRow);

  let currentSimSpeed = DEFAULTS.simSpeed;
  const simSpeedSlider = makeSliderRow('Simulation Speed', 0.1, 2.0, 0.05, currentSimSpeed, (v) => {
    currentSimSpeed = v;
    if (onSimSpeedChange) onSimSpeedChange(v);
  }, 'x');
  panel.appendChild(simSpeedSlider.row);

  const soundLevelSlider = makeSliderRow('Sound Level', 0, 1, 0.01, DEFAULTS.soundLevel, (v) => {
    setSoundLevel(v);
  });
  panel.appendChild(soundLevelSlider.row);
  setSoundLevel(DEFAULTS.soundLevel); 

  const physicsLabel = document.createElement('div');
  physicsLabel.className = 'cradle-section-label';
  physicsLabel.textContent = 'PHYSICS';
  panel.appendChild(physicsLabel);

  const physicsSliders = [];

  const gravitySlider = makeSliderRow('Gravity g', 1, 20, 0.1, physicsParams.gravity, (v) => {
    physicsParams.gravity = v;
  }, 'm/s²');
  physicsSliders.push({ ...gravitySlider, key: 'gravity' });
  panel.appendChild(gravitySlider.row);


  const restitutionSlider = makeSliderRow('Coefficient of restitution e', 0.5, 1.0, 0.01, physicsParams.restitution, (v) => {
    physicsParams.restitution = v;
  });
  physicsSliders.push({ ...restitutionSlider, key: 'restitution' });
  panel.appendChild(restitutionSlider.row);

  let currentInitialAngle = DEFAULTS.initialAngle;
  const angleSlider = makeSliderRow('Initial angle θ₀', 0, 80, 1, currentInitialAngle, (v) => {
    currentInitialAngle = v;
  }, '°');
  panel.appendChild(angleSlider.row);

  const geometryLabel = document.createElement('div');
  geometryLabel.className = 'cradle-section-label';
  geometryLabel.textContent = 'GEOMETRY (REBUILD)';
  panel.appendChild(geometryLabel);

  let currentBallCount = initialBallCount;
  let currentRadius = initialRadius;

  function triggerGeometryChange() {
    if (onGeometryChange) onGeometryChange({ ballCount: currentBallCount, radius: currentRadius });
  }

  const ballCountSlider = makeSliderRow('Number of balls N', 2, 9, 1, initialBallCount, (v) => {
    currentBallCount = Math.round(v);
    triggerGeometryChange();
  });
  panel.appendChild(ballCountSlider.row);

  const radiusSlider = makeSliderRow('Radius R', 0.05, 0.2, 0.005, initialRadius, (v) => {
    currentRadius = v;
    triggerGeometryChange();
  }, 'm');
  panel.appendChild(radiusSlider.row);

  const actionsLabel = document.createElement('div');
  actionsLabel.className = 'cradle-section-label';
  actionsLabel.textContent = 'ACTIONS';
  panel.appendChild(actionsLabel);

  function makeActionButton(label, onClick) {
    const btn = document.createElement('button');
    btn.className = 'cradle-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  const row3 = document.createElement('div');
  row3.className = 'cradle-actions-3';
  row3.appendChild(makeActionButton('Right 1 ▶', () => onPullPreset && onPullPreset('right', 1, currentInitialAngle)));
  row3.appendChild(makeActionButton('Left 1 ◀', () => onPullPreset && onPullPreset('left', 1, currentInitialAngle)));
  row3.appendChild(makeActionButton('Reset ↺', () => onReset && onReset()));
  panel.appendChild(row3);

  const row2 = document.createElement('div');
  row2.className = 'cradle-actions-2';
  row2.appendChild(makeActionButton('Right 2 ▶▶', () => onPullPreset && onPullPreset('right', 2, currentInitialAngle)));
  row2.appendChild(makeActionButton('Left 2 ◀◀', () => onPullPreset && onPullPreset('left', 2, currentInitialAngle)));
  panel.appendChild(row2);

  const resetDefaultsBtn = document.createElement('button');
  resetDefaultsBtn.className = 'cradle-btn cradle-btn-danger';
  resetDefaultsBtn.style.width = '100%';
  resetDefaultsBtn.textContent = 'Reset Defaults ↺';
  resetDefaultsBtn.addEventListener('click', () => {
    for (const s of physicsSliders) {
      const def = DEFAULTS[s.key];
      physicsParams[s.key] = def;
      s.input.value = String(def);
      s.valueText.textContent = formatValue(def, s.step, s.unit);
    }
    currentInitialAngle = DEFAULTS.initialAngle;
    angleSlider.input.value = String(DEFAULTS.initialAngle);
    angleSlider.valueText.textContent = formatValue(DEFAULTS.initialAngle, 1, '°');

    currentSimSpeed = DEFAULTS.simSpeed;
    simSpeedSlider.input.value = String(DEFAULTS.simSpeed);
    simSpeedSlider.valueText.textContent = formatValue(DEFAULTS.simSpeed, 0.05, 'x');
    if (onSimSpeedChange) onSimSpeedChange(DEFAULTS.simSpeed);

    setSoundLevel(DEFAULTS.soundLevel);
    soundLevelSlider.input.value = String(DEFAULTS.soundLevel);
    soundLevelSlider.valueText.textContent = formatValue(DEFAULTS.soundLevel, 0.01);
  });
  panel.appendChild(resetDefaultsBtn);

  document.body.appendChild(panel);
}

function makeSliderRow(label, min, max, step, initialValue, onChange, unit = '') {
  const row = document.createElement('div');

  const topRow = document.createElement('div');
  topRow.className = 'cradle-row';

  const pill = document.createElement('span');
  pill.className = 'cradle-pill';
  pill.textContent = formatValue(initialValue, step, unit);

  const labelSpan = document.createElement('span');
  labelSpan.className = 'cradle-label';
  labelSpan.textContent = label;

  topRow.appendChild(pill);
  topRow.appendChild(labelSpan);
  row.appendChild(topRow);

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'cradle-slider';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(initialValue);

  input.addEventListener('input', () => {
    const value = parseFloat(input.value);
    pill.textContent = formatValue(value, step, unit);
    onChange(value);
  });

  row.appendChild(input);
  return { row, input, valueText: pill, step, unit };
}

function formatValue(value, step, unit = '') {
  const text = step < 1 ? value.toFixed(3) : value.toFixed(0);
  return unit ? `${text} ${unit}` : text;
}
