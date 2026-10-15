import { AYAR } from './ayarlar';
import type { Icecek } from './makine';

// Hafif stok (belge 0.13, 9c; Kemal, 15 Ekim akşam): dondurma, altlıklar
// (külah / kap / kup), süslemeler ve içecekler azalır. Top alındıkça küvetteki
// dondurma alçalır. Biten kalem o gün istenmez; hepsi biterse dükkân cezasız
// erken kapanır. Gün sonunda "Hepsini doldur" ya da kalem kalem sipariş.
// Kayıtta her kalemin kalan miktarı; kayıtta olmayan kalem dolu sayılır
// (eski kayıtlar ve yeni açılan çeşit dolu başlar).

export type StokTuru = 'dondurma' | 'altlik' | 'susleme' | 'icecek';
// Kalem anahtarı: "dondurma.3" (çeşit sırası), "altlik.kulah", "susleme.sos", "icecek.kola"
export type StokAnahtari = `${StokTuru}.${string}`;
export type Stok = Record<string, number>;

const S = AYAR.stok;

export function stokTuru(anahtar: string): StokTuru {
  return anahtar.split('.')[0] as StokTuru;
}

export function kapasite(anahtar: string) {
  const tur = stokTuru(anahtar);
  return tur === 'dondurma' ? S.kuvetKapasitesi : tur === 'altlik' ? S.altlikKapasitesi : tur === 'susleme' ? S.suslemeKapasitesi : S.icecekKapasitesi;
}

// Bir birimin alış fiyatı (jeton)
export function birimMaliyet(anahtar: string) {
  const tur = stokTuru(anahtar);
  if (tur === 'dondurma') return S.topMaliyeti;
  if (tur === 'altlik') return anahtar === 'altlik.kup' ? S.kupMaliyeti : S.altlikMaliyeti;
  if (tur === 'susleme') return S.suslemeMaliyeti;
  return S.icecekMaliyeti;
}

// Kalem kalem siparişte bir basışın ekledigi birim
export function paket(anahtar: string) {
  const tur = stokTuru(anahtar);
  return tur === 'dondurma' ? S.kuvetPaketi : tur === 'altlik' ? S.altlikPaketi : tur === 'susleme' ? S.suslemePaketi : S.icecekPaketi;
}

export function miktar(stok: Stok, anahtar: string) {
  const v = stok[anahtar];
  return typeof v === 'number' ? Math.max(0, Math.min(kapasite(anahtar), v)) : kapasite(anahtar);
}

export function doluluk(stok: Stok, anahtar: string) {
  return miktar(stok, anahtar) / kapasite(anahtar);
}

export function azalt(stok: Stok, anahtarlar: string[]): Stok {
  const yeni = { ...stok };
  for (const a of anahtarlar) yeni[a] = Math.max(0, miktar(yeni, a) - 1);
  return yeni;
}

export function artir(stok: Stok, anahtar: string, adet = 1): Stok {
  return { ...stok, [anahtar]: Math.min(kapasite(anahtar), miktar(stok, anahtar) + adet) };
}

export const dondurmaAnahtari = (cesit: number) => `dondurma.${cesit}`;
export const altlikAnahtari = (a: string) => `altlik.${a}`;
export const suslemeAnahtari = (s: string) => `susleme.${s}`;
export const icecekAnahtari = (i: Icecek) => `icecek.${i}`;

// Stok ekranında görünen kalemler: vitrindeki çeşitler, açık altlıklar,
// süslemeler, (stand kuruluysa) içecekler
export function stokKalemleri(o: { vitrin: number[]; altliklar: string[]; suslemeler: string[]; icecekler: Icecek[] }): string[] {
  return [
    ...o.vitrin.map(dondurmaAnahtari),
    ...o.altliklar.map(altlikAnahtari),
    ...o.suslemeler.map(suslemeAnahtari),
    ...o.icecekler.map(icecekAnahtari),
  ];
}

// Doldurmak için gereken birim (kapasiteye kadar)
export function eksik(stok: Stok, anahtar: string) {
  return kapasite(anahtar) - miktar(stok, anahtar);
}

// Kayıttan: yalnız sayı olan, bilinen türdeki kalemler
export function stokuOku(ham: unknown): Stok {
  if (!ham || typeof ham !== 'object') return {};
  const turler: StokTuru[] = ['dondurma', 'altlik', 'susleme', 'icecek'];
  return Object.fromEntries(
    Object.entries(ham as Record<string, unknown>).filter(
      ([a, v]) => typeof v === 'number' && Number.isFinite(v) && turler.includes(stokTuru(a)),
    ),
  ) as Stok;
}
