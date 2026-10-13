import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calismaSaatleri, durumuOku } from '../oyun/durum';
import { KAPI_X } from './Dukkan';
import { renk } from './renkler';

// Dükkânın sahibi (Kemal, 13 Ekim: "arada dükkânda gezsin"). Kanondaki kadın;
// adı ve görünüşü yok — buradaki görünüş GEÇİCİ (mor elbise, topuz saç),
// Kemal belirleyecek. Günde bir kez rastgele bir saatte iskeleden gelir,
// kapıdan girer, içeride ve terasta biraz dolaşır, gider. Başka bir şey yapmaz.

const ISKELE_Z = -4.3;
const ISKELE_UCU = 17;
const KAPI_DIS = new THREE.Vector3(KAPI_X, 0, -3.1);
const KAPI_IC = new THREE.Vector3(KAPI_X, 0, -2.1);

interface Nokta {
  yer: THREE.Vector3;
  bekle: number; // saniye
}

function gezintiYolu(donus: 1 | -1): Nokta[] {
  const n = (x: number, z: number, bekle = 0): Nokta => ({ yer: new THREE.Vector3(x, 0, z), bekle });
  return [
    { yer: KAPI_DIS, bekle: 0 },
    { yer: KAPI_IC, bekle: 0 },
    n(1.6, -2.15, 3.5), // dükkânın içinde, vitrinin yanında durur, bakar
    n(3.0, -1.95, 2.5),
    { yer: KAPI_IC, bekle: 0 },
    { yer: KAPI_DIS, bekle: 0 },
    n(1.2, -5.6, 3), // terasta denize bakar
    n(-5.5, -6.2, 2.5),
    n(donus * ISKELE_UCU, ISKELE_Z),
  ];
}

export function Sahip() {
  const ref = useRef<THREE.Group>(null);
  const icRef = useRef<THREE.Group>(null);
  // O günün ziyaret planı
  const plan = useRef<{ gun: number; dakika: number; yapildi: boolean }>({ gun: -1, dakika: 0, yapildi: false });
  const yol = useRef<Nokta[]>([]);
  const bekleme = useRef(0);
  const hedef = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    const g = ref.current;
    const ic = icRef.current;
    if (!g || !ic) return;
    const d = durumuOku();

    // Her gün için rastgele bir ziyaret saati (açılıştan 1,5 saat sonra ile kapanıştan 2 saat önce arası)
    if (plan.current.gun !== d.gun) {
      const uzunluk = calismaSaatleri(d).kapanis - calismaSaatleri(d).acilis;
      plan.current = { gun: d.gun, dakika: 90 + Math.random() * Math.max(30, uzunluk - 210), yapildi: false };
      yol.current = [];
      g.visible = false;
    }

    // Zamanı gelince iskelenin bir ucundan başlar
    if (!plan.current.yapildi && !d.hazirlik && !d.gunSonu && d.dakika >= plan.current.dakika) {
      plan.current.yapildi = true;
      const taraf: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const donus: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      g.position.set(taraf * ISKELE_UCU, 0, ISKELE_Z);
      yol.current = gezintiYolu(donus);
      bekleme.current = 0;
      g.visible = true;
    }

    if (!g.visible || yol.current.length === 0 || d.duraklatildi) return;

    const nokta = yol.current[0];
    hedef.copy(nokta.yer);
    const fark = hedef.clone().sub(g.position);
    const mesafe = fark.length();
    let yuruyor = false;
    if (mesafe > 0.05) {
      const disarida = g.position.z < -2.6 || Math.abs(g.position.x) > 4.2;
      const hiz = disarida ? 2.0 : 1.1;
      g.position.add(fark.clone().multiplyScalar(Math.min(1, (hiz * dt) / mesafe)));
      yuruyor = true;
      let aci = Math.atan2(fark.x, fark.z) - g.rotation.y;
      aci = Math.atan2(Math.sin(aci), Math.cos(aci));
      g.rotation.y += aci * Math.min(1, dt * 8);
    } else {
      bekleme.current += dt;
      if (bekleme.current >= nokta.bekle) {
        bekleme.current = 0;
        yol.current = yol.current.slice(1);
        if (yol.current.length === 0) g.visible = false; // iskeleden çıktı
      }
    }
    const t = clock.elapsedTime;
    ic.position.y = yuruyor ? Math.abs(Math.sin(t * 8)) * 0.035 : Math.sin(t * 1.5) * 0.005;
  });

  const ten = '#e3b08a';
  const sac = '#3a2a22';
  return (
    <group ref={ref} visible={false}>
      <group ref={icRef}>
        {/* Elbise */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.3, 0.9, 8]} />
          <meshStandardMaterial color={renk.mor} roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0, 1.13, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.17, 0.22, 8]} />
          <meshStandardMaterial color={renk.mor} roughness={0.8} flatShading />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]}>
            <boxGeometry args={[0.07, 0.2, 0.08]} />
            <meshStandardMaterial color={ten} roughness={0.8} />
          </mesh>
        ))}
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, 0.98, 0]} rotation={[0, 0, x > 0 ? 0.1 : -0.1]}>
            <boxGeometry args={[0.07, 0.48, 0.08]} />
            <meshStandardMaterial color={ten} roughness={0.8} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 1.43, 0]} castShadow>
          <icosahedronGeometry args={[0.13, 1]} />
          <meshStandardMaterial color={ten} roughness={0.8} flatShading />
        </mesh>
        {[-0.045, 0.045].map((x) => (
          <mesh key={x} position={[x, 1.45, 0.12]}>
            <sphereGeometry args={[0.015, 6, 4]} />
            <meshStandardMaterial color="#2a1d17" />
          </mesh>
        ))}
        <mesh position={[0, 1.48, -0.02]} scale={[1.08, 0.85, 1.08]}>
          <sphereGeometry args={[0.135, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={sac} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 1.6, -0.1]}>
          <icosahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color={sac} roughness={0.9} flatShading />
        </mesh>
        {/* Sarı eşarp: logo rengi */}
        <mesh position={[0, 1.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.03, 6, 12]} />
          <meshStandardMaterial color={renk.sari} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
