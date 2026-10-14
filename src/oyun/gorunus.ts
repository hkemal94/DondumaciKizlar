// Dükkânın görünüşü (C paketi, belge 0.11; Kemal, 14 Ekim gece): dış boya,
// iç duvar, pencere / kapı çerçevesi, tente, iç zemin ve çatı. Her seçenek bir kez
// alınır, alınanlar arasında geçiş bedava. Başlangıçtaki görünüş her grupta
// baştan açık. Fiyatlar geçici; kilitler (gün, memnuniyet…) sonraki işler.

export type GorunusGrubu = 'disBoya' | 'icBoya' | 'cerceve' | 'tente' | 'zemin' | 'cati';
export const GORUNUS_GRUPLARI: GorunusGrubu[] = ['disBoya', 'icBoya', 'cerceve', 'tente', 'zemin', 'cati'];
// Dışarıdan bakınca görünenler: seçilince duvarlar kapanır, içtekilerde kesit olur
export const DIS_GRUPLAR: GorunusGrubu[] = ['disBoya', 'cerceve', 'tente', 'cati'];

export type ZeminDeseni = 'tahta' | 'dama' | 'mozaik' | 'karo' | 'terrazzo' | 'cila';

export interface GorunusSecenegi {
  id: string;
  renk: string;
  ikinciRenk?: string; // tente şeridi, zemin deseni
  desen?: ZeminDeseni;
  fiyat: number; // 0 = baştan açık
}

// Renkler paletin tonlarından (belge 0.7): krem, mor, sarı, Ege mavisi, sıva pembesi…
export const GORUNUS_SECENEKLERI: Record<GorunusGrubu, GorunusSecenegi[]> = {
  disBoya: [
    { id: 'krem', renk: '#e9d6bd', fiyat: 0 },
    { id: 'beyaz', renk: '#f7f3ea', fiyat: 150 },
    { id: 'pembe', renk: '#e7c9b8', fiyat: 200 },
    { id: 'sari', renk: '#f3d77a', fiyat: 200 },
    { id: 'lila', renk: '#c9b3df', fiyat: 250 },
    { id: 'mavi', renk: '#a9cfe0', fiyat: 250 },
    { id: 'adacayi', renk: '#b9cfa8', fiyat: 250 },
    { id: 'kiremit', renk: '#d99a7e', fiyat: 300 },
  ],
  icBoya: [
    { id: 'krem', renk: '#e9d6bd', fiyat: 0 },
    { id: 'beyaz', renk: '#f7f3ea', fiyat: 150 },
    { id: 'pembe', renk: '#f0d6cb', fiyat: 200 },
    { id: 'sari', renk: '#f6e3a4', fiyat: 200 },
    { id: 'lila', renk: '#d8c8e8', fiyat: 250 },
    { id: 'mavi', renk: '#c3dde8', fiyat: 250 },
    { id: 'adacayi', renk: '#cddcc0', fiyat: 250 },
    { id: 'mor', renk: '#9b5fc9', fiyat: 300 },
  ],
  cerceve: [
    { id: 'mor', renk: '#6b3596', fiyat: 0 },
    { id: 'sari', renk: '#ffc928', fiyat: 150 },
    { id: 'beyaz', renk: '#f7f3ea', fiyat: 150 },
    { id: 'ahsap', renk: '#a87650', fiyat: 200 },
    { id: 'mavi', renk: '#2f7fb3', fiyat: 200 },
    { id: 'yesil', renk: '#4f7d5a', fiyat: 200 },
    { id: 'koyu', renk: '#3a3340', fiyat: 250 },
  ],
  tente: [
    { id: 'morSari', renk: '#7a3fa8', ikinciRenk: '#ffc928', fiyat: 0 },
    { id: 'morKrem', renk: '#7a3fa8', ikinciRenk: '#fbf1e3', fiyat: 200 },
    { id: 'sariBeyaz', renk: '#ffc928', ikinciRenk: '#fbf8f1', fiyat: 200 },
    { id: 'maviBeyaz', renk: '#2f7fb3', ikinciRenk: '#fbf8f1', fiyat: 250 },
    { id: 'kiremitKrem', renk: '#c8705a', ikinciRenk: '#fbf1e3', fiyat: 250 },
    { id: 'yesilKrem', renk: '#4f7d5a', ikinciRenk: '#fbf1e3', fiyat: 250 },
    { id: 'mor', renk: '#7a3fa8', fiyat: 300 },
  ],
  zemin: [
    { id: 'ahsapKoyu', renk: '#7a5236', ikinciRenk: '#6c4830', desen: 'tahta', fiyat: 0 },
    { id: 'ahsapOrta', renk: '#a87650', ikinciRenk: '#99694a', desen: 'tahta', fiyat: 300 },
    { id: 'ahsapAcik', renk: '#d2ad80', ikinciRenk: '#c39d70', desen: 'tahta', fiyat: 300 },
    { id: 'damaSiyah', renk: '#f4efe6', ikinciRenk: '#3a3340', desen: 'dama', fiyat: 450 },
    { id: 'damaMor', renk: '#fbf1e3', ikinciRenk: '#9b5fc9', desen: 'dama', fiyat: 450 },
    { id: 'mozaik', renk: '#e8eef0', ikinciRenk: '#5f8fa8', desen: 'mozaik', fiyat: 500 },
    { id: 'karo', renk: '#c8705a', ikinciRenk: '#b4614d', desen: 'karo', fiyat: 400 },
    { id: 'terrazzo', renk: '#ece4d8', ikinciRenk: '#9a8f84', desen: 'terrazzo', fiyat: 550 },
    { id: 'cila', renk: '#c9c6c0', ikinciRenk: '#bdb9b2', desen: 'cila', fiyat: 350 },
  ],
  // Çatı biçimi (C2): düz dam (bugünkü), teras + korkuluk, kiremit, ahşap + pergola
  cati: [
    { id: 'duz', renk: '#7a3fa8', ikinciRenk: '#e9d6bd', fiyat: 0 },
    { id: 'teras', renk: '#c8705a', ikinciRenk: '#f7f3ea', fiyat: 600 },
    { id: 'kiremit', renk: '#c8705a', ikinciRenk: '#a85a48', fiyat: 800 },
    { id: 'pergola', renk: '#a87650', ikinciRenk: '#c99a6b', fiyat: 900 },
  ],
};

export type Gorunus = Record<GorunusGrubu, string>;

export const BASLANGIC_GORUNUSU: Gorunus = {
  disBoya: 'krem',
  icBoya: 'krem',
  cerceve: 'mor',
  tente: 'morSari',
  zemin: 'ahsapKoyu',
  cati: 'duz',
};

// Alınan seçenekler "grup:id" olarak saklanır
export const gorunusAnahtari = (g: GorunusGrubu, id: string) => `${g}:${id}`;
export const BASLANGIC_ACIK_GORUNUSLER = GORUNUS_GRUPLARI.flatMap((g) =>
  GORUNUS_SECENEKLERI[g].filter((s) => s.fiyat === 0).map((s) => gorunusAnahtari(g, s.id)),
);

export function gorunusSecenegi(g: GorunusGrubu, id: string): GorunusSecenegi {
  return GORUNUS_SECENEKLERI[g].find((s) => s.id === id) ?? GORUNUS_SECENEKLERI[g][0];
}

// Kayıttan okuma: tanınmayan değer başlangıçtakine döner
export function gorunusuOku(ham: unknown, acik: string[]): Gorunus {
  const k = (ham ?? {}) as Partial<Gorunus>;
  const g = { ...BASLANGIC_GORUNUSU };
  for (const grup of GORUNUS_GRUPLARI) {
    const id = k[grup];
    if (typeof id === 'string' && acik.includes(gorunusAnahtari(grup, id))) g[grup] = id;
  }
  return g;
}

export function acikGorunusleriOku(ham: unknown): string[] {
  const bilinen = new Set(GORUNUS_GRUPLARI.flatMap((g) => GORUNUS_SECENEKLERI[g].map((s) => gorunusAnahtari(g, s.id))));
  const liste = Array.isArray(ham) ? ham.filter((x): x is string => typeof x === 'string' && bilinen.has(x)) : [];
  return [...new Set([...BASLANGIC_ACIK_GORUNUSLER, ...liste])];
}
