import * as THREE from 'three';

// Kameranın hangi görünümde olduğu: 0 = tezgah, 1 = dükkânın genel görünümü.
// Geçiş sırasında aradaki değerleri alır. Sahnedeki parçalar (tavan, kepçe…)
// görünüp gizlenmek için buna bakar.
export const kameraKarisimi = { deger: 1 };

// Genel görünümde yakınlaştırma (Kemal, 13 Ekim: "yakınlaştırma uzaklaştırma
// olsun, insanlar dükkânlarını görebilsinler"). Açı sabit, yalnız uzaklık
// değişir: 1 = varsayılan, küçük = yakın, büyük = uzak.
export const YAKINLIK_EN_AZ = 0.45;
export const YAKINLIK_EN_COK = 1.6;
export const dukkanYakinligi = { deger: 1 };

export function yakinlikDegistir(carpan: number) {
  dukkanYakinligi.deger = Math.min(YAKINLIK_EN_COK, Math.max(YAKINLIK_EN_AZ, dukkanYakinligi.deger * carpan));
}

// Genel görünümde dükkânın çevresinde dönme açısı (radyan). Kemal, 14 Ekim:
// "360 döndürme ve aşağı yukarı bakma, her yerde": yalnız gezerken değil,
// genel görünümde her an. Ortala düğmesi önden görünüme döndürür.
export const dukkanDonusu = { deger: 0 };
// Aşağı yukarı bakış: varsayılan açıya eklenen eğim (radyan). Artı = daha yukarıdan.
export const dukkanEgimi = { deger: 0 };
export const EGIM_EN_AZ = THREE.MathUtils.degToRad(-22);
export const EGIM_EN_COK = THREE.MathUtils.degToRad(50);

export function dondur(yatay: number, dikey: number) {
  dukkanDonusu.deger += yatay;
  dukkanEgimi.deger = Math.min(EGIM_EN_COK, Math.max(EGIM_EN_AZ, dukkanEgimi.deger + dikey));
}

// Fotoğraf: sahne kendini buraya bağlar; çağrılınca o anki görüntüyü verir.
export const fotograf: { cek: null | (() => string) } = { cek: null };

// Genel görünümde kaydırma (Kemal, 13 Ekim: "sağ sol alt üst gezinmeler,
// yönü değiştirmeden"): bakılan noktanın yerdeki kayması (metre).
export const dukkanKaydirma = { x: 0, z: 0 };
const KAYDIRMA_SINIRI = { x: 9, zEn: -7, zEnCok: 4 };

export function kaydir(dx: number, dz: number) {
  dukkanKaydirma.x = Math.min(KAYDIRMA_SINIRI.x, Math.max(-KAYDIRMA_SINIRI.x, dukkanKaydirma.x + dx));
  dukkanKaydirma.z = Math.min(KAYDIRMA_SINIRI.zEnCok, Math.max(KAYDIRMA_SINIRI.zEn, dukkanKaydirma.z + dz));
}

export function ortala() {
  dukkanKaydirma.x = 0;
  dukkanKaydirma.z = 0;
  dukkanYakinligi.deger = 1;
  dukkanDonusu.deger = 0;
  dukkanEgimi.deger = 0;
}

// Ekranda parmak kayması (oyun ekranının pikselleri) → yerde kayma.
// Görüntü parmağı izler: parmak sağa giderse dükkân da sağa kayar.
const BAKIS = { x: 13.1, z: 18.4 }; // genel görünümün yerdeki bakış yönü
export function ekrandaKaydir(dxPiksel: number, dyPiksel: number, ekranYuksekligi: number) {
  const a = dukkanDonusu.deger;
  const uzunluk = Math.hypot(BAKIS.x, BAKIS.z);
  // Dönüşe göre ileri ve sağ yönleri
  const ix = (BAKIS.x * Math.cos(a) + BAKIS.z * Math.sin(a)) / uzunluk;
  const iz = (-BAKIS.x * Math.sin(a) + BAKIS.z * Math.cos(a)) / uzunluk;
  const sx = -iz;
  const sz = ix;
  const olcek = (12 * dukkanYakinligi.deger) / ekranYuksekligi;
  kaydir((-sx * dxPiksel + ix * dyPiksel) * olcek, (-sz * dxPiksel + iz * dyPiksel) * olcek);
}

// Gezerken duvarlar (Kemal, 13 Ekim): kesit (bakılan yöne dönükler kalkar),
// duvarsız (hepsi kalkar), kapalı (hepsi ve tavan yerinde, dışarıdan bakılır)
export type DuvarModu = 'kesit' | 'duvarsiz' | 'kapali';
export const duvarlar: { mod: DuvarModu } = { mod: 'kesit' };
export function duvarModunuDegistir(): DuvarModu {
  duvarlar.mod = duvarlar.mod === 'kesit' ? 'duvarsiz' : duvarlar.mod === 'duvarsiz' ? 'kapali' : 'kesit';
  return duvarlar.mod;
}

// Çalışanı kişiselleştirirken kamera ona yakından bakar
export const odak = { calisan: false };

// Tezgah görünümünün dikliği (Kemal, 14 Ekim): vitrin iki sıra olunca kamera
// biraz yukarıdan bakar, küvetler büyür. 0 = tek sıra, 1 = iki sıra.
export const tezgahDikligi = { deger: 0 };
