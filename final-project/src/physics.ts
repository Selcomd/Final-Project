import * as CANNON from "cannon-es";

export let physicsWorld: CANNON.World;

export function initPhysics() {
  physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0)
  });
}
