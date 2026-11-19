
import * as THREE from "three";
import { OrbitControls } from
"three/addons/controls/OrbitControls.js";

// ============================
// SCENE & CAMERA
// ============================

const container = document.getElementById("scene");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);
scene.fog = new THREE.FogExp2(0x020202, 0.025);

const camera = new THREE.PerspectiveCamera(
  45, innerWidth / innerHeight, 0.1, 100
);

camera.position.set(0, 0.4, 11);

// ============================
// RENDERER
// ============================

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

container.appendChild(renderer.domElement);

// ============================
// CONTROLS
// ============================

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 17;
controls.target.set(0, -0.1, 0);

// ============================
// LIGHTING
// ============================

scene.add(new THREE.AmbientLight(0xffc45c, 1.5));

const mainLight = new THREE.PointLight(
  0xffae00, 120, 30
);

mainLight.position.set(0, 3, 4);
scene.add(mainLight);

const sideLight = new THREE.PointLight(
  0xffd45c, 70, 20
);

sideLight.position.set(-4, 2, -3);
scene.add(sideLight);

// ============================
// TREE GROUP
// ============================

const tree = new THREE.Group();
scene.add(tree);

const bark = new THREE.MeshStandardMaterial({
  color: 0x241407,
  roughness: 0.85
});

const branchMaterial = new THREE.MeshStandardMaterial({
  color: 0x49300e,
  roughness: 0.75
});

function random(min, max) {
  return Math.random() * (max - min) + min;
}

// ============================
// GOLDEN LEAVES
// ============================

const leafPositions = [];
const leafColors = [];

function addLeaves(center, count) {

  for (let i = 0; i < count; i++) {

    const x = random(-0.5, 0.5);
    const y = random(-0.4, 0.5);
    const z = random(-0.5, 0.5);

    leafPositions.push(
      center.x + x,
      center.y + y,
      center.z + z
    );

    const gold = random(0.65, 1);

    leafColors.push(
      1, gold * 0.68, gold * 0.08
    );
  }
}

// ============================
// BRANCH GENERATOR
// ============================

function createBranch(
  start, direction, length, radius, depth
) {

  const end = start.clone().add(
    direction.clone().multiplyScalar(length)
  );

  const geometry = new THREE.CylinderGeometry(
    radius * 0.5, radius, length, 5
  );

  const mesh = new THREE.Mesh(
    geometry,
    depth > 3 ? bark : branchMaterial
  );

  mesh.position.copy(start)
    .add(end)
    .multiplyScalar(0.5);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  tree.add(mesh);

  if (depth <= 0) {
    addLeaves(end, 45);
    return;
  }

  const count = depth > 3 ? 3 : 2;

  for (let i = 0; i < count; i++) {

    const angle =
      Math.PI * 2 * i / count +
      random(-0.7, 0.7);

    const spread = new THREE.Vector3(
      Math.cos(angle) * random(0.4, 1),
      random(0.25, 1),
      Math.sin(angle) * random(0.4, 1)
    );

    const nextDirection = direction.clone()
      .multiplyScalar(0.55)
      .add(spread)
      .normalize();

    createBranch(
      end,
      nextDirection,
      length * random(0.68, 0.82),
      radius * 0.68,
      depth - 1
    );
  }
}

// CREATE TREE
createBranch(
  new THREE.Vector3(0, -2.5, 0),
  new THREE.Vector3(0, 1, 0),
  2.5, 0.2, 6
);

// ============================
// LEAF PARTICLES
// ============================

const leafGeometry = new THREE.BufferGeometry();

leafGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(leafPositions, 3)
);

leafGeometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(leafColors, 3)
);

const leafMaterial = new THREE.PointsMaterial({
  size: 0.055,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const leaves = new THREE.Points(
  leafGeometry, leafMaterial
);

tree.add(leaves);

const originalPositions = leafPositions.slice();

// ============================
// TWO HUMAN CHARACTERS
// ============================

const humans = new THREE.Group();
scene.add(humans);

const humanMaterial = new THREE.MeshStandardMaterial({
  color: 0x090807,
  roughness: 0.9,
  emissive: 0x170b02,
  emissiveIntensity: 0.35
});

const hairMaterial = new THREE.MeshStandardMaterial({
  color: 0x050403,
  roughness: 1
});

const skinMaterial = new THREE.MeshStandardMaterial({
  color: 0x21160d,
  roughness: 0.9
});

const groundY = -2.45;

// Helper: create capsule-like body parts
function addCapsule(parent, radius, length, material, x, y, z) {

  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 4, 8),
    material
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

function addSphere(parent, radius, material, x, y, z) {

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 12, 10),
    material
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

// Create one person
function createPerson(x, scale, style = 0) {

  const person = new THREE.Group();

  person.position.set(x, groundY, 1.25);
  person.scale.setScalar(scale);

  // Legs
  const leftLeg = addCapsule(
    person, 0.075, 0.42,
    humanMaterial, -0.11, 0.28, 0
  );

  const rightLeg = addCapsule(
    person, 0.075, 0.42,
    humanMaterial, 0.11, 0.28, 0
  );

  // Shoes
  addSphere(
    person, 0.085, hairMaterial,
    -0.11, 0.07, 0.035
  );

  addSphere(
    person, 0.085, hairMaterial,
    0.11, 0.07, 0.035
  );

  // Body
  addCapsule(
    person, 0.17, 0.48,
    humanMaterial, 0, 0.92, 0
  );

  // Neck
  addCapsule(
    person, 0.055, 0.10,
    skinMaterial, 0, 1.27, 0
  );

  // Head
  addSphere(
    person, 0.145, skinMaterial,
    0, 1.48, 0
  );

  // Hair
  const hair = addSphere(
    person, 0.15, hairMaterial,
    0, 1.55, 0.015
  );

  // Hair cap shape
  hair.scale.set(1.02, 0.65, 1.03);

  // Arms
  const leftArm = addCapsule(
    person, 0.065, 0.42,
    humanMaterial, -0.25, 0.91, 0
  );

  const rightArm = addCapsule(
    person, 0.065, 0.42,
    humanMaterial, 0.25, 0.91, 0
  );

  leftArm.rotation.z = -0.12;
  rightArm.rotation.z = 0.12;

  // Hands
  addSphere(
    person, 0.065, skinMaterial,
    -0.25, 0.62, 0
  );

  addSphere(
    person, 0.065, skinMaterial,
    0.25, 0.62, 0
  );

  // Small backpack on one character
  if (style === 1) {

    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.32, 0.12),
      hairMaterial
    );

    bag.position.set(0, 0.95, 0.15);
    person.add(bag);
  }

  humans.add(person);

  return person;
}

// Two people standing together
const personOne = createPerson(-0.34, 0.95, 0);
const personTwo = createPerson(0.36, 1.03, 1);

// Slightly turn both toward the tree
personOne.rotation.y = -0.04;
personTwo.rotation.y = 0.04;

// ============================
// GROUND
// ============================

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(7, 64),
  new THREE.MeshStandardMaterial({
    color: 0x080705,
    roughness: 1,
    metalness: 0
  })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = groundY;
scene.add(ground);

// Golden ground ring
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.2, 0.012, 8, 100),
  new THREE.MeshBasicMaterial({
    color: 0xffb72b,
    transparent: true,
    opacity: 0.65
  })
);

ring.rotation.x = Math.PI / 2;
ring.position.set(0, groundY + 0.015, 0);

scene.add(ring);

// ============================
// BACKGROUND SPARKLES
// ============================

const sparkleGeometry = new THREE.BufferGeometry();
const sparklePositions = [];

for (let i = 0; i < 450; i++) {

  sparklePositions.push(
    random(-7, 7),
    random(-4, 7),
    random(-5, -1)
  );
}

sparkleGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(
    sparklePositions, 3
  )
);

const sparkles = new THREE.Points(
  sparkleGeometry,
  new THREE.PointsMaterial({
    color: 0xffd65c,
    size: 0.035,
    transparent: true,
    opacity: 0.7
  })
);

scene.add(sparkles);

// ============================
// ANIMATION
// ============================

let time = 0;
let autoRotate = true;

function animate() {

  requestAnimationFrame(animate);

  time += 0.016;

  // Tree rotation
  if (autoRotate) {
    tree.rotation.y += 0.0018;
  }

  // Tree sway
  tree.rotation.x =
    Math.sin(time * 0.7) * 0.02;

  tree.rotation.z =
    Math.cos(time * 0.6) * 0.015;

  // Leaves wind
  const positions =
    leafGeometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {

    const x = originalPositions[i];
    const y = originalPositions[i + 1];
    const z = originalPositions[i + 2];

    positions[i] =
      x + Math.sin(time * 1.5 + y * 3) * 0.025;

    positions[i + 1] =
      y + Math.sin(time * 2 + x * 3) * 0.012;

    positions[i + 2] =
      z + Math.cos(time * 1.4 + x * 3) * 0.025;
  }

  leafGeometry.attributes.position.needsUpdate = true;

  // Human breathing movement
  personOne.position.y =
    groundY + Math.sin(time * 1.3) * 0.012;

  personTwo.position.y =
    groundY + Math.sin(time * 1.3 + 1) * 0.012;

  // Subtle head movement
  personOne.rotation.y =
    -0.04 + Math.sin(time * 0.5) * 0.025;

  personTwo.rotation.y =
    0.04 + Math.sin(time * 0.5 + 1) * 0.025;

  // Light pulse
  mainLight.intensity =
    110 + Math.sin(time * 2) * 20;

  sparkles.rotation.y += 0.0004;

  controls.update();
  renderer.render(scene, camera);
}

// ============================
// BUTTONS
// ============================

document.getElementById("rotation").onclick = function() {

  autoRotate = !autoRotate;

  this.textContent = autoRotate
    ? "ROTATION ON"
    : "ROTATION OFF";
};

document.getElementById("reset").onclick = function() {

  camera.position.set(0, 0.4, 11);

  controls.target.set(0, -0.1, 0);

  tree.rotation.set(0, 0, 0);

  controls.update();
};

// ============================
// RESPONSIVE
// ============================

window.addEventListener("resize", () => {

  camera.aspect = innerWidth / innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
});

// ============================
// START
// ============================

animate();

const loading = document.getElementById("loading");

loading.style.opacity = "0";

setTimeout(() => {
  loading.style.display = "none";
}, 500);
