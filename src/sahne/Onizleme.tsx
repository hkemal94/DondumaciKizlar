import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EsyaModeli } from './Dekorlar';
import { karakterKur, karakterleriYukle, rastgeleVaryant, type Karakter } from './karakterler';
import { useFrame } from '@react-three/fiber';
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

// Model önizlemesi (#model=karakterler/character-female-a): Kemal seçsin diye
function Model({ yol }: { yol: string }) {
  const [sahne, setSahne] = useState<THREE.Object3D | null>(null);
  const { camera } = useThree();
  useEffect(() => {
    new GLTFLoader().load(`${import.meta.env.BASE_URL}modeller/${yol}.glb`, (g) => {
      const karistirici = new THREE.AnimationMixer(g.scene);
      const bekle = g.animations.find((a) => a.name === 'idle');
      if (bekle) {
        karistirici.clipAction(bekle).play();
        karistirici.update(0.4);
      }
      setSahne(g.scene);
    });
  }, [yol]);
  useLayoutEffect(() => {
    if (!sahne) return;
    sahne.updateWorldMatrix(true, true);
    const kutu = new THREE.Box3().setFromObject(sahne);
    const merkez = kutu.getCenter(new THREE.Vector3());
    const y = kutu.getSize(new THREE.Vector3()).y;
    camera.position.copy(merkez).add(new THREE.Vector3(0.35, 0.15, 1).normalize().multiplyScalar(y * 2.3));
    camera.lookAt(merkez);
  }, [sahne, camera]);
  return sahne ? <primitive object={sahne} /> : null;
}

// Varyant önizlemesi (#varyant=1): 12 rastgele müşteri yan yana
function Varyantlar({ tohum }: { tohum: number }) {
  const [karakterler, setKarakterler] = useState<Karakter[]>([]);
  const { camera } = useThree();
  useEffect(() => {
    karakterleriYukle().then((y) => {
      const k = Array.from({ length: 12 }, (_, i) => karakterKur(rastgeleVaryant(tohum + i), y));
      k.forEach((c, i) => {
        c.kok.position.set((i % 6) * 1.3 - 3.25, i < 6 ? 2.1 : 0, 0);
        c.eylemler.idle?.play();
      });
      setKarakterler(k);
    });
    camera.position.set(0, 2.1, 9.5);
    camera.lookAt(0, 1.85, 0);
  }, [tohum, camera]);
  useFrame((_, dt) => karakterler.forEach((k) => k.karistirici.update(dt)));
  return (
    <group>
      {karakterler.map((k, i) => (
        <primitive key={i} object={k.kok} />
      ))}
    </group>
  );
}

export function Onizleme({ esya, model, varyant }: { esya?: Esya; model?: string; varyant?: number }) {
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
      {varyant !== undefined ? <Varyantlar tohum={varyant} /> : model ? <Model yol={model} /> : esya && <Cerceve esya={esya} />}
    </Canvas>
  );
}
