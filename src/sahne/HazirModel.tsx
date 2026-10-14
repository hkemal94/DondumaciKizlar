import { useEffect, useState } from 'react';
import type * as THREE from 'three';
import { paletliModel, type ModelAyari } from './tasarimDili';

// Hazır paketten bir model (belge 0.7): yüklenince ölçüye ve palete oturur.
// Yüklenene kadar hiçbir şey çizilmez.
export function HazirModel({
  yol,
  ayar,
  konum,
  donus = 0,
}: {
  yol: string;
  ayar: ModelAyari;
  konum?: [number, number, number];
  donus?: number; // y ekseninde dönüş (radyan)
}) {
  const [nesne, setNesne] = useState<THREE.Object3D | null>(null);
  const anahtar = JSON.stringify(ayar);
  useEffect(() => {
    let iptal = false;
    paletliModel(yol, JSON.parse(anahtar) as ModelAyari).then((n) => {
      if (!iptal) setNesne(n);
    });
    return () => {
      iptal = true;
    };
  }, [yol, anahtar]);
  if (!nesne) return null;
  return (
    <group position={konum} rotation={[0, donus, 0]}>
      <primitive object={nesne} />
    </group>
  );
}
