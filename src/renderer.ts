import * as THREE from "three";
import { ballBody } from "./game";

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;
export let renderer: THREE.WebGLRenderer;

export let cameraYaw = 0;
export let cameraPitch = -0.3;
let isRightMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

export function initRenderer() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x111827);
  scene.fog = new THREE.Fog(0x111827, 20, 80);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(5, 8, 12);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      isRightMouseDown = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 2) {
      isRightMouseDown = false;
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!isRightMouseDown) return;

    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    cameraYaw -= dx * 0.005;
    cameraPitch -= dy * 0.005;

    const maxPitch = Math.PI / 2 - 0.1;
    const minPitch = -Math.PI / 2 + 0.1;
    cameraPitch = Math.max(minPitch, Math.min(maxPitch, cameraPitch));
  });

  window.addEventListener("contextmenu", (e) => e.preventDefault());
}

export function renderLoop() {
  if (ballBody) {
    const target = ballBody.position;
    const distance = 12;

    camera.position.x =
      target.x + distance * Math.cos(cameraPitch) * Math.sin(cameraYaw);
    camera.position.y = target.y + distance * Math.sin(cameraPitch);
    camera.position.z =
      target.z + distance * Math.cos(cameraPitch) * Math.cos(cameraYaw);

    camera.lookAt(target.x, target.y, target.z);
  }

  renderer.render(scene, camera);
}
