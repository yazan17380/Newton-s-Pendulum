import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();


import { scene } from './core/scene.js';
import { camera } from './core/camera.js';
import { renderer } from './core/renderer.js';
import { setupLights } from './core/lights.js';
import { updatePendulumPhysics, pullBall, resetPendulum, setTrailsEnabled } from './core/physics.js';
import { setupPendulumInteraction } from './core/interaction.js';
import { createControls } from './core/controls.js';
import { playCollisionSound } from './core/sound.js';
import { createHUD, updateHUD, setEnergyBaseline } from './core/hud.js';
import { createControlPanel } from './core/controlPanel.js';
import { setupPostProcessing, resizePostProcessing } from './core/postprocessing.js';

import { createRoom } from './room/walls.js';
import { createDesk } from './objects/desk.js';
import { createPendulum } from './objects/pendulum.js';
import { createPosters } from './objects/posters.js';
import { createShelves } from './objects/shelves.js';
import { createNotebook } from './objects/notebook.js';
import { createPen } from './objects/pen.js';
import { createBigTree } from './objects/BigTree.js';
import { createArmchair } from './objects/armchair.js';
import { createGrandfatherClock } from './objects/grandfatherClock.js';
import { createReadingNook } from './objects/readingNook.js';


setupLights(renderer);

createRoom();

createDesk();

let { group: pendulumGroup, pivots: pendulumPivots } = createPendulum();

const controls = createControls(camera, renderer.domElement);

let isPaused = false;
let collisionCount = 0;
let simulationSpeed = 1.0;
let trailsEnabledState = false;

const { composer, bloomPass } = setupPostProcessing(renderer, scene, camera);

const introStartPosition = new THREE.Vector3(0, 6, 13);
const introEndPosition = camera.position.clone();
camera.position.copy(introStartPosition);
controls.enabled = false; 

let introElapsed = 0;
const INTRO_DURATION = 2.2; 
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

const interaction = setupPendulumInteraction(pendulumPivots, camera, renderer.domElement, controls);

function resetSimulation() {
  resetPendulum(pendulumPivots);
  setEnergyBaseline(pendulumPivots);
  collisionCount = 0;
}

document.getElementById('reset-btn').addEventListener('click', resetSimulation);

createHUD(pendulumPivots);
setEnergyBaseline(pendulumPivots); 

function rebuildPendulum({ ballCount, radius }) {

  pendulumGroup.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
  scene.remove(pendulumGroup);

  const rebuilt = createPendulum(ballCount, radius);
  pendulumGroup = rebuilt.group;
  pendulumPivots = rebuilt.pivots;

  setTrailsEnabled(pendulumPivots, trailsEnabledState);

  interaction.setPivots(pendulumPivots);
  createHUD(pendulumPivots);
  setEnergyBaseline(pendulumPivots);
  collisionCount = 0;
}

function pullPreset(direction, count, angleDeg) {
  const n = pendulumPivots.length;
  const sign = direction === 'right' ? 1 : -1;
  const indices =
    direction === 'right'
      ? Array.from({ length: Math.min(count, n) }, (_, k) => n - 1 - k)
      : Array.from({ length: Math.min(count, n) }, (_, k) => k);

  for (const idx of indices) {
    pullBall(pendulumPivots, idx, { swingDegrees: sign * angleDeg, depthDegrees: 0 });
  }
}

createControlPanel({
  initialBallCount: pendulumPivots.length,
  initialRadius: pendulumPivots[0].radius,
  onGeometryChange: rebuildPendulum,
  onPauseToggle: (paused) => {
    isPaused = paused;
  },
  onPullPreset: pullPreset,
  onReset: resetSimulation,
  onTrailsToggle: (enabled) => {
    trailsEnabledState = enabled;
    setTrailsEnabled(pendulumPivots, enabled);
  },
  onSimSpeedChange: (speed) => {
    simulationSpeed = speed;
  },
});

createPosters();

createShelves();

createBigTree();
createArmchair();
createGrandfatherClock();
createReadingNook();





window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizePostProcessing(composer, bloomPass);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const scaledDeltaTime = deltaTime * simulationSpeed;

  if (!isPaused) {
    updatePendulumPhysics(pendulumPivots, scaledDeltaTime, (impactSpeed) => {
      playCollisionSound(impactSpeed / 4);
      collisionCount += 1;
    });
  }

  updateHUD(pendulumPivots, collisionCount);

  if (introElapsed < INTRO_DURATION) {
    introElapsed += deltaTime;
    const t = Math.min(introElapsed / INTRO_DURATION, 1);
    camera.position.lerpVectors(introStartPosition, introEndPosition, easeOutCubic(t));
    if (t >= 1) {
      controls.enabled = true;
    }
  }

  controls.update();

  composer.render();
}

animate();
