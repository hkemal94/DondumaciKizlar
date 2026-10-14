import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, makineDolumu, pismeOrani, useDurum, yardimciCalisiyor } from '../oyun/durum';
import { ICECEKLER, ICECEK_RENGI, parcaYerleri, type Icecek, type ParcaYeri, type Yardimci } from '../oyun/makine';
import { renk } from './renkler';
import { InsanKarakter, type Hareket } from './InsanKarakter';
import { rastgeleVaryant } from './karakterler';

// Tezgah parçaları (belge 0.5, 0.6): tezgah bölümünün uçlarına eklenen waffle
// makinesi, içecek standı, ikinci servis noktası ve köşe.
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

// Waffle'ın üstündeki süslemeler: her biri kendi adıyla bir grup; birden
// çoğu aynı anda görünebilsin diye ayrı yerlerde (belge 0.6)
const CIKOLATA_RENGI: Record<string, string> = { sutluCikolata: '#7b4a2a', bitterCikolata: '#3b1f12', beyazCikolata: '#f3e6cf' };
function Taneler({ ad, renkAdi, sayi, r, yaricap, aci = 0, yukseklik = 0.02 }: { ad: string; renkAdi: string; sayi: number; r: number; yaricap: number; aci?: number; yukseklik?: number }) {
  return (
    <group name={ad}>
      {Array.from({ length: sayi }, (_, i) => (
        <mesh key={i} position={[Math.cos(aci + (i * Math.PI * 2) / sayi) * yaricap, yukseklik, Math.sin(aci + (i * Math.PI * 2) / sayi) * yaricap]}>
          <sphereGeometry args={[r, 6, 5]} />
          <meshStandardMaterial color={renkAdi} flatShading />
        </mesh>
      ))}
    </group>
  );
}
function Dilimler({ ad, renkAdi, ic, aci }: { ad: string; renkAdi: string; ic: string; aci: number }) {
  return (
    <group name={ad}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[Math.cos(aci + i * 2.1) * 0.1, 0.02, Math.sin(aci + i * 2.1) * 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.035, 0.035, 0.012, 10]} />
            <meshStandardMaterial color={renkAdi} />
          </mesh>
          <mesh position={[0, 0.007, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.002, 8]} />
            <meshStandardMaterial color={ic} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function WaffleSusleri() {
  return (
    <>
      {/* Çikolatalar: üst üste binmesin diye farklı genişlikte halkalar */}
      {(['sutluCikolata', 'bitterCikolata', 'beyazCikolata'] as const).map((ad, i) => (
        <mesh key={ad} name={ad} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002 + i * 0.002, 0]}>
          <ringGeometry args={[0.04 + i * 0.045, 0.07 + i * 0.045, 12]} />
          <meshStandardMaterial color={CIKOLATA_RENGI[ad]} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Taneler ad="cilek" renkAdi="#e2384b" sayi={3} r={0.032} yaricap={0.11} aci={0.3} />
      <Dilimler ad="muz" renkAdi="#fbf0b5" ic="#e6d27a" aci={1.2} />
      <Dilimler ad="kivi" renkAdi="#7cbf3a" ic="#2f2a1f" aci={2.2} />
      <Taneler ad="bogurtlen" renkAdi="#3b1d4a" sayi={4} r={0.024} yaricap={0.06} aci={0.8} />
      <Taneler ad="findik" renkAdi="#9a6233" sayi={6} r={0.014} yaricap={0.135} aci={0.1} yukseklik={0.012} />
      <group name="renkliSeker">
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 1.7) * 0.12 * ((i % 3) / 3 + 0.4), 0.012, Math.sin(i * 1.7) * 0.12 * ((i % 3) / 3 + 0.4)]} rotation={[0, i, 0]}>
            <boxGeometry args={[0.025, 0.006, 0.006]} />
            <meshStandardMaterial color={['#ff6f7d', '#ffc928', '#5fd08a', '#7ec8e8', '#9b5fc9'][i % 5]} />
          </mesh>
        ))}
      </group>
      <group name="hindistanCevizi">
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 2.3) * 0.1 * ((i % 4) / 4 + 0.3), 0.01, Math.sin(i * 2.3) * 0.1 * ((i % 4) / 4 + 0.3)]} rotation={[0, i, 0.3]}>
            <boxGeometry args={[0.02, 0.004, 0.01]} />
            <meshStandardMaterial color="#fffaf0" />
          </mesh>
        ))}
      </group>
      <mesh name="pudra" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]}>
        <circleGeometry args={[0.17, 10]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
    </>
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
      {/* Süslemeler (adları süsleme adlarıyla aynı; belge 0.6) */}
      <group ref={susler} position={[0, 0.165, 0]} visible={false}>
        <WaffleSusleri />
      </group>
      {/* Kapak: arka kenarından açılır */}
      <group ref={kapak} position={[0, 0.12, 0.28]}>
        <Kutu konum={[0, 0.05, -0.28]} boyut={[0.6, 0.1, 0.56]} renkAdi="#3b3a40" puruz={0.5} />
        <Kutu konum={[0, 0.06, -0.58]} boyut={[0.22, 0.05, 0.08]} renkAdi={renk.mor} />
      </group>
    </group>
  );
}

// İçecek standı (belge 0.6): tezgahın üstünde camı çalışana dönük soğutucu
// dolap; içinde her içecekten bir sıra kutu / şişe. Alınanlar müşteri
// tarafında tezgahın önüne dizilir.
function IcecekKutusu({ i, sise = false }: { i: Icecek; sise?: boolean }) {
  return sise ? (
    <group>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.03, 0.032, 0.14, 8]} />
        <meshStandardMaterial color={ICECEK_RENGI[i]} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.012, 0.025, 0.05, 8]} />
        <meshStandardMaterial color={ICECEK_RENGI[i]} roughness={0.3} />
      </mesh>
    </group>
  ) : (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.12, 10]} />
        <meshStandardMaterial color={ICECEK_RENGI[i]} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.122, 0]}>
        <cylinderGeometry args={[0.028, 0.032, 0.006, 10]} />
        <meshStandardMaterial color="#c9d0d6" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function IcecekStandi() {
  const alinanlar = useRef<THREE.Group>(null);
  const [icindekiler, setIcindekiler] = useState<Icecek[]>([]);
  useFrame(() => {
    const d = durumuOku();
    const liste = d.istasyon === 'icecek' ? d.makine.icecekler : [];
    if (liste.join() !== icindekiler.join()) setIcindekiler(liste);
  });
  return (
    <group>
      {/* Dolap: arkası (müşteri tarafı) mor, çalışana dönük cam kapak */}
      <group position={[0, 0.97, -0.62]}>
        {/* Gövde: arka, yanlar ve taban (içi boş, kutular camın ardından görünsün) */}
        <Kutu konum={[0, 0.32, -0.22]} boyut={[1.1, 0.64, 0.06]} renkAdi={renk.mor} />
        {[-0.53, 0.53].map((x) => (
          <Kutu key={x} konum={[x, 0.32, 0.02]} boyut={[0.04, 0.64, 0.5]} renkAdi={renk.mor} />
        ))}
        <Kutu konum={[0, 0.02, 0.02]} boyut={[1.1, 0.04, 0.5]} renkAdi={renk.mor} />
        <Kutu konum={[0, 0.32, -0.18]} boyut={[1.02, 0.56, 0.02]} renkAdi="#eef6fb" />
        {[0.2, 0.46].map((y) => (
          <Kutu key={y} konum={[0, y - 0.04, 0.05]} boyut={[1.0, 0.015, 0.4]} renkAdi="#c9d0d6" />
        ))}
        {ICECEKLER.map((i, n) =>
          [0, 1].map((raf) => (
            <group key={`${i}${raf}`} position={[-0.4 + n * 0.2, raf ? 0.42 : 0.16, 0.12]}>
              <IcecekKutusu i={i} sise={raf === 1} />
            </group>
          )),
        )}
        <mesh position={[0, 0.32, 0.26]}>
          <boxGeometry args={[1.04, 0.58, 0.02]} />
          <meshPhysicalMaterial color={renk.cam} transparent opacity={0.22} roughness={0.05} />
        </mesh>
        <Kutu konum={[0, 0.66, 0]} boyut={[1.12, 0.05, 0.52]} renkAdi={renk.sari} />
      </group>
      {/* Alınan içecekler: tezgahın önünde müşteriye doğru */}
      <group ref={alinanlar} position={[0.75, 0.97, -0.75]}>
        {icindekiler.map((i, n) => (
          <group key={n} position={[0, 0, n * 0.12 - 0.1]}>
            <IcecekKutusu i={i} />
          </group>
        ))}
      </group>
    </group>
  );
}

// İkinci servis noktası: kasa ve waffle / içecek resimli küçük pano
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
      ) : (
        <>
          <ParcaTezgahi en={p.en} />
          {p.tur === 'waffle' && <WaffleMakinesi />}
          {p.tur === 'icecek' && <IcecekStandi />}
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
    <group position={[x, 0, 0.75]} rotation={[0, Math.PI, 0]}>
      <InsanKarakter varyant={varyant} hareket={hareket} />
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
