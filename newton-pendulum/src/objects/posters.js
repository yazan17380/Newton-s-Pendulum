import * as THREE from 'three';
import { scene } from '../core/scene.js';

export function createPosters() {

  const loader = new THREE.TextureLoader();


  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.35,
    metalness: 0.2,
  });


  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.06,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });


  const bigPosterTexture = loader.load('/textures/poster_newton_laws.jpg');

  const bigFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    frameMaterial
  );
  bigFrame.position.set(-3, 4, -4.9);
  bigFrame.castShadow = true;
  scene.add(bigFrame);

  const bigPoster = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 1.8),
    new THREE.MeshStandardMaterial({
      map: bigPosterTexture,
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );

  bigPoster.position.set(-3, 4, -4.82);
  scene.add(bigPoster);

  const bigGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.9), glassMaterial);
  bigGlass.position.set(-3, 4, -4.8);
  scene.add(bigGlass);


  const smallPosterTexture = loader.load('/textures/poster_cradle.jpg');

  const smallFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2.5, 0.1),
    frameMaterial
  );
  smallFrame.position.set(2.5, 4, -4.9);
  smallFrame.castShadow = true;
  scene.add(smallFrame);

  const smallPoster = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.3),
    new THREE.MeshStandardMaterial({
      map: smallPosterTexture,
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  smallPoster.position.set(2.5, 4, -4.82);
  scene.add(smallPoster);

  const smallGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.4), glassMaterial);
  smallGlass.position.set(2.5, 4, -4.8);
  scene.add(smallGlass);
}
