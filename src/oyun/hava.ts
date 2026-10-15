import { AYAR } from './ayarlar';

// Hava durumu (belge 0.15; Kemal, 16 Ekim soru turu): güneşli, çok sıcak,
// bulutlu / rüzgârlı, yağmurlu. Hafif etki: sıcakta biraz daha çok müşteri ve
// soğuk içecek, yağmurda biraz daha az müşteri; ceza yok. Gün sonunda yarının
// tahmini görünür; bazen gün içinde değişir (tahminde yazar).
// Olasılık ve etkiler ayar dosyasında (hava bölümü).

export type Hava = 'gunesli' | 'sicak' | 'bulutlu' | 'yagmurlu';
export const HAVALAR: Hava[] = ['gunesli', 'sicak', 'bulutlu', 'yagmurlu'];

export interface HavaPlani {
  sabah: Hava;
  // Gün içinde değişim: açılıştan bu kadar oyun dakikası sonra
  degisim: { dakika: number; hava: Hava } | null;
}

const H = AYAR.hava;

function sec(): Hava {
  const agirlik: Record<Hava, number> = { gunesli: H.gunesliOlasilik, sicak: H.sicakOlasilik, bulutlu: H.bulutluOlasilik, yagmurlu: H.yagmurluOlasilik };
  const toplam = HAVALAR.reduce((t, h) => t + agirlik[h], 0);
  let r = Math.random() * toplam;
  for (const h of HAVALAR) if ((r -= agirlik[h]) < 0) return h;
  return 'gunesli';
}

// Değişim komşu havaya olur: güneş bulutlanır, bulut yağmura döner, yağmur açar
const DEGISIM: Record<Hava, Hava[]> = {
  gunesli: ['bulutlu', 'sicak'],
  sicak: ['bulutlu', 'yagmurlu'],
  bulutlu: ['yagmurlu', 'gunesli'],
  yagmurlu: ['gunesli', 'bulutlu'],
};

export function havaPlaniUret(): HavaPlani {
  const sabah = sec();
  if (Math.random() * 100 >= H.degisimOlasilik) return { sabah, degisim: null };
  const secenek = DEGISIM[sabah];
  return { sabah, degisim: { dakika: (3 + Math.floor(Math.random() * 9) / 2) * 60, hava: secenek[Math.floor(Math.random() * secenek.length)] } };
}

export function anlikHava(plan: HavaPlani, dakika: number): Hava {
  return plan.degisim && dakika >= plan.degisim.dakika ? plan.degisim.hava : plan.sabah;
}

// Müşteri sıklığı çarpanı (büyük = daha sık müşteri)
export function havaGelisCarpani(h: Hava) {
  return (h === 'sicak' ? H.sicakGelis : h === 'bulutlu' ? H.bulutluGelis : h === 'yagmurlu' ? H.yagmurluGelis : 100) / 100;
}
// İçecek siparişinin ağırlık çarpanı
export function havaIcecekCarpani(h: Hava) {
  return h === 'sicak' ? H.sicakIcecek / 100 : 1;
}

export function havaPlaniOku(ham: unknown): HavaPlani | null {
  if (!ham || typeof ham !== 'object') return null;
  const p = ham as Partial<HavaPlani>;
  if (!HAVALAR.includes(p.sabah as Hava)) return null;
  const d = p.degisim;
  const degisim = d && typeof d.dakika === 'number' && HAVALAR.includes(d.hava) ? { dakika: d.dakika, hava: d.hava } : null;
  return { sabah: p.sabah as Hava, degisim };
}
