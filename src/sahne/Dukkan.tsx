import { useMemo } from 'react';
import * as THREE from 'three';
import { renk } from './renkler';
import { kuvetler } from '../oyun/kuvetler';
import { kuveteBas } from '../oyun/durum';

// Dükkânın içi, tezgahın arkasından görünen hâli (birinci şahıs yakın plan).
// Kodla çizilmiş geçici parçalar; asıl modeller sonra gelecek.

const PENCERE_Z = -2.4; // pencere duvarının yeri
const ESIK = 1.05; // pencerenin alt kenarı
const PENCERE_UST = 2.75;
const TAVAN = 3.25;

function Kutu({
  konum,
  boyut,
  renkAdi,
  golgeVer = true,
  golgeAl = true,
  puruz = 0.8,
}: {
  konum: [number, number, number];
  boyut: [number, number, number];
  renkAdi: string;
  golgeVer?: boolean;
  golgeAl?: boolean;
  puruz?: number;
}) {
  return (
    <mesh position={konum} castShadow={golgeVer} receiveShadow={golgeAl}>
      <boxGeometry args={boyut} />
      <meshStandardMaterial color={renkAdi} roughness={puruz} />
    </mesh>
  );
}

function PencereDuvari() {
  const kalinlik = 0.18;
  const z = PENCERE_Z;
  return (
    <group>
      {/* Eşiğin altı: dikey ahşap tahtalar */}
      {Array.from({ length: 20 }, (_, i) => (
        <Kutu
          key={i}
          konum={[-3.8 + i * 0.4, ESIK / 2, z + (i % 2) * 0.01]}
          boyut={[0.39, ESIK, kalinlik]}
          renkAdi={i % 2 ? renk.ahsapAcik : '#b98a5f'}
        />
      ))}
      {/* Pencerenin üstü */}
      <Kutu konum={[0, (PENCERE_UST + TAVAN) / 2, z]} boyut={[8, TAVAN - PENCERE_UST, kalinlik]} renkAdi={renk.duvar} golgeVer={false} />
      {/* Yan duvar parçaları */}
      <Kutu konum={[-3.65, 1.6, z]} boyut={[0.7, 3.2, kalinlik]} renkAdi={renk.duvar} golgeVer={false} />
      <Kutu konum={[3.65, 1.6, z]} boyut={[0.7, 3.2, kalinlik]} renkAdi={renk.duvar} golgeVer={false} />
      {/* Mavi pencere çerçevesi ve kayıtları */}
      {[-3.25, -1.1, 1.1, 3.25].map((x) => (
        <Kutu key={x} konum={[x, (ESIK + PENCERE_UST) / 2, z + 0.02]} boyut={[0.14, PENCERE_UST - ESIK, 0.22]} renkAdi={renk.pencereCerceve} golgeVer={false} />
      ))}
      <Kutu konum={[0, ESIK, z + 0.08]} boyut={[7.6, 0.08, 0.5]} renkAdi={renk.ahsapOrta} golgeVer={false} />
      <Kutu konum={[0, PENCERE_UST, z + 0.02]} boyut={[6.7, 0.14, 0.22]} renkAdi={renk.pencereCerceve} golgeVer={false} />
    </group>
  );
}

// Pencerenin dışındaki çizgili tente: logo renkleri mor ve sarı (tonlar taslak).
function Tente() {
  const seritler = [];
  const sayi = 14;
  const genislik = 7.2 / sayi;
  for (let i = 0; i < sayi; i++) {
    seritler.push(
      <mesh key={i} position={[-3.6 + genislik * (i + 0.5), 0, 0]} castShadow>
        <boxGeometry args={[genislik, 0.04, 1.1]} />
        <meshStandardMaterial color={i % 2 ? renk.sari : renk.mor} roughness={0.9} />
      </mesh>,
    );
  }
  return (
    <group position={[0, PENCERE_UST + 0.12, PENCERE_Z - 0.55]} rotation={[0.32, 0, 0]}>
      {seritler}
    </group>
  );
}

function Odalar() {
  return (
    <group>
      {/* Zemin */}
      <Kutu konum={[0, -0.05, -0.3]} boyut={[8, 0.1, 4.6]} renkAdi={renk.ahsapKoyu} golgeVer={false} />
      {/* Tavan */}
      <Kutu konum={[0, TAVAN, -0.3]} boyut={[8, 0.1, 4.6]} renkAdi={renk.ahsapAcik} golgeVer={false} golgeAl={false} />
      {/* Yan duvarlar */}
      <Kutu konum={[-4, 1.6, -0.3]} boyut={[0.1, 3.3, 4.6]} renkAdi={renk.duvar} golgeVer={false} />
      <Kutu konum={[4, 1.6, -0.3]} boyut={[0.1, 3.3, 4.6]} renkAdi={renk.duvar} golgeVer={false} />
      {/* Tavan kirişleri */}
      {[-1.6, 0.2].map((z) => (
        <Kutu key={z} konum={[0, TAVAN - 0.12, z]} boyut={[8, 0.16, 0.2]} renkAdi={renk.ahsapOrta} golgeVer={false} />
      ))}
    </group>
  );
}

// Pencere üstünde asılı küçük ampuller: sıcak hava.
function Ampuller() {
  const ampuller = [];
  for (let i = 0; i < 13; i++) {
    const x = -3 + i * 0.5;
    const sarkma = Math.sin((i / 12) * Math.PI) * 0.18;
    ampuller.push(
      <mesh key={i} position={[x, PENCERE_UST - 0.12 - sarkma, PENCERE_Z + 0.2]}>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshStandardMaterial color="#fff3c4" emissive="#ffd98a" emissiveIntensity={1.6} />
      </mesh>,
    );
  }
  return <group>{ampuller}</group>;
}

// Küvetteki dondurma: engebeli, basık bir tümsek.
function DondurmaYuzeyi({ renkAdi, tohum }: { renkAdi: string; tohum: number }) {
  const geometri = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const goruldu = new Map<string, number>();
    for (let i = 0; i < p.count; i++) {
      const anahtar = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
      let k = goruldu.get(anahtar);
      if (k === undefined) {
        k = 0.88 + (Math.sin(i * 12.9898 + tohum * 78.233) * 0.5 + 0.5) * 0.24;
        goruldu.set(anahtar, k);
      }
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [tohum]);
  return (
    <mesh geometry={geometri} position={[0, 0.02, 0]} scale={[0.24, 0.11, 0.2]} castShadow receiveShadow>
      <meshStandardMaterial color={renkAdi} roughness={0.55} flatShading />
    </mesh>
  );
}

// Vitrin: dört küvet, üstünde cam siper. Küvete basılı tutunca kepçe dalar.
function Vitrin() {
  return (
    <group position={[0, 0, -0.62]}>
      {/* Vitrin gövdesi */}
      <Kutu konum={[0, 0.48, 0]} boyut={[2.9, 0.96, 0.9]} renkAdi={renk.vitrinMetal} puruz={0.5} />
      {/* Küvet kasası */}
      <Kutu konum={[0, 0.98, 0]} boyut={[2.6, 0.06, 0.66]} renkAdi="#8d969e" puruz={0.4} />
      {kuvetler.map((k, i) => (
        <group key={i} position={[k.x, 1.0, 0]}>
          <Kutu konum={[0, -0.02, 0]} boyut={[0.58, 0.06, 0.5]} renkAdi="#d4d9dd" golgeVer={false} puruz={0.3} />
          <DondurmaYuzeyi renkAdi={k.renk} tohum={i + 1} />
          {/* Dokunma alanı: küvetten biraz büyük, görünmez */}
          <mesh
            position={[0, 0.08, 0]}
            onPointerDown={(e) => {
              e.stopPropagation();
              kuveteBas(i);
            }}
          >
            <boxGeometry args={[0.6, 0.25, 0.7]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {/* Müşteri tarafında alçak cam siper */}
      <mesh position={[0, 1.2, -0.42]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[2.8, 0.42, 0.02]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.18} roughness={0.05} />
      </mesh>
      <Kutu konum={[0, 1.41, -0.45]} boyut={[2.85, 0.035, 0.06]} renkAdi={renk.vitrinMetal} golgeVer={false} puruz={0.4} />
    </group>
  );
}

// Sağdaki külah ve kap yığınları (geçici).
function Yiginlar() {
  const kulahlar = [];
  for (let i = 0; i < 5; i++) {
    kulahlar.push(
      <mesh key={i} position={[0, 0.1 + i * 0.045, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.055, 0.2, 8, 1, true]} />
        <meshStandardMaterial color="#d9a066" roughness={0.9} flatShading side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  const kaplar = [];
  for (let i = 0; i < 6; i++) {
    kaplar.push(
      <mesh key={i} position={[0, 0.05 + i * 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.05, 0.09, 10, 1, true]} />
        <meshStandardMaterial color={i % 2 ? renk.mor : renk.sari} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  return (
    <group position={[1.95, 0.96, -0.5]}>
      <group position={[0, 0, 0]}>{kulahlar}</group>
      <group position={[0.28, 0, 0.05]}>{kulahlar}</group>
      <group position={[0.55, 0, -0.05]}>{kaplar}</group>
    </group>
  );
}

function Tezgah() {
  return (
    <group>
      {/* Yan tezgahlar (vitrinin iki yanı) */}
      <Kutu konum={[-2.6, 0.46, -0.62]} boyut={[2.4, 0.92, 0.9]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[2.6, 0.46, -0.62]} boyut={[2.4, 0.92, 0.9]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[-2.6, 0.94, -0.62]} boyut={[2.5, 0.05, 1.0]} renkAdi={renk.tezgahUst} puruz={0.6} />
      <Kutu konum={[2.6, 0.94, -0.62]} boyut={[2.5, 0.05, 1.0]} renkAdi={renk.tezgahUst} puruz={0.6} />
      <Vitrin />
      <Yiginlar />
    </group>
  );
}

export function Dukkan() {
  return (
    <group>
      <Odalar />
      <PencereDuvari />
      <Tente />
      <Ampuller />
      <Tezgah />
    </group>
  );
}
