import * as THREE from "three";
import * as CANNON from "cannon-es";

import { scene } from "./renderer";
import { physicsWorld } from "./physics";

export let ballBody: CANNON.Body;
export let ballMesh: THREE.Mesh;

export let goalBody: CANNON.Body | null = null;
export let goalMesh: THREE.Mesh | null = null;
export let goalReached = false;

type RoomName = "main" | "middle" | "final";

let currentRoom: RoomName = "main";

const COLORS = {
  floorMain: 0x1f2933,
  floorMiddle: 0x202734,
  floorFinalFront: 0x111827,
  floorFinalBack: 0x111827,
  wall: 0x374151,
  key: 0xffd54f,
  doorUsable: 0x22c55e,
  doorLocked: 0xef4444,
  box: 0x8d6e63,
  buttonOff: 0x6b7280,
  buttonOn: 0x22c55e,
  rope: 0xcbd5e1,
  goal: 0x34d399,
};

let inventory: string[] = [];
let inventoryDiv: HTMLDivElement | null = null;

function ensureInventoryUI() {
  if (inventoryDiv) return;
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.left = "10px";
  div.style.top = "10px";
  div.style.color = "white";
  div.style.fontFamily = "sans-serif";
  div.style.fontSize = "16px";
  div.style.background = "rgba(15,23,42,0.7)";
  div.style.padding = "6px 10px";
  div.style.borderRadius = "6px";
  div.style.border = "1px solid rgba(148,163,184,0.8)";
  div.style.pointerEvents = "none";
  document.body.appendChild(div);
  inventoryDiv = div;
  updateInventoryUI();
}

function updateInventoryUI() {
  if (!inventoryDiv) return;
  const text =
    inventory.length === 0
      ? "Inventory: (empty)"
      : `Inventory: ${inventory.join(", ")}`;
  inventoryDiv.textContent = text;
}

function addToInventory(item: string) {
  if (!inventory.includes(item)) {
    inventory.push(item);
    updateInventoryUI();
  }
}

function removeFromInventory(item: string) {
  const idx = inventory.indexOf(item);
  if (idx !== -1) {
    inventory.splice(idx, 1);
    updateInventoryUI();
  }
}

function hasItem(item: string): boolean {
  return inventory.includes(item);
}

let boxUnlocked = false;
let puzzleSolved = false;

let boxBody: CANNON.Body | null = null;
let boxMesh: THREE.Mesh | null = null;
let buttonMesh: THREE.Mesh | null = null;

let middleFinalDoor: THREE.Mesh | null = null;

const roomMeshes: THREE.Object3D[] = [];
const roomBodies: CANNON.Body[] = [];

export function isBoxUnlocked(): boolean {
  return boxUnlocked;
}

export function dragBoxTo(x: number, z: number) {
  if (!boxBody || !boxMesh) return;
  boxBody.position.x = x;
  boxBody.position.z = z;
  boxBody.velocity.set(0, 0, 0);
  boxMesh.position.set(x, boxMesh.position.y, z);
}

function addRoomMesh(mesh: THREE.Object3D) {
  roomMeshes.push(mesh);
  scene.add(mesh);
}

function addRoomBody(body: CANNON.Body) {
  roomBodies.push(body);
  physicsWorld.addBody(body);
}

function clearCurrentRoom() {
  for (const m of roomMeshes) scene.remove(m);
  roomMeshes.length = 0;
  for (const b of roomBodies) physicsWorld.removeBody(b);
  roomBodies.length = 0;
  boxBody = null;
  boxMesh = null;
  buttonMesh = null;
  goalBody = null;
  goalMesh = null;
  middleFinalDoor = null;
}

function ensurePlayerBall() {
  if (ballBody && ballMesh) return;
  ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xf97373,
      metalness: 0.1,
      roughness: 0.4,
    }),
  );
  scene.add(ballMesh);
  ballBody = new CANNON.Body({
    mass: 3,
    shape: new CANNON.Sphere(0.5),
    position: new CANNON.Vec3(0, 1, 0),
    angularDamping: 0.3,
  });
  physicsWorld.addBody(ballBody);

  function sync() {
    ballMesh.position.copy(ballBody.position as any);
    ballMesh.quaternion.copy(ballBody.quaternion as any);
    requestAnimationFrame(sync);
  }
  sync();
}

function movePlayerTo(x: number, y: number, z: number) {
  ballBody.position.set(x, y, z);
  ballBody.velocity.set(0, 0, 0);
  ballBody.angularVelocity.set(0, 0, 0);
}

function makeFloor(width: number, depth: number, y: number, color: number) {
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, 1, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.0,
    }),
  );
  floorMesh.position.y = y;
  addRoomMesh(floorMesh);
  const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, y, 0),
    shape: new CANNON.Box(new CANNON.Vec3(width / 2, 0.5, depth / 2)),
  });
  addRoomBody(floorBody);
}

function makeWall(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
) {
  const wallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color: COLORS.wall,
      roughness: 0.9,
      metalness: 0,
    }),
  );
  wallMesh.position.set(x, y, z);
  addRoomMesh(wallMesh);

  const wallBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(x, y, z),
    shape: new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)),
  });
  addRoomBody(wallBody);
}

function setDoorUsableVisual(door: THREE.Mesh, usable: boolean) {
  const color = usable ? COLORS.doorUsable : COLORS.doorLocked;
  const mat = door.material as THREE.MeshStandardMaterial;
  mat.color.set(color);
  mat.emissive.set(color);
  mat.emissiveIntensity = 0.6;
  mat.roughness = 0.5;
  mat.metalness = 0.2;
}

function makeDoor(
  x: number,
  z: number,
  target: RoomName,
  usable: boolean,
): THREE.Mesh {
  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 0.2),
    new THREE.MeshStandardMaterial(),
  );
  doorMesh.position.set(x, 1, z);
  doorMesh.rotation.y = Math.PI / 2;
  doorMesh.userData.interactive = true;
  doorMesh.userData.type = "door";
  doorMesh.userData.targetRoom = target;
  setDoorUsableVisual(doorMesh, usable);
  addRoomMesh(doorMesh);
  return doorMesh;
}

function buildMainRoom() {
  makeFloor(10, 10, -0.5, COLORS.floorMain);
  const wallThickness = 0.5;
  const wallHeight = 2;

  makeWall(
    0,
    wallHeight / 2,
    -5 + wallThickness / 2,
    10,
    wallHeight,
    wallThickness,
  );
  makeWall(
    0,
    wallHeight / 2,
    5 - wallThickness / 2,
    10,
    wallHeight,
    wallThickness,
  );
  makeWall(
    -5 + wallThickness / 2,
    wallHeight / 2,
    0,
    wallThickness,
    wallHeight,
    10,
  );
  makeWall(
    5 - wallThickness / 2,
    wallHeight / 2,
    2.5,
    wallThickness,
    wallHeight,
    5,
  );
  makeWall(
    5 - wallThickness / 2,
    wallHeight / 2,
    -2.5,
    wallThickness,
    wallHeight,
    5,
  );

  const keyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.1, 0.8),
    new THREE.MeshStandardMaterial({
      color: COLORS.key,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x665500,
      emissiveIntensity: 0.2,
    }),
  );
  keyMesh.position.set(-2, 0.1, 0);
  keyMesh.userData.interactive = true;
  keyMesh.userData.type = "key";
  addRoomMesh(keyMesh);

  makeDoor(5 - wallThickness, 0, "middle", true);

  movePlayerTo(0, 1, 3);
}

function buildMiddleRoom() {
  makeFloor(10, 10, -0.5, COLORS.floorMiddle);
  const wallThickness = 0.5;
  const wallHeight = 2;

  makeWall(
    0,
    wallHeight / 2,
    -5 + wallThickness / 2,
    10,
    wallHeight,
    wallThickness,
  );
  makeWall(
    0,
    wallHeight / 2,
    5 - wallThickness / 2,
    10,
    wallHeight,
    wallThickness,
  );
  makeWall(
    -5 + wallThickness / 2,
    wallHeight / 2,
    2.5,
    wallThickness,
    wallHeight,
    5,
  );
  makeWall(
    -5 + wallThickness / 2,
    wallHeight / 2,
    -2.5,
    wallThickness,
    wallHeight,
    5,
  );
  makeWall(
    5 - wallThickness / 2,
    wallHeight / 2,
    0,
    wallThickness,
    wallHeight,
    10,
  );

  boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: COLORS.box,
      roughness: 0.8,
      metalness: 0.1,
    }),
  );
  boxMesh.position.set(0, 0.5, 0);
  boxMesh.userData.interactive = true;
  boxMesh.userData.type = "box";
  addRoomMesh(boxMesh);

  boxBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0.5, 0),
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
  });
  addRoomBody(boxBody);

  buttonMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32),
    new THREE.MeshStandardMaterial({
      color: puzzleSolved ? COLORS.buttonOn : COLORS.buttonOff,
      emissive: puzzleSolved ? COLORS.buttonOn : 0x000000,
      emissiveIntensity: puzzleSolved ? 0.3 : 0,
      roughness: 0.5,
      metalness: 0.2,
    }),
  );
  buttonMesh.position.set(0, 0.05, -3);
  addRoomMesh(buttonMesh);

  middleFinalDoor = makeDoor(5 - wallThickness, 0, "final", puzzleSolved);

  makeDoor(-5 + wallThickness, 0, "main", true);

  movePlayerTo(-3, 1, 0);
}

let beam1Mesh: THREE.Mesh | null = null;
let beam2Mesh: THREE.Mesh | null = null;

let wobbleTimer = 0;
let wobbleAmount = 0;
let onBeam = false;

let balanceDiv: HTMLDivElement | null = null;

function ensureBalanceUI() {
  if (balanceDiv) return;
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.right = "10px";
  div.style.top = "10px";
  div.style.width = "160px";
  div.style.height = "20px";
  div.style.background = "rgba(0,0,0,0.4)";
  div.style.border = "1px solid white";
  div.style.borderRadius = "4px";

  const fill = document.createElement("div");
  fill.id = "balanceFill";
  fill.style.height = "100%";
  fill.style.width = "0%";
  fill.style.background = "#ef4444";
  fill.style.transition = "width 0.1s linear";

  div.appendChild(fill);
  document.body.appendChild(div);
  balanceDiv = div;
}

function updateBalanceUI(amount: number) {
  const fill = document.getElementById("balanceFill") as HTMLDivElement | null;
  if (!fill) return;
  const pct = Math.min(100, Math.abs(amount) * 2000);
  fill.style.width = pct + "%";
  if (pct < 40) fill.style.background = "#22c55e";
  else if (pct < 70) fill.style.background = "#eab308";
  else fill.style.background = "#ef4444";
}

function resetWobble() {
  wobbleTimer = 0;
  wobbleAmount = 0;
  onBeam = false;
  updateBalanceUI(0);
}

function updateWobble(deltaTime: number, pos: CANNON.Vec3) {
  const pX = pos.x;
  const pZ = pos.z;

  const onBeam1 = pX > -0.2 && pX < 0.2 && pZ > -3 && pZ < 1;

  const onBeam2 = pX > 0 && pX < 4 && pZ > 0.8 && pZ < 1.2;

  const onAny = onBeam1 || onBeam2;

  if (!onAny) {
    resetWobble();
    return;
  }

  onBeam = true;
  wobbleTimer += deltaTime;
  wobbleAmount = Math.sin(wobbleTimer * 4) * (0.25 * wobbleTimer);

  ballBody.position.x += wobbleAmount * 0.1;

  updateBalanceUI(wobbleAmount);
}

function buildFinalRoom() {
  resetWobble();
  ensureBalanceUI();

  const floorMaterialFront = new THREE.MeshStandardMaterial({
    color: COLORS.floorFinalFront,
    roughness: 0.9,
    metalness: 0,
  });
  const floorMaterialBack = new THREE.MeshStandardMaterial({
    color: COLORS.floorFinalBack,
    roughness: 0.9,
    metalness: 0,
  });

  const backStrip = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 3),
    floorMaterialBack,
  );
  backStrip.position.set(0, -0.5, 4);
  addRoomMesh(backStrip);
  addRoomBody(
    new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, -0.5, 4),
      shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 1.5)),
    }),
  );

  const frontStrip = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 3),
    floorMaterialFront,
  );
  frontStrip.position.set(0, -0.5, -4);
  addRoomMesh(frontStrip);
  addRoomBody(
    new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, -0.5, -4),
      shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 1.5)),
    }),
  );

  const wallThickness = 0.5;
  const wallHeight = 2;

  makeWall(
    0,
    wallHeight / 2,
    -5 + wallThickness / 2,
    10,
    wallHeight,
    wallThickness,
  );
  makeWall(
    0,
    wallHeight / 2,
    5 - wallThickness / 2,
    10,
    wallHeight,
    wallThickness,
  );
  makeWall(
    -5 + wallThickness / 2,
    wallHeight / 2,
    0,
    wallThickness,
    wallHeight,
    10,
  );
  makeWall(
    5 - wallThickness / 2,
    wallHeight / 2,
    0,
    wallThickness,
    wallHeight,
    10,
  );

  beam1Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.15, 4),
    new THREE.MeshStandardMaterial({
      color: COLORS.rope,
      metalness: 0.5,
      roughness: 0.4,
    }),
  );
  beam1Mesh.position.set(0, 0, -1);
  addRoomMesh(beam1Mesh);
  addRoomBody(
    new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, -1),
      shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.075, 2)),
    }),
  );

  beam2Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.15, 0.4),
    new THREE.MeshStandardMaterial({
      color: COLORS.rope,
      metalness: 0.5,
      roughness: 0.4,
    }),
  );
  beam2Mesh.position.set(2, 0, 1);
  addRoomMesh(beam2Mesh);
  addRoomBody(
    new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(2, 0, 1),
      shape: new CANNON.Box(new CANNON.Vec3(2, 0.075, 0.2)),
    }),
  );

  goalMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.3, 2),
    new THREE.MeshStandardMaterial({
      color: COLORS.goal,
      emissive: COLORS.goal,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.2,
    }),
  );
  goalMesh.position.set(4, 0, 1);
  addRoomMesh(goalMesh);

  goalBody = new CANNON.Body({
    mass: 0,
    collisionResponse: false,
    position: new CANNON.Vec3(4, 0, 1),
    shape: new CANNON.Box(new CANNON.Vec3(1, 0.15, 1)),
  });
  addRoomBody(goalBody);

  movePlayerTo(0, 1, -4);
}

function changeRoom(next: RoomName) {
  currentRoom = next;
  clearCurrentRoom();
  if (next === "main") buildMainRoom();
  else if (next === "middle") buildMiddleRoom();
  else buildFinalRoom();
}

export function setupGameObjects() {
  const hemi = new THREE.HemisphereLight(0xe5f2ff, 0x1f2933, 0.7);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(8, 12, 6);
  dir.castShadow = false;
  scene.add(dir);

  ensurePlayerBall();
  ensureInventoryUI();
  updateInventoryUI();
  changeRoom("main");
}

export function handleObjectClick(object: THREE.Object3D) {
  const userData = (object as any).userData || {};
  if (!userData.interactive) return;

  const playerPos = ballBody.position;
  const objPos = object.position as THREE.Vector3;
  const dx = playerPos.x - objPos.x;
  const dz = playerPos.z - objPos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist > 3) return;

  const type = userData.type as string | undefined;

  if (type === "key") {
    addToInventory("Key");
    scene.remove(object);
    const index = roomMeshes.indexOf(object);
    if (index >= 0) roomMeshes.splice(index, 1);
  } else if (type === "door") {
    const targetRoom = userData.targetRoom as RoomName;
    if (currentRoom === "middle" && targetRoom === "final" && !puzzleSolved)
      return;
    changeRoom(targetRoom);
  } else if (type === "box") {
    if (!boxUnlocked && hasItem("Key")) {
      boxUnlocked = true;
      removeFromInventory("Key");
    }
  }
}

let lastTime = performance.now();

export function updateGameLogic() {
  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  if (boxBody && boxMesh) {
    boxBody.position.set(
      boxMesh.position.x,
      boxMesh.position.y,
      boxMesh.position.z,
    );
  }

  if (currentRoom === "middle" && boxBody && buttonMesh && !puzzleSolved) {
    const boxPos = boxBody.position;
    const btnPos = buttonMesh.position;
    const dx = boxPos.x - btnPos.x;
    const dz = boxPos.z - btnPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.7) {
      puzzleSolved = true;

      if (buttonMesh.material instanceof THREE.MeshStandardMaterial) {
        buttonMesh.material.color.set(COLORS.buttonOn);
        buttonMesh.material.emissive.set(COLORS.buttonOn);
        buttonMesh.material.emissiveIntensity = 0.3;
      }

      if (middleFinalDoor) setDoorUsableVisual(middleFinalDoor, true);
    }
  }

  if (currentRoom === "final") {
    updateWobble(delta, ballBody.position);
    if (ballBody.position.y < -5) movePlayerTo(0, 1, -4);
  }
}
