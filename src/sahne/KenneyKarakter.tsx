import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { durumuOku } from '../oyun/durum';
import { karakterKur, karakterleriYukle, type Karakter, type Varyant } from './karakterler';

// Kenney karakteri (müşteri, çalışan, sahip: hepsi aynı parçalardan; Kemal,
// 14 Ekim). Hareket dışarıdan bir referansla verilir; animasyonlar arası
// yumuşak geçiş. Görünüş değişince karakter yeniden kurulur.
export type Hareket = 'dur' | 'yuru' | 'otur' | 'calis';
const ANIMASYON: Record<Hareket, string> = { dur: 'idle', yuru: 'walk', otur: 'sit', calis: 'interact-right' };

export function KenneyKarakter({
  varyant,
  hareket,
  ekle,
}: {
  varyant: Varyant;
  hareket: MutableRefObject<Hareket>;
  ekle?: (k: Karakter) => void;
}) {
  const [k, setK] = useState<Karakter | null>(null);
  const simdiki = useRef('');
  const anahtar = JSON.stringify(varyant);
  useEffect(() => {
    let iptal = false;
    karakterleriYukle().then((y) => {
      if (iptal) return;
      const yeni = karakterKur(JSON.parse(anahtar) as Varyant, y);
      ekle?.(yeni);
      simdiki.current = '';
      setK(yeni);
    });
    return () => {
      iptal = true;
    };
    // ekle her çizimde yeni olabilir; yalnız görünüş değişince kur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anahtar]);
  useFrame((_, dt) => {
    if (!k || durumuOku().duraklatildi) return;
    const ad = ANIMASYON[hareket.current];
    if (ad !== simdiki.current) {
      k.eylemler[ad]?.reset().fadeIn(0.25).play();
      k.eylemler[simdiki.current]?.fadeOut(0.25);
      simdiki.current = ad;
    }
    k.karistirici.update(dt);
  });
  return k ? <primitive object={k.kok} /> : null;
}
