import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/scene.js';


const textureLoader = new THREE.TextureLoader();
const woodDiffuse = textureLoader.load('/textures/floor_diff.jpg');
const woodNormal = textureLoader.load('/textures/floor_normal.jpg');
const woodRoughness = textureLoader.load('/textures/floor_rough.jpg');
[woodDiffuse, woodNormal, woodRoughness].forEach((tex) => {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
});


const TABLE_POSITION = { x: 0, y: -2, z: 0 };

const TABLE_TARGET_HEIGHT = 1.1;

export function createDesk() {


  const tableFillLight = new THREE.PointLight(0xfff0dd, 0.9, 6);
  tableFillLight.position.set(0, -0.3, 2.2);
  scene.add(tableFillLight);

  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    '/models/table.gltf',
    (gltf) => {
      const model = gltf.scene;

      

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const scale = TABLE_TARGET_HEIGHT / (size.y || 1);
      model.scale.setScalar(scale);

      

      const finalBox = new THREE.Box3().setFromObject(model);
      const bottomY = finalBox.min.y;
      const centerX = (finalBox.min.x + finalBox.max.x) / 2;
      const centerZ = (finalBox.min.z + finalBox.max.z) / 2;

      model.position.set(
        TABLE_POSITION.x - centerX,
        TABLE_POSITION.y - bottomY,
        TABLE_POSITION.z - centerZ
      );

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          

          const materials = Array.isArray(child.material) ? child.material : [child.material];

          materials.forEach((mat) => {
            if (mat && mat.color) {
              const luminance = mat.color.r * 0.3 + mat.color.g * 0.59 + mat.color.b * 0.11;
              if (luminance < 0.15) {

                mat.color.set(0x3a3a3a);
                mat.map = null;

                mat.roughness = 0.85;
                mat.metalness = 0.1;

                

                mat.emissive = new THREE.Color(0x1a1a1a);
                mat.emissiveIntensity = 1;

                

                mat.aoMap = null;
                mat.aoMapIntensity = 0;
                mat.lightMap = null;
                mat.lightMapIntensity = 0;

                mat.needsUpdate = true;
              }
            }
          });
        }
      });

      scene.add(model);
    },
    undefined,
    () => {

      console.warn('');
      createProceduralDesk();
    }
  );
}

function createProceduralDesk() {
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.2, 2),
    new THREE.MeshStandardMaterial({
      map: woodDiffuse,
      normalMap: woodNormal,
      roughnessMap: woodRoughness,
      color: 0xe8d5b5,
      roughness: 1,
      metalness: 0.05
    })
  );
  top.position.set(0, -1, 0);
  scene.add(top);
  top.castShadow = true;
  top.receiveShadow = true;

  function leg(x, z) {
    const legMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1.5, 0.15),
      new THREE.MeshStandardMaterial({
        map: woodDiffuse,
        normalMap: woodNormal,
        roughnessMap: woodRoughness,
        color: 0xe8d5b5,
        roughness: 1,
      })
    );
    legMesh.position.set(x, -1.75, z);
    scene.add(legMesh);
    legMesh.castShadow = true;
    legMesh.receiveShadow = true;
  }

  leg(1.8, 0.9);
  leg(-1.8, 0.9);
  leg(1.8, -0.9);
  leg(-1.8, -0.9);
}
