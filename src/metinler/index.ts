import tr from './tr.json';

// Ekrandaki bütün yazılar buradan gelir; koda yazı gömülmez.
// İngilizce sonra ayrı bir dosya olarak eklenecek.
export type MetinAnahtari = keyof typeof tr;

// Yazıdaki {ad} yerlerini doldurur: m('ust.gun', { gun: 3 }) → "Gün 3"
export function m(anahtar: MetinAnahtari, degerler?: Record<string, string | number>): string {
  let yazi: string = tr[anahtar];
  if (degerler) for (const [ad, deger] of Object.entries(degerler)) yazi = yazi.replaceAll(`{${ad}}`, String(deger));
  return yazi;
}
