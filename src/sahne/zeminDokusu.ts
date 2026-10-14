import * as THREE from 'three';
import type { GorunusSecenegi } from '../oyun/gorunus';

// İç zemin desenleri (belge 0.11): bir doku bir arazi karesini (4 m) kaplar.
// Kodla çizilir; dosya yüklemez. Aynı seçenek için doku bir kez üretilir.

const BOY = 512; // piksel; 4 m → 1 m = 128 px
const M = BOY / 4;
const onbellek = new Map<string, THREE.CanvasTexture>();

// Sabit tohumlu basit rastgele: desen her açılışta aynı çıksın
function rastgele(tohum: number) {
  let t = tohum;
  return () => {
    t = (t * 16807) % 2147483647;
    return (t - 1) / 2147483646;
  };
}

export function zeminDokusu(s: GorunusSecenegi): THREE.CanvasTexture {
  const var_ = onbellek.get(s.id);
  if (var_) return var_;
  const c = document.createElement('canvas');
  c.width = c.height = BOY;
  const g = c.getContext('2d')!;
  const a = s.renk;
  const b = s.ikinciRenk ?? s.renk;
  const r = rastgele(7);
  g.fillStyle = a;
  g.fillRect(0, 0, BOY, BOY);
  switch (s.desen) {
    case 'tahta': {
      // 20 cm'lik tahtalar, uçları kaydırılmış
      const en = M * 0.2;
      for (let y = 0, n = 0; y < BOY; y += en, n++) {
        g.fillStyle = n % 2 ? a : b;
        g.fillRect(0, y, BOY, en);
        const kayma = (n * 0.37 % 1) * M * 1.2;
        g.fillStyle = 'rgba(0,0,0,0.18)';
        g.fillRect(0, y, BOY, 2);
        for (let x = kayma; x < BOY; x += M * 1.2) g.fillRect(x, y, 2, en);
      }
      break;
    }
    case 'dama': {
      const en = M * 0.4;
      g.fillStyle = b;
      for (let y = 0; y < BOY / en; y++) for (let x = 0; x < BOY / en; x++) if ((x + y) % 2) g.fillRect(x * en, y * en, en, en);
      break;
    }
    case 'mozaik': {
      // 10 cm'lik küçük karolar; ara ara mavi
      const en = M * 0.1;
      for (let y = 0; y < BOY; y += en)
        for (let x = 0; x < BOY; x += en) {
          const t = r();
          g.fillStyle = t < 0.28 ? b : t < 0.36 ? '#a9cfe0' : a;
          g.fillRect(x + 1, y + 1, en - 2, en - 2);
        }
      g.globalCompositeOperation = 'destination-over';
      g.fillStyle = '#c9c2b6';
      g.fillRect(0, 0, BOY, BOY);
      g.globalCompositeOperation = 'source-over';
      break;
    }
    case 'karo': {
      // 30 cm'lik pişmiş toprak karolar, açık derz
      const en = M * 0.3;
      g.fillStyle = '#e3cdb4';
      g.fillRect(0, 0, BOY, BOY);
      for (let y = 0; y < BOY; y += en)
        for (let x = 0; x < BOY; x += en) {
          g.fillStyle = r() < 0.5 ? a : b;
          g.fillRect(x + 2, y + 2, en - 4, en - 4);
        }
      break;
    }
    case 'terrazzo': {
      for (let i = 0; i < 1400; i++) {
        const t = r();
        g.fillStyle = t < 0.5 ? b : t < 0.75 ? '#c9b3df' : '#f3d77a';
        g.beginPath();
        g.arc(r() * BOY, r() * BOY, 1.5 + r() * 3.5, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'cila': {
      // 1 m'lik dökme beton derzleri ve hafif lekeler
      for (let i = 0; i < 40; i++) {
        g.fillStyle = 'rgba(0,0,0,0.035)';
        g.beginPath();
        g.arc(r() * BOY, r() * BOY, 20 + r() * 50, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = b;
      for (let x = 0; x < BOY; x += M) {
        g.fillRect(x, 0, 2, BOY);
        g.fillRect(0, x, BOY, 2);
      }
      break;
    }
  }
  const doku = new THREE.CanvasTexture(c);
  doku.colorSpace = THREE.SRGBColorSpace;
  doku.anisotropy = 4;
  onbellek.set(s.id, doku);
  return doku;
}
