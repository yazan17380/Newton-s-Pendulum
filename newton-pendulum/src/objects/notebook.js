import * as THREE from 'three';
import { scene } from '../core/scene.js';

export function createNotebook() {

  const group = new THREE.Group();
  scene.add(group);

  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.08, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b })
  );
  group.add(cover);
  cover.castShadow = true;


  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.06, 1.75),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  pages.position.y = 0.03;
  group.add(pages);
  pages.receiveShadow = true;


  group.position.set(-0.8, -0.95, 0.6);
  group.rotation.y = Math.PI / 10;
}
