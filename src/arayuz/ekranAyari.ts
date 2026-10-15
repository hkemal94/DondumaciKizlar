import { useSyncExternalStore } from 'react';

// Ekran ayarları (Kemal, 14 Ekim): küvet etiketleri ve sipariş balonundaki
// çeşit adları kapatılabilir. Bu cihazda saklanır (oyun kaydından ayrı).
// Grafik kalitesi (belge 0.12): düşükte gölge ve uzak mahalle kapanır, kalabalık azalır
export type GrafikKalitesi = 'dusuk' | 'orta' | 'yuksek';
export const GRAFIK_KALITELERI: GrafikKalitesi[] = ['dusuk', 'orta', 'yuksek'];

export interface EkranAyari {
  kuvetEtiketi: boolean;
  balonAdlari: boolean;
  grafik: GrafikKalitesi;
}

const ANAHTAR = 'dondurmaci-kizlar-ekran';
let ayar: EkranAyari = oku();
const dinleyiciler = new Set<() => void>();

function oku(): EkranAyari {
  try {
    const k = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}') as Partial<EkranAyari>;
    return {
      kuvetEtiketi: k.kuvetEtiketi !== false,
      balonAdlari: k.balonAdlari !== false,
      grafik: GRAFIK_KALITELERI.includes(k.grafik as GrafikKalitesi) ? (k.grafik as GrafikKalitesi) : 'orta',
    };
  } catch {
    return { kuvetEtiketi: true, balonAdlari: true, grafik: 'orta' };
  }
}

export function ekranAyariniYaz(yeni: Partial<EkranAyari>) {
  ayar = { ...ayar, ...yeni };
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(ayar));
  } catch {
    // tarayıcı izin vermezse yalnız bu açılışta geçerli
  }
  dinleyiciler.forEach((d) => d());
}

export function useEkranAyari() {
  return useSyncExternalStore(
    (d) => {
      dinleyiciler.add(d);
      return () => dinleyiciler.delete(d);
    },
    () => ayar,
  );
}

// Sahne her karede okur (React dışında)
export function ekranAyariniOku() {
  return ayar;
}
