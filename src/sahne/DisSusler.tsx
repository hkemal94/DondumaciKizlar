import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { renk } from './renkler';
import { logoDokusu, LOGO_DOSYALARI } from './logo';

// Dükkânın dışı için süsler (Kemal, 14 Ekim: "tabela benzeri ürünler").
// Kodla çizilmiş geçici parçalar. Hepsi ön yüzünü denize / kameraya
// (−z) çevirir. Işıklı tabelada Kemal'in külahlı logosu var (14 Ekim);
// kara tahtada yazı yok, yalnız dondurma çizimleri.

const DEMIR = '#3d3a45';
const TOP_RENKLERI = ['#ff6f7d', '#8a4b2e', '#5fd08a', '#fff0c8'];

// Kara tahta: ölçülü tebeşir çizimleri (külah ve toplar, yazı yok)
let karaTahtaDokusuOnbellek: THREE.CanvasTexture | null = null;
function karaTahtaDokusu() {
  if (karaTahtaDokusuOnbellek) return karaTahtaDokusuOnbellek;
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#2f3a33';
  g.fillRect(0, 0, 96, 128);
  const kulah = (x: number, y: number, top: string) => {
    g.strokeStyle = '#f2e6c9';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x - 9, y);
    g.lineTo(x + 9, y);
    g.lineTo(x, y + 22);
    g.closePath();
    g.stroke();
    g.fillStyle = top;
    g.beginPath();
    g.arc(x, y - 6, 9, 0, Math.PI * 2);
    g.fill();
  };
  kulah(28, 30, TOP_RENKLERI[0]);
  kulah(68, 30, TOP_RENKLERI[2]);
  kulah(28, 82, TOP_RENKLERI[3]);
  kulah(68, 82, TOP_RENKLERI[1]);
  // Tebeşir çizgileri: fiyat yerine kısa çizgiler
  g.fillStyle = '#f2e6c9';
  for (const y of [62, 114]) {
    g.fillRect(14, y, 28, 2);
    g.fillRect(54, y, 28, 2);
  }
  karaTahtaDokusuOnbellek = new THREE.CanvasTexture(c);
  karaTahtaDokusuOnbellek.colorSpace = THREE.SRGBColorSpace;
  return karaTahtaDokusuOnbellek;
}

// Bankın iki oturağı (müşteriler oturur): eşyanın merkezine göre
export const BANK_OTURAKLARI = [-0.28, 0.28];

export function KaraTahta() {
  const doku = useMemo(() => karaTahtaDokusu(), []);
  return (
    <group>
      {/* Ön ve arka kanat: A biçimi */}
      {[-1, 1].map((yon) => (
        <group key={yon} position={[0, 0, yon * 0.13]} rotation={[yon * 0.22, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.6, 0.9, 0.04]} />
            <meshStandardMaterial color={renk.ahsapOrta} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.52, yon * 0.022]} rotation={[0, yon < 0 ? Math.PI : 0, 0]}>
            <planeGeometry args={[0.5, 0.74]} />
            <meshStandardMaterial map={doku} roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function IsikliTabela() {
  const doku = useMemo(() => logoDokusu('kulahli'), []);
  const gen = 0.92;
  const yuk = gen / LOGO_DOSYALARI.kulahli.oran;
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.4, 6]} />
        <meshStandardMaterial color={DEMIR} roughness={0.6} />
      </mesh>
      <group position={[0, 2.75, 0]}>
        {/* Sarı çerçeve, mor zemin (logonun asıl zemini mor ve sarı) */}
        <mesh castShadow>
          <boxGeometry args={[gen + 0.14, yuk + 0.14, 0.12]} />
          <meshStandardMaterial color={renk.sari} roughness={0.6} />
        </mesh>
        {[-1, 1].map((yon) => (
          <group key={yon} rotation={[0, yon < 0 ? Math.PI : 0, 0]}>
            <mesh position={[0, 0, 0.065]}>
              <planeGeometry args={[gen + 0.04, yuk + 0.04]} />
              <meshStandardMaterial color={renk.mor} emissive={renk.mor} emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[0, 0, 0.07]}>
              <planeGeometry args={[gen, yuk]} />
              <meshBasicMaterial map={doku} transparent toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export function KulahFiguru() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.2, 10]} />
        <meshStandardMaterial color={renk.mor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.36, 1.3, 10]} />
        <meshStandardMaterial color="#d9a35b" roughness={0.9} flatShading />
      </mesh>
      {/* Külahın kafes çizgileri */}
      {[0.75, 1.05, 1.3].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1 + i * 0.1, 0.012, 4, 14]} />
          <meshStandardMaterial color="#b9813f" />
        </mesh>
      ))}
      <mesh position={[0, 1.62, 0]} castShadow>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial color={TOP_RENKLERI[0]} roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color={TOP_RENKLERI[2]} roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 2.38, 0]} castShadow>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial color={TOP_RENKLERI[1]} roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

// Flama: rüzgârda hafifçe dalgalanır
export function Flama() {
  const bayrak = useRef<THREE.Group>(null);
  const tohum = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    if (bayrak.current) bayrak.current.rotation.y = Math.sin(clock.elapsedTime * 2.2 + tohum) * 0.25;
  });
  const sekil = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.9, -0.22);
    s.lineTo(0, -0.5);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 3, 6]} />
        <meshStandardMaterial color="#efe6d6" />
      </mesh>
      <mesh position={[0, 3.03, 0]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color={renk.sari} />
      </mesh>
      <group ref={bayrak} position={[0.03, 2.95, 0]} scale={1.5}>
        <mesh geometry={sekil}>
          <meshStandardMaterial color={renk.mor} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
        <mesh geometry={sekil} position={[0, -0.12, 0.002]} scale={[0.6, 0.45, 1]}>
          <meshStandardMaterial color={renk.sari} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function Cicekler({ genislik, y, sayi }: { genislik: number; y: number; sayi: number }) {
  const renkler = ['#ff6f7d', '#ffc928', '#9b5fc9', '#fffaf2'];
  return (
    <group>
      {Array.from({ length: sayi }, (_, i) => {
        const x = -genislik / 2 + (genislik / (sayi - 1)) * i;
        return (
          <group key={i} position={[x, y + (i % 2) * 0.05, (i % 3) * 0.05 - 0.05]}>
            <mesh>
              <icosahedronGeometry args={[0.1, 0]} />
              <meshStandardMaterial color="#6aa84f" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <icosahedronGeometry args={[0.06, 0]} />
              <meshStandardMaterial color={renkler[i % renkler.length]} roughness={0.7} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function CicekKasasi() {
  return (
    <group>
      {[0.06, 0.2].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.85, 0.11, 0.42]} />
          <meshStandardMaterial color={renk.ahsapAcik} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.38]} />
        <meshStandardMaterial color="#5c4033" roughness={1} />
      </mesh>
      <Cicekler genislik={0.66} y={0.36} sayi={6} />
    </group>
  );
}

export function Bisiklet() {
  const cerceve = <meshStandardMaterial color={renk.mor} roughness={0.5} />;
  return (
    <group rotation={[0, -0.25, 0]}>
      {[-0.42, 0.42].map((x) => (
        <group key={x} position={[x, 0.32, 0]}>
          <mesh>
            <torusGeometry args={[0.3, 0.025, 6, 18]} />
            <meshStandardMaterial color="#2a2830" roughness={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 6]} />
            <meshStandardMaterial color="#b9c0c6" metalness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Gövde: arka tekerden sele ve gidona */}
      <mesh position={[-0.12, 0.5, 0]} rotation={[0, 0, -0.95]}>
        <cylinderGeometry args={[0.025, 0.025, 0.62, 6]} />
        {cerceve}
      </mesh>
      <mesh position={[0.12, 0.62, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
        {cerceve}
      </mesh>
      <mesh position={[0.38, 0.55, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
        {cerceve}
      </mesh>
      <mesh position={[-0.2, 0.62, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.022, 0.022, 0.62, 6]} />
        {cerceve}
      </mesh>
      {/* Sele ve gidon */}
      <mesh position={[-0.28, 0.9, 0]}>
        <boxGeometry args={[0.16, 0.04, 0.09]} />
        <meshStandardMaterial color="#3a2a22" />
      </mesh>
      <mesh position={[0.32, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.4, 6]} />
        <meshStandardMaterial color="#2a2830" />
      </mesh>
      {/* Öndeki hasır sepet, içinde çiçek */}
      <mesh position={[0.5, 0.78, 0]}>
        <boxGeometry args={[0.24, 0.16, 0.26]} />
        <meshStandardMaterial color="#e3c58a" roughness={1} flatShading />
      </mesh>
      <group position={[0.5, 0.86, 0.05]} scale={0.6}>
        <Cicekler genislik={0.2} y={0} sayi={3} />
      </group>
    </group>
  );
}

export function SokakLambasi() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.24, 8]} />
        <meshStandardMaterial color="#2f4a3a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 3.0, 8]} />
        <meshStandardMaterial color="#2f4a3a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.18, 0]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#fff3c4" emissive="#ffd98a" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <coneGeometry args={[0.14, 0.16, 8]} />
        <meshStandardMaterial color="#2f4a3a" roughness={0.5} />
      </mesh>
    </group>
  );
}
