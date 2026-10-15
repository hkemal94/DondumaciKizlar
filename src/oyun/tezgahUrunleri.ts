// Arka tezgahın üstündeki ürünler (belge 0.14; Kemal, 15 Ekim gece: "tezgahın
// içindeki ürünler de değiştirilebilir olmalı"). Arka tezgah yuvalara bölünür;
// her yuvaya bir ürün konur. Ürünler Kemal'in seçtiği modellerden (aday
// sayfası: B, M, D kodları); bir kez alınan ürün istenen kadar yuvaya konur.
// İlk dört ürün (kavanoz, kap, eski kahve makinesi, kasa) baştan beri vardı, bedava.

export interface TezgahUrunu {
  id: string;
  kod?: string; // aday sayfasındaki kodu (B13, M2…)
  yol?: string; // model (public/modeller/tezgah/); yoksa koddan çizilir
  yukseklik?: number; // metre
  adet?: number; // yuvada kaç tane (meyve, fincan)
  fiyat: number;
}

export const TEZGAH_URUNLERI: TezgahUrunu[] = [
  { id: 'kavanozlar', fiyat: 0 },
  { id: 'kaplar', fiyat: 0 },
  { id: 'eskiKahve', fiyat: 0 },
  { id: 'eskiKasa', fiyat: 0 },
  // Yerel eşyalar (Kemal, 16 Ekim: "Türk kahvesi fincanı, Türk tipi çay,
  // çaydanlık"); hiçbir pakette yok, koddan çizilir
  { id: 'cayBardaklari', fiyat: 25 },
  { id: 'kahveFincanlari', fiyat: 30 },
  { id: 'cezve', fiyat: 35 },
  { id: 'caydanlik', fiyat: 60 },
  { id: 'suIsiticisi', fiyat: 80 },
  { id: 'kahveMakinesi', kod: 'M1', yol: 'tezgah/kitchenCoffeeMachine', yukseklik: 0.42, fiyat: 150 },
  { id: 'espresso', kod: 'M2', yol: 'tezgah/coffee_machine', yukseklik: 0.45, fiyat: 200 },
  { id: 'blender', kod: 'M3', yol: 'tezgah/kitchenBlender', yukseklik: 0.4, fiyat: 120 },
  { id: 'kettle', kod: 'M5', yol: 'tezgah/kettle', yukseklik: 0.24, fiyat: 60 },
  { id: 'yazarKasa', kod: 'M7', yol: 'tezgah/cash_register', yukseklik: 0.3, fiyat: 150 },
  { id: 'kahveFincani', kod: 'B1', yol: 'tezgah/cup-coffee', yukseklik: 0.09, adet: 3, fiyat: 20 },
  { id: 'fincanTabagi', kod: 'B2', yol: 'tezgah/cup-saucer', yukseklik: 0.025, adet: 3, fiyat: 15 },
  { id: 'sariKupa', kod: 'B4', yol: 'tezgah/mug_A_yellow', yukseklik: 0.1, adet: 3, fiyat: 20 },
  { id: 'limonataBardagi', kod: 'B8', yol: 'tezgah/soda-glass', yukseklik: 0.16, adet: 3, fiyat: 20 },
  { id: 'gazozSisesi', kod: 'B9', yol: 'tezgah/soda-bottle', yukseklik: 0.24, adet: 3, fiyat: 20 },
  { id: 'kutuIcecek', kod: 'B10', yol: 'tezgah/soda-can', yukseklik: 0.12, adet: 3, fiyat: 20 },
  { id: 'kavanozMavi', kod: 'B13', yol: 'tezgah/jar_A_medium', yukseklik: 0.2, adet: 2, fiyat: 30 },
  { id: 'kavanozKahve', kod: 'B14', yol: 'tezgah/jar_C_medium', yukseklik: 0.2, adet: 2, fiyat: 30 },
  { id: 'kulahlar', kod: 'D1', yol: 'tezgah/ice-cream-cne', yukseklik: 0.16, adet: 3, fiyat: 20 },
  { id: 'sundae', kod: 'D6', yol: 'tezgah/sundae', yukseklik: 0.16, adet: 2, fiyat: 30 },
  { id: 'kremSanti', kod: 'D8', yol: 'tezgah/whipped-cream', yukseklik: 0.07, adet: 2, fiyat: 30 },
  { id: 'limonlar', kod: 'D9', yol: 'tezgah/lemon', yukseklik: 0.07, adet: 4, fiyat: 25 },
  { id: 'portakallar', kod: 'D10', yol: 'tezgah/orange', yukseklik: 0.08, adet: 4, fiyat: 25 },
  { id: 'cilekler', kod: 'D11', yol: 'tezgah/strawberry', yukseklik: 0.04, adet: 5, fiyat: 25 },
  { id: 'kirazlar', kod: 'D12', yol: 'tezgah/cherries', yukseklik: 0.06, adet: 4, fiyat: 25 },
];

export const BASLANGIC_URUNLERI = TEZGAH_URUNLERI.filter((u) => u.fiyat === 0).map((u) => u.id);

// Bir yuvanın genişliği (metre)
export const YUVA_ENI = 0.6;

export function arkaTezgahGenisligi(tezgahBoyu: number) {
  return tezgahBoyu - 1.4;
}
export function yuvaSayisi(tezgahBoyu: number) {
  return Math.max(3, Math.floor(arkaTezgahGenisligi(tezgahBoyu) / YUVA_ENI));
}

// Bugüne dek çizilen düzene benzer başlangıç: solda kavanozlar, ortada kaplar
// ve kahve makinesi, sağda kasa
export function varsayilanDizilis(sayi: number): string[] {
  const d = Array.from({ length: sayi }, () => '');
  d[0] = 'kavanozlar';
  if (sayi > 3) d[1] = 'kavanozlar';
  d[Math.floor(sayi / 2)] = 'eskiKahve';
  if (sayi > 4) d[Math.floor(sayi / 2) + 1] = 'kaplar';
  d[sayi - 1] = 'eskiKasa';
  return d;
}

// Kayıttan: bilinen ürünler, yuva sayısına göre kesilir ya da boşla uzar
export function dizilisiOku(ham: unknown, sayi: number, acik: string[]): string[] {
  if (!Array.isArray(ham)) return varsayilanDizilis(sayi);
  const d = ham.slice(0, sayi).map((x) => (typeof x === 'string' && acik.includes(x) ? x : ''));
  while (d.length < sayi) d.push('');
  return d;
}
