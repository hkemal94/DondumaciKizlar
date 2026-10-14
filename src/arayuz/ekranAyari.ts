import { useSyncExternalStore } from 'react';

// Ekran ayarları (Kemal, 14 Ekim): küvet etiketleri ve sipariş balonundaki
// çeşit adları kapatılabilir. Bu cihazda saklanır (oyun kaydından ayrı).
export interface EkranAyari {
  kuvetEtiketi: boolean;
  balonAdlari: boolean;
}

const ANAHTAR = 'dondurmaci-kizlar-ekran';
let ayar: EkranAyari = oku();
const dinleyiciler = new Set<() => void>();

function oku(): EkranAyari {
  try {
    const k = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}') as Partial<EkranAyari>;
    return { kuvetEtiketi: k.kuvetEtiketi !== false, balonAdlari: k.balonAdlari !== false };
  } catch {
    return { kuvetEtiketi: true, balonAdlari: true };
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
