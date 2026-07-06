import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/scene.js';

const CLOCK_DESIRED_POSITION = { x: 4.3, y: -2, z: -4 };
const CLOCK_TARGET_HEIGHT = 5.5;
const WALL_MARGIN = 0.4;
const BACK_WALL_Z = -5;

export function createGrandfatherClock() {

  const gltfLoader = new GLTFLoader();


  gltfLoader.load(
    '/models/clock/grandfather_clock.gltf',
    (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const scale = CLOCK_TARGET_HEIGHT / (size.y || 1);
      model.scale.setScalar(scale);
      model.rotation.y = -Math.PI / 2;

      const finalBox = new THREE.Box3().setFromObject(model);
      const bottomY = finalBox.min.y;


      const maxSafeZ = (BACK_WALL_Z + WALL_MARGIN) - finalBox.min.z;
      const finalZ = Math.max(CLOCK_DESIRED_POSITION.z, maxSafeZ);

      model.position.set(CLOCK_DESIRED_POSITION.x, CLOCK_DESIRED_POSITION.y - bottomY, finalZ);

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model);
    },
    undefined,
    () => {
      console.warn('');
    }
  );
}
