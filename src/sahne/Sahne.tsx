import { Suspense, useLayoutEffect } from 'react';
import { Canvas, events, useFrame, useThree, type RootState } from '@react-three/fiber';
import { useRef } from 'react';
import { durumuOku, saatDakikasi } from '../oyun/durum';
import { gezmeSaati, gokRenkleri } from './gokRenkleri';
import * as THREE from 'three';
import { Disari } from './Disari';
import { dukkanDonusu, dukkanKaydirma, dukkanYakinligi, fotograf, kameraKarisimi, odak } from './kameraKarisimi';
import { Calisan } from './Calisan';
import { Sahip } from './Sahip';
import { Dukkan } from './Dukkan';
import { Hazirlama } from './Hazirlama';
import { Musteriler } from './Musteriler';
import { EgitimTakibi } from './EgitimTakibi';
import { Dekorlar } from './Dekorlar';
import { renk } from './renkler';

// İki sabit kamera (belge bölüm 0): dükkânın genel görünümü ve tezgahın
// arkasından yakın plan. Aralarında yumuşak geçiş; oyuncu yürümez.
// Ekran ne kadar geniş ya da dar olursa olsun yatayda aşağı yukarı aynı
// alanı göstersin diye görüş açısı ekran oranına göre ayarlanır.
const TEZGAH = { konum: new THREE.Vector3(0, 1.95, 1.5), hedef: new THREE.Vector3(0, 0.9, -4), yatay: 80 };
// Genel görünüm dükkânın önünden (deniz / müşteri tarafı) çeker (Kemal, 13 Ekim)
// Çalışanı kişiselleştirirken: müşteri tarafından ona yakından bakış (sağda panel olduğu için çalışan solda)
const CALISAN_ODAGI = { konum: new THREE.Vector3(-0.6, 1.65, -2.15), hedef: new THREE.Vector3(-0.68, 1.05, 0.75) };

const DUKKAN = { konum: new THREE.Vector3(-13.5, 15.5, -20), hedef: new THREE.Vector3(-0.4, 0.2, -1.6), yatay: 50 };


function dikeyAci(yatayDerece: number, oran: number) {
  const yatay = THREE.MathUtils.degToRad(yatayDerece);
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(yatay / 2) / oran));
}

// Fotoğraf çekmek için o anki görüntüyü verir
function FotografMakinesi() {
  const { gl, scene, camera } = useThree();
  useLayoutEffect(() => {
    fotograf.cek = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/jpeg', 0.9);
    };
    return () => {
      fotograf.cek = null;
    };
  }, [gl, scene, camera]);
  return null;
}

function KameraYoneticisi() {
  const { camera, size } = useThree();
  const hedef = useRef(new THREE.Vector3());
  const konum = useRef(new THREE.Vector3());
  const dukkanKonumu = useRef(new THREE.Vector3());
  const yakinlik = useRef(dukkanYakinligi.deger);
  const donus = useRef(0);
  const odakKarisimi = useRef(0);
  const kayma = useRef(new THREE.Vector3());
  const dukkanHedefi = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const kamera = camera as THREE.PerspectiveCamera;
    const istenen = durumuOku().kamera === 'dukkan' ? 1 : 0;
    // Yaklaşık bir saniyelik yumuşak geçiş
    const k = kameraKarisimi;
    k.deger += Math.sign(istenen - k.deger) * Math.min(Math.abs(istenen - k.deger), dt * 1.1);
    const t = k.deger * k.deger * (3 - 2 * k.deger); // yavaş başla, yavaş bitir
    // Geçişte kamera kısa bir yay çizer: önce biraz yükselir
    // Yakınlaştırma: hedefe doğru yaklaşıp uzaklaşır, yumuşakça
    yakinlik.current = THREE.MathUtils.damp(yakinlik.current, dukkanYakinligi.deger, 10, dt);
    // Gezerken oyuncu dükkânın çevresinde döner; gezme bitince önden görünüme döner
    const d = durumuOku();
    if (!d.gezme) dukkanDonusu.deger = 0;
    donus.current = THREE.MathUtils.damp(donus.current, dukkanDonusu.deger, 8, dt);
    dukkanKonumu.current
      .copy(DUKKAN.konum)
      .sub(DUKKAN.hedef)
      .multiplyScalar(yakinlik.current)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), donus.current)
      .add(DUKKAN.hedef);
    // Kaydırma: bakılan nokta ve kamera birlikte kayar, açı değişmez
    kayma.current.x = THREE.MathUtils.damp(kayma.current.x, dukkanKaydirma.x, 12, dt);
    kayma.current.z = THREE.MathUtils.damp(kayma.current.z, dukkanKaydirma.z, 12, dt);
    dukkanKonumu.current.add(kayma.current);
    dukkanHedefi.current.copy(DUKKAN.hedef).add(kayma.current);
    konum.current.lerpVectors(TEZGAH.konum, dukkanKonumu.current, t);
    konum.current.y += Math.sin(t * Math.PI) * 0.8;
    hedef.current.lerpVectors(TEZGAH.hedef, dukkanHedefi.current, t);
    const oran = size.width / size.height;
    const fovTezgah = THREE.MathUtils.clamp(dikeyAci(TEZGAH.yatay, oran), 38, 64);
    const fovDukkan = THREE.MathUtils.clamp(dikeyAci(DUKKAN.yatay, oran), 22, 48);
    kamera.fov = THREE.MathUtils.lerp(fovTezgah, fovDukkan, t);
    // Çalışan ekranı açıksa kamera çalışana yaklaşır
    odakKarisimi.current = THREE.MathUtils.damp(odakKarisimi.current, odak.calisan ? 1 : 0, 5, dt);
    const o = odakKarisimi.current;
    if (o > 0.001) {
      konum.current.lerp(CALISAN_ODAGI.konum, o);
      hedef.current.lerp(CALISAN_ODAGI.hedef, o);
      kamera.fov = THREE.MathUtils.lerp(kamera.fov, 40, o);
    }
    kamera.position.copy(konum.current);
    kamera.lookAt(hedef.current);
    kamera.updateProjectionMatrix();
  });
  return null;
}

// Işık saate göre (yaz akşamı, Ege): öğleden sonra güneş alçalır,
// 19:30–20:30 gün batımı, sonra gece. Gece dükkânın içi ve ampuller öne çıkar.
const OGLE = new THREE.Color('#fff4e2');
const AKSAM = new THREE.Color('#ff9a5a');
const GOK_UST_GUNDUZ = new THREE.Color(renk.gokUst);
const GOK_UFUK_GUNDUZ = new THREE.Color(renk.gokUfuk);
const GOK_UFUK_BATIM = new THREE.Color('#ffb07a');
const GOK_UST_GECE = new THREE.Color('#0f1a3d');
const GOK_UFUK_GECE = new THREE.Color('#2c3566');

function Isiklar() {
  const gunes = useRef<THREE.DirectionalLight>(null);
  const yarimKure = useRef<THREE.HemisphereLight>(null);
  const icIsik = useRef<THREE.PointLight>(null);
  const { scene } = useThree();
  useFrame(() => {
    const isik = gunes.current;
    if (!isik) return;
    const d = durumuOku();
    // Gezerken gece / gündüz düğmesi ışığın saatini seçebilir
    const secilen = d.gezme ? gezmeSaati() : null;
    const saat = secilen ?? saatDakikasi(d) / 60;
    const aksam = THREE.MathUtils.smoothstep(saat, 16.5, 20); // güneş alçalır, turuncuya döner
    const gece = THREE.MathUtils.smoothstep(saat, 20, 21.5); // gök kararır
    const batim = aksam * (1 - gece);

    isik.color.copy(OGLE).lerp(AKSAM, aksam);
    isik.intensity = (2.6 - aksam * 1.2) * (1 - gece) + gece * 0.25;
    isik.position.set(6 - aksam * 12, 11 - aksam * 7 + gece * 6, 5);
    if (yarimKure.current) yarimKure.current.intensity = 0.9 - gece * 0.55;
    if (icIsik.current) icIsik.current.intensity = 2.5 + gece * 3;

    gokRenkleri.ust.copy(GOK_UST_GUNDUZ).lerp(GOK_UST_GECE, gece);
    gokRenkleri.ufuk.copy(GOK_UFUK_GUNDUZ).lerp(GOK_UFUK_BATIM, batim).lerp(GOK_UFUK_GECE, gece);
    if (scene.background instanceof THREE.Color) scene.background.copy(gokRenkleri.ufuk);
    if (scene.fog) scene.fog.color.copy(gokRenkleri.ufuk);
  });
  return (
    <>
      <hemisphereLight ref={yarimKure} args={['#cfe6f7', renk.ahsapOrta, 0.9]} />
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
      <pointLight ref={icIsik} position={[0, 2.8, 0.2]} intensity={2.5} distance={7} color="#ffd9a8" />
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
      <FotografMakinesi />
      <Isiklar />
      <Suspense fallback={null}>
        <Disari />
        <Dukkan />
        <Hazirlama />
        <Musteriler />
        <EgitimTakibi />
        <Dekorlar />
        <Calisan />
        <Sahip />
      </Suspense>
    </Canvas>
  );
}
