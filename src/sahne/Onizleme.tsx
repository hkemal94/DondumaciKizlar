import { useLayoutEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EsyaModeli } from './Dekorlar';
import type { Esya } from '../oyun/dekorasyon';

// Mağaza kartlarındaki küçük resimleri üretmek için (yalnız geliştirirken):
// adresin sonuna #onizleme=masa yazılınca o eşya saydam zeminde tek başına
// çizilir. Resimler public/gorseller/esyalar/ altına bir kez alınır.
function Cerceve({ esya }: { esya: Esya }) {
  const grup = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useLayoutEffect(() => {
    if (!grup.current) return;
    grup.current.updateWorldMatrix(true, true); // ölçmeden önce iç parçaların yerleri hesaplansın
    const kutu = new THREE.Box3().setFromObject(grup.current);
    const merkez = kutu.getCenter(new THREE.Vector3());
    const boy = kutu.getSize(new THREE.Vector3()).length();
    // Oyundaki genel görünüm gibi önden-soldan, biraz yukarıdan
    const yon = new THREE.Vector3(-0.55, 0.55, -1).normalize();
    // Uzun eşyalar (lamba, flama) boyuna göre sığsın
    const yukseklik = kutu.getSize(new THREE.Vector3()).y;
    camera.position.copy(merkez).addScaledVector(yon, Math.max(boy * 1.85, yukseklik * 2.5));
    camera.lookAt(merkez);
    camera.updateProjectionMatrix();
  }, [camera, esya]);
  return (
    <group ref={grup}>
      <EsyaModeli esya={esya} />
    </group>
  );
}

export function Onizleme({ esya }: { esya: Esya }) {
  return (
    <Canvas
      className="onizleme"
      gl={{ alpha: true, preserveDrawingBuffer: true, antialias: true }}
      camera={{ fov: 30 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={1.2} />
      <hemisphereLight args={['#fff4e2', '#b98d6a', 1.1]} />
      <directionalLight position={[-4, 8, -6]} intensity={2.2} />
      <Cerceve esya={esya} />
    </Canvas>
  );
}
