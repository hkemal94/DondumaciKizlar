import { useDurum } from '../oyun/durum';
import { renk } from './renkler';

// Satın alınan dekorasyon (belge bölüm 4: masa, şemsiye, bitki, ışık).
// Dükkânın önündeki ahşap terasa konur; genel görünümde görünür.
// Kodla çizilmiş geçici parçalar.

function Cicekler() {
  const renkler = ['#ff6f7d', '#ffc928', '#9b5fc9', '#fffaf2'];
  return (
    <group>
      {[-2.6, 0, 2.6].map((x, k) => (
        <group key={x} position={[x, 0.06, -2.78]}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[1.4, 0.36, 0.4]} />
            <meshStandardMaterial color={renk.ahsapOrta} roughness={0.9} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <group key={i} position={[-0.55 + i * 0.18, 0.42, (i % 2) * 0.1 - 0.05]}>
              <mesh>
                <icosahedronGeometry args={[0.11, 0]} />
                <meshStandardMaterial color="#6aa84f" roughness={0.9} flatShading />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <icosahedronGeometry args={[0.065, 0]} />
                <meshStandardMaterial color={renkler[(i + k) % renkler.length]} roughness={0.7} flatShading />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function Fener({ konum }: { konum: [number, number, number] }) {
  return (
    <group position={konum}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.4, 6]} />
        <meshStandardMaterial color="#3d3a45" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.28, 0.34, 0.28]} />
        <meshStandardMaterial color="#fff3c4" emissive="#ffd98a" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 2.72, 0]}>
        <coneGeometry args={[0.24, 0.18, 4]} />
        <meshStandardMaterial color="#3d3a45" flatShading />
      </mesh>
    </group>
  );
}

function Masa() {
  return (
    <group position={[-6.2, 0.06, -5.2]}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 12]} />
        <meshStandardMaterial color={renk.ahsapAcik} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.72, 6]} />
        <meshStandardMaterial color={renk.ahsapKoyu} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.42, 0.05, 0.42]} />
            <meshStandardMaterial color={renk.mor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.72, -0.19]} castShadow>
            <boxGeometry args={[0.42, 0.5, 0.05]} />
            <meshStandardMaterial color={renk.mor} roughness={0.8} />
          </mesh>
          {[-0.17, 0.17].map((a) =>
            [-0.17, 0.17].map((b) => (
              <mesh key={`${a}${b}`} position={[a, 0.22, b]}>
                <boxGeometry args={[0.04, 0.45, 0.04]} />
                <meshStandardMaterial color={renk.ahsapKoyu} />
              </mesh>
            )),
          )}
        </group>
      ))}
    </group>
  );
}

function Semsiye() {
  const dilimler = 8;
  return (
    <group position={[-6.2, 0.06, -5.2]}>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.5, 6]} />
        <meshStandardMaterial color="#efe6d6" />
      </mesh>
      {Array.from({ length: dilimler }, (_, i) => (
        <mesh key={i} position={[0, 2.35, 0]} rotation={[0, (i / dilimler) * Math.PI * 2, 0]} castShadow>
          <coneGeometry args={[1.25, 0.45, 2, 1, true, 0, (Math.PI * 2) / dilimler]} />
          <meshStandardMaterial color={i % 2 ? renk.sari : renk.mor} roughness={0.9} side={2} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function Dekorlar() {
  const { dekorlar } = useDurum();
  return (
    <group>
      {dekorlar.includes('cicekler') && <Cicekler />}
      {dekorlar.includes('fenerler') && (
        <>
          <Fener konum={[-4.6, 0.06, -7.6]} />
          <Fener konum={[4.6, 0.06, -7.6]} />
        </>
      )}
      {dekorlar.includes('masa') && <Masa />}
      {dekorlar.includes('semsiye') && <Semsiye />}
    </group>
  );
}
