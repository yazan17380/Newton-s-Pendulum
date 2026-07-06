import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export const scene = new THREE.Scene();


const rgbeLoader = new RGBELoader();
rgbeLoader.load('/textures/studio_small_08_1k.hdr', (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr;
});



scene.environmentRotation = new THREE.Euler(1.0, 0, 0);


scene.fog = new THREE.Fog(0xf3e2c8, 14, 28);
