import * as THREE from 'three';
import { scene } from '../core/scene.js';

export function createPendulum(ballCount = 5, radiusOverride = null) {
  const group = new THREE.Group();

  const SCALE = 1.45;

  const chromeMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.88,
    roughness: 0.1, 
    reflectivity: 1.0,
    clearcoat: 1.0, 
    clearcoatRoughness: 0.08,
    envMapIntensity: 2.6,
  });

  const stringMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.4 
  });

  const stringGeo = new THREE.CylinderGeometry(0.002, 0.002, 1, 8);
  stringGeo.translate(0, 0.5, 0);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.6 * SCALE, 0.1 * SCALE, 1.0 * SCALE),
    new THREE.MeshPhysicalMaterial({
      color: 0x6e6a63,
      metalness: 0.15, 
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 2.2,
    })
  );
  base.position.y = 0.05 * SCALE;
  base.receiveShadow = true;
  group.add(base);

  const barR = 0.02 * SCALE;
  const h = 1.0 * SCALE;
  const w = 1.55 * SCALE;
  const d = 0.7 * SCALE;
  const legX = 0.65 * SCALE;

  [[-legX, h/2, d/2], [legX, h/2, d/2], [-legX, h/2, -d/2], [legX, h/2, -d/2]].forEach(p => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, h, 24), chromeMat);
    leg.position.set(p[0], p[1] + 0.1 * SCALE, p[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  const topBar1 = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, w, 24), chromeMat);
  topBar1.rotation.z = Math.PI/2;
  topBar1.position.set(0, h + 0.1 * SCALE, d/2);
  topBar1.castShadow = true;
  group.add(topBar1);

  const topBar2 = topBar1.clone();
  topBar2.position.z = -d/2;
  group.add(topBar2);

  const ballR = radiusOverride ?? 0.085 * SCALE;
  const spacing = 0.18 * SCALE;

  const attachY = h + 0.1 * SCALE;
  const ballY = 0.42 * SCALE;
  const stringLength = attachY - ballY;

  const pivots = [];

  for (let i = 0; i < ballCount; i++) {
    const x = (i - (ballCount - 1) / 2) * spacing;

    const pivot = new THREE.Group();
    pivot.position.set(x, attachY, 0);
    group.add(pivot);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(ballR, 32, 32), chromeMat);
    ball.position.set(0, -stringLength, 0);
    ball.castShadow = true;
    pivot.add(ball);

    const strings = [1, -1].map((sign) => {
      const mesh = new THREE.Mesh(stringGeo, stringMat);
      pivot.add(mesh);
      return { mesh, sign };
    });

    const TRAIL_MAX_POINTS = 40;
    const trailPositions = new Float32Array(TRAIL_MAX_POINTS * 3);
    for (let k = 0; k < TRAIL_MAX_POINTS; k++) {
      trailPositions[k * 3] = 0;
      trailPositions[k * 3 + 1] = -stringLength;
      trailPositions[k * 3 + 2] = 0;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({ color: 0xffd27f, transparent: true, opacity: 0.5 });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    trailLine.visible = false;
    pivot.add(trailLine);

    pivots.push({
      pivot,
      ball,
      strings,
      trail: { line: trailLine, positions: trailPositions, maxPoints: TRAIL_MAX_POINTS },
      length: stringLength,
      radius: ballR,
      restX: x,
      stringSpreadZ: d / 2,
      localPos: new THREE.Vector3(0, -stringLength, 0),
      localVel: new THREE.Vector3(0, 0, 0),
      tension: 0, 
      isDragging: false,
    });
  }

  const pendulumHighlight = new THREE.PointLight(0xfff2df, 2.2, 8);
  pendulumHighlight.position.set(0.8, attachY + 1.8, -2.8);
  group.add(pendulumHighlight);

  const pendulumHighlight2 = new THREE.PointLight(0xdbe8ff, 1.0, 7);
  pendulumHighlight2.position.set(-1.2, attachY + 1.2, -2.2);
  group.add(pendulumHighlight2);

  group.position.set(0, -0.9, 0);
  scene.add(group);

  return { group, pivots };
}