import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku } from '../oyun/durum';
import { KUVET_Y, kuvetKonumu } from '../oyun/kuvetler';
import { EL_BOYU, egitimEli } from '../arayuz/EgitimEli';
import { tezgahOfseti } from './kameraKarisimi';

// Eğitim eli küvetin üstündeyken yerini her karede buradan alır
// (balon gibi: 3B yerden ekrandaki yere).
export function EgitimTakibi() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const oge = egitimEli.oge;
    if (!oge || egitimEli.kuvet === null) return;
    const d = durumuOku();
    if (d.kamera !== 'tezgah' || !d.vitrin.includes(egitimEli.kuvet)) {
      oge.style.opacity = '0';
      return;
    }
    const k = kuvetKonumu(egitimEli.kuvet, d.vitrin);
    v.set(k.x + tezgahOfseti.x, KUVET_Y + 0.06, k.z + tezgahOfseti.z).project(camera);
    const y = ((1 - v.y) / 2) * size.height;
    oge.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${y}px)`;
    oge.classList.toggle('asagi', y > size.height - EL_BOYU);
    oge.style.opacity = '1';
  });
  return null;
}
