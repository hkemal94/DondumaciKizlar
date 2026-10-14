import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, makineDolumu, pismeOrani, useDurum, yardimciCalisiyor } from '../oyun/durum';
import { parcaYerleri, type ParcaYeri, type Yardimci } from '../oyun/makine';
import { renk } from './renkler';
import { Vitrin } from './Dukkan';
import { KenneyKarakter, type Hareket } from './KenneyKarakter';
import { rastgeleVaryant } from './karakterler';

// Tezgah parçaları (belge 0.5): tezgah bölümünün uçlarına eklenen waffle
// makinesi, limonata sebili, ikinci vitrin, ikinci servis noktası ve köşe.
// Tezgah bölümünün içinde çizilir (bölümle birlikte taşınır). Kodla çizilmiş
// geçici parçalar.

function Kutu({ konum, boyut, renkAdi, puruz = 0.8 }: { konum: [number, number, number]; boyut: [number, number, number]; renkAdi: string; puruz?: number }) {
  return (
    <mesh position={konum} castShadow receiveShadow>
      <boxGeometry args={boyut} />
      <meshStandardMaterial color={renkAdi} roughness={puruz} />
    </mesh>
  );
}

// Her parçanın altındaki tezgah: önde müşteri tarafı, arkada dolap
function ParcaTezgahi({ en }: { en: number }) {
  return (
    <group>
      <Kutu konum={[0, 0.46, -0.62]} boyut={[en - 0.06, 0.92, 0.9]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[0, 0.94, -0.62]} boyut={[en, 0.05, 1.0]} renkAdi={renk.tezgahUst} puruz={0.6} />
      <Kutu konum={[0, 0.45, 1.68]} boyut={[en - 0.06, 0.9, 0.55]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[0, 0.92, 1.68]} boyut={[en, 0.05, 0.62]} renkAdi={renk.tezgahUst} puruz={0.6} />
    </group>
  );
}

// Waffle makinesi: altta pişiren plaka, arkadan menteşeli kapak. Oyuncu
// waffle istasyonundayken kapak ve waffle'ın rengi o anki duruma göre.
const HAMUR = new THREE.Color('#f3dca6');
const ALTIN = new THREE.Color('#d99b3c');
const YANIK = new THREE.Color('#5a3418');
function WaffleMakinesi() {
  const kapak = useRef<THREE.Group>(null);
  const waffle = useRef<THREE.Mesh>(null);
  const malzeme = useMemo(() => new THREE.MeshStandardMaterial({ color: HAMUR, roughness: 0.8, flatShading: true }), []);
  const susler = useRef<THREE.Group>(null); // başta gizli; useFrame açar
  useFrame((_, dt) => {
    const d = durumuOku();
    const m = d.makine;
    const benim = d.istasyon === 'waffle';
    const acik = !benim || m.asama === 'bos' || m.asama === 'dokuluyor' || m.asama === 'acildi' || m.asama === 'servis';
    if (kapak.current) kapak.current.rotation.x = THREE.MathUtils.damp(kapak.current.rotation.x, acik ? -1.6 : 0, 8, dt);
    if (!waffle.current) return;
    const gorunur = benim && m.asama !== 'bos';
    waffle.current.visible = gorunur;
    // Süslemeler yalnız açılmış waffle'ın üstünde, seçilenler
    if (susler.current) {
      susler.current.visible = gorunur && (m.asama === 'acildi' || m.asama === 'servis');
      susler.current.children.forEach((c) => (c.visible = m.susleme.includes(c.name as never)));
    }
    if (!gorunur) return;
    // Hamur dökülürken büyür; pişerken altına, sonra yanığa döner
    const simdi = performance.now();
    const boy = m.asama === 'dokuluyor' ? 0.3 + makineDolumu(simdi, d) * 0.8 : 1;
    waffle.current.scale.set(boy, 1, boy);
    let oran = m.asama === 'pisiyor' ? pismeOrani(simdi, d) : m.pisme === 'altin' ? 0.72 : m.pisme === 'yanik' ? 1.05 : m.pisme === 'soluk' ? 0.4 : 0;
    oran = Math.min(1.1, oran);
    malzeme.color.copy(HAMUR).lerp(ALTIN, Math.min(1, oran / 0.72));
    if (oran > 0.84) malzeme.color.lerp(YANIK, Math.min(1, (oran - 0.84) / 0.3));
  });
  return (
    <group position={[0, 0.97, -0.6]}>
      {/* Gövde ve pişirme plakası */}
      <Kutu konum={[0, 0.06, 0]} boyut={[0.62, 0.12, 0.56]} renkAdi="#3b3a40" puruz={0.5} />
      <Kutu konum={[0, 0.125, 0]} boyut={[0.5, 0.01, 0.46]} renkAdi="#6d6b72" puruz={0.4} />
      <mesh ref={waffle} position={[0, 0.14, 0]} material={malzeme}>
        <cylinderGeometry args={[0.19, 0.19, 0.035, 8]} />
      </mesh>
      {/* Süslemeler (adları süsleme adlarıyla aynı) */}
      <group ref={susler} position={[0, 0.165, 0]} visible={false}>
        <mesh name="cikolata" rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 8]} />
          <meshStandardMaterial color="#4a2614" roughness={0.4} />
        </mesh>
        <group name="cilek">
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.cos(i * 1.6) * 0.09, 0.02, Math.sin(i * 1.6) * 0.09]}>
              <sphereGeometry args={[0.035, 6, 5]} />
              <meshStandardMaterial color="#e2384b" flatShading />
            </mesh>
          ))}
        </group>
        <mesh name="pudra" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <circleGeometry args={[0.13, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      </group>
      {/* Kapak: arka kenarından açılır */}
      <group ref={kapak} position={[0, 0.12, 0.28]}>
        <Kutu konum={[0, 0.05, -0.28]} boyut={[0.6, 0.1, 0.56]} renkAdi="#3b3a40" puruz={0.5} />
        <Kutu konum={[0, 0.06, -0.58]} boyut={[0.22, 0.05, 0.08]} renkAdi={renk.mor} />
      </group>
    </group>
  );
}

// Limonata sebili: cam kavanozda limonata, musluk, altında bardak
function LimonataSebili() {
  const sivi = useRef<THREE.Mesh>(null);
  const buzlar = useRef<THREE.Group>(null);
  const bardak = useRef<THREE.Group>(null);
  useFrame(() => {
    const d = durumuOku();
    const m = d.makine;
    const benim = d.istasyon === 'limonata';
    if (bardak.current) bardak.current.visible = benim && m.asama !== 'bos';
    if (!sivi.current) return;
    const dolum = m.asama === 'doluyor' ? makineDolumu(performance.now(), d) : m.sonuc === 'mukemmel' ? 0.71 : m.sonuc === 'iyi' ? 0.6 : m.sonuc === 'buyuk' ? 1 : 0.4;
    const h = Math.max(0.001, Math.min(1, dolum)) * 0.17;
    sivi.current.scale.y = h / 0.17;
    sivi.current.position.y = 0.01 + h / 2;
    if (buzlar.current) buzlar.current.visible = benim && m.buz;
  });
  return (
    // Musluk ve bardak çalışana dönük: yakın planda kavanoz bardağı kapatmasın
    <group position={[0, 0.97, -0.62]} rotation={[0, Math.PI, 0]}>
      {/* Ayak ve kavanoz */}
      <Kutu konum={[0, 0.12, 0.08]} boyut={[0.34, 0.24, 0.3]} renkAdi={renk.mor} />
      <mesh position={[0, 0.5, 0.08]}>
        <cylinderGeometry args={[0.17, 0.17, 0.5, 12]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.3} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.45, 0.08]}>
        <cylinderGeometry args={[0.155, 0.155, 0.38, 12]} />
        <meshStandardMaterial color="#f7e36a" transparent opacity={0.85} />
      </mesh>
      {/* Kavanozdaki limon dilimleri */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.08, 0.38 + i * 0.09, 0.08 + Math.sin(i * 2.1) * 0.08]} rotation={[0.4, i, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.012, 10]} />
          <meshStandardMaterial color="#ffe14d" />
        </mesh>
      ))}
      <Kutu konum={[0, 0.2, -0.1]} boyut={[0.06, 0.05, 0.12]} renkAdi="#c9d0d6" puruz={0.3} />
      {/* Bardak ve dolan limonata */}
      <group ref={bardak} position={[0, 0.0, -0.16]}>
        <mesh position={[0, 0.095, 0]}>
          <cylinderGeometry args={[0.065, 0.055, 0.19, 12, 1, true]} />
          <meshPhysicalMaterial color={renk.cam} transparent opacity={0.35} roughness={0.05} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={sivi} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.058, 0.052, 0.17, 12]} />
          <meshStandardMaterial color="#f7e36a" />
        </mesh>
        <group ref={buzlar}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos(i * 2) * 0.025, 0.16, Math.sin(i * 2) * 0.025]} rotation={[i, i * 0.7, 0]}>
              <boxGeometry args={[0.035, 0.035, 0.035]} />
              <meshPhysicalMaterial color="#e8f7ff" transparent opacity={0.8} roughness={0.1} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// İkinci servis noktası: kasa ve waffle / limon resimli küçük pano
function ServisNoktasi() {
  return (
    <group>
      <group position={[0.35, 0.97, -0.5]}>
        <Kutu konum={[0, 0.12, 0]} boyut={[0.45, 0.24, 0.38]} renkAdi={renk.mor} />
        <mesh position={[0, 0.3, -0.05]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.38, 0.04, 0.2]} />
          <meshStandardMaterial color="#4e2470" />
        </mesh>
      </group>
      {/* Pano: mor zemin, sarı çerçeve; waffle (ızgara) ve limon */}
      <group position={[-0.35, 1.45, -0.95]}>
        <Kutu konum={[0, 0, 0]} boyut={[0.7, 0.42, 0.04]} renkAdi={renk.sari} />
        <Kutu konum={[0, 0, -0.025]} boyut={[0.64, 0.36, 0.02]} renkAdi={renk.mor} />
        <Kutu konum={[-0.15, 0, -0.04]} boyut={[0.2, 0.2, 0.01]} renkAdi="#d99b3c" />
        <mesh position={[0.15, 0, -0.05]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#ffe14d" />
        </mesh>
        <Kutu konum={[0, -0.42, 0.01]} boyut={[0.04, 0.5, 0.04]} renkAdi={renk.ahsapKoyu} />
      </group>
    </group>
  );
}

// Köşe (süs): ucu kapatan, öne doğru dönen L parçası
function Kose({ yan }: { yan: 1 | -1 }) {
  return (
    <group>
      <Kutu konum={[0, 0.46, -0.62]} boyut={[0.94, 0.92, 0.9]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[0, 0.94, -0.62]} boyut={[1, 0.05, 1.0]} renkAdi={renk.tezgahUst} puruz={0.6} />
      {/* Yan kol: bölümün dış ucunu boydan boya kapatır */}
      <Kutu konum={[yan * 0.3, 0.46, 0.55]} boyut={[0.4, 0.92, 1.45]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[yan * 0.3, 0.94, 0.55]} boyut={[0.46, 0.05, 1.5]} renkAdi={renk.tezgahUst} puruz={0.6} />
      {/* Kolun üstünde mor-sarı şerit */}
      <Kutu konum={[yan * 0.52, 0.62, -0.1]} boyut={[0.02, 0.4, 2.4]} renkAdi={renk.mor} />
      <Kutu konum={[yan * 0.52, 0.86, -0.1]} boyut={[0.02, 0.06, 2.4]} renkAdi={renk.sari} />
      <Kutu konum={[0, 0.46, 1.68]} boyut={[0.94, 0.9, 0.55]} renkAdi={renk.ahsapOrta} />
    </group>
  );
}

function Parca({ p }: { p: ParcaYeri }) {
  return (
    <group position={[p.x, 0, 0]}>
      {p.tur === 'kose' ? (
        <Kose yan={p.yan} />
      ) : p.tur === 'vitrin2' ? (
        <>
          <Vitrin ikinci />
          {/* Vitrinin iki yanında dar tezgah ve arkada dolap */}
          <Kutu konum={[0, 0.45, 1.68]} boyut={[p.en - 0.06, 0.9, 0.55]} renkAdi={renk.ahsapOrta} />
          <Kutu konum={[0, 0.92, 1.68]} boyut={[p.en, 0.05, 0.62]} renkAdi={renk.tezgahUst} puruz={0.6} />
        </>
      ) : (
        <>
          <ParcaTezgahi en={p.en} />
          {p.tur === 'waffle' && <WaffleMakinesi />}
          {p.tur === 'limonata' && <LimonataSebili />}
          {p.tur === 'servis' && <ServisNoktasi />}
        </>
      )}
    </group>
  );
}

// Yardımcı: kendi istasyonunun arkasında, önlüklü; sipariş hazırlarken çalışır
function YardimciKarakter({ y, x }: { y: Yardimci; x: number }) {
  const varyant = useMemo(() => {
    const v = rastgeleVaryant(y.tohum);
    return { ...v, aksesuarlar: [] };
  }, [y.tohum]);
  const hareket = useRef<Hareket>('dur');
  useFrame(() => {
    hareket.current = yardimciCalisiyor(y.id) ? 'calis' : 'dur';
  });
  return (
    <group position={[x, 0.12, 0.75]} rotation={[0, Math.PI, 0]} scale={1.18}>
      <KenneyKarakter varyant={varyant} hareket={hareket} />
    </group>
  );
}

export function TezgahParcalari() {
  const d = useDurum();
  const yerler = parcaYerleri(d.tezgah, d.tezgahParcalari);
  // Yardımcıların yeri: dondurmada bölümün ortası, makinede o parça
  const yardimcilar = d.yardimcilar
    .filter((y) => y.istasyon && y.istasyon !== d.istasyon)
    .map((y) => ({ y, x: y.istasyon === 'dondurma' ? 0 : (yerler.find((p) => p.tur === y.istasyon)?.x ?? null) }))
    .filter((a): a is { y: Yardimci; x: number } => a.x !== null);
  return (
    <group>
      {yerler.map((p) => (
        <Parca key={p.tur} p={p} />
      ))}
      {!d.hazirlik &&
        yardimcilar.map(({ y, x }) => (
          <YardimciKarakter key={y.id} y={y} x={x} />
        ))}
    </group>
  );
}
