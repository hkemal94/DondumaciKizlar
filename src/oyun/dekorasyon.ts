// Dekorasyon (belge bölüm 4; Kemal, 13 Ekim): genel olanlar (ışıklandırma,
// seviyeli) ve taşınabilir eşyalar (alınır, depoya gider, kareli zemine
// elle yerleştirilir). Fiyatlar ve etkiler geçici.

export type Esya =
  | 'masa'
  | 'semsiyeliMasa'
  | 'saksi'
  | 'bank'
  | 'karaTahta'
  | 'isikliTabela'
  | 'kulahFiguru'
  | 'flama'
  | 'cicekKasasi'
  | 'bisiklet'
  | 'copKutusu'
  | 'sokakLambasi';

// grup: mağazadaki başlık. disari: yalnız dükkânın dışına konur (14 Ekim:
// "özellikle dükkân dışı için tabela benzeri ürünler").
export const ESYALAR: { id: Esya; fiyat: number; grup: 'oturma' | 'dis'; disari?: boolean }[] = [
  { id: 'saksi', fiyat: 60, grup: 'oturma' },
  { id: 'masa', fiyat: 200, grup: 'oturma' },
  { id: 'semsiyeliMasa', fiyat: 320, grup: 'oturma', disari: true },
  { id: 'bank', fiyat: 140, grup: 'oturma', disari: true },
  { id: 'copKutusu', fiyat: 50, grup: 'dis', disari: true },
  { id: 'cicekKasasi', fiyat: 80, grup: 'dis', disari: true },
  { id: 'karaTahta', fiyat: 90, grup: 'dis', disari: true },
  { id: 'flama', fiyat: 110, grup: 'dis', disari: true },
  { id: 'sokakLambasi', fiyat: 160, grup: 'dis', disari: true },
  { id: 'bisiklet', fiyat: 180, grup: 'dis', disari: true },
  { id: 'isikliTabela', fiyat: 260, grup: 'dis', disari: true },
  { id: 'kulahFiguru', fiyat: 380, grup: 'dis', disari: true },
];

// Işıklandırma seviyeleri: 1 fenerler, 2 asma ampuller, 3 ışıklı şerit.
// Her seviye bir öncekinin üstüne eklenir.
export const ISIK_SEVIYELERI = [
  { seviye: 1, fiyat: 120 },
  { seviye: 2, fiyat: 300 },
  { seviye: 3, fiyat: 600 },
];
export const EN_YUKSEK_ISIK = ISIK_SEVIYELERI.length;

// ---- Arazi (belge 0.1 ve 0.2; Kemal, 14 Ekim) ----
// Dükkânın çevresi ~4×4 m'lik karelere (parsel) bölünür, her parsel ayrı
// alınır. Sütun i: x = 4i … 4i+4 (dükkân i = -1 ve 0). Satır j: -1 ön teras
// (yürüyüş yolu ile dükkân arası), 0 dükkân sırası, 1 ve 2 arka.
// Başta yalnız dükkânın içi ve kapının önü oyuncunun.
export const PARSEL = 4;
export const SUTUN_EN_AZ = -10;
export const SUTUN_EN_COK = 9;
export const SATIR_EN_AZ = -1;
export const SATIR_EN_COK = 2;
// Satırların z sınırları (ön → arka). Dükkân sırası duvara göre biraz derin.
const SATIR_Z: Record<number, [number, number]> = {
  [-1]: [-6.4, -2.4],
  0: [-2.4, 2.05],
  1: [2.05, 6.05],
  2: [6.05, 10.05],
};
export const YURUYUS_Z = -7.3; // yürüyüş yolu: ön terasın deniz tarafı
export const KAPI_KORIDORU = -3.4; // kapının x'i: önündeki yol boş kalır

export const DUKKAN_PARSELLERI = ['-1,0', '0,0'];
export const BASLANGIC_PARSELLERI = [...DUKKAN_PARSELLERI, '-1,-1'];

export function parselAnahtari(i: number, j: number) {
  return `${i},${j}`;
}
export function parselCoz(anahtar: string) {
  const [i, j] = anahtar.split(',').map(Number);
  return { i, j };
}
export function parselSiniri(i: number, j: number) {
  const [onZ, arkaZ] = SATIR_Z[j];
  return { solX: i * PARSEL, sagX: i * PARSEL + PARSEL, onZ, arkaZ };
}
export function parselGecerli(i: number, j: number) {
  return i >= SUTUN_EN_AZ && i <= SUTUN_EN_COK && j >= SATIR_EN_AZ && j <= SATIR_EN_COK;
}

// Fiyat: ön teras pahalı, arka ucuz; iskele tarafı (x < 0) biraz daha
// pahalı; her alımda artar. Sayılar geçici (belge: "bugünkü gibi").
export function parselFiyati(i: number, j: number, alinanSayisi: number) {
  const taban = j === -1 ? 250 : j === 0 ? 200 : 150;
  const iskele = i < 0 ? 1.15 : 1;
  return Math.round((taban * iskele * (1 + 0.2 * alinanSayisi)) / 10) * 10;
}

// Yerleştirme kareleri: her parselde 3×3 kare; dükkânın içinde eskisi gibi
// birkaç özel köşe. Kapının önünden yürüyüş yoluna giden yol boş kalır.
// Kayıtta kare kimliğiyle tutulur ("parsel:a,b" ya da "ic:n").
export interface Hucre {
  id: string;
  x: number;
  z: number;
  ic: boolean; // dükkânın içi mi
  parsel: string;
  arkada?: boolean; // tezgahın arkası (müşteri oturmaz)
}

const KARE = 1.2;

function hucreleriKur(): Hucre[] {
  const h: Hucre[] = [];
  // İçerisi: müşteri tarafının sağ köşesi ve tezgahın arkasındaki köşeler
  [1.7, 2.9].forEach((x, n) => h.push({ id: `ic:${n}`, x, z: -1.78, ic: true, parsel: '0,0' }));
  h.push({ id: 'ic:2', x: -2.6, z: 0.7, ic: true, arkada: true, parsel: '-1,0' });
  h.push({ id: 'ic:3', x: 2.6, z: 0.7, ic: true, arkada: true, parsel: '0,0' });
  for (let i = SUTUN_EN_AZ; i <= SUTUN_EN_COK; i++)
    for (let j = SATIR_EN_AZ; j <= SATIR_EN_COK; j++) {
      const parsel = parselAnahtari(i, j);
      if (DUKKAN_PARSELLERI.includes(parsel)) continue;
      const { solX, onZ, arkaZ } = parselSiniri(i, j);
      const adimZ = (arkaZ - onZ) / 3;
      for (let a = 0; a < 3; a++)
        for (let b = 0; b < 3; b++) {
          const x = solX + (PARSEL / 3) * (a + 0.5);
          const z = onZ + adimZ * (b + 0.5);
          if (j === -1 && Math.abs(x - KAPI_KORIDORU) < 0.8) continue; // kapının önü
          h.push({ id: `${parsel}:${a},${b}`, x, z, ic: false, parsel });
        }
    }
  return h;
}

export const HUCRELER = hucreleriKur();
const HUCRE_HARITASI = new Map(HUCRELER.map((h) => [h.id, h]));
export function hucreBul(id: string) {
  return HUCRE_HARITASI.get(id);
}
export const KARE_BOYU = KARE;

// 14 Ekim öncesi kayıtlardaki kareler (sıra numarasıyla) ve alanlar: yalnız
// eski kaydı yeni araziye taşırken kullanılır.
export type EskiBolge = 'solYan' | 'sagYan' | 'solYol' | 'sagYol';
export function eskiHucreler(): { x: number; z: number; bolge?: EskiBolge }[] {
  const h: { x: number; z: number; bolge?: EskiBolge }[] = [];
  for (const z of [-3.05, -5.35, -6.55]) {
    for (let i = -9; i <= 9; i++) {
      const x = i * KARE;
      if (z === -3.05 && x > -4.7 && x < -2.1) continue;
      h.push({ x, z, bolge: x > 4.2 ? 'solYol' : x < -4.2 ? 'sagYol' : undefined });
    }
  }
  for (const x of [1.7, 2.9]) h.push({ x, z: -1.78 });
  for (const x of [-2.6, 2.6]) h.push({ x, z: 0.7 });
  for (const yon of [1, -1] as const)
    for (const z of [-1.6, -0.4, 0.8])
      for (const x of [5.0, 6.2, 7.4, 8.6]) h.push({ x: yon * x, z, bolge: yon > 0 ? 'solYan' : 'sagYan' });
  return h;
}

// Bir noktanın bulunduğu parsel
export function noktaninParseli(x: number, z: number) {
  const i = Math.floor(x / PARSEL);
  for (let j = SATIR_EN_AZ; j <= SATIR_EN_COK; j++) {
    const [onZ, arkaZ] = SATIR_Z[j];
    if (z >= onZ && z < arkaZ) return parselAnahtari(i, j);
  }
  return null;
}
