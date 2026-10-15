import { AYAR } from './ayarlar';

// Deneyim (exp) ve seviyeler (belge 0.12, 8. adım; Kemal, 15 Ekim).
// Tek exp havuzu: kazanılan her exp ana seviyeye gider; ayrıca türüne göre
// dükkân ya da çalışan seviyesine. El işi (servis, MÜKEMMEL top, altın sarı
// waffle) çalışana; işletme (para, yıldız, günlük hedef) dükkâna.
// Exp birikimli tutulur; seviye ondan hesaplanır. Sayılar ayar dosyasında.

export type SeviyeTuru = 'ana' | 'dukkan' | 'calisan';
export type Expler = Record<SeviyeTuru, number>;

export const BOS_EXP: Expler = { ana: 0, dukkan: 0, calisan: 0 };

function esikler(tur: SeviyeTuru) {
  const e = AYAR.exp;
  return tur === 'ana' ? { ilk: e.anaIlk, artis: e.anaArtis } : { ilk: e.altIlk, artis: e.altArtis };
}

// n. seviyeden n+1'e geçmek için gereken exp
export function seviyeEsigi(tur: SeviyeTuru, seviye: number) {
  const { ilk, artis } = esikler(tur);
  return Math.max(1, ilk + artis * (seviye - 1));
}

// Birikmiş exp'ten seviye ve o seviyedeki ilerleme
export function seviyeBilgisi(tur: SeviyeTuru, exp: number) {
  let seviye = 1;
  let kalan = Math.max(0, exp);
  // Çok büyük exp'te (deneme dükkânı) döngü uzamasın
  while (seviye < 999) {
    const esik = seviyeEsigi(tur, seviye);
    if (kalan < esik) return { seviye, ilerleme: kalan, esik };
    kalan -= esik;
    seviye++;
  }
  return { seviye, ilerleme: 0, esik: seviyeEsigi(tur, seviye) };
}

export function seviye(tur: SeviyeTuru, exp: number) {
  return seviyeBilgisi(tur, exp).seviye;
}

// Bir seviyeye ulaşmak için gereken toplam exp (deneme dükkânı için)
export function toplamEsik(tur: SeviyeTuru, hedef: number) {
  let t = 0;
  for (let s = 1; s < hedef; s++) t += seviyeEsigi(tur, s);
  return t;
}

// ---- Kilitler (dükkân seviyesi) ----
// Anahtar: 'esya.masa', 'isik.2', 'gorunus.disBoya.beyaz', 'tabela.neon',
// 'cesit.mango', 'vitrin.8', 'parca.waffle'. Ayar dosyasında yoksa açık.
const KILITLER = AYAR.kilit as Record<string, number>;
export function gerekenSeviye(anahtar: string) {
  return KILITLER[anahtar] ?? 1;
}

// Arazi: başlangıçtan sonra alınan her kare bir öncekinden daha yüksek seviye ister
export function araziSeviyesi(alinmisEkKare: number) {
  return 1 + AYAR.kilit.araziAdimi * (alinmisEkKare + 1);
}
// Yardımcılar: ilki belli bir seviyede, sonrakiler adım adım
export function yardimciSeviyesi(yardimciSayisi: number) {
  return AYAR.kilit.yardimciIlk + AYAR.kilit.yardimciAdimi * yardimciSayisi;
}

// Seviye atlayınca açılan kilitler (gün sonu kartında "YENİ!")
export function acilanKilitler(eski: number, yeni: number) {
  return Object.entries(KILITLER)
    .filter(([anahtar, s]) => anahtar.includes('.') && s > eski && s <= yeni)
    .map(([anahtar]) => anahtar);
}
