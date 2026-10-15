import { AYAR } from './ayarlar';

// Çalışanın yetenekleri (belge 0.12, 8b; Kemal, 15 Ekim): çalışan her
// seviyede yetenek puanı kazanır, oyuncu puanı ağaçta istediği yeteneğe
// harcar. Her yeteneğin 3 basamağı var; sayılar ayar dosyasında.
export type Yetenek = 'ustaKepce' | 'hizliEller' | 'sohbet' | 'gulerYuz';
export const YETENEKLER: Yetenek[] = ['ustaKepce', 'hizliEller', 'sohbet', 'gulerYuz'];
export const EN_COK_BASAMAK = 3;
export type Yetenekler = Record<Yetenek, number>; // alınmış basamak (0–3)
export const BOS_YETENEKLER: Yetenekler = { ustaKepce: 0, hizliEller: 0, sohbet: 0, gulerYuz: 0 };

const Y = AYAR.yetenek as Record<string, number>;

// n. basamağın bedeli (1–3)
export function basamakBedeli(basamak: number) {
  return Y[`basamak${basamak}`] ?? basamak;
}

// Yeteneğin o basamaktaki etkisi (oran; 0 = yok)
export function yetenekEtkisi(y: Yetenek, basamak: number) {
  return basamak <= 0 ? 0 : (Y[`${y}${Math.min(basamak, EN_COK_BASAMAK)}`] ?? 0);
}

export function kazanilanPuan(calisanSeviyesi: number) {
  return Math.max(0, calisanSeviyesi - 1) * AYAR.yetenek.puanSeviyeBasina;
}

export function harcananPuan(y: Yetenekler) {
  let t = 0;
  for (const ad of YETENEKLER) for (let b = 1; b <= y[ad]; b++) t += basamakBedeli(b);
  return t;
}

export function yetenekleriOku(ham: unknown): Yetenekler {
  const k = (ham && typeof ham === 'object' ? ham : {}) as Partial<Yetenekler>;
  const basamak = (n: unknown) => (typeof n === 'number' && Number.isInteger(n) ? Math.max(0, Math.min(EN_COK_BASAMAK, n)) : 0);
  return { ustaKepce: basamak(k.ustaKepce), hizliEller: basamak(k.hizliEller), sohbet: basamak(k.sohbet), gulerYuz: basamak(k.gulerYuz) };
}
