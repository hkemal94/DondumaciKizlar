import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { renk } from './renkler';
import { HazirModel } from './HazirModel';
import { Mahalle } from './Mahalle';
import { KumsalSusleri } from './KumsalSusleri';

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
export const ISKELE_ENI = 4;
const ISKELE_UCU = -127;
const T_ENI = 44;
const T_DERINLIGI = 7;

// ---- Zemin: kumsal suya doğru alçalır (ıslak kum suyun altına girer) ----
function Kumsal() {
  const geometri = useMemo(() => {
    const xs: number[] = [];
    for (let x = -500; x <= 500; x += 5) xs.push(x);
    // Her x için noktalar: yol önünden kıyıya dört ara nokta (kuru kum, hafif
    // ton farkları), su kenarının biraz gerisi (ıslak), suyun içi
    const SATIR = 7;
    const sira = (x: number) => {
      const kiyi = kiyiZ(x) + 1.5;
      const l: number[][] = [];
      for (let k = 0; k < 5; k++) {
        const t = k / 5;
        l.push([x, -0.06 - t * 0.12, YOL_ON + (kiyi - YOL_ON) * t]);
      }
      l.push([x, -0.3, kiyi]);
      // Su kenarında dik iner: dalgalar kıyıyı tırtıklı göstermesin
      l.push([x, -2.4, kiyiZ(x) - 2]);
      return l;
    };
    const konum: number[] = [];
    const renkler: number[] = [];
    const kuru = new THREE.Color(renk.kum);
    const islak = new THREE.Color(renk.kaya);
    let tohum = 5;
    const r = () => ((tohum = (tohum * 16807) % 2147483647) - 1) / 2147483646;
    for (const x of xs) {
      for (const [i, n] of sira(x).entries()) {
        konum.push(n[0], n[1], n[2]);
        const c = i < 5 ? kuru.clone().offsetHSL(0, (r() - 0.5) * 0.04, (r() - 0.5) * 0.05 - i * 0.008) : i === 5 ? kuru.clone().lerp(islak, 0.45) : islak;
        renkler.push(c.r, c.g, c.b);
      }
    }
    const indis: number[] = [];
    for (let i = 0; i < xs.length - 1; i++)
      for (let j = 0; j < SATIR - 1; j++) {
        const a = i * SATIR + j,
          b = (i + 1) * SATIR + j;
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
      <KumsalSusleri />
      <YolVeZemin />
      <TIskele />
      <Mendirek />
      <LimanYapilari />
      <Mahalle />
      <Tekneler />
    </group>
  );
}
