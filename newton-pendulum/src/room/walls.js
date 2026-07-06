import * as THREE from 'three';
import { scene } from '../core/scene.js';

export function createRoom() {

  const textureLoader = new THREE.TextureLoader();

  const floorDiffuse = textureLoader.load('/textures/floor_diff.jpg');
  const floorNormal = textureLoader.load('/textures/floor_normal.jpg');
  const floorRoughness = textureLoader.load('/textures/floor_rough.jpg');
  const floorDisplacement = textureLoader.load('/textures/floor_disp.jpg');

  [floorDiffuse, floorNormal, floorRoughness, floorDisplacement].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
      map: floorDiffuse,
      normalMap: floorNormal,
      roughnessMap: floorRoughness,
      displacementMap: floorDisplacement,
      displacementScale: 0.035,
      color: 0xe8d5b5,
      roughness: 1,
      side: THREE.DoubleSide, 
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  floor.receiveShadow = true;
  scene.add(floor);


  const rugDiffuse = textureLoader.load('/textures/rug_diff.jpg');
  const rugNormal = textureLoader.load('/textures/rug_normal.jpg');
  const rugRoughness = textureLoader.load('/textures/rug_rough.jpg');
  const rugDisplacement = textureLoader.load('/textures/rug_disp.jpg');

  [rugDiffuse, rugNormal, rugRoughness, rugDisplacement].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2); 
  });


  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 6, 80, 60),
    new THREE.MeshStandardMaterial({
      map: rugDiffuse,
      normalMap: rugNormal,
      roughnessMap: rugRoughness,
      displacementMap: rugDisplacement,
      displacementScale: 0.045,
      color: 0xcdbfa8,
      roughness: 1,
    })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, -1.99, 0.5); 
  rug.receiveShadow = true;
  scene.add(rug);


  const wallDiffuse = textureLoader.load('/textures/wall_diff.jpg');
  const wallNormal = textureLoader.load('/textures/wall_normal.jpg');
  const wallRoughness = textureLoader.load('/textures/wall_rough.jpg');
  const wallDisplacement = textureLoader.load('/textures/wall_disp.jpg');

  [wallDiffuse, wallNormal, wallRoughness, wallDisplacement].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1.5);
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallDiffuse,
    normalMap: wallNormal,
    roughnessMap: wallRoughness,
    displacementMap: wallDisplacement,
    displacementScale: 0.02, 
    color: 0xf3e2c8,  
    roughness: 1,
    metalness: 0.0,
    side: THREE.DoubleSide, 
  });


  const WALL_SEGMENTS_X = 60;
  const WALL_SEGMENTS_Y = 30;


  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10, WALL_SEGMENTS_X, WALL_SEGMENTS_Y),
    wallMaterial
  );
  backWall.position.set(0, 3, -5);
  backWall.receiveShadow = true;
  scene.add(backWall);


  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10, WALL_SEGMENTS_X, WALL_SEGMENTS_Y),
    wallMaterial
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(10, 3, 0);
  rightWall.receiveShadow = true;
  scene.add(rightWall);


  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10, WALL_SEGMENTS_X, WALL_SEGMENTS_Y),
    wallMaterial
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-10, 3, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

 

  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10, WALL_SEGMENTS_X, WALL_SEGMENTS_Y),
    wallMaterial
  );
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, 3, 10);
  frontWall.receiveShadow = true;
  scene.add(frontWall);


  const baseboardMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c4632,
    roughness: 0.6,
  });
  const baseboardHeight = 0.35;
  const baseboardThickness = 0.08;
  const baseboardY = -2 + baseboardHeight / 2;

  const backBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(20, baseboardHeight, baseboardThickness),
    baseboardMaterial
  );
  backBaseboard.position.set(0, baseboardY, -5 + baseboardThickness / 2);
  backBaseboard.receiveShadow = true;
  scene.add(backBaseboard);

  const rightBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardThickness, baseboardHeight, 20),
    baseboardMaterial
  );
  rightBaseboard.position.set(10 - baseboardThickness / 2, baseboardY, 0);
  rightBaseboard.receiveShadow = true;
  scene.add(rightBaseboard);

  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardThickness, baseboardHeight, 20),
    baseboardMaterial
  );
  leftBaseboard.position.set(-10 + baseboardThickness / 2, baseboardY, 0);
  leftBaseboard.receiveShadow = true;
  scene.add(leftBaseboard);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      color: 0xf7f0e6, 
      roughness: 1,
      side: THREE.DoubleSide
    })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8;
  scene.add(ceiling);


  const coveMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffb066,
    emissiveIntensity: 3.2,
  });
  const coveHeight = 0.12;
  const coveInset = 0.15;

  const backCove = new THREE.Mesh(new THREE.BoxGeometry(19.5, coveHeight, coveHeight), coveMaterial);
  backCove.position.set(0, 8 - coveInset, -5 + coveInset);
  scene.add(backCove);

  const rightCove = new THREE.Mesh(new THREE.BoxGeometry(coveHeight, coveHeight, 19.5), coveMaterial);
  rightCove.position.set(10 - coveInset, 8 - coveInset, 0);
  scene.add(rightCove);

  const leftCove = new THREE.Mesh(new THREE.BoxGeometry(coveHeight, coveHeight, 19.5), coveMaterial);
  leftCove.position.set(-10 + coveInset, 8 - coveInset, 0);
  scene.add(leftCove);


  const coveGlow1 = new THREE.PointLight(0xffb066, 0.5, 8);
  coveGlow1.position.set(0, 7.7, -4.7);
  scene.add(coveGlow1);

  const coveGlow2 = new THREE.PointLight(0xffb066, 0.4, 8);
  coveGlow2.position.set(8, 7.7, -2);
  scene.add(coveGlow2);

  const coveGlow3 = new THREE.PointLight(0xffb066, 0.4, 8);
  coveGlow3.position.set(-8, 7.7, -2);
  scene.add(coveGlow3);


  const fixtureRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.3 })
  );
  fixtureRim.position.set(0, 7.96, 1.5);
  scene.add(fixtureRim);

  const fixtureDiffuser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 0.03, 32),
    new THREE.MeshStandardMaterial({
      color: 0xfff4e0,
      emissive: 0xffedc7,
      emissiveIntensity: 1.8,
    })
  );
  fixtureDiffuser.position.set(0, 7.9, 1.5);
  scene.add(fixtureDiffuser);


  const ceilingLight = new THREE.SpotLight(0xffe8c9, 1.1, 14, Math.PI / 4, 0.6, 1.2);
  ceilingLight.position.set(0, 7.9, 1.5);
  ceilingLight.target.position.set(0, -2, 1.5);
  scene.add(ceilingLight);
  scene.add(ceilingLight.target);
}
