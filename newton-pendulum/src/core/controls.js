import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.08;


  controls.target.set(0, -0.2, 0);

  controls.minDistance = 1.8;
  controls.maxDistance = 6.5;



  controls.maxPolarAngle = Math.PI / 2 + 0.15;

  controls.minPolarAngle = 0.35;


  controls.minAzimuthAngle = -Math.PI * 0.4;
  controls.maxAzimuthAngle = Math.PI * 0.4;

  controls.update();
  return controls;
}
