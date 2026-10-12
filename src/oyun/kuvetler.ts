// Vitrindeki küvetler. Yeni çeşit eklemek için bu listeye bir satır eklemek
// yeter: vitrin genişler, küvetler kendiliğinden dizilir. (Bu açıdan rahat
// sığan sayı 6; daha fazlası için ikinci sıra ya da kaydırma gerekir.)
// Çeşitler henüz kararlaştırılmadı; renkler yalnız sahne için, adları yok.
const KUVET_RENKLERI = ['#ff6f7d', '#8a4b2e', '#5fd08a', '#fff0c8'];

export const KUVET_Y = 1.0; // küvet ağzının yüksekliği
export const KUVET_Z = -0.62; // vitrinin ortası
export const KUVET_ARASI = 0.62;

export const kuvetler = KUVET_RENKLERI.map((renk, i) => ({
  renk,
  x: (i - (KUVET_RENKLERI.length - 1) / 2) * KUVET_ARASI,
}));

export const VITRIN_GENISLIGI = kuvetler.length * KUVET_ARASI + 0.34;
