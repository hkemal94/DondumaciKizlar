import { Suspense, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Disari } from './Disari';
import { Dukkan } from './Dukkan';
import { renk } from './renkler';

// Tezgah kamerası: sabit, oyuncu yürümez. Ekran ne kadar geniş ya da dar
// olursa olsun yatayda aşağı yukarı aynı alanı göstersin diye görüş açısı
// ekran oranına göre ayarlanır.
const YATAY_GORUS = 80; // derece

function TezgahKamerasi() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const kamera = camera as THREE.PerspectiveCamera;
    const oran = size.width / size.height;
    const yatay = THREE.MathUtils.degToRad(YATAY_GORUS);
    const dikey = 2 * Math.atan(Math.tan(yatay / 2) / oran);
    kamera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(dikey), 38, 64);
    kamera.position.set(0, 1.85, 1.45);
    kamera.lookAt(0, 1.2, -4);
    kamera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Isiklar() {
  return (
    <>
      <hemisphereLight args={['#cfe6f7', renk.ahsapOrta, 0.9]} />
      <ambientLight intensity={0.25} color="#fff1df" />
      {/* Güneş: arkadan-sağdan, gölgeler tezgaha düşer */}
      <directionalLight
        position={[6, 11, 5]}
        intensity={2.6}
        color="#fff4e2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      {/* Dükkân içine sıcak dolgu ışığı */}
      <pointLight position={[0, 2.8, 0.2]} intensity={2.5} distance={7} color="#ffd9a8" />
    </>
  );
}

export function Sahne() {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ near: 0.05, far: 900 }}
      onCreated={({ gl }) => {
        // Pastel renkler soluklaşmasın diye yumuşak ton eşleme.
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <color attach="background" args={[renk.gokUfuk]} />
      <fog attach="fog" args={[renk.gokUfuk, 90, 320]} />
      <TezgahKamerasi />
      <Isiklar />
      <Suspense fallback={null}>
        <Disari />
        <Dukkan />
      </Suspense>
    </Canvas>
  );
}
