import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { kameraKarisimi } from './kameraKarisimi';

// Kamerayla dükkân arasına giren bina yarı saydam olur (Kemal, 15 Ekim:
// "bu ev görüntüyü kapatıyorsa biraz şeffaflaşmalı"). Binanın kutusu her
// birkaç karede bir ölçülür; kameradan dükkâna giden çizgi kutudan geçiyorsa
// malzemeleri yumuşakça solar, çekilince geri gelir.

// Dükkânın birkaç noktası: orta, iki yan, ön ve arka kenar (biri kapanırsa solar)
const DUKKAN_NOKTALARI = [
  [0, 1.5, 0],
  [-6, 1, 1],
  [6, 1, 1],
  [0, 1, -2],
  [0, 1, 5],
  [-6, 1, 5],
  [6, 1, 5],
].map(([x, y, z]) => new THREE.Vector3(x, y, z));
const SAYDAM = 0.22;

export function SaydamEngel({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const kutu = useMemo(() => new THREE.Box3(), []);
  const isin = useMemo(() => new THREE.Ray(), []);
  const kesisme = useMemo(() => new THREE.Vector3(), []);
  const durum = useRef({ kare: 0, opaklik: 1, engel: false, malzemeler: [] as THREE.Material[] });
  useFrame(({ camera }, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = durum.current;
    // Yeni yüklenen modeller için kutu ve malzemeler arada bir yenilenir
    if (d.kare++ % 20 === 0) {
      kutu.setFromObject(g);
      const liste: THREE.Material[] = [];
      g.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (!m) return;
        // Malzeme başka binalarla paylaşılıyorsa kendi kopyası
        if (!o.userData.saydamKopya) {
          (o as THREE.Mesh).material = Array.isArray(m) ? m.map((x) => x.clone()) : m.clone();
          o.userData.saydamKopya = true;
        }
        const mm = (o as THREE.Mesh).material;
        liste.push(...(Array.isArray(mm) ? mm : [mm]));
      });
      d.malzemeler = liste;
    }
    // Tezgah yakın planında hiçbir şey kapatmaz
    if (kameraKarisimi.deger < 0.12 || kutu.isEmpty()) d.engel = false;
    else {
      isin.origin.copy(camera.position);
      d.engel = DUKKAN_NOKTALARI.some((hedefNokta) => {
        isin.direction.copy(hedefNokta).sub(camera.position).normalize();
        const nokta = isin.intersectBox(kutu, kesisme);
        return !!nokta && nokta.distanceTo(camera.position) < camera.position.distanceTo(hedefNokta);
      });
    }
    const hedef = d.engel ? SAYDAM : 1;
    if (Math.abs(d.opaklik - hedef) < 0.01 && d.opaklik === hedef) return;
    d.opaklik += (hedef - d.opaklik) * Math.min(1, dt * 6);
    if (Math.abs(d.opaklik - hedef) < 0.01) d.opaklik = hedef;
    for (const m of d.malzemeler) {
      m.transparent = d.opaklik < 1;
      m.opacity = d.opaklik;
      m.depthWrite = d.opaklik >= 1;
    }
  });
  return <group ref={ref}>{children}</group>;
}
