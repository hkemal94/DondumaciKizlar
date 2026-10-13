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
