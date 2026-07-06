import * as THREE from 'three';
import { scene } from '../core/scene.js';

export function createPen() {

  const group = new THREE.Group();
  scene.add(group);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x1e3aff })
  );
  body.rotation.z = Math.PI / 4;
  group.add(body);
  body.castShadow = true;


  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.15, 32),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  tip.position.set(0.45, -0.55, 0);
  tip.rotation.z = Math.PI / 4;
  group.add(tip);
  tip.castShadow = true;


  group.position.set(-0.1, -0.95, 0.2);
}
