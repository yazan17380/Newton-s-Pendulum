import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/scene.js';

const PLANT_POSITION = { x: -8, y: -2, z: -4 };
const PLANT_TARGET_HEIGHT = 4.5;

export function createBigTree() {



  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    '/models/plant.gltf',
    (gltf) => {
      const model = gltf.scene;


      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const scale = PLANT_TARGET_HEIGHT / (size.y || 1);
      model.scale.setScalar(scale);


      const scaledBox = new THREE.Box3().setFromObject(model);
      const bottomY = scaledBox.min.y;

      model.position.set(
        PLANT_POSITION.x,
        PLANT_POSITION.y - bottomY,
        PLANT_POSITION.z
      );

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
      createFallbackPlant();
    }
  );
}

function createFallbackPlant() {
  const textureLoader = new THREE.TextureLoader();

  const potHeight = 0.7;
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.9, potHeight, 32),
    new THREE.MeshStandardMaterial({ color: 0xc8b39a })
  );
  pot.position.set(PLANT_POSITION.x, PLANT_POSITION.y + potHeight / 2, PLANT_POSITION.z);
  pot.castShadow = true;
  pot.receiveShadow = true;
  scene.add(pot);

  for (let i = 0; i < 60; i++) {
    const stone = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );
    stone.position.set(
      PLANT_POSITION.x + (Math.random() - 0.5) * 0.8,
      PLANT_POSITION.y + potHeight + Math.random() * 0.15,
      PLANT_POSITION.z + (Math.random() - 0.5) * 0.8
    );
    scene.add(stone);
  }

  const plantTexture = textureLoader.load('/textures/leaf .png');
  const plant = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 6),
    new THREE.MeshStandardMaterial({
      map: plantTexture,
      transparent: true,
      side: THREE.DoubleSide
    })
  );
  plant.position.set(PLANT_POSITION.x, PLANT_POSITION.y + potHeight + 2.7, PLANT_POSITION.z);
  plant.castShadow = true;
  scene.add(plant);
}
