import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/scene.js';

const TABLE_POSITION = { x: -8.5, y: -2, z: 0 };
const TABLE_TARGET_HEIGHT = 1.3;

const LAMP_TARGET_HEIGHT = 1.1;
const VASE_TARGET_HEIGHT = 0.55;

export function createReadingNook() {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    '/models/side_table.gltf',
    (gltf) => {
      const table = gltf.scene;

      const box = new THREE.Box3().setFromObject(table);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scale = TABLE_TARGET_HEIGHT / (size.y || 1);
      table.scale.setScalar(scale);

      const finalBox = new THREE.Box3().setFromObject(table);
      const bottomY = finalBox.min.y;
      const centerX = (finalBox.min.x + finalBox.max.x) / 2;
      const centerZ = (finalBox.min.z + finalBox.max.z) / 2;

      table.position.set(
        TABLE_POSITION.x - centerX,
        TABLE_POSITION.y - bottomY,
        TABLE_POSITION.z - centerZ
      );

      table.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(table);

      const worldBox = new THREE.Box3().setFromObject(table);
      const topY = worldBox.max.y;
      const spread = (worldBox.max.x - worldBox.min.x) / 4;

      loadOnTop('/models/table_lamp.gltf', LAMP_TARGET_HEIGHT, TABLE_POSITION.x - spread, topY, TABLE_POSITION.z);
      loadOnTop('/models/vase.gltf', VASE_TARGET_HEIGHT, TABLE_POSITION.x + spread, topY, TABLE_POSITION.z);
    },
    undefined,
    () => {
      console.warn('');
    }
  );
}


function loadOnTop(path, targetHeight, x, surfaceY, z) {
  const loader = new GLTFLoader();

  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scale = targetHeight / (size.y || 1);
      model.scale.setScalar(scale);

      const finalBox = new THREE.Box3().setFromObject(model);
      const bottomY = finalBox.min.y;
      const centerX = (finalBox.min.x + finalBox.max.x) / 2;
      const centerZ = (finalBox.min.z + finalBox.max.z) / 2;

      model.position.set(x - centerX, surfaceY - bottomY, z - centerZ);

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
      console.warn(``);
    }
  );
}
