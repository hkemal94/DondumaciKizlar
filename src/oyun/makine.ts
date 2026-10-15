import { AYAR } from './ayarlar';
// Makineler, tezgah parçaları, istasyonlar ve yardımcılar (belge 0.5;
// Kemal, 14 Ekim gece). Fiyatlar ve süreler geçici.

import type { TezgahYeri } from './dekorasyon';

// ---- İstasyonlar ----
// Oyuncu güne başlarken birini seçer; yardımcılar ötekilerde çalışır.
// İçecek standı (belge 0.6) limonata sebilinin yerine geldi; eski kayıtta 'limonata' → 'icecek'
export type Istasyon = 'dondurma' | 'waffle' | 'icecek';
export const ISTASYONLAR: Istasyon[] = ['dondurma', 'waffle', 'icecek'];

// ---- Tezgah parçaları ----
// Tezgah bölümünün sağ (+x) ya da sol (−x) ucuna sırayla eklenir; derinlikleri
// tezgahla aynı (3 m). Köşe yalnız süs: ucu kapatan L biçimi. İkinci vitrin
// 0.6'da kaldırıldı.
export type ParcaTipi = 'waffle' | 'icecek' | 'servis' | 'kose';
export const PARCA_TIPLERI: ParcaTipi[] = ['waffle', 'icecek', 'servis', 'kose'];
export const PARCA_BILGI: Record<ParcaTipi, { en: number; fiyat: number }> = {
  waffle: { en: 2, fiyat: AYAR.makine.parcaWaffle },
  icecek: { en: 2, fiyat: AYAR.makine.parcaIcecek },
  servis: { en: 2, fiyat: AYAR.makine.parcaServis },
  kose: { en: 1, fiyat: AYAR.makine.parcaKose },
};
// Eski kayıtlar: limonata sebili → içecek standı; ikinci vitrinin parası geri verilir
export const IKINCI_VITRIN_IADESI = 500;
export interface TezgahParcasi {
  tur: ParcaTipi;
  yan: 1 | -1;
}

// Parçaların yerleri: tezgah bölümünün ortasına göre x (bölümün kendi
// çiziminde) ve dünyadaki ilk birim sütunu
export interface ParcaYeri extends TezgahParcasi {
  en: number;
  x: number; // bölümün ortasına göre parçanın ortası
  c: number; // dünyadaki sol birim sütunu
}

export function parcaYerleri(t: TezgahYeri, parcalar: TezgahParcasi[]): ParcaYeri[] {
  const birikmis: Record<1 | -1, number> = { 1: 0, [-1]: 0 } as Record<1 | -1, number>;
  return parcalar.map((p) => {
    const en = PARCA_BILGI[p.tur].en;
    const once = birikmis[p.yan];
    birikmis[p.yan] += en;
    const x = p.yan * (t.boy / 2 + once + en / 2);
    const c = p.yan > 0 ? t.c + t.boy + once : t.c - once - en;
    return { ...p, en, x, c };
  });
}

// Bir istasyonun parçası (dondurma: ana vitrin, bölümün ortası)
export function istasyonParcasi(ist: Istasyon, yerler: ParcaYeri[]) {
  return ist === 'dondurma' ? null : (yerler.find((p) => p.tur === ist) ?? null);
}

// ---- Ürünler ----
// Waffle süslemesi (belge 0.6): üç grup, müşteri serbestçe birden çok ister
export type WaffleSusleme =
  | 'sutluCikolata'
  | 'bitterCikolata'
  | 'beyazCikolata'
  | 'cilek'
  | 'muz'
  | 'kivi'
  | 'bogurtlen'
  | 'findik'
  | 'renkliSeker'
  | 'hindistanCevizi'
  | 'pudra';
export const WAFFLE_GRUPLARI: { grup: 'cikolata' | 'meyve' | 'susleme'; suslemeler: WaffleSusleme[] }[] = [
  { grup: 'cikolata', suslemeler: ['sutluCikolata', 'bitterCikolata', 'beyazCikolata'] },
  { grup: 'meyve', suslemeler: ['cilek', 'muz', 'kivi', 'bogurtlen'] },
  { grup: 'susleme', suslemeler: ['findik', 'renkliSeker', 'hindistanCevizi', 'pudra'] },
];
export const WAFFLE_SUSLEMELERI: WaffleSusleme[] = WAFFLE_GRUPLARI.flatMap((g) => g.suslemeler);
export const WAFFLE_FIYATI = AYAR.makine.waffleFiyati;
export const MAKINE_SUSLEME_FIYATI = AYAR.makine.makineSusleme;

// İçecek standı (belge 0.6; 9d, belge 0.13): tek istasyon, açıldıkça büyür.
// Basit içecekler dolaptan alınıp verilir; kahveler, milkshake / frappe ve
// taze sıkma basılı tutularak hazırlanır (doğru anda bırak: MÜKEMMEL).
// İlk beşi baştan açık; ötekiler dükkân seviyesi + parayla (ayar dosyası).
export type Icecek =
  | 'gazoz'
  | 'kola'
  | 'soda'
  | 'visne'
  | 'seftali'
  | 'ayran'
  | 'buzluCay'
  | 'limonata'
  | 'cay'
  | 'milkshake'
  | 'frappe'
  | 'turkKahvesi'
  | 'espresso'
  | 'buzluKahve'
  | 'portakalSuyu';
export type IcecekKabi = 'kutu' | 'sise' | 'bardak' | 'cayBardagi' | 'fincan' | 'kupa';
// Hazırlanan içeceğin aleti: standın üstünde durur (arka tezgah ürünleriyle aynı modeller)
export type IcecekAleti = 'caydanlik' | 'cezve' | 'espresso' | 'blender' | 'surahi' | 'sikacak';
export interface IcecekTanimi {
  kap: IcecekKabi;
  renk: string;
  hazirlik?: boolean; // basılı tutarak hazırlanır (mini oyun)
  alet?: IcecekAleti;
  carpan: number; // fiyat: oyuncunun içecek fiyatı × bu
}
export const ICECEK_TANIMI: Record<Icecek, IcecekTanimi> = {
  gazoz: { kap: 'kutu', renk: '#9fd86b', carpan: 1 },
  kola: { kap: 'kutu', renk: '#8a2f2f', carpan: 1 },
  soda: { kap: 'sise', renk: '#7ec8e8', carpan: 1 },
  visne: { kap: 'sise', renk: '#b0243f', carpan: 1 },
  seftali: { kap: 'sise', renk: '#f6a65a', carpan: 1 },
  ayran: { kap: 'sise', renk: '#f4f1e6', carpan: 1 },
  buzluCay: { kap: 'sise', renk: '#c9853a', carpan: 1.2 },
  limonata: { kap: 'bardak', renk: '#f3e27a', alet: 'surahi', carpan: 1.5 },
  cay: { kap: 'cayBardagi', renk: '#8a2410', alet: 'caydanlik', carpan: 1 },
  milkshake: { kap: 'bardak', renk: '#f7b6c8', hazirlik: true, alet: 'blender', carpan: 3 },
  frappe: { kap: 'bardak', renk: '#b8875a', hazirlik: true, alet: 'blender', carpan: 3 },
  turkKahvesi: { kap: 'fincan', renk: '#4a2a18', hazirlik: true, alet: 'cezve', carpan: 2.5 },
  espresso: { kap: 'fincan', renk: '#3a2014', hazirlik: true, alet: 'espresso', carpan: 2 },
  buzluKahve: { kap: 'bardak', renk: '#8a5a3a', hazirlik: true, alet: 'espresso', carpan: 3 },
  portakalSuyu: { kap: 'bardak', renk: '#ff9a1f', hazirlik: true, alet: 'sikacak', carpan: 2.5 },
};
export const ICECEKLER = Object.keys(ICECEK_TANIMI) as Icecek[];
export const BASLANGIC_ICECEKLERI: Icecek[] = ['gazoz', 'kola', 'soda', 'visne', 'seftali'];
export const ICECEK_RENGI: Record<Icecek, string> = Object.fromEntries(ICECEKLER.map((i) => [i, ICECEK_TANIMI[i].renk])) as Record<Icecek, string>;
// Açma fiyatı ayar dosyasından (icecekAcma); kilit (dükkân seviyesi) kilit bölümünde "icecek.<ad>"
export function icecekAcmaFiyati(i: Icecek) {
  return (AYAR.icecekAcma as Record<string, number>)[i] ?? 0;
}
export const ICECEK_FIYATI = AYAR.makine.icecekFiyati; // tanesi
export const EN_COK_ICECEK = AYAR.makine.enCokIcecek;
export const MAKINE_MUKEMMEL_EKI = AYAR.makine.makineMukemmelEki;

// Waffle pişmesi: renk çubuğu bu sürede dolar; altın sarı aralığında açılmalı
export const PISME_SURESI = AYAR.makine.pismeSuresi; // ms
export const ALTIN_ALT = AYAR.makine.altinAlt;
export const ALTIN_UST = AYAR.makine.altinUst;
export type Pisme = 'soluk' | 'altin' | 'yanik';
export function pismeBul(oran: number): Pisme {
  return oran < ALTIN_ALT ? 'soluk' : oran <= ALTIN_UST ? 'altin' : 'yanik';
}

// Müşterinin makine siparişi
export interface MakineSiparisi {
  susleme: WaffleSusleme[]; // waffle
  icecekler: Icecek[]; // içecek standı (aynısından iki tane olabilir)
}

// ---- Yardımcılar ----
export const YARDIMCI_FIYATI = AYAR.yardimci.fiyat;
export const YEVMIYE = AYAR.yardimci.yevmiye;
export const EN_COK_YARDIMCI = AYAR.yardimci.enCok;
export interface Yardimci {
  id: number;
  ad: string;
  tohum: number; // görünüşü (müşterilerle aynı Kenney parçaları)
  yetenek: Istasyon;
  hiz: 1 | 2 | 3;
  istasyon: Istasyon | null; // bugün çalıştığı yer
}

// Bir siparişi kaç oyun dakikasında bitirir: hızlıysa ve kendi istasyonundaysa çabuk
export function yardimciSuresi(y: Yardimci, ist: Istasyon) {
  const taban = { 1: 42, 2: 30, 3: 20 }[y.hiz];
  return Math.round(taban * (y.yetenek === ist ? 1 : 1.5));
}

export function adayUret(id: number): Yardimci {
  const r = Math.random();
  return {
    id,
    ad: '',
    tohum: Math.floor(Math.random() * 100000),
    yetenek: ISTASYONLAR[Math.floor(Math.random() * ISTASYONLAR.length)],
    hiz: r < 0.45 ? 1 : r < 0.85 ? 2 : 3,
    istasyon: null,
  };
}

// ---- Mutfak ----
export const MUTFAK_FIYATI = AYAR.insaat.mutfak; // kare başına
export const MUTFAK_GERI_FIYATI = AYAR.insaat.mutfakGeri;
