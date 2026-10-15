import { useMemo } from 'react';
import * as THREE from 'three';
import type { Esya } from '../oyun/dekorasyon';
import { renk } from './renkler';

// İç süsler (C4, belge 0.11): halılar ve tablolar. Desenler kodla çizilir;
// tablolarda kurgu ya da Düzada'ya özel bir yer yok: soyut desen, dondurma,
// genel bir deniz ve tekne silueti. Boş çerçeve Kemal'in resmini bekler.

const dokular = new Map<string, THREE.CanvasTexture>();
function cizilmisDoku(ad: string, en: number, boy: number, ciz: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const var_ = dokular.get(ad);
  if (var_) return var_;
  const c = document.createElement('canvas');
  c.width = en;
  c.height = boy;
  ciz(c.getContext('2d')!, en, boy);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  dokular.set(ad, t);
  return t;
}

// ---- Halılar ----
function paspasDokusu() {
  return cizilmisDoku('paspas', 256, 128, (g, w, h) => {
    g.fillStyle = renk.krem;
    g.fillRect(0, 0, w, h);
    const seritler = [renk.mor, renk.sari, renk.mor];
    seritler.forEach((r, i) => {
      g.fillStyle = r;
      g.fillRect(0, 24 + i * 32, w, 16);
    });
    g.strokeStyle = renk.morKoyu;
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
  });
}

function yuvarlakDokusu() {
  return cizilmisDoku('haliYuvarlak', 256, 256, (g, w) => {
    const halkalar = [renk.mor, renk.krem, renk.sari, renk.krem, renk.morAcik, renk.krem];
    halkalar.forEach((r, i) => {
      g.fillStyle = r;
      g.beginPath();
      g.arc(w / 2, w / 2, w / 2 - i * 20, 0, Math.PI * 2);
      g.fill();
    });
  });
}

function kilimDokusu() {
  return cizilmisDoku('haliKilim', 384, 256, (g, w, h) => {
    g.fillStyle = renk.kiremit;
    g.fillRect(0, 0, w, h);
    g.fillStyle = renk.krem;
    g.fillRect(16, 16, w - 32, h - 32);
    g.fillStyle = '#b4614d';
    g.fillRect(28, 28, w - 56, h - 56);
    // Ortada baklava sırası
    const renkler = [renk.krem, renk.sari, '#5f8fa8'];
    for (let i = 0; i < 5; i++) {
      const x = 70 + i * 61;
      g.fillStyle = renkler[i % 3];
      g.beginPath();
      g.moveTo(x, h / 2 - 50);
      g.lineTo(x + 26, h / 2);
      g.lineTo(x, h / 2 + 50);
      g.lineTo(x - 26, h / 2);
      g.closePath();
      g.fill();
      g.fillStyle = '#b4614d';
      g.fillRect(x - 6, h / 2 - 6, 12, 12);
    }
  });
}

function Hali({ esya }: { esya: Esya }) {
  if (esya === 'haliYuvarlak')
    return (
      <mesh position={[0, 0.012, 0]} receiveShadow>
        <cylinderGeometry args={[0.92, 0.92, 0.02, 32]} />
        <meshStandardMaterial attach="material-0" color={renk.mor} roughness={1} />
        <meshStandardMaterial attach="material-1" map={yuvarlakDokusu()} roughness={1} />
        <meshStandardMaterial attach="material-2" color={renk.mor} roughness={1} />
      </mesh>
    );
  const [en, boy, doku] = esya === 'haliKilim' ? [2.8, 1.8, kilimDokusu()] : [1.7, 0.8, paspasDokusu()];
  return (
    <mesh position={[0, 0.012, 0]} receiveShadow>
      <boxGeometry args={[en, 0.02, boy]} />
      <meshStandardMaterial map={doku} roughness={1} />
    </mesh>
  );
}

// ---- Tablolar ----
function tabloDokusu(esya: Esya) {
  return cizilmisDoku(esya, 256, 200, (g, w, h) => {
    if (esya === 'tabloSoyut') {
      g.fillStyle = renk.krem;
      g.fillRect(0, 0, w, h);
      g.fillStyle = renk.mor;
      g.beginPath();
      g.arc(90, 110, 62, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = renk.sari;
      g.fillRect(140, 30, 70, 140);
      g.fillStyle = renk.kiremit;
      g.beginPath();
      g.arc(170, 150, 34, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#5f8fa8';
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(20, 40);
      g.bezierCurveTo(70, 0, 110, 80, 160, 30);
      g.stroke();
    } else if (esya === 'tabloDondurma') {
      g.fillStyle = '#f6e3a4';
      g.fillRect(0, 0, w, h);
      // Külah ve üç top
      g.fillStyle = '#c99a6b';
      g.beginPath();
      g.moveTo(98, 108);
      g.lineTo(158, 108);
      g.lineTo(128, 190);
      g.closePath();
      g.fill();
      [['#ff8fb1', 104, 92], ['#fff0c8', 152, 92], ['#8a4b2e', 128, 58]].forEach(([r, x, y]) => {
        g.fillStyle = r as string;
        g.beginPath();
        g.arc(x as number, y as number, 30, 0, Math.PI * 2);
        g.fill();
      });
      g.fillStyle = '#c0392b';
      g.beginPath();
      g.arc(128, 26, 9, 0, Math.PI * 2);
      g.fill();
    } else if (esya === 'tabloDeniz') {
      const gok = g.createLinearGradient(0, 0, 0, h);
      gok.addColorStop(0, '#a9cfe0');
      gok.addColorStop(1, '#fbf1e3');
      g.fillStyle = gok;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffc928';
      g.beginPath();
      g.arc(200, 50, 22, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#2f7fb3';
      g.fillRect(0, 130, w, h - 130);
      // Yelkenli silueti
      g.fillStyle = '#3a3340';
      g.beginPath();
      g.moveTo(80, 125);
      g.lineTo(140, 125);
      g.lineTo(130, 138);
      g.lineTo(90, 138);
      g.closePath();
      g.fill();
      g.fillStyle = '#fbf8f1';
      g.beginPath();
      g.moveTo(108, 60);
      g.lineTo(108, 120);
      g.lineTo(138, 120);
      g.closePath();
      g.fill();
      // Dalgalar ve martı
      g.strokeStyle = '#a9cfe0';
      g.lineWidth = 4;
      for (const y of [155, 178]) {
        g.beginPath();
        for (let x = 0; x <= w; x += 32) g.arc(x + 16, y, 16, Math.PI, 0);
        g.stroke();
      }
      g.strokeStyle = '#3a3340';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(40, 50);
      g.quadraticCurveTo(50, 40, 58, 50);
      g.quadraticCurveTo(66, 40, 76, 50);
      g.stroke();
    } else {
      // Boş çerçeve: Kemal'in resmini bekler
      g.fillStyle = '#f7f3ea';
      g.fillRect(0, 0, w, h);
    }
  });
}

export const TABLO_YUKSEKLIGI = 1.75;
function Tablo({ esya }: { esya: Esya }) {
  const doku = useMemo(() => tabloDokusu(esya), [esya]);
  return (
    <group position={[0, TABLO_YUKSEKLIGI, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.82, 0.66, 0.05]} />
        <meshStandardMaterial color={esya === 'tabloBos' ? renk.ahsapAcik : renk.ahsapKoyu} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[0.7, 0.55]} />
        <meshStandardMaterial map={doku} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function IcSus({ esya }: { esya: Esya }) {
  return esya.startsWith('tablo') ? <Tablo esya={esya} /> : <Hali esya={esya} />;
}
