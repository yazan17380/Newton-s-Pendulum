import * as THREE from 'three';
import { scene } from '../core/scene.js';

const loader = new THREE.TextureLoader();


const woodDiffuse = loader.load('/textures/floor_diff.jpg');
const woodNormal = loader.load('/textures/floor_normal.jpg');
const woodRoughness = loader.load('/textures/floor_rough.jpg');
[woodDiffuse, woodNormal, woodRoughness].forEach((tex) => {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 0.5);
});

export function createShelves() {


  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.25, 1.2),
    new THREE.MeshStandardMaterial({
      map: woodDiffuse,
      normalMap: woodNormal,
      roughnessMap: woodRoughness,
      color: 0xe8d5b5,
      roughness: 1,
    })
  );
  shelf.position.set(0, 5.7, -4.5);
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  scene.add(shelf);

  

  const globeTex = loader.load('/textures/globe.jpg');
  const globeGroup = new THREE.Group();

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
      map: globeTex,
      

      metalness: 0,
      roughness: 0.6,
    })
  );
  globe.castShadow = true;
  globeGroup.add(globe);


  const axisMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.7, roughness: 0.3 });
  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.25, 12), axisMat);
  globeGroup.add(axis);


  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.02, 8, 48),
    axisMat
  );
  ring.rotation.x = Math.PI / 2;
  globeGroup.add(ring);


  const standBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.12, 24),
    new THREE.MeshStandardMaterial({ map: woodDiffuse, color: 0xe8d5b5, roughness: 0.8 })
  );
  standBase.position.y = -0.62;
  globeGroup.add(standBase);

  globeGroup.rotation.z = THREE.MathUtils.degToRad(23);
  globeGroup.position.set(-2.2, 6.5, -4.5);
  globeGroup.traverse((c) => { if (c.isMesh) c.castShadow = true; });
  scene.add(globeGroup);

  

  const molecule = new THREE.Group();


  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.4 });
  const hydrogenMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });
  const bondMat = new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 0.1, roughness: 0.5 });

  function atom(x, y, z, mat, radius) {
    const a = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), mat);
    a.position.set(x, y, z);
    a.castShadow = true;
    molecule.add(a);
    return a;
  }

  function bond(start, end) {
    const dist = start.distanceTo(end);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, dist, 12), bondMat);
    cyl.position.copy(start.clone().add(end).divideScalar(2));
    cyl.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.clone().sub(start).normalize()
    );
    cyl.castShadow = true;
    molecule.add(cyl);
  }


  const center = new THREE.Vector3(0, 0, 0);
  const bondLength = 0.42;
  const tetrahedralDirs = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(-1, -1, 1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(1, -1, -1),
  ];

  atom(0, 0, 0, carbonMat, 0.22);
  tetrahedralDirs.forEach((dir) => {
    const pos = dir.clone().normalize().multiplyScalar(bondLength);
    atom(pos.x, pos.y, pos.z, hydrogenMat, 0.14);
    bond(center, pos);
  });

  molecule.position.set(0.5, 6.35, -4.5);
  molecule.scale.setScalar(1.3);
  scene.add(molecule);

  

  function book(x, y, z, color, width, height, depth, tilt) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02 })
    );
    b.position.set(x, y, z);
    b.rotation.y = tilt;
    b.castShadow = true;
    b.receiveShadow = true;
    scene.add(b);
    return height;
  }

  let stackY = 5.825;
  const bookSpecs = [
    { color: 0x6b1f2a, height: 0.22, tilt: 0.01 },  
    { color: 0x1f3a5f, height: 0.24, tilt: -0.015 }, 
    { color: 0x2f5233, height: 0.2, tilt: 0.02 },   
  ];

  bookSpecs.forEach((spec) => {
    stackY += spec.height / 2;
    book(2.2, stackY, -4.5, spec.color, 0.82, spec.height, 1.15, spec.tilt);
    stackY += spec.height / 2;
  });
}
