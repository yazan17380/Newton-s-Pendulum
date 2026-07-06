import { physicsParams, BALL_MASS } from './physics.js';




let rowElements = [];
let totalEnergyElement = null;

export function createHUD(ballCount) {

  const existing = document.getElementById('physics-hud');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'physics-hud';
  Object.assign(panel.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: '10',
    padding: '12px 14px',
    background: 'rgba(20, 20, 20, 0.75)',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '12px',
    borderRadius: '8px',
    minWidth: '230px',
    lineHeight: '1.6',
    pointerEvents: 'none',
  });

  const title = document.createElement('div');
  title.textContent = ' Life Pendulum Data ';
  Object.assign(title.style, { fontWeight: 'bold', marginBottom: '6px' });
  panel.appendChild(title);

  rowElements = [];
  for (let i = 0; i < ballCount; i++) {
    const row = document.createElement('div');
    row.textContent = `Ball ${i + 1}: —`;
    panel.appendChild(row);
    rowElements.push(row);
  }

  totalEnergyElement = document.createElement('div');
  Object.assign(totalEnergyElement.style, {
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    fontWeight: 'bold',
  });
  panel.appendChild(totalEnergyElement);

  document.body.appendChild(panel);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function updateHUD(pivots) {
  if (rowElements.length === 0) return;

  let totalEnergy = 0;

  pivots.forEach((p, i) => {


    const cosFromVertical = clamp(-p.localPos.y / p.length, -1, 1);
    const angleFromVertical = Math.acos(cosFromVertical);
    const angleDeg = (angleFromVertical * 180) / Math.PI;

    const linearSpeed = p.localVel.length();

    const angularSpeedDeg = ((linearSpeed / p.length) * 180) / Math.PI;


    const heightDrop = p.length + p.localPos.y;

    const kineticEnergy = 0.5 * BALL_MASS * p.localVel.lengthSq();
    const potentialEnergy = BALL_MASS * physicsParams.gravity * heightDrop;
    totalEnergy += kineticEnergy + potentialEnergy;

    if (rowElements[i]) {
      rowElements[i].textContent =
        `Ball ${i + 1}: θ=${angleDeg.toFixed(1)}° | ω=${angularSpeedDeg.toFixed(0)}°/m | v=${linearSpeed.toFixed(2)} m/s`;
    }
  });

  if (totalEnergyElement) {

    totalEnergyElement.textContent = `  Total System Energy: ${(totalEnergy * 1000).toFixed(1)} mJ`;
  }
}
