import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();


import { scene } from './core/scene.js';
import { camera } from './core/camera.js';
import { renderer } from './core/renderer.js';
import { setupLights } from './core/lights.js';
import { updatePendulumPhysics, pullBall, resetPendulum } from './core/physics.js';
import { setupPendulumInteraction } from './core/interaction.js';
import { createControls } from './core/controls.js';
import { playCollisionSound } from './core/sound.js';
import { createHUD, updateHUD } from './core/hud.js';
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


document.getElementById('reset-btn').addEventListener('click', () => {
  resetPendulum(pendulumPivots);
});


createHUD(pendulumPivots.length);


function rebuildPendulum(newBallCount) {

  pendulumGroup.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
  scene.remove(pendulumGroup);

  const rebuilt = createPendulum(newBallCount);
  pendulumGroup = rebuilt.group;
  pendulumPivots = rebuilt.pivots;


  interaction.setPivots(pendulumPivots);
  createHUD(pendulumPivots.length);
}


createControlPanel({
  initialBallCount: pendulumPivots.length,
  onBallCountChange: rebuildPendulum,
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

  updatePendulumPhysics(pendulumPivots, deltaTime, (impactSpeed) => {
    playCollisionSound(impactSpeed / 4);
  });

  updateHUD(pendulumPivots);


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
