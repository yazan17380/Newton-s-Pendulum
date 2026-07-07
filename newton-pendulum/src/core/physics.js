import * as THREE from 'three';



export const physicsParams = {
  gravity: 9.81,

  drag: 0.15,

  restitution: 0.97, 

  bounceFlipThreshold: 1.2,
  bounceHoldFrames: 8, 

  stringMinGap: 0.01,
  stringCorrectionFactor: 0.5,
};

const COLLISION_ITERATIONS = 8; 

export const BALL_MASS = 0.05; 

export const trailState = { enabled: false };

export function setTrailsEnabled(pivots, enabled) {
  trailState.enabled = enabled;
  for (const p of pivots) {
    if (p.trail) p.trail.line.visible = enabled;
  }
}

export function massOf(p) {
  return isFiniteNumber(p.mass) && p.mass > 0 ? p.mass : BALL_MASS;
}

const MAX_LOCAL_SPEED = 15; 
const MAX_DRAG_SPEED = 8;  
const DRAG_VELOCITY_SMOOTHING = 0.35; 

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isFiniteVector(v) {
  return isFiniteNumber(v.x) && isFiniteNumber(v.y) && isFiniteNumber(v.z);
}

export function updatePendulumPhysics(pivots, deltaTime, onCollision = null) {
  if (!pivots || pivots.length === 0) return;

  const dt = Math.min(deltaTime, 1 / 30); 

  for (const p of pivots) {
    if (p.holdFrames > 0) {
      p.holdFrames--;
      if (p.holdFrames === 0 && p.heldVel) {
        p.localVel.copy(p.heldVel);
      }
    }
  }

  const preVel = pivots.map((p) => p.localVel.clone());

  for (const p of pivots) {
    if (p.holdFrames > 0) continue; 
    updateDragVelocity3D(p, dt);
    integratePendulumComplex(p, dt);
  }

  const collidedPairs = new Set();
  for (let iter = 0; iter < COLLISION_ITERATIONS; iter++) {
    const anyResolved = resolveCollisions(pivots, collidedPairs, onCollision);
    if (!anyResolved) break;
  }

  for (const p of pivots) sanitizePivotState(p);

  resolveStringCollisions(pivots);
  for (const p of pivots) sanitizePivotState(p);

  for (let i = 0; i < pivots.length; i++) {
    const p = pivots[i];
    if (p.holdFrames > 0 || p.isDragging) continue;
    checkBounceFlip(p, preVel[i]);
  }

  for (const p of pivots) {
    p.ball.position.copy(p.localPos);
    updateStringTransforms(p);
    if (trailState.enabled) updateTrail(p);
  }
}

function checkBounceFlip(p, prevVel) {
  const threshold = physicsParams.bounceFlipThreshold;
  const prevSpeed = prevVel.length();
  const newSpeed = p.localVel.length();
  if (prevSpeed < threshold || newSpeed < threshold) return;

  const cosAngle = prevVel.dot(p.localVel) / (prevSpeed * newSpeed);
  if (cosAngle < -0.6) { 
    p.holdFrames = physicsParams.bounceHoldFrames;
    p.heldVel = p.heldVel || new THREE.Vector3();
    p.heldVel.copy(p.localVel);
    p.localVel.set(0, 0, 0);
  }
}

export function resetPendulum(pivots) {
  for (const p of pivots) {
    p.localPos.set(0, -p.length, 0);
    p.localVel.set(0, 0, 0);
    p.isDragging = false;
    p._dragFrames = 0;
    p._prevLocalPos = null;
    p.holdFrames = 0;
    p.heldVel = null;
    p._stuckPartner = null;
    p._stuckFrames = 0;
    p.tension = massOf(p) * physicsParams.gravity; 
    p.ball.position.copy(p.localPos);
    updateStringTransforms(p);

    if (p.trail) {
      for (let k = 0; k < p.trail.maxPoints; k++) {
        p.trail.positions[k * 3] = p.localPos.x;
        p.trail.positions[k * 3 + 1] = p.localPos.y;
        p.trail.positions[k * 3 + 2] = p.localPos.z;
      }
      p.trail.line.geometry.attributes.position.needsUpdate = true;
    }
  }
}

function updateDragVelocity3D(p, dt) {
  if (!p.isDragging) {
    p._dragFrames = 0;
    p._prevLocalPos = p.localPos.clone();
    return;
  }

  if (!p._dragFrames || !p._prevLocalPos) {

    p.localVel.set(0, 0, 0);
    p._dragFrames = 1;
  } else {
    const measured = _scratchA.copy(p.localPos).sub(p._prevLocalPos).multiplyScalar(1 / dt);
    const s = DRAG_VELOCITY_SMOOTHING;
    p.localVel.multiplyScalar(1 - s).addScaledVector(measured, s);
    if (p.localVel.length() > MAX_DRAG_SPEED) {
      p.localVel.setLength(MAX_DRAG_SPEED);
    }
    p._dragFrames += 1;
  }

  p._prevLocalPos = p._prevLocalPos || new THREE.Vector3();
  p._prevLocalPos.copy(p.localPos);
}


function integratePendulumComplex(p, dt) {
  if (p.isDragging) {
    sanitizePivotState(p);
    return;
  }

  const mass = massOf(p);
  const g = physicsParams.gravity;

  const ropeDir = _scratchB.copy(p.localPos).normalize();
  const speedSq = p.localVel.lengthSq();

  const gravityForceY = -g * mass;
  const gravityAlongRope = gravityForceY * ropeDir.y; 

  const tensionMagnitude = -(mass * speedSq) / p.length - gravityAlongRope;
  p.tension = Math.abs(tensionMagnitude); 

  const totalForce = _scratchC.set(0, gravityForceY, 0);
  totalForce.addScaledVector(ropeDir, tensionMagnitude);
  totalForce.addScaledVector(p.localVel, -physicsParams.drag * mass); 

  const accel = totalForce.multiplyScalar(1 / mass);
  p.localVel.addScaledVector(accel, dt);
  p.localPos.addScaledVector(p.localVel, dt);

  p.localPos.setLength(p.length);

  const newRopeDir = _scratchB.copy(p.localPos).normalize();
  const radialSpeed = p.localVel.dot(newRopeDir);
  p.localVel.addScaledVector(newRopeDir, -radialSpeed);

  p._prevLocalPos = p._prevLocalPos || new THREE.Vector3();
  p._prevLocalPos.copy(p.localPos);

  sanitizePivotState(p);
}

function sanitizePivotState(p) {
  if (!isFiniteVector(p.localPos) || p.localPos.lengthSq() < 1e-8) {
    p.localPos.set(0, -p.length, 0);
  } else {
    p.localPos.setLength(p.length); 
  }

  if (!isFiniteVector(p.localVel)) {
    p.localVel.set(0, 0, 0);
  } else if (p.localVel.length() > MAX_LOCAL_SPEED) {
    p.localVel.setLength(MAX_LOCAL_SPEED);
  }
}

function resolveCollisions(pivots, collidedPairs, onCollision) {
  const order = pivots
    .map((_, idx) => idx)
    .sort((i1, i2) => (pivots[i1].restX + pivots[i1].localPos.x) - (pivots[i2].restX + pivots[i2].localPos.x));

  let any = false;
  for (let k = 0; k < order.length - 1; k++) {
    if (resolvePairAt(pivots, order[k], order[k + 1], collidedPairs, onCollision)) any = true;
  }
  for (let k = order.length - 2; k >= 0; k--) {
    if (resolvePairAt(pivots, order[k], order[k + 1], collidedPairs, onCollision)) any = true;
  }
  return any;
}

const MAX_STUCK_FRAMES = 30;

function resolvePairAt(pivots, i, j, collidedPairs, onCollision) {
  const a = pivots[i];
  const b = pivots[j];

  const ax = a.restX + a.localPos.x, ay = a.localPos.y, az = a.localPos.z;
  const bx = b.restX + b.localPos.x, by = b.localPos.y, bz = b.localPos.z;

  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const minDist = a.radius + b.radius;

  if (dist >= minDist || dist < 1e-6) {
    if (a._stuckPartner === b) a._stuckFrames = 0;
    return false;
  }

  const nx = dx / dist, ny = dy / dist, nz = dz / dist;

  const van = a.localVel.x * nx + a.localVel.y * ny + a.localVel.z * nz;
  const vbn = b.localVel.x * nx + b.localVel.y * ny + b.localVel.z * nz;
  const approaching = van > vbn;

  if (approaching) {
    const pairKey = i < j ? `${i}_${j}` : `${j}_${i}`;
    if (onCollision && !collidedPairs.has(pairKey)) {
      collidedPairs.add(pairKey);
      onCollision(van - vbn, Math.min(i, j));
    }
  }

  const overlap = minDist - dist;
  const aFixed = a.isDragging || a.holdFrames > 0;
  const bFixed = b.isDragging || b.holdFrames > 0;

  if (a._stuckPartner === b) {
    a._stuckFrames = (a._stuckFrames || 0) + 1;
  } else {
    a._stuckPartner = b;
    a._stuckFrames = 1;
  }

  if (aFixed && bFixed) return approaching;

  if (overlap > 0) {
    if (aFixed) {
      applyPositionalPush(b, nx, ny, nz, overlap);
    } else if (bFixed) {
      applyPositionalPush(a, nx, ny, nz, -overlap);
    } else {
      const half = overlap / 2;
      applyPositionalPush(a, nx, ny, nz, -half);
      applyPositionalPush(b, nx, ny, nz, half);
    }
  }

  if (approaching) {
    const e = physicsParams.restitution;

    if (aFixed) {
      const newVbn = (1 + e) * van - e * vbn;
      applyNormalImpulse(b, nx, ny, nz, newVbn - vbn);
    } else if (bFixed) {
      const newVan = (1 + e) * vbn - e * van;
      applyNormalImpulse(a, nx, ny, nz, newVan - van);
    } else {
      const mA = massOf(a);
      const mB = massOf(b);
      const totalMass = mA + mB;
      const relVel = van - vbn;

      const newVan = (mA * van + mB * vbn - mB * e * relVel) / totalMass;
      const newVbn = (mA * van + mB * vbn + mA * e * relVel) / totalMass;

      applyNormalImpulse(a, nx, ny, nz, newVan - van);
      applyNormalImpulse(b, nx, ny, nz, newVbn - vbn);
    }
  }

  if (a._stuckFrames > MAX_STUCK_FRAMES && !(aFixed && bFixed)) {
    const extraGap = minDist * 0.08;
    if (aFixed) {
      applyPositionalPush(b, nx, ny, nz, extraGap);
      b.localVel.addScaledVector({ x: nx, y: ny, z: nz }, -vbn * 0.5);
    } else if (bFixed) {
      applyPositionalPush(a, nx, ny, nz, -extraGap);
      a.localVel.addScaledVector({ x: nx, y: ny, z: nz }, -van * 0.5);
    } else {
      applyPositionalPush(a, nx, ny, nz, -extraGap / 2);
      applyPositionalPush(b, nx, ny, nz, extraGap / 2);
    }
    a._stuckFrames = 0;
  }

  return approaching || overlap > 0;
}

function applyNormalImpulse(p, nx, ny, nz, deltaVn) {
  p.localVel.x += deltaVn * nx;
  p.localVel.y += deltaVn * ny;
  p.localVel.z += deltaVn * nz;
}

function applyPositionalPush(p, nx, ny, nz, amount) {
  p.localPos.x += amount * nx;
  p.localPos.y += amount * ny;
  p.localPos.z += amount * nz;

  p.localPos.setLength(p.length);
}


function resolveStringCollisions(pivots) {
  if (pivots.some((p) => !isFiniteNumber(p.stringSpreadZ))) return;

  const ballPos = pivots.map((p) => ({
    x: p.restX + p.localPos.x,
    y: p.localPos.y,
    z: p.localPos.z,
  }));
  const order = pivots.map((_, idx) => idx).sort((i1, i2) => ballPos[i1].x - ballPos[i2].x);

  for (let k = 0; k < order.length - 1; k++) {
    const i = order[k];
    const j = order[k + 1];
    const a = pivots[i];
    const b = pivots[j];
    const ballA = ballPos[i];
    const ballB = ballPos[j];

    const aFixed = a.isDragging || a.holdFrames > 0;
    const bFixed = b.isDragging || b.holdFrames > 0;
    if (aFixed && bFixed) continue;

    for (const signA of [1, -1]) {
      const topA = { x: a.restX, y: 0, z: signA * a.stringSpreadZ };
      for (const signB of [1, -1]) {
        const topB = { x: b.restX, y: 0, z: signB * b.stringSpreadZ };

        const distSq = segmentSegmentDistSq3D(topA, ballA, topB, ballB);
        const gap = physicsParams.stringMinGap;
        if (distSq >= gap * gap) continue;

        const dist = Math.sqrt(distSq);
        const overlap = gap - dist;
        if (overlap <= 0) continue;

        const dx = ballB.x - ballA.x, dy = ballB.y - ballA.y, dz = ballB.z - ballA.z;
        const sepLen = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const pushX = dx / sepLen, pushY = dy / sepLen, pushZ = dz / sepLen;

        const bothFree = !aFixed && !bFixed;
        const share = overlap * physicsParams.stringCorrectionFactor * (bothFree ? 0.5 : 1);

        if (!aFixed) {
          a.localPos.x -= pushX * share;
          a.localPos.y -= pushY * share;
          a.localPos.z -= pushZ * share;
          a.localPos.setLength(a.length);
        }
        if (!bFixed) {
          b.localPos.x += pushX * share;
          b.localPos.y += pushY * share;
          b.localPos.z += pushZ * share;
          b.localPos.setLength(b.length);
        }
      }
    }
  }
}

function segmentSegmentDistSq3D(p1, q1, p2, q2) {
  const ux = q1.x - p1.x, uy = q1.y - p1.y, uz = q1.z - p1.z;
  const vx = q2.x - p2.x, vy = q2.y - p2.y, vz = q2.z - p2.z;
  const wx = p1.x - p2.x, wy = p1.y - p2.y, wz = p1.z - p2.z;

  const a = ux * ux + uy * uy + uz * uz;
  const b = ux * vx + uy * vy + uz * vz;
  const c = vx * vx + vy * vy + vz * vz;
  const d = ux * wx + uy * wy + uz * wz;
  const e = vx * wx + vy * wy + vz * wz;
  const D = a * c - b * b;

  let sN, sD = D, tN, tD = D;

  if (D < 1e-9) {
    sN = 0; sD = 1; tN = e; tD = c;
  } else {
    sN = b * e - c * d;
    tN = a * e - b * d;
    if (sN < 0) { sN = 0; tN = e; tD = c; }
    else if (sN > sD) { sN = sD; tN = e + b; tD = c; }
  }

  if (tN < 0) {
    tN = 0;
    if (-d < 0) sN = 0;
    else if (-d > a) sN = sD;
    else { sN = -d; sD = a; }
  } else if (tN > tD) {
    tN = tD;
    if (-d + b < 0) sN = 0;
    else if (-d + b > a) sN = sD;
    else { sN = -d + b; sD = a; }
  }

  const sc = Math.abs(sN) < 1e-9 ? 0 : sN / sD;
  const tc = Math.abs(tN) < 1e-9 ? 0 : tN / tD;

  const cx = (p1.x + sc * ux) - (p2.x + tc * vx);
  const cy = (p1.y + sc * uy) - (p2.y + tc * vy);
  const cz = (p1.z + sc * uz) - (p2.z + tc * vz);
  return cx * cx + cy * cy + cz * cz;
}

const _up = new THREE.Vector3(0, 1, 0);
const _stringDir = new THREE.Vector3();
const _stringQuat = new THREE.Quaternion();
const _stringAttach = new THREE.Vector3();

function updateStringTransforms(p) {
  for (const { mesh, sign } of p.strings) {
    _stringAttach.set(0, 0, sign * p.stringSpreadZ);
    _stringDir.copy(p.localPos).sub(_stringAttach);
    const len = _stringDir.length();
    if (len < 1e-6) continue;
    _stringDir.multiplyScalar(1 / len);

    mesh.position.copy(_stringAttach);
    _stringQuat.setFromUnitVectors(_up, _stringDir);
    mesh.quaternion.copy(_stringQuat);
    mesh.scale.set(1, len, 1);
  }
}

function updateTrail(p) {
  if (!p.trail) return;
  const { positions, maxPoints } = p.trail;

  positions.copyWithin(0, 3, maxPoints * 3);
  const lastIdx = (maxPoints - 1) * 3;
  positions[lastIdx] = p.localPos.x;
  positions[lastIdx + 1] = p.localPos.y;
  positions[lastIdx + 2] = p.localPos.z;
  p.trail.line.geometry.attributes.position.needsUpdate = true;
}
const _scratchA = new THREE.Vector3();
const _scratchB = new THREE.Vector3();
const _scratchC = new THREE.Vector3();

export function pullBall(pivots, index, options = {}) {
  const p = pivots[index];
  if (!p) return;

  const { swingDegrees = 0, depthDegrees = 0 } = options;
  const theta = (swingDegrees * Math.PI) / 180;
  const phi = (depthDegrees * Math.PI) / 180;
  const cosPhi = Math.cos(phi);

  p.localPos.set(
    p.length * cosPhi * Math.sin(theta),
    -p.length * cosPhi * Math.cos(theta),
    p.length * Math.sin(phi)
  );
  p.localVel.set(0, 0, 0);
  p._dragFrames = 0;
  p._prevLocalPos = p.localPos.clone();
}
