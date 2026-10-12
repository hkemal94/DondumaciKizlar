import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, ondekiMusteri, useDurum, type Musteri } from '../oyun/durum';
import { renk } from './renkler';

// Tezgah önünde sıraya giren müşteriler (iş sırası 3).
// Kodla çizilmiş geçici low-poly ada sakinleri; adları, hikâyeleri yok.
// Dört görünüm (belge 7.1 önerisi: 3–4 müşteri görünümü).

interface Gorunum {
  ten: string;
  ust: string;
  alt: string;
  sac: string;
  boy: number;
  sapka: boolean;
  uzunSac: boolean;
}

export const musteriGorunumleri: Gorunum[] = [
  { ten: '#e9b48f', ust: '#ffd25a', alt: '#d98a3d', sac: '#5a3825', boy: 1.0, sapka: true, uzunSac: true },
  { ten: '#c98e66', ust: '#5fa8d3', alt: '#3d4f6b', sac: '#2b211c', boy: 1.06, sapka: false, uzunSac: false },
  { ten: '#8d5a3b', ust: '#ef7a7a', alt: '#f2efe6', sac: '#1d1512', boy: 0.97, sapka: false, uzunSac: true },
  { ten: '#f1c9a5', ust: '#8fcf8a', alt: '#6c5a8e', sac: '#b8763e', boy: 1.03, sapka: true, uzunSac: false },
];

// Sıradaki yerler: öndeki tezgahın ortasında, diğerleri sola doğru dizilir.
const ON_YER = new THREE.Vector3(0, 0, -1.62);
const GIRIS = new THREE.Vector3(-4.3, 0, -1.95);
const CIKIS = new THREE.Vector3(4.3, 0, -1.75);

function siraYeri(sira: number, hedef: THREE.Vector3) {
  if (sira === 0) return hedef.copy(ON_YER);
  return hedef.set(-0.82 * sira, 0, -1.85 - 0.04 * sira);
}

function Govde({ g }: { g: Gorunum }) {
  const kafa = useMemo(() => new THREE.IcosahedronGeometry(0.13, 1), []);
  return (
    <group scale={g.boy}>
      {/* Bacaklar */}
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.38, 0]} castShadow>
          <boxGeometry args={[0.11, 0.76, 0.13]} />
          <meshStandardMaterial color={g.alt} roughness={0.85} flatShading />
        </mesh>
      ))}
      {/* Gövde */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.21, 0.56, 7]} />
        <meshStandardMaterial color={g.ust} roughness={0.85} flatShading />
      </mesh>
      {/* Kollar */}
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} position={[x, 0.98, 0]} rotation={[0, 0, x > 0 ? 0.12 : -0.12]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.09]} />
          <meshStandardMaterial color={g.ten} roughness={0.8} flatShading />
        </mesh>
      ))}
      {/* Baş */}
      <mesh geometry={kafa} position={[0, 1.45, 0]} castShadow>
        <meshStandardMaterial color={g.ten} roughness={0.8} flatShading />
      </mesh>
      {/* Gözler */}
      {[-0.045, 0.045].map((x) => (
        <mesh key={x} position={[x, 1.47, 0.12]}>
          <sphereGeometry args={[0.015, 6, 4]} />
          <meshStandardMaterial color="#2a1d17" />
        </mesh>
      ))}
      {/* Saç */}
      <mesh position={[0, 1.5, -0.02]} scale={[1.08, 0.85, 1.08]}>
        <sphereGeometry args={[0.135, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={g.sac} roughness={0.9} flatShading />
      </mesh>
      {g.uzunSac && (
        <mesh position={[0, 1.36, -0.08]}>
          <boxGeometry args={[0.27, 0.3, 0.1]} />
          <meshStandardMaterial color={g.sac} roughness={0.9} flatShading />
        </mesh>
      )}
      {/* Hasır şapka */}
      {g.sapka && (
        <group position={[0, 1.57, 0]}>
          <mesh>
            <cylinderGeometry args={[0.27, 0.27, 0.02, 10]} />
            <meshStandardMaterial color="#e3c58a" roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.11, 10]} />
            <meshStandardMaterial color="#e3c58a" roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.142, 0.142, 0.03, 10]} />
            <meshStandardMaterial color={renk.mor} roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function TekMusteri({ musteri }: { musteri: Musteri }) {
  const ref = useRef<THREE.Group>(null);
  const icRef = useRef<THREE.Group>(null);
  const hedef = useMemo(() => new THREE.Vector3(), []);
  const g = musteriGorunumleri[musteri.gorunum % musteriGorunumleri.length];

  useFrame(({ clock }, dt) => {
    const grup = ref.current;
    const ic = icRef.current;
    if (!grup || !ic) return;
    const d = durumuOku();
    const m = d.musteriler.find((x) => x.id === musteri.id);
    if (!m) return;

    if (m.hal === 'gidiyor') hedef.copy(CIKIS);
    else {
      const sira = d.musteriler.filter((x) => x.hal === 'sirada').findIndex((x) => x.id === m.id);
      siraYeri(sira, hedef);
    }

    // Yürüyüş: hedefe sabit hızla, yürürken hafifçe zıplar ve döner
    const fark = hedef.clone().sub(grup.position);
    const mesafe = fark.length();
    const hiz = 1.3;
    const yuruyor = mesafe > 0.02;
    if (yuruyor) grup.position.add(fark.multiplyScalar(Math.min(1, (hiz * dt) / mesafe)));
    const bakis = yuruyor && Math.abs(hedef.x - grup.position.x) > 0.05 ? Math.sign(hedef.x - grup.position.x) * (Math.PI / 2) : 0;
    grup.rotation.y = THREE.MathUtils.damp(grup.rotation.y, bakis, 8, dt);

    const t = clock.elapsedTime + musteri.id;
    const ziplama = yuruyor ? Math.abs(Math.sin(t * 9)) * 0.04 : Math.sin(t * 1.6) * 0.006;
    // Mutlu giden müşteri bir kez sevinçle zıplar
    const sevinc = m.mutlu && m.hal === 'gidiyor' && grup.position.x < 0.6 ? Math.abs(Math.sin(t * 7)) * 0.08 : 0;
    ic.position.y = ziplama + sevinc;
  });

  return (
    <group ref={ref} name={`musteri-${musteri.id}`} position={GIRIS.toArray()}>
      <group ref={icRef}>
        <Govde g={g} />
      </group>
    </group>
  );
}

// Sipariş balonunun ekrandaki yeri: öndeki müşterinin başının üstü.
// Arayüz balon öğesini buraya bağlar; sahne her karede yerini günceller.
export const balon: { oge: HTMLDivElement | null } = { oge: null };

function BalonTakibi() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size, scene }) => {
    const oge = balon.oge;
    if (!oge) return;
    const m = ondekiMusteri(durumuOku());
    const nesne = m ? scene.getObjectByName(`musteri-${m.id}`) : undefined;
    if (!m || !nesne) {
      oge.style.opacity = '0';
      return;
    }
    nesne.getWorldPosition(v);
    // Yalnız yerine varınca göster
    const vardi = v.distanceTo(ON_YER) < 0.15;
    // Başın sağ üstü (taslak 2'deki gibi)
    v.x += 0.42;
    v.y += 1.68 * musteriGorunumleri[m.gorunum % musteriGorunumleri.length].boy;
    v.project(camera);
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((1 - v.y) / 2) * size.height;
    oge.style.transform = `translate(${x}px, ${y}px)`;
    oge.style.opacity = vardi ? '1' : '0';
  });
  return null;
}

export function Musteriler() {
  const { musteriler } = useDurum();
  return (
    <group>
      {musteriler.map((m) => (
        <TekMusteri key={m.id} musteri={m} />
      ))}
      <BalonTakibi />
    </group>
  );
}
