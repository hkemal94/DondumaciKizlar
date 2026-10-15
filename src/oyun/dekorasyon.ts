import { AYAR, fiyatiAyarla } from './ayarlar';
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
  | 'sokakLambasi'
  // C4 (belge 0.11): içeri için halı ve tablo
  | 'haliYuvarlak'
  | 'haliKilim'
  | 'paspas'
  | 'tabloSoyut'
  | 'tabloDondurma'
  | 'tabloDeniz'
  | 'tabloBos'
  // Duvar lambası (Kemal, 15 Ekim gece: "dükkânın iş kısmına ışık"); tablo gibi duvara asılır
  | 'aplik';

// grup: mağazadaki başlık. disari: yalnız dükkânın dışına konur (14 Ekim:
// "özellikle dükkân dışı için tabela benzeri ürünler").
// iceri: yalnız dükkânın içine konur (halı, tablo; C4)
// Fiyatlar ayar dosyasından (7. adım)
export const ESYALAR: { id: Esya; fiyat: number; grup: 'oturma' | 'dis' | 'ic'; disari?: boolean; iceri?: boolean }[] = fiyatiAyarla([
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
  { id: 'paspas', fiyat: 70, grup: 'ic', iceri: true },
  { id: 'haliYuvarlak', fiyat: 180, grup: 'ic', iceri: true },
  { id: 'haliKilim', fiyat: 260, grup: 'ic', iceri: true },
  { id: 'tabloSoyut', fiyat: 150, grup: 'ic', iceri: true },
  { id: 'tabloDondurma', fiyat: 150, grup: 'ic', iceri: true },
  { id: 'tabloDeniz', fiyat: 180, grup: 'ic', iceri: true },
  { id: 'tabloBos', fiyat: 60, grup: 'ic', iceri: true },
  { id: 'aplik', fiyat: 120, grup: 'ic', iceri: true },
], (e) => (AYAR.esya as Record<string, number>)[e.id]);

// Katman (C4): halı yere serilir, üstüne eşya konabilir; tablo duvara asılır,
// yerde yer kaplamaz. Aynı katmandakiler üst üste gelemez.
export type Katman = 'esya' | 'zemin' | 'duvar';
export function esyaKatmani(e: Esya): Katman {
  if (e === 'paspas' || e === 'haliYuvarlak' || e === 'haliKilim') return 'zemin';
  if (e.startsWith('tablo') || e === 'aplik') return 'duvar';
  return 'esya';
}

// Işıklandırma seviyeleri: 1 fenerler, 2 asma ampuller, 3 ışıklı şerit.
// Her seviye bir öncekinin üstüne eklenir.
export const ISIK_SEVIYELERI = [
  { seviye: 1, fiyat: AYAR.isik.seviye1 },
  { seviye: 2, fiyat: AYAR.isik.seviye2 },
  { seviye: 3, fiyat: AYAR.isik.seviye3 },
];
export const EN_YUKSEK_ISIK = ISIK_SEVIYELERI.length;

// ---- Arazi (belge 0.1, 0.2, 0.3; Kemal, 14 Ekim) ----
// Her şey 1×1 m'lik birimle ölçülür (Kemal: "küsurat istemiyorum").
// Arazi 4×4 m'lik karelere (parsel) bölünür, her parsel ayrı alınır ve
// içinde 16 eşya yeri (1×1 m) vardır.
// Sütun i: x = 4i … 4i+4 (dükkân i = -1 ve 0). Satır j: -1 ön teras
// (yürüyüş yolu ile dükkân arası), 0 dükkân sırası, 1 ve 2 arka.
// Eşya yeri (birim) (c, r): x = c … c+1, z = Z0 + r … Z0 + r + 1;
// Z0 dükkânın ön duvarı.
export const PARSEL = 4;
export const Z0 = -2.4;
export const SUTUN_EN_AZ = -10;
export const SUTUN_EN_COK = 9;
export const SATIR_EN_AZ = -1;
export const SATIR_EN_COK = 2;
export const YURUYUS_Z = -7.3; // yürüyüş yolu: ön terasın deniz tarafı
export const KAPI_X = -3.4; // kapının ortası
export const KAPI_SUTUNU = -4; // kapının önündeki birimler (x -4 … -3) müşteri yolu, boş kalır

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
  return { solX: i * PARSEL, sagX: i * PARSEL + PARSEL, onZ: Z0 + j * PARSEL, arkaZ: Z0 + j * PARSEL + PARSEL };
}
export function parselGecerli(i: number, j: number) {
  return i >= SUTUN_EN_AZ && i <= SUTUN_EN_COK && j >= SATIR_EN_AZ && j <= SATIR_EN_COK;
}

// Fiyat: ön teras pahalı, arka ucuz; iskele tarafı (x < 0) biraz daha
// pahalı; her alımda artar. Sayılar geçici (belge: "bugünkü gibi").
export function parselFiyati(i: number, j: number, alinanSayisi: number) {
  const a = AYAR.insaat;
  const taban = j === -1 ? a.parselOn : j === 0 ? a.parselDukkan : a.parselArka;
  const iskele = i < 0 ? a.iskeleCarpani : 1;
  return Math.round((taban * iskele * (1 + a.parselArtisi * alinanSayisi)) / 10) * 10;
}

// ---- Birimler (1×1 m eşya yerleri) ----
export function birimAnahtari(c: number, r: number) {
  return `${c},${r}`;
}
export function birimCoz(anahtar: string) {
  const [c, r] = anahtar.split(',').map(Number);
  return { c, r };
}
export function birimParseli(c: number, r: number) {
  return parselAnahtari(Math.floor(c / PARSEL), Math.floor(r / PARSEL));
}
// Birimin ortası (dünyada)
export function birimOrtasi(c: number, r: number) {
  return { x: c + 0.5, z: Z0 + r + 0.5 };
}
// Dünyadaki bir noktanın birimi
export function noktaninBirimi(x: number, z: number) {
  return { c: Math.floor(x), r: Math.floor(z - Z0) };
}

// ---- Eşya boyları (belge 0.3) ----
// en: x yönünde, boy: z yönünde (çevrilmemişken). Çevrilince yer değiştirir.
export const ESYA_BOYU: Record<Esya, { en: number; boy: number }> = {
  saksi: { en: 1, boy: 1 },
  copKutusu: { en: 1, boy: 1 },
  flama: { en: 1, boy: 1 },
  sokakLambasi: { en: 1, boy: 1 },
  karaTahta: { en: 1, boy: 1 },
  isikliTabela: { en: 1, boy: 1 },
  kulahFiguru: { en: 1, boy: 1 },
  bank: { en: 2, boy: 1 },
  bisiklet: { en: 2, boy: 1 },
  cicekKasasi: { en: 2, boy: 1 },
  masa: { en: 2, boy: 2 },
  semsiyeliMasa: { en: 2, boy: 2 },
  paspas: { en: 2, boy: 1 },
  haliYuvarlak: { en: 2, boy: 2 },
  haliKilim: { en: 3, boy: 2 },
  tabloSoyut: { en: 1, boy: 1 },
  tabloDondurma: { en: 1, boy: 1 },
  tabloDeniz: { en: 1, boy: 1 },
  tabloBos: { en: 1, boy: 1 },
  aplik: { en: 1, boy: 1 },
};

export function esyaOlcusu(esya: Esya, yon: number) {
  const { en, boy } = ESYA_BOYU[esya];
  return yon % 2 ? { en: boy, boy: en } : { en, boy };
}

// Eşyanın kapladığı birimler: köşe birimden (en küçük c, r) başlayarak
export function kapladigiBirimler(esya: Esya, c: number, r: number, yon: number) {
  const { en, boy } = esyaOlcusu(esya, yon);
  const liste: { c: number; r: number }[] = [];
  for (let a = 0; a < en; a++) for (let b = 0; b < boy; b++) liste.push({ c: c + a, r: r + b });
  return liste;
}

// Eşyanın ortası (dünyada)
export function esyaOrtasi(esya: Esya, c: number, r: number, yon: number) {
  const { en, boy } = esyaOlcusu(esya, yon);
  return { x: c + en / 2, z: Z0 + r + boy / 2 };
}

// ---- Tezgah bölümü (belge 0.3) ----
// Vitrinli tezgah, arka tezgah ve çalışanın yeri tek parça: boy × 3 m.
// Önünde 1 m müşteri sırası. Yeri sol ön köşe biriminden (c, r) tutulur.
export const TEZGAH_DERINLIGI = 3;
export const TEZGAH_EN_KISA = 4;
export const TEZGAH_EN_UZUN = 16;
export const TEZGAH_METRE_FIYATI = AYAR.insaat.tezgahMetre;
export interface TezgahYeri {
  c: number;
  r: number;
  boy: number;
}
export const BASLANGIC_TEZGAHI: TezgahYeri = { c: -4, r: 1, boy: 8 };

// Sahnedeki tezgah parçaları başlangıç yerine göre çizilir; taşınınca bu
// kadar kayar (x: ortası, z: ön kenarı)
export function tezgahKaymasi(t: TezgahYeri) {
  return { x: t.c + t.boy / 2 - (BASLANGIC_TEZGAHI.c + BASLANGIC_TEZGAHI.boy / 2), z: t.r - BASLANGIC_TEZGAHI.r };
}

// Tezgahın gövdesinin ve önündeki müşteri sırasının birimleri
export function tezgahBirimleri(t: TezgahYeri) {
  const govde: { c: number; r: number }[] = [];
  const sira: { c: number; r: number }[] = [];
  for (let a = 0; a < t.boy; a++) {
    for (let b = 0; b < TEZGAH_DERINLIGI; b++) govde.push({ c: t.c + a, r: t.r + b });
    sira.push({ c: t.c + a, r: t.r - 1 });
  }
  return { govde, sira };
}

// Müşterilerin durduğu yer: tezgahın önündeki sıranın ortadan sola (−x)
// doğru kısmı. Sağ ucu boş kalır, oraya eşya konabilir (bugünkü dükkânda
// iki birim).
export function siraBirimiMi(t: TezgahYeri, c: number, r: number) {
  return r === t.r - 1 && c >= t.c && c < t.c + t.boy / 2 + 2;
}

// ---- Eski kayıtlar ----
// 14 Ekim öncesi kayıtlardaki kareler (sıra numarasıyla): yalnız eski kaydı
// yeni araziye taşırken kullanılır.
export type EskiBolge = 'solYan' | 'sagYan' | 'solYol' | 'sagYol';
export function eskiHucreler(): { x: number; z: number }[] {
  const KARE = 1.2;
  const h: { x: number; z: number }[] = [];
  for (const z of [-3.05, -5.35, -6.55]) {
    for (let i = -9; i <= 9; i++) {
      const x = i * KARE;
      if (z === -3.05 && x > -4.7 && x < -2.1) continue;
      h.push({ x, z });
    }
  }
  for (const x of [1.7, 2.9]) h.push({ x, z: -1.78 });
  for (const x of [-2.6, 2.6]) h.push({ x, z: 0.7 });
  for (const yon of [1, -1] as const) for (const z of [-1.6, -0.4, 0.8]) for (const x of [5.0, 6.2, 7.4, 8.6]) h.push({ x: yon * x, z });
  return h;
}

// 14 Ekim akşamı kayıtlarındaki kare kimlikleri ("i,j:a,b" ve "ic:n") → yer
export function eskiKareYeri(id: string): { x: number; z: number } | null {
  const ic: Record<string, { x: number; z: number }> = {
    'ic:0': { x: 1.7, z: -1.78 },
    'ic:1': { x: 2.9, z: -1.78 },
    'ic:2': { x: -2.6, z: 0.7 },
    'ic:3': { x: 2.6, z: 0.7 },
  };
  if (ic[id]) return ic[id];
  const m = /^(-?\d+),(-?\d+):(\d),(\d)$/.exec(id);
  if (!m) return null;
  const [i, j, a, b] = m.slice(1).map(Number);
  const eskiSatir: Record<number, [number, number]> = { [-1]: [-6.4, -2.4], 0: [-2.4, 2.05], 1: [2.05, 6.05], 2: [6.05, 10.05] };
  const s = eskiSatir[j];
  if (!s) return null;
  return { x: i * 4 + (4 / 3) * (a + 0.5), z: s[0] + ((s[1] - s[0]) / 3) * (b + 0.5) };
}

// ---- Duvarlar (belge 0.4) ----
// Kapalı alanın (duvarla çevrili kareler) sınırı 1 m'lik duvar parçalarından
// oluşur. Parça, içerideki birim (c, r) ve baktığı yönle tutulur:
// g = güney (denize, −z), k = kuzey (+z), b = batı (−x), d = doğu (+x).
export type Yon = 'g' | 'k' | 'b' | 'd';
export type ParcaTuru = 'duvar' | 'pencere' | 'kapi';
export interface Kenar {
  c: number;
  r: number;
  y: Yon;
}
export const YON_ADIMI: Record<Yon, [number, number]> = { g: [0, -1], k: [0, 1], b: [-1, 0], d: [1, 0] };
export function kenarAnahtari(k: Kenar) {
  return `${k.c},${k.r},${k.y}`;
}

export const DUVAR_FIYATI = AYAR.insaat.duvar; // kare başına
export const YIKIM_FIYATI = AYAR.insaat.yikim;
export const PENCERE_FIYATI = AYAR.insaat.pencere; // 1 m
export const KAPI_FIYATI = AYAR.insaat.kapi; // ikinci kapıdan başlayarak

// Başta: kapı ön duvarın sol ucunda, yan duvarların ortasında 2 m pencere
export const BASLANGIC_PARCALARI: Record<string, ParcaTuru> = {
  '-4,0,g': 'kapi',
  '-4,1,b': 'pencere',
  '-4,2,b': 'pencere',
  '3,1,d': 'pencere',
  '3,2,d': 'pencere',
};

function kapaliBirimMi(kapali: Set<string>, c: number, r: number) {
  return kapali.has(birimParseli(c, r));
}

// Kapalı alanın bütün duvar parçaları
export function sinirKenarlari(kapaliParseller: string[]): Kenar[] {
  const kapali = new Set(kapaliParseller);
  const liste: Kenar[] = [];
  for (const p of kapaliParseller) {
    const { i, j } = parselCoz(p);
    for (let a = 0; a < PARSEL; a++)
      for (let b = 0; b < PARSEL; b++) {
        const c = i * PARSEL + a;
        const r = j * PARSEL + b;
        for (const y of ['g', 'k', 'b', 'd'] as Yon[]) {
          const [dc, dr] = YON_ADIMI[y];
          if (!kapaliBirimMi(kapali, c + dc, r + dr)) liste.push({ c, r, y });
        }
      }
  }
  return liste;
}

// Parçanın türü: ön (denize bakan) duvar kendiliğinden cam vitrin, öteki düz duvar
export function parcaTuru(k: Kenar, parcalar: Record<string, ParcaTuru>): ParcaTuru {
  return parcalar[kenarAnahtari(k)] ?? (k.y === 'g' ? 'pencere' : 'duvar');
}

// Kapı yalnız ön duvarda ve önünden yürüyüş yoluna giden yol kapalı alandan geçmiyorsa
export function kapiOlabilir(k: Kenar, kapaliParseller: string[]) {
  if (k.y !== 'g') return false;
  const kapali = new Set(kapaliParseller);
  for (let r = k.r - 1; r >= SATIR_EN_AZ * PARSEL; r--) if (kapaliBirimMi(kapali, k.c, r)) return false;
  return true;
}

export function kapilar(kapaliParseller: string[], parcalar: Record<string, ParcaTuru>): Kenar[] {
  return sinirKenarlari(kapaliParseller).filter((k) => parcaTuru(k, parcalar) === 'kapi' && kapiOlabilir(k, kapaliParseller));
}

// Kapalı alan değişince: sınırda kalmayan parçalar silinir; kapılar aynı
// sütunda yeni ön duvara kayar (öne katılan karede öne, yıkılan karede geriye).
export function parcalariUyarla(eskiKapali: string[], yeniKapali: string[], parcalar: Record<string, ParcaTuru>) {
  const yeniSinir = new Set(sinirKenarlari(yeniKapali).map(kenarAnahtari));
  const sonuc: Record<string, ParcaTuru> = {};
  for (const [a, t] of Object.entries(parcalar)) if (yeniSinir.has(a)) sonuc[a] = t;
  const yeniKapaliKume = new Set(yeniKapali);
  for (const k of kapilar(eskiKapali, parcalar)) {
    if (yeniSinir.has(kenarAnahtari(k)) && kapiOlabilir(k, yeniKapali)) continue;
    // Aynı sütunda yeni kapalı alanın ön duvarı: önce öne, yoksa geriye bak
    let bulunan: Kenar | null = null;
    for (let r = k.r - 1; r >= SATIR_EN_AZ * PARSEL && !bulunan; r--)
      if (kapaliBirimMi(yeniKapaliKume, k.c, r) && !kapaliBirimMi(yeniKapaliKume, k.c, r - 1)) bulunan = { c: k.c, r, y: 'g' };
    for (let r = k.r; r < (SATIR_EN_COK + 1) * PARSEL && !bulunan; r++)
      if (kapaliBirimMi(yeniKapaliKume, k.c, r) && !kapaliBirimMi(yeniKapaliKume, k.c, r - 1)) bulunan = { c: k.c, r, y: 'g' };
    if (bulunan && kapiOlabilir(bulunan, yeniKapali)) sonuc[kenarAnahtari(bulunan)] = 'kapi';
  }
  return sonuc;
}

// Kapalı alan tek parça mı (kareler kenardan birbirine bağlı)
export function bagliMi(parseller: string[]) {
  if (parseller.length === 0) return false;
  const kume = new Set(parseller);
  const gorulen = new Set([parseller[0]]);
  const sira = [parseller[0]];
  while (sira.length) {
    const { i, j } = parselCoz(sira.pop()!);
    for (const [a, b] of [
      [i - 1, j],
      [i + 1, j],
      [i, j - 1],
      [i, j + 1],
    ]) {
      const k = parselAnahtari(a, b);
      if (kume.has(k) && !gorulen.has(k)) {
        gorulen.add(k);
        sira.push(k);
      }
    }
  }
  return gorulen.size === kume.size;
}

// Kenarın dünyadaki ortası ve dışa bakan yönü
export function kenarYeri(k: Kenar) {
  const [dc, dr] = YON_ADIMI[k.y];
  const o = birimOrtasi(k.c, k.r);
  return { x: o.x + dc * 0.5, z: o.z + dr * 0.5, nx: dc, nz: dr };
}
