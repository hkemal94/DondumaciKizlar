import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dolumHesapla, durumuOku, useDurum, type Susleme, type Top } from '../oyun/durum';
import { CESITLER, KUVET_Y, kuvetKonumu } from '../oyun/kuvetler';
import { renk } from './renkler';
import { TezgahtaGorunur } from './Dukkan';
import { tezgahDikligi } from './kameraKarisimi';
import { Parcaciklar } from './Efektler';

const SERPINTI_RENKLERI = ['#ff6f7d', '#ffc928', '#5fb7e8', '#9b5fc9', '#5fd08a', '#5a2e1c'];

// Tezgah yakın planındaki hareketli parçalar: altlık (külah / kap),
// kepçe ve dondurma topları. Eller yok (belge 7.1: önce elsiz denenir).

// Küvetlerin üstünde, solda: küvetleri kapatmasın (Kemal, 13 Ekim)
const ALTLIK_KONUM = new THREE.Vector3(-0.52, 1.74, 0.3);
// Vitrin iki sıra olunca kamera dikleşir; altlık küvetlerin üstüne düşmesin diye
// sola ve biraz ileri alınır (14 Ekim)
const ALTLIK_DIK = new THREE.Vector3(-0.75, 1.8, -0.2);
function altlikYeri(hedef: THREE.Vector3) {
  return hedef.lerpVectors(ALTLIK_KONUM, ALTLIK_DIK, tezgahDikligi.deger);
}
const KEPCE_DURUS = new THREE.Vector3(0.6, 1.46, 0.1);

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
      <meshStandardMaterial color={CESITLER[top.kuvet].renk} roughness={0.55} flatShading />
    </mesh>
  );
}

// Yeni konan top yukarıdan hafifçe düşüp yerine oturur (parmak kalkınca)
function InenTop({ konum, children }: { konum: [number, number, number]; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const yukseklik = useRef(0.16);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    yukseklik.current = THREE.MathUtils.damp(yukseklik.current, 0, 16, dt);
    g.position.set(konum[0], konum[1] + yukseklik.current, konum[2]);
  });
  return (
    <group ref={ref} position={[konum[0], konum[1] + 0.16, konum[2]]}>
      {children}
    </group>
  );
}

// Topun üstüne süsleme ve sos (belge bölüm 3, adım 4)
const SEKER_RENKLERI = ['#ff6f7d', '#ffc928', '#5fb7e8', '#9b5fc9', '#5fd08a', '#fffaf2'];

function ustYuzeyNoktalari(sayi: number, tohum: number) {
  // Topun üst yarısına dağılmış noktalar (birim küre üzerinde)
  const noktalar: THREE.Vector3[] = [];
  for (let i = 0; i < sayi; i++) {
    const a = i * 2.399 + tohum;
    const y = 0.35 + ((i * 0.618 + tohum * 0.37) % 1) * 0.6;
    const r = Math.sqrt(1 - y * y);
    noktalar.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return noktalar;
}

function TopSuslemesi({ tur, yaricap, tohum }: { tur: Susleme; yaricap: number; tohum: number }) {
  const noktalar = useMemo(() => ustYuzeyNoktalari(tur === 'seker' ? 22 : 9, tohum), [tur, tohum]);
  if (tur === 'sos') {
    return (
      <group scale={yaricap}>
        {/* Topun tepesini saran çikolata sosu ve damlalar */}
        <mesh position={[0, 0.12, 0]} scale={[1.06, 0.62, 1.06]}>
          <sphereGeometry args={[1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#5a2e1c" roughness={0.25} flatShading />
        </mesh>
        {[0, 2.1, 4.2].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.95, 0.0, Math.sin(a) * 0.95]}>
            <sphereGeometry args={[0.16, 6, 4]} />
            <meshStandardMaterial color="#5a2e1c" roughness={0.25} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <group scale={yaricap}>
      {noktalar.map((n, i) =>
        tur === 'seker' ? (
          <mesh key={i} position={n.clone().multiplyScalar(1.02)} rotation={[i, i * 2, 0]}>
            <boxGeometry args={[0.24, 0.07, 0.07]} />
            <meshStandardMaterial color={SEKER_RENKLERI[i % SEKER_RENKLERI.length]} roughness={0.6} />
          </mesh>
        ) : (
          <mesh key={i} position={n.clone().multiplyScalar(1.03)} rotation={[i, i * 1.3, 0]}>
            <icosahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color={i % 2 ? '#c48a4a' : '#a86d36'} roughness={0.9} flatShading />
          </mesh>
        ),
      )}
    </group>
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

// Kup: ayaklı cam kâse (geçici model)
function Kup() {
  return (
    <group position={[0, -0.04, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.095, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.45} roughness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.12, 8]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.6} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.015, 14]} />
        <meshStandardMaterial color={renk.mor} />
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
// Altlığın tutulduğu halka (ileride eller gelince kalkacak)
function AltlikStandi() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) altlikYeri(ref.current.position);
  });
  return (
    <group ref={ref} position={ALTLIK_KONUM.toArray()}>
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.007, 6, 16]} />
        <meshStandardMaterial color={renk.vitrinMetal} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

function topKonumlari(altlik: 'kulah' | 'kap' | 'kup', toplar: Top[]): [number, number, number][] {
  const r = toplar.map((t) => topYaricapi(t.boyut));
  if (altlik === 'kulah') {
    let y = 0.01;
    return r.map((ri, i) => {
      y += i === 0 ? ri * 0.55 : ri * 1.25;
      return [0, y, 0];
    });
  }
  // Kup: toplar kâsenin içine iner, üst üste ama biraz kaydırılmış
  if (altlik === 'kup') {
    let y = -0.03;
    return r.map((ri, i) => {
      y += i === 0 ? ri * 0.5 : ri * 1.05;
      return [i === 1 ? -ri * 0.35 : i === 2 ? ri * 0.35 : 0, y, 0];
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
  const yer = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (durum.asama === 'servis') {
      // Servis: müşteriye doğru uzanıp küçülür
      if (servisBasladi.current === null) servisBasladi.current = performance.now();
      const t = Math.min(1, (performance.now() - servisBasladi.current) / 900);
      if (durum.servisDogru) {
        g.position.lerpVectors(altlikYeri(yer), new THREE.Vector3(0, 1.45, -1.3), t);
        g.scale.setScalar(1 - t * 0.6);
      } else {
        // Yanlış sipariş: dondurma kenara bırakılır (ceza yok)
        g.position.lerpVectors(altlikYeri(yer), new THREE.Vector3(-1.1, 1.2, 0.1), t);
        g.scale.setScalar(1 - t);
      }
    } else {
      servisBasladi.current = null;
      g.position.lerp(altlikYeri(yer), 1 - Math.exp(-dt * 12));
      g.scale.setScalar(1);
    }
  });

  // Serpinti yalnız süsleme eklenince (kaldırınca değil)
  const serpinti = useRef({ son: 0, sayac: 0 });
  if (durum.susleme.length > serpinti.current.son) serpinti.current.sayac++;
  serpinti.current.son = durum.susleme.length;

  if (!durum.altlik) return null;

  // Toplar altlığa göre farklı dizilir: külahta üst üste,
  // kapta yan yana (üçüncüsü ikisinin üstüne).
  const konumlar = topKonumlari(durum.altlik, durum.toplar);
  const toplar = durum.toplar.map((top, i) => (
    <InenTop key={i} konum={konumlar[i]}>
      <DondurmaTopu top={top} tohum={i * 3 + top.kuvet} />
      {durum.susleme.map((s) => (
        <TopSuslemesi key={s} tur={s} yaricap={topYaricapi(top.boyut)} tohum={i + 1} />
      ))}
    </InenTop>
  ));

  // Efektler: son konan topun üstünde (MÜKEMMEL kıvılcımı, süsleme serpintisi)
  const ust = konumlar.length ? konumlar[konumlar.length - 1] : ([0, 0.05, 0] as [number, number, number]);
  const bildirim = durum.bildirim;
  const kivilcim = bildirim?.tur === 'top' && bildirim.sonuc === 'mukemmel' ? bildirim.zaman : 0;
  return (
    <group ref={ref} position={ALTLIK_KONUM.toArray()}>
      <group position={[ust[0], ust[1] + 0.03, ust[2]]}>
        <Parcaciklar tetik={kivilcim} tur="kivilcim" renkler={['#fff6b0', '#ffc928', '#ffffff']} />
        <Parcaciklar tetik={serpinti.current.sayac} tur="serpinti" renkler={SERPINTI_RENKLERI} />
      </group>
      {durum.altlik === 'kulah' ? <Kulah /> : durum.altlik === 'kup' ? <Kup /> : <Kap />}
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
    let topRengi: string = CESITLER[0].renk;
    let egim = -0.5;

    if (d.asama === 'dolduruyor' && d.kepceKuvet !== null) {
      // Küvete daldır: aşağı inip hafifçe ileri geri sürüklenir
      const dolum = dolumHesapla(performance.now());
      const yer = kuvetKonumu(d.kepceKuvet, d.vitrin);
      const k = { x: yer.x, renk: CESITLER[d.kepceKuvet].renk };
      hedef.set(k.x + Math.sin(clock.elapsedTime * 5) * 0.05 * yer.olcekZ, KUVET_Y + 0.07, yer.z + 0.08 * yer.olcekZ);
      topBoyu = dolum;
      topRengi = k.renk;
      egim = -1.0;
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
        <meshStandardMaterial color={CESITLER[0].renk} roughness={0.55} flatShading />
      </mesh>
    </group>
  );
}

export function Hazirlama() {
  // Kepçe ve altlık yalnız tezgah görünümünde (oyuncunun eli yerinde)
  return (
    <TezgahtaGorunur>
      <AltlikStandi />
      <AltlikVeToplar />
      <Kepce />
    </TezgahtaGorunur>
  );
}
