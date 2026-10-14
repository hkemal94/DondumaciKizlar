import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { renk } from './renkler';
import { paletliModel, type ModelAyari } from './tasarimDili';

// Tasarım dili denemesi (yalnız geliştirirken, belge 0.7): adresin sonuna
// #tasarim=M1 yazılınca o paketin seçilen parçaları oyunun gündüz ışığında
// yan yana durur; #tasarim=M1-ham aynı parçaları paketten geldiği gibi gösterir.
// Önce / sonra ekran görüntüleri buradan alınır.

type Parca = [yol: string, ayar: Omit<ModelAyari, 'ham'>];
const PAKETLER: Record<string, Parca[]> = {
  // Dekorasyon eşyaları (3. adım)
  DEK: [
    ['pastane/table_round_B', { grup: 'dukkan', yukseklik: 0.72, boya: [['#3f7fc0', renk.mor, 38]] }],
    ['pastane/chair', { grup: 'dukkan', yukseklik: 0.85 }],
    ['mobilya/benchCushion', { grup: 'dukkan', en: 1.15, boya: [['#f9a39e', renk.mor, 40]] }],
    ['mobilya/trashcan', { grup: 'dukkan', yukseklik: 0.8 }],
  ],
  M1: [
    ['mobilya/tableRound', { grup: 'dukkan', yukseklik: 0.75 }],
    ['mobilya/chairCushion', { grup: 'dukkan', yukseklik: 0.9 }],
    ['mobilya/pottedPlant', { grup: 'dukkan', yukseklik: 1.0 }],
  ],
  M2: [
    ['pastane/display_case_short', { grup: 'dukkan', yukseklik: 1.1, boya: [['#2f74b5', renk.mor, 35]] }],
    ['pastane/pastry_stand_A_decorated', { grup: 'dukkan', yukseklik: 0.4 }],
    ['pastane/coffee_machine', { grup: 'dukkan', yukseklik: 0.45 }],
  ],
  M4: [
    ['mutfak/fridge_A', { grup: 'dukkan', yukseklik: 1.9, boya: [['#3ad7a7', '#a8eccf', 30], ['#19927f', '#7fc4a6', 30]] }],
    ['mutfak/kitchencounter_straight_A_decorated', { grup: 'dukkan', yukseklik: 1.2 }],
    ['mutfak/crate_carrots', { grup: 'urun', yukseklik: 0.45 }],
  ],
  G1: [
    ['yiyecek/ice-cream', { grup: 'urun', yukseklik: 0.22, boya: [['#ee8ad6', '#ff6f7d', 45]] }],
    ['yiyecek/soda-bottle', { grup: 'urun', yukseklik: 0.26 }],
    ['yiyecek/banana', { grup: 'urun', en: 0.2, boya: [['#f2b23a', '#f6e7a1', 45]] }],
  ],
  D1: [
    ['tekneler/boat-row-small', { grup: 'liman', en: 3.5 }],
    ['tekneler/boat-fishing-small', { grup: 'liman', en: 6 }],
    ['tekneler/buoy', { grup: 'liman', yukseklik: 1.2 }],
  ],
  D4: [
    ['binalar/building-c', { grup: 'liman', yukseklik: 7, boya: [['#6e7390', renk.pembeSiva, 24]] }],
    ['binalar/building-f', { grup: 'liman', yukseklik: 8.5 }],
    ['binalar/detail-parasol-a', { grup: 'liman', yukseklik: 2.4, boya: [['#61cb8b', renk.kiremit, 6]] }],
  ],
  D7: [
    ['doga/Pine_1', { grup: 'liman', yukseklik: 7, boya: [['#38580a', renk.tepe, 20]] }],
    ['doga/Bush_Common_Flowers', { grup: 'liman', yukseklik: 1.0 }],
    ['doga/Rock_Medium_1', { grup: 'liman', yukseklik: 1.2, boya: [['#6f7377', renk.kaya, 30]] }],
  ],
};

function Dizi({ paket, ham }: { paket: string; ham: boolean }) {
  const [nesneler, setNesneler] = useState<THREE.Object3D[]>([]);
  const { camera } = useThree();
  useEffect(() => {
    const parcalar = PAKETLER[paket] ?? [];
    Promise.all(parcalar.map(([yol, ayar]) => paletliModel(yol, { ...ayar, ham }))).then((liste) => {
      // Yan yana diz: aralarında enlerinin yarısı kadar boşluk
      let x = 0;
      const enler = liste.map((n) => new THREE.Box3().setFromObject(n).getSize(new THREE.Vector3()).x);
      const bosluk = Math.max(...enler) * 0.35;
      liste.forEach((n, i) => {
        n.position.x = x + enler[i] / 2;
        x += enler[i] + bosluk;
      });
      const grup = new THREE.Group();
      liste.forEach((n) => grup.add(n));
      grup.position.x = -(x - bosluk) / 2;
      grup.updateWorldMatrix(true, true);
      const kutu = new THREE.Box3().setFromObject(grup);
      const merkez = kutu.getCenter(new THREE.Vector3());
      const boy = kutu.getSize(new THREE.Vector3());
      // Oyundaki genel görünüm gibi önden, biraz yukarıdan
      const uzaklik = Math.max(boy.x * 1.25, boy.y * 2.6);
      camera.position.copy(merkez).add(new THREE.Vector3(0.25, 0.45, 1).normalize().multiplyScalar(uzaklik));
      camera.lookAt(merkez);
      setNesneler([grup]);
    });
  }, [paket, ham, camera]);
  return (
    <>
      {nesneler.map((n, i) => (
        <primitive key={i} object={n} />
      ))}
    </>
  );
}

export function TasarimOnizleme({ adres }: { adres: string }) {
  const ham = adres.endsWith('-ham');
  const paket = adres.replace('-ham', '');
  return (
    <Canvas
      className="onizleme"
      shadows="percentage"
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ fov: 30, near: 0.02, far: 200 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
      }}
    >
      <color attach="background" args={[renk.gokUfuk]} />
      {/* Oyunun gündüz ışığı (Sahne.tsx, Isiklar) */}
      <hemisphereLight args={['#cfe6f7', renk.ahsapOrta, 0.9]} />
      <ambientLight intensity={0.25} color="#fff1df" />
      <directionalLight
        position={[-6, 11, 8]}
        intensity={2.6}
        color="#fff4e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={renk.kum} roughness={0.95} />
      </mesh>
      <gridHelper args={[80, 80, '#c9b9a3', '#d8c6a6']} position={[0, 0.002, 0]} />
      <Dizi paket={paket} ham={ham} />
    </Canvas>
  );
}
