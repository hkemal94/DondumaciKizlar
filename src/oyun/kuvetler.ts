// Dondurma çeşitleri ve vitrindeki küvetler.
// İlk dört çeşit: Çilek, Çikolata, Fıstık, Kaymak (Kemal, 13 Ekim).
// Mango ve yaban mersini belgede geçiyor (bölüm 4): parayla açılır.
// Fiyatlar geçici.
export interface Cesit {
  renk: string;
  ad: 'cilek' | 'cikolata' | 'fistik' | 'kaymak' | 'mango' | 'yabanMersini';
  fiyat: number; // açmak için gereken para (0 = baştan açık)
}

export const CESITLER: Cesit[] = [
  { renk: '#ff6f7d', ad: 'cilek', fiyat: 0 },
  { renk: '#8a4b2e', ad: 'cikolata', fiyat: 0 },
  { renk: '#5fd08a', ad: 'fistik', fiyat: 0 },
  { renk: '#fff0c8', ad: 'kaymak', fiyat: 0 },
  { renk: '#ffa83a', ad: 'mango', fiyat: 150 },
  { renk: '#5b5fc7', ad: 'yabanMersini', fiyat: 250 },
];

export const BASLANGIC_CESITLERI = CESITLER.map((c, i) => (c.fiyat === 0 ? i : -1)).filter((i) => i >= 0);

export const KUVET_Y = 1.0; // küvet ağzının yüksekliği
export const KUVET_Z = -0.62; // vitrinin ortası

// Küvetler arası: dört küvete kadar 0,62 m; daha fazlası ekrana sığsın
// diye sıklaşır (bu açıdan rahat sığan 6).
export function kuvetAraligi(sayi: number) {
  return Math.min(0.62, 2.5 / sayi);
}

export function kuvetX(cesit: number, acik: number[]) {
  const sira = acik.indexOf(cesit);
  const a = kuvetAraligi(acik.length);
  return (sira - (acik.length - 1) / 2) * a;
}

export function vitrinGenisligi(sayi: number) {
  return sayi * kuvetAraligi(sayi) + 0.34;
}
