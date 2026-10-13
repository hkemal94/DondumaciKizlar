// Dekorasyon (belge bölüm 4; Kemal, 13 Ekim): genel olanlar (ışıklandırma,
// seviyeli) ve taşınabilir eşyalar (alınır, depoya gider, kareli zemine
// elle yerleştirilir). Fiyatlar ve etkiler geçici.

export type Esya = 'masa' | 'semsiyeliMasa' | 'saksi';

export const ESYALAR: { id: Esya; fiyat: number }[] = [
  { id: 'saksi', fiyat: 60 },
  { id: 'masa', fiyat: 200 },
  { id: 'semsiyeliMasa', fiyat: 320 },
];

// Işıklandırma seviyeleri: 1 fenerler, 2 asma ampuller, 3 ışıklı şerit.
// Her seviye bir öncekinin üstüne eklenir.
export const ISIK_SEVIYELERI = [
  { seviye: 1, fiyat: 120 },
  { seviye: 2, fiyat: 300 },
  { seviye: 3, fiyat: 600 },
];
export const EN_YUKSEK_ISIK = ISIK_SEVIYELERI.length;

// Yerleştirme kareleri: terasta iki-üç sıra, içeride köşeler.
// Müşterilerin yürüdüğü yol (iskele hattı ve kapının önü) boş bırakılır.
export interface Hucre {
  x: number;
  z: number;
  ic: boolean; // dükkânın içi mi
}

const KARE = 1.2;
const KAPI_ARALIGI: [number, number] = [-4.7, -2.1]; // kapının önü boş

function hucreleriKur(): Hucre[] {
  const h: Hucre[] = [];
  // Teras: duvar dibi sırası, iskele yolunun ötesinde iki sıra
  for (const z of [-3.05, -5.35, -6.55]) {
    for (let i = -9; i <= 9; i++) {
      const x = i * KARE;
      if (z === -3.05 && x > KAPI_ARALIGI[0] && x < KAPI_ARALIGI[1]) continue;
      h.push({ x, z, ic: false });
    }
  }
  // İçerisi: müşteri tarafının sağ köşesi ve tezgahın arkasındaki köşeler
  for (const x of [1.7, 2.9]) h.push({ x, z: -1.78, ic: true });
  for (const x of [-2.6, 2.6]) h.push({ x, z: 0.7, ic: true });
  return h;
}

export const HUCRELER = hucreleriKur();
export const KARE_BOYU = KARE;
