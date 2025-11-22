import * as CANNON from "cannon-es";
import { initRenderer, renderLoop } from "./renderer";
import { initPhysics, physicsWorld } from "./physics";
import { ballBody, goalBody, goalReached, setupGameObjects } from "./game";

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

  const vx = ballBody.velocity.x;
  const vy = ballBody.velocity.y;
  const vz = ballBody.velocity.z;

  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    ballBody.velocity.x *= scale;
    ballBody.velocity.y *= scale;
    ballBody.velocity.z *= scale;
  }
}

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

  function loop() {
    applyPlayerForces();
    physicsWorld.step(1 / 60);
    renderLoop();

    if (!goalReached && ballBody.position.distanceTo(goalBody.position) < 1.0) {
      showWinText();
    }

    requestAnimationFrame(loop);
  }

  loop();
}

main();
