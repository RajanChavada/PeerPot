import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Plus, Minus } from "lucide-react";

const COIN_VALUE = 50;
const MAX_COINS = 120;

function makeDollarTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = "#9a6f00";
  ctx.font = "bold 92px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 64, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

// three stacks at varied x/z, with different growth weights so heights differ
const STACKS = [
  { x: -0.5, z: 0.2 },   // tallest (50%)
  { x: 0.02, z: -0.1 },  // medium (30%)
  { x: 0.5, z: 0.22 },   // shortest (20%)
];
// loose coins lying flat on the ground, scattered to the left and right of the stacks
const SCATTER = [
  { x: -0.95, z: 0.05 },
  { x: -0.85, z: 0.45 },
  { x: 0.95, z: 0.1 },
  { x: 0.82, z: 0.5 },
];
// which coin indices (modulo 12) become loose coins on the ground
const SCATTER_MOD = new Set([2, 7, 11, 5]);

export default function BlobVisualization({ pool = 0, back = 0, doubt = 0, title = "" }) {
  const mountRef = useRef(null);
  const targetCount = useRef(1);
  const zoomRef = useRef(3.4);

  useEffect(() => {
    targetCount.current = Math.max(1, Math.min(MAX_COINS, Math.ceil(pool / COIN_VALUE)));
  }, [pool]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const size = mount.clientWidth || 320;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    // raised angle so the $ on top faces are visible
    camera.position.set(0, 2.1, 3.4);
    camera.lookAt(0, 0.55, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    mount.appendChild(renderer.domElement);

    // bright flat lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 5, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff0c0, 0.9);
    fill.position.set(-3, 2, 3);
    scene.add(fill);
    const top = new THREE.DirectionalLight(0xffffff, 0.8);
    top.position.set(0, 6, 0.5);
    scene.add(top);

    const RADIUS = 0.26;
    const HEIGHT = 0.07;
    const coinGeo = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 40);

    const sideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFC827"),
      metalness: 0.15, roughness: 0.5,
      emissive: new THREE.Color("#6e4f00"),
      emissiveIntensity: 0.75,
    });
    const topMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFE680"),
      metalness: 0.1, roughness: 0.4,
      emissive: new THREE.Color("#FFD700"),
      emissiveIntensity: 0.55,
      map: makeDollarTexture(),
    });
    const coinMats = [sideMat, topMat, sideMat];

    const group = new THREE.Group();
    scene.add(group);

    const coins = [];
    const stackCounters = [0, 0, 0];
    const scatterCounter = { i: 0 };
    const seed = (title || "").split("").reduce((s, c) => s + c.charCodeAt(0), 7) * 0.13;

    const addCoin = (index, animate = true) => {
      const coin = new THREE.Mesh(coinGeo, coinMats);
      let targetY, px, pz, rotX = 0, rotZ = 0, rotY = 0;

      const isScatter =
        SCATTER_MOD.has(index % 12) && scatterCounter.i < SCATTER.length;
      if (isScatter) {
        const s = SCATTER[scatterCounter.i];
        scatterCounter.i++;
        px = s.x + Math.sin(seed + index * 3.1) * 0.03;
        pz = s.z + Math.cos(seed + index * 3.1) * 0.03;
        // flat on the ground (cylinder caps facing up/down)
        rotX = 0;
        rotZ = 0;
        rotY = seed + index * 1.3;
        targetY = HEIGHT / 2 + 0.01;
      } else {
        // pick a stack based on index modulo 10
        const m = index % 10;
        let si = 0;
        if (m >= 5 && m <= 7) si = 1;
        else if (m >= 8) si = 2;
        const st = STACKS[si];
        const inStack = stackCounters[si];
        stackCounters[si]++;
        px = st.x + Math.sin(seed + index * 1.3) * 0.03;
        pz = st.z + Math.cos(seed + index * 1.3) * 0.03;
        targetY = HEIGHT / 2 + inStack * HEIGHT * 1.04;
        rotZ = Math.sin(seed + index * 1.7) * 0.04;
        rotY = Math.cos(seed + index * 2.3) * 0.3;
      }

      coin.position.set(px, animate ? 3 : targetY, pz);
      coin.rotation.set(rotX, rotY, rotZ);
      coin.userData = { targetY, current: animate ? 3 : targetY, vy: 0, baseX: px, baseZ: pz };
      group.add(coin);
      coins.push(coin);
    };

    // recentre the coin mass so it sits in the middle of the frame
    let lookY = 0.55;
    const recenter = () => {
      if (coins.length === 0) return;
      let sx = 0, sz = 0, sy = 0;
      for (const c of coins) {
        sx += c.userData.baseX;
        sz += c.userData.baseZ;
        sy += c.userData.targetY;
      }
      const cx = sx / coins.length;
      const cz = sz / coins.length;
      lookY = sy / coins.length;
      for (const c of coins) {
        c.position.x = c.userData.baseX - cx;
        c.position.z = c.userData.baseZ - cz;
      }
    };

    for (let i = 0; i < targetCount.current; i++) addCoin(i, false);
    recenter();

    // --- swipe / drag to rotate ---
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let velY = 0.003;
    const dom = renderer.domElement;
    dom.style.cursor = "grab";
    dom.style.touchAction = "none";

    const onDown = (e) => {
      isDragging = true; dom.style.cursor = "grabbing";
      const p = e.touches ? e.touches[0] : e;
      lastX = p.clientX; lastY = p.clientY;
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX; lastY = p.clientY;
      group.rotation.y += dx * 0.01;
      group.rotation.x = Math.max(-0.5, Math.min(0.5, group.rotation.x + dy * 0.008));
      velY = dx * 0.01;
    };
    const onUp = () => { isDragging = false; dom.style.cursor = "grab"; };
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // --- zoom (wheel / pinch) ---
    const ZOOM_MIN = 2.2;
    const ZOOM_MAX = 6.5;
    const clampZoom = (v) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v));
    const onWheel = (e) => {
      e.preventDefault();
      zoomRef.current = clampZoom(zoomRef.current + e.deltaY * 0.003);
    };
    dom.addEventListener("wheel", onWheel, { passive: false });

    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      const before = coins.length;
      while (coins.length < targetCount.current) addCoin(coins.length, true);
      if (coins.length !== before) recenter();

      for (const coin of coins) {
        const diff = coin.userData.targetY - coin.userData.current;
        coin.userData.vy += diff * 55 * dt;
        coin.userData.vy *= 0.84;
        coin.userData.current += coin.userData.vy * dt;
        coin.position.y = coin.userData.current;
      }

      if (!isDragging) {
        group.rotation.y += velY;
        velY *= 0.96;
        if (Math.abs(velY) < 0.0004) velY = 0.0004;
      }

      // smooth camera zoom toward target
      camera.position.z += (zoomRef.current - camera.position.z) * 0.12;
      camera.lookAt(0, lookY, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth || 320;
      renderer.setSize(w, w);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dom.removeEventListener("wheel", onWheel);
      coinGeo.dispose(); sideMat.dispose(); topMat.dispose();
      if (topMat.map) topMat.map.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [title]);

  return (
    <div className="relative w-full max-w-[340px] aspect-square mx-auto rounded-xl overflow-hidden" style={{ minHeight: 280, background: "#000000" }}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute right-3 bottom-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => { zoomRef.current = Math.max(2.2, zoomRef.current - 0.4); }}
          className="w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => { zoomRef.current = Math.min(6.5, zoomRef.current + 0.4); }}
          className="w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}