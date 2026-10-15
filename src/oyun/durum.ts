import { useSyncExternalStore } from 'react';

import {
  BASLANGIC_ACIK_GORUNUSLER,
  BASLANGIC_GORUNUSU,
  acikGorunusleriOku,
  gorunusAnahtari,
  gorunusSecenegi,
  gorunusuOku,
  tabelaAnahtari,
  tabelalariOku,
  TABELALAR,
  type Tabela,
  type Gorunus,
  type GorunusGrubu,
} from './gorunus';
import { BASLANGIC_CESITLERI, CESITLER, EN_BUYUK_VITRIN, ESKI_VITRIN_BUYUTMELERI, FIYAT_ARALIGI, ILK_VITRIN, makulFiyat, VITRIN_BUYUTMELERI } from './kuvetler';
import {
  EN_COK_YARDIMCI,
  ISTASYONLAR,
  EN_COK_ICECEK,
  ICECEKLER,
  ICECEK_FIYATI,
  IKINCI_VITRIN_IADESI,
  MAKINE_MUKEMMEL_EKI,
  MAKINE_SUSLEME_FIYATI,
  MUTFAK_FIYATI,
  MUTFAK_GERI_FIYATI,
  PARCA_BILGI,
  PARCA_TIPLERI,
  PISME_SURESI,
  WAFFLE_FIYATI,
  WAFFLE_SUSLEMELERI,
  YARDIMCI_FIYATI,
  YEVMIYE,
  adayUret,
  parcaYerleri,
  pismeBul,
  yardimciSuresi,
  type Istasyon,
  type MakineSiparisi,
  type ParcaTipi,
  type Pisme,
  type TezgahParcasi,
  type Icecek,
  type WaffleSusleme,
  type Yardimci,
} from './makine';
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
  esyaKatmani,
  YON_ADIMI,
  type Katman,
  type Yon,
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
  KIYAFETLER,
  SAC_MODELLERI,
  SAC_RENKLERI,
  TENLER,
  VARSAYILAN_CALISAN,
  type Aksesuar,
  type CalisanGorunumu,
} from './calisan';
import { DENEME_KAYDI } from './denemeDukkani';
import { AYAR } from './ayarlar';
import { BOS_YETENEKLER, EN_COK_BASAMAK, basamakBedeli, harcananPuan, kazanilanPuan, yetenekEtkisi, yetenekleriOku, type Yetenek, type Yetenekler } from './yetenek';
import { BOS_EXP, acilanKilitler, araziSeviyesi, gerekenSeviye, seviye, yardimciSeviyesi, type Expler, type SeviyeTuru } from './seviye';
// Geliştirme jetonu (belge 0.8): oyun yayınlanana kadar her açılışta para
// en az bu kadar olur. Yayından önce 0 yapılır.
export const GELISTIRME_JETONU = AYAR.para.gelistirmeJetonu;

// Oyunun durumu: kepçe mini oyunu (belge bölüm 3: altlık → kepçe →
// yerleştir → servis) ve müşteri sırası (iş sırası 3).
// Oyuncunun yaptığı her şey buradan geçer; ekran ve 3B sahne buradan okur.

export type Altlik = 'kulah' | 'kap' | 'kup';
// Kup parayla açılır (belge 3: "külah, kap ya da kup"; belge 4: tarif ağacı)
export const KUP_FIYATI = AYAR.para.kupFiyati;
export const KUP_EKI = AYAR.para.kupEki; // kuplu siparişe ek para
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
export const SUSLEME_FIYATI = AYAR.para.suslemeFiyati;

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

export const TEPSI_FIYATI = AYAR.para.tepsiFiyati;

export interface Musteri {
  id: number;
  gorunum: number; // musteriGorunumleri sırası
  siparis: Siparis;
  hal: 'sirada' | 'gidiyor';
  mutlu: boolean;
  gelisTarafi: 1 | -1; // iskelenin hangi ucundan geldi (1 = sağ, -1 = sol)
  gidisTarafi: 1 | -1;
  // Belge 0.5: dondurma ana sıradan; waffle ve içecek ikinci servis noktasından
  urun: Istasyon;
  makine: MakineSiparisi;
  vardi: boolean; // sıradaki yerine (tezgaha) vardı
}

export type Bildirim =
  | { tur: 'top'; sonuc: Sonuc; zaman: number }
  | { tur: 'para'; miktar: number; bahsis: number; zaman: number }
  | { tur: 'yanlis'; zaman: number }
  | { tur: 'sikildi'; zaman: number }
  | { tur: 'ikiDondurma'; zaman: number }
  | { tur: 'pisme'; pisme: Pisme; zaman: number }
  | { tur: 'susleme'; eksik: Susleme[]; fazla: Susleme[]; zaman: number };

// Haber şeridinde geçen bir haber: metin anahtarı ve içine konan değerler
export interface Haber {
  anahtar: string;
  degerler?: Record<string, string | number>;
  zaman: number;
}
const EN_COK_HABER = 5;

export interface Durum {
  // Haber şeridi (belge 0.8): son haberler, en yenisi başta; kaydedilmez
  haberler: Haber[];
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
  // Dükkânın görünüşü (C paketi, belge 0.11) ve satın almadan önce denenen (kaydedilmez)
  gorunus: Gorunus;
  acikGorunusler: string[];
  gorunusDenemesi: Partial<Gorunus>;
  tabelalar: Tabela[]; // takılı tabelalar (C3)
  tabelaDenemesi: Tabela | null; // alınmadan denenen (kaydedilmez)
  // Eğitim (Kemal, 14 Ekim): görülen el işaretleri (kayıtta saklanır)
  egitimGoruldu: EgitimAdi[];
  // Deneyim (belge 0.12, 8. adım): birikmiş exp; seviyeler bundan hesaplanır
  exp: Expler;
  // Çalışanın yetenekleri (8b): alınmış basamaklar
  yetenekler: Yetenekler;
  // Bugün olanlar (seviye, ödül, açılan kilit): gün sonu kartında "YENİ!"
  gunYenilikleri: Yenilik[];
  // Gün içinde seviye atlayınca üstte kısa parlama
  seviyeParlama: { seviye: number; zaman: number } | null;
  // Albüm (belge 0.12): dükkânın kendiliğinden çekilen fotoğrafı en son hangi
  // ay (30 günlük) çekildi; -1 = hiç
  albumAyi: number;
  // Duraklatma menüsü (Kemal, 13 Ekim): saat ve müşteriler durur
  duraklatildi: boolean;
  gezme: boolean; // duraklatıp dükkânı gezme (döndürme, yakınlaştırma, fotoğraf)
  mukemmelSeri: number; // arka arkaya bütün topları MÜKEMMEL servis (bahşiş için)
  acilis: boolean; // açılış ekranı (logo, Oyna, Ayarlar) gösteriliyor
  // ---- Belge 0.5: istasyonlar, makineler, parçalar, mutfak, yardımcılar ----
  istasyon: Istasyon; // oyuncunun bugünkü istasyonu
  istasyonSecimi: boolean; // güne başlarken istasyon seçim ekranı açık
  tezgahParcalari: TezgahParcasi[];
  sahipParcalar: ParcaTipi[]; // bir kez alınmış parçalar (çıkarıp yeniden eklemek bedava)
  mutfakParseller: string[];
  yardimcilar: Yardimci[];
  adaylar: Yardimci[]; // işe alma ekranındaki adaylar (kaydedilmez)
  yardimciIsleri: Record<number, { musteri: number; bitis: number }>; // yardımcı → elindeki sipariş (oyun dakikası)
  makine: MakineDurumu;
  makineFiyatlari: { waffle: number; icecek: number }; // oyuncunun koyduğu fiyat
}

// Waffle yapımı (belge 0.5) ve içecek standı (0.6)
export type MakineAsamasi = 'bos' | 'dokuluyor' | 'pisiyor' | 'acildi' | 'servis';
export interface MakineDurumu {
  asama: MakineAsamasi;
  basladi: number; // basılı tutma / pişme başlangıcı (ms)
  sonuc: Sonuc | null; // hamur ya da bardak dolumu
  pisme: Pisme | null;
  susleme: WaffleSusleme[];
  icecekler: Icecek[]; // içecek standında dolaptan alınanlar
}
function bosMakine(): MakineDurumu {
  return { asama: 'bos', basladi: 0, sonuc: null, pisme: null, susleme: [], icecekler: [] };
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

export type Yenilik =
  | { tur: 'seviye'; seviyeTuru: SeviyeTuru; seviye: number }
  | { tur: 'jeton'; miktar: number }
  | { tur: 'hediye'; esya: Esya }
  | { tur: 'kilit'; anahtar: string };

export interface GunlukOzet {
  musteri: number;
  kazanc: number;
  mukemmel: number;
  bahsis: number;
  puanlar: number[];
  yevmiye: number;
}

function bosOzet(): GunlukOzet {
  return { musteri: 0, kazanc: 0, mukemmel: 0, bahsis: 0, puanlar: [], yevmiye: 0 };
}

// Gösterge ayarları
export const MUKEMMEL_ALT = AYAR.kepce.mukemmelAlt;
export const MUKEMMEL_UST = AYAR.kepce.mukemmelUst;
export const IYI_PAYI = AYAR.kepce.iyiPayi;
export const DOLUM_SURESI = AYAR.kepce.dolumSuresi; // boştan tama, ms (Kemal: 1500 yavaştı)
export const EN_COK_TOP = AYAR.kepce.enCokTop;

let durum: Durum = {
  asama: 'altlikSec',
  altlik: null,
  toplar: [],
  susleme: [],
  tepsi: [],
  kepceKuvet: null,
  dolumBasladi: 0,
  bildirim: null,
  haberler: [],
  servisDogru: false,
  musteriler: [],
  sonrakiGelis: 0,
  para: GELISTIRME_JETONU,
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
  istasyon: 'dondurma',
  istasyonSecimi: false,
  tezgahParcalari: [],
  sahipParcalar: [],
  mutfakParseller: [],
  yardimcilar: [],
  adaylar: [],
  yardimciIsleri: {},
  makine: bosMakine(),
  makineFiyatlari: { waffle: WAFFLE_FIYATI, icecek: ICECEK_FIYATI },
  insaat: false,
  seciliParsel: null,
  yerlestirme: false,
  seciliEsya: null,
  seciliYon: 0,
  calisan: { ...VARSAYILAN_CALISAN },
  acikOnlukler: ONLUKLER.filter((o) => o.fiyat === 0).map((o) => o.id),
  acikAksesuarlar: [],
  gorunus: { ...BASLANGIC_GORUNUSU },
  acikGorunusler: [...BASLANGIC_ACIK_GORUNUSLER],
  gorunusDenemesi: {},
  tabelalar: [],
  tabelaDenemesi: null,
  egitimGoruldu: [],
  albumAyi: -1,
  exp: { ...BOS_EXP },
  yetenekler: { ...BOS_YETENEKLER },
  gunYenilikleri: [],
  seviyeParlama: null,
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
  const t = ((simdi - durum.dolumBasladi) / dolumSuresi()) % 2;
  return t <= 1 ? t : 2 - t;
}

function sonucBul(dolum: number): Sonuc {
  const { alt, ust } = mukemmelAraligi();
  if (dolum >= alt && dolum <= ust) return 'mukemmel';
  if (dolum >= alt - IYI_PAYI && dolum <= ust + IYI_PAYI) return 'iyi';
  return dolum < alt ? 'kucuk' : 'buyuk';
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
  makineBirak();
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
export const EN_COK_SIRA = AYAR.gun.enCokSira;
export const SERVIS_SIRASI = AYAR.gun.servisSirasi; // ikinci servis noktasının sırası
// Kapalı alan büyüdükçe sıra uzar: başlangıçtaki iki kareden sonra her kare bir kişi (belge 0.2)
export function enCokSira(d: Durum = durum) {
  return EN_COK_SIRA + Math.max(0, d.kapaliParseller.length - DUKKAN_PARSELLERI.length);
}
export const GELIS_ARALIGI: [number, number] = [AYAR.gun.gelisEnAz, AYAR.gun.gelisEnCok]; // ms
export const MUKEMMEL_EKI = AYAR.para.mukemmelEki;
const BAHSIS_SERISI = AYAR.para.bahsisSerisi; // kaçıncı arka arkaya mükemmel serviste bahşiş başlar
const BAHSIS_EN_COK = AYAR.para.bahsisEnCok;
export const IYI_EKI = AYAR.para.iyiEki;
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

export type Kuyruk = 'ana' | 'servis';
export function kuyrugu(urun: Istasyon): Kuyruk {
  return urun === 'dondurma' ? 'ana' : 'servis';
}
export function siradakiler(d: Durum, k: Kuyruk) {
  return d.musteriler.filter((m) => m.hal === 'sirada' && kuyrugu(m.urun) === k);
}

// Oyuncunun baktığı müşteri: kendi istasyonunun sırasında öndeki ve onun ürününü isteyen
export function ondekiMusteri(d: Durum = durum): Musteri | undefined {
  const m = siradakiler(d, kuyrugu(d.istasyon))[0];
  return m && m.urun === d.istasyon ? m : undefined;
}

// ---- İstasyonlar (belge 0.5) ----
// Bir istasyon kurulu mu: dondurma hep; waffle makinesi / içecek standı ve
// ikinci servis noktası tezgahta takılıysa
export function istasyonKurulu(ist: Istasyon, d: Durum = durum) {
  if (ist === 'dondurma') return true;
  const takili = (t: ParcaTipi) => d.tezgahParcalari.some((p) => p.tur === t);
  return takili(ist) && takili('servis');
}

// Bugün açık istasyonlar: oyuncunun ve yardımcılarınki
export function acikIstasyonlar(d: Durum = durum): Istasyon[] {
  const liste = [d.istasyon, ...d.yardimcilar.map((y) => y.istasyon).filter((i): i is Istasyon => i !== null)];
  return ISTASYONLAR.filter((i) => liste.includes(i) && istasyonKurulu(i, d));
}

function rastgeleUrun(): Istasyon {
  const acik = acikIstasyonlar();
  const agirlik = (i: Istasyon) => (i === 'dondurma' ? 3 : 1.5);
  let z = Math.random() * acik.reduce((t, i) => t + agirlik(i), 0);
  for (const i of acik) {
    z -= agirlik(i);
    if (z <= 0) return i;
  }
  return acik[0] ?? 'dondurma';
}

// Waffle: 0–3 süsleme, gruplardan serbestçe (belge 0.6); içecek: 1–3 kutu, aynısı olabilir
function rastgeleMakineSiparisi(): MakineSiparisi {
  const z = Math.random();
  const kac = z < 0.2 ? 0 : z < 0.6 ? 1 : z < 0.9 ? 2 : 3;
  const karisik = [...WAFFLE_SUSLEMELERI].sort(() => Math.random() - 0.5);
  const y = Math.random();
  const icecekSayisi = Math.min(EN_COK_ICECEK, y < 0.65 ? 1 : y < 0.95 ? 2 : 3);
  return {
    susleme: karisik.slice(0, kac),
    icecekler: Array.from({ length: icecekSayisi }, () => ICECEKLER[Math.floor(Math.random() * ICECEKLER.length)]),
  };
}

// Oyun döngüsü bunu yarım saniyede bir çağırır: sıra boşsa müşteri gelir.
export function musteriDongusu(simdi: number) {
  const siradaki = durum.musteriler.filter((m) => m.hal === 'sirada').length;
  if (!durum.acik || durum.gunSonu || durum.hazirlik || durum.duraklatildi) return; // kapanınca, gün başlamadan ve duraklatınca müşteri gelmez
  if (simdi < durum.sonrakiGelis) return;
  // Ürün: açık istasyonlardan biri; her sıranın kendi sınırı var
  const egitimde = ilkSiparisEgitimi();
  const urun: Istasyon = egitimde ? 'dondurma' : rastgeleUrun();
  const sinir = kuyrugu(urun) === 'ana' ? enCokSira() : SERVIS_SIRASI;
  if (siradakiler(durum, kuyrugu(urun)).length >= sinir) {
    guncelle({ sonrakiGelis: simdi + 1500 });
    return;
  }
  // İlk sipariş eğitimi: yalnız bir müşteri gelir, siparişi tek toplu külah
  const egitim = egitimde;
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
        urun,
        makine: rastgeleMakineSiparisi(),
        vardi: false,
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
    const bahsis = bahsisHesapla(seri);
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
      haberler: bahsis > 0 ? [{ anahtar: 'haber.bahsis', degerler: { miktar: bahsis, seri }, zaman: simdi }, ...durum.haberler].slice(0, EN_COK_HABER) : durum.haberler,
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
        ...durum.gunluk,
        musteri: durum.gunluk.musteri + 1,
        kazanc: durum.gunluk.kazanc + miktar,
        mukemmel: durum.gunluk.mukemmel + butunToplar.filter((t) => t.sonuc === 'mukemmel').length,
        bahsis: durum.gunluk.bahsis + bahsis,
        puanlar: [...durum.gunluk.puanlar, puan],
      },
      musteriler: durum.musteriler.map((m) => (m.id === id ? { ...m, hal: 'gidiyor', mutlu: true } : m)),
      egitimGoruldu: egitimEkle('ilkSiparis'),
    });
    // Exp (8. adım): el işi çalışana, para ve yıldız dükkâna
    const mukemmelSayisi = butunToplar.filter((t) => t.sonuc === 'mukemmel').length;
    expEkle(AYAR.exp.calisanServis + mukemmelSayisi * AYAR.exp.calisanMukemmel, dukkanExpi(miktar, puan));
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
// 2 dakika sürsün diye (Kemal, 13 Ekim) her adım 0,77 saniye. 1. gün pazartesi (Kemal, 13 Ekim).
const ADIM = 5; // saat kaçar dakika ilerler

export function haftaGunu(d: Durum = durum) {
  return (d.gun - 1) % 7; // 0 = pazartesi … 6 = pazar
}

export function haftaSonuMu(d: Durum = durum) {
  return haftaGunu(d) >= 5;
}

// O günün açılış ve kapanışı (gece yarısından sonrası 24+ olarak)
export function calismaSaatleri(d: Durum = durum) {
  const g = AYAR.gun;
  return haftaSonuMu(d)
    ? { acilis: g.haftaSonuAcilis * 60, kapanis: g.haftaSonuKapanis * 60 }
    : { acilis: g.haftaIciAcilis * 60, kapanis: g.haftaIciKapanis * 60 };
}

// Bir adımın (5 oyun dakikası) gerçek süresi: hafta içi 156 adım × 0,77 sn ≈ 2 dk,
// hafta sonu 192 adım ≈ 2,5 dk
const ADIM_MS = AYAR.gun.adimMs;

function gunUzunlugu(d: Durum = durum) {
  const { acilis, kapanis } = calismaSaatleri(d);
  return kapanis - acilis;
}

let birikenMs = 0;

// Oyun döngüsü her turda geçen süreyi verir.
export function zamanIlerlet(gecenMs: number) {
  if (durum.gunSonu || durum.hazirlik || durum.duraklatildi) return;
  yardimciDongusu();
  // İlk sipariş eğitiminde müşteri gelince saat (ve sabır) durur
  if (ilkSiparisEgitimi() && durum.musteriler.some((m) => m.hal === 'sirada')) return;
  if (durum.acik) {
    birikenMs += Math.min(gecenMs, 1000); // sekme arkadayken gün akıp gitmesin
    const adim = Math.floor(birikenMs / ADIM_MS);
    if (adim > 0) {
      birikenMs -= adim * ADIM_MS;
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
  if (!bekleyen && durum.asama === 'altlikSec') {
    // Yardımcıların yevmiyesi (belge 0.5): para 0'ın altına inmez, ceza yok
    const yevmiye = Math.min(durum.para, durum.yardimcilar.length * YEVMIYE);
    guncelle({ gunSonu: true, para: durum.para - yevmiye, gunluk: { ...durum.gunluk, yevmiye } });
    kaydet();
  }
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
    gunYenilikleri: [],
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

// Güne başla: makine istasyonu ya da yardımcı varsa önce istasyon seçilir (belge 0.5)
export function guneBasla() {
  if (!durum.hazirlik) return;
  const secimGerek = ISTASYONLAR.some((i) => i !== 'dondurma' && istasyonKurulu(i)) || durum.yardimcilar.length > 0;
  if (secimGerek && !durum.istasyonSecimi) {
    istasyonSec(istasyonKurulu(durum.istasyon) ? durum.istasyon : 'dondurma');
    guncelle({ istasyonSecimi: true });
    return;
  }
  gunuBaslat();
}

export function haberVer(anahtar: string, degerler?: Haber['degerler']) {
  guncelle({ haberler: [{ anahtar, degerler, zaman: performance.now() }, ...durum.haberler].slice(0, EN_COK_HABER) });
}

function gunuBaslat() {
  haberVer('haber.gunBasladi', { gun: durum.gun });
  birikenMs = 0;
  guncelle({ istasyonSecimi: false, makine: bosMakine(), yardimciIsleri: {} });
  guncelle({ hazirlik: false, sonrakiGelis: 0, yerlestirme: false, seciliEsya: null });
  kaydet();
}

// ---- Kamera (iş sırası 5) ----
// Sipariş gelince (öndeki müşteri tezgaha varınca) kamera tezgaha geçer;
// sıra boşalınca dükkânın genel görünümüne döner. Oyuncu düğmeyle de geçer.
export function kameraSec(kamera: Kamera) {
  if (durum.kamera !== kamera) guncelle({ kamera });
}

// Müşteri sıradaki yerine (tezgaha) varınca sahne bunu çağırır. Yardımcılar
// yalnız varmış müşteriye servis eder.
export function musteriVardi(id: number) {
  const m = durum.musteriler.find((x) => x.id === id);
  if (!m || m.vardi) return;
  guncelle({ musteriler: durum.musteriler.map((x) => (x.id === id ? { ...x, vardi: true } : x)) });
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
export const SABIR_DAKIKA = AYAR.gun.sabirDakika; // Kemal, 13 Ekim: gerçekte ~12 sn kalsın (saat hızlanınca 60'tan 80'e)

export function sabirOrani(d: Durum = durum) {
  if (d.sabirMusteri === null || ondekiMusteri(d)?.id !== d.sabirMusteri) return null;
  // Sohbet yeteneği sabrı uzatır (8b)
  return Math.max(0, 1 - (d.dakika - d.sabirBasi) / (SABIR_DAKIKA * (1 + yetenekEtkisi('sohbet', d.yetenekler.sohbet))));
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
  haberVer('haber.sikildi');
  window.setTimeout(() => {
    if (!ondekiMusteri()) kameraSec('dukkan');
  }, 1600);
}

// ---- İlerleme (belge 2.4 ve 4) ----
// Hepsi geçici sayılar; Kemal'in onayını bekliyor (belge 7.4).
export const FIYAT_ETKISI: Record<FiyatSeviyesi, { fiyat: number; gelis: number; memnuniyet: number }> = {
  ucuz: { fiyat: AYAR.cekicilik.ucuzFiyat, gelis: AYAR.cekicilik.ucuzGelis, memnuniyet: AYAR.cekicilik.ucuzMemnuniyet },
  normal: { fiyat: AYAR.cekicilik.normalFiyat, gelis: AYAR.cekicilik.normalGelis, memnuniyet: AYAR.cekicilik.normalMemnuniyet },
  pahali: { fiyat: AYAR.cekicilik.pahaliFiyat, gelis: AYAR.cekicilik.pahaliGelis, memnuniyet: AYAR.cekicilik.pahaliMemnuniyet },
};

// Her yerleştirilmiş eşya ve her ışık seviyesi müşteri aralığını kısaltır (en çok %50)
const ESYA_ETKISI = AYAR.cekicilik.esyaEtkisi;
const ISIK_ETKISI = AYAR.cekicilik.isikEtkisi;

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
const HAFTA_SONU_CARPANI = AYAR.gun.haftaSonuCarpani;

function gelisCarpani() {
  const haftaSonu = haftaSonuMu() ? HAFTA_SONU_CARPANI : 1;
  const cekicilik = Math.min(AYAR.cekicilik.cekicilikEnCok, ESYA_ETKISI * durum.yerlesim.length + ISIK_ETKISI * durum.isikSeviyesi);
  // Ana seviye arttıkça müşteriler biraz daha sık gelir (8. adım)
  const seviyeEtkisi = Math.min(AYAR.exp.musteriArtisiEnCok, AYAR.exp.musteriArtisi * (seviye('ana', durum.exp.ana) - 1));
  return FIYAT_ETKISI[durum.fiyatSeviyesi].gelis * (1 - cekicilik) * (1 - seviyeEtkisi) * haftaSonu;
}

export function cesitAc(cesit: number) {
  const c = CESITLER[cesit];
  if (!c || durum.acikCesitler.includes(cesit) || durum.para < c.fiyat || !cesitAlinabilir(cesit) || !kilitAcik(`cesit.${c.ad}`)) return;
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
  return VITRIN_BUYUTMELERI.find((x) => x.boy > d.vitrinBoyu) ?? null;
}

export function vitrinBuyut() {
  const b = sonrakiVitrin();
  if (!b || durum.para < b.fiyat || !kilitAcik(`vitrin.${b.boy}`)) return;
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
  if (!sonraki || durum.isikSeviyesi >= EN_YUKSEK_ISIK || durum.para < sonraki.fiyat || !kilitAcik(`isik.${sonraki.seviye}`)) return;
  guncelle({ para: durum.para - sonraki.fiyat, isikSeviyesi: durum.isikSeviyesi + 1 });
  kaydet();
}

export function esyaAl(esya: Esya) {
  const e = ESYALAR.find((x) => x.id === esya);
  if (!e || durum.para < e.fiyat || !kilitAcik(`esya.${esya}`)) return;
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
  if (durum.para < fiyat || araziKilidi() !== null) return;
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
  // Mutfağa eşya konmaz (belge 0.5)
  if (d.mutfakParseller.includes(birimParseli(c, r))) return true;
  const { govde } = tezgahHepBirimleri(d.tezgah, d.tezgahParcalari);
  if (govde.some((b) => b.c === c && b.r === r)) return true;
  // İkinci servis noktasının önündeki sıra
  const servis = parcaYerleri(d.tezgah, d.tezgahParcalari).find((p) => p.tur === 'servis');
  if (servis && r === d.tezgah.r - 1 && c >= servis.c && c < servis.c + servis.en) return true;
  return siraBirimiMi(d.tezgah, c, r);
}

export function birimDolu(c: number, r: number, d: Durum = durum, haric?: Yerlesim, katman: Katman = 'esya') {
  return d.yerlesim.some((y) => {
    if (y === haric || esyaKatmani(y.esya) !== katman) return false;
    const k = birimCoz(y.hucre);
    return kapladigiBirimler(y.esya, k.c, k.r, y.yon).some((b) => b.c === c && b.r === r);
  });
}

// Eşya bu köşe birimden başlayarak sığar mı: hepsi alınmış arazide, boş,
// engelsiz; hepsi içeride ya da hepsi dışarıda; dışarıya özel eşya içeri konmaz
export function esyaSigar(esya: Esya, c: number, r: number, yon: number, d: Durum = durum, haric?: Yerlesim) {
  const birimler = kapladigiBirimler(esya, c, r, yon);
  const ic = birimIcMi(birimler[0].c, birimler[0].r, d);
  const tanim = ESYALAR.find((e) => e.id === esya);
  if (ic && tanim?.disari) return false;
  if (!ic && tanim?.iceri) return false;
  const katman = esyaKatmani(esya);
  // Tablo yalnız düz duvarın dibindeki kareye konur (o duvara asılır)
  if (katman === 'duvar' && !birimDuvarlari(c, r, d).length) return false;
  return birimler.every(
    (b) => birimSahipli(b.c, b.r, d) && !birimEngelliKatman(b.c, b.r, katman, d) && !birimDolu(b.c, b.r, d, haric, katman) && birimIcMi(b.c, b.r, d) === ic,
  );
}

// Tablo yerde yer kaplamaz: tezgahın, sıranın, kapı yolunun arkasındaki duvara da
// asılır; yalnız mutfağa konmaz
export function birimEngelliKatman(c: number, r: number, katman: Katman, d: Durum = durum) {
  if (katman === 'duvar') return d.mutfakParseller.includes(birimParseli(c, r));
  return birimEngelli(c, r, d);
}

// İçerideki bir karenin dibindeki düz duvarlar (pencere ve kapı değil; C4 tablolar)
export function birimDuvarlari(c: number, r: number, d: Durum = durum): Kenar[] {
  if (!birimIcMi(c, r, d)) return [];
  const liste: Kenar[] = [];
  for (const y of ['k', 'b', 'd', 'g'] as Yon[]) {
    const [dc, dr] = YON_ADIMI[y];
    if (birimIcMi(c + dc, r + dr, d)) continue;
    const k: Kenar = { c, r, y };
    if (parcaTuru(k, d.duvarParcalari) === 'duvar') liste.push(k);
  }
  return liste;
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

// Bir noktadaki konmuş eşya. Halı ya da tablo seçiliyken yalnız aynı
// katmandakiler; değilse önce tablo ve eşyalar, halı en son (altta kalır).
export function noktadakiEsya(x: number, z: number, d: Durum = durum) {
  const { c, r } = noktaninBirimi(x, z);
  const oradakiler = d.yerlesim.filter((y) => {
    const k = birimCoz(y.hucre);
    return kapladigiBirimler(y.esya, k.c, k.r, y.yon).some((b) => b.c === c && b.r === r);
  });
  return oradakiler.find((y) => esyaKatmani(y.esya) === dokunmaKatmani(d)) ?? (d.seciliEsya ? undefined : oradakiler.find((y) => esyaKatmani(y.esya) !== 'zemin') ?? oradakiler[0]);
}

// Yerleştirirken dokunulunca hangi katmandaki eşya kalkar
export function dokunmaKatmani(d: Durum = durum): Katman | null {
  return d.seciliEsya ? esyaKatmani(d.seciliEsya) : null;
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

// Yürüyüş yolunun yanındaki ön teras sırası: duvar örülmez (Kemal, 14 Ekim:
// "teras duvarsız olarak kalmalı, yaz kış")
export function terasMi(anahtar: string) {
  return parselCoz(anahtar).j === SATIR_EN_AZ;
}

// Duvar örülebilir mi: kare oyuncunun, açık ve kapalı alana komşu, ön terasta değil
export function duvarOrulebilir(anahtar: string, d: Durum = durum) {
  if (!d.parseller.includes(anahtar) || d.kapaliParseller.includes(anahtar)) return false;
  if (terasMi(anahtar)) return false; // ön teras yaz kış duvarsız kalır (Kemal, 14 Ekim)
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
export function tezgahUygun(t: TezgahYeri, d: Durum = durum, parcalar: TezgahParcasi[] = d.tezgahParcalari) {
  if (t.boy < TEZGAH_EN_KISA || t.boy > TEZGAH_EN_UZUN) return false;
  const { govde, sira } = tezgahHepBirimleri(t, parcalar);
  const kapiIci = dukkanKapilari(d);
  if (govde.some((b) => kapiIci.some((k) => k.c === b.c && k.r === b.r))) return false;
  // Kapalı alanın içinde, mutfağın dışında (belge 0.5)
  return [...govde, ...sira].every((b) => birimIcMi(b.c, b.r, d) && !d.mutfakParseller.includes(birimParseli(b.c, b.r)));
}

// Yeni yerin altında kalan eşyalar depoya döner
function tezgahiKoy(t: TezgahYeri, ek: Partial<Durum> = {}) {
  const sonra = { ...durum, ...ek, tezgah: t };
  const kalan: Yerlesim[] = [];
  const depo = { ...durum.depo };
  for (const y of durum.yerlesim) {
    const k = birimCoz(y.hucre);
    if (kapladigiBirimler(y.esya, k.c, k.r, y.yon).some((b) => birimEngelliKatman(b.c, b.r, esyaKatmani(y.esya), sonra))) depo[y.esya] = (depo[y.esya] ?? 0) + 1;
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

// ======== Belge 0.5: istasyonlar, makineler, parçalar, mutfak, yardımcılar ========

// ---- İstasyon seçimi (güne başlarken) ----
// Oyuncu bir istasyon seçer; yardımcılar boş kalan kurulu istasyonlara,
// önce iyi oldukları yere dağılır. Ekranda yardımcıya dokununca yeri değişir.
export function istasyonSec(ist: Istasyon) {
  if (!istasyonKurulu(ist)) return;
  const bos = ISTASYONLAR.filter((i) => i !== ist && istasyonKurulu(i));
  const yardimcilar = durum.yardimcilar.map((y) => ({ ...y, istasyon: null as Istasyon | null }));
  // Önce yeteneğine uyan, sonra kalan
  for (const tur of [true, false])
    for (const y of yardimcilar) {
      if (y.istasyon) continue;
      const yer = bos.find((i) => !yardimcilar.some((z) => z.istasyon === i) && (!tur || i === y.yetenek));
      if (yer) y.istasyon = yer;
    }
  guncelle({ istasyon: ist, yardimcilar });
}

// Yardımcıya dokununca sıradaki boş istasyona geçer (ya da dinlenir)
export function yardimciYeriniDegistir(id: number) {
  const y = durum.yardimcilar.find((x) => x.id === id);
  if (!y) return;
  const secenekler: (Istasyon | null)[] = [
    ...ISTASYONLAR.filter((i) => istasyonKurulu(i) && i !== durum.istasyon && !durum.yardimcilar.some((z) => z.id !== id && z.istasyon === i)),
    null,
  ];
  const sonraki = secenekler[(secenekler.indexOf(y.istasyon) + 1) % secenekler.length] ?? null;
  guncelle({ yardimcilar: durum.yardimcilar.map((x) => (x.id === id ? { ...x, istasyon: sonraki } : x)) });
}

export function istasyonlaBasla() {
  if (!durum.istasyonSecimi) return;
  gunuBaslat();
}

export function istasyonSeciminiKapat() {
  guncelle({ istasyonSecimi: false });
}

// ---- Waffle (belge 0.5) ve içecek standı (0.6) ----
export function makineDolumu(simdi: number, d: Durum = durum) {
  if (d.makine.asama !== 'dokuluyor') return 0;
  const t = ((simdi - d.makine.basladi) / dolumSuresi(d)) % 2;
  return t <= 1 ? t : 2 - t;
}
export function pismeOrani(simdi: number, d: Durum = durum) {
  if (d.makine.asama !== 'pisiyor') return 0;
  return Math.min(1.15, (simdi - d.makine.basladi) / (PISME_SURESI * (1 - yetenekEtkisi('hizliEller', d.yetenekler.hizliEller))));
}

function makineGuncelle(m: Partial<MakineDurumu>) {
  guncelle({ makine: { ...durum.makine, ...m } });
}

// Ana düğme basılı tutulunca hamur dökülür
export function makineBas() {
  if (durum.kamera !== 'tezgah' || !ondekiMusteri()) return;
  if (durum.istasyon === 'waffle' && durum.makine.asama === 'bos') {
    islemYapildi();
    makineGuncelle({ asama: 'dokuluyor', basladi: performance.now() });
  }
}

export function makineBirak() {
  if (durum.makine.asama !== 'dokuluyor') return;
  islemYapildi();
  const sonuc = sonucBul(makineDolumu(performance.now()));
  // Hamur dökülünce kapak kapanır, pişme başlar
  makineGuncelle({ asama: 'pisiyor', sonuc, basladi: performance.now() });
  guncelle({ bildirim: { tur: 'top', sonuc, zaman: performance.now() } });
}

// İçecek standı: dolaptan bir içecek al (en çok 3; aynısı birden çok olabilir)
export function icecekAl(i: Icecek) {
  if (durum.istasyon !== 'icecek' || durum.makine.asama === 'servis' || !ondekiMusteri()) return;
  if (durum.makine.icecekler.length >= EN_COK_ICECEK) return;
  islemYapildi();
  makineGuncelle({ icecekler: [...durum.makine.icecekler, i] });
}

// Waffle makinesinin kapağını aç: altın sarıda açmak en iyisi
export function waffleAc() {
  if (durum.makine.asama !== 'pisiyor') return;
  islemYapildi();
  const pisme = pismeBul(pismeOrani(performance.now()));
  makineGuncelle({ asama: 'acildi', pisme });
  guncelle({ bildirim: { tur: 'pisme', pisme, zaman: performance.now() } });
}

export function waffleSusle(s: WaffleSusleme) {
  if (durum.makine.asama !== 'acildi') return;
  islemYapildi();
  const var_ = durum.makine.susleme.includes(s);
  makineGuncelle({ susleme: var_ ? durum.makine.susleme.filter((x) => x !== s) : [...durum.makine.susleme, s] });
}

// Baştan: yapılanı kenara koy (ceza yok)
export function makineSifirla() {
  if (durum.makine.asama === 'servis') return;
  islemYapildi();
  guncelle({ makine: bosMakine() });
}

export function makineServisHazir(d: Durum = durum) {
  return !!ondekiMusteri(d) && ((d.istasyon === 'waffle' && d.makine.asama === 'acildi') || (d.istasyon === 'icecek' && d.makine.asama === 'bos' && d.makine.icecekler.length > 0));
}

const PISME_PUANI: Record<Pisme, number> = { altin: 5, soluk: 3, yanik: 2 };

// Waffle ve içeceğin fiyatı: oyuncunun koyduğu × genel fiyat seviyesi
export type MakineUrunu = 'waffle' | 'icecek';
export const MAKINE_FIYAT_ARALIGI: Record<MakineUrunu, [number, number]> = {
  waffle: [AYAR.makine.waffleEnAz, AYAR.makine.waffleEnCok],
  icecek: [AYAR.makine.icecekEnAz, AYAR.makine.icecekEnCok],
};
function makineFiyatiGecerli(u: MakineUrunu, f: unknown) {
  const [en, enCok] = MAKINE_FIYAT_ARALIGI[u];
  return typeof f === 'number' && Number.isInteger(f) && f >= en && f <= enCok ? f : null;
}
export function makineSatisFiyati(u: MakineUrunu, d: Durum = durum) {
  return Math.max(1, Math.round(d.makineFiyatlari[u] * FIYAT_ETKISI[d.fiyatSeviyesi].fiyat));
}
export function makineFiyatiSec(u: MakineUrunu, f: number) {
  const g = makineFiyatiGecerli(u, f);
  if (g !== null) guncelle({ makineFiyatlari: { ...durum.makineFiyatlari, [u]: g } });
}

// Makine ürününün fiyatı ve memnuniyeti
function makineSonucu(urun: Istasyon, m: MakineDurumu, istenen: MakineSiparisi) {
  if (urun === 'waffle') {
    const dolumPuani = SONUC_PUANI[m.sonuc ?? 'kucuk'];
    const puan = (dolumPuani + PISME_PUANI[m.pisme ?? 'soluk']) / 2;
    const mukemmel = m.sonuc === 'mukemmel' && m.pisme === 'altin';
    return { puan, miktar: makineSatisFiyati('waffle') + istenen.susleme.length * MAKINE_SUSLEME_FIYATI + (mukemmel ? MAKINE_MUKEMMEL_EKI : 0), mukemmel };
  }
  // İçecek: doğru verildiyse tam memnuniyet; tanesi fiyat
  return { puan: 5, miktar: makineSatisFiyati('icecek') * istenen.icecekler.length, mukemmel: false };
}

// calisanExp: müşteriye oyuncu kendisi servis ettiyse (yardımcının servisinde 0)
function musteriyiUgurla(id: number, miktar: number, puan: number, mukemmel: boolean, ek: Partial<Durum> = {}, calisanExp = 0) {
  guncelle({
    para: durum.para + miktar,
    memnuniyetler: [...durum.memnuniyetler, puan],
    enIyiOrtalama: enIyiOrtalamaHesapla([...durum.memnuniyetler, puan]),
    gunluk: {
      ...durum.gunluk,
      musteri: durum.gunluk.musteri + 1,
      kazanc: durum.gunluk.kazanc + miktar,
      mukemmel: durum.gunluk.mukemmel + (mukemmel ? 1 : 0),
      puanlar: [...durum.gunluk.puanlar, puan],
    },
    musteriler: durum.musteriler.map((m) => (m.id === id ? { ...m, hal: 'gidiyor', mutlu: true } : m)),
    ...ek,
  });
  expEkle(calisanExp, dukkanExpi(miktar, puan));
}

export function makineServisEt() {
  const musteri = ondekiMusteri();
  if (!musteri || !makineServisHazir()) return;
  islemYapildi();
  const simdi = performance.now();
  const m = durum.makine;
  // Süsleme ya da içecekler tutmuyorsa hatırlatılır, ürün kenara gitmez
  const ayni = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();
  const tutuyor = musteri.urun === 'waffle' ? ayni(m.susleme, musteri.makine.susleme) : ayni(m.icecekler, musteri.makine.icecekler);
  if (!tutuyor) {
    guncelle({ bildirim: { tur: 'yanlis', zaman: simdi } });
    return;
  }
  const { puan, miktar, mukemmel } = makineSonucu(musteri.urun, m, musteri.makine);
  const p = Math.max(1, puan - FIYAT_ETKISI[durum.fiyatSeviyesi].memnuniyet);
  musteriyiUgurla(
    musteri.id,
    miktar,
    p,
    mukemmel,
    { makine: { ...m, asama: 'servis' }, bildirim: { tur: 'para', miktar, bahsis: 0, zaman: simdi } },
    AYAR.exp.calisanServis + (musteri.urun === 'waffle' && m.pisme === 'altin' ? AYAR.exp.calisanAltinWaffle : 0),
  );
  window.setTimeout(() => {
    guncelle({ makine: bosMakine() });
    if (!ondekiMusteri()) kameraSec('dukkan');
  }, 1100);
}

// ---- Yardımcıların işi (belge 0.5) ----
// Kendi istasyonunun sırasında öndeki, varmış ve o ürünü isteyen müşteriye
// servis eder; süre oyun dakikasıyla, hızına ve yeteneğine göre.
function yardimciDongusu() {
  let isler = durum.yardimciIsleri;
  let degisti = false;
  for (const y of durum.yardimcilar) {
    if (!y.istasyon || y.istasyon === durum.istasyon || !istasyonKurulu(y.istasyon)) continue;
    const on = siradakiler(durum, kuyrugu(y.istasyon))[0];
    const is = isler[y.id];
    if (is && (!on || on.id !== is.musteri)) {
      // Müşteri gitti (ör. sıkıldı): iş bırakılır
      isler = { ...isler };
      delete isler[y.id];
      degisti = true;
      continue;
    }
    if (!on || on.urun !== y.istasyon || !on.vardi) continue;
    if (!is) {
      isler = { ...isler, [y.id]: { musteri: on.id, bitis: durum.dakika + yardimciSuresi(y, y.istasyon) } };
      degisti = true;
    } else if (durum.dakika >= is.bitis) {
      isler = { ...isler };
      delete isler[y.id];
      degisti = true;
      // Yardımcının işi: puan hızına göre 3,5–4,5; dondurmada bir top fiyatı kadar
      const puan = 3 + y.hiz * 0.5;
      const miktar =
        y.istasyon === 'dondurma'
          ? on.siparis.kuvetler.reduce((t, c) => t + satisFiyati(c), 0) + on.siparis.susleme.length * SUSLEME_FIYATI
          : y.istasyon === 'waffle'
            ? makineSatisFiyati('waffle') + on.makine.susleme.length * MAKINE_SUSLEME_FIYATI
            : makineSatisFiyati('icecek') * on.makine.icecekler.length;
      musteriyiUgurla(on.id, miktar, puan, false, { yardimciIsleri: isler });
    }
  }
  if (degisti) guncelle({ yardimciIsleri: isler });
}

// Yardımcı şu an bir sipariş hazırlıyor mu (sahnede çalışma hareketi için)
export function yardimciCalisiyor(id: number, d: Durum = durum) {
  return !!d.yardimciIsleri[id];
}

// ---- Yardımcı işe alma ----
export function adaylariGetir() {
  guncelle({ adaylar: [0, 1, 2].map((n) => adayUret(Date.now() + n)) });
}
export function yardimciAlinabilir(d: Durum = durum) {
  return d.yardimcilar.length < EN_COK_YARDIMCI && d.para >= YARDIMCI_FIYATI && yardimciKilidi(d) === null;
}
export function yardimciAl(adayId: number, ad: string) {
  const aday = durum.adaylar.find((a) => a.id === adayId);
  const temiz = ad.trim().slice(0, AD_EN_UZUN);
  if (!aday || !temiz || !yardimciAlinabilir()) return;
  guncelle({
    para: durum.para - YARDIMCI_FIYATI,
    yardimcilar: [...durum.yardimcilar, { ...aday, ad: temiz, istasyon: null }],
    adaylar: [],
  });
  kaydet();
}
export function yardimciCikar(id: number) {
  guncelle({ yardimcilar: durum.yardimcilar.filter((y) => y.id !== id) });
  kaydet();
}

// ---- Tezgah parçaları (belge 0.5) ----
// Oyuncunun istasyonunun tezgah bölümüne göre yeri: kamera ve çalışan oraya gider
export function istasyonX(d: Durum = durum) {
  if (d.istasyon === 'dondurma') return 0;
  return parcaYerleri(d.tezgah, d.tezgahParcalari).find((p) => p.tur === d.istasyon)?.x ?? 0;
}

export function parcaTakiliMi(tur: ParcaTipi, d: Durum = durum) {
  return d.tezgahParcalari.some((p) => p.tur === tur);
}

// Tezgah bölümü + parçalarının gövde birimleri ve sıraların birimleri
export function tezgahHepBirimleri(t: TezgahYeri, parcalar: TezgahParcasi[]) {
  const { govde, sira } = tezgahBirimleri(t);
  for (const p of parcaYerleri(t, parcalar))
    for (let a = 0; a < p.en; a++) {
      for (let b = 0; b < TEZGAH_DERINLIGI; b++) govde.push({ c: p.c + a, r: t.r + b });
      if (p.tur === 'servis') sira.push({ c: p.c + a, r: t.r - 1 });
    }
  return { govde, sira };
}

export function parcaEklenebilir(tur: ParcaTipi, yan: 1 | -1, d: Durum = durum) {
  if (parcaTakiliMi(tur, d)) return false;
  // Köşe bir ucun en dışında durur: köşeden sonra o yana parça eklenmez
  if (d.tezgahParcalari.some((p) => p.tur === 'kose' && p.yan === yan)) return false;
  const fiyat = d.sahipParcalar.includes(tur) ? 0 : PARCA_BILGI[tur].fiyat;
  if (d.para < fiyat) return false;
  if (!d.sahipParcalar.includes(tur) && !kilitAcik(`parca.${tur}`, d)) return false;
  return tezgahUygun(d.tezgah, d, [...d.tezgahParcalari, { tur, yan }]);
}

export function parcaEkle(tur: ParcaTipi, yan: 1 | -1) {
  if (!durum.insaat || !parcaEklenebilir(tur, yan)) return;
  const fiyat = durum.sahipParcalar.includes(tur) ? 0 : PARCA_BILGI[tur].fiyat;
  tezgahiKoy(durum.tezgah, {
    para: durum.para - fiyat,
    sahipParcalar: durum.sahipParcalar.includes(tur) ? durum.sahipParcalar : [...durum.sahipParcalar, tur],
    tezgahParcalari: [...durum.tezgahParcalari, { tur, yan }],
  });
}

export function parcaCikar(tur: ParcaTipi) {
  if (!durum.insaat) return;
  tezgahiKoy(durum.tezgah, { tezgahParcalari: durum.tezgahParcalari.filter((p) => p.tur !== tur) });
}

// ---- Mutfak (belge 0.5) ----
export function mutfakMi(anahtar: string, d: Durum = durum) {
  return d.mutfakParseller.includes(anahtar);
}
export function mutfagaKatilabilir(anahtar: string, d: Durum = durum) {
  if (!d.kapaliParseller.includes(anahtar) || mutfakMi(anahtar, d) || parselCoz(anahtar).j < 1) return false;
  // Tezgah bölümü, parçaları ve sıraları mutfağa gelmez
  const sonra: Durum = { ...d, mutfakParseller: [...d.mutfakParseller, anahtar] };
  return tezgahUygun(d.tezgah, sonra);
}
export function mutfagaKat(anahtar: string) {
  if (!durum.insaat || !mutfagaKatilabilir(anahtar) || durum.para < MUTFAK_FIYATI) return;
  yapiyiDegistir({ mutfakParseller: [...durum.mutfakParseller, anahtar] }, MUTFAK_FIYATI);
}
export function mutfaktanCikar(anahtar: string) {
  if (!durum.insaat || !mutfakMi(anahtar) || durum.para < MUTFAK_GERI_FIYATI) return;
  yapiyiDegistir({ mutfakParseller: durum.mutfakParseller.filter((p) => p !== anahtar) }, MUTFAK_GERI_FIYATI);
}

// ---- Kayıt ----
// İlerleme bu tarayıcıda saklanır (para, gün, açılan çeşitler, fiyat,
// dekorasyon). Tarayıcı izin vermezse oyun kayıtsız çalışır.
const KAYIT_ANAHTARI = 'dondurmaci-kizlar-kayit-1';
// Deneme dükkânı (belge 0.8) ayrı yuvada durur; oyuncunun kaydına dokunmaz
const DENEME_ANAHTARI = 'dondurmaci-kizlar-deneme-1';
let kayitAnahtari = KAYIT_ANAHTARI;


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
  tezgahParcalari?: TezgahParcasi[];
  sahipParcalar?: ParcaTipi[];
  mutfakParseller?: string[];
  yardimcilar?: Yardimci[];
  istasyon?: Istasyon;
  makineFiyatlari?: { waffle: number; icecek?: number };
  dekorlar?: string[]; // eski kayıt (13 Ekim öncesi)
  calisan: CalisanGorunumu;
  acikOnlukler: string[];
  acikAksesuarlar: Aksesuar[];
  gorunus?: Gorunus;
  acikGorunusler?: string[];
  tabelalar?: Tabela[];
  egitimGoruldu: EgitimAdi[];
  albumAyi?: number;
  exp?: Partial<Expler>;
  yetenekler?: Partial<Yetenekler>;
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
    tezgahParcalari: durum.tezgahParcalari,
    sahipParcalar: durum.sahipParcalar,
    mutfakParseller: durum.mutfakParseller,
    yardimcilar: durum.yardimcilar,
    istasyon: durum.istasyon,
    makineFiyatlari: durum.makineFiyatlari,
    depo: durum.depo,
    yerlesim: durum.yerlesim,
    calisan: durum.calisan,
    acikOnlukler: durum.acikOnlukler,
    acikAksesuarlar: durum.acikAksesuarlar,
    gorunus: durum.gorunus,
    acikGorunusler: durum.acikGorunusler,
    tabelalar: durum.tabelalar,
    egitimGoruldu: durum.egitimGoruldu,
    albumAyi: durum.albumAyi,
    exp: durum.exp,
    yetenekler: durum.yetenekler,
  };
  try {
    localStorage.setItem(kayitAnahtari, JSON.stringify(k));
  } catch {
    // Kayıt yapılamadı (gizli pencere vb.); oyun devam eder.
  }
}

export function kaydiYukle() {
  try {
    const ham = localStorage.getItem(kayitAnahtari);
    if (!ham) {
      guncelle({ para: Math.max(durum.para, GELISTIRME_JETONU) });
      return;
    }
    const k = JSON.parse(ham) as Partial<Kayit>;
    const acik = Array.isArray(k.acikCesitler) ? k.acikCesitler.filter((i) => CESITLER[i]) : [];
    guncelle({
      para: (typeof k.para === 'number' ? k.para : 0) + eskiParcaIadesi(k),
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
      ...gorunusuKayittanOku(k),
      // 14 Ekim'den önce oynanmış kayıtta eğitim görülmüş sayılır (istenirse mola menüsünden açılır)
      egitimGoruldu: Array.isArray(k.egitimGoruldu)
        ? k.egitimGoruldu.filter((e) => EGITIMLER.includes(e))
        : (k.gun ?? 1) > 1 || (k.memnuniyetler?.length ?? 0) > 0
          ? [...EGITIMLER]
          : [],
      albumAyi: typeof k.albumAyi === 'number' ? k.albumAyi : -1,
      // Exp (8. adım): eski kayıtlar 1. seviyeden başlar (Kemal, 15 Ekim)
      exp: expOku(k.exp),
      yetenekler: yetenekleriOku(k.yetenekler),
    });
    // Eski parçaların parası geri verildiyse hemen kaydedilir (bir kez verilsin)
    if (eskiParcaIadesi(k) > 0) kaydet();
    if (durum.para < GELISTIRME_JETONU) guncelle({ para: GELISTIRME_JETONU });
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

// 0.5'ten kalan kayıtlar (belge 0.6): ikinci vitrin ve 12'den büyük vitrin
// büyütmelerinin parası geri verilir
function eskiParcaIadesi(k: Partial<Kayit>) {
  const parcalar = [...(Array.isArray(k.sahipParcalar) ? k.sahipParcalar : []), ...(Array.isArray(k.tezgahParcalari) ? k.tezgahParcalari.map((p) => p?.tur) : [])] as string[];
  let iade = parcalar.includes('vitrin2') ? IKINCI_VITRIN_IADESI : 0;
  if (typeof k.vitrinBoyu === 'number') for (const b of ESKI_VITRIN_BUYUTMELERI) if (b.boy <= k.vitrinBoyu) iade += b.fiyat;
  return iade;
}
// Eski adlar: limonata sebili → içecek standı
function eskiAd<T extends string>(x: T): T {
  return (x === ('limonata' as T) ? 'icecek' : x) as T;
}

function vitriniOku(k: Partial<Kayit>, acik: number[]) {
  // İkinci vitrin kaldırıldı (belge 0.6): en çok 12
  const vitrinBoyu =
    typeof k.vitrinBoyu === 'number' && k.vitrinBoyu > EN_BUYUK_VITRIN
      ? EN_BUYUK_VITRIN
      : vitrinBoyuGecerli(k.vitrinBoyu)
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
  // Ön terastaki kapalı kareler açılır (teras duvarsız kalır); kapılar geri kayar
  let kapali = [...DUKKAN_PARSELLERI];
  let kayitliKapali = kapali;
  if (Array.isArray(k.kapaliParseller)) {
    const aday = k.kapaliParseller.filter((p): p is string => typeof p === 'string' && parseller.has(p));
    if (DUKKAN_PARSELLERI.every((p) => aday.includes(p)) && bagliMi(aday)) kayitliKapali = aday;
    const terassiz = kayitliKapali.filter((p) => !terasMi(p));
    kapali = bagliMi(terassiz) ? terassiz : [...DUKKAN_PARSELLERI];
  }
  const kayitliSinir = new Set(sinirKenarlari(kayitliKapali).map(kenarAnahtari));
  let duvarParcalari: Record<string, ParcaTuru> = { ...BASLANGIC_PARCALARI };
  if (k.duvarParcalari && typeof k.duvarParcalari === 'object') {
    duvarParcalari = {};
    for (const [a, t] of Object.entries(k.duvarParcalari)) if (kayitliSinir.has(a) && ['duvar', 'pencere', 'kapi'].includes(t)) duvarParcalari[a] = t;
    duvarParcalari = parcalariUyarla(kayitliKapali, kapali, duvarParcalari);
  }
  if (kapilar(kapali, duvarParcalari).length === 0) duvarParcalari = { ...duvarParcalari, ...BASLANGIC_PARCALARI };
  // Tezgah bölümü
  const t = k.tezgah;
  const tezgahAlinanBoy = typeof k.tezgahAlinanBoy === 'number' ? Math.min(TEZGAH_EN_UZUN, Math.max(BASLANGIC_TEZGAHI.boy, k.tezgahAlinanBoy)) : BASLANGIC_TEZGAHI.boy;
  // Mutfak (belge 0.5): kapalı alanda, arka sıralarda
  const mutfakParseller = Array.isArray(k.mutfakParseller)
    ? k.mutfakParseller.filter((p): p is string => typeof p === 'string' && kapali.includes(p) && parselCoz(p).j >= 1)
    : [];
  // Tezgah parçaları: bilinen türler, her biri bir kez; alınmış sayılırlar
  const sahipParcalar = Array.isArray(k.sahipParcalar) ? k.sahipParcalar.map(eskiAd).filter((p): p is ParcaTipi => PARCA_TIPLERI.includes(p)) : [];
  const tezgahParcalari: TezgahParcasi[] = [];
  if (Array.isArray(k.tezgahParcalari))
    for (const ham of k.tezgahParcalari) {
      const p = ham && { ...ham, tur: eskiAd(ham.tur) };
      if (p && PARCA_TIPLERI.includes(p.tur) && (p.yan === 1 || p.yan === -1) && !tezgahParcalari.some((x) => x.tur === p.tur)) {
        tezgahParcalari.push({ tur: p.tur, yan: p.yan });
        if (!sahipParcalar.includes(p.tur)) sahipParcalar.push(p.tur);
      }
    }
  const deneme: Durum = { ...durum, parseller: [...parseller], kapaliParseller: kapali, duvarParcalari, mutfakParseller, tezgahParcalari, yerlesim: [] };
  let tezgah: TezgahYeri =
    t && [t.c, t.r, t.boy].every((n) => Number.isInteger(n)) && t.boy <= tezgahAlinanBoy && tezgahUygun(t, deneme) ? { c: t.c, r: t.r, boy: t.boy } : { ...BASLANGIC_TEZGAHI };
  if (!tezgahUygun(tezgah, deneme)) {
    // Parçalar sığmıyorsa çıkarılır (alınmış kalırlar, yeniden eklenebilir)
    deneme.tezgahParcalari = [];
    if (!tezgahUygun(tezgah, deneme)) tezgah = { ...BASLANGIC_TEZGAHI };
  }
  deneme.tezgah = tezgah;
  // Yardımcılar
  const yardimcilar: Yardimci[] = Array.isArray(k.yardimcilar)
    ? k.yardimcilar
        .map((y) => y && { ...y, yetenek: eskiAd(y.yetenek) })
        .filter((y) => y && typeof y.ad === 'string' && ISTASYONLAR.includes(y.yetenek) && [1, 2, 3].includes(y.hiz))
        .slice(0, EN_COK_YARDIMCI)
        .map((y, i) => ({ id: typeof y.id === 'number' ? y.id : i + 1, ad: y.ad.slice(0, AD_EN_UZUN), tohum: Number(y.tohum) || 0, yetenek: y.yetenek, hiz: y.hiz, istasyon: null }))
    : [];
  const kayitliIstasyon = k.istasyon ? eskiAd(k.istasyon) : undefined;
  const istasyon: Istasyon = kayitliIstasyon && ISTASYONLAR.includes(kayitliIstasyon) && istasyonKurulu(kayitliIstasyon, deneme) ? kayitliIstasyon : 'dondurma';
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
  return {
    isikSeviyesi,
    depo,
    yerlesim: deneme.yerlesim,
    parseller: [...parseller],
    tezgah,
    tezgahAlinanBoy,
    kapaliParseller: kapali,
    duvarParcalari,
    mutfakParseller,
    tezgahParcalari: deneme.tezgahParcalari,
    sahipParcalar,
    yardimcilar,
    istasyon,
    makineFiyatlari: {
      waffle: makineFiyatiGecerli('waffle', k.makineFiyatlari?.waffle) ?? WAFFLE_FIYATI,
      icecek: makineFiyatiGecerli('icecek', k.makineFiyatlari?.icecek) ?? ICECEK_FIYATI,
    },
  };
}

// Baştan başla: kaydı siler, her şeyi ilk güne döndürür.
export function bastanBasla() {
  try {
    localStorage.removeItem(kayitAnahtari);
  } catch {
    // yok sayılır
  }
  durumuSifirla();
}

function durumuSifirla() {
  birikenMs = 0;
  guncelle({
    para: GELISTIRME_JETONU,
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
    istasyon: 'dondurma',
    istasyonSecimi: false,
    tezgahParcalari: [],
    sahipParcalar: [],
    mutfakParseller: [],
    yardimcilar: [],
    adaylar: [],
    yardimciIsleri: {},
    makine: bosMakine(),
    makineFiyatlari: { waffle: WAFFLE_FIYATI, icecek: ICECEK_FIYATI },
    insaat: false,
    seciliParsel: null,
    yerlestirme: false,
    seciliEsya: null,
    seciliYon: 0,
    calisan: { ...VARSAYILAN_CALISAN },
    acikOnlukler: ONLUKLER.filter((o) => o.fiyat === 0).map((o) => o.id),
    acikAksesuarlar: [],
    gorunus: { ...BASLANGIC_GORUNUSU },
    acikGorunusler: [...BASLANGIC_ACIK_GORUNUSLER],
    gorunusDenemesi: {},
  tabelalar: [],
  tabelaDenemesi: null,
    egitimGoruldu: [],
    albumAyi: -1,
    exp: { ...BOS_EXP },
    yetenekler: { ...BOS_YETENEKLER },
    gunYenilikleri: [],
    seviyeParlama: null,
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

// Açılış ekranı (belge 0.8): Yeni oyun / Devam et / Deneme dükkânı
export function kayitVar() {
  try {
    return localStorage.getItem(KAYIT_ANAHTARI) !== null;
  } catch {
    return false;
  }
}
export function kayittanDevamEt() {
  kayitAnahtari = KAYIT_ANAHTARI;
  durumuSifirla();
  kaydiYukle();
  acilisiKapat();
}
export function yeniOyun() {
  kayitAnahtari = KAYIT_ANAHTARI;
  bastanBasla();
  acilisiKapat();
}
// Deneme dükkânı her açılışta hazır kayıttan baştan kurulur
export function denemeDukkani() {
  kayitAnahtari = DENEME_ANAHTARI;
  durumuSifirla();
  try {
    localStorage.setItem(DENEME_ANAHTARI, JSON.stringify(DENEME_KAYDI));
  } catch {
    // Tarayıcı izin vermezse deneme dükkânı açılmaz; oyun ilk günle sürer
  }
  kaydiYukle();
  haberVer('haber.deneme');
  acilisiKapat();
}
export function denemedeMi() {
  return kayitAnahtari === DENEME_ANAHTARI;
}
// Galeride fotoğraflar kayıt yuvasına göre ayrılır (asıl dükkân / deneme)
export function kayitYuvasi() {
  return denemedeMi() ? 'deneme' : 'ana';
}

// ---- Albüm (belge 0.12, 5. adım) ----
// Oyunda bir ay 30 gün. Her ayın ilk günü akşamüstü (18.30'dan sonra) genel
// görünüme dönülünce dükkânın fotoğrafı kendiliğinden çekilir; o akşam
// kaçarsa ayın sonraki ilk fırsatında. Deneme dükkânında çekilmez.
export const AY_GUNU = AYAR.gun.albumAyGunu;
export const ALBUM_SAATI = AYAR.gun.albumSaati;
export function albumAyi(d: Durum = durum) {
  return Math.floor((d.gun - 1) / AY_GUNU);
}
export function albumZamani(d: Durum = durum) {
  if (d.acilis || d.gezme || d.duraklatildi || d.insaat || d.yerlestirme || denemedeMi()) return false;
  if (albumAyi(d) === d.albumAyi) return false;
  const ayinIlkGunu = albumAyi(d) * AY_GUNU + 1;
  return d.gun > ayinIlkGunu || (!d.hazirlik && saatDakikasi(d) / 60 >= ALBUM_SAATI);
}
export function albumCekildi() {
  guncelle({ albumAyi: albumAyi() });
  kaydet();
  haberVer('haber.album');
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

// ---- Çalışan (Kemal, 13 Ekim) ----
export function calisaniDegistir(yeni: Partial<CalisanGorunumu>) {
  const c = { ...durum.calisan, ...yeni };
  if (yeni.ad !== undefined) c.ad = yeni.ad.slice(0, AD_EN_UZUN);
  if (yeni.beden && yeni.beden !== durum.calisan.beden) c.kiyafet = '';
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
      beden: c.beden === 'erkek' ? 'erkek' : 'kadin',
      ten: typeof c.ten === 'number' && TENLER[c.ten] ? c.ten : VARSAYILAN_CALISAN.ten,
      sac: SAC_MODELLERI.includes(c.sac as never) ? (c.sac as CalisanGorunumu['sac']) : VARSAYILAN_CALISAN.sac,
      sacRengi: typeof c.sacRengi === 'number' && SAC_RENKLERI[c.sacRengi] ? c.sacRengi : VARSAYILAN_CALISAN.sacRengi,
      onluk: typeof c.onluk === 'string' && acikOnlukler.includes(c.onluk) ? c.onluk : VARSAYILAN_CALISAN.onluk,
      aksesuarlar: Array.isArray(c.aksesuarlar) ? c.aksesuarlar.filter((x) => acikAksesuarlar.includes(x)) : [],
      kiyafet: typeof c.kiyafet === 'string' && KIYAFETLER[c.beden === 'erkek' ? 'erkek' : 'kadin'].includes(c.kiyafet) ? c.kiyafet : '',
      uniforma: c.uniforma === true,
    },
  };
}

// ---- Dükkânın görünüşü (C paketi, belge 0.11) ----
function gorunusuKayittanOku(
  k: Partial<Kayit>,
): Pick<Durum, 'gorunus' | 'acikGorunusler' | 'gorunusDenemesi' | 'tabelalar' | 'tabelaDenemesi'> {
  const acikGorunusler = acikGorunusleriOku(k.acikGorunusler);
  return {
    acikGorunusler,
    gorunus: gorunusuOku(k.gorunus, acikGorunusler),
    gorunusDenemesi: {},
    tabelalar: tabelalariOku(k.tabelalar, acikGorunusler),
    tabelaDenemesi: null,
  };
}

// ---- Tabelalar (C3) ----
export function tabelaAcikMi(id: Tabela, d: Durum = durum) {
  return d.acikGorunusler.includes(tabelaAnahtari(id));
}
// Sahnede görünen tabelalar: takılılar ve denenen
export function gorunenTabelalar(d: Durum = durum): Tabela[] {
  return d.tabelaDenemesi && !d.tabelalar.includes(d.tabelaDenemesi) ? [...d.tabelalar, d.tabelaDenemesi] : d.tabelalar;
}
// Dokununca: alınmışsa takılır / çıkarılır, alınmamışsa denenir (bir daha dokununca deneme biter)
export function tabelaSec(id: Tabela) {
  if (tabelaAcikMi(id)) {
    const tabelalar = durum.tabelalar.includes(id) ? durum.tabelalar.filter((t) => t !== id) : [...durum.tabelalar, id];
    guncelle({ tabelalar, tabelaDenemesi: null });
    kaydet();
  } else guncelle({ tabelaDenemesi: durum.tabelaDenemesi === id ? null : id });
}
export function tabelaAl(id: Tabela) {
  const t = TABELALAR.find((x) => x.id === id);
  if (!t || tabelaAcikMi(id) || durum.para < t.fiyat || !kilitAcik(`tabela.${id}`)) return;
  guncelle({
    para: durum.para - t.fiyat,
    acikGorunusler: [...durum.acikGorunusler, tabelaAnahtari(id)],
    tabelalar: [...durum.tabelalar, id],
    tabelaDenemesi: null,
  });
  kaydet();
}

// Sahnede görünen: seçili görünüş, üstüne denenen
export function gecerliGorunus(d: Durum = durum): Gorunus {
  return { ...d.gorunus, ...d.gorunusDenemesi };
}

export function gorunusAcikMi(g: GorunusGrubu, id: string, d: Durum = durum) {
  return d.acikGorunusler.includes(gorunusAnahtari(g, id));
}

// Seçeneğe dokununca: açıksa seçilir, değilse dükkân o hâliyle denenir
export function gorunusSec(g: GorunusGrubu, id: string) {
  if (gorunusAcikMi(g, id)) {
    const deneme = { ...durum.gorunusDenemesi };
    delete deneme[g];
    guncelle({ gorunus: { ...durum.gorunus, [g]: id }, gorunusDenemesi: deneme });
    kaydet();
  } else guncelle({ gorunusDenemesi: { ...durum.gorunusDenemesi, [g]: id } });
}

export function gorunusAl(g: GorunusGrubu, id: string) {
  const s = gorunusSecenegi(g, id);
  if (gorunusAcikMi(g, id) || durum.para < s.fiyat || !kilitAcik(`gorunus.${g}.${id}`)) return;
  const deneme = { ...durum.gorunusDenemesi };
  delete deneme[g];
  guncelle({
    para: durum.para - s.fiyat,
    acikGorunusler: [...durum.acikGorunusler, gorunusAnahtari(g, id)],
    gorunus: { ...durum.gorunus, [g]: id },
    gorunusDenemesi: deneme,
  });
  kaydet();
}

// Mağaza kapanınca denenen ama alınmayan her şey eski hâline döner
export function gorunusDenemesiniBitir() {
  if (Object.keys(durum.gorunusDenemesi).length || durum.tabelaDenemesi) guncelle({ gorunusDenemesi: {}, tabelaDenemesi: null });
}

// ---- Deneyim ve seviyeler (belge 0.12, 8. adım) ----
function expOku(ham: unknown): Expler {
  const k = (ham && typeof ham === 'object' ? ham : {}) as Partial<Expler>;
  const sayi = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0);
  return { ana: sayi(k.ana), dukkan: sayi(k.dukkan), calisan: sayi(k.calisan) };
}

export function seviyeler(d: Durum = durum) {
  return { ana: seviye('ana', d.exp.ana), dukkan: seviye('dukkan', d.exp.dukkan), calisan: seviye('calisan', d.exp.calisan) };
}

// Dükkânın exp'i: kazanılan para ve müşterinin yıldızı
function dukkanExpi(miktar: number, puan: number) {
  const e = AYAR.exp;
  const yildiz = puan >= 4.5 ? e.dukkanBesYildiz : puan >= 3.5 ? e.dukkanDortYildiz : 0;
  return miktar / Math.max(1, e.dukkanParaBasina) + yildiz;
}

// Dükkân seviyesi kilidi: anahtarın gerektirdiği seviyeye gelindi mi
export function kilitAcik(anahtar: string, d: Durum = durum) {
  return seviye('dukkan', d.exp.dukkan) >= gerekenSeviye(anahtar);
}
// Arazi ve yardımcı: kilitliyse gereken seviye, açıksa null
export function araziKilidi(d: Durum = durum) {
  const gereken = araziSeviyesi(Math.max(0, d.parseller.length - BASLANGIC_PARSELLERI.length));
  return seviye('dukkan', d.exp.dukkan) >= gereken ? null : gereken;
}
export function yardimciKilidi(d: Durum = durum) {
  const gereken = yardimciSeviyesi(d.yardimcilar.length);
  return seviye('dukkan', d.exp.dukkan) >= gereken ? null : gereken;
}

// Exp ekler; seviye atlanınca ödül verilir, açılanlar "bugünün yenilikleri"ne yazılır
export function expEkle(calisan: number, dukkan: number) {
  if (calisan <= 0 && dukkan <= 0) return;
  const eski = seviyeler();
  const exp = { ana: durum.exp.ana + calisan + dukkan, dukkan: durum.exp.dukkan + dukkan, calisan: durum.exp.calisan + calisan };
  const yeni = { ana: seviye('ana', exp.ana), dukkan: seviye('dukkan', exp.dukkan), calisan: seviye('calisan', exp.calisan) };
  const yenilikler: Yenilik[] = [];
  let para = durum.para;
  let depo = durum.depo;
  for (let s = eski.ana + 1; s <= yeni.ana; s++) {
    const jeton = s * AYAR.exp.odulJetonu;
    para += jeton;
    yenilikler.push({ tur: 'seviye', seviyeTuru: 'ana', seviye: s }, { tur: 'jeton', miktar: jeton });
    // Her birkaç seviyede bir hediye eşya depoya gelir
    if (AYAR.exp.hediyeAraligi > 0 && s % AYAR.exp.hediyeAraligi === 0) {
      const adaylar = ESYALAR.filter((e) => e.fiyat <= AYAR.exp.hediyeEnCokFiyat);
      const hediye = adaylar[(s * 7 + durum.gun) % adaylar.length];
      if (hediye) {
        depo = { ...depo, [hediye.id]: (depo[hediye.id] ?? 0) + 1 };
        yenilikler.push({ tur: 'hediye', esya: hediye.id });
      }
    }
  }
  for (let s = eski.dukkan + 1; s <= yeni.dukkan; s++) yenilikler.push({ tur: 'seviye', seviyeTuru: 'dukkan', seviye: s });
  for (const anahtar of acilanKilitler(eski.dukkan, yeni.dukkan)) yenilikler.push({ tur: 'kilit', anahtar });
  for (let s = eski.calisan + 1; s <= yeni.calisan; s++) yenilikler.push({ tur: 'seviye', seviyeTuru: 'calisan', seviye: s });
  guncelle({
    exp,
    ...(yenilikler.length ? { gunYenilikleri: [...durum.gunYenilikleri, ...yenilikler], para, depo } : {}),
    ...(yeni.ana > eski.ana ? { seviyeParlama: { seviye: yeni.ana, zaman: performance.now() } } : {}),
  });
  if (yeni.ana > eski.ana) haberVer('haber.seviye', { seviye: yeni.ana });
}

// ---- Çalışanın yetenekleri (belge 0.12, 8b) ----
export function yetenekPuani(d: Durum = durum) {
  return kazanilanPuan(seviye('calisan', d.exp.calisan)) - harcananPuan(d.yetenekler);
}
export function yetenekAlinabilir(y: Yetenek, d: Durum = durum) {
  const b = d.yetenekler[y];
  return b < EN_COK_BASAMAK && yetenekPuani(d) >= basamakBedeli(b + 1);
}
export function yetenekAl(y: Yetenek) {
  if (!yetenekAlinabilir(y)) return;
  guncelle({ yetenekler: { ...durum.yetenekler, [y]: durum.yetenekler[y] + 1 } });
  kaydet();
}

// Usta kepçe: MÜKEMMEL aralığı ortası aynı kalarak genişler
export function mukemmelAraligi(d: Durum = durum) {
  const orta = (MUKEMMEL_ALT + MUKEMMEL_UST) / 2;
  const yari = ((MUKEMMEL_UST - MUKEMMEL_ALT) / 2) * (1 + yetenekEtkisi('ustaKepce', d.yetenekler.ustaKepce));
  return { alt: Math.max(0.02, orta - yari), ust: Math.min(0.98, orta + yari) };
}
// Hızlı eller: kepçe ve hamur daha çabuk dolar
export function dolumSuresi(d: Durum = durum) {
  return DOLUM_SURESI * (1 - yetenekEtkisi('hizliEller', d.yetenekler.hizliEller));
}
// Güler yüz: bahşiş artar; belli basamakta bir servis erken başlar
function bahsisHesapla(seri: number) {
  const b = durum.yetenekler.gulerYuz;
  const esik = Math.max(1, BAHSIS_SERISI - (b >= AYAR.yetenek.gulerYuzErkenBasamak ? 1 : 0));
  if (seri < esik) return 0;
  const kat = 1 + yetenekEtkisi('gulerYuz', b);
  return Math.round(Math.min(BAHSIS_EN_COK, (seri - esik + 1) * 2) * kat);
}
