import { physicsParams } from './physics.js';


export function createControlPanel({ initialBallCount = 5, onBallCountChange } = {}) {
  const panel = document.createElement('div');
  panel.id = 'control-panel';
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    zIndex: '10',
    padding: '12px 14px',
    background: 'rgba(20, 20, 20, 0.75)',
    color: '#fff',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    borderRadius: '8px',
    minWidth: '220px',
  });

  const title = document.createElement('div');
  title.textContent = 'Simulation Settings ';
  Object.assign(title.style, { fontWeight: 'bold', marginBottom: '8px' });
  panel.appendChild(title);

  panel.appendChild(
    makeSliderRow('Gravity (m/s²)', 1, 20, 0.1, physicsParams.gravity, (v) => {
      physicsParams.gravity = v;
    })
  );

  panel.appendChild(

    makeSliderRow(' Drag ', 0, 1.0, 0.01, physicsParams.drag, (v) => {
      physicsParams.drag = v;
    })
  );

  panel.appendChild(
    makeSliderRow(' Restitution ', 0.5, 1.0, 0.01, physicsParams.restitution, (v) => {
      physicsParams.restitution = v;
    })
  );

  panel.appendChild(
    makeSliderRow(' Ball Count ', 2, 9, 1, initialBallCount, (v) => {
      if (onBallCountChange) onBallCountChange(Math.round(v));
    })
  );

  document.body.appendChild(panel);
}

function makeSliderRow(label, min, max, step, initialValue, onChange) {
  const row = document.createElement('div');
  row.style.marginBottom = '10px';

  const labelRow = document.createElement('div');
  labelRow.style.marginBottom = '2px';

  const labelText = document.createElement('span');
  labelText.textContent = `${label}: `;

  const valueText = document.createElement('span');
  valueText.textContent = formatValue(initialValue, step);
  valueText.style.fontWeight = 'bold';

  labelRow.appendChild(labelText);
  labelRow.appendChild(valueText);
  row.appendChild(labelRow);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(initialValue);
  input.style.width = '100%';

  input.addEventListener('input', () => {
    const value = parseFloat(input.value);
    valueText.textContent = formatValue(value, step);
    onChange(value);
  });

  row.appendChild(input);
  return row;
}

function formatValue(value, step) {
  return step < 1 ? value.toFixed(3) : value.toFixed(0);
}
