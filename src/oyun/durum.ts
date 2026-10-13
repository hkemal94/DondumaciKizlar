import { useSyncExternalStore } from 'react';

import { BASLANGIC_CESITLERI, CESITLER } from './kuvetler';

// Oyunun durumu: kepçe mini oyunu (belge bölüm 3: altlık → kepçe →
// yerleştir → servis) ve müşteri sırası (iş sırası 3).
// Oyuncunun yaptığı her şey buradan geçer; ekran ve 3B sahne buradan okur.

export type Altlik = 'kulah' | 'kap' | 'kup';
// Kup parayla açılır (belge 3: "külah, kap ya da kup"; belge 4: tarif ağacı)
export const KUP_FIYATI = 200;
export const KUP_EKI = 5; // kuplu siparişe ek para
export type Asama = 'altlikSec' | 'kepceBos' | 'dolduruyor' | 'kepceDolu' | 'servis';
export type Sonuc = 'mukemmel' | 'iyi' | 'kucuk' | 'buyuk';

export interface Top {
  kuvet: number;
  boyut: number; // 0–1 arası dolum
  sonuc: Sonuc;
}

// Süsleme ve sos (belge bölüm 3, adım 4). Adlar yalnız yiyeceğin adı.
export type Susleme = 'sos' | 'seker' | 'findik';
export const SUSLEMELER: Susleme[] = ['sos', 'seker', 'findik'];
export const SUSLEME_FIYATI = 3;

export interface Siparis {
  altlik: Altlik;
  kuvetler: number[]; // hangi küvetlerden kaç top
  susleme: Susleme[];
}

export interface Musteri {
  id: number;
  gorunum: number; // musteriGorunumleri sırası
  siparis: Siparis;
  hal: 'sirada' | 'gidiyor';
  mutlu: boolean;
}

export type Bildirim =
  | { tur: 'top'; sonuc: Sonuc; zaman: number }
  | { tur: 'para'; miktar: number; zaman: number }
  | { tur: 'yanlis'; zaman: number }
  | { tur: 'susleme'; eksik: Susleme[]; fazla: Susleme[]; zaman: number };

export interface Durum {
  asama: Asama;
  altlik: Altlik | null;
  toplar: Top[];
  susleme: Susleme[]; // elimizdeki dondurmaya eklenenler (sırasıyla)
  kepcedeki: Top | null;
  kepceKuvet: number | null; // basılı tutulan küvet
  dolumBasladi: number; // basılı tutma anı (ms)
  bildirim: Bildirim | null;
  servisDogru: boolean;
  musteriler: Musteri[];
  sonrakiGelis: number; // bir sonraki müşterinin geleceği an (ms)
  para: number;
  memnuniyetler: number[]; // her müşterinin 1–5 puanı
  // Gün ve saat (iş sırası 4)
  gun: number;
  dakika: number; // açılıştan bu yana geçen oyun dakikası
  acik: boolean;
  gunSonu: boolean;
  gunluk: GunlukOzet;
  // Kamera (iş sırası 5): dükkânın genel görünümü ya da tezgah yakın planı
  kamera: Kamera;
  // İlerleme (belge 2.4 ve 4): kayıtta saklanır
  acikCesitler: number[];
  acikAltliklar: Altlik[];
  fiyatSeviyesi: FiyatSeviyesi;
  dekorlar: Dekor[];
}

export type FiyatSeviyesi = 'ucuz' | 'normal' | 'pahali';
export type Dekor = 'masa' | 'semsiye' | 'cicekler' | 'fenerler';

export type Kamera = 'dukkan' | 'tezgah';

export interface GunlukOzet {
  musteri: number;
  kazanc: number;
  mukemmel: number;
  puanlar: number[];
}

function bosOzet(): GunlukOzet {
  return { musteri: 0, kazanc: 0, mukemmel: 0, puanlar: [] };
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
  susleme: [],
  kepcedeki: null,
  kepceKuvet: null,
  dolumBasladi: 0,
  bildirim: null,
  servisDogru: false,
  musteriler: [],
  sonrakiGelis: 0,
  para: 0,
  memnuniyetler: [],
  gun: 1,
  dakika: 0,
  acik: true,
  gunSonu: false,
  gunluk: bosOzet(),
  kamera: 'dukkan',
  acikCesitler: [...BASLANGIC_CESITLERI],
  acikAltliklar: ['kulah', 'kap'],
  fiyatSeviyesi: 'normal',
  dekorlar: [],
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
  if (!durum.acikAltliklar.includes(altlik)) return;
  guncelle({ altlik, asama: 'kepceBos' });
}

export function kuveteBas(kuvet: number) {
  if (durum.asama !== 'kepceBos' || durum.kamera !== 'tezgah') return;
  if (durum.toplar.length >= EN_COK_TOP) return;
  if (durum.susleme.length > 0) return; // süslemenin üstüne top konmaz
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
    bildirim: { tur: 'top', sonuc: top.sonuc, zaman: performance.now() },
  });
}

export function topuYerlestir() {
  if (durum.asama !== 'kepceDolu' || !durum.kepcedeki) return;
  guncelle({ asama: 'kepceBos', toplar: [...durum.toplar, durum.kepcedeki], kepcedeki: null });
}

// Süsleme ya da sos ekle: en az bir top olmalı, her biri bir kez.
export function suslemeEklenebilir(s: Susleme, d: Durum = durum) {
  return d.asama === 'kepceBos' && d.toplar.length > 0 && !d.susleme.includes(s);
}

export function suslemeEkle(s: Susleme) {
  if (!suslemeEklenebilir(s)) return;
  guncelle({ susleme: [...durum.susleme, s] });
}

// Geri al (Kemal, 12 Ekim: "hata yaptığım zaman geri alamıyorum").
// Sırayla: kepçedeki topu küvete geri koy → son süslemeyi kaldır →
// son konan topu çıkar → altlığı bırak. Ceza yok, dondurma boşa gitmez.
export function geriAlinabilir(d: Durum = durum) {
  if (d.asama === 'kepceDolu') return true;
  return d.asama === 'kepceBos' && (d.toplar.length > 0 || d.altlik !== null);
}

export function geriAl() {
  if (!geriAlinabilir()) return;
  if (durum.asama === 'kepceDolu') guncelle({ asama: 'kepceBos', kepcedeki: null });
  else if (durum.susleme.length > 0) guncelle({ susleme: durum.susleme.slice(0, -1) });
  else if (durum.toplar.length > 0) guncelle({ toplar: durum.toplar.slice(0, -1) });
  else guncelle({ asama: 'altlikSec', altlik: null });
}

// ---- Müşteri sırası (iş sırası 3) ----
// Sayılar geçici: fiyat, gelme aralığı ve sıra uzunluğu denemeyle ayarlanacak.
export const EN_COK_SIRA = 4;
export const GELIS_ARALIGI: [number, number] = [5000, 9000]; // ms
export const TOP_FIYATI = 10;
export const MUKEMMEL_EKI = 5;
export const IYI_EKI = 2;
export const MUSTERI_GORUNUM_SAYISI = 4;

let sonId = 0;

function rastgeleSiparis(): Siparis {
  const z = Math.random();
  const sayi = z < 0.5 ? 1 : z < 0.85 ? 2 : 3;
  // Siparişlerin üçte birinde bir süsleme ya da sos istenir (geçici oran)
  const susleme: Susleme[] = Math.random() < 0.33 ? [SUSLEMELER[Math.floor(Math.random() * SUSLEMELER.length)]] : [];
  return {
    altlik: durum.acikAltliklar[Math.floor(Math.random() * durum.acikAltliklar.length)],
    kuvetler: Array.from({ length: sayi }, () => durum.acikCesitler[Math.floor(Math.random() * durum.acikCesitler.length)]),
    susleme,
  };
}

export function ondekiMusteri(d: Durum = durum): Musteri | undefined {
  return d.musteriler.find((m) => m.hal === 'sirada');
}

// Oyun döngüsü bunu yarım saniyede bir çağırır: sıra boşsa müşteri gelir.
export function musteriDongusu(simdi: number) {
  const siradaki = durum.musteriler.filter((m) => m.hal === 'sirada').length;
  if (!durum.acik || durum.gunSonu) return; // kapanınca yeni müşteri gelmez
  if (siradaki >= EN_COK_SIRA || simdi < durum.sonrakiGelis) return;
  const [en, enCok] = GELIS_ARALIGI;
  // Sıra boşken ilk müşteri hemen gelsin. Fiyat ve dekorasyon müşteri
  // sıklığını etkiler (belge 4: dükkânın çekiciliği).
  const bekle = siradaki === 0 ? 1500 : (en + Math.random() * (enCok - en)) * gelisCarpani();
  guncelle({
    musteriler: [
      ...durum.musteriler,
      {
        id: ++sonId,
        gorunum: Math.floor(Math.random() * MUSTERI_GORUNUM_SAYISI),
        siparis: rastgeleSiparis(),
        hal: 'sirada',
        mutlu: false,
      },
    ],
    sonrakiGelis: simdi + bekle,
  });
}

// Altlık ve toplar tutuyor mu (sıra kural değil; Kemal, 13 Ekim)
function dondurmaTutuyorMu(siparis: Siparis, altlik: Altlik | null, toplar: Top[]) {
  if (altlik !== siparis.altlik || toplar.length !== siparis.kuvetler.length) return false;
  const a = toplar.map((t) => t.kuvet).sort();
  const b = [...siparis.kuvetler].sort();
  return a.every((k, i) => k === b[i]);
}

const SONUC_PUANI: Record<Sonuc, number> = { mukemmel: 5, iyi: 4, kucuk: 3, buyuk: 3 };

export function servisEt() {
  const musteri = ondekiMusteri();
  if (durum.asama !== 'kepceBos' || durum.toplar.length === 0 || !musteri) return;
  const simdi = performance.now();

  const eksik = musteri.siparis.susleme.filter((x) => !durum.susleme.includes(x));
  const fazla = durum.susleme.filter((x) => !musteri.siparis.susleme.includes(x));
  const dondurmaDogru = dondurmaTutuyorMu(musteri.siparis, durum.altlik, durum.toplar);

  if (dondurmaDogru && (eksik.length > 0 || fazla.length > 0)) {
    // Yalnız süsleme tutmuyor: dondurma çöpe gitmez, hatırlatılır (Kemal, 13 Ekim).
    // Eksik süsleme eklenir, fazlası Geri al ile kaldırılır.
    guncelle({ bildirim: { tur: 'susleme', eksik, fazla, zaman: simdi } });
    return;
  }

  if (!dondurmaDogru) {
    // Ceza yok: dondurma kenara konur, müşteri beklemeye devam eder.
    guncelle({ asama: 'servis', servisDogru: false, bildirim: { tur: 'yanlis', zaman: simdi } });
  } else {
    const miktar =
      durum.toplar.reduce(
        (t, top) => t + topFiyati() + (top.sonuc === 'mukemmel' ? MUKEMMEL_EKI : top.sonuc === 'iyi' ? IYI_EKI : 0),
        0,
      ) +
      durum.susleme.length * SUSLEME_FIYATI +
      (durum.altlik === 'kup' ? KUP_EKI : 0);
    const hamPuan = durum.toplar.reduce((t, top) => t + SONUC_PUANI[top.sonuc], 0) / durum.toplar.length;
    const puan = Math.max(1, hamPuan - FIYAT_ETKISI[durum.fiyatSeviyesi].memnuniyet);
    const id = musteri.id;
    guncelle({
      asama: 'servis',
      servisDogru: true,
      bildirim: { tur: 'para', miktar, zaman: simdi },
      para: durum.para + miktar,
      memnuniyetler: [...durum.memnuniyetler, puan],
      gunluk: {
        musteri: durum.gunluk.musteri + 1,
        kazanc: durum.gunluk.kazanc + miktar,
        mukemmel: durum.gunluk.mukemmel + durum.toplar.filter((t) => t.sonuc === 'mukemmel').length,
        puanlar: [...durum.gunluk.puanlar, puan],
      },
      musteriler: durum.musteriler.map((m) => (m.id === id ? { ...m, hal: 'gidiyor', mutlu: true } : m)),
    });
    // Giden müşteri ekrandan çıkınca listeden silinir
    window.setTimeout(() => {
      guncelle({ musteriler: durum.musteriler.filter((m) => m.id !== id) });
    }, 4000);
    // Sırada kimse kalmadıysa kamera dükkânın genel görünümüne döner
    window.setTimeout(() => {
      if (!ondekiMusteri()) kameraSec('dukkan');
    }, 1600);
  }

  // Servis hareketi bitince yeni dondurma için baştan
  window.setTimeout(() => {
    guncelle({ asama: 'altlikSec', altlik: null, toplar: [], susleme: [], kepcedeki: null });
  }, 1100);
}

export function ortalamaMemnuniyet(d: Durum = durum): number | null {
  if (d.memnuniyetler.length === 0) return null;
  return d.memnuniyetler.reduce((a, b) => a + b, 0) / d.memnuniyetler.length;
}

// ---- Gün ve saat (iş sırası 4) ----
// Yaz dönemi saatleri (Kemal, 13 Ekim): hafta içi 11:00–00:00, hafta sonu
// 10:00–02:00. Her gerçek saniye saate 5 dakika ekler; saat beşer dakika
// ilerler. 1. gün pazartesi (Kemal, 13 Ekim). Adresin sonuna #hizli
// yazılırsa gün 30 saniyede biter (gün sonunu görmek için).
const ADIM = 5; // saat kaçar dakika ilerler
const HIZLI = typeof location !== 'undefined' && location.hash === '#hizli';

export function haftaGunu(d: Durum = durum) {
  return (d.gun - 1) % 7; // 0 = pazartesi … 6 = pazar
}

export function haftaSonuMu(d: Durum = durum) {
  return haftaGunu(d) >= 5;
}

// O günün açılış ve kapanışı (gece yarısından sonrası 24+ olarak)
export function calismaSaatleri(d: Durum = durum) {
  return haftaSonuMu(d) ? { acilis: 10 * 60, kapanis: 26 * 60 } : { acilis: 11 * 60, kapanis: 24 * 60 };
}

function gunUzunlugu(d: Durum = durum) {
  const { acilis, kapanis } = calismaSaatleri(d);
  return kapanis - acilis;
}

// Bir adımın (5 oyun dakikası) gerçek süresi: 1 saniye
function adimMs() {
  return HIZLI ? (30_000 / gunUzunlugu()) * ADIM : 1000;
}

let birikenMs = 0;

// Oyun döngüsü her turda geçen süreyi verir.
export function zamanIlerlet(gecenMs: number) {
  if (durum.gunSonu) return;
  if (durum.acik) {
    birikenMs += Math.min(gecenMs, 1000); // sekme arkadayken gün akıp gitmesin
    const adim = Math.floor(birikenMs / adimMs());
    if (adim > 0) {
      birikenMs -= adim * adimMs();
      const uzunluk = gunUzunlugu();
      const dakika = Math.min(uzunluk, durum.dakika + adim * ADIM);
      guncelle({ dakika, acik: dakika < uzunluk });
    }
    return;
  }
  // Kapandı: sıradakilere servis bitince gün sonu ekranı
  const bekleyen = durum.musteriler.some((m) => m.hal === 'sirada');
  if (!bekleyen && durum.asama === 'altlikSec') guncelle({ gunSonu: true });
}

// Günün saati, dakika olarak (gece yarısından sonra 24*60'ı geçer)
export function saatDakikasi(d: Durum = durum) {
  return calismaSaatleri(d).acilis + d.dakika;
}

export function saatYazisi(d: Durum = durum) {
  const toplam = saatDakikasi(d) % (24 * 60);
  const s = Math.floor(toplam / 60);
  const dk = toplam % 60;
  return `${String(s).padStart(2, '0')}:${String(dk).padStart(2, '0')}`;
}

export function yeniGun() {
  if (!durum.gunSonu) return;
  birikenMs = 0;
  guncelle({
    gun: durum.gun + 1,
    dakika: 0,
    acik: true,
    gunSonu: false,
    gunluk: bosOzet(),
    sonrakiGelis: 0,
    kamera: 'dukkan',
    asama: 'altlikSec',
    altlik: null,
    toplar: [],
    susleme: [],
    kepcedeki: null,
  });
  kaydet();
}

// ---- Kamera (iş sırası 5) ----
// Sipariş gelince (öndeki müşteri tezgaha varınca) kamera tezgaha geçer;
// sıra boşalınca dükkânın genel görünümüne döner. Oyuncu düğmeyle de geçer.
export function kameraSec(kamera: Kamera) {
  if (durum.kamera !== kamera) guncelle({ kamera });
}

let sonKarsilanan = 0;
// Öndeki müşteri tezgaha vardığında sahne bunu çağırır (her müşteri için bir kez).
export function musteriTezgahaVardi(id: number) {
  if (id === sonKarsilanan) return;
  sonKarsilanan = id;
  kameraSec('tezgah');
}

// ---- İlerleme (belge 2.4 ve 4) ----
// Hepsi geçici sayılar; Kemal'in onayını bekliyor (belge 7.4).
export const FIYAT_ETKISI: Record<FiyatSeviyesi, { fiyat: number; gelis: number; memnuniyet: number }> = {
  ucuz: { fiyat: 0.8, gelis: 0.8, memnuniyet: 0 },
  normal: { fiyat: 1, gelis: 1, memnuniyet: 0 },
  pahali: { fiyat: 1.3, gelis: 1.3, memnuniyet: 0.5 },
};

export const DEKORLAR: { id: Dekor; fiyat: number }[] = [
  { id: 'cicekler', fiyat: 80 },
  { id: 'fenerler', fiyat: 120 },
  { id: 'semsiye', fiyat: 160 },
  { id: 'masa', fiyat: 200 },
];
const DEKOR_ETKISI = 0.06; // her dekorasyon müşteri aralığını %6 kısaltır

export function topFiyati(d: Durum = durum) {
  return Math.round(TOP_FIYATI * FIYAT_ETKISI[d.fiyatSeviyesi].fiyat);
}

function gelisCarpani() {
  return FIYAT_ETKISI[durum.fiyatSeviyesi].gelis * (1 - DEKOR_ETKISI * durum.dekorlar.length);
}

export function cesitAc(cesit: number) {
  const c = CESITLER[cesit];
  if (!c || durum.acikCesitler.includes(cesit) || durum.para < c.fiyat) return;
  guncelle({ para: durum.para - c.fiyat, acikCesitler: [...durum.acikCesitler, cesit] });
  kaydet();
}

export function kupAc() {
  if (durum.acikAltliklar.includes('kup') || durum.para < KUP_FIYATI) return;
  guncelle({ para: durum.para - KUP_FIYATI, acikAltliklar: [...durum.acikAltliklar, 'kup'] });
  kaydet();
}

export function dekorAl(id: Dekor) {
  const d = DEKORLAR.find((x) => x.id === id);
  if (!d || durum.dekorlar.includes(id) || durum.para < d.fiyat) return;
  guncelle({ para: durum.para - d.fiyat, dekorlar: [...durum.dekorlar, id] });
  kaydet();
}

export function fiyatSec(f: FiyatSeviyesi) {
  guncelle({ fiyatSeviyesi: f });
  kaydet();
}

// ---- Kayıt ----
// İlerleme bu tarayıcıda saklanır (para, gün, açılan çeşitler, fiyat,
// dekorasyon). Tarayıcı izin vermezse oyun kayıtsız çalışır.
const KAYIT_ANAHTARI = 'dondurmaci-kizlar-kayit-1';

interface Kayit {
  para: number;
  gun: number;
  memnuniyetler: number[];
  acikCesitler: number[];
  acikAltliklar: Altlik[];
  fiyatSeviyesi: FiyatSeviyesi;
  dekorlar: Dekor[];
}

function kaydet() {
  const k: Kayit = {
    para: durum.para,
    gun: durum.gun,
    memnuniyetler: durum.memnuniyetler.slice(-60),
    acikCesitler: durum.acikCesitler,
    acikAltliklar: durum.acikAltliklar,
    fiyatSeviyesi: durum.fiyatSeviyesi,
    dekorlar: durum.dekorlar,
  };
  try {
    localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(k));
  } catch {
    // Kayıt yapılamadı (gizli pencere vb.); oyun devam eder.
  }
}

export function kaydiYukle() {
  try {
    const ham = localStorage.getItem(KAYIT_ANAHTARI);
    if (!ham) return;
    const k = JSON.parse(ham) as Partial<Kayit>;
    const acik = Array.isArray(k.acikCesitler) ? k.acikCesitler.filter((i) => CESITLER[i]) : [];
    guncelle({
      para: typeof k.para === 'number' ? k.para : 0,
      gun: typeof k.gun === 'number' ? k.gun : 1,
      memnuniyetler: Array.isArray(k.memnuniyetler) ? k.memnuniyetler : [],
      acikCesitler: acik.length ? acik : [...BASLANGIC_CESITLERI],
      acikAltliklar: Array.isArray(k.acikAltliklar) && k.acikAltliklar.includes('kup') ? ['kulah', 'kap', 'kup'] : ['kulah', 'kap'],
      fiyatSeviyesi: k.fiyatSeviyesi && k.fiyatSeviyesi in FIYAT_ETKISI ? k.fiyatSeviyesi : 'normal',
      dekorlar: Array.isArray(k.dekorlar) ? k.dekorlar.filter((d) => DEKORLAR.some((x) => x.id === d)) : [],
    });
  } catch {
    // Bozuk ya da okunamayan kayıt: baştan başlanır.
  }
}

// Baştan başla: kaydı siler, her şeyi ilk güne döndürür.
export function bastanBasla() {
  try {
    localStorage.removeItem(KAYIT_ANAHTARI);
  } catch {
    // yok sayılır
  }
  birikenMs = 0;
  guncelle({
    para: 0,
    gun: 1,
    memnuniyetler: [],
    acikCesitler: [...BASLANGIC_CESITLERI],
    acikAltliklar: ['kulah', 'kap'],
    fiyatSeviyesi: 'normal',
    dekorlar: [],
    dakika: 0,
    acik: true,
    gunSonu: false,
    gunluk: bosOzet(),
    sonrakiGelis: 0,
    musteriler: [],
    kamera: 'dukkan',
    asama: 'altlikSec',
    altlik: null,
    toplar: [],
    susleme: [],
    kepcedeki: null,
  });
}
