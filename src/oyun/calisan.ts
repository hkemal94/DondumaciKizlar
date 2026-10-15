import { AYAR, fiyatiAyarla } from './ayarlar';
// Tezgahın arkasındaki çalışan (Kemal, 13 Ekim): oyuncu kişiselleştirir.
// Ten, saç, önlük ve ad ücretsiz; desenli önlükler ve aksesuarlar parayla.
// Fiyatlar geçici. Çalışana hikâye / geçmiş yazılmaz (Kemal'in).

export const TENLER = ['#f3cfae', '#e3b08a', '#c98e66', '#9a6545', '#6b4430'];
// Saçlar paketteki başlardan gelir (Kemal, 15 Ekim akşam: "adı var kendi yok";
// "çözemezsen adları olanlarla değiştir"). Pakette kadın için iki, erkek için
// dört ayrı saç var; adlar gerçekte görünene göre. Daha çok saç yeni model ister.
export const SAC_MODELLERI = ['kisa', 'dalgali', 'kabarik', 'dik', 'yanaTarali'] as const;
export type SacModeli = (typeof SAC_MODELLERI)[number];
export const SACLAR: Record<'kadin' | 'erkek', { id: SacModeli; bas: string }[]> = {
  kadin: [
    { id: 'kisa', bas: 'casual' },
    { id: 'dalgali', bas: 'formal' },
  ],
  erkek: [
    { id: 'kisa', bas: 'casual_2' },
    { id: 'kabarik', bas: 'casual_hoodie' },
    { id: 'dik', bas: 'beach' },
    { id: 'yanaTarali', bas: 'suit' },
  ],
};
// Bedende olmayan saç seçiliyse (beden değişince, eski kayıt) ilki
export function gecerliSac(beden: 'kadin' | 'erkek', sac: string) {
  return SACLAR[beden].find((s) => s.id === sac) ?? SACLAR[beden][0];
}
export const SAC_RENKLERI = ['#2b211c', '#5a3825', '#8a5a34', '#c98a4a', '#e8cf8a', '#7a3fa8'];

export type Desen = 'duz' | 'cizgili' | 'puantiye';
export interface Onluk {
  id: string;
  renk: string;
  ikinciRenk?: string;
  desen: Desen;
  fiyat: number; // 0 = baştan açık
}

// Önlük şimdilik kaldırıldı (Kemal, 14 Ekim gece: "berbat görünüyor").
// Daha iyisi yapılınca açılır (yol haritası, sona kalanlar); seçenekler ve kayıt duruyor.
export const ONLUK_ACIK = true; // 15 Ekim: bedene oturan önlükle geri geldi (belge 0.12)

// Önlüksüz (Kemal, 15 Ekim akşam: "önlüğü çıkarma düğmesi olsun"); üniformada yine mor önlük
export const ONLUK_YOK = 'yok';

export const ONLUKLER: Onluk[] = fiyatiAyarla([
  { id: 'mor', renk: '#7a3fa8', desen: 'duz', fiyat: 0 },
  { id: 'sari', renk: '#ffc928', desen: 'duz', fiyat: 0 },
  { id: 'krem', renk: '#f6ecd6', desen: 'duz', fiyat: 0 },
  { id: 'cizgili', renk: '#7a3fa8', ikinciRenk: '#ffc928', desen: 'cizgili', fiyat: 150 },
  { id: 'puantiye', renk: '#ff8fb1', ikinciRenk: '#fffaf2', desen: 'puantiye', fiyat: 200 },
], (o) => (AYAR.calisan as Record<string, number>)[`onluk.${o.id}`]);

export type Aksesuar = 'bandana' | 'kasket' | 'gozluk' | 'kupe';
export const AKSESUARLAR: { id: Aksesuar; fiyat: number; bas?: true }[] = fiyatiAyarla([
  { id: 'kupe', fiyat: 100 },
  { id: 'bandana', fiyat: 120, bas: true },
  { id: 'gozluk', fiyat: 160 },
  { id: 'kasket', fiyat: 180, bas: true },
], (o) => (AYAR.calisan as Record<string, number>)[`aksesuar.${o.id}`]);

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
  // Kıyafet (belge 0.12): paketteki bedenlerden biri; boşsa gündelik
  kiyafet: string;
  // Dükkân üniforması: sarı tişört, mor önlük, (başta bir şey yoksa) mor kasket
  uniforma: boolean;
}

// Kıyafet seçenekleri (Kemal'in 14 Ekim'de seçtiği bedenler)
export const KIYAFETLER: Record<Beden, string[]> = {
  kadin: ['casual', 'formal', 'worker', 'suit'],
  erkek: ['casual_2', 'casual_hoodie', 'beach', 'farmer', 'worker', 'suit'],
};

export const VARSAYILAN_CALISAN: CalisanGorunumu = {
  ad: '',
  beden: 'kadin',
  ten: 1,
  sac: 'kisa',
  sacRengi: 1,
  onluk: 'mor',
  aksesuarlar: [],
  kiyafet: '',
  uniforma: false,
};

export const AD_EN_UZUN = 14;
