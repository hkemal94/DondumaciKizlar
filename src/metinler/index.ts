import { useSyncExternalStore } from 'react';
import tr from './tr.json';
import enHam from './en.json';

// Ekrandaki bütün yazılar buradan gelir; koda yazı gömülmez.
// İki dil (belge 0.12, 6. adım): Türkçe ve İngilizce. Yeni yazı iki dosyaya
// birden eklenir; İngilizcede eksik anahtar olursa derleme hata verir.
export type MetinAnahtari = keyof typeof tr;
const en: Record<MetinAnahtari, string> = enHam;

export type Dil = 'tr' | 'en';
export const DILLER: Dil[] = ['tr', 'en'];
const SOZLUKLER: Record<Dil, Record<MetinAnahtari, string>> = { tr, en };

// Seçilen dil bu cihazda saklanır (oyun kaydından ayrı). Hiç seçilmemişse
// telefonun dili Türkçeyse Türkçe, değilse İngilizce açılır.
const ANAHTAR = 'dondurmaci-kizlar-dil';
function ilkDil(): Dil {
  try {
    const kayitli = localStorage.getItem(ANAHTAR);
    if (kayitli === 'tr' || kayitli === 'en') return kayitli;
  } catch {
    // tarayıcı izin vermezse telefonun diline bakılır
  }
  return (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en';
}
let dil: Dil = ilkDil();
document.documentElement.lang = dil;
const dinleyiciler = new Set<() => void>();

export function dilSec(yeni: Dil) {
  dil = yeni;
  document.documentElement.lang = yeni;
  try {
    localStorage.setItem(ANAHTAR, yeni);
  } catch {
    // yalnız bu açılışta geçerli
  }
  dinleyiciler.forEach((d) => d());
}

// Dil değişince yeniden çizilsin diye (arayüzün kökü ve yazılı dokular kullanır)
export function useDil() {
  return useSyncExternalStore(
    (d) => {
      dinleyiciler.add(d);
      return () => dinleyiciler.delete(d);
    },
    () => dil,
  );
}
export function dilOku() {
  return dil;
}
// Tarih ve sayıların yazılışı için
export function yerel() {
  return dil === 'tr' ? 'tr-TR' : 'en-GB';
}

// Ondalık sayı: Türkçede virgül (4,5), İngilizcede nokta (4.5)
export function ondalik(sayi: number, basamak?: number) {
  const yazi = basamak === undefined ? String(sayi) : sayi.toFixed(basamak);
  return dil === 'tr' ? yazi.replace('.', ',') : yazi;
}

// Yazıdaki {ad} yerlerini doldurur: m('ust.gun', { gun: 3 }) → "Gün 3"
export function m(anahtar: MetinAnahtari, degerler?: Record<string, string | number>): string {
  let yazi: string = SOZLUKLER[dil][anahtar] ?? tr[anahtar];
  if (degerler) for (const [ad, deger] of Object.entries(degerler)) yazi = yazi.replaceAll(`{${ad}}`, String(deger));
  return yazi;
}
