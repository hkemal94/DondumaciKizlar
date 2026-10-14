import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { renk } from './renkler';
import { gokRenkleri } from './gokRenkleri';
import { YURUYUS_Z } from '../oyun/dekorasyon';

// Dükkânın penceresinden görünen dış dünya: gök, deniz, tepeler,
// iskele, tekneler, önündeki ahşap teras. Hepsi kodla çizilmiş
// geçici low-poly parçalar; beğenilmeyen olursa değiştirilir.

// Aynı sahne her açılışta aynı görünsün diye tohumlu rastgele sayı.
function tohumluRastgele(tohum: number) {
  let s = tohum;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Gok() {
  const malzeme = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          ust: { value: gokRenkleri.ust },
          ufuk: { value: gokRenkleri.ufuk },
        },
        vertexShader: /* glsl */ `
          varying vec3 vYon;
          void main() {
            vYon = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 ust;
          uniform vec3 ufuk;
          varying vec3 vYon;
          void main() {
            float h = clamp(vYon.y * 2.2, 0.0, 1.0);
            gl_FragColor = vec4(mix(ufuk, ust, pow(h, 0.7)), 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  return (
    <mesh material={malzeme} renderOrder={-1}>
      <sphereGeometry args={[400, 24, 12]} />
    </mesh>
  );
}

function Deniz() {
  const ref = useRef<THREE.Mesh>(null);
  const geometri = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 180, 56, 32);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const temel = useMemo(() => Float32Array.from(geometri.attributes.position.array), [geometri]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const konum = geometri.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < konum.count; i++) {
      const x = temel[i * 3];
      const z = temel[i * 3 + 2];
      konum.setY(i, Math.sin(x * 0.35 + t * 0.9) * 0.12 + Math.cos(z * 0.4 + t * 0.7) * 0.1);
    }
    konum.needsUpdate = true;
  });

  return (
    <mesh ref={ref} geometry={geometri} position={[0, -0.9, -95]} receiveShadow>
      <meshStandardMaterial color={renk.denizSig} roughness={0.35} metalness={0.05} flatShading />
    </mesh>
  );
}

function Tepe({
  konum,
  olcek,
  tohum,
  renkAdi = renk.tepe,
}: {
  konum: [number, number, number];
  olcek: [number, number, number];
  tohum: number;
  renkAdi?: string;
}) {
  const geometri = useMemo(() => {
    const r = tohumluRastgele(tohum);
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    // Köşeleri biraz oynat: düzgün top yerine engebeli tepe.
    const goruldu = new Map<string, number>();
    for (let i = 0; i < p.count; i++) {
      const anahtar = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
      let k = goruldu.get(anahtar);
      if (k === undefined) {
        k = 0.85 + r() * 0.3;
        goruldu.set(anahtar, k);
      }
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [tohum]);
  return (
    <mesh geometry={geometri} position={konum} scale={olcek}>
      <meshStandardMaterial color={renkAdi} roughness={0.9} flatShading />
    </mesh>
  );
}

function Tekne({ konum, olcek = 1, faz = 0 }: { konum: [number, number, number]; olcek?: number; faz?: number }) {
  const ref = useRef<THREE.Group>(null);
  const govde = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, 0.35);
    s.lineTo(1.9, 0.35);
    s.lineTo(1.2, -0.25);
    s.lineTo(-1.3, -0.25);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: false });
    g.translate(0, 0, -0.45);
    return g;
  }, []);
  const yelken = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0, 3.2);
    s.lineTo(1.5, 0.1);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + faz;
    ref.current.position.y = konum[1] + Math.sin(t * 1.1) * 0.08;
    ref.current.rotation.z = Math.sin(t * 0.9) * 0.04;
  });

  return (
    <group ref={ref} position={konum} scale={olcek}>
      <mesh geometry={govde}>
        <meshStandardMaterial color={renk.tekneGovde} flatShading />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[3.3, 0.08, 0.95]} />
        <meshStandardMaterial color={renk.ahsapOrta} />
      </mesh>
      <mesh position={[0.1, 1.95, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 3.2, 5]} />
        <meshStandardMaterial color={renk.ahsapKoyu} />
      </mesh>
      <mesh geometry={yelken} position={[0.16, 0.6, 0]}>
        <meshStandardMaterial color={renk.yelken} side={THREE.DoubleSide} flatShading />
      </mesh>
    </group>
  );
}

// Dükkânın yakınındaki iskele (kanon: Liman, iskelenin yakını).
function Iskele() {
  const direkler = [];
  for (let z = -9; z >= -34; z -= 3.2) {
    for (const x of [-1.15, 1.15]) {
      direkler.push(
        <mesh key={`${x}${z}`} position={[x, -0.5, z]}>
          <cylinderGeometry args={[0.13, 0.15, 1.6, 6]} />
          <meshStandardMaterial color={renk.ahsapKoyu} flatShading />
        </mesh>,
      );
    }
  }
  return (
    <group position={[-11, 0, 0]}>
      <mesh position={[0, 0.12, -21.5]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.18, 26]} />
        <meshStandardMaterial color={renk.ahsapAcik} roughness={0.85} />
      </mesh>
      {direkler}
    </group>
  );
}

// Ahşap teras: dükkânın önünden rıhtıma kadar, iki yana uzun (dükkân
// büyüdükçe yer kalsın). Deniz tarafında taş yürüyüş yolu (Kemal, 14 Ekim:
// "yürüyüş yolu deniz tarafına"); iskelenin önünde korkulukta açıklık.
const TERAS_UCU = 46;
const ISKELE_ACIKLIGI: [number, number] = [-12.4, -9.6];

function Teras() {
  const tahtalar = [];
  // Tahtalar 1 m geniş, tam metrelerde: alınan karelerin ahşabıyla aynı hizada (belge 0.3)
  for (let x = -TERAS_UCU; x < TERAS_UCU; x++) {
    tahtalar.push(
      <mesh key={x} position={[x + 0.5, 0, -5.4]} receiveShadow>
        <boxGeometry args={[0.96, 0.12, 6]} />
        <meshStandardMaterial color={((x % 2) + 2) % 2 ? renk.ahsapAcik : renk.ahsapOrta} roughness={0.9} />
      </mesh>,
    );
  }
  const korkuluk = [];
  for (let x = -TERAS_UCU + 2; x <= TERAS_UCU - 2; x += 2) {
    if (x > ISKELE_ACIKLIGI[0] && x < ISKELE_ACIKLIGI[1]) continue;
    korkuluk.push(
      <mesh key={x} position={[x, 0.5, -8.2]} castShadow>
        <boxGeometry args={[0.12, 1, 0.12]} />
        <meshStandardMaterial color={renk.ahsapKoyu} />
      </mesh>,
    );
  }
  // Korkuluğun tırabzanları: iskelenin iki yanında iki parça
  const parcalar: [number, number][] = [
    [-TERAS_UCU + 2, ISKELE_ACIKLIGI[0] + 0.4],
    [ISKELE_ACIKLIGI[1] - 0.4, TERAS_UCU - 2],
  ];
  return (
    <group>
      {tahtalar}
      {/* Taş yürüyüş yolu: müşteriler buradan gelip gider */}
      <mesh position={[0, 0.065, YURUYUS_Z]} receiveShadow>
        <boxGeometry args={[TERAS_UCU * 2, 0.02, 1.7]} />
        <meshStandardMaterial color="#d6c6a6" roughness={1} />
      </mesh>
      {[-1, 1].map((y) => (
        <mesh key={y} position={[0, 0.07, YURUYUS_Z + y * 0.88]}>
          <boxGeometry args={[TERAS_UCU * 2, 0.02, 0.07]} />
          <meshStandardMaterial color="#b9a581" roughness={1} />
        </mesh>
      ))}
      {/* Taş rıhtım: teras ile deniz arası */}
      <mesh position={[0, -0.6, -8.6]}>
        <boxGeometry args={[TERAS_UCU * 2, 1.2, 1.2]} />
        <meshStandardMaterial color={renk.kaya} roughness={1} flatShading />
      </mesh>
      {korkuluk}
      {parcalar.map(([a, b]) => (
        <group key={a}>
          <mesh position={[(a + b) / 2, 1.0, -8.2]} castShadow>
            <boxGeometry args={[b - a, 0.1, 0.16]} />
            <meshStandardMaterial color={renk.ahsapKoyu} />
          </mesh>
          <mesh position={[(a + b) / 2, 0.55, -8.2]}>
            <boxGeometry args={[b - a, 0.07, 0.1]} />
            <meshStandardMaterial color={renk.ahsapKoyu} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Disari() {
  return (
    <group>
      <Gok />
      <Deniz />
      <Teras />
      <Iskele />
      {/* Uzaktaki tepeler ve kayalar */}
      <Tepe konum={[-60, -6, -120]} olcek={[38, 18, 16]} tohum={3} />
      <Tepe konum={[-28, -4, -135]} olcek={[26, 11, 14]} tohum={7} renkAdi={renk.tepeKoyu} />
      <Tepe konum={[48, -7, -128]} olcek={[44, 16, 18]} tohum={11} />
      <Tepe konum={[90, -5, -110]} olcek={[30, 12, 16]} tohum={17} renkAdi={renk.tepeKoyu} />
      <Tepe konum={[22, -1.3, -70]} olcek={[5, 2.2, 3]} tohum={23} renkAdi={renk.kaya} />
      <Tepe konum={[-34, -1.2, -55]} olcek={[3.5, 1.8, 2.5]} tohum={29} renkAdi={renk.kaya} />
      {/* Tekneler */}
      <Tekne konum={[-5, -0.75, -42]} olcek={1.1} faz={0} />
      <Tekne konum={[16, -0.75, -60]} olcek={1.2} faz={1.7} />
      <Tekne konum={[34, -0.75, -48]} olcek={0.9} faz={3.1} />
      <Tekne konum={[-8.4, -0.75, -24]} olcek={0.8} faz={0.6} />
    </group>
  );
}
