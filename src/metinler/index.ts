import tr from './tr.json';

// Ekrandaki bütün yazılar buradan gelir; koda yazı gömülmez.
// İngilizce sonra ayrı bir dosya olarak eklenecek.
export type MetinAnahtari = keyof typeof tr;

export function m(anahtar: MetinAnahtari): string {
  return tr[anahtar];
}
