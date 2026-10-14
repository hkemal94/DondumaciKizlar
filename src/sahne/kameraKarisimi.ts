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

// Duraklatıp gezerken dükkânın çevresinde dönme açısı (radyan); gezme
// bitince yumuşakça önden görünüme döner.
export const dukkanDonusu = { deger: 0 };

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
