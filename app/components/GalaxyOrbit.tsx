'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export interface StockData {
  name: string;
  symbol: string;
  price: number;
  change?: number;
  changePercent: number;
  weight: string;
  isUp: boolean;
}

export interface SectorData {
  id: string;
  name: string;
  color: string;
  change: string;
  changeVal: number;
  stocks: StockData[];
}

export interface MarketData {
  title: string;
  marketInfo: string;
  sectors: SectorData[];
}

export const initialMarketsData: Record<'tw' | 'us', MarketData> = {
  tw: {
    title: '台股市場',
    marketInfo: '成交量 4,850億 ｜ 加權指數 +1.25%',
    sectors: [
      {
        id: 'tw-semi',
        name: '半導體',
        color: '#ff4d4d',
        change: '+2.35%',
        changeVal: 2.35,
        stocks: [
          { name: '台積電', symbol: '2330.TW', price: 2500.0, change: 40.0, changePercent: 1.63, weight: '32.0%', isUp: true },
          { name: '聯發科', symbol: '2454.TW', price: 1250.0, change: 25.0, changePercent: 2.04, weight: '15.0%', isUp: true },
          { name: '聯電', symbol: '2303.TW', price: 54.5, change: 1.2, changePercent: 2.25, weight: '10.0%', isUp: true },
          { name: '日月光投控', symbol: '3711.TW', price: 165.0, change: 3.0, changePercent: 1.85, weight: '8.5%', isUp: true },
          { name: '創意', symbol: '3443.TW', price: 1420.0, change: -15.0, changePercent: -1.05, weight: '6.0%', isUp: false },
        ],
      },
      {
        id: 'tw-elec',
        name: 'AI 伺服器與電子',
        color: '#00e5ff',
        change: '+1.18%',
        changeVal: 1.18,
        stocks: [
          { name: '鴻海', symbol: '2317.TW', price: 185.5, change: 3.5, changePercent: 1.92, weight: '25.0%', isUp: true },
          { name: '廣達', symbol: '2382.TW', price: 285.0, change: 4.0, changePercent: 1.42, weight: '18.0%', isUp: true },
          { name: '緯創', symbol: '3231.TW', price: 122.0, change: 2.0, changePercent: 1.67, weight: '12.0%', isUp: true },
          { name: '技嘉', symbol: '2376.TW', price: 295.0, change: 5.0, changePercent: 1.72, weight: '10.0%', isUp: true },
          { name: '英業達', symbol: '2356.TW', price: 58.2, change: 0.8, changePercent: 1.39, weight: '8.0%', isUp: true },
        ],
      },
      {
        id: 'tw-space',
        name: '太空衛星與航太',
        color: '#f43f5e',
        change: '+1.20%',
        changeVal: 1.20,
        stocks: [
          { name: '第一金太空衛星', symbol: '00910.TW', price: 65.4, change: 0.78, changePercent: 1.20, weight: '22.0%', isUp: true },
          { name: '群益台ESG低碳50', symbol: '00923.TW', price: 24.15, change: 0.35, changePercent: 1.42, weight: '20.0%', isUp: true },
          { name: '昇達科', symbol: '3491.TW', price: 210.0, change: 4.5, changePercent: 2.19, weight: '15.0%', isUp: true },
          { name: '華通', symbol: '2313.TW', price: 78.5, change: 1.1, changePercent: 1.42, weight: '12.0%', isUp: true },
          { name: '耀登', symbol: '3138.TW', price: 145.0, change: -2.0, changePercent: -1.36, weight: '10.0%', isUp: false },
        ],
      },
      {
        id: 'tw-green',
        name: '重電綠能',
        color: '#10b981',
        change: '-0.85%',
        changeVal: -0.85,
        stocks: [
          { name: '士電', symbol: '1503.TW', price: 210.0, change: -3.0, changePercent: -1.41, weight: '20.0%', isUp: false },
          { name: '中興電', symbol: '1513.TW', price: 165.0, change: -1.5, changePercent: -0.90, weight: '18.0%', isUp: false },
          { name: '亞力', symbol: '1514.TW', price: 112.0, change: -1.0, changePercent: -0.88, weight: '12.0%', isUp: false },
          { name: '華城', symbol: '1519.TW', price: 720.0, change: -12.0, changePercent: -1.64, weight: '15.0%', isUp: false },
          { name: '大亞', symbol: '1609.TW', price: 54.0, change: 0.5, changePercent: 0.93, weight: '10.0%', isUp: true },
        ],
      },
      {
        id: 'tw-fin',
        name: '金融保險',
        color: '#3b82f6',
        change: '+0.45%',
        changeVal: 0.45,
        stocks: [
          { name: '富邦金', symbol: '2881.TW', price: 88.5, change: 0.6, changePercent: 0.68, weight: '30.0%', isUp: true },
          { name: '國泰金', symbol: '2882.TW', price: 62.0, change: 0.4, changePercent: 0.65, weight: '25.0%', isUp: true },
          { name: '中信金', symbol: '2891.TW', price: 38.2, change: 0.2, changePercent: 0.53, weight: '20.0%', isUp: true },
          { name: '元大金', symbol: '2885.TW', price: 33.5, change: 0.1, changePercent: 0.30, weight: '15.0%', isUp: true },
          { name: '兆豐金', symbol: '2886.TW', price: 40.2, change: 0.15, changePercent: 0.37, weight: '10.0%', isUp: true },
        ],
      },
      {
        id: 'tw-etf',
        name: '主動與高股息ETF',
        color: '#f59e0b',
        change: '+1.10%',
        changeVal: 1.10,
        stocks: [
          { name: '主動統一全球創新', symbol: '00988A.TW', price: 16.95, change: 0.22, changePercent: 1.32, weight: '35.0%', isUp: true },
          { name: '元大台灣50', symbol: '0050.TW', price: 185.0, change: 2.5, changePercent: 1.37, weight: '30.0%', isUp: true },
          { name: '國泰永續高股息', symbol: '00878.TW', price: 22.8, change: 0.15, changePercent: 0.66, weight: '20.0%', isUp: true },
          { name: '群益台灣精選高息', symbol: '00919.TW', price: 24.5, change: 0.18, changePercent: 0.74, weight: '15.0%', isUp: true },
        ],
      },
    ],
  },
  us: {
    title: '美股市場',
    marketInfo: '那斯達克 +1.82% ｜ 費半 +2.45%',
    sectors: [
      {
        id: 'us-ai',
        name: 'AI 算力與半導體',
        color: '#3b82f6',
        change: '+3.45%',
        changeVal: 3.45,
        stocks: [
          { name: '輝達 (NVIDIA)', symbol: 'NVDA', price: 228.87, change: 8.35, changePercent: 3.79, weight: '35.0%', isUp: true },
          { name: '超微 (AMD)', symbol: 'AMD', price: 155.20, change: 4.10, changePercent: 2.71, weight: '20.0%', isUp: true },
          { name: '博通 (Broadcom)', symbol: 'AVGO', price: 175.50, change: 5.20, changePercent: 3.05, weight: '18.0%', isUp: true },
          { name: '台積電ADR', symbol: 'TSM', price: 215.0, change: 6.0, changePercent: 2.87, weight: '15.0%', isUp: true },
          { name: '美光科技', symbol: 'MU', price: 110.0, change: 2.5, changePercent: 2.33, weight: '12.0%', isUp: true },
        ],
      },
      {
        id: 'us-space',
        name: '太空衛星',
        color: '#f43f5e',
        change: '-2.10%',
        changeVal: -2.10,
        stocks: [
          { name: '星球實驗室', symbol: 'PL', price: 16.91, change: -2.35, changePercent: -12.20, weight: '25.0%', isUp: false },
          { name: '衛星邏輯', symbol: 'SATL', price: 3.85, change: 0.12, changePercent: 3.21, weight: '20.0%', isUp: true },
          { name: '飛匯 (Flywire)', symbol: 'FLY', price: 21.50, change: 0.40, changePercent: 1.90, weight: '18.0%', isUp: true },
          { name: '火箭實驗室', symbol: 'RKLB', price: 14.20, change: -0.50, changePercent: -3.40, weight: '15.0%', isUp: false },
          { name: '維珍銀河', symbol: 'SPCE', price: 4.10, change: -0.15, changePercent: -3.53, weight: '10.0%', isUp: false },
        ],
      },
      {
        id: 'us-energy',
        name: '能源基建',
        color: '#f59e0b',
        change: '+1.45%',
        changeVal: 1.45,
        stocks: [
          { name: '奇異韋諾瓦', symbol: 'GEV', price: 185.40, change: 3.20, changePercent: 1.75, weight: '30.0%', isUp: true },
          { name: 'NextEra Energy', symbol: 'NEE', price: 78.50, change: 0.90, changePercent: 1.16, weight: '22.0%', isUp: true },
          { name: 'Constellation Energy', symbol: 'CEG', price: 245.0, change: 4.20, changePercent: 1.74, weight: '18.0%', isUp: true },
          { name: 'Vistra', symbol: 'VST', price: 115.0, change: 2.10, changePercent: 1.86, weight: '15.0%', isUp: true },
          { name: '伊頓', symbol: 'ETN', price: 320.0, change: 3.80, changePercent: 1.20, weight: '15.0%', isUp: true },
        ],
      },
      {
        id: 'us-cloud',
        name: '雲端與軟體',
        color: '#a855f7',
        change: '+0.92%',
        changeVal: 0.92,
        stocks: [
          { name: '微軟', symbol: 'MSFT', price: 420.0, change: 3.50, changePercent: 0.84, weight: '30.0%', isUp: true },
          { name: '亞馬遜', symbol: 'AMZN', price: 185.0, change: 1.80, changePercent: 0.98, weight: '25.0%', isUp: true },
          { name: '谷歌', symbol: 'GOOGL', price: 178.0, change: 1.50, changePercent: 0.85, weight: '20.0%', isUp: true },
          { name: '蘋果', symbol: 'AAPL', price: 225.0, change: 2.00, changePercent: 0.90, weight: '15.0%', isUp: true },
          { name: 'Meta', symbol: 'META', price: 510.0, change: 5.50, changePercent: 1.09, weight: '10.0%', isUp: true },
        ],
      },
      {
        id: 'us-biotech',
        name: '生技醫療',
        color: '#10b981',
        change: '-0.30%',
        changeVal: -0.30,
        stocks: [
          { name: '禮來', symbol: 'LLY', price: 780.0, change: -2.00, changePercent: -0.26, weight: '30.0%', isUp: false },
          { name: '聯合健康', symbol: 'UNH', price: 520.0, change: -1.50, changePercent: -0.29, weight: '25.0%', isUp: false },
          { name: '嬌生', symbol: 'JNJ', price: 158.0, change: 0.20, changePercent: 0.13, weight: '20.0%', isUp: true },
          { name: '輝瑞', symbol: 'PFE', price: 28.5, change: -0.10, changePercent: -0.35, weight: '15.0%', isUp: false },
          { name: '默沙東', symbol: 'MRK', price: 125.0, change: -0.40, changePercent: -0.32, weight: '10.0%', isUp: false },
        ],
      },
    ],
  },
};

interface GalaxyOrbitProps {
  currentMarket: MarketData;
  selectedSector: SectorData | null;
  onSelectSector: (sector: SectorData) => void;
  onSelectMarketCenter: () => void;
  isMarketCenterSelected: boolean;
  marketName: string;
}

export default function GalaxyOrbit({
  currentMarket,
  selectedSector,
  onSelectSector,
  onSelectMarketCenter,
  isMarketCenterSelected,
  marketName,
}: GalaxyOrbitProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [labelPositions, setLabelPositions] = useState<{ id: string; name: string; change: string; x: number; y: number; isUp: boolean; sector: SectorData; isTopInflow: boolean }[]>([]);
  const [centerLabelPos, setCenterLabelPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredSector, setHoveredSector] = useState<SectorData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffb703, 4, 150);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 高級背景星塵（靜止）
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 500;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 140;
      starPositions[i + 1] = (Math.random() - 0.5) * 100;
      starPositions[i + 2] = (Math.random() - 0.5) * 140;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.6,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    const createSoftGlowTexture = (colorHex: string) => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const cx = c.getContext('2d');
      if (cx) {
        const g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, colorHex);
        g.addColorStop(0.3, colorHex.replace('1)', '0.4)'));
        g.addColorStop(0.7, colorHex.replace('1)', '0.08)'));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g;
        cx.fillRect(0, 0, 128, 128);
      }
      return new THREE.CanvasTexture(c);
    };

    // 中心太陽
    const sunGeometry = new THREE.SphereGeometry(2.2, 64, 64);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: isMarketCenterSelected ? 1.5 : 0.8,
      roughness: 0.3,
      metalness: 0.2,
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(0, 0, 0);
    sunMesh.userData = { type: 'marketCenter' };
    scene.add(sunMesh);

    const sunGlowMat = new THREE.SpriteMaterial({
      map: createSoftGlowTexture('rgba(245, 158, 11, 1)'),
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.7,
    });
    const sunGlowSprite = new THREE.Sprite(sunGlowMat);
    sunGlowSprite.scale.set(10, 10, 1);
    scene.add(sunGlowSprite);

    // 找出當前市場資金淨流入最高（漲幅最高）的頂級板塊
    let topInflowSectorId = '';
    let maxChangeVal = -999;
    currentMarket.sectors.forEach((sec) => {
      if (sec.changeVal > maxChangeVal) {
        maxChangeVal = sec.changeVal;
        topInflowSectorId = sec.id;
      }
    });

    // 板塊星球與靜止弧形流光尾跡
    const sectorObjects: { mesh: THREE.Mesh; sector: SectorData; glowSprite: THREE.Sprite; isTopInflow: boolean }[] = [];
    const radiusStep = 2.6;

    currentMarket.sectors.forEach((sector, index) => {
      const radius = 3.5 + index * radiusStep;
      const isTopInflow = sector.id === topInflowSectorId;

      const orbitPivot = new THREE.Group();
      orbitPivot.rotation.x = 0.38 + (index % 2 === 0 ? 0.08 : -0.08);
      orbitPivot.rotation.z = (index * 0.22) - 0.4;
      scene.add(orbitPivot);

      // 軌道底線
      const orbitGeo = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 128);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: sector.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isTopInflow ? 0.45 : 0.15,
      });
      const orbitLine = new THREE.Mesh(orbitGeo, orbitMat);
      orbitLine.rotation.x = Math.PI / 2;
      orbitPivot.add(orbitLine);

      // 靜止的高密度平滑弧形流光尾跡
      const trailPointsCount = 60;
      const points: THREE.Vector3[] = [];
      const angle = (index / currentMarket.sectors.length) * Math.PI * 2;
      const totalSpanAngle = 1.3;

      for (let i = 0; i < trailPointsCount; i++) {
        const tRatio = i / (trailPointsCount - 1);
        const sampleAngle = angle - (1 - tRatio) * totalSpanAngle;
        const px = Math.cos(sampleAngle) * radius;
        const pz = Math.sin(sampleAngle) * radius;
        const py = Math.sin(sampleAngle * 1.4) * 0.6 * tRatio;
        points.push(new THREE.Vector3(px, py, pz));
      }

      const trailGeo = new THREE.BufferGeometry().setFromPoints(points);
      const colorAttr = new Float32Array(trailPointsCount * 3);
      const baseColor = new THREE.Color(sector.color);
      
      for (let i = 0; i < trailPointsCount; i++) {
        const ratio = i / (trailPointsCount - 1);
        const alpha = Math.pow(ratio, 2.5) * (isTopInflow ? 1.5 : 1.0);
        colorAttr[i * 3] = baseColor.r * alpha;
        colorAttr[i * 3 + 1] = baseColor.g * alpha;
        colorAttr[i * 3 + 2] = baseColor.b * alpha;
      }
      trailGeo.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3));

      const trailMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: isTopInflow ? 1.0 : 0.9,
        blending: THREE.AdditiveBlending,
      });
      const trailLine = new THREE.Line(trailGeo, trailMat);
      orbitPivot.add(trailLine);

      // 行星本體
      const planetSize = (0.45 + (index < 2 ? 0.08 : 0.02)) * (isTopInflow ? 1.25 : 1.0);
      const planetGeo = new THREE.SphereGeometry(planetSize, 64, 64);
      const planetMat = new THREE.MeshStandardMaterial({
        color: sector.color,
        roughness: 0.2,
        metalness: 0.7,
        emissive: sector.color,
        emissiveIntensity: isTopInflow ? 0.75 : 0.35,
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);

      // 行星外暈
      const glowMat = new THREE.SpriteMaterial({
        map: createSoftGlowTexture(sector.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: isTopInflow ? 0.85 : 0.55,
      });
      const glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.set(planetSize * (isTopInflow ? 5.2 : 3.8), planetSize * (isTopInflow ? 5.2 : 3.8), 1);
      planetMesh.add(glowSprite);

      const heightOffset = Math.sin(index * 1.4) * 0.6;
      planetMesh.position.set(Math.cos(angle) * radius, heightOffset, Math.sin(angle) * radius);
      planetMesh.userData = { type: 'sector', sector };
      orbitPivot.add(planetMesh);

      sectorObjects.push({
        mesh: planetMesh,
        sector,
        glowSprite,
        isTopInflow,
      });
    });

    let isTransitioning = false;
    let cameraTargetPos = new THREE.Vector3(0, 15, 28);
    let cameraLookAtTarget = new THREE.Vector3(0, 0, 0);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let hitObject: any = intersects[0].object;
        if (hitObject.userData.type === 'marketCenter') {
          onSelectMarketCenter();
          cameraTargetPos.set(0, 15, 28);
          cameraLookAtTarget.set(0, 0, 0);
          isTransitioning = true;
        } else {
          while (hitObject && !hitObject.userData?.sector && hitObject.parent) {
            hitObject = hitObject.parent;
          }
          if (hitObject?.userData?.sector) {
            const sector = hitObject.userData.sector;
            onSelectSector(sector);
            const foundObj = sectorObjects.find((o) => o.sector.id === sector.id);
            if (foundObj) {
              const worldPos = foundObj.mesh.getWorldPosition(new THREE.Vector3());
              cameraTargetPos.copy(worldPos).add(new THREE.Vector3(0, 2.5, 5.5));
              cameraLookAtTarget.copy(worldPos);
              isTransitioning = true;
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', onClick);

    let animationFrameId: number;
    let accumulatedTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      accumulatedTime += 0.016;

      const sunPulse = 0.8 + Math.sin(accumulatedTime * 2.5) * 0.35;
      sunMaterial.emissiveIntensity = isMarketCenterSelected ? 1.8 : sunPulse;

      const newLabels: any[] = [];
      sectorObjects.forEach((obj, idx) => {
        if (obj.isTopInflow) {
          const resonance = 0.75 + Math.sin(accumulatedTime * 5.5) * 0.35;
          obj.glowSprite.material.opacity = resonance;
        }

        const vector = obj.mesh.getWorldPosition(new THREE.Vector3());
        vector.project(camera);

        const sx = (vector.x * 0.5 + 0.5) * container.clientWidth;
        const sy = (-(vector.y * 0.5) + 0.5) * container.clientHeight;

        newLabels.push({
          id: obj.sector.id,
          name: obj.sector.name,
          change: obj.sector.change,
          x: sx,
          y: sy,
          isUp: obj.sector.changeVal >= 0,
          sector: obj.sector,
          isTopInflow: obj.isTopInflow,
        });
      });

      const sunVector = sunMesh.getWorldPosition(new THREE.Vector3());
      sunVector.project(camera);
      const sunSx = (sunVector.x * 0.5 + 0.5) * container.clientWidth;
      const sunSy = (-(sunVector.y * 0.5) + 0.5) * container.clientHeight;
      setCenterLabelPos({ x: sunSx, y: sunSy - 55 });

      if (isTransitioning) {
        camera.position.lerp(cameraTargetPos, 0.05);
        if (camera.position.distanceTo(cameraTargetPos) < 0.1) {
          isTransitioning = false;
        }
      }
      camera.lookAt(cameraLookAtTarget);

      setLabelPositions(newLabels);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentMarket, isMarketCenterSelected]);

  const containerHeight = containerRef.current?.clientHeight || 520;
  const containerWidth = containerRef.current?.clientWidth || 600;
  const isNearBottom = hoverPos ? hoverPos.y > containerHeight - 170 : false;
  const isNearRight = hoverPos ? hoverPos.x > containerWidth - 190 : false;

  return (
    <div ref={containerRef} className="w-full h-[520px] relative overflow-visible bg-gradient-to-b from-[#030712] via-[#090d16] to-[#030712] rounded-xl border border-slate-800/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      <div ref={mountRef} className="w-full h-full absolute inset-0 overflow-visible pointer-events-auto" />

      {/* ✨ 資金重倉快訊橫幅 (左上角) */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-xl pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
        <span className="text-[11px] font-mono text-slate-200 tracking-wide whitespace-nowrap">
          {marketName === '台股市場' ? '🔥 資金重倉：半導體板塊強勢流入' : '🚀 資金重倉：AI 算力與半導體強勢流入'}
        </span>
      </div>

      {/* 太陽中心標籤 */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 pointer-events-auto cursor-pointer"
        style={{ left: centerLabelPos.x, top: centerLabelPos.y }}
        onClick={onSelectMarketCenter}
      >
        <div className={`px-3.5 py-1.5 rounded-xl text-xs font-black shadow-2xl border flex items-center gap-1.5 backdrop-blur-md transition-transform hover:scale-110 ${isMarketCenterSelected ? 'bg-amber-500 text-slate-950 border-amber-200 shadow-[0_0_35px_rgba(245,158,11,0.95)] scale-110' : 'bg-slate-950/90 text-amber-400 border-amber-500/50 hover:border-amber-400'}`}>
          <span>☀️</span>
          <span>{marketName}</span>
        </div>
      </div>

      {/* 各個板塊星球標籤 */}
      {labelPositions.map((label) => {
        const isSelected = selectedSector?.id === label.id;
        const displayName = label.name === '主動與高股息ETF' ? '高股息ETF' : label.name;
        
        // 智慧邊界防護：若標籤太靠近頂部，將其向下微調以防超出畫面
        const adjustedTop = label.y < 45 ? label.y + 10 : label.y - 30;
        // 若最上方標籤太靠近右側，改為靠右對齊或向左偏移
        const isTooCloseToTopEdge = label.y < 45;

        return (
          <div
            key={label.id}
            className={`absolute transform transition-all duration-300 pointer-events-auto cursor-pointer max-w-[150px] truncate ${isTooCloseToTopEdge ? 'translate-x-2' : '-translate-x-1/2'} -translate-y-1/2 ${isSelected ? 'scale-115 z-30' : 'z-20 hover:scale-105'}`}
            style={{ left: label.x, top: adjustedTop }}
            onClick={(e) => {
              e.stopPropagation();
              if (hoveredSector?.id !== label.sector.id && window.innerWidth < 768) {
                setHoveredSector(label.sector);
                setHoverPos({ x: label.x, y: label.y });
              } else {
                onSelectSector(label.sector);
              }
            }}
            onMouseEnter={() => {
              setHoveredSector(label.sector);
              setHoverPos({ x: label.x, y: label.y });
            }}
            onMouseLeave={() => {
              setHoveredSector(null);
              setHoverPos(null);
            }}
          >
            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold shadow-lg border flex items-center gap-1.5 backdrop-blur-md transition-all truncate ${label.isTopInflow ? 'bg-slate-950/95 text-white border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : ''} ${isSelected ? 'bg-slate-950/95 text-white border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.8)] font-black' : (!label.isTopInflow ? 'bg-slate-950/80 text-white border-slate-700/60 hover:border-slate-500' : '')}`}>
              {label.isTopInflow && <span className="text-amber-400 text-[10px] flex-shrink-0">🔥</span>}
              <span className={`truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`} title={label.name}>{displayName}</span>
              <span className={`font-mono text-[11px] flex-shrink-0 ${label.isUp ? 'text-red-400 font-extrabold' : 'text-green-400 font-extrabold'}`}>{label.change}</span>
            </div>
          </div>
        );
      })}

      {/* 全域頂層最高層 (z-50) 核心持股預覽小卡 */}
      {hoveredSector && hoverPos && (
        <div
          className={`absolute w-52 bg-slate-950/95 border border-slate-700/80 rounded-lg p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md z-50 pointer-events-none animate-fadeIn`}
          style={{
            left: isNearRight ? hoverPos.x - 180 : hoverPos.x,
            top: isNearBottom ? hoverPos.y - 145 : hoverPos.y + 15,
            transform: isNearRight ? 'none' : 'translateX(-50%)',
          }}
        >
          <div className="text-[10px] font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1 flex justify-between">
            <span>{hoveredSector.name} 核心成分</span>
            <span className="text-amber-400">權重 / 漲跌</span>
          </div>
          <div className="space-y-1">
            {hoveredSector.stocks.slice(0, 3).map((st, sIdx) => (
              <div key={sIdx} className="flex justify-between items-center text-[10px]">
                <span className="text-slate-200 truncate max-w-[95px]">{st.name}</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400">{st.weight}</span>
                  <span className={st.isUp ? 'text-red-400' : 'text-green-400'}>
                    {st.isUp ? '+' : ''}{st.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}