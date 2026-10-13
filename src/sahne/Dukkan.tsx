import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { kameraKarisimi } from './kameraKarisimi';
import * as THREE from 'three';
import { renk } from './renkler';
import { CESITLER, kuvetAraligi, kuvetX, vitrinGenisligi } from '../oyun/kuvetler';
import { kuveteBas, useDurum } from '../oyun/durum';

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

// Dükkânın genel görünümünde (yukarıdan) tavan ve öndeki duvar kalkar;
// bebek evi gibi içi görünür. Tezgah görünümünde yerlerine gelir.
export function TezgahtaGorunur({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = kameraKarisimi.deger < 0.12;
  });
  return <group ref={ref}>{children}</group>;
}

function Odalar() {
  return (
    <group>
      {/* Zemin */}
      <Kutu konum={[0, -0.05, -0.3]} boyut={[8, 0.1, 4.6]} renkAdi={renk.ahsapKoyu} golgeVer={false} />
      {/* Sağ duvar ve arka duvar (oyuncunun arkası): genel görünümde arkada kalır */}
      <Kutu konum={[4, 1.6, -0.3]} boyut={[0.1, 3.3, 4.6]} renkAdi={renk.duvar} golgeVer={false} />
      <Kutu konum={[0, 1.6, 2.05]} boyut={[8.1, 3.3, 0.1]} renkAdi={renk.duvar} golgeVer={false} />
      <TezgahtaGorunur>
        {/* Tavan */}
        <Kutu konum={[0, TAVAN, -0.3]} boyut={[8, 0.1, 4.6]} renkAdi={renk.ahsapAcik} golgeVer={false} golgeAl={false} />
        {/* Sol duvar: genel görünümde kameraya en yakın, kalkar */}
        <Kutu konum={[-4, 1.6, -0.3]} boyut={[0.1, 3.3, 4.6]} renkAdi={renk.duvar} golgeVer={false} />
        {/* Tavan kirişleri */}
        {[-1.6, 0.2].map((z) => (
          <Kutu key={z} konum={[0, TAVAN - 0.12, z]} boyut={[8, 0.16, 0.2]} renkAdi={renk.ahsapOrta} golgeVer={false} />
        ))}
      </TezgahtaGorunur>
      {/* Genel görünümde kesik duvar dipleri (sol duvar ve pencere duvarı): bebek evi gibi */}
      <Kutu konum={[-4, 0.18, -0.3]} boyut={[0.14, 0.36, 4.6]} renkAdi={renk.duvar} golgeVer={false} />
      <Kutu konum={[0, 0.18, PENCERE_Z]} boyut={[8.14, 0.36, 0.2]} renkAdi={renk.ahsapAcik} golgeVer={false} />
      {/* Dükkânın etrafındaki taş kaldırım */}
      <mesh position={[0, -0.12, 4]} receiveShadow>
        <boxGeometry args={[40, 0.1, 13]} />
        <meshStandardMaterial color="#d9c9ad" roughness={1} />
      </mesh>
      {[-12, -6, 6, 12].map((x) => (
        <mesh key={x} position={[x, -0.065, 4]}>
          <boxGeometry args={[0.06, 0.01, 13]} />
          <meshStandardMaterial color="#c4b293" />
        </mesh>
      ))}
    </group>
  );
}

// Oyuncunun arkasındaki tezgah: dolap, kavanozlar, kahve makinesi, kasa.
// Tezgah görünümünde kameranın arkasında kalır; genel görünümde görünür.
function ArkaTezgah() {
  const kavanozRenkleri = ['#ff6f7d', '#ffc928', '#5fd08a', '#9b5fc9', '#8a4b2e'];
  return (
    <group position={[0, 0, 1.68]}>
      <Kutu konum={[0, 0.45, 0]} boyut={[6.6, 0.9, 0.55]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[0, 0.92, 0]} boyut={[6.7, 0.05, 0.62]} renkAdi={renk.tezgahUst} puruz={0.6} />
      {/* Dolap kapakları */}
      {[-2.6, -1.3, 0, 1.3, 2.6].map((x) => (
        <Kutu key={x} konum={[x, 0.45, -0.28]} boyut={[1.15, 0.72, 0.02]} renkAdi={renk.ahsapAcik} golgeVer={false} />
      ))}
      {/* Kavanozlar */}
      {kavanozRenkleri.map((r, i) => (
        <group key={i} position={[-2.9 + i * 0.32, 0.95, 0.05]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.24, 8]} />
            <meshStandardMaterial color={renk.cam} transparent opacity={0.55} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.15, 8]} />
            <meshStandardMaterial color={r} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.03, 8]} />
            <meshStandardMaterial color={renk.mor} />
          </mesh>
        </group>
      ))}
      {/* Kahve makinesi (kışın kafe olacak dükkân için) */}
      <group position={[0.6, 0.95, 0.02]}>
        <Kutu konum={[0, 0.22, 0]} boyut={[0.55, 0.44, 0.4]} renkAdi="#c9d0d6" puruz={0.35} />
        <Kutu konum={[0, 0.46, 0]} boyut={[0.6, 0.05, 0.44]} renkAdi="#8d969e" puruz={0.35} />
        <Kutu konum={[0, 0.1, -0.22]} boyut={[0.3, 0.04, 0.12]} renkAdi="#5b6268" />
      </group>
      {/* Kasa */}
      <group position={[2.4, 0.95, 0]}>
        <Kutu konum={[0, 0.12, 0]} boyut={[0.5, 0.24, 0.4]} renkAdi={renk.mor} />
        <mesh position={[0, 0.3, -0.05]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.22]} />
          <meshStandardMaterial color="#4e2470" />
        </mesh>
      </group>
      {/* Kap yığınları */}
      {[1.5, 1.7].map((x, i) => (
        <mesh key={x} position={[x, 1.08, 0.05]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.26, 10]} />
          <meshStandardMaterial color={i ? renk.sari : renk.mor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Saksi({ konum, olcek = 1 }: { konum: [number, number, number]; olcek?: number }) {
  const yapraklar = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return (
      <mesh key={i} position={[Math.cos(a) * 0.12, 0.62, Math.sin(a) * 0.12]} rotation={[Math.sin(a) * 0.7, a, Math.cos(a) * 0.7]} castShadow>
        <coneGeometry args={[0.1, 0.55, 4]} />
        <meshStandardMaterial color={i % 2 ? '#5f9a4c' : '#78b45a'} roughness={0.9} flatShading />
      </mesh>
    );
  });
  return (
    <group position={konum} scale={olcek}>
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.34, 8]} />
        <meshStandardMaterial color="#d9825b" roughness={0.9} flatShading />
      </mesh>
      {yapraklar}
    </group>
  );
}

// Arka duvardaki menü panosu (taslak 1 gibi): yazısız, resimli (yazılar Kemal'in).
function MenuPanosu() {
  const resimler = ['#ff6f7d', '#8a4b2e', '#5fd08a', '#fff0c8'];
  return (
    <group position={[-1.6, 2.05, 1.98]} rotation={[0, Math.PI, 0]}>
      <Kutu konum={[0, 0, 0]} boyut={[1.7, 1.05, 0.05]} renkAdi={renk.ahsapKoyu} golgeVer={false} />
      <Kutu konum={[0, 0, 0.03]} boyut={[1.55, 0.9, 0.02]} renkAdi="#2f3b35" golgeVer={false} />
      {resimler.map((r, i) => (
        <mesh key={i} position={[-0.55 + i * 0.37, 0.12, 0.05]}>
          <circleGeometry args={[0.11, 10]} />
          <meshBasicMaterial color={r} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.18 - i * 0.12, 0.05]}>
          <planeGeometry args={[1.15 - i * 0.2, 0.03]} />
          <meshBasicMaterial color="#e9e4d8" transparent opacity={0.6} />
        </mesh>
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
  const { acikCesitler } = useDurum();
  const VITRIN_GENISLIGI = vitrinGenisligi(acikCesitler.length);
  const olcek = kuvetAraligi(acikCesitler.length) / 0.62; // sıklaşınca küvetler daralır
  return (
    <group position={[0, 0, -0.62]}>
      {/* Vitrin gövdesi */}
      <Kutu konum={[0, 0.48, 0]} boyut={[VITRIN_GENISLIGI, 0.96, 0.9]} renkAdi={renk.vitrinMetal} puruz={0.5} />
      {/* Vitrinin müşteri tarafı: logo renklerinde şerit */}
      <Kutu konum={[0, 0.62, -0.455]} boyut={[VITRIN_GENISLIGI, 0.5, 0.02]} renkAdi={renk.mor} />
      <Kutu konum={[0, 0.9, -0.46]} boyut={[VITRIN_GENISLIGI, 0.07, 0.02]} renkAdi={renk.sari} />
      {/* Küvet kasası */}
      <Kutu konum={[0, 0.98, 0]} boyut={[VITRIN_GENISLIGI - 0.3, 0.06, 0.66]} renkAdi="#8d969e" puruz={0.4} />
      {acikCesitler.map((cesit) => (
        <group key={cesit} position={[kuvetX(cesit, acikCesitler), 1.0, 0]} scale={[olcek, 1, 1]}>
          <Kutu konum={[0, -0.02, 0]} boyut={[0.58, 0.06, 0.5]} renkAdi="#d4d9dd" golgeVer={false} puruz={0.3} />
          <DondurmaYuzeyi renkAdi={CESITLER[cesit].renk} tohum={cesit + 1} />
          {/* Dokunma alanı: küvetten biraz büyük, görünmez */}
          <mesh
            position={[0, 0.08, 0]}
            onPointerDown={(e) => {
              e.stopPropagation();
              kuveteBas(cesit);
            }}
          >
            <boxGeometry args={[0.6, 0.25, 0.7]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {/* Müşteri tarafında alçak cam siper */}
      <mesh position={[0, 1.2, -0.42]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[VITRIN_GENISLIGI - 0.1, 0.42, 0.02]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.18} roughness={0.05} />
      </mesh>
      <Kutu konum={[0, 1.41, -0.45]} boyut={[VITRIN_GENISLIGI - 0.05, 0.035, 0.06]} renkAdi={renk.vitrinMetal} golgeVer={false} puruz={0.4} />
    </group>
  );
}

// Sağdaki külah ve kap yığınları (geçici).
function Yiginlar({ vitrin }: { vitrin: number }) {
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
    <group position={[vitrin / 2 + 0.5, 0.96, -0.5]}>
      <group position={[0, 0, 0]}>{kulahlar}</group>
      <group position={[0.28, 0, 0.05]}>{kulahlar}</group>
      <group position={[0.55, 0, -0.05]}>{kaplar}</group>
    </group>
  );
}

function Tezgah() {
  const { acikCesitler } = useDurum();
  const VITRIN_GENISLIGI = vitrinGenisligi(acikCesitler.length);
  return (
    <group>
      {/* Yan tezgahlar (vitrinin iki yanı) */}
      {[-1, 1].map((yon) => (
        // Yan tezgahlar vitrinle duvar arasını doldurur (vitrin genişleyince kısalır)
        <group key={yon} position={[yon * (VITRIN_GENISLIGI / 2 + (7.8 - VITRIN_GENISLIGI) / 4), 0, -0.62]}>
          <Kutu konum={[0, 0.46, 0]} boyut={[(7.8 - VITRIN_GENISLIGI) / 2 - 0.1, 0.92, 0.9]} renkAdi={renk.ahsapOrta} />
          <Kutu konum={[0, 0.94, 0]} boyut={[(7.8 - VITRIN_GENISLIGI) / 2, 0.05, 1.0]} renkAdi={renk.tezgahUst} puruz={0.6} />
        </group>
      ))}
      <Vitrin />
      <Yiginlar vitrin={VITRIN_GENISLIGI} />
    </group>
  );
}

export function Dukkan() {
  return (
    <group>
      <Odalar />
      {/* Dükkânın önü (pencere duvarı): genel görünümde kamera önden baktığı için kalkar */}
      <TezgahtaGorunur>
        <PencereDuvari />
        <Tente />
        <Ampuller />
      </TezgahtaGorunur>
      <Tezgah />
      <ArkaTezgah />
      <MenuPanosu />
      <Saksi konum={[-3.6, 0, 1.0]} />
      <Saksi konum={[3.55, 0, -2.0]} olcek={1.1} />
      <Saksi konum={[3.6, 0, 1.05]} olcek={0.9} />
    </group>
  );
}
