import { AYAR } from './ayarlar';

// Dondurma çeşitleri ve vitrindeki küvetler.
// İlk dört çeşit: Çilek, Çikolata, Fıstık, Kaymak (Kemal, 13 Ekim).
// 29 çeşitlik liste (Kemal, 14 Ekim: "liste tamam, mango ve yaban mersini
// kalsın"). Kayıtta çeşitler sıra numarasıyla tutulur: yeni çeşit yalnız
// listenin SONUNA eklenir. Fiyatlar geçici.
export type CesitAdi =
  | 'cilek'
  | 'cikolata'
  | 'fistik'
  | 'kaymak'
  | 'mango'
  | 'yabanMersini'
  | 'limon'
  | 'visne'
  | 'kavun'
  | 'karpuz'
  | 'muz'
  | 'kahve'
  | 'findik'
  | 'karamel'
  | 'portakal'
  | 'kayisi'
  | 'seftali'
  | 'hindistanCevizi'
  | 'nane'
  | 'bogurtlen'
  | 'ahududu'
  | 'bitter'
  | 'tarcin'
  | 'balliYogurt'
  | 'karadut'
  | 'sakizli'
  | 'incir'
  | 'gul'
  | 'kestane';

export interface Cesit {
  renk: string;
  ad: CesitAdi;
  fiyat: number; // açmak için gereken para (0 = baştan açık)
  yildiz?: number; // satın alınabilmesi için gereken memnuniyet ortalaması
}

const KOD_CESITLERI: Cesit[] = [
  { renk: '#ff6f7d', ad: 'cilek', fiyat: 0 },
  { renk: '#8a4b2e', ad: 'cikolata', fiyat: 0 },
  { renk: '#5fd08a', ad: 'fistik', fiyat: 0 },
  { renk: '#fff0c8', ad: 'kaymak', fiyat: 0 },
  { renk: '#ffa83a', ad: 'mango', fiyat: 150 },
  { renk: '#5b5fc7', ad: 'yabanMersini', fiyat: 250 },
  // Parayla açılanlar
  { renk: '#fff36b', ad: 'limon', fiyat: 100 },
  { renk: '#b0213f', ad: 'visne', fiyat: 120 },
  { renk: '#ffd2a1', ad: 'kavun', fiyat: 120 },
  { renk: '#ff3b55', ad: 'karpuz', fiyat: 140 },
  { renk: '#f6e7a1', ad: 'muz', fiyat: 140 },
  { renk: '#b07a50', ad: 'kahve', fiyat: 160 },
  { renk: '#c9a27a', ad: 'findik', fiyat: 160 },
  { renk: '#d48a3a', ad: 'karamel', fiyat: 180 },
  { renk: '#ff8c1a', ad: 'portakal', fiyat: 180 },
  { renk: '#f9a65a', ad: 'kayisi', fiyat: 200 },
  { renk: '#ffb59a', ad: 'seftali', fiyat: 200 },
  { renk: '#fbfbf5', ad: 'hindistanCevizi', fiyat: 220 },
  { renk: '#a8eccf', ad: 'nane', fiyat: 220 },
  { renk: '#4b2a5e', ad: 'bogurtlen', fiyat: 260 },
  // Memnuniyetle açılanlar (Kemal, 14 Ekim: 4 / 4,5 / 4,75 yıldız)
  { renk: '#e0457b', ad: 'ahududu', fiyat: 300, yildiz: 4 },
  { renk: '#4a2717', ad: 'bitter', fiyat: 300, yildiz: 4 },
  { renk: '#a0612f', ad: 'tarcin', fiyat: 320, yildiz: 4 },
  { renk: '#f3e3b8', ad: 'balliYogurt', fiyat: 320, yildiz: 4 },
  { renk: '#3d0f2a', ad: 'karadut', fiyat: 450, yildiz: 4.5 },
  { renk: '#eef3e6', ad: 'sakizli', fiyat: 450, yildiz: 4.5 },
  { renk: '#8e5a7a', ad: 'incir', fiyat: 480, yildiz: 4.5 },
  { renk: '#f7a1c4', ad: 'gul', fiyat: 600, yildiz: 4.75 },
  { renk: '#7a4a2a', ad: 'kestane', fiyat: 600, yildiz: 4.75 },
];
// Açma fiyatı ve gereken yıldız ayar dosyasından (7. adım)
export const CESITLER: Cesit[] = KOD_CESITLERI.map((c) => {
  const fiyat = (AYAR.cesitAcma as Record<string, number>)[c.ad] ?? c.fiyat;
  const yildiz = (AYAR.cesitYildiz as Record<string, number>)[c.ad] ?? c.yildiz;
  return yildiz === undefined ? { ...c, fiyat } : { ...c, fiyat, yildiz };
});

// Çeşit başına fiyat (Kemal, 14 Ekim): oyuncu her çeşidin top fiyatını ayrı
// ya da hepsini birden ayarlar. "Makul" fiyattan pahalıya çıkan çeşit daha
// seyrek istenir; çok pahalıysa müşteri biraz daha az memnun olur. Özel
// çeşitlerin makul fiyatı yüksek. Sayılar geçici.
export const FIYAT_ARALIGI: [number, number] = [AYAR.cesitFiyati.enAz, AYAR.cesitFiyati.enCok];
export function makulFiyat(cesit: number) {
  const y = CESITLER[cesit]?.yildiz;
  const f = AYAR.cesitFiyati;
  return y === undefined ? f.makulNormal : y >= 4.75 ? f.makul475 : y >= 4.5 ? f.makul45 : f.makul4;
}

export const BASLANGIC_CESITLERI = CESITLER.map((c, i) => (c.fiyat === 0 ? i : -1)).filter((i) => i >= 0);

// Vitrin (Kemal, 14 Ekim): 4 küvetle başlar, parayla 12'ye büyür.
// 6'dan fazlası iki sıra olur (arka sıra ve öndeki sıra).
export const ILK_VITRIN = AYAR.vitrin.ilkVitrin;
export const VITRIN_BUYUTMELERI = [
  { boy: 6, fiyat: AYAR.vitrin.buyut6 },
  { boy: 8, fiyat: AYAR.vitrin.buyut8 },
  { boy: 10, fiyat: AYAR.vitrin.buyut10 },
  { boy: 12, fiyat: AYAR.vitrin.buyut12 },
];
export const EN_BUYUK_VITRIN = 12;
// İkinci vitrin (0.5) kaldırıldı (0.6): o zaman alınmış 14–20 küvet büyütmelerinin parası geri verilir
export const ESKI_VITRIN_BUYUTMELERI = [
  { boy: 14, fiyat: 1800 },
  { boy: 16, fiyat: 2200 },
  { boy: 18, fiyat: 2600 },
  { boy: 20, fiyat: 3000 },
];

export const KUVET_Y = 1.0; // küvet ağzının yüksekliği
export const KUVET_Z = -0.62; // vitrinin ortası
const SIRA_ARASI = 0.17; // iki sıra olunca sıraların ortadan uzaklığı

// Küvetler arası: dört küvete kadar 0,62 m; daha fazlası ekrana sığsın
// diye sıklaşır (bu açıdan bir sırada rahat sığan 6).
export function kuvetAraligi(sayi: number) {
  return Math.min(0.62, 2.5 / sayi);
}

// İki sırada küvetler biraz daha sık: öndeki sıra kameraya yakın olduğu için
// ekranda daha geniş görünür, sağdaki düğmelerin altına girmesin
function ikiSiraAraligi(sayi: number) {
  return Math.min(0.62, 2.6 / sayi);
}

function siradakiSayi(toplam: number) {
  return toplam > 6 ? Math.ceil(toplam / 2) : toplam;
}

// Bir çeşidin küvetinin yeri ve ölçüsü (vitrinin ortasına göre değil,
// dükkânın içinde). İki sıra varsa ilk yarı arkada.
export function kuvetKonumu(cesit: number, vitrin: number[]) {
  const sira = Math.max(0, vitrin.indexOf(cesit));
  const ikiSira = vitrin.length > 6;
  const birSirada = siradakiSayi(vitrin.length);
  const arkada = ikiSira && sira < birSirada;
  const sirada = ikiSira && !arkada ? sira - birSirada : sira;
  const buSiradaki = ikiSira && !arkada ? vitrin.length - birSirada : birSirada;
  // Öndeki sıra kameraya yakın: biraz sık dursun ki sağdaki düğmenin altına girmesin
  const a = ikiSira ? ikiSiraAraligi(birSirada) * (arkada ? 1 : 0.9) : kuvetAraligi(birSirada);
  return {
    x: (sirada - (buSiradaki - 1) / 2) * a,
    z: KUVET_Z + (ikiSira ? (arkada ? -SIRA_ARASI : SIRA_ARASI) : 0),
    olcekX: a / 0.62,
    olcekZ: ikiSira ? 0.62 : 1,
    arkada,
  };
}

export function vitrinGenisligi(sayi: number) {
  const n = siradakiSayi(sayi);
  return n * (sayi > 6 ? ikiSiraAraligi(n) : kuvetAraligi(n)) + 0.34;
}
