import { useEffect, useMemo, useRef, useState } from 'react';
import { InsanKarakter, type Hareket } from './InsanKarakter';
import { HazirModel } from './HazirModel';
import { BEDENLER, rastgeleVaryant } from './karakterler';
import { Disari } from './Disari';
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
      {paket.startsWith('liman') ? <LimanKusbakisi /> : paket.startsWith('insan') ? <InsanlarOnizleme /> : <Dizi paket={paket} ham={ham} />}
    </Canvas>
  );
}

// İnsanlar (yalnız geliştirirken, belge 0.9): #tasarim=insan adresinde
// rastgele müşteriler, aksesuarlılar ve sandalyede oturan biri
function InsanlarOnizleme() {
  const { camera } = useThree();
  useEffect(() => {
    // #tasarim=insan-yan: yalnız oturan karakter, yandan yakın
    if (location.hash.endsWith('-aksyan')) {
      // #tasarim=insan-aksyan: aynı karakterler yandan (gözlük yüze oturuyor mu)
      camera.position.set(1.4, 1.5, 0.5);
      camera.lookAt(-0.5, 1.45, 0);
    } else if (location.hash.endsWith('-aks')) {
      // #tasarim=insan-aks: gözlük ve küpe yakından (kadın, erkek)
      camera.position.set(-1.0, 1.55, 2.9);
      camera.lookAt(-1.0, 1.45, 0);
    } else if (location.hash.endsWith('-sac')) {
      camera.position.set(0, 1.55, 3.4);
      camera.lookAt(0, 1.5, 0);
    } else if (location.hash.endsWith('-yuz')) {
      // İkinci karakterin tam önünden (gözlük ve küpe ortada mı)
      camera.position.set(-1.52, 1.5, 1.6);
      camera.lookAt(-1.52, 1.45, 0);
    } else if (location.hash.endsWith('-yan')) {
      camera.position.set(-3.6, 0.9, 2.6);
      camera.lookAt(-3.6, 0.7, 0);
    } else {
      camera.position.set(0, 1.9, 7.2);
      camera.lookAt(0, 0.95, 0);
    }
  }, [camera]);
  const dur = useRef<Hareket>('dur');
  const otur = useRef<Hareket>('otur');
  // #tasarim=insan-sac: aynı yüz, farklı saçlar (belge 0.12: saç başlardan ayrı)
  const sacDenemesi = location.hash.includes('-sac');
  const aksDenemesi = location.hash.includes('-aks');
  const varyantlar = useMemo(
    () =>
      aksDenemesi
        ? ([['kadin', 'casual', 'gozluk'], ['kadin', 'formal', 'kupe'], ['erkek', 'casual_2', 'gunesGozlugu'], ['erkek', 'beach', 'kupe']] as const).map(([c, b, a], i) => ({
            ...rastgeleVaryant(3 + i),
            cinsiyet: c,
            govde: b,
            bas: b,
            sacBasi: undefined,
            aksesuarlar: [a],
          }))
        : sacDenemesi
        ? [...BEDENLER.kadin.map((b) => ({ ...rastgeleVaryant(3), cinsiyet: 'kadin' as const, govde: 'casual', bas: 'casual', sacBasi: b, aksesuarlar: [] })),
           ...BEDENLER.erkek.slice(0, 2).map((b) => ({ ...rastgeleVaryant(4), cinsiyet: 'erkek' as const, govde: 'casual_2', bas: 'casual_2', sacBasi: b, aksesuarlar: [] }))]
        : [3, 8, 11, 17, 22, 40].map((t, i) => ({ ...rastgeleVaryant(t), aksesuarlar: [(['gozluk', 'gunesGozlugu', 'hasirSapka', 'kupe', 'bandana', 'kasket'] as const)[i]] })),
    [sacDenemesi, aksDenemesi],
  );
  return (
    <>
      {varyantlar.map((v, i) => (
        <group key={i} position={[(i - 2.6) * 0.95, 0, 0]}>
          <InsanKarakter varyant={v} hareket={dur} />
        </group>
      ))}
      {/* Yandan: oturma duruşu */}
      <group position={[-3.6, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        <InsanKarakter varyant={rastgeleVaryant(9)} hareket={otur} />
      </group>
      <group position={[2.9, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <HazirModel yol="pastane/chair" ayar={{ grup: 'dukkan', yukseklik: 0.85 }} donus={Math.PI} />
        <group position={[0, 0.45, 0]}>
          <InsanKarakter varyant={rastgeleVaryant(5)} hareket={otur} />
        </group>
      </group>
    </>
  );
}

// Liman kuşbakışı (yalnız geliştirirken, belge 0.10): #tasarim=liman
function LimanKusbakisi() {
  const { camera } = useThree();
  useEffect(() => {
    // #tasarim=liman-yakin: dükkânın üstünden
    if (location.hash.endsWith('-yakin')) {
      camera.position.set(0, 90, 20);
      camera.lookAt(0, 0, -10);
    } else {
      camera.position.set(0, 620, 160);
      camera.lookAt(0, 0, -40);
    }
    (camera as THREE.PerspectiveCamera).far = 2000;
    camera.updateProjectionMatrix();
  }, [camera]);
  return <Disari />;
}
