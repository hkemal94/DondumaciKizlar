import { useSyncExternalStore } from 'react';

import { BASLANGIC_CESITLERI, CESITLER, EN_BUYUK_VITRIN, FIYAT_ARALIGI, ILK_VITRIN, makulFiyat, VITRIN_BUYUTMELERI } from './kuvetler';
import {
  BASLANGIC_PARCALARI,
  BASLANGIC_PARSELLERI,
  BASLANGIC_TEZGAHI,
  DUVAR_FIYATI,
  KAPI_FIYATI,
  PENCERE_FIYATI,
  SATIR_EN_AZ,
  YIKIM_FIYATI,
  bagliMi,
  kapiOlabilir,
  kapilar,
  kenarAnahtari,
  parcaTuru,
  parcalariUyarla,
  sinirKenarlari,
  type Kenar,
  type ParcaTuru,
  DUKKAN_PARSELLERI,
  EN_YUKSEK_ISIK,
  ESYALAR,
  ISIK_SEVIYELERI,
  PARSEL,
  TEZGAH_DERINLIGI,
  TEZGAH_EN_KISA,
  TEZGAH_EN_UZUN,
  TEZGAH_METRE_FIYATI,
  Z0,
  birimAnahtari,
  birimCoz,
  birimParseli,
  eskiHucreler,
  eskiKareYeri,
  esyaOlcusu,
  esyaOrtasi,
  kapladigiBirimler,
  noktaninBirimi,
  parselAnahtari,
  parselCoz,
  parselFiyati,
  parselGecerli,
  siraBirimiMi,
  tezgahBirimleri,
  type EskiBolge,
  type Esya,
  type TezgahYeri,
} from './dekorasyon';
import {
  AD_EN_UZUN,
  AKSESUARLAR,
  ONLUKLER,
  SAC_MODELLERI,
  SAC_RENKLERI,
  TENLER,
  VARSAYILAN_CALISAN,
  type Aksesuar,
  type CalisanGorunumu,
} from './calisan';

// Oyunun durumu: kepçe mini oyunu (belge bölüm 3: altlık → kepçe →
// yerleştir → servis) ve müşteri sırası (iş sırası 3).
// Oyuncunun yaptığı her şey buradan geçer; ekran ve 3B sahne buradan okur.

export type Altlik = 'kulah' | 'kap' | 'kup';
// Kup parayla açılır (belge 3: "külah, kap ya da kup"; belge 4: tarif ağacı)
export const KUP_FIYATI = 200;
export const KUP_EKI = 5; // kuplu siparişe ek para
export type Asama = 'altlikSec' | 'kepceBos' | 'dolduruyor' | 'servis';
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
  ikinci?: Omit<Siparis, 'ikinci'>; // tepsi açılınca: ikinci dondurma
}

// Hazırlanmış bir dondurma (tepside bekleyen ya da elde olan)
export interface Urun {
  altlik: Altlik;
  toplar: Top[];
  susleme: Susleme[];
}

export const TEPSI_FIYATI = 400;

export interface Musteri {
  id: number;
  gorunum: number; // musteriGorunumleri sırası
  siparis: Siparis;
  hal: 'sirada' | 'gidiyor';
  mutlu: boolean;
  gelisTarafi: 1 | -1; // iskelenin hangi ucundan geldi (1 = sağ, -1 = sol)
  gidisTarafi: 1 | -1;
}

export type Bildirim =
  | { tur: 'top'; sonuc: Sonuc; zaman: number }
  | { tur: 'para'; miktar: number; bahsis: number; zaman: number }
  | { tur: 'yanlis'; zaman: number }
  | { tur: 'sikildi'; zaman: number }
  | { tur: 'ikiDondurma'; zaman: number }
  | { tur: 'susleme'; eksik: Susleme[]; fazla: Susleme[]; zaman: number };

export interface Durum {
  asama: Asama;
  altlik: Altlik | null;
  toplar: Top[];
  susleme: Susleme[]; // elimizdeki dondurmaya eklenenler (sırasıyla)
  tepsi: Urun[]; // iki dondurmalı siparişte hazırlanıp bekleyen
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
  // Gün başlamadan önce: oyuncu dükkânına bakar, alışveriş yapar; müşteri gelmez, saat durur
  hazirlik: boolean;
  // Sabır (Kemal, 13 Ekim): yalnız öndeki müşteri; son işlemden bu yana geçen oyun dakikası
  sabirMusteri: number | null; // tezgaha varmış öndeki müşteri
  sabirBasi: number; // sabrın başladığı / sıfırlandığı oyun dakikası
  gunluk: GunlukOzet;
  // Kamera (iş sırası 5): dükkânın genel görünümü ya da tezgah yakın planı
  kamera: Kamera;
  // İlerleme (belge 2.4 ve 4): kayıtta saklanır
  acikCesitler: number[];
  // Vitrin (Kemal, 14 Ekim): açık çeşitlerden hangileri bugün küvette.
  // Müşteriler yalnız vitrindekileri ister.
  vitrin: number[];
  vitrinBoyu: number;
  otomatikVitrin: boolean; // her sabah dünün en çok satanları + bir yeni
  satislar: number[]; // bugün çeşit başına satılan top (kaydedilmez)
  dunkuSatislar: number[];
  enIyiOrtalama: number; // ulaşılan en yüksek memnuniyet ortalaması (özel çeşitler için)
  acikAltliklar: Altlik[];
  tepsiAcik: boolean;
  fiyatSeviyesi: FiyatSeviyesi;
  cesitFiyatlari: number[]; // oyuncunun koyduğu top fiyatı (boşsa makul fiyat)
  // Dekorasyon: ışık seviyesi, depodaki eşyalar, yere konmuş eşyalar
  isikSeviyesi: number;
  parseller: string[]; // sahip olunan arazi kareleri ("i,j"; belge 0.2)
  depo: Partial<Record<Esya, number>>;
  yerlesim: Yerlesim[];
  // Kapalı alan ve duvar parçaları (belge 0.4)
  kapaliParseller: string[];
  duvarParcalari: Record<string, ParcaTuru>;
  // Tezgah bölümü (belge 0.3): yeri ve boyu; şimdiye dek parası ödenmiş en uzun boy
  tezgah: TezgahYeri;
  tezgahAlinanBoy: number;
  // İnşaat modu (gün başında; kaydedilmez). Seçili: parsel "i,j" ya da "tezgah"
  insaat: boolean;
  seciliParsel: string | null;
  // Yerleştirme ekranı (kaydedilmez)
  yerlestirme: boolean;
  seciliEsya: Esya | null;
  seciliYon: number; // yerleştirirken eşyanın yönü (0 / 1)
  // Çalışan (Kemal, 13 Ekim): oyuncunun kişiselleştirdiği
  calisan: CalisanGorunumu;
  acikOnlukler: string[];
  acikAksesuarlar: Aksesuar[];
  // Eğitim (Kemal, 14 Ekim): görülen el işaretleri (kayıtta saklanır)
  egitimGoruldu: EgitimAdi[];
  // Duraklatma menüsü (Kemal, 13 Ekim): saat ve müşteriler durur
  duraklatildi: boolean;
  gezme: boolean; // duraklatıp dükkânı gezme (döndürme, yakınlaştırma, fotoğraf)
  mukemmelSeri: number; // arka arkaya bütün topları MÜKEMMEL servis (bahşiş için)
  acilis: boolean; // açılış ekranı (logo, Oyna, Ayarlar) gösteriliyor
}

// Yazısız el işaretli eğitim: ilk sipariş üç adım, sonra ilk kez görülenler
export type EgitimAdi = 'ilkSiparis' | 'susleme' | 'tepsi' | 'vitrin';
export const EGITIMLER: EgitimAdi[] = ['ilkSiparis', 'susleme', 'tepsi', 'vitrin'];

export interface Yerlesim {
  esya: Esya;
  hucre: string; // köşe birim "c,r" (belge 0.3)
  yon: number; // 0 ya da 1 (90° çevrilmiş)
}

export type FiyatSeviyesi = 'ucuz' | 'normal' | 'pahali';

export type Kamera = 'dukkan' | 'tezgah';

export interface GunlukOzet {
  musteri: number;
  kazanc: number;
  mukemmel: number;
  bahsis: number;
  puanlar: number[];
}

function bosOzet(): GunlukOzet {
  return { musteri: 0, kazanc: 0, mukemmel: 0, bahsis: 0, puanlar: [] };
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
  tepsi: [],
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
  hazirlik: true,
  sabirMusteri: null,
  sabirBasi: 0,
  gunluk: bosOzet(),
  kamera: 'dukkan',
  acikCesitler: [...BASLANGIC_CESITLERI],
  vitrin: [...BASLANGIC_CESITLERI],
  vitrinBoyu: ILK_VITRIN,
  otomatikVitrin: false,
  satislar: [],
  dunkuSatislar: [],
  enIyiOrtalama: 0,
  acikAltliklar: ['kulah', 'kap'],
  tepsiAcik: false,
  fiyatSeviyesi: 'normal',
  cesitFiyatlari: [],
  isikSeviyesi: 0,
  parseller: [...BASLANGIC_PARSELLERI],
  depo: {},
  yerlesim: [],
  kapaliParseller: [...DUKKAN_PARSELLERI],
  duvarParcalari: { ...BASLANGIC_PARCALARI },
  tezgah: { ...BASLANGIC_TEZGAHI },
  tezgahAlinanBoy: BASLANGIC_TEZGAHI.boy,
  insaat: false,
  seciliParsel: null,
  yerlestirme: false,
  seciliEsya: null,
  seciliYon: 0,
  calisan: { ...VARSAYILAN_CALISAN },
  acikOnlukler: ONLUKLER.filter((o) => o.fiyat === 0).map((o) => o.id),
  acikAksesuarlar: [],
  egitimGoruldu: [],
  duraklatildi: false,
  gezme: false,
  mukemmelSeri: 0,
  acilis: true,
};

const dinleyiciler = new Set<() => void>();
function guncelle(yeni: Partial<Durum>) {
  durum = { ...durum, ...yeni };
  dinleyiciler.forEach((d) => d());
}

// Oyuncunun yaptığı her işlem (yanlış bile olsa) öndeki müşterinin sabrını sıfırlar.
function islemYapildi() {
  if (durum.sabirMusteri !== null) durum = { ...durum, sabirBasi: durum.dakika };
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

// Altlıklar arasında her an doğrudan geçilir; konmuş toplar ve süslemeler
// yeni altlığa geçer (Kemal, 13 Ekim). Kepçe dalarken ve servis anında olmaz.
export function altlikDegisebilir(d: Durum = durum) {
  return d.asama !== 'dolduruyor' && d.asama !== 'servis' && d.kamera === 'tezgah';
}

export function altlikSec(altlik: Altlik) {
  if (!altlikDegisebilir() || !durum.acikAltliklar.includes(altlik)) return;
  islemYapildi();
  guncelle({ altlik, asama: durum.asama === 'altlikSec' ? 'kepceBos' : durum.asama });
}

export function kuveteBas(kuvet: number) {
  if (durum.asama !== 'kepceBos' || durum.kamera !== 'tezgah') return;
  if (durum.toplar.length >= EN_COK_TOP) return;
  if (durum.susleme.length > 0) return; // süslemenin üstüne top konmaz
  guncelle({ asama: 'dolduruyor', kepceKuvet: kuvet, dolumBasladi: performance.now() });
}

// Parmak kalkınca top doğrudan külaha / kaba iner; ikinci dokunuş yok
// (iPhone denemesi, Kemal 13 Ekim).
export function birak() {
  if (durum.asama !== 'dolduruyor' || durum.kepceKuvet === null) return;
  islemYapildi();
  const dolum = dolumHesapla(performance.now());
  const top: Top = { kuvet: durum.kepceKuvet, boyut: dolum, sonuc: sonucBul(dolum) };
  guncelle({
    asama: 'kepceBos',
    toplar: [...durum.toplar, top],
    kepceKuvet: null,
    bildirim: { tur: 'top', sonuc: top.sonuc, zaman: performance.now() },
  });
}

// Süsleme ya da sos ekle: en az bir top olmalı, her biri bir kez.
// Süsleme düğmesi aç / kapa: basınca eklenir, yeniden basınca kalkar
// (Kemal, 13 Ekim). En az bir top olmalı; birden çok süsleme olabilir.
export function suslemeBasilabilir(d: Durum = durum) {
  return d.asama === 'kepceBos' && d.toplar.length > 0;
}

export function suslemeDegistir(s: Susleme) {
  if (!suslemeBasilabilir()) return;
  islemYapildi();
  guncelle({
    susleme: durum.susleme.includes(s) ? durum.susleme.filter((x) => x !== s) : [...durum.susleme, s],
    ...(ondekiMusteri()?.siparis.susleme.includes(s) ? { egitimGoruldu: egitimEkle('susleme') } : {}),
  });
}

// Geri al: konmuş toplar ve tepsi için (13 Ekim). Son konan top çıkar. Ceza yok.
export function geriAlinabilir(d: Durum = durum) {
  if (d.toplar.length === 0 && d.tepsi.length > 0 && (d.asama === 'altlikSec' || d.asama === 'kepceBos')) return true;
  return d.asama === 'kepceBos' && d.toplar.length > 0;
}

export function geriAl() {
  if (!geriAlinabilir()) return;
  islemYapildi();
  if (durum.toplar.length === 0 && durum.tepsi.length > 0) {
    // Tepsideki dondurma ele geri gelir
    const u = durum.tepsi[durum.tepsi.length - 1];
    guncelle({ tepsi: durum.tepsi.slice(0, -1), altlik: u.altlik, toplar: u.toplar, susleme: u.susleme, asama: 'kepceBos' });
  } else {
    const toplar = durum.toplar.slice(0, -1);
    // Top kalmadıysa süsleme de kalkar
    guncelle({ toplar, susleme: toplar.length ? durum.susleme : [] });
  }
}

// ---- Müşteri sırası (iş sırası 3) ----
// Sayılar geçici: fiyat, gelme aralığı ve sıra uzunluğu denemeyle ayarlanacak.
export const EN_COK_SIRA = 4;
// Kapalı alan büyüdükçe sıra uzar: başlangıçtaki iki kareden sonra her kare bir kişi (belge 0.2)
export function enCokSira(d: Durum = durum) {
  return EN_COK_SIRA + Math.max(0, d.kapaliParseller.length - DUKKAN_PARSELLERI.length);
}
export const GELIS_ARALIGI: [number, number] = [5000, 9000]; // ms
export const MUKEMMEL_EKI = 5;
const BAHSIS_SERISI = 3; // kaçıncı arka arkaya mükemmel serviste bahşiş başlar
const BAHSIS_EN_COK = 10;
export const IYI_EKI = 2;
export const MUSTERI_GORUNUM_SAYISI = 4;

let sonId = 0;

// Pahalı çeşit daha seyrek istenir: ağırlık (makul / fiyat)²
function agirlikliCesit() {
  const agirliklar = durum.vitrin.map((c) => Math.pow(makulFiyat(c) / cesitFiyati(c), 2));
  let z = Math.random() * agirliklar.reduce((a, b) => a + b, 0);
  for (let i = 0; i < durum.vitrin.length; i++) {
    z -= agirliklar[i];
    if (z <= 0) return durum.vitrin[i];
  }
  return durum.vitrin[durum.vitrin.length - 1];
}

function rastgeleDondurma(enCokTop: number, ikiSuslemeOlabilir: boolean): Omit<Siparis, 'ikinci'> {
  const z = Math.random();
  const sayi = Math.min(enCokTop, z < 0.5 ? 1 : z < 0.85 ? 2 : 3);
  // Siparişlerin üçte birinde süsleme istenir; tepsi açıksa bazen iki süsleme (geçici oranlar)
  const susleme: Susleme[] = [];
  if (Math.random() < 0.33) {
    const karisik = [...SUSLEMELER].sort(() => Math.random() - 0.5);
    susleme.push(karisik[0]);
    if (ikiSuslemeOlabilir && Math.random() < 0.35) susleme.push(karisik[1]);
  }
  return {
    altlik: durum.acikAltliklar[Math.floor(Math.random() * durum.acikAltliklar.length)],
    kuvetler: Array.from({ length: sayi }, () => agirlikliCesit()),
    susleme,
  };
}

function rastgeleSiparis(): Siparis {
  // Tepsi açılınca siparişlerin dörtte biri iki dondurma (her biri en çok 2 top)
  if (durum.tepsiAcik && Math.random() < 0.25) {
    return { ...rastgeleDondurma(2, true), ikinci: rastgeleDondurma(2, true) };
  }
  return rastgeleDondurma(3, durum.tepsiAcik);
}

// Giden müşteri iskelenin ucuna varıp ekrandan çıkınca sahne bunu çağırır.
export function musteriyiKaldir(id: number) {
  guncelle({ musteriler: durum.musteriler.filter((m) => m.id !== id) });
}

export function ondekiMusteri(d: Durum = durum): Musteri | undefined {
  return d.musteriler.find((m) => m.hal === 'sirada');
}

// Oyun döngüsü bunu yarım saniyede bir çağırır: sıra boşsa müşteri gelir.
export function musteriDongusu(simdi: number) {
  const siradaki = durum.musteriler.filter((m) => m.hal === 'sirada').length;
  if (!durum.acik || durum.gunSonu || durum.hazirlik || durum.duraklatildi) return; // kapanınca, gün başlamadan ve duraklatınca müşteri gelmez
  if (siradaki >= enCokSira() || simdi < durum.sonrakiGelis) return;
  // İlk sipariş eğitimi: yalnız bir müşteri gelir, siparişi tek toplu külah
  const egitim = ilkSiparisEgitimi();
  if (egitim && durum.musteriler.length > 0) return;
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
        siparis: egitim ? { altlik: 'kulah', kuvetler: [durum.vitrin[0]], susleme: [] } : rastgeleSiparis(),
        hal: 'sirada',
        mutlu: false,
        gelisTarafi: Math.random() < 0.5 ? 1 : -1,
        gidisTarafi: Math.random() < 0.5 ? 1 : -1,
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

// İki dondurmalı siparişte ilk dondurma tepsiye konur, ikincisi hazırlanır
export function tepsiyeKoyabilir(d: Durum = durum) {
  const m = ondekiMusteri(d);
  return !!m?.siparis.ikinci && d.asama === 'kepceBos' && d.toplar.length > 0 && d.altlik !== null && d.tepsi.length === 0;
}

export function tepsiyeKoy() {
  if (!tepsiyeKoyabilir()) return;
  islemYapildi();
  guncelle({
    tepsi: [{ altlik: durum.altlik!, toplar: durum.toplar, susleme: durum.susleme }],
    egitimGoruldu: egitimEkle('tepsi'),
    asama: 'altlikSec',
    altlik: null,
    toplar: [],
    susleme: [],
  });
}

function urunFiyati(u: Urun) {
  return (
    u.toplar.reduce((t, top) => t + satisFiyati(top.kuvet) + (top.sonuc === 'mukemmel' ? MUKEMMEL_EKI : top.sonuc === 'iyi' ? IYI_EKI : 0), 0) +
    u.susleme.length * SUSLEME_FIYATI +
    (u.altlik === 'kup' ? KUP_EKI : 0)
  );
}

export function servisEt() {
  const musteri = ondekiMusteri();
  if (durum.asama !== 'kepceBos' || durum.toplar.length === 0 || !musteri || !durum.altlik) return;
  islemYapildi();
  const simdi = performance.now();

  const istenen = [musteri.siparis, ...(musteri.siparis.ikinci ? [musteri.siparis.ikinci] : [])];
  const verilen: Urun[] = [...durum.tepsi, { altlik: durum.altlik, toplar: durum.toplar, susleme: durum.susleme }];

  // İki dondurma istenmiş ama biri hazır: hatırlat, bir şey çöpe gitmez
  if (verilen.length < istenen.length) {
    guncelle({ bildirim: { tur: 'ikiDondurma', zaman: simdi } });
    return;
  }

  // Dondurmaları siparişlerle eşleştir (sıra kural değil)
  const eslesmeler = istenen.length === 1 ? [[0]] : [[0, 1], [1, 0]];
  const eslesme = eslesmeler.find((e) => e.every((v, i) => dondurmaTutuyorMu(istenen[i], verilen[v].altlik, verilen[v].toplar)));

  if (eslesme) {
    const eksik = istenen.flatMap((s, i) => s.susleme.filter((x) => !verilen[eslesme[i]].susleme.includes(x)));
    const fazla = istenen.flatMap((s, i) => verilen[eslesme[i]].susleme.filter((x) => !s.susleme.includes(x)));
    if (eksik.length > 0 || fazla.length > 0) {
      // Yalnız süsleme tutmuyor: dondurma çöpe gitmez, hatırlatılır (Kemal, 13 Ekim)
      guncelle({ bildirim: { tur: 'susleme', eksik, fazla, zaman: simdi } });
      return;
    }
  }

  if (!eslesme) {
    // Ceza yok: dondurma kenara konur, müşteri beklemeye devam eder.
    guncelle({ asama: 'servis', servisDogru: false, tepsi: [], bildirim: { tur: 'yanlis', zaman: simdi } });
  } else {
    const butunToplar = verilen.flatMap((u) => u.toplar);
    // Bahşiş (Kemal, 14 Ekim): arka arkaya üç ve daha çok mükemmel serviste
    // müşteri küçük bahşiş bırakır; seri bozulunca ceza yok, sıfırlanır.
    const seri = butunToplar.every((t) => t.sonuc === 'mukemmel') ? durum.mukemmelSeri + 1 : 0;
    const bahsis = seri >= BAHSIS_SERISI ? Math.min(BAHSIS_EN_COK, (seri - BAHSIS_SERISI + 1) * 2) : 0;
    const miktar = verilen.reduce((t, u) => t + urunFiyati(u), 0) + bahsis;
    const hamPuan = butunToplar.reduce((t, top) => t + SONUC_PUANI[top.sonuc], 0) / butunToplar.length;
    // Makulün %20'sinden fazla pahalı çeşitler memnuniyeti biraz düşürür
    const pahalilik = butunToplar.reduce((t, top) => t + Math.min(1, Math.max(0, (cesitFiyati(top.kuvet) / makulFiyat(top.kuvet) - 1.2) * 1.5)), 0) / butunToplar.length;
    const puan = Math.max(1, hamPuan - FIYAT_ETKISI[durum.fiyatSeviyesi].memnuniyet - pahalilik);
    const id = musteri.id;
    guncelle({
      asama: 'servis',
      servisDogru: true,
      tepsi: [],
      bildirim: { tur: 'para', miktar, bahsis, zaman: simdi },
      mukemmelSeri: seri,
      para: durum.para + miktar,
      memnuniyetler: [...durum.memnuniyetler, puan],
      satislar: butunToplar.reduce((s, t) => {
        const yeni = [...s];
        yeni[t.kuvet] = (yeni[t.kuvet] ?? 0) + 1;
        return yeni;
      }, durum.satislar),
      enIyiOrtalama: enIyiOrtalamaHesapla([...durum.memnuniyetler, puan]),
      gunluk: {
        musteri: durum.gunluk.musteri + 1,
        kazanc: durum.gunluk.kazanc + miktar,
        mukemmel: durum.gunluk.mukemmel + butunToplar.filter((t) => t.sonuc === 'mukemmel').length,
        bahsis: durum.gunluk.bahsis + bahsis,
        puanlar: [...durum.gunluk.puanlar, puan],
      },
      musteriler: durum.musteriler.map((m) => (m.id === id ? { ...m, hal: 'gidiyor', mutlu: true } : m)),
      egitimGoruldu: egitimEkle('ilkSiparis'),
    });
    // Sırada kimse kalmadıysa kamera dükkânın genel görünümüne döner
    window.setTimeout(() => {
      if (!ondekiMusteri()) kameraSec('dukkan');
    }, 1600);
  }

  // Servis hareketi bitince yeni dondurma için baştan
  window.setTimeout(() => {
    guncelle({ asama: 'altlikSec', altlik: null, toplar: [], susleme: [] });
  }, 1100);
}

export function tepsiAc() {
  if (durum.tepsiAcik || durum.para < TEPSI_FIYATI) return;
  guncelle({ para: durum.para - TEPSI_FIYATI, tepsiAcik: true });
  kaydet();
}

// Özel çeşitlerin şartı: en az 10 müşteriden sonra ulaşılan en yüksek ortalama.
// Bir kez ulaşılan eşik geri kapanmaz (ortalama düşse de).
const ORTALAMA_EN_AZ = 10;
function enIyiOrtalamaHesapla(puanlar: number[]) {
  const son = puanlar.slice(-60);
  if (son.length < ORTALAMA_EN_AZ) return durum.enIyiOrtalama;
  return Math.max(durum.enIyiOrtalama, son.reduce((a, b) => a + b, 0) / son.length);
}

// ---- Eğitim (Kemal, 14 Ekim) ----
export function ilkSiparisEgitimi(d: Durum = durum) {
  return !d.egitimGoruldu.includes('ilkSiparis');
}

function egitimEkle(ad: EgitimAdi) {
  if (durum.egitimGoruldu.includes(ad)) return durum.egitimGoruldu;
  window.setTimeout(kaydet, 0); // görüldüğü hemen saklansın (yeniden açınca tekrar çıkmasın)
  return [...durum.egitimGoruldu, ad];
}

export function egitimGor(ad: EgitimAdi) {
  if (durum.egitimGoruldu.includes(ad)) return;
  guncelle({ egitimGoruldu: egitimEkle(ad) });
  kaydet();
}

// Geç: bütün el işaretleri görülmüş sayılır
export function egitimiAtla() {
  guncelle({ egitimGoruldu: [...EGITIMLER] });
  kaydet();
}

export function egitimiYenidenGoster() {
  guncelle({ egitimGoruldu: [] });
  kaydet();
}

export function ortalamaMemnuniyet(d: Durum = durum): number | null {
  if (d.memnuniyetler.length === 0) return null;
  return d.memnuniyetler.reduce((a, b) => a + b, 0) / d.memnuniyetler.length;
}

// ---- Gün ve saat (iş sırası 4) ----
// Yaz dönemi saatleri (Kemal, 13 Ekim): hafta içi 11:00–00:00, hafta sonu
// 10:00–02:00. Saat beşer dakika ilerler; hafta içi bir gün yaklaşık
// 2 dakika sürsün diye (Kemal, 13 Ekim) her adım 0,77 saniye. 1. gün pazartesi (Kemal, 13 Ekim). Adresin sonuna #hizli
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

// Bir adımın (5 oyun dakikası) gerçek süresi: hafta içi 156 adım × 0,77 sn ≈ 2 dk,
// hafta sonu 192 adım ≈ 2,5 dk
const ADIM_MS = 770;
function adimMs() {
  return HIZLI ? (30_000 / gunUzunlugu()) * ADIM : ADIM_MS;
}

let birikenMs = 0;

// Oyun döngüsü her turda geçen süreyi verir.
export function zamanIlerlet(gecenMs: number) {
  if (durum.gunSonu || durum.hazirlik || durum.duraklatildi) return;
  // İlk sipariş eğitiminde müşteri gelince saat (ve sabır) durur
  if (ilkSiparisEgitimi() && durum.musteriler.some((m) => m.hal === 'sirada')) return;
  if (durum.acik) {
    birikenMs += Math.min(gecenMs, 1000); // sekme arkadayken gün akıp gitmesin
    const adim = Math.floor(birikenMs / adimMs());
    if (adim > 0) {
      birikenMs -= adim * adimMs();
      const uzunluk = gunUzunlugu();
      const dakika = Math.min(uzunluk, durum.dakika + adim * ADIM);
      guncelle({ dakika, acik: dakika < uzunluk });
    }
    sabirKontrol();
    return;
  }
  // Kapandıktan sonra saat durur; sıradakilerin sabrı da azalmaz
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

// Gün sonu ekranında Tamam: ertesi günün başına, dükkânın genel görünümüne
// geçilir. Gün, oyuncu "Güne başla" deyince başlar (Kemal, 13 Ekim).
export function gunSonunuKapat() {
  if (!durum.gunSonu) return;
  birikenMs = 0;
  const dunkuSatislar = durum.satislar;
  guncelle({
    dunkuSatislar,
    satislar: [],
    ...(durum.otomatikVitrin ? { vitrin: otomatikVitrin(dunkuSatislar) } : {}),
    gun: durum.gun + 1,
    dakika: 0,
    acik: true,
    gunSonu: false,
    hazirlik: true,
    gunluk: bosOzet(),
    sonrakiGelis: 0,
    kamera: 'dukkan',
    asama: 'altlikSec',
    altlik: null,
    toplar: [],
    susleme: [],
    tepsi: [],
  });
  kaydet();
}

export function guneBasla() {
  if (!durum.hazirlik) return;
  birikenMs = 0;
  guncelle({ hazirlik: false, sonrakiGelis: 0, yerlestirme: false, seciliEsya: null });
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
  guncelle({ sabirMusteri: id, sabirBasi: durum.dakika });
  kameraSec('tezgah');
}

// ---- Sabır (Kemal, 13 Ekim) ----
// Hiç işlem yapılmadan oyun saatiyle bir saat geçerse öndeki müşteri
// sıkılıp gider ve memnuniyete sıfır yıldız verir. Para kaybı yok.
export const SABIR_DAKIKA = 80; // Kemal, 13 Ekim: gerçekte ~12 sn kalsın (saat hızlanınca 60'tan 80'e)

export function sabirOrani(d: Durum = durum) {
  if (d.sabirMusteri === null || ondekiMusteri(d)?.id !== d.sabirMusteri) return null;
  return Math.max(0, 1 - (d.dakika - d.sabirBasi) / SABIR_DAKIKA);
}

function sabirKontrol() {
  const oran = sabirOrani();
  if (oran === null || oran > 0 || durum.asama === 'servis') return;
  const id = durum.sabirMusteri;
  guncelle({
    sabirMusteri: null,
    memnuniyetler: [...durum.memnuniyetler, 0],
    gunluk: { ...durum.gunluk, puanlar: [...durum.gunluk.puanlar, 0] },
    musteriler: durum.musteriler.map((m) => (m.id === id ? { ...m, hal: 'gidiyor', mutlu: false } : m)),
    bildirim: { tur: 'sikildi', zaman: performance.now() },
  });
  window.setTimeout(() => {
    if (!ondekiMusteri()) kameraSec('dukkan');
  }, 1600);
}

// ---- İlerleme (belge 2.4 ve 4) ----
// Hepsi geçici sayılar; Kemal'in onayını bekliyor (belge 7.4).
export const FIYAT_ETKISI: Record<FiyatSeviyesi, { fiyat: number; gelis: number; memnuniyet: number }> = {
  ucuz: { fiyat: 0.8, gelis: 0.8, memnuniyet: 0 },
  normal: { fiyat: 1, gelis: 1, memnuniyet: 0 },
  pahali: { fiyat: 1.3, gelis: 1.3, memnuniyet: 0.5 },
};

// Her yerleştirilmiş eşya ve her ışık seviyesi müşteri aralığını kısaltır (en çok %50)
const ESYA_ETKISI = 0.04;
const ISIK_ETKISI = 0.06;

// Oyuncunun koyduğu fiyat (genel seviyeden önce) ve müşterinin ödediği
export function cesitFiyati(cesit: number, d: Durum = durum) {
  return d.cesitFiyatlari[cesit] ?? makulFiyat(cesit);
}

export function satisFiyati(cesit: number, d: Durum = durum) {
  return Math.round(cesitFiyati(cesit, d) * FIYAT_ETKISI[d.fiyatSeviyesi].fiyat);
}

// Çeşidin ne kadar istendiği: 'cok' | 'olagan' | 'az' (ekranda gösterilir)
export function istekDurumu(cesit: number, d: Durum = durum) {
  const oran = cesitFiyati(cesit, d) / makulFiyat(cesit);
  return oran <= 0.85 ? 'cok' : oran <= 1.2 ? 'olagan' : 'az';
}

const fiyatSiniri = (f: number) => Math.round(Math.min(FIYAT_ARALIGI[1], Math.max(FIYAT_ARALIGI[0], f)));

export function cesitFiyatiSec(cesit: number, fiyat: number) {
  const yeni = [...durum.cesitFiyatlari];
  yeni[cesit] = fiyatSiniri(fiyat);
  guncelle({ cesitFiyatlari: yeni });
}

// Toplu: açık çeşitlerin hepsine aynı fiyat
export function butunFiyatlariSec(fiyat: number) {
  const yeni = [...durum.cesitFiyatlari];
  for (const c of durum.acikCesitler) yeni[c] = fiyatSiniri(fiyat);
  guncelle({ cesitFiyatlari: yeni });
}

// Her çeşit kendi makul fiyatına döner
export function makulFiyatlaraDon() {
  guncelle({ cesitFiyatlari: [] });
  kaydet();
}

export function fiyatlariKaydet() {
  kaydet();
}

// Hafta sonu daha kalabalık (Kemal, 13 Ekim): müşteriler daha sık gelir
const HAFTA_SONU_CARPANI = 0.65;

function gelisCarpani() {
  const haftaSonu = haftaSonuMu() ? HAFTA_SONU_CARPANI : 1;
  const cekicilik = Math.min(0.5, ESYA_ETKISI * durum.yerlesim.length + ISIK_ETKISI * durum.isikSeviyesi);
  return FIYAT_ETKISI[durum.fiyatSeviyesi].gelis * (1 - cekicilik) * haftaSonu;
}

export function cesitAc(cesit: number) {
  const c = CESITLER[cesit];
  if (!c || durum.acikCesitler.includes(cesit) || durum.para < c.fiyat || !cesitAlinabilir(cesit)) return;
  // Vitrinde yer varsa yeni çeşit hemen küvete girer
  const yerVar = durum.vitrin.length < durum.vitrinBoyu;
  guncelle({
    para: durum.para - c.fiyat,
    acikCesitler: [...durum.acikCesitler, cesit],
    ...(yerVar ? { vitrin: [...durum.vitrin, cesit] } : {}),
  });
  kaydet();
}

// Özel çeşitler memnuniyet ortalaması eşiğe ulaşınca satın alınabilir
export function cesitAlinabilir(cesit: number, d: Durum = durum) {
  const c = CESITLER[cesit];
  return !!c && (c.yildiz === undefined || d.enIyiOrtalama >= c.yildiz);
}

// ---- Vitrin (Kemal, 14 Ekim) ----
export function sonrakiVitrin(d: Durum = durum) {
  return VITRIN_BUYUTMELERI.find((b) => b.boy > d.vitrinBoyu) ?? null;
}

export function vitrinBuyut() {
  const b = sonrakiVitrin();
  if (!b || durum.para < b.fiyat) return;
  // Yeni yerler açık çeşitlerle dolar
  const ekler = durum.acikCesitler.filter((c) => !durum.vitrin.includes(c)).slice(0, b.boy - durum.vitrin.length);
  guncelle({ para: durum.para - b.fiyat, vitrinBoyu: b.boy, vitrin: [...durum.vitrin, ...ekler] });
  kaydet();
}

// Gün başında vitrine çeşit koy / çıkar. Elle seçince otomatik kapanır.
export function vitrinDegistir(cesit: number) {
  if (!durum.hazirlik || !durum.acikCesitler.includes(cesit)) return;
  if (durum.vitrin.includes(cesit)) {
    if (durum.vitrin.length <= 1) return; // vitrin boş kalmaz
    guncelle({ vitrin: durum.vitrin.filter((c) => c !== cesit), otomatikVitrin: false });
  } else {
    if (durum.vitrin.length >= durum.vitrinBoyu) return;
    guncelle({ vitrin: [...durum.vitrin, cesit], otomatikVitrin: false });
  }
  kaydet();
}

export function otomatikVitrinSec(acik: boolean) {
  guncelle({ otomatikVitrin: acik, ...(acik && durum.hazirlik ? { vitrin: otomatikVitrin(durum.dunkuSatislar) } : {}) });
  kaydet();
}

// Otomatik vitrin: dünün en çok satanları, bir yer de her gün farklı bir çeşide
function otomatikVitrin(satislar: number[]) {
  const acik = durum.acikCesitler;
  const boy = Math.min(durum.vitrinBoyu, acik.length);
  const karisik = [...acik].sort(() => Math.random() - 0.5);
  const satanlar = [...karisik].filter((c) => (satislar[c] ?? 0) > 0).sort((a, b) => (satislar[b] ?? 0) - (satislar[a] ?? 0));
  const secilen = satanlar.slice(0, Math.max(0, boy - 1));
  // Bir yeni: dün vitrinde olmayanlardan, yoksa herhangi biri
  const yeni = karisik.find((c) => !secilen.includes(c) && !durum.vitrin.includes(c)) ?? karisik.find((c) => !secilen.includes(c));
  if (yeni !== undefined && secilen.length < boy) secilen.push(yeni);
  for (const c of karisik) if (secilen.length < boy && !secilen.includes(c)) secilen.push(c);
  return secilen;
}

export function kupAc() {
  if (durum.acikAltliklar.includes('kup') || durum.para < KUP_FIYATI) return;
  guncelle({ para: durum.para - KUP_FIYATI, acikAltliklar: [...durum.acikAltliklar, 'kup'] });
  kaydet();
}

// ---- Dekorasyon (3. paket) ----
export function isikAl() {
  const sonraki = ISIK_SEVIYELERI[durum.isikSeviyesi];
  if (!sonraki || durum.isikSeviyesi >= EN_YUKSEK_ISIK || durum.para < sonraki.fiyat) return;
  guncelle({ para: durum.para - sonraki.fiyat, isikSeviyesi: durum.isikSeviyesi + 1 });
  kaydet();
}

export function esyaAl(esya: Esya) {
  const e = ESYALAR.find((x) => x.id === esya);
  if (!e || durum.para < e.fiyat) return;
  guncelle({ para: durum.para - e.fiyat, depo: { ...durum.depo, [esya]: (durum.depo[esya] ?? 0) + 1 } });
  kaydet();
}

export function depodaki(esya: Esya, d: Durum = durum) {
  return d.depo[esya] ?? 0;
}

export function yerlestirmeyiAc() {
  if (!durum.hazirlik) return;
  const ilk = ESYALAR.find((e) => depodaki(e.id) > 0)?.id ?? null;
  guncelle({ yerlestirme: true, seciliEsya: ilk, kamera: 'dukkan' });
}

export function yerlestirmeyiKapat() {
  guncelle({ yerlestirme: false, seciliEsya: null });
  kaydet();
}

export function esyaSec(esya: Esya) {
  if (depodaki(esya) > 0) guncelle({ seciliEsya: esya });
}

// ---- Arazi ve İnşaat modu (belge 0.1, 0.2; Kemal, 14 Ekim) ----
// Kare durumu: sahip olunan (yeşil), komşusu sahip olunan → alınabilir
// (sarı), öteki kareler alınamaz (gri).
export type ParselDurumu = 'sahip' | 'alinabilir' | 'kilitli';
export function parselDurumu(anahtar: string, d: Durum = durum): ParselDurumu {
  if (d.parseller.includes(anahtar)) return 'sahip';
  const { i, j } = parselCoz(anahtar);
  if (!parselGecerli(i, j)) return 'kilitli';
  const komsu = [
    [i - 1, j],
    [i + 1, j],
    [i, j - 1],
    [i, j + 1],
  ].some(([a, b]) => d.parseller.includes(parselAnahtari(a, b)));
  return komsu ? 'alinabilir' : 'kilitli';
}

// Şimdiye dek satın alınan kare sayısı (başlangıç kareleri sayılmaz)
function alinanParselSayisi(d: Durum) {
  return d.parseller.filter((p) => !BASLANGIC_PARSELLERI.includes(p)).length;
}

export function parselFiyatiNe(anahtar: string, d: Durum = durum) {
  const { i, j } = parselCoz(anahtar);
  return parselFiyati(i, j, alinanParselSayisi(d));
}

export function insaataBasla() {
  if (!durum.hazirlik) return;
  guncelle({ insaat: true, seciliParsel: null, kamera: 'dukkan' });
}

export function insaattanCik() {
  guncelle({ insaat: false, seciliParsel: null });
  kaydet();
}

export function parselSec(anahtar: string | null) {
  if (durum.insaat) guncelle({ seciliParsel: anahtar });
}

export function parselAl(anahtar: string) {
  if (!durum.insaat || parselDurumu(anahtar) !== 'alinabilir') return;
  const fiyat = parselFiyatiNe(anahtar);
  if (durum.para < fiyat) return;
  guncelle({ para: durum.para - fiyat, parseller: [...durum.parseller, anahtar] });
  kaydet();
}

// Kareye eşya konabilir mi: arazisi oyuncunun olmalı
export function birimSahipli(c: number, r: number, d: Durum = durum) {
  return d.parseller.includes(birimParseli(c, r));
}

// Kapalı alan (duvarların içi): şimdilik yalnız dükkân; duvar adımında büyüyecek
export function kapaliParseller(_d: Durum = durum): string[] {
  return _d.kapaliParseller;
}
export function birimIcMi(c: number, r: number, d: Durum = durum) {
  return kapaliParseller(d).includes(birimParseli(c, r));
}

// Dükkânın kapıları (belge 0.4)
export function dukkanKapilari(d: Durum = durum) {
  return kapilar(d.kapaliParseller, d.duvarParcalari);
}

// Eşya konamayan birimler: her kapının önünden yürüyüş yoluna giden yol,
// kapının içindeki birim, tezgah bölümü ve önündeki müşteri sırası
export function birimEngelli(c: number, r: number, d: Durum = durum) {
  if (dukkanKapilari(d).some((k) => k.c === c && r >= SATIR_EN_AZ * PARSEL && r <= k.r)) return true;
  const t = d.tezgah;
  if (c >= t.c && c < t.c + t.boy && r >= t.r && r < t.r + TEZGAH_DERINLIGI) return true;
  return siraBirimiMi(t, c, r);
}

export function birimDolu(c: number, r: number, d: Durum = durum, haric?: Yerlesim) {
  return d.yerlesim.some((y) => {
    if (y === haric) return false;
    const k = birimCoz(y.hucre);
    return kapladigiBirimler(y.esya, k.c, k.r, y.yon).some((b) => b.c === c && b.r === r);
  });
}

// Eşya bu köşe birimden başlayarak sığar mı: hepsi alınmış arazide, boş,
// engelsiz; hepsi içeride ya da hepsi dışarıda; dışarıya özel eşya içeri konmaz
export function esyaSigar(esya: Esya, c: number, r: number, yon: number, d: Durum = durum, haric?: Yerlesim) {
  const birimler = kapladigiBirimler(esya, c, r, yon);
  const ic = birimIcMi(birimler[0].c, birimler[0].r, d);
  if (ic && ESYALAR.find((e) => e.id === esya)?.disari) return false;
  return birimler.every(
    (b) => birimSahipli(b.c, b.r, d) && !birimEngelli(b.c, b.r, d) && !birimDolu(b.c, b.r, d, haric) && birimIcMi(b.c, b.r, d) === ic,
  );
}

// Dokunulan noktaya en yakın, eşyanın sığdığı köşe birim (2 m içinde)
export function enYakinYer(esya: Esya, x: number, z: number, yon: number, d: Durum = durum, enUzak = 2) {
  const { en, boy } = esyaOlcusu(esya, yon);
  const c0 = Math.round(x - en / 2);
  const r0 = Math.round(z - Z0 - boy / 2);
  let enIyi: { c: number; r: number } | null = null;
  let enKisa = enUzak;
  for (let dc = -2; dc <= 2; dc++)
    for (let dr = -2; dr <= 2; dr++) {
      const c = c0 + dc;
      const r = r0 + dr;
      if (!esyaSigar(esya, c, r, yon, d)) continue;
      const o = esyaOrtasi(esya, c, r, yon);
      const uzak = Math.hypot(o.x - x, o.z - z);
      if (uzak < enKisa) {
        enKisa = uzak;
        enIyi = { c, r };
      }
    }
  return enIyi;
}

// Bir noktadaki konmuş eşya
export function noktadakiEsya(x: number, z: number, d: Durum = durum) {
  const { c, r } = noktaninBirimi(x, z);
  return d.yerlesim.find((y) => {
    const k = birimCoz(y.hucre);
    return kapladigiBirimler(y.esya, k.c, k.r, y.yon).some((b) => b.c === c && b.r === r);
  });
}

// Dokunulan yere seçili eşyayı koy
export function noktayaKoy(x: number, z: number) {
  const e = durum.seciliEsya;
  if (!durum.yerlestirme || !e || depodaki(e) <= 0) return;
  const yer = enYakinYer(e, x, z, durum.seciliYon);
  if (!yer) return;
  const kalan = depodaki(e) - 1;
  guncelle({
    yerlesim: [...durum.yerlesim, { esya: e, hucre: birimAnahtari(yer.c, yer.r), yon: durum.seciliYon }],
    depo: { ...durum.depo, [e]: kalan },
    // Depoda o eşya kalmadıysa başka bir eşyaya geç
    seciliEsya: kalan > 0 ? e : (ESYALAR.find((x) => x.id !== e && depodaki(x.id) > 0)?.id ?? null),
  });
}

// Konmuş eşyaya dokununca yerden kalkar, depoya döner ve seçilir (taşımak için)
export function yerlesimiKaldir(y: Yerlesim) {
  if (!durum.yerlestirme || !durum.yerlesim.includes(y)) return;
  guncelle({
    yerlesim: durum.yerlesim.filter((x) => x !== y),
    depo: { ...durum.depo, [y.esya]: depodaki(y.esya) + 1 },
    seciliEsya: y.esya,
    seciliYon: y.yon,
  });
}

// Yerleştirirken eşyayı çevir (belge 0.3)
export function esyaCevir() {
  guncelle({ seciliYon: (durum.seciliYon + 1) % 2 });
}

// ---- Duvar ör / yık, duvar parçaları (belge 0.4) ----
// Yapı değişince sığmayan eşyalar (dış eşya içeride kaldı, kapı yolunda
// kaldı, yarısı içeride yarısı dışarıda…) depoya döner.
function yapiyiDegistir(degisen: Partial<Durum>, para: number) {
  const sonra: Durum = { ...durum, ...degisen, yerlesim: [] };
  const depo = { ...durum.depo };
  for (const y of durum.yerlesim) {
    const k = birimCoz(y.hucre);
    if (esyaSigar(y.esya, k.c, k.r, y.yon, sonra)) sonra.yerlesim.push(y);
    else depo[y.esya] = (depo[y.esya] ?? 0) + 1;
  }
  guncelle({ ...degisen, yerlesim: sonra.yerlesim, depo, para: durum.para - para });
  kaydet();
}

// Duvar örülebilir mi: kare oyuncunun, açık ve kapalı alana komşu
export function duvarOrulebilir(anahtar: string, d: Durum = durum) {
  if (!d.parseller.includes(anahtar) || d.kapaliParseller.includes(anahtar)) return false;
  return bagliMi([...d.kapaliParseller, anahtar]);
}

export function duvarOr(anahtar: string) {
  if (!durum.insaat || !duvarOrulebilir(anahtar) || durum.para < DUVAR_FIYATI) return;
  const yeni = [...durum.kapaliParseller, anahtar];
  yapiyiDegistir({ kapaliParseller: yeni, duvarParcalari: parcalariUyarla(durum.kapaliParseller, yeni, durum.duvarParcalari) }, DUVAR_FIYATI);
}

// Duvar yıkılabilir mi: tezgah bölümü ve sırası o karede olmamalı; kalan
// kapalı alan tek parça kalmalı ve en az bir kapısı olmalı
export function duvarYikilabilir(anahtar: string, d: Durum = durum) {
  if (!d.kapaliParseller.includes(anahtar)) return false;
  const yeni = d.kapaliParseller.filter((p) => p !== anahtar);
  if (!bagliMi(yeni)) return false;
  const sonra: Durum = { ...d, kapaliParseller: yeni, duvarParcalari: parcalariUyarla(d.kapaliParseller, yeni, d.duvarParcalari) };
  if (!tezgahUygun(d.tezgah, sonra)) return false;
  return dukkanKapilari(sonra).length > 0;
}

export function duvarYik(anahtar: string) {
  if (!durum.insaat || !duvarYikilabilir(anahtar) || durum.para < YIKIM_FIYATI) return;
  const yeni = durum.kapaliParseller.filter((p) => p !== anahtar);
  yapiyiDegistir({ kapaliParseller: yeni, duvarParcalari: parcalariUyarla(durum.kapaliParseller, yeni, durum.duvarParcalari) }, YIKIM_FIYATI);
}

// Bir duvar parçasının yapılabilecek türleri ve fiyatları
export function parcaSecenekleri(k: Kenar, d: Durum = durum): { tur: ParcaTuru; fiyat: number; olur: boolean }[] {
  const simdiki = parcaTuru(k, d.duvarParcalari);
  const kapiSayisi = dukkanKapilari(d).length;
  const kapiyiKaldirir = simdiki === 'kapi';
  const sonra = (tur: ParcaTuru): Durum => ({ ...d, duvarParcalari: { ...d.duvarParcalari, [kenarAnahtari(k)]: tur } });
  const secenekler: { tur: ParcaTuru; fiyat: number; olur: boolean }[] = [
    { tur: 'duvar', fiyat: 0, olur: !kapiyiKaldirir || kapiSayisi > 1 },
    { tur: 'pencere', fiyat: PENCERE_FIYATI, olur: !kapiyiKaldirir || kapiSayisi > 1 },
  ];
  if (kapiOlabilir(k, d.kapaliParseller)) {
    const tezgahIcinde = tezgahBirimleri(d.tezgah).govde.some((b) => b.c === k.c && b.r === k.r);
    secenekler.push({ tur: 'kapi', fiyat: kapiSayisi > 0 ? KAPI_FIYATI : 0, olur: !tezgahIcinde && tezgahUygun(d.tezgah, sonra('kapi')) });
  }
  return secenekler.map((x) => ({ ...x, olur: x.olur && x.tur !== simdiki && d.para >= x.fiyat }));
}

export function parcaDegistir(anahtar: string, tur: ParcaTuru) {
  if (!durum.insaat) return;
  const [c, r, y] = anahtar.split(',');
  const k: Kenar = { c: Number(c), r: Number(r), y: y as Kenar['y'] };
  if (!sinirKenarlari(durum.kapaliParseller).some((x) => kenarAnahtari(x) === anahtar)) return;
  const secenek = parcaSecenekleri(k).find((x) => x.tur === tur);
  if (!secenek?.olur) return;
  yapiyiDegistir({ duvarParcalari: { ...durum.duvarParcalari, [anahtar]: tur } }, secenek.fiyat);
}

// ---- Tezgah bölümü: taşıma ve boy (belge 0.3) ----
// Tezgah ve önündeki sıra tamamen kapalı alanda olmalı; kapının içindeki
// birim boş kalmalı.
export function tezgahUygun(t: TezgahYeri, d: Durum = durum) {
  if (t.boy < TEZGAH_EN_KISA || t.boy > TEZGAH_EN_UZUN) return false;
  const { govde, sira } = tezgahBirimleri(t);
  const kapiIci = dukkanKapilari(d);
  if (govde.some((b) => kapiIci.some((k) => k.c === b.c && k.r === b.r))) return false;
  return [...govde, ...sira].every((b) => birimIcMi(b.c, b.r, d));
}

// Yeni yerin altında kalan eşyalar depoya döner
function tezgahiKoy(t: TezgahYeri, ek: Partial<Durum> = {}) {
  const sonra = { ...durum, tezgah: t };
  const kalan: Yerlesim[] = [];
  const depo = { ...durum.depo };
  for (const y of durum.yerlesim) {
    const k = birimCoz(y.hucre);
    if (kapladigiBirimler(y.esya, k.c, k.r, y.yon).some((b) => birimEngelli(b.c, b.r, sonra))) depo[y.esya] = (depo[y.esya] ?? 0) + 1;
    else kalan.push(y);
  }
  guncelle({ tezgah: t, yerlesim: kalan, depo, ...ek });
  kaydet();
}

export function tezgahTasinabilir(dc: number, dr: number, d: Durum = durum) {
  return tezgahUygun({ ...d.tezgah, c: d.tezgah.c + dc, r: d.tezgah.r + dr }, d);
}

export function tezgahiTasi(dc: number, dr: number) {
  if (!durum.insaat || !tezgahTasinabilir(dc, dr)) return;
  tezgahiKoy({ ...durum.tezgah, c: durum.tezgah.c + dc, r: durum.tezgah.r + dr });
}

// Uzatma: önce sağa (+x), sığmazsa sola; kısaltma sağ uçtan
function uzamisTezgah(d: Durum): TezgahYeri | null {
  const t = d.tezgah;
  const saga = { ...t, boy: t.boy + 1 };
  if (tezgahUygun(saga, d)) return saga;
  const sola = { ...t, c: t.c - 1, boy: t.boy + 1 };
  return tezgahUygun(sola, d) ? sola : null;
}

export function tezgahUzatmaFiyati(d: Durum = durum) {
  return d.tezgah.boy + 1 > d.tezgahAlinanBoy ? TEZGAH_METRE_FIYATI : 0;
}

export function tezgahUzatilabilir(d: Durum = durum) {
  return !!uzamisTezgah(d) && d.para >= tezgahUzatmaFiyati(d);
}

export function tezgahiUzat() {
  if (!durum.insaat) return;
  const t = uzamisTezgah(durum);
  const fiyat = tezgahUzatmaFiyati();
  if (!t || durum.para < fiyat) return;
  tezgahiKoy(t, { para: durum.para - fiyat, tezgahAlinanBoy: Math.max(durum.tezgahAlinanBoy, t.boy) });
}

export function tezgahKisaltilabilir(d: Durum = durum) {
  return tezgahUygun({ ...d.tezgah, boy: d.tezgah.boy - 1 }, d);
}

export function tezgahiKisalt() {
  if (!durum.insaat || !tezgahKisaltilabilir()) return;
  tezgahiKoy({ ...durum.tezgah, boy: durum.tezgah.boy - 1 });
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
  vitrin: number[];
  vitrinBoyu: number;
  otomatikVitrin: boolean;
  dunkuSatislar: number[];
  enIyiOrtalama: number;
  acikAltliklar: Altlik[];
  tepsiAcik: boolean;
  fiyatSeviyesi: FiyatSeviyesi;
  cesitFiyatlari: (number | null)[];
  isikSeviyesi: number;
  parseller: string[];
  acikBolgeler?: EskiBolge[]; // eski kayıt (14 Ekim akşamı öncesi)
  depo: Partial<Record<Esya, number>>;
  yerlesim: { esya: Esya; hucre: string | number; yon?: number }[];
  tezgah?: TezgahYeri;
  tezgahAlinanBoy?: number;
  kapaliParseller?: string[];
  duvarParcalari?: Record<string, ParcaTuru>;
  dekorlar?: string[]; // eski kayıt (13 Ekim öncesi)
  calisan: CalisanGorunumu;
  acikOnlukler: string[];
  acikAksesuarlar: Aksesuar[];
  egitimGoruldu: EgitimAdi[];
}

function kaydet() {
  const k: Kayit = {
    para: durum.para,
    gun: durum.gun,
    memnuniyetler: durum.memnuniyetler.slice(-60),
    acikCesitler: durum.acikCesitler,
    vitrin: durum.vitrin,
    vitrinBoyu: durum.vitrinBoyu,
    otomatikVitrin: durum.otomatikVitrin,
    dunkuSatislar: durum.dunkuSatislar,
    enIyiOrtalama: durum.enIyiOrtalama,
    acikAltliklar: durum.acikAltliklar,
    tepsiAcik: durum.tepsiAcik,
    fiyatSeviyesi: durum.fiyatSeviyesi,
    cesitFiyatlari: durum.cesitFiyatlari,
    isikSeviyesi: durum.isikSeviyesi,
    parseller: durum.parseller,
    tezgah: durum.tezgah,
    tezgahAlinanBoy: durum.tezgahAlinanBoy,
    kapaliParseller: durum.kapaliParseller,
    duvarParcalari: durum.duvarParcalari,
    depo: durum.depo,
    yerlesim: durum.yerlesim,
    calisan: durum.calisan,
    acikOnlukler: durum.acikOnlukler,
    acikAksesuarlar: durum.acikAksesuarlar,
    egitimGoruldu: durum.egitimGoruldu,
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
      ...vitriniOku(k, acik.length ? acik : [...BASLANGIC_CESITLERI]),
      tepsiAcik: k.tepsiAcik === true,
      acikAltliklar: Array.isArray(k.acikAltliklar) && k.acikAltliklar.includes('kup') ? ['kulah', 'kap', 'kup'] : ['kulah', 'kap'],
      fiyatSeviyesi: k.fiyatSeviyesi && k.fiyatSeviyesi in FIYAT_ETKISI ? k.fiyatSeviyesi : 'normal',
      // JSON boş yerleri null yazar: null = makul fiyat
      cesitFiyatlari: Array.isArray(k.cesitFiyatlari)
        ? k.cesitFiyatlari.map((f) => (typeof f === 'number' ? fiyatSiniri(f) : undefined)) as number[]
        : [],
      ...dekorasyonuOku(k),
      ...calisaniOku(k),
      // 14 Ekim'den önce oynanmış kayıtta eğitim görülmüş sayılır (istenirse mola menüsünden açılır)
      egitimGoruldu: Array.isArray(k.egitimGoruldu)
        ? k.egitimGoruldu.filter((e) => EGITIMLER.includes(e))
        : (k.gun ?? 1) > 1 || (k.memnuniyetler?.length ?? 0) > 0
          ? [...EGITIMLER]
          : [],
    });
  } catch {
    // Bozuk ya da okunamayan kayıt: baştan başlanır.
  }
}

// Vitrin: 14 Ekim'den önceki kayıtta yoktu; açık çeşitlerin hepsi vitrindeydi.
// O dükkânın vitrini küçülmesin diye boyu açık çeşit sayısına göre açılır.
function vitrinBoyuGecerli(n: unknown): n is number {
  return typeof n === 'number' && (n === ILK_VITRIN || VITRIN_BUYUTMELERI.some((b) => b.boy === n));
}

function eskiOrtalama(puanlar: unknown) {
  if (!Array.isArray(puanlar) || puanlar.length < ORTALAMA_EN_AZ) return 0;
  const son = puanlar.slice(-60).filter((p): p is number => typeof p === 'number');
  return son.length ? son.reduce((a, b) => a + b, 0) / son.length : 0;
}

function vitriniOku(k: Partial<Kayit>, acik: number[]) {
  const vitrinBoyu = vitrinBoyuGecerli(k.vitrinBoyu)
    ? k.vitrinBoyu
    : Math.min(EN_BUYUK_VITRIN, Math.max(ILK_VITRIN, acik.length + (acik.length % 2)));
  const kayitli = Array.isArray(k.vitrin) ? k.vitrin.filter((c, i, t) => acik.includes(c) && t.indexOf(c) === i).slice(0, vitrinBoyu) : [];
  const sayilar = (x: unknown) => (Array.isArray(x) ? x.map((n) => (typeof n === 'number' ? n : 0)) : []);
  return {
    vitrinBoyu,
    vitrin: kayitli.length ? kayitli : acik.slice(0, vitrinBoyu),
    otomatikVitrin: k.otomatikVitrin === true,
    dunkuSatislar: sayilar(k.dunkuSatislar),
    enIyiOrtalama: typeof k.enIyiOrtalama === 'number' ? k.enIyiOrtalama : eskiOrtalama(k.memnuniyetler),
  };
}

function dekorasyonuOku(k: Partial<Kayit>) {
  const esyaMi = (e: unknown): e is Esya => ESYALAR.some((x) => x.id === e);
  const depo: Partial<Record<Esya, number>> = {};
  if (k.depo && typeof k.depo === 'object')
    for (const [e, n] of Object.entries(k.depo)) if (esyaMi(e) && typeof n === 'number' && n > 0) depo[e] = n;
  // Arazi: kayıttaki kareler; yoksa eski kayıttır, yeni araziye taşınır
  const parseller = new Set<string>(BASLANGIC_PARSELLERI);
  if (Array.isArray(k.parseller)) {
    for (const p of k.parseller) if (typeof p === 'string' && parselGecerli(parselCoz(p).i, parselCoz(p).j)) parseller.add(p);
  } else {
    // Önceden bedava olan dükkân önü teras ve alınmış alanların karşılığı kareler
    parseller.add('0,-1');
    const eskiAlan: Record<EskiBolge, string[]> = { solYan: ['1,0'], sagYan: ['-2,0'], solYol: ['1,-1'], sagYol: ['-2,-1'] };
    if (Array.isArray(k.acikBolgeler)) for (const b of k.acikBolgeler) for (const p of eskiAlan[b] ?? []) parseller.add(p);
  }
  // Kapalı alan ve duvar parçaları: yoksa başlangıçtaki (eski kayıtta da yan pencereler gelir)
  let kapali = [...DUKKAN_PARSELLERI];
  if (Array.isArray(k.kapaliParseller)) {
    const aday = k.kapaliParseller.filter((p): p is string => typeof p === 'string' && parseller.has(p));
    if (DUKKAN_PARSELLERI.every((p) => aday.includes(p)) && bagliMi(aday)) kapali = aday;
  }
  const sinir = new Set(sinirKenarlari(kapali).map(kenarAnahtari));
  let duvarParcalari: Record<string, ParcaTuru> = { ...BASLANGIC_PARCALARI };
  if (k.duvarParcalari && typeof k.duvarParcalari === 'object') {
    duvarParcalari = {};
    for (const [a, t] of Object.entries(k.duvarParcalari)) if (sinir.has(a) && ['duvar', 'pencere', 'kapi'].includes(t)) duvarParcalari[a] = t;
  }
  if (kapilar(kapali, duvarParcalari).length === 0) duvarParcalari = { ...duvarParcalari, ...BASLANGIC_PARCALARI };
  // Tezgah bölümü
  const t = k.tezgah;
  const tezgahAlinanBoy = typeof k.tezgahAlinanBoy === 'number' ? Math.min(TEZGAH_EN_UZUN, Math.max(BASLANGIC_TEZGAHI.boy, k.tezgahAlinanBoy)) : BASLANGIC_TEZGAHI.boy;
  const deneme: Durum = { ...durum, parseller: [...parseller], kapaliParseller: kapali, duvarParcalari, yerlesim: [] };
  const tezgah: TezgahYeri =
    t && [t.c, t.r, t.boy].every((n) => Number.isInteger(n)) && t.boy <= tezgahAlinanBoy && tezgahUygun(t, deneme) ? { c: t.c, r: t.r, boy: t.boy } : { ...BASLANGIC_TEZGAHI };
  deneme.tezgah = tezgah;
  // Konmuş eşyalar. Yeni kayıtta köşe birim ("c,r") ve yön; eski kayıtlarda
  // (sıra numarası ya da "i,j:a,b") eşyanın eski yerine en yakın sığdığı
  // yere taşınır, sığmazsa depoya döner. Eşyanın durduğu kare oyuncunundur.
  const eski = eskiHucreler();
  if (Array.isArray(k.yerlesim))
    for (const y of k.yerlesim) {
      if (!esyaMi(y?.esya)) continue;
      const yon = y.yon === 1 ? 1 : 0;
      if (typeof y.hucre === 'string' && !y.hucre.includes(':')) {
        const { c, r } = birimCoz(y.hucre);
        if (Number.isInteger(c) && Number.isInteger(r) && esyaSigar(y.esya, c, r, yon, deneme)) {
          deneme.yerlesim.push({ esya: y.esya, hucre: birimAnahtari(c, r), yon });
          continue;
        }
        depo[y.esya] = (depo[y.esya] ?? 0) + 1;
        continue;
      }
      const yer = typeof y.hucre === 'number' ? eski[y.hucre] : eskiKareYeri(y.hucre);
      if (yer) {
        const b = noktaninBirimi(yer.x, yer.z);
        const p = birimParseli(b.c, b.r);
        if (parselGecerli(parselCoz(p).i, parselCoz(p).j)) {
          parseller.add(p);
          deneme.parseller = [...parseller];
        }
      }
      const hedef = yer && enYakinYer(y.esya, yer.x, yer.z, 0, deneme, 2.5);
      if (hedef) deneme.yerlesim.push({ esya: y.esya, hucre: birimAnahtari(hedef.c, hedef.r), yon: 0 });
      else depo[y.esya] = (depo[y.esya] ?? 0) + 1;
    }
  let isikSeviyesi = typeof k.isikSeviyesi === 'number' ? Math.min(EN_YUKSEK_ISIK, Math.max(0, k.isikSeviyesi)) : 0;
  // Eski kayıttaki dekorasyon: fenerler → 1. ışık; masa, şemsiye, çiçekler → depoya
  if (Array.isArray(k.dekorlar)) {
    if (k.dekorlar.includes('fenerler')) isikSeviyesi = Math.max(isikSeviyesi, 1);
    if (k.dekorlar.includes('masa')) depo.masa = (depo.masa ?? 0) + 1;
    if (k.dekorlar.includes('semsiye')) depo.semsiyeliMasa = (depo.semsiyeliMasa ?? 0) + 1;
    if (k.dekorlar.includes('cicekler')) depo.saksi = (depo.saksi ?? 0) + 3;
  }
  return { isikSeviyesi, depo, yerlesim: deneme.yerlesim, parseller: [...parseller], tezgah, tezgahAlinanBoy, kapaliParseller: kapali, duvarParcalari };
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
    vitrin: [...BASLANGIC_CESITLERI],
    vitrinBoyu: ILK_VITRIN,
    otomatikVitrin: false,
    satislar: [],
    dunkuSatislar: [],
    enIyiOrtalama: 0,
    acikAltliklar: ['kulah', 'kap'],
    tepsiAcik: false,
    tepsi: [],
    fiyatSeviyesi: 'normal',
    cesitFiyatlari: [],
    isikSeviyesi: 0,
    parseller: [...BASLANGIC_PARSELLERI],
    depo: {},
    yerlesim: [],
    kapaliParseller: [...DUKKAN_PARSELLERI],
    duvarParcalari: { ...BASLANGIC_PARCALARI },
    tezgah: { ...BASLANGIC_TEZGAHI },
    tezgahAlinanBoy: BASLANGIC_TEZGAHI.boy,
    insaat: false,
    seciliParsel: null,
    yerlestirme: false,
    seciliEsya: null,
    seciliYon: 0,
    calisan: { ...VARSAYILAN_CALISAN },
    acikOnlukler: ONLUKLER.filter((o) => o.fiyat === 0).map((o) => o.id),
    acikAksesuarlar: [],
    egitimGoruldu: [],
    dakika: 0,
    acik: true,
    gunSonu: false,
    hazirlik: true,
    gunluk: bosOzet(),
    sonrakiGelis: 0,
    musteriler: [],
    kamera: 'dukkan',
    asama: 'altlikSec',
    altlik: null,
    toplar: [],
    susleme: [],
  });
}

// ---- Duraklatma (Kemal, 13 Ekim) ----
// Saat, müşteriler ve sabır durur. Menüden dükkân gezilir, fotoğraf çekilir,
// ses ayarlanır. Kepçe dalarken ve gün sonunda açılmaz.
// Açılış ekranında Oyna'ya basılınca oyun (gün başı) görünür
export function acilisiKapat() {
  guncelle({ acilis: false });
}

export function duraklatilabilir(d: Durum = durum) {
  return !d.acilis && !d.gunSonu && d.asama !== 'dolduruyor' && !d.yerlestirme;
}

export function duraklat() {
  if (!duraklatilabilir()) return;
  guncelle({ duraklatildi: true, gezme: false });
}

export function devamEt() {
  guncelle({ duraklatildi: false, gezme: false });
}

let gezmedenOnceKamera: Kamera = 'dukkan';
export function gezmeyeBasla() {
  if (!durum.duraklatildi) return;
  gezmedenOnceKamera = durum.kamera;
  guncelle({ gezme: true, kamera: 'dukkan' });
}

export function gezmeyiBitir() {
  // Menüye geri döner; kamera eski yerine
  guncelle({ gezme: false, kamera: gezmedenOnceKamera });
}

// ---- Deneme parası (Kemal, 13 Ekim: dekorasyonu görmek için) ----
// Yalnız adresin sonuna #deneme yazılınca görünür; oyunun kendisinde yok.
export const DENEME = typeof location !== 'undefined' && location.hash === '#deneme';

export function denemeParasi() {
  if (!DENEME) return;
  guncelle({ para: durum.para + 5000 });
  kaydet();
}

// ---- Çalışan (Kemal, 13 Ekim) ----
export function calisaniDegistir(yeni: Partial<CalisanGorunumu>) {
  const c = { ...durum.calisan, ...yeni };
  if (yeni.ad !== undefined) c.ad = yeni.ad.slice(0, AD_EN_UZUN);
  if (yeni.onluk && !durum.acikOnlukler.includes(yeni.onluk)) return;
  guncelle({ calisan: c });
  kaydet();
}

export function onlukAl(id: string) {
  const o = ONLUKLER.find((x) => x.id === id);
  if (!o || durum.acikOnlukler.includes(id) || durum.para < o.fiyat) return;
  guncelle({ para: durum.para - o.fiyat, acikOnlukler: [...durum.acikOnlukler, id], calisan: { ...durum.calisan, onluk: id } });
  kaydet();
}

export function aksesuarAl(id: Aksesuar) {
  const a = AKSESUARLAR.find((x) => x.id === id);
  if (!a || durum.acikAksesuarlar.includes(id) || durum.para < a.fiyat) return;
  guncelle({ para: durum.para - a.fiyat, acikAksesuarlar: [...durum.acikAksesuarlar, id] });
  aksesuarDegistir(id);
}

// Tak / çıkar. Başa yalnız bir şey takılır (bandana ya da kasket).
export function aksesuarDegistir(id: Aksesuar) {
  if (!durum.acikAksesuarlar.includes(id)) return;
  const takili = durum.calisan.aksesuarlar;
  let yeni: Aksesuar[];
  if (takili.includes(id)) yeni = takili.filter((x) => x !== id);
  else {
    const basaMi = AKSESUARLAR.find((x) => x.id === id)?.bas;
    yeni = [...takili.filter((x) => !(basaMi && AKSESUARLAR.find((y) => y.id === x)?.bas)), id];
  }
  guncelle({ calisan: { ...durum.calisan, aksesuarlar: yeni } });
  kaydet();
}

function calisaniOku(k: Partial<Kayit>): Pick<Durum, 'calisan' | 'acikOnlukler' | 'acikAksesuarlar'> {
  const c = (k.calisan ?? {}) as Partial<CalisanGorunumu>;
  const acikOnlukler = [
    ...new Set([
      ...ONLUKLER.filter((o) => o.fiyat === 0).map((o) => o.id),
      ...(Array.isArray(k.acikOnlukler) ? k.acikOnlukler.filter((x) => ONLUKLER.some((o) => o.id === x)) : []),
    ]),
  ];
  const acikAksesuarlar = Array.isArray(k.acikAksesuarlar) ? k.acikAksesuarlar.filter((x) => AKSESUARLAR.some((a) => a.id === x)) : [];
  return {
    acikOnlukler,
    acikAksesuarlar,
    calisan: {
      ad: typeof c.ad === 'string' ? c.ad.slice(0, AD_EN_UZUN) : '',
      ten: typeof c.ten === 'number' && TENLER[c.ten] ? c.ten : VARSAYILAN_CALISAN.ten,
      sac: SAC_MODELLERI.includes(c.sac as never) ? (c.sac as CalisanGorunumu['sac']) : VARSAYILAN_CALISAN.sac,
      sacRengi: typeof c.sacRengi === 'number' && SAC_RENKLERI[c.sacRengi] ? c.sacRengi : VARSAYILAN_CALISAN.sacRengi,
      onluk: typeof c.onluk === 'string' && acikOnlukler.includes(c.onluk) ? c.onluk : VARSAYILAN_CALISAN.onluk,
      aksesuarlar: Array.isArray(c.aksesuarlar) ? c.aksesuarlar.filter((x) => acikAksesuarlar.includes(x)) : [],
    },
  };
}
