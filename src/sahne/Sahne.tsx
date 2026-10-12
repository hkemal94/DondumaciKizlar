import { Suspense } from 'react';
import { Canvas, events, useFrame, useThree, type RootState } from '@react-three/fiber';
import { useRef } from 'react';
import { durumuOku, gunIlerleyisi } from '../oyun/durum';
import * as THREE from 'three';
import { Disari } from './Disari';
import { kameraKarisimi } from './kameraKarisimi';
import { Dukkan } from './Dukkan';
import { Hazirlama } from './Hazirlama';
import { Musteriler } from './Musteriler';
import { renk } from './renkler';

// İki sabit kamera (belge bölüm 0): dükkânın genel görünümü ve tezgahın
// arkasından yakın plan. Aralarında yumuşak geçiş; oyuncu yürümez.
// Ekran ne kadar geniş ya da dar olursa olsun yatayda aşağı yukarı aynı
// alanı göstersin diye görüş açısı ekran oranına göre ayarlanır.
const TEZGAH = { konum: new THREE.Vector3(0, 1.85, 1.45), hedef: new THREE.Vector3(0, 1.2, -4), yatay: 80 };
const DUKKAN = { konum: new THREE.Vector3(10.5, 11.5, 13.5), hedef: new THREE.Vector3(-0.5, 0.4, -0.8), yatay: 44 };


function dikeyAci(yatayDerece: number, oran: number) {
  const yatay = THREE.MathUtils.degToRad(yatayDerece);
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(yatay / 2) / oran));
}

function KameraYoneticisi() {
  const { camera, size } = useThree();
  const hedef = useRef(new THREE.Vector3());
  const konum = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const kamera = camera as THREE.PerspectiveCamera;
    const istenen = durumuOku().kamera === 'dukkan' ? 1 : 0;
    // Yaklaşık bir saniyelik yumuşak geçiş
    const k = kameraKarisimi;
    k.deger += Math.sign(istenen - k.deger) * Math.min(Math.abs(istenen - k.deger), dt * 1.1);
    const t = k.deger * k.deger * (3 - 2 * k.deger); // yavaş başla, yavaş bitir
    // Geçişte kamera kısa bir yay çizer: önce biraz yükselir
    konum.current.lerpVectors(TEZGAH.konum, DUKKAN.konum, t);
    konum.current.y += Math.sin(t * Math.PI) * 0.8;
    hedef.current.lerpVectors(TEZGAH.hedef, DUKKAN.hedef, t);
    const oran = size.width / size.height;
    const fovTezgah = THREE.MathUtils.clamp(dikeyAci(TEZGAH.yatay, oran), 38, 64);
    const fovDukkan = THREE.MathUtils.clamp(dikeyAci(DUKKAN.yatay, oran), 22, 48);
    kamera.fov = THREE.MathUtils.lerp(fovTezgah, fovDukkan, t);
    kamera.position.copy(konum.current);
    kamera.lookAt(hedef.current);
    kamera.updateProjectionMatrix();
  });
  return null;
}

// Gün ilerledikçe güneş alçalır ve ışık akşamüstü sıcaklığına döner.
const OGLE = new THREE.Color('#fff4e2');
const AKSAM = new THREE.Color('#ffb36b');

function Isiklar() {
  const gunes = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const isik = gunes.current;
    if (!isik) return;
    const t = gunIlerleyisi();
    const aksam = THREE.MathUtils.smoothstep(t, 0.55, 1);
    isik.color.copy(OGLE).lerp(AKSAM, aksam);
    isik.intensity = 2.6 - aksam * 0.9;
    isik.position.set(6 - t * 10, 11 - aksam * 6, 5);
  });
  return (
    <>
      <hemisphereLight args={['#cfe6f7', renk.ahsapOrta, 0.9]} />
      <ambientLight intensity={0.25} color="#fff1df" />
      {/* Güneş: arkadan-sağdan, gölgeler tezgaha düşer */}
      <directionalLight
        ref={gunes}
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

// Telefon dik tutulunca oyun CSS ile 90° çevrilir (stil.css). Parmağın
// ekrandaki yerini çevrilmiş oyunun içindeki yere dönüştürür.
function ekrandanSahneye(x: number, y: number) {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return { x: y, y: window.innerWidth - x };
  }
  return { x, y };
}

function dokunmaOlaylari(store: Parameters<typeof events>[0]) {
  return {
    ...events(store),
    compute(olay: { clientX: number; clientY: number }, durum: RootState) {
      const { x, y } = ekrandanSahneye(olay.clientX, olay.clientY);
      durum.pointer.set((x / durum.size.width) * 2 - 1, -(y / durum.size.height) * 2 + 1);
      durum.raycaster.setFromCamera(durum.pointer, durum.camera);
    },
  };
}

export function Sahne() {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      // Çevrilmiş hâlde de doğru boyu ölçsün (döndürmeyi hesaba katmadan)
      resize={{ offsetSize: true }}
      events={dokunmaOlaylari}
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
      <KameraYoneticisi />
      <Isiklar />
      <Suspense fallback={null}>
        <Disari />
        <Dukkan />
        <Hazirlama />
        <Musteriler />
      </Suspense>
    </Canvas>
  );
}
