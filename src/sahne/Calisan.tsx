import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, useDurum } from '../oyun/durum';
import { ONLUKLER, SAC_RENKLERI, TENLER, type CalisanGorunumu, type Onluk } from '../oyun/calisan';
import { kameraKarisimi, odak } from './kameraKarisimi';
import { renk } from './renkler';

// Tezgahın arkasındaki çalışan (Kemal, 13 Ekim). Genel görünümde görünür;
// tezgah görünümünde kamera onun yerinde olduğu için gizlenir.
// Kodla çizilmiş geçici model.

export const CALISAN_YERI = new THREE.Vector3(0, 0, 0.75);

// Önlük deseni: düz, çizgili ya da puantiyeli doku
function onlukDokusu(o: Onluk) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = o.renk;
  g.fillRect(0, 0, 64, 64);
  if (o.desen === 'cizgili' && o.ikinciRenk) {
    g.fillStyle = o.ikinciRenk;
    for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 8, 64);
  } else if (o.desen === 'puantiye' && o.ikinciRenk) {
    g.fillStyle = o.ikinciRenk;
    for (let y = 6; y < 64; y += 16)
      for (let x = (y / 16) % 2 ? 14 : 6; x < 64; x += 16) {
        g.beginPath();
        g.arc(x, y, 3.5, 0, Math.PI * 2);
        g.fill();
      }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Sac({ g }: { g: CalisanGorunumu }) {
  const r = SAC_RENKLERI[g.sacRengi];
  const malzeme = <meshStandardMaterial color={r} roughness={0.9} flatShading />;
  return (
    <group position={[0, 1.45, 0]}>
      {g.sac !== 'kivircik' && (
        <mesh position={[0, 0.05, -0.02]} scale={[1.08, 0.85, 1.08]}>
          <sphereGeometry args={[0.135, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {malzeme}
        </mesh>
      )}
      {g.sac === 'uzun' && (
        <mesh position={[0, -0.12, -0.08]}>
          <boxGeometry args={[0.27, 0.34, 0.1]} />
          {malzeme}
        </mesh>
      )}
      {g.sac === 'topuz' && (
        <mesh position={[0, 0.13, -0.08]}>
          <icosahedronGeometry args={[0.075, 0]} />
          {malzeme}
        </mesh>
      )}
      {g.sac === 'kivircik' &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.11, 0.06 + (i % 2) * 0.03, Math.sin(a) * 0.11 - 0.02]}>
              <icosahedronGeometry args={[0.065, 0]} />
              {malzeme}
            </mesh>
          );
        })}
    </group>
  );
}

function Aksesuarlar({ g }: { g: CalisanGorunumu }) {
  return (
    <group position={[0, 1.45, 0]}>
      {g.aksesuarlar.includes('bandana') && (
        <mesh position={[0, 0.09, 0]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.142, 0.142, 0.06, 10, 1, true]} />
          <meshStandardMaterial color="#e8574f" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
      {g.aksesuarlar.includes('kasket') && (
        <group position={[0, 0.12, 0]}>
          <mesh>
            <sphereGeometry args={[0.145, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={renk.mor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.0, 0.14]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.2, 0.015, 0.12]} />
            <meshStandardMaterial color={renk.sari} roughness={0.8} />
          </mesh>
        </group>
      )}
      {g.aksesuarlar.includes('gozluk') && (
        <group position={[0, 0.02, 0.125]}>
          {[-0.045, 0.045].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <torusGeometry args={[0.03, 0.006, 6, 12]} />
              <meshStandardMaterial color="#2a1d17" />
            </mesh>
          ))}
          <mesh>
            <boxGeometry args={[0.03, 0.006, 0.006]} />
            <meshStandardMaterial color="#2a1d17" />
          </mesh>
        </group>
      )}
      {g.aksesuarlar.includes('kupe') &&
        [-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, -0.06, 0]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshStandardMaterial color="#f2c14e" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
    </group>
  );
}

// Adın ekrandaki yeri: başının üstü (arayüz öğeyi buraya bağlar)
export const calisanEtiketi: { oge: HTMLDivElement | null } = { oge: null };

export function Calisan() {
  const { calisan } = useDurum();
  const ref = useRef<THREE.Group>(null);
  const icRef = useRef<THREE.Group>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  const onluk = ONLUKLER.find((o) => o.id === calisan.onluk) ?? ONLUKLER[0];
  const doku = useMemo(() => onlukDokusu(onluk), [onluk]);
  const ten = TENLER[calisan.ten];

  useFrame(({ clock, camera, size }, dt) => {
    const g = ref.current;
    if (!g || !icRef.current) return;
    g.visible = kameraKarisimi.deger > 0.12;
    const d = durumuOku();
    // Hafif nefes; kepçe dalarken öne eğilir
    const egil = d.asama === 'dolduruyor' ? 0.12 : 0;
    icRef.current.rotation.x = THREE.MathUtils.damp(icRef.current.rotation.x, egil, 6, dt);
    icRef.current.position.y = Math.sin(clock.elapsedTime * 1.4) * 0.006;

    const etiket = calisanEtiketi.oge;
    if (etiket) {
      v.set(CALISAN_YERI.x, 1.85, CALISAN_YERI.z).project(camera);
      etiket.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      etiket.style.opacity = g.visible && d.calisan.ad && !odak.calisan ? '1' : '0';
    }
  });

  return (
    <group ref={ref} position={CALISAN_YERI.toArray()} rotation={[0, Math.PI, 0]}>
      <group ref={icRef}>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.38, 0]} castShadow>
            <boxGeometry args={[0.11, 0.76, 0.13]} />
            <meshStandardMaterial color="#3d4f6b" roughness={0.85} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 1.02, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.21, 0.56, 7]} />
          <meshStandardMaterial color="#f6ecd6" roughness={0.85} flatShading />
        </mesh>
        {/* Önlük: gövdenin önünde, dizlere kadar */}
        <mesh position={[0, 0.82, 0.18]}>
          <boxGeometry args={[0.3, 0.72, 0.02]} />
          <meshStandardMaterial map={doku} roughness={0.85} />
        </mesh>
        {[-0.24, 0.24].map((x) => (
          <mesh key={x} position={[x, 0.98, 0]} rotation={[0, 0, x > 0 ? 0.12 : -0.12]} castShadow>
            <boxGeometry args={[0.08, 0.5, 0.09]} />
            <meshStandardMaterial color={ten} roughness={0.8} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 1.45, 0]} castShadow>
          <icosahedronGeometry args={[0.13, 1]} />
          <meshStandardMaterial color={ten} roughness={0.8} flatShading />
        </mesh>
        {[-0.045, 0.045].map((x) => (
          <mesh key={x} position={[x, 1.47, 0.12]}>
            <sphereGeometry args={[0.015, 6, 4]} />
            <meshStandardMaterial color="#2a1d17" />
          </mesh>
        ))}
        <Sac g={calisan} />
        <Aksesuarlar g={calisan} />
      </group>
    </group>
  );
}
