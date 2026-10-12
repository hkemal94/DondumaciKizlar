import { useSyncExternalStore } from 'react';

// Kepçe mini oyununun durumu (belge bölüm 3: altlık → kepçe → yerleştir → servis).
// Oyuncunun yaptığı her şey buradan geçer; ekran ve 3B sahne buradan okur.

export type Altlik = 'kulah' | 'kap';
export type Asama = 'altlikSec' | 'kepceBos' | 'dolduruyor' | 'kepceDolu' | 'servis';
export type Sonuc = 'mukemmel' | 'iyi' | 'kucuk' | 'buyuk';

export interface Top {
  kuvet: number;
  boyut: number; // 0–1 arası dolum
  sonuc: Sonuc;
}

export interface Durum {
  asama: Asama;
  altlik: Altlik | null;
  toplar: Top[];
  kepcedeki: Top | null;
  kepceKuvet: number | null; // basılı tutulan küvet
  dolumBasladi: number; // basılı tutma anı (ms)
  bildirim: { sonuc: Sonuc | 'servis'; zaman: number } | null;
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
    bildirim: { sonuc: top.sonuc, zaman: performance.now() },
  });
}

export function topuYerlestir() {
  if (durum.asama !== 'kepceDolu' || !durum.kepcedeki) return;
  guncelle({ asama: 'kepceBos', toplar: [...durum.toplar, durum.kepcedeki], kepcedeki: null });
}

export function servisEt() {
  if (durum.asama !== 'kepceBos' || durum.toplar.length === 0) return;
  guncelle({ asama: 'servis', bildirim: { sonuc: 'servis', zaman: performance.now() } });
  // Servis hareketi bitince yeni sipariş için baştan
  window.setTimeout(() => {
    guncelle({ asama: 'altlikSec', altlik: null, toplar: [], kepcedeki: null });
  }, 1100);
}
