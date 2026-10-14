// Makineler, tezgah parçaları, istasyonlar ve yardımcılar (belge 0.5;
// Kemal, 14 Ekim gece). Fiyatlar ve süreler geçici.

import type { TezgahYeri } from './dekorasyon';

// ---- İstasyonlar ----
// Oyuncu güne başlarken birini seçer; yardımcılar ötekilerde çalışır.
export type Istasyon = 'dondurma' | 'waffle' | 'limonata';
export const ISTASYONLAR: Istasyon[] = ['dondurma', 'waffle', 'limonata'];

// ---- Tezgah parçaları ----
// Tezgah bölümünün sağ (+x) ya da sol (−x) ucuna sırayla eklenir; derinlikleri
// tezgahla aynı (3 m). Köşe yalnız süs: ucu kapatan L biçimi.
export type ParcaTipi = 'waffle' | 'limonata' | 'vitrin2' | 'servis' | 'kose';
export const PARCA_TIPLERI: ParcaTipi[] = ['waffle', 'limonata', 'vitrin2', 'servis', 'kose'];
export const PARCA_BILGI: Record<ParcaTipi, { en: number; fiyat: number }> = {
  waffle: { en: 2, fiyat: 600 },
  limonata: { en: 2, fiyat: 400 },
  vitrin2: { en: 3, fiyat: 500 },
  servis: { en: 2, fiyat: 300 },
  kose: { en: 1, fiyat: 100 },
};
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
export type WaffleSusleme = 'cikolata' | 'cilek' | 'pudra';
export const WAFFLE_SUSLEMELERI: WaffleSusleme[] = ['cikolata', 'cilek', 'pudra'];
export const WAFFLE_FIYATI = 6;
export const LIMONATA_FIYATI = 3;
export const MAKINE_SUSLEME_FIYATI = 1;
export const MAKINE_MUKEMMEL_EKI = 2;

// Waffle pişmesi: renk çubuğu bu sürede dolar; altın sarı aralığında açılmalı
export const PISME_SURESI = 5000; // ms
export const ALTIN_ALT = 0.6;
export const ALTIN_UST = 0.84;
export type Pisme = 'soluk' | 'altin' | 'yanik';
export function pismeBul(oran: number): Pisme {
  return oran < ALTIN_ALT ? 'soluk' : oran <= ALTIN_UST ? 'altin' : 'yanik';
}

// Müşterinin makine siparişi
export interface MakineSiparisi {
  susleme: WaffleSusleme | null; // waffle
  buz: boolean; // limonata
}

// ---- Yardımcılar ----
export const YARDIMCI_FIYATI = 300;
export const YEVMIYE = 40;
export const EN_COK_YARDIMCI = 3;
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
export const MUTFAK_FIYATI = 100; // kare başına (geçici)
export const MUTFAK_GERI_FIYATI = 50;
