import { useMemo } from 'react';
import * as THREE from 'three';
import { HazirModel } from './HazirModel';
import { agacGeometrileri, Ornekler } from './Mahalle';
import { renk } from './renkler';

// Kumsal ve yürüyüş yolu (belge 0.12; Kemal: "tüm bu boşluk beni rahatsız
// ediyor"): şemsiyeli şezlong grupları, kumda ters çevrilmiş sandallar,
// kayalar, iskele başında fıçı ve sandıklar, korkuluğun önünde saksıda zeytin.
// Kenney Pirate Kit (kaya, fıçı, sandık) ve Watercraft Kit (sandal); şezlong
// ve şemsiye kodla. Hepsi yalnız görüntü.

const SEMSIYE_RENKLERI: [string, string][] = [
  ['#fbf8f1', '#2f7fb3'],
  ['#fbf8f1', '#c8705a'],
  ['#ffc928', '#fbf8f1'],
  ['#fbf8f1', '#5f8fa8'],
];

function Sezlong({ x, z, don = 0 }: { x: number; z: number; don?: number }) {
  return (
    <group position={[x, -0.15, z]} rotation={[0, don, 0]}>
      <mesh position={[0, 0.3, 0.15]} castShadow>
        <boxGeometry args={[0.65, 0.06, 1.4]} />
        <meshStandardMaterial color="#fbf8f1" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, -0.62]} rotation={[0.9, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.06, 0.65]} />
        <meshStandardMaterial color="#fbf8f1" roughness={0.9} />
      </mesh>
      {[-0.28, 0.28].map((ax) =>
        [-0.45, 0.75].map((az) => (
          <mesh key={`${ax}${az}`} position={[ax, 0.14, az]}>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color={renk.ahsapOrta} />
          </mesh>
        )),
      )}
    </group>
  );
}

function PlajSemsiyesi({ x, z, renkler }: { x: number; z: number; renkler: [string, string] }) {
  const dilim = 8;
  return (
    <group position={[x, -0.15, z]}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
        <meshStandardMaterial color="#efe6d6" />
      </mesh>
      {Array.from({ length: dilim }, (_, i) => (
        <mesh key={i} position={[0, 2.3, 0]} rotation={[0, (i / dilim) * Math.PI * 2, 0]} castShadow>
          <coneGeometry args={[1.3, 0.45, 2, 1, true, 0, (Math.PI * 2) / dilim]} />
          <meshStandardMaterial color={renkler[i % 2]} roughness={0.9} side={THREE.DoubleSide} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// Plaj grupları: iskelenin iki yanında, korkuluktan biraz açıkta
const GRUPLAR: number[] = [-64, -50, -36, -22, 22, 36, 50, 64];

export function KumsalSusleri() {
  const agac = useMemo(agacGeometrileri, []);
  // Korkuluğun önünde (kum tarafında) saksılarda zeytin; iskele açıklığı boş
  const saksilar = useMemo(() => {
    const l: [number, number][] = [];
    for (let x = -42; x <= 42; x += 12) if (Math.abs(x) > 6) l.push([x, -9.6]);
    return l;
  }, []);
  const agacYerleri = useMemo(
    () => saksilar.map(([x, z], i) => new THREE.Matrix4().compose(new THREE.Vector3(x, 0.45, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * 1.3), new THREE.Vector3(1.1, 1.1, 1.1))),
    [saksilar],
  );
  return (
    <group>
      {/* Şemsiye + iki şezlong */}
      {GRUPLAR.map((x, i) => (
        <group key={x}>
          <PlajSemsiyesi x={x} z={-17.5 - (i % 2) * 1.5} renkler={SEMSIYE_RENKLERI[i % SEMSIYE_RENKLERI.length]} />
          <Sezlong x={x - 0.9} z={-17.2 - (i % 2) * 1.5} don={Math.PI + 0.1} />
          <Sezlong x={x + 0.9} z={-17.2 - (i % 2) * 1.5} don={Math.PI - 0.1} />
        </group>
      ))}
      {/* Kumda ters çevrilmiş sandallar */}
      <group position={[-29, 0.2, -21.5]} rotation={[Math.PI, 0.5, 0]}>
        <HazirModel yol="tekneler/boat-row-small" ayar={{ grup: 'liman', en: 3.4 }} />
      </group>
      <group position={[30, 0.15, -21]} rotation={[Math.PI, -0.3, 0]}>
        <HazirModel yol="tekneler/boat-row-small" ayar={{ grup: 'liman', en: 3.2 }} />
      </group>
      {/* Kayalar: kumsalın uçlarında ve iskelenin dibinde */}
      <HazirModel yol="kiyi/rocks-sand-a" ayar={{ grup: 'liman', en: 4 }} konum={[-88, -0.4, -22]} />
      <HazirModel yol="kiyi/rocks-sand-b" ayar={{ grup: 'liman', en: 3 }} konum={[-80, -0.35, -24]} donus={1} />
      <HazirModel yol="kiyi/rocks-sand-c" ayar={{ grup: 'liman', en: 3.5 }} konum={[84, -0.4, -23]} donus={2} />
      <HazirModel yol="kiyi/rocks-sand-a" ayar={{ grup: 'liman', en: 2.5 }} konum={[5.5, -0.5, -24.5]} donus={0.7} />
      <HazirModel yol="kiyi/rocks-sand-b" ayar={{ grup: 'liman', en: 2.2 }} konum={[-5.8, -0.5, -25]} donus={2.2} />
      {/* İskele başında fıçı ve sandıklar */}
      <HazirModel yol="kiyi/barrel" ayar={{ grup: 'liman', yukseklik: 0.9 }} konum={[3.2, -0.15, -11]} />
      <HazirModel yol="kiyi/barrel" ayar={{ grup: 'liman', yukseklik: 0.9 }} konum={[3.9, -0.15, -11.6]} donus={1} />
      <HazirModel yol="kiyi/crate" ayar={{ grup: 'liman', yukseklik: 0.8 }} konum={[-3.4, -0.15, -11.2]} donus={0.3} />
      <HazirModel yol="kiyi/crate-bottles" ayar={{ grup: 'liman', yukseklik: 0.8 }} konum={[-3.5, 0.65, -11.2]} donus={0.5} />
      {/* Saksıda zeytinler */}
      {saksilar.map(([x, z]) => (
        <mesh key={x} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.55, 0.45, 0.45, 8]} />
          <meshStandardMaterial color={renk.kiremit} roughness={0.9} />
        </mesh>
      ))}
      <Ornekler geo={agac.govde} renkAdi="#7a6550" yerler={agacYerleri} />
      <Ornekler geo={agac.zeytinTepe} renkAdi="#8a9a6a" yerler={agacYerleri} />
    </group>
  );
}
