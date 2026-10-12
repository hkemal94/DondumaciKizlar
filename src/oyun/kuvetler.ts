// Vitrindeki küvetlerin yeri ve rengi. Çeşitler henüz kararlaştırılmadı;
// renkler yalnız sahne için, adları yok.
export const KUVET_Y = 1.0; // küvet ağzının yüksekliği
export const KUVET_Z = -0.62; // vitrinin ortası

export const kuvetler = [
  { x: -0.93, renk: '#f08c8c' },
  { x: -0.31, renk: '#9b6a4f' },
  { x: 0.31, renk: '#9fdcae' },
  { x: 0.93, renk: '#f6ecd6' },
] as const;
