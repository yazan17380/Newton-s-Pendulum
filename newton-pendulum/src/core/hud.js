import * as THREE from 'three';
import { physicsParams, BALL_MASS, massOf } from './physics.js';


let rowElements = []; 
let totalEnergyElement = null;
let summaryElements = null;
let airResistanceInput = null;
let airResistancePill = null;
let energyBaseline = 0;

export function setEnergyBaseline(pivots) {
  energyBaseline = computeTotalEnergy(pivots);
}

function computeTotalEnergy(pivots) {
  let total = 0;
  for (const p of pivots) {
    const heightDrop = p.length + p.localPos.y;
    const kinetic = 0.5 * massOf(p) * p.localVel.lengthSq();
    const potential = massOf(p) * physicsParams.gravity * heightDrop;
    total += kinetic + potential;
  }
  return total;
}

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
      display: flex;
      justify-content: space-between;
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
    .cradle-label { opacity: 0.85; white-space: nowrap; }
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
      width: 14px; height: 14px; border-radius: 50%;
      background: #d9a65c; cursor: pointer;
      box-shadow: 0 0 4px rgba(217,166,92,0.7);
    }
    .cradle-slider::-moz-range-thumb {
      width: 14px; height: 14px; border-radius: 50%;
      background: #d9a65c; border: none; cursor: pointer;
    }
    .cradle-ball-title {
      display: flex; justify-content: flex-end; margin-bottom: 4px; font-weight: 600;
    }
  `;
  document.head.appendChild(style);
}

function makeMonitorSlider(container, label, min, max, step, initialValue, onChange, unit = '') {
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
  Object.assign(input.style, { pointerEvents: 'auto' }); 

  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    pill.textContent = formatValue(v, step, unit);
    onChange(v);
  });

  row.appendChild(input);
  container.appendChild(row);
  return { input, pill };
}

function formatValue(value, step, unit = '') {
  const text = step < 1 ? value.toFixed(4) : value.toFixed(0);
  return unit ? `${text} ${unit}` : text;
}

export function createHUD(pivots) {
  injectPanelStyles();

  const existing = document.getElementById('physics-hud');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'physics-hud';
  panel.className = 'cradle-panel';
  Object.assign(panel.style, {
    top: '16px',
    right: '16px',
    maxHeight: '90vh',
    overflowY: 'auto',
  });

  const title = document.createElement('div');
  title.className = 'cradle-panel-title';
  title.textContent = 'Physics Monitor';
  panel.appendChild(title);

  const liveLabel = document.createElement('div');
  liveLabel.className = 'cradle-section-label';
  liveLabel.innerHTML = '<span>LIVE PHYSICS</span><span>Realtime</span>';
  panel.appendChild(liveLabel);

  function addSummaryRow(label) {
    const row = document.createElement('div');
    row.className = 'cradle-row';
    const labelSpan = document.createElement('span');
    labelSpan.className = 'cradle-label';
    labelSpan.textContent = label;
    const pill = document.createElement('span');
    pill.className = 'cradle-pill';
    pill.textContent = '—';
    row.appendChild(labelSpan);
    row.appendChild(pill);
    panel.appendChild(row);
    return pill;
  }

  summaryElements = {
    totalEnergy: addSummaryRow('Total Energy'),
    maxSpeed: addSummaryRow('Max Speed'),
    maxAngle: addSummaryRow('Max Angle'),
    conserved: addSummaryRow('Conserved Energy'),
    momentum: addSummaryRow('Linear Momentum'),
    tension: addSummaryRow('String Tension'),
    collisions: addSummaryRow('Collision Counter'),
  };
  totalEnergyElement = summaryElements.totalEnergy; 

  const airRow = makeMonitorSlider(panel, 'Air Resistance', 0, 1.0, 0.0005, physicsParams.drag, (v) => {
    physicsParams.drag = v;
  });
  airResistanceInput = airRow.input;
  airResistancePill = airRow.pill;

  const ballStateLabel = document.createElement('div');
  ballStateLabel.className = 'cradle-section-label';
  ballStateLabel.textContent = 'BALL STATE';
  panel.appendChild(ballStateLabel);

  rowElements = [];
  for (let i = 0; i < pivots.length; i++) {
    const p = pivots[i];

    const ballBox = document.createElement('div');
    Object.assign(ballBox.style, {
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '1px solid rgba(217,166,92,0.15)',
    });

    const ballTitle = document.createElement('div');
    ballTitle.className = 'cradle-ball-title';
    ballTitle.textContent = `Ball ${i + 1}`;
    ballBox.appendChild(ballTitle);
    panel.appendChild(ballBox);

    const lengthMin = Math.max(0.05, p.length * 0.3);
    const lengthMax = p.length * 1.8;
    makeMonitorSlider(ballBox, 'Thread length', lengthMin, lengthMax, 0.005, p.length, (v) => {
      p.length = v;
      p.localPos.setLength(v);
    }, 'm');

    makeMonitorSlider(ballBox, 'Ball mass', 0.01, 1, 0.01, p.mass ?? BALL_MASS, (v) => {
      p.mass = v;
    }, 'kg');

    rowElements.push(null);
  }

  document.body.appendChild(panel);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function updateHUD(pivots, collisionCount = 0) {
  if (!summaryElements) return;

  let totalEnergy = 0;
  let maxSpeed = 0;
  let maxAngleDeg = 0;
  let tensionSum = 0;
  const momentum = { x: 0, y: 0, z: 0 };

  pivots.forEach((p) => {
    const cosFromVertical = clamp(-p.localPos.y / p.length, -1, 1);
    const angleFromVertical = Math.acos(cosFromVertical);
    const angleDeg = (angleFromVertical * 180) / Math.PI;

    const linearSpeed = p.localVel.length(); 

    const heightDrop = p.length + p.localPos.y;

    const mass = massOf(p);
    const kineticEnergy = 0.5 * mass * p.localVel.lengthSq();
    const potentialEnergy = mass * physicsParams.gravity * heightDrop;
    totalEnergy += kineticEnergy + potentialEnergy;

    maxSpeed = Math.max(maxSpeed, linearSpeed);
    maxAngleDeg = Math.max(maxAngleDeg, angleDeg);
    tensionSum += isFinite(p.tension) ? p.tension : 0;

    momentum.x += mass * p.localVel.x;
    momentum.y += mass * p.localVel.y;
    momentum.z += mass * p.localVel.z;
  });

  const momentumMag = Math.sqrt(momentum.x ** 2 + momentum.y ** 2 + momentum.z ** 2);
  const conservedPct = energyBaseline > 1e-6 ? (totalEnergy / energyBaseline) * 100 : 100;
  const avgTension = pivots.length > 0 ? tensionSum / pivots.length : 0;

  summaryElements.totalEnergy.textContent = `${(totalEnergy * 1000).toFixed(1)} mJ`;
  summaryElements.maxSpeed.textContent = `${maxSpeed.toFixed(3)} m/s`;
  summaryElements.maxAngle.textContent = `${maxAngleDeg.toFixed(1)} °`;
  summaryElements.conserved.textContent = `${clamp(conservedPct, 0, 999).toFixed(1)} %`;
  summaryElements.momentum.textContent = `${momentumMag.toFixed(3)} kg·m/s`;
  summaryElements.tension.textContent = `${avgTension.toFixed(2)} N`;
  summaryElements.collisions.textContent = `${collisionCount}`;

  if (airResistanceInput && document.activeElement !== airResistanceInput) {
    airResistanceInput.value = String(physicsParams.drag);
    airResistancePill.textContent = physicsParams.drag.toFixed(4);
  }
}
