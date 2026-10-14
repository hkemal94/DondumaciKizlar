// Tezgahın arkasındaki çalışan (Kemal, 13 Ekim): oyuncu kişiselleştirir.
// Ten, saç, önlük ve ad ücretsiz; desenli önlükler ve aksesuarlar parayla.
// Fiyatlar geçici. Çalışana hikâye / geçmiş yazılmaz (Kemal'in).

export const TENLER = ['#f3cfae', '#e3b08a', '#c98e66', '#9a6545', '#6b4430'];
export const SAC_MODELLERI = ['kisa', 'uzun', 'topuz', 'kivircik'] as const;
export type SacModeli = (typeof SAC_MODELLERI)[number];
export const SAC_RENKLERI = ['#2b211c', '#5a3825', '#8a5a34', '#c98a4a', '#e8cf8a', '#7a3fa8'];

export type Desen = 'duz' | 'cizgili' | 'puantiye';
export interface Onluk {
  id: string;
  renk: string;
  ikinciRenk?: string;
  desen: Desen;
  fiyat: number; // 0 = baştan açık
}

export const ONLUKLER: Onluk[] = [
  { id: 'mor', renk: '#7a3fa8', desen: 'duz', fiyat: 0 },
  { id: 'sari', renk: '#ffc928', desen: 'duz', fiyat: 0 },
  { id: 'krem', renk: '#f6ecd6', desen: 'duz', fiyat: 0 },
  { id: 'cizgili', renk: '#7a3fa8', ikinciRenk: '#ffc928', desen: 'cizgili', fiyat: 150 },
  { id: 'puantiye', renk: '#ff8fb1', ikinciRenk: '#fffaf2', desen: 'puantiye', fiyat: 200 },
];

export type Aksesuar = 'bandana' | 'kasket' | 'gozluk' | 'kupe';
export const AKSESUARLAR: { id: Aksesuar; fiyat: number; bas?: true }[] = [
  { id: 'kupe', fiyat: 100 },
  { id: 'bandana', fiyat: 120, bas: true },
  { id: 'gozluk', fiyat: 160 },
  { id: 'kasket', fiyat: 180, bas: true },
];

// Beden (belge 0.9): oyuncu seçer, başta kadın
export type Beden = 'kadin' | 'erkek';
export const BEDEN_SECENEKLERI: Beden[] = ['kadin', 'erkek'];

export interface CalisanGorunumu {
  ad: string;
  beden: Beden;
  ten: number;
  sac: SacModeli;
  sacRengi: number;
  onluk: string;
  aksesuarlar: Aksesuar[];
}

export const VARSAYILAN_CALISAN: CalisanGorunumu = {
  ad: '',
  beden: 'kadin',
  ten: 1,
  sac: 'topuz',
  sacRengi: 1,
  onluk: 'mor',
  aksesuarlar: [],
};

export const AD_EN_UZUN = 14;
