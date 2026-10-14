import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { durumuOku } from '../oyun/durum';
import { karakterKur, karakterleriYukle, type Karakter, type Varyant } from './karakterler';

// İnsan karakteri (müşteri, çalışan, yardımcı, sahip; belge 0.9). Hareket
// dışarıdan bir referansla verilir; hareketler arası yumuşak geçiş. Görünüş
// değişince karakter yeniden kurulur. Oturmada bacaklar bükülür ve karakter
// kalçası oturağa gelecek kadar iner (oturak yüksekliğini çağıran verir).
export type Hareket = 'dur' | 'yuru' | 'otur' | 'calis';
const ANIMASYON: Record<Hareket, string> = { dur: 'Idle', yuru: 'Walk', otur: 'Idle', calis: 'Interact' };

export function InsanKarakter({
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
    const oturuyor = hareket.current === 'otur';
    k.kok.position.y = oturuyor ? -k.kalca : 0;
    if (oturuyor) k.oturt();
  });
  return k ? <primitive object={k.kok} /> : null;
}
