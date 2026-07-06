import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/scene.js';


const CHAIR_DESIRED_POSITION = { x: 8, y: -2, z: -4 };
const CHAIR_TARGET_HEIGHT = 2.2;
const WALL_MARGIN = 0.4;

const RIGHT_WALL_X = 10;
const BACK_WALL_Z = -5;

export function createArmchair() {

  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    '/models/armchair.gltf',
    (gltf) => {
      const model = gltf.scene;


      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const scale = CHAIR_TARGET_HEIGHT / (size.y || 1);
      model.scale.setScalar(scale);


      model.rotation.y = -Math.PI / 4;


      const finalBox = new THREE.Box3().setFromObject(model);
      const bottomY = finalBox.min.y;


      const maxSafeX = (RIGHT_WALL_X - WALL_MARGIN) - finalBox.max.x;
      const maxSafeZ = (BACK_WALL_Z + WALL_MARGIN) - finalBox.min.z;

      const finalX = Math.min(CHAIR_DESIRED_POSITION.x, maxSafeX);
      const finalZ = Math.max(CHAIR_DESIRED_POSITION.z, maxSafeZ);

      model.position.set(finalX, CHAIR_DESIRED_POSITION.y - bottomY, finalZ);

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
