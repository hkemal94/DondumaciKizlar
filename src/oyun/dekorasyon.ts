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

// Satın alınan alanlar (Kemal, 14 Ekim): dükkânın iki yanı ve yol
// kenarındaki teras. Yalnız dükkânın hizasındaki teras başta açık.
// Adlar genel görünümde ekranda göründüğü yana göre (x < 0 ekranın sağı).
export type Bolge = 'solYan' | 'sagYan' | 'solYol' | 'sagYol';

export const BOLGELER: { id: Bolge; fiyat: number }[] = [
  { id: 'solYan', fiyat: 250 },
  { id: 'sagYan', fiyat: 250 },
  { id: 'solYol', fiyat: 400 },
  { id: 'sagYol', fiyat: 400 },
];

// Yerleştirme kareleri: terasta iki-üç sıra, içeride köşeler, iki yanda
// alınabilir alanlar. Müşterilerin yürüdüğü yol (iskele hattı ve kapının
// önü) boş bırakılır. Kayıtta kareler sıra numarasıyla tutulur: yeni kare
// yalnız listenin SONUNA eklenir.
export interface Hucre {
  x: number;
  z: number;
  ic: boolean; // dükkânın içi mi
  bolge?: Bolge; // yoksa başta açık
  arkada?: boolean; // tezgahın arkası (müşteri oturmaz)
}

const KARE = 1.2;
const KAPI_ARALIGI: [number, number] = [-4.7, -2.1]; // kapının önü boş
const DUKKAN_HIZASI = 4.2; // bu genişliğin dışındaki teras yol kenarı alanıdır

function hucreleriKur(): Hucre[] {
  const h: Hucre[] = [];
  // Teras: duvar dibi sırası, iskele yolunun ötesinde iki sıra
  for (const z of [-3.05, -5.35, -6.55]) {
    for (let i = -9; i <= 9; i++) {
      const x = i * KARE;
      if (z === -3.05 && x > KAPI_ARALIGI[0] && x < KAPI_ARALIGI[1]) continue;
      const bolge: Bolge | undefined = x > DUKKAN_HIZASI ? 'solYol' : x < -DUKKAN_HIZASI ? 'sagYol' : undefined;
      h.push({ x, z, ic: false, bolge });
    }
  }
  // İçerisi: müşteri tarafının sağ köşesi ve tezgahın arkasındaki köşeler
  for (const x of [1.7, 2.9]) h.push({ x, z: -1.78, ic: true });
  for (const x of [-2.6, 2.6]) h.push({ x, z: 0.7, ic: true, arkada: true });
  // Dükkânın iki yanı (14 Ekim)
  for (const yon of [1, -1] as const)
    for (const z of [-1.6, -0.4, 0.8])
      for (const x of [5.0, 6.2, 7.4, 8.6]) h.push({ x: yon * x, z, ic: false, bolge: yon > 0 ? 'solYan' : 'sagYan' });
  return h;
}

export const HUCRELER = hucreleriKur();
export const KARE_BOYU = KARE;

// Yan alan alınınca döşenen ahşap zeminin sınırları
export const YAN_ZEMIN = { icX: 4.3, disX: 9.3, onZ: -2.4, arkaZ: 1.5 };
