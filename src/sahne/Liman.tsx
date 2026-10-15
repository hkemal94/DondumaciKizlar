import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { renk } from './renkler';
import { HazirModel } from './HazirModel';
import { SaydamEngel } from './SaydamEngel';

// Liman (belge 0.10; Kemal, 14 Ekim gece): Kemal'in KKM "2D · kur"
// haritasından ölçülüp oyunun yönüne çevrildi. Dükkânın önü denize bakar
// (−z); sağ (+x) kuzeydoğu, kıyı boyunca. Gerçek ölçü (metre):
//  - dükkânla su arası kumsal, terastan iskeleye ahşap yol,
//  - T iskele dükkânın tam önünden ~100 m, ucunda ~45 m T başı,
//  - mendirek ~400 m'lik yay, ~250 m açıkta; liman girişi solda,
//  - sağda kumsalda Liman İdare Binası ve Liman Deposu,
//  - arkada araba yolu ve sokaklı mahalle.
// Uzaktaki şeyler sade (Kemal: "belli bir yerden sonra iki boyutlu çizebilirsin").

const SU_KENARI = -26;
// Kıyı sağda denize doğru kıvrılır (haritada mendireğin kökü kıyıda)
const KIYI: [number, number][] = [
  [-500, SU_KENARI],
  [80, SU_KENARI],
  [150, -42],
  [200, -78],
  [240, -104],
  [300, -118],
  [500, -125],
];
export function kiyiZ(x: number) {
  for (let i = 1; i < KIYI.length; i++) {
    const [x0, z0] = KIYI[i - 1];
    const [x1, z1] = KIYI[i];
    if (x <= x1) return z0 + ((x - x0) / (x1 - x0)) * (z1 - z0);
  }
  return KIYI[KIYI.length - 1][1];
}

const TERAS_ONU = -8.6;
const YOL_ON = 15; // araba yolunun ön kenarı
const YOL_ENI = 7;
const MAHALLE_BASI = YOL_ON + YOL_ENI + 4;
export const ISKELE_ENI = 4;
const ISKELE_UCU = -127;
const T_ENI = 44;
const T_DERINLIGI = 7;

// ---- Zemin: kumsal suya doğru alçalır (ıslak kum suyun altına girer) ----
function Kumsal() {
  const geometri = useMemo(() => {
    const xs: number[] = [];
    for (let x = -500; x <= 500; x += 10) xs.push(x);
    // Her x için üç nokta: yol önü, su kenarının biraz gerisi, suyun içi
    const sira = (x: number) => [
      [x, -0.06, YOL_ON],
      [x, -0.3, kiyiZ(x) + 1.5],
      // Su kenarında dik iner: dalgalar kıyıyı tırtıklı göstermesin
      [x, -2.4, kiyiZ(x) - 2],
    ];
    const konum: number[] = [];
    const renkler: number[] = [];
    const kuru = new THREE.Color(renk.kum);
    const islak = new THREE.Color(renk.kaya);
    for (const x of xs) {
      for (const [i, n] of sira(x).entries()) {
        konum.push(n[0], n[1], n[2]);
        const c = i === 0 ? kuru : i === 1 ? kuru.clone().lerp(islak, 0.3) : islak;
        renkler.push(c.r, c.g, c.b);
      }
    }
    const indis: number[] = [];
    for (let i = 0; i < xs.length - 1; i++)
      for (let j = 0; j < 2; j++) {
        const a = i * 3 + j,
          b = (i + 1) * 3 + j;
        indis.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(renkler, 3));
    g.setIndex(indis);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometri} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ---- Araba yolu ve mahallenin zemini ----
function YolVeZemin() {
  return (
    <group>
      {/* Mahallenin zemini */}
      <mesh position={[0, -0.08, (YOL_ON + 420) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 420 - YOL_ON]} />
        <meshStandardMaterial color={renk.duvar} roughness={1} />
      </mesh>
      {/* Araba yolu ve iki yanında kaldırım */}
      <mesh position={[0, -0.03, YOL_ON + YOL_ENI / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, YOL_ENI]} />
        <meshStandardMaterial color="#9c9184" roughness={1} />
      </mesh>
      {[YOL_ON - 0.6, YOL_ON + YOL_ENI + 0.6].map((z) => (
        <mesh key={z} position={[0, 0.02, z]} receiveShadow>
          <boxGeometry args={[1000, 0.14, 1.2]} />
          <meshStandardMaterial color={renk.kaya} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// ---- T iskele: terastan kumsal üstünden suya, sonra ~100 m açığa ----
function TIskele() {
  const direkler = useMemo(() => {
    const d: [number, number][] = [];
    for (let z = SU_KENARI; z >= ISKELE_UCU; z -= 4) for (const x of [-ISKELE_ENI / 2 + 0.3, ISKELE_ENI / 2 - 0.3]) d.push([x, z]);
    for (let x = -T_ENI / 2 + 1; x <= T_ENI / 2 - 1; x += 4) for (const dz of [0.4, T_DERINLIGI - 0.4]) d.push([x, ISKELE_UCU - dz]);
    return d;
  }, []);
  const boy = TERAS_ONU - ISKELE_UCU;
  return (
    <group>
      {/* Kumsaldaki ahşap yol ve iskelenin gövdesi tek parça */}
      <mesh position={[0, 0.1, (TERAS_ONU + ISKELE_UCU) / 2]} castShadow receiveShadow>
        <boxGeometry args={[ISKELE_ENI, 0.22, boy]} />
        <meshStandardMaterial color={renk.ahsapAcik} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.1, ISKELE_UCU - T_DERINLIGI / 2]} castShadow receiveShadow>
        <boxGeometry args={[T_ENI, 0.22, T_DERINLIGI]} />
        <meshStandardMaterial color={renk.ahsapAcik} roughness={0.85} />
      </mesh>
      {/* Kenar kirişleri */}
      {[-1, 1].map((y) => (
        <mesh key={y} position={[(y * ISKELE_ENI) / 2, 0.02, (SU_KENARI + ISKELE_UCU) / 2]}>
          <boxGeometry args={[0.25, 0.3, SU_KENARI - ISKELE_UCU]} />
          <meshStandardMaterial color={renk.ahsapKoyu} />
        </mesh>
      ))}
      {direkler.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, -0.9, z]}>
          <cylinderGeometry args={[0.16, 0.2, 2.2, 6]} />
          <meshStandardMaterial color={renk.ahsapKoyu} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ---- Mendirek: taş yay; sağda kıyıdan başlar, solda açık biter ----
const MENDIREK: [number, number][] = [
  [239, -95],
  [227, -142],
  [209, -176],
  [183, -206],
  [149, -233],
  [101, -248],
  [39, -248],
  [-11, -242],
  [-49, -236],
  [-85, -223],
  [-120, -208],
];
const MENDIREK_ENI = 8;
function Mendirek() {
  const parcalar = useMemo(
    () =>
      MENDIREK.slice(1).map(([x1, z1], i) => {
        const [x0, z0] = MENDIREK[i];
        const boy = Math.hypot(x1 - x0, z1 - z0);
        return { x: (x0 + x1) / 2, z: (z0 + z1) / 2, boy, aci: Math.atan2(x1 - x0, z1 - z0) };
      }),
    [],
  );
  return (
    <group>
      {parcalar.map((p, i) => (
        <mesh key={i} position={[p.x, -0.2, p.z]} rotation={[0, p.aci, 0]}>
          <boxGeometry args={[MENDIREK_ENI, 2.6, p.boy + 1]} />
          <meshStandardMaterial color={renk.kaya} roughness={1} flatShading />
        </mesh>
      ))}
      {MENDIREK.map(([x, z], i) => (
        <mesh key={`e${i}`} position={[x, -0.2, z]}>
          <cylinderGeometry args={[MENDIREK_ENI / 2, MENDIREK_ENI / 2 + 0.5, 2.6, 8]} />
          <meshStandardMaterial color={renk.kaya} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ---- Kumsaldaki liman yapıları (adları KKM'de; burada tabelasız) ----
function LimanYapilari() {
  return (
    <group>
      {/* Liman İdare Binası: üç katlı */}
      <HazirModel yol="binalar/building-f" ayar={{ grup: 'liman', yukseklik: 11 }} konum={[159, 0, -15]} donus={Math.PI} />
      {/* Liman Deposu: alçak, uzun, kiremit çatılı */}
      <group position={[207, 0, -61]}>
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[24, 6.4, 13]} />
          <meshStandardMaterial color={renk.duvar} roughness={0.95} />
        </mesh>
        <mesh position={[0, 7.2, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 1]} castShadow>
          <coneGeometry args={[14, 3.2, 4]} />
          <meshStandardMaterial color={renk.kiremit} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 2.2, -6.55]}>
          <boxGeometry args={[6, 4.4, 0.2]} />
          <meshStandardMaterial color={renk.ahsapOrta} />
        </mesh>
      </group>
    </group>
  );
}

// ---- Mahalle: sokaklar ve alçak evler (uzakta sade; tek çizimde yüzlerce ev) ----
const DUVAR_RENKLERI = [renk.duvar, renk.krem, renk.pembeSiva, renk.tekneGovde, renk.kum];
function Mahalle() {
  const { evler, catilar, bahceler } = useMemo(() => {
    let s = 7;
    const r = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    const ev: { x: number; z: number; en: number; der: number; boy: number; renk: string; don: number }[] = [];
    const bahce: { x: number; z: number; en: number; der: number }[] = [];
    // Kıyıya paralel sokaklar 34 m'de bir, dik sokaklar 44 m'de bir; araları iki sıra ev
    for (let z0 = MAHALLE_BASI; z0 < 300; z0 += 34) {
      for (let x0 = -420; x0 < 420; x0 += 44) {
        for (const sira of [0, 1]) {
          for (let k = 0; k < 3; k++) {
            if (r() < 0.12) continue;
            // Ön sıranın ortası ayrıntılı binaların yeri
            if (z0 === MAHALLE_BASI && sira === 0 && Math.abs(x0 + 4 + k * 12.5) < 48) continue;
            const en = 7 + r() * 3;
            const der = 7 + r() * 2;
            const x = x0 + 4 + k * 12.5 + en / 2;
            const z = z0 + (sira ? 26 - der / 2 : 3 + der / 2);
            ev.push({ x, z, en, der, boy: r() < 0.4 ? 6.8 : 3.8, renk: DUVAR_RENKLERI[Math.floor(r() * DUVAR_RENKLERI.length)], don: (r() - 0.5) * 0.08 });
            if (r() < 0.5) bahce.push({ x, z: z + (sira ? -der / 2 - 2.5 : der / 2 + 2.5), en: en + 1, der: 4 });
          }
        }
      }
    }
    const kutu = new THREE.BoxGeometry(1, 1, 1);
    kutu.translate(0, 0.5, 0);
    const evMesh = new THREE.InstancedMesh(kutu, new THREE.MeshStandardMaterial({ roughness: 0.95 }), ev.length);
    const cati = new THREE.ConeGeometry(0.75, 1, 4);
    cati.rotateY(Math.PI / 4);
    cati.translate(0, 0.5, 0);
    const catiMesh = new THREE.InstancedMesh(cati, new THREE.MeshStandardMaterial({ color: renk.kiremit, roughness: 0.9, flatShading: true }), ev.length);
    const bahceMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.1, 1), new THREE.MeshStandardMaterial({ color: renk.tepe, roughness: 1 }), bahce.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    ev.forEach((e, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), e.don);
      m.compose(new THREE.Vector3(e.x, 0, e.z), q, new THREE.Vector3(e.en, e.boy, e.der));
      evMesh.setMatrixAt(i, m);
      evMesh.setColorAt(i, c.set(e.renk));
      m.compose(new THREE.Vector3(e.x, e.boy, e.z), q, new THREE.Vector3(e.en * 1.02, 2.2, e.der * 1.02));
      catiMesh.setMatrixAt(i, m);
    });
    bahce.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, -0.02, b.z), new THREE.Quaternion(), new THREE.Vector3(b.en, 1, b.der));
      bahceMesh.setMatrixAt(i, m);
    });
    for (const im of [evMesh, catiMesh]) {
      im.castShadow = false;
      im.receiveShadow = true;
    }
    return { evler: evMesh, catilar: catiMesh, bahceler: bahceMesh };
  }, []);
  return (
    <group>
      <primitive object={evler} />
      <primitive object={catilar} />
      <primitive object={bahceler} />
      {/* Sokaklar: kıyıya paralel ve dik */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`p${i}`} position={[0, -0.05, MAHALLE_BASI + i * 34 - 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1000, 4]} />
          <meshStandardMaterial color={renk.kaya} roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`d${i}`} position={[-420 + i * 44 + 1, -0.05, (MAHALLE_BASI + 300) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 300 - MAHALLE_BASI]} />
          <meshStandardMaterial color={renk.kaya} roughness={1} />
        </mesh>
      ))}
      {/* Yolun hemen arkasındaki ön sıra: ayrıntılı binalar */}
      {[
        ['binalar/building-c', -26, 7],
        ['binalar/building-f', 2, 8.5],
        ['binalar/building-c', 30, 7],
      ].map(([yol, x, boy]) => (
        // Kamerayla dükkân arasına girerse yarı saydam (Kemal, 15 Ekim)
        <SaydamEngel key={String(x)}>
          <HazirModel yol={String(yol)} ayar={{ grup: 'liman', yukseklik: Number(boy), boya: [['#6e7390', renk.pembeSiva, 24]] }} konum={[Number(x), 0, MAHALLE_BASI + 6]} donus={Math.PI} />
        </SaydamEngel>
      ))}
    </group>
  );
}

// ---- Tekneler: limanın içinde, iskeleye bağlı; biri girişten girip çıkar ----
function Tekne({ yol, konum, en, donus = 0, faz = 0 }: { yol: string; konum: [number, number, number]; en: number; donus?: number; faz?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + faz;
    ref.current.position.y = konum[1] + Math.sin(t * 1.1) * 0.08;
    ref.current.rotation.z = Math.sin(t * 0.9) * 0.04;
  });
  return (
    <group ref={ref} position={konum}>
      <HazirModel yol={yol} ayar={{ grup: 'liman', en }} donus={donus} />
    </group>
  );
}

// Girişten iskeleye gelip bekleyen, sonra geri dönen tekne
const GEZINTI: [number, number][] = [
  [-200, -215],
  [-120, -185],
  [-50, -150],
  [-14, -110],
];
const GEZINTI_SURESI = 160; // saniye: gidiş + bekleme + dönüş
function GezenTekne() {
  const ref = useRef<THREE.Group>(null);
  const boylar = useMemo(() => GEZINTI.slice(1).map(([x, z], i) => Math.hypot(x - GEZINTI[i][0], z - GEZINTI[i][1])), []);
  const toplam = boylar.reduce((a, b) => a + b, 0);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = (clock.elapsedTime % GEZINTI_SURESI) / GEZINTI_SURESI;
    // 0–0,4 gelir, 0,4–0,6 bekler, 0,6–1 döner
    const ilerleme = t < 0.4 ? t / 0.4 : t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    let kalan = ilerleme * toplam;
    let i = 0;
    while (i < boylar.length - 1 && kalan > boylar[i]) kalan -= boylar[i++];
    const [x0, z0] = GEZINTI[i];
    const [x1, z1] = GEZINTI[i + 1];
    const k = Math.min(1, kalan / boylar[i]);
    g.position.set(x0 + (x1 - x0) * k, -1.25 + Math.sin(clock.elapsedTime * 1.1) * 0.08, z0 + (z1 - z0) * k);
    const ileri = t < 0.6;
    g.rotation.y = Math.atan2(x1 - x0, z1 - z0) + (ileri ? 0 : Math.PI);
  });
  return (
    <group ref={ref}>
      <HazirModel yol="tekneler/boat-fishing-small" ayar={{ grup: 'liman', en: 7 }} />
    </group>
  );
}

function Tekneler() {
  return (
    <group>
      <Tekne yol="tekneler/boat-fishing-small" konum={[-7, -1.25, -60]} en={6.5} donus={0} faz={0} />
      <Tekne yol="tekneler/boat-fishing-small" konum={[7.5, -1.25, -88]} en={7} donus={Math.PI} faz={1.7} />
      <Tekne yol="tekneler/boat-row-small" konum={[-5, -1.05, -36]} en={3.4} donus={0.2} faz={0.6} />
      <Tekne yol="tekneler/boat-row-small" konum={[6, -1.05, -42]} en={3.6} donus={-0.3} faz={3.1} />
      <Tekne yol="tekneler/boat-fishing-small" konum={[16, -1.25, -133]} en={6.5} donus={Math.PI / 2} faz={2.4} />
      <GezenTekne />
    </group>
  );
}

export function Liman() {
  return (
    <group>
      <Kumsal />
      <YolVeZemin />
      <TIskele />
      <Mendirek />
      <LimanYapilari />
      <Mahalle />
      <Tekneler />
    </group>
  );
}
