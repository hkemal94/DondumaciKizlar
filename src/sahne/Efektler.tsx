import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Sakin parçacık efektleri (Kemal, 14 Ekim: "orta, sakin"; ekran sarsma yok).
// Tetik değeri her değiştiğinde bir kez patlar ve kendiliğinden söner.
//  - kivilcim: MÜKEMMEL topta topun çevresine küçük sarı-beyaz yıldızlar
//  - serpinti: süslemede yukarıdan topa dökülen renkli kırıntılar
//  - bulut: sıkılıp giden müşterinin başında küçük gri bulut

type Tur = 'kivilcim' | 'serpinti' | 'bulut';

const SAYI: Record<Tur, number> = { kivilcim: 12, serpinti: 14, bulut: 6 };
const SURE: Record<Tur, number> = { kivilcim: 0.7, serpinti: 0.6, bulut: 2.2 };

export function Parcaciklar({ tetik, tur, renkler }: { tetik: number; tur: Tur; renkler: string[] }) {
  const grup = useRef<THREE.Group>(null);
  const sayi = SAYI[tur];
  const baslangic = useRef({ tetik: tetik, zaman: -100 });
  // Her parçacığın yönü ve hızı (her patlamada aynı biçim, sorun değil)
  const yonler = useMemo(
    () =>
      Array.from({ length: sayi }, (_, i) => {
        const a = (i / sayi) * Math.PI * 2 + Math.random() * 0.4;
        if (tur === 'kivilcim') return new THREE.Vector3(Math.cos(a) * 0.3, 0.1 + Math.random() * 0.18, Math.sin(a) * 0.3);
        if (tur === 'serpinti') return new THREE.Vector3(Math.cos(a) * 0.05 * Math.random(), 0.22 + Math.random() * 0.12, Math.sin(a) * 0.05 * Math.random());
        return new THREE.Vector3(Math.cos(a) * 0.09, Math.sin(i * 1.7) * 0.03, Math.sin(a) * 0.04);
      }),
    [sayi, tur],
  );

  useFrame(({ clock }) => {
    const g = grup.current;
    if (!g) return;
    if (tetik !== baslangic.current.tetik) baslangic.current = { tetik, zaman: clock.elapsedTime };
    const t = (clock.elapsedTime - baslangic.current.zaman) / SURE[tur];
    g.visible = t >= 0 && t < 1;
    if (!g.visible) return;
    g.children.forEach((c, i) => {
      const y = yonler[i];
      if (tur === 'kivilcim') {
        c.position.copy(y).multiplyScalar(Math.sqrt(t) * 1.0);
        c.scale.setScalar((1 - t) * 0.034 + 0.008);
        c.rotation.y = t * 6 + i;
      } else if (tur === 'serpinti') {
        // Yukarıdan düşer: başta yüksekte, sonra topun üstüne iner
        c.position.set(y.x, y.y * (1 - t) * (1 - t), y.z);
        c.scale.setScalar(t < 0.85 ? 0.012 : (1 - t) * 0.08);
        c.rotation.x = t * 8 + i;
      } else {
        // Bulut: belirip büyür, hafifçe yükselir, söner
        const s = Math.sin(Math.min(1, t * 3) * Math.PI * 0.5) * (t > 0.75 ? (1 - t) * 4 : 1);
        c.position.set(y.x, y.y + t * 0.12, y.z);
        c.scale.setScalar(s * (0.07 + (i % 3) * 0.015));
      }
    });
  });

  return (
    <group ref={grup} visible={false}>
      {yonler.map((_, i) => (
        <mesh key={i}>
          {tur === 'bulut' ? <icosahedronGeometry args={[1, 1]} /> : tur === 'kivilcim' ? <octahedronGeometry args={[1, 0]} /> : <boxGeometry args={[1, 0.5, 0.5]} />}
          {tur === 'bulut' ? (
            <meshStandardMaterial color={renkler[i % renkler.length]} roughness={1} flatShading transparent opacity={0.9} />
          ) : (
            <meshBasicMaterial color={renkler[i % renkler.length]} toneMapped={false} />
          )}
        </mesh>
      ))}
    </group>
  );
}
