import ham from './ayarlar.json';

// Ayar dosyası (belge 0.12, 7. adım): oyundaki bütün fiyat, süre ve oranlar
// `ayarlar.json`'da. Her ayarın Türkçe adı, birimi ve notu da orada; KKM'deki
// Ayarlar sekmesi dosyayı okuyup gösterir. Oyun yalnız `deger`leri kullanır:
// AYAR.para.kupFiyati → 200
type Degerler<T> = {
  [B in keyof T]: T[B] extends { ayarlar: infer S } ? { [K in keyof S]: number } : never;
};

export const AYAR = Object.fromEntries(
  Object.entries(ham.bolumler).map(([bolum, b]) => [
    bolum,
    Object.fromEntries(Object.entries(b.ayarlar).map(([anahtar, a]) => [anahtar, a.deger])),
  ]),
) as Degerler<typeof ham.bolumler>;

// Listelerdeki (eşya, görünüş…) fiyatlar: ayar dosyasında yoksa koddaki kalır
export function fiyatiAyarla<T extends { fiyat: number }>(liste: T[], fiyat: (o: T) => number | undefined): T[] {
  return liste.map((o) => ({ ...o, fiyat: fiyat(o) ?? o.fiyat }));
}
