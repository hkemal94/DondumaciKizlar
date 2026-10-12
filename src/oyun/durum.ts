import { useSyncExternalStore } from 'react';

import { kuvetler } from './kuvetler';

// Oyunun durumu: kepçe mini oyunu (belge bölüm 3: altlık → kepçe →
// yerleştir → servis) ve müşteri sırası (iş sırası 3).
// Oyuncunun yaptığı her şey buradan geçer; ekran ve 3B sahne buradan okur.

export type Altlik = 'kulah' | 'kap';
export type Asama = 'altlikSec' | 'kepceBos' | 'dolduruyor' | 'kepceDolu' | 'servis';
export type Sonuc = 'mukemmel' | 'iyi' | 'kucuk' | 'buyuk';

export interface Top {
  kuvet: number;
  boyut: number; // 0–1 arası dolum
  sonuc: Sonuc;
}

export interface Siparis {
  altlik: Altlik;
  kuvetler: number[]; // hangi küvetlerden kaç top
}

export interface Musteri {
  id: number;
  gorunum: number; // musteriGorunumleri sırası
  siparis: Siparis;
  hal: 'sirada' | 'gidiyor';
  mutlu: boolean;
}

export type Bildirim =
  | { tur: 'top'; sonuc: Sonuc; zaman: number }
  | { tur: 'para'; miktar: number; zaman: number }
  | { tur: 'yanlis'; zaman: number };

export interface Durum {
  asama: Asama;
  altlik: Altlik | null;
  toplar: Top[];
  kepcedeki: Top | null;
  kepceKuvet: number | null; // basılı tutulan küvet
  dolumBasladi: number; // basılı tutma anı (ms)
  bildirim: Bildirim | null;
  servisDogru: boolean;
  musteriler: Musteri[];
  sonrakiGelis: number; // bir sonraki müşterinin geleceği an (ms)
  para: number;
  memnuniyetler: number[]; // her müşterinin 1–5 puanı
}

// Gösterge ayarları
export const MUKEMMEL_ALT = 0.62;
export const MUKEMMEL_UST = 0.8;
export const IYI_PAYI = 0.14;
export const DOLUM_SURESI = 1000; // boştan tama, ms (Kemal: 1500 yavaştı)
export const EN_COK_TOP = 3;

let durum: Durum = {
  asama: 'altlikSec',
  altlik: null,
  toplar: [],
  kepcedeki: null,
  kepceKuvet: null,
  dolumBasladi: 0,
  bildirim: null,
  servisDogru: false,
  musteriler: [],
  sonrakiGelis: 0,
  para: 0,
  memnuniyetler: [],
};

const dinleyiciler = new Set<() => void>();
function guncelle(yeni: Partial<Durum>) {
  durum = { ...durum, ...yeni };
  dinleyiciler.forEach((d) => d());
}

export function durumuOku() {
  return durum;
}

export function useDurum() {
  return useSyncExternalStore(
    (d) => {
      dinleyiciler.add(d);
      return () => dinleyiciler.delete(d);
    },
    () => durum,
  );
}

// Basılı tutulan süreden dolum: dolar, tepeye varınca geri iner (gidip gelir).
// Kaçırmak ceza değil; gösterge tekrar MÜKEMMEL'den geçer.
export function dolumHesapla(simdi: number): number {
  if (durum.asama !== 'dolduruyor') return 0;
  const t = ((simdi - durum.dolumBasladi) / DOLUM_SURESI) % 2;
  return t <= 1 ? t : 2 - t;
}

function sonucBul(dolum: number): Sonuc {
  if (dolum >= MUKEMMEL_ALT && dolum <= MUKEMMEL_UST) return 'mukemmel';
  if (dolum >= MUKEMMEL_ALT - IYI_PAYI && dolum <= MUKEMMEL_UST + IYI_PAYI) return 'iyi';
  return dolum < MUKEMMEL_ALT ? 'kucuk' : 'buyuk';
}

export function altlikSec(altlik: Altlik) {
  if (durum.toplar.length > 0 || durum.kepcedeki) return; // ilk toptan sonra değişmez
  guncelle({ altlik, asama: 'kepceBos' });
}

export function kuveteBas(kuvet: number) {
  if (durum.asama !== 'kepceBos') return;
  if (durum.toplar.length >= EN_COK_TOP) return;
  guncelle({ asama: 'dolduruyor', kepceKuvet: kuvet, dolumBasladi: performance.now() });
}

export function birak() {
  if (durum.asama !== 'dolduruyor' || durum.kepceKuvet === null) return;
  const dolum = dolumHesapla(performance.now());
  const top: Top = { kuvet: durum.kepceKuvet, boyut: dolum, sonuc: sonucBul(dolum) };
  guncelle({
    asama: 'kepceDolu',
    kepcedeki: top,
    kepceKuvet: null,
    bildirim: { tur: 'top', sonuc: top.sonuc, zaman: performance.now() },
  });
}

export function topuYerlestir() {
  if (durum.asama !== 'kepceDolu' || !durum.kepcedeki) return;
  guncelle({ asama: 'kepceBos', toplar: [...durum.toplar, durum.kepcedeki], kepcedeki: null });
}

// ---- Müşteri sırası (iş sırası 3) ----
// Sayılar geçici: fiyat, gelme aralığı ve sıra uzunluğu denemeyle ayarlanacak.
export const EN_COK_SIRA = 4;
export const GELIS_ARALIGI: [number, number] = [5000, 9000]; // ms
export const TOP_FIYATI = 10;
export const MUKEMMEL_EKI = 5;
export const IYI_EKI = 2;
export const MUSTERI_GORUNUM_SAYISI = 4;

let sonId = 0;

function rastgeleSiparis(): Siparis {
  const z = Math.random();
  const sayi = z < 0.5 ? 1 : z < 0.85 ? 2 : 3;
  return {
    altlik: Math.random() < 0.5 ? 'kulah' : 'kap',
    kuvetler: Array.from({ length: sayi }, () => Math.floor(Math.random() * kuvetler.length)),
  };
}

export function ondekiMusteri(d: Durum = durum): Musteri | undefined {
  return d.musteriler.find((m) => m.hal === 'sirada');
}

// Oyun döngüsü bunu yarım saniyede bir çağırır: sıra boşsa müşteri gelir.
export function musteriDongusu(simdi: number) {
  const siradaki = durum.musteriler.filter((m) => m.hal === 'sirada').length;
  if (siradaki >= EN_COK_SIRA || simdi < durum.sonrakiGelis) return;
  const [en, enCok] = GELIS_ARALIGI;
  // Sıra boşken ilk müşteri hemen gelsin
  const bekle = siradaki === 0 ? 1500 : en + Math.random() * (enCok - en);
  guncelle({
    musteriler: [
      ...durum.musteriler,
      {
        id: ++sonId,
        gorunum: Math.floor(Math.random() * MUSTERI_GORUNUM_SAYISI),
        siparis: rastgeleSiparis(),
        hal: 'sirada',
        mutlu: false,
      },
    ],
    sonrakiGelis: simdi + bekle,
  });
}

function siparisTutuyorMu(siparis: Siparis, altlik: Altlik | null, toplar: Top[]) {
  if (altlik !== siparis.altlik || toplar.length !== siparis.kuvetler.length) return false;
  const a = toplar.map((t) => t.kuvet).sort();
  const b = [...siparis.kuvetler].sort();
  return a.every((k, i) => k === b[i]);
}

const SONUC_PUANI: Record<Sonuc, number> = { mukemmel: 5, iyi: 4, kucuk: 3, buyuk: 3 };

export function servisEt() {
  const musteri = ondekiMusteri();
  if (durum.asama !== 'kepceBos' || durum.toplar.length === 0 || !musteri) return;
  const simdi = performance.now();

  if (!siparisTutuyorMu(musteri.siparis, durum.altlik, durum.toplar)) {
    // Ceza yok: dondurma kenara konur, müşteri beklemeye devam eder.
    guncelle({ asama: 'servis', servisDogru: false, bildirim: { tur: 'yanlis', zaman: simdi } });
  } else {
    const miktar = durum.toplar.reduce(
      (t, top) => t + TOP_FIYATI + (top.sonuc === 'mukemmel' ? MUKEMMEL_EKI : top.sonuc === 'iyi' ? IYI_EKI : 0),
      0,
    );
    const puan = durum.toplar.reduce((t, top) => t + SONUC_PUANI[top.sonuc], 0) / durum.toplar.length;
    const id = musteri.id;
    guncelle({
      asama: 'servis',
      servisDogru: true,
      bildirim: { tur: 'para', miktar, zaman: simdi },
      para: durum.para + miktar,
      memnuniyetler: [...durum.memnuniyetler, puan],
      musteriler: durum.musteriler.map((m) => (m.id === id ? { ...m, hal: 'gidiyor', mutlu: true } : m)),
    });
    // Giden müşteri ekrandan çıkınca listeden silinir
    window.setTimeout(() => {
      guncelle({ musteriler: durum.musteriler.filter((m) => m.id !== id) });
    }, 4000);
  }

  // Servis hareketi bitince yeni dondurma için baştan
  window.setTimeout(() => {
    guncelle({ asama: 'altlikSec', altlik: null, toplar: [], kepcedeki: null });
  }, 1100);
}

export function ortalamaMemnuniyet(d: Durum = durum): number | null {
  if (d.memnuniyetler.length === 0) return null;
  return d.memnuniyetler.reduce((a, b) => a + b, 0) / d.memnuniyetler.length;
}
