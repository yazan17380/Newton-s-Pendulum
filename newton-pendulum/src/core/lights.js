import * as THREE from 'three';
import { scene } from './scene.js';

export function setupLights(renderer) {

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;


  const ambient = new THREE.AmbientLight(0xffe4c9, 0.58);
  scene.add(ambient);


  const keyLight = new THREE.DirectionalLight(0xffd2a3, 1.45);
  keyLight.position.set(4, 6, 6);
  keyLight.castShadow = true;
  keyLight.shadow.radius = 8;

  keyLight.shadow.mapSize.set(2048, 2048);


  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 16;
  keyLight.shadow.camera.left = -4;
  keyLight.shadow.camera.right = 4;
  keyLight.shadow.camera.top = 4;
  keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.bias = -0.0015;
  scene.add(keyLight);


  const fillLight = new THREE.DirectionalLight(0xfff2e3, 0.35);
  fillLight.position.set(-4, 3, 5);
  scene.add(fillLight);


  const rim = new THREE.PointLight(0xffe6c7, 0.75);
  rim.position.set(0, 5.5, -3);
  scene.add(rim);


  const spot = new THREE.SpotLight(0xffe0c0, 1.8, 25, Math.PI / 5, 0.35, 1);
  spot.position.set(0, 8, 1);
  spot.target.position.set(0, 3.5, -5);
  spot.castShadow = true;
  spot.shadow.radius = 10;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.bias = -0.0015;
  scene.add(spot);
  scene.add(spot.target);

  const sideRight = new THREE.PointLight(0xffe8c9, 0.55);
  sideRight.position.set(7, 4, 0);
  scene.add(sideRight);

  const sideLeft = new THREE.PointLight(0xffe8c9, 0.45);
  sideLeft.position.set(-7, 4, 0);
  scene.add(sideLeft);

  const bounce = new THREE.PointLight(0xffe8c9, 0.22);
  bounce.position.set(0, -1, 0);
  scene.add(bounce);
}
