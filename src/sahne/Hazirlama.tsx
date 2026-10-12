import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dolumHesapla, durumuOku, useDurum, type Top } from '../oyun/durum';
import { KUVET_Y, KUVET_Z, kuvetler } from '../oyun/kuvetler';
import { renk } from './renkler';

// Tezgah yakın planındaki hareketli parçalar: altlık (külah / kap),
// kepçe ve dondurma topları. Eller yok (belge 7.1: önce elsiz denenir).

const ALTLIK_KONUM = new THREE.Vector3(-0.36, 1.36, 0.12);
const KEPCE_DURUS = new THREE.Vector3(0.6, 1.46, 0.1);
const KEPCE_BEKLEME = new THREE.Vector3(0.05, 1.38, 0.05);

// Topun yarıçapı dolumla büyür; MÜKEMMEL aralığı "tam top" boyu.
export function topYaricapi(dolum: number) {
  return 0.035 + dolum * 0.045;
}

// Tohumlu engebeli top geometrisi (her top biraz farklı)
function topGeometrisi(tohum: number) {
  const g = new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  const goruldu = new Map<string, number>();
  for (let i = 0; i < p.count; i++) {
    const anahtar = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    let k = goruldu.get(anahtar);
    if (k === undefined) {
      k = 0.9 + (Math.sin(goruldu.size * 12.99 + tohum * 7.7) * 0.5 + 0.5) * 0.18;
      goruldu.set(anahtar, k);
    }
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.92, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}

function DondurmaTopu({ top, tohum }: { top: Top; tohum: number }) {
  const geometri = useMemo(() => topGeometrisi(tohum), [tohum]);
  const r = topYaricapi(top.boyut);
  return (
    <mesh geometry={geometri} scale={r} castShadow>
      <meshStandardMaterial color={kuvetler[top.kuvet].renk} roughness={0.55} flatShading />
    </mesh>
  );
}

function Kulah() {
  return (
    <group>
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.068, 0.22, 10, 3]} />
        <meshStandardMaterial color="#d9a066" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.072, 0.068, 0.02, 10]} />
        <meshStandardMaterial color="#c98d55" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function Kap() {
  return (
    <group>
      <mesh position={[0, -0.045, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.06, 0.09, 14, 1, true]} />
        <meshStandardMaterial color={renk.mor} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.025, 0]}>
        <cylinderGeometry args={[0.0815, 0.075, 0.02, 14, 1, true]} />
        <meshStandardMaterial color={renk.sari} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.089, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 14]} />
        <meshStandardMaterial color={renk.mor} roughness={0.7} />
      </mesh>
    </group>
  );
}

// Altlığın tutulduğu yer: ileride eller gelince kalkacak.
function AltlikStandi() {
  return (
    <group position={ALTLIK_KONUM.toArray()}>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 6]} />
        <meshStandardMaterial color={renk.vitrinMetal} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.007, 6, 16]} />
        <meshStandardMaterial color={renk.vitrinMetal} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

function topKonumlari(altlik: 'kulah' | 'kap', toplar: Top[]): [number, number, number][] {
  const r = toplar.map((t) => topYaricapi(t.boyut));
  if (altlik === 'kulah') {
    let y = 0.01;
    return r.map((ri, i) => {
      y += i === 0 ? ri * 0.55 : ri * 1.25;
      return [0, y, 0];
    });
  }
  // Kap: bir top ortada; iki top yan yana; üçüncü ikisinin üstünde
  if (r.length === 1) return [[0, -0.01 + r[0] * 0.5, 0]];
  const yan = Math.max(r[0], r[1]) * 0.8;
  const sonuc: [number, number, number][] = [
    [-yan, -0.015 + r[0] * 0.45, 0.005],
    [yan, -0.015 + r[1] * 0.45, -0.005],
  ];
  if (r.length >= 3) sonuc.push([0, -0.015 + Math.max(r[0], r[1]) * 0.45 + r[2] * 1.05, 0]);
  return sonuc;
}

function AltlikVeToplar() {
  const durum = useDurum();
  const ref = useRef<THREE.Group>(null);
  const servisBasladi = useRef<number | null>(null);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (durum.asama === 'servis') {
      // Servis: müşteriye doğru uzanıp küçülür
      if (servisBasladi.current === null) servisBasladi.current = performance.now();
      const t = Math.min(1, (performance.now() - servisBasladi.current) / 900);
      if (durum.servisDogru) {
        g.position.lerpVectors(ALTLIK_KONUM, new THREE.Vector3(0, 1.45, -1.3), t);
        g.scale.setScalar(1 - t * 0.6);
      } else {
        // Yanlış sipariş: dondurma kenara bırakılır (ceza yok)
        g.position.lerpVectors(ALTLIK_KONUM, new THREE.Vector3(-1.1, 1.2, 0.1), t);
        g.scale.setScalar(1 - t);
      }
    } else {
      servisBasladi.current = null;
      g.position.lerp(ALTLIK_KONUM, 1 - Math.exp(-dt * 12));
      g.scale.setScalar(1);
    }
  });

  if (!durum.altlik) return null;

  // Toplar altlığa göre farklı dizilir: külahta üst üste,
  // kapta yan yana (üçüncüsü ikisinin üstüne).
  const konumlar = topKonumlari(durum.altlik, durum.toplar);
  const toplar = durum.toplar.map((top, i) => (
    <group key={i} position={konumlar[i]}>
      <DondurmaTopu top={top} tohum={i * 3 + top.kuvet} />
    </group>
  ));

  return (
    <group ref={ref} position={ALTLIK_KONUM.toArray()}>
      {durum.altlik === 'kulah' ? <Kulah /> : <Kap />}
      {toplar}
    </group>
  );
}

function Kepce() {
  const durum = useDurum();
  const ref = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Mesh>(null);
  const hedef = useMemo(() => new THREE.Vector3(), []);
  const topGeo = useMemo(() => topGeometrisi(99), []);

  useFrame(({ clock }, dt) => {
    const g = ref.current;
    const top = topRef.current;
    if (!g || !top) return;
    const d = durumuOku();
    let topBoyu = 0;
    let topRengi: string = kuvetler[0].renk;
    let egim = -0.5;

    if (d.asama === 'dolduruyor' && d.kepceKuvet !== null) {
      // Küvete daldır: aşağı inip hafifçe ileri geri sürüklenir
      const dolum = dolumHesapla(performance.now());
      const k = kuvetler[d.kepceKuvet];
      hedef.set(k.x + Math.sin(clock.elapsedTime * 5) * 0.05, KUVET_Y + 0.07, KUVET_Z + 0.08);
      topBoyu = dolum;
      topRengi = k.renk;
      egim = -1.0;
    } else if (d.asama === 'kepceDolu' && d.kepcedeki) {
      hedef.copy(KEPCE_BEKLEME);
      hedef.y += Math.sin(clock.elapsedTime * 2.4) * 0.01;
      topBoyu = d.kepcedeki.boyut;
      topRengi = kuvetler[d.kepcedeki.kuvet].renk;
      egim = -0.35;
    } else {
      hedef.copy(KEPCE_DURUS);
    }

    g.position.lerp(hedef, 1 - Math.exp(-dt * (d.asama === 'dolduruyor' ? 14 : 8)));
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, egim, 10, dt);

    top.visible = topBoyu > 0.02;
    top.scale.setScalar(topYaricapi(topBoyu));
    (top.material as THREE.MeshStandardMaterial).color.set(topRengi);
  });

  return (
    <group ref={ref} position={KEPCE_DURUS.toArray()} rotation={[-0.5, 0.35, 0]}>
      {/* Kepçe çanağı */}
      <mesh rotation={[Math.PI, 0, 0]} castShadow>
        <sphereGeometry args={[0.055, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c9d0d6" roughness={0.35} metalness={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Sap: oyuncuya doğru */}
      <mesh position={[0, 0.02, 0.17]} rotation={[Math.PI / 2 - 0.15, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.26, 8]} />
        <meshStandardMaterial color="#c9d0d6" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.045, 0.33]} rotation={[Math.PI / 2 - 0.15, 0, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.02, 0.14, 8]} />
        <meshStandardMaterial color={renk.mor} roughness={0.6} />
      </mesh>
      {/* Kepçedeki top */}
      <mesh ref={topRef} geometry={topGeo} position={[0, 0.02, 0]} visible={false}>
        <meshStandardMaterial color={kuvetler[0].renk} roughness={0.55} flatShading />
      </mesh>
    </group>
  );
}

export function Hazirlama() {
  return (
    <group>
      <AltlikStandi />
      <AltlikVeToplar />
      <Kepce />
    </group>
  );
}
