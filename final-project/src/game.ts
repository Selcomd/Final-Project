import * as THREE from "three";
import * as CANNON from "cannon-es";

import { scene } from "./renderer";
import { physicsWorld } from "./physics";

export let ballBody: CANNON.Body;
export let ballMesh: THREE.Mesh;

export let goalBody: CANNON.Body;
export let goalMesh: THREE.Mesh;
export let goalReached = false;

export function setupGameObjects() {
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 10),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  floorMesh.position.y = -0.5;
  scene.add(floorMesh);

  const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -0.5, 0),
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5)),
  });
  physicsWorld.addBody(floorBody);

  function makeWall(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number
  ) {
    const wallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    wallMesh.position.set(x, y, z);
    scene.add(wallMesh);

    const wallBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(x, y, z),
      shape: new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)),
    });
    physicsWorld.addBody(wallBody);
  }

  const wallThickness = 0.5;
  const wallHeight = 2;

  makeWall(
    0,
    wallHeight / 2,
    -5 + wallThickness / 2,
    10,
    wallHeight,
    wallThickness
  );
  makeWall(
    0,
    wallHeight / 2,
    5 - wallThickness / 2,
    10,
    wallHeight,
    wallThickness
  );
  makeWall(
    -5 + wallThickness / 2,
    wallHeight / 2,
    0,
    wallThickness,
    wallHeight,
    10
  );
  makeWall(
    5 - wallThickness / 2,
    wallHeight / 2,
    0,
    wallThickness,
    wallHeight,
    10
  );

  ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshStandardMaterial({ color: 0xff3333 })
  );
  scene.add(ballMesh);

  ballBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(0.5),
    position: new CANNON.Vec3(0, 5, 0),
    angularDamping: 0.3,
  });
  physicsWorld.addBody(ballBody);

  goalMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.2, 1.5),
    new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x003300,
    })
  );
  goalMesh.position.set(0, 0.1, -4);
  scene.add(goalMesh);

  goalBody = new CANNON.Body({
    mass: 0,
    collisionResponse: false,
    position: new CANNON.Vec3(0, 0.1, -4),
    shape: new CANNON.Box(new CANNON.Vec3(0.75, 0.1, 0.75)),
  });
  physicsWorld.addBody(goalBody);

  function sync() {
    ballMesh.position.copy(ballBody.position);
    requestAnimationFrame(sync);
  }
  sync();

  const light = new THREE.DirectionalLight(0xffffff, 1.4);
  light.position.set(5, 10, 5);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0x404040));
}
