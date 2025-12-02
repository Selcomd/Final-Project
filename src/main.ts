import * as THREE from "three";
import * as CANNON from "cannon-es";

import { initRenderer, renderLoop, scene, camera, renderer } from "./renderer";
import { initPhysics, physicsWorld } from "./physics";
import {
  ballBody,
  goalBody,
  setupGameObjects,
  handleObjectClick,
  updateGameLogic,
  isBoxUnlocked,
  dragBoxTo,
} from "./game";

const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function applyPlayerForces() {
  if (!ballBody) return;

  const force = 2;
  const maxSpeed = 7;

  if (keys["w"] || keys["arrowup"]) {
    ballBody.applyForce(new CANNON.Vec3(0, 0, -force), ballBody.position);
  }
  if (keys["s"] || keys["arrowdown"]) {
    ballBody.applyForce(new CANNON.Vec3(0, 0, force), ballBody.position);
  }
  if (keys["a"] || keys["arrowleft"]) {
    ballBody.applyForce(new CANNON.Vec3(-force, 0, 0), ballBody.position);
  }
  if (keys["d"] || keys["arrowright"]) {
    ballBody.applyForce(new CANNON.Vec3(force, 0, 0), ballBody.position);
  }

  const v = ballBody.velocity;
  const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    v.x *= scale;
    v.y *= scale;
    v.z *= scale;
  }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject: THREE.Object3D | null = null;
let isDraggingBox = false;

window.addEventListener("mousemove", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (isDraggingBox) {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const point = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, point)) {
      dragBoxTo(point.x, point.z);
    }
  }

  const intersects = raycaster.intersectObjects(scene.children, true);

  let newHover: THREE.Object3D | null = null;

  for (const hit of intersects) {
    const obj = hit.object;
    const data = (obj as any).userData || {};
    if (data.interactive) {
      newHover = obj;
      break;
    }
  }

  if (hoveredObject !== newHover) {
    if (hoveredObject && hoveredObject instanceof THREE.Mesh) {
      hoveredObject.scale.set(1, 1, 1);
    }

    hoveredObject = newHover;

    if (hoveredObject && hoveredObject instanceof THREE.Mesh) {
      hoveredObject.scale.set(1.1, 1.1, 1.1);
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  }
});

window.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const data = (hit as any).userData || {};

    handleObjectClick(hit);

    if (data.type === "box" && isBoxUnlocked()) {
      isDraggingBox = true;
    }
  }
});

window.addEventListener("mouseup", (event) => {
  if (event.button === 0) {
    isDraggingBox = false;
  }
});

function showWinText() {
  const div = document.createElement("div");
  div.innerText = "Puzzle Complete!";
  div.style.position = "absolute";
  div.style.top = "40%";
  div.style.width = "100%";
  div.style.fontSize = "48px";
  div.style.textAlign = "center";
  div.style.color = "white";
  div.style.fontFamily = "sans-serif";
  document.body.appendChild(div);
}

function main() {
  initRenderer();
  initPhysics();
  setupGameObjects();

  let alreadyWon = false;

  function loop() {
    applyPlayerForces();
    physicsWorld.step(1 / 60);

    updateGameLogic();
    renderLoop();

    if (!alreadyWon && goalBody) {
      const distance = ballBody.position.distanceTo(goalBody.position);
      if (distance < 1.0) {
        alreadyWon = true;
        showWinText();
      }
    }

    requestAnimationFrame(loop);
  }

  loop();
}

main();
