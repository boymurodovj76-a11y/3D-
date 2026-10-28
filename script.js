
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// ========================================
// JAHONGIR RPG - LOW POLY FANTASY WORLD
// ========================================

const $ = (id) => document.getElementById(id);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c9e9);
scene.fog = new THREE.Fog(0x91c9e9, 32, 100);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 180
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.domElement.style.cssText =
  "position:fixed;inset:0;width:100%;height:100%;z-index:0;display:block";
$("game").prepend(renderer.domElement);
$("hud").style.zIndex = "1";

// Yorug‘lik
scene.add(new THREE.HemisphereLight(0xe1f5ff, 0x536d42, 2));

const sun = new THREE.DirectionalLight(0xffedc4, 3);
sun.position.set(-15, 25, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -28;
sun.shadow.camera.right = 28;
sun.shadow.camera.top = 28;
sun.shadow.camera.bottom = -28;
scene.add(sun);

// Material va shakl yaratish
function mat(color, roughness = 1) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

const materials = {
  grass: mat(0x6fba68),
  grassLight: mat(0x91d47b),
  dirt: mat(0x9d8255),
  trunk: mat(0x765035),
  leaves: mat(0x358552),
  leavesLight: mat(0x66b85d),
  stone: mat(0x929eaa),
  darkStone: mat(0x586675),
  gold: mat(0xffcc61),
  skin: mat(0xffc58e),
  armor: mat(0x397cc1),
  armorDark: mat(0x244466),
  red: mat(0xe34c4c),
  blade: mat(0xdcecf7, 0.35),
  enemyArmor: mat(0x683d78),
  enemySkin: mat(0x9ed45c)
};

function mesh(geometry, material, parent, x, y, z) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function box(parent, material, x, y, z, sx, sy, sz) {
  return mesh(new THREE.BoxGeometry(sx, sy, sz), material,
    parent, x, y, z);
}

function makeTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);
  scene.add(tree);

  mesh(new THREE.CylinderGeometry(.22, .35, 2, 6),
    materials.trunk, tree, 0, 1, 0);

  mesh(new THREE.ConeGeometry(1.25, 2.2, 6),
    materials.leaves, tree, 0, 2.6, 0);

  mesh(new THREE.ConeGeometry(.9, 1.8, 6),
    materials.leavesLight, tree, 0, 3.55, 0);

  return tree;
}

// Yer va orol
const ground = mesh(
  new THREE.CylinderGeometry(43, 45, 2.2, 12),
  materials.dirt, scene, 0, -1.25, 0
);
ground.receiveShadow = true;

mesh(new THREE.CylinderGeometry(41, 43, .45, 12),
  materials.grass, scene, 0, -.12, 0);

const islandGrass = new THREE.Mesh(
  new THREE.CircleGeometry(40.7, 12),
  materials.grass
);
islandGrass.rotation.x = -Math.PI / 2;
islandGrass.position.y = .12;
islandGrass.receiveShadow = true;
scene.add(islandGrass);

// Tasodifiy, takrorlanadigan joylashuv
let seed = 90210;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// Daraxtlar
for (let i = 0; i < 68; i++) {
  const a = random() * Math.PI * 2;
  const r = 9 + random() * 28;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;

  if (Math.hypot(x, z - 7) < 5) continue;
  makeTree(x, z, .7 + random() * .65);
}

// Mayda toshlar
for (let i = 0; i < 45; i++) {
  const a = random() * Math.PI * 2;
  const r = 5 + random() * 34;
  const rock = mesh(
    new THREE.DodecahedronGeometry(.3 + random() * .55, 0),
    materials.stone, scene,
    Math.cos(a) * r, .25, Math.sin(a) * r
  );
  rock.rotation.set(random(), random() * 3, random());
}

// Qal’a
const castle = new THREE.Group();
castle.position.set(0, .1, -23);
scene.add(castle);

box(castle, materials.stone, 0, 2.5, 0, 10, 5, 2);
box(castle, materials.stone, -4, 2.5, 3, 2, 5, 8);
box(castle, materials.stone, 4, 2.5, 3, 2, 5, 8);
box(castle, materials.darkStone, 0, 1.5, 4, 3, 3, .5);

for (const x of [-4, 4]) {
  for (const z of [-1, 7]) {
    mesh(new THREE.ConeGeometry(1.45, 2, 4),
      materials.darkStone, castle, x, 6, z);
    box(castle, materials.stone, x, 4.6, z, 2, 2, 2);
  }
}

// Yo‘l
const path = mesh(
  new THREE.BoxGeometry(4, .08, 19),
  materials.dirt, scene, 0, .17, -8
);

// ========================================
// QAHRAMON
// ========================================

function createHero() {
  const root = new THREE.Group();
  scene.add(root);

  const body = new THREE.Group();
  root.add(body);

  // Oyoqlar
  const leftLeg = box(body, materials.armorDark, -.25, .55, 0, .28, 1, .34);
  const rightLeg = box(body, materials.armorDark, .25, .55, 0, .28, 1, .34);

  // Etiklar
  box(body, materials.darkStone, -.25, .12, .1, .34, .22, .48);
  box(body, materials.darkStone, .25, .12, .1, .34, .22, .48);

  // Tana
  box(body, materials.armor, 0, 1.35, 0, .9, 1, .48);
  box(body, materials.gold, 0, 1.38, .255, .13, .52, .035);

  // Bosh va soch
  mesh(new THREE.BoxGeometry(.56, .58, .52),
    materials.skin, body, 0, 2.2, 0);
  box(body, materials.armorDark, 0, 2.52, 0, .62, .2, .58);

  // Ko‘zlar
  box(body, mat(0x253347), -.13, 2.25, .267, .07, .07, .025);
  box(body, mat(0x253347), .13, 2.25, .267, .07, .07, .025);

  // Yelkalar va qo‘llar
  const leftArm = new THREE.Group();
  leftArm.position.set(-.57, 1.7, 0);
  body.add(leftArm);
  box(leftArm, materials.armorDark, 0, -.3, 0, .27, .72, .3);

  const rightArm = new THREE.Group();
  rightArm.position.set(.57, 1.7, 0);
  body.add(rightArm);
  box(rightArm, materials.armor, 0, -.28, 0, .28, .72, .3);

  // Qilich: qo‘l bilan birga aylanadi
  const sword = new THREE.Group();
  sword.position.set(.04, -.62, .05);
  rightArm.add(sword);

  box(sword, materials.gold, 0, -.18, 0, .12, .12, .14);
  box(sword, materials.trunk, 0, -.34, 0, .075, .24, .08);
  box(sword, materials.blade, 0, .18, 0, .12, .75, .055);
  mesh(new THREE.ConeGeometry(.09, .22, 4),
    materials.blade, sword, 0, .665, 0);

  return {
    root, body, leftLeg, rightLeg, leftArm, rightArm, sword
  };
}

const hero = createHero();
hero.root.position.set(0, .12, 7);

const heroState = {
  hp: 100,
  maxHp: 100,
  xp: 0,
  level: 1,
  kills: 0,
  gold: 0,
  attackCooldown: 0,
  attackTime: 0,
  invulnerable: 0,
  moving: false
};

// ========================================
// DUSHMANLAR
// ========================================

const enemies = [];

function createEnemy(x, z, index) {
  const root = new THREE.Group();
  root.position.set(x, .12, z);
  scene.add(root);

  const body = new THREE.Group();
  root.add(body);

  box(body, materials.enemyArmor, 0, 1.25, 0, .85, .95, .48);
  mesh(new THREE.BoxGeometry(.55, .55, .52),
    materials.enemySkin, body, 0, 2.1, 0);
  box(body, mat(0x25252b), -.13, 2.16, .267, .08, .07, .03);
  box(body, mat(0x25252b), .13, 2.16, .267, .08, .07, .03);

  box(body, materials.darkStone, -.24, .5, 0, .27, .9, .32);
  box(body, materials.darkStone, .24, .5, 0, .27, .9, .32);

  const arm = new THREE.Group();
  arm.position.set(.55, 1.6, 0);
  body.add(arm);
  box(arm, materials.enemyArmor, 0, -.25, 0, .26, .65, .28);

  const weapon = box(arm, materials.darkStone, .1, -.62, .03, .13, .6, .13);
  weapon.rotation.z = -.25;

  // Bosh ustidagi sog‘liq paneli
  const hpGroup = new THREE.Group();
  hpGroup.position.set(0, 3, 0);
  root.add(hpGroup);

  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, .13),
    mat(0x3a2430)
  );
  hpGroup.add(bg);

  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.08, .07),
    mat(0xe95757)
  );
  fill.position.z = .01;
  hpGroup.add(fill);

  const enemy = {
    root, body, arm, hpGroup, fill,
    hp: 60,
    maxHp: 60,
    alive: true,
    attackCooldown: random() * 1.5,
    phase: random() * 6,
    index
  };

  enemies.push(enemy);
  return enemy;
}

function spawnEnemies() {
  for (const e of enemies) scene.remove(e.root);
  enemies.length = 0;

  const positions = [
    [-5, -3], [5, -5], [-8, -12], [8, -15],
    [-3, -19], [9, 3], [-12, 2], [12, -8]
  ];

  positions.forEach(([x, z], i) => createEnemy(x, z, i));
}

spawnEnemies();

// ========================================
// BOSHQARUV
// ========================================

const keys = {};
const input = { x: 0, z: 0 };
let running = false;
let soundEnabled = true;
let pointerLocked = false;
let cameraYaw = 0;
let cameraPitch = .28;
let audioContext = null;
let lastTime = 0;
let messageTimer = 0;
let toastTimer = 0;
let attackFlash = 0;

const clock = new THREE.Clock();

function showMessage(text, duration = 1.8) {
  $("message").textContent = text;
  $("message").classList.add("show");
  messageTimer = duration;
}

function showToast(text, duration = 2.2) {
  $("toast").textContent = text;
  $("toast").classList.add("show");
  toastTimer = duration;
}

function playSound(type) {
  if (!soundEnabled) return;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") audioContext.resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;
    const sounds = {
      hit: [170, 65, .12],
      hurt: [110, 55, .18],
      kill: [440, 700, .2],
      level: [400, 850, .3]
    };

    const [start, end, duration] = sounds[type] || sounds.hit;
    osc.type = type === "hit" ? "sawtooth" : "sine";
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(.001, now);
    gain.gain.exponentialRampToValueAtTime(.13, now + .015);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);

    osc.start(now);
    osc.stop(now + duration + .02);
  } catch (e) {
    // Audio mavjud bo‘lmasa, o‘yin davom etadi.
  }
}

function updateHUD() {
  $("hpText").textContent =
    `${Math.ceil(heroState.hp)} / ${heroState.maxHp}`;
  $("hpBar").style.width =
    `${100 * heroState.hp / heroState.maxHp}%`;

  const xpNeed = heroState.level * 100;
  $("xpText").textContent = `${heroState.xp} / ${xpNeed}`;
  $("xpBar").style.width = `${100 * heroState.xp / xpNeed}%`;

  $("level").textContent = heroState.level;
  $("kills").textContent = heroState.kills;
  $("gold").textContent = heroState.gold;
  $("questProgress").textContent =
    `Mag‘lub etilganlar: ${Math.min(heroState.kills, 5)} / 5`;
}

function addXP(amount) {
  heroState.xp += amount;

  while (heroState.xp >= heroState.level * 100) {
    heroState.xp -= heroState.level * 100;
    heroState.level++;
    heroState.maxHp += 15;
    heroState.hp = heroState.maxHp;
    playSound("level");
    showToast(`YANGI DARAJA: ${heroState.level}! +15 maksimal sog‘liq`);
  }

  updateHUD();
}

function attack() {
  if (!running || heroState.attackCooldown > 0) return;

  heroState.attackCooldown = .52;
  heroState.attackTime = .28;
  playSound("hit");

  const forward = new THREE.Vector3(
    Math.sin(hero.root.rotation.y), 0,
    Math.cos(hero.root.rotation.y)
  );

  let hits = 0;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const dx = enemy.root.position.x - hero.root.position.x;
    const dz = enemy.root.position.z - hero.root.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance > 2.65) continue;

    const direction = new THREE.Vector3(dx, 0, dz).normalize();
    if (forward.dot(direction) < .05) continue;

    enemy.hp -= 30;
    hits++;

    // Dushmanni zarbadan orqaga surish
    enemy.root.position.x += direction.x * .8;
    enemy.root.position.z += direction.z * .8;

    if (enemy.hp <= 0) {
      enemy.alive = false;
      enemy.root.visible = false;
      heroState.kills++;
      heroState.gold += 10;
      addXP(35);
      playSound("kill");
      showMessage("Dushman mag‘lub etildi! +10 oltin, +35 XP");
    } else {
      showMessage("Qilich zarbasi!");
    }

    enemy.fill.scale.x = Math.max(0, enemy.hp / enemy.maxHp);
    enemy.fill.position.x =
      -(1.08 * (1 - Math.max(0, enemy.hp / enemy.maxHp))) / 2;
  }

  if (!hits) showMessage("Zarba tegmadi — dushmanga yaqinlashing!");
  updateHUD();
}

function hurtHero(amount) {
  if (heroState.invulnerable > 0 || !running) return;

  heroState.hp = Math.max(0, heroState.hp - amount);
  heroState.invulnerable = .7;
  playSound("hurt");
  showMessage(`Zarar oldingiz! -${amount} HP`);
  updateHUD();

  if (heroState.hp <= 0) {
    endGame(false);
  }
}

// Klaviatura
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "Space" && !e.repeat) attack();
  if (e.code === "Escape" && pointerLocked) {
    document.exitPointerLock?.();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

window.addEventListener("blur", () => {
  for (const key in keys) keys[key] = false;
  input.x = 0;
  input.z = 0;
  $("stick").style.transform = "translate(-50%, -50%)";
});

// Sichqoncha bilan kamerani aylantirish
renderer.domElement.addEventListener("click", () => {
  if (running && window.matchMedia("(pointer:fine)").matches) {
    renderer.domElement.requestPointerLock?.();
  }
});

document.addEventListener("pointerlockchange", () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener("mousemove", (e) => {
  if (!running || !pointerLocked) return;
  cameraYaw -= e.movementX * .003;
  cameraPitch = THREE.MathUtils.clamp(
    cameraPitch + e.movementY * .002, -.05, .85
  );
});

// Telefon uchun joystick
const joystick = $("joystick");
const stick = $("stick");
let joyPointer = null;

function updateJoystick(e) {
  const r = joystick.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const max = r.width * .34;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const len = Math.hypot(dx, dy);
  const scale = len > max ? max / len : 1;
  const x = dx * scale;
  const y = dy * scale;

  input.x = x / max;
  input.z = y / max;

  stick.style.transform =
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

joystick.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  joyPointer = e.pointerId;
  joystick.setPointerCapture(e.pointerId);
  updateJoystick(e);
});

joystick.addEventListener("pointermove", (e) => {
  if (e.pointerId === joyPointer) updateJoystick(e);
});

function resetJoystick(e) {
  if (e.pointerId !== joyPointer) return;
  joyPointer = null;
  input.x = 0;
  input.z = 0;
  stick.style.transform = "translate(-50%, -50%)";
}

joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);

$("attackBtn").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  attack();
});

$("soundBtn").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  $("soundBtn").textContent = soundEnabled ? "🔊" : "🔇";
  if (soundEnabled) playSound("level");
});

// ========================================
// O‘YIN HOLATI
// ========================================

function startGame() {
  heroState.hp = heroState.maxHp = 100;
  heroState.xp = 0;
  heroState.level = 1;
  heroState.kills = 0;
  heroState.gold = 0;
  heroState.attackCooldown = 0;
  heroState.attackTime = 0;
  heroState.invulnerable = 0;

  hero.root.position.set(0, .12, 7);
  hero.root.rotation.y = 0;
  cameraYaw = 0;
  cameraPitch = .28;

  spawnEnemies();
  updateHUD();

  $("startScreen").classList.add("hidden");
  $("gameOver").classList.add("hidden");

  running = true;
  clock.getDelta();
  showToast("WASD bilan harakatlaning. SPACE bilan hujum qiling!");
}

function endGame(won) {
  running = false;
  if (document.pointerLockElement) document.exitPointerLock();

  $("endTitle").textContent = won ? "G‘ALABA!" : "SARGUZASHT TUGADI";
  $("endText").textContent = won
    ? `Tabriklaymiz! ${heroState.kills} ta dushmanni mag‘lub etdingiz.`
    : `Daraja: ${heroState.level} · Mag‘lubiyatlar: ${heroState.kills} · Oltin: ${heroState.gold}`;

  $("gameOver").classList.remove("hidden");
}

$("startBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", startGame);

// ========================================
// HARAKAT VA DUSHMAN AI
// ========================================

const worldUp = new THREE.Vector3(0, 1, 0);
const desiredCamera = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

function updateHero(dt, elapsed) {
  heroState.attackCooldown = Math.max(0, heroState.attackCooldown - dt);
  heroState.attackTime = Math.max(0, heroState.attackTime - dt);
  heroState.invulnerable = Math.max(0, heroState.invulnerable - dt);

  const kx = (keys.KeyD || keys.ArrowRight ? 1 : 0) -
             (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  const kz = (keys.KeyS || keys.ArrowDown ? 1 : 0) -
             (keys.KeyW || keys.ArrowUp ? 1 : 0);

  let mx = kx + input.x;
  let mz = kz + input.z;
  const length = Math.hypot(mx, mz);
  if (length > 1) {
    mx /= length;
    mz /= length;
  }

  // Kamera yo‘nalishiga mos harakat
  const forward = new THREE.Vector3(
    -Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)
  );
  const right = new THREE.Vector3(
    Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)
  );

  const move = new THREE.Vector3()
    .addScaledVector(right, mx)
    .addScaledVector(forward, -mz);

  heroState.moving = move.lengthSq() > .01;

  if (heroState.moving) {
    move.normalize();
    const speed = 5.2;
    hero.root.position.addScaledVector(move, speed * dt);

    const targetAngle = Math.atan2(move.x, move.z);
    let diff = targetAngle - hero.root.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    hero.root.rotation.y += diff * Math.min(1, dt * 12);
  }

  // Orol chegarasi
  const radius = Math.hypot(hero.root.position.x, hero.root.position.z);
  if (radius > 38) {
    hero.root.position.x *= 38 / radius;
    hero.root.position.z *= 38 / radius;
  }

  // Yurish animatsiyasi
  const swing = heroState.moving ? Math.sin(elapsed * 10) * .55 : 0;
  hero.leftLeg.rotation.x = swing;
  hero.rightLeg.rotation.x = -swing;
  hero.leftArm.rotation.x = -swing * .55;
  hero.rightArm.rotation.x = swing * .35;

  // Qilich zarbasi animatsiyasi
  if (heroState.attackTime > 0) {
    const progress = 1 - heroState.attackTime / .28;
    hero.rightArm.rotation.x = -1.8 * Math.sin(progress * Math.PI);
    hero.rightArm.rotation.z = -1.2 * Math.sin(progress * Math.PI);
  } else {
    hero.rightArm.rotation.z = 0;
  }

  // Kamera qahramon orqasidan ergashadi
  const horizontal = 7.5 * Math.cos(cameraPitch);
  desiredCamera.set(
    hero.root.position.x + Math.sin(cameraYaw) * horizontal,
    hero.root.position.y + 3 + Math.sin(cameraPitch) * 7.5,
    hero.root.position.z + Math.cos(cameraYaw) * horizontal
  );

  camera.position.lerp(desiredCamera, 1 - Math.exp(-dt * 5));

  lookTarget.set(
    hero.root.position.x,
    hero.root.position.y + 1.5,
    hero.root.position.z
  );
  camera.lookAt(lookTarget);
}

function updateEnemies(dt, elapsed) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    enemy.attackCooldown -= dt;
    enemy.hpGroup.lookAt(camera.position);

    const dx = hero.root.position.x - enemy.root.position.x;
    const dz = hero.root.position.z - enemy.root.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance < 16 && distance > 1.55 && running) {
      enemy.root.position.x += dx / distance * 1.5 * dt;
      enemy.root.position.z += dz / distance * 1.5 * dt;
      enemy.root.rotation.y = Math.atan2(dx, dz);
      enemy.body.position.y = Math.sin(elapsed * 5 + enemy.phase) * .035;
      enemy.arm.rotation.x = Math.sin(elapsed * 4 + enemy.phase) * .12;
    } else if (distance <= 1.55 && enemy.attackCooldown <= 0 && running) {
      enemy.attackCooldown = 1.25;
      enemy.arm.rotation.x = -1;
      hurtHero(8);
    } else {
      enemy.body.position.y = Math.sin(elapsed * 2 + enemy.phase) * .025;
    }
  }

  if (heroState.kills >= 5 && running) {
    showToast("Vazifa bajarildi! Siz haqiqiy qahramonsiz!");
    endGame(true);
  }
}

// ========================================
// ANIMATSIYA
// ========================================

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), .04);
  const elapsed = clock.elapsedTime;

  if (running) {
    updateHero(dt, elapsed);
    updateEnemies(dt, elapsed);
  } else {
    // Menyuda ham kamera va dunyo ko‘rinadi
    camera.position.lerp(new THREE.Vector3(0, 7, 17), .015);
    camera.lookAt(0, 1, 0);
  }

  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) $("message").classList.remove("show");
  }

  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) $("toast").classList.remove("show");
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateHUD();
animate();
