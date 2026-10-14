import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, musteriTezgahaVardi, musteriyiKaldir, ondekiMusteri, useDurum, type Durum, type Musteri } from '../oyun/durum';
import { HUCRELER } from '../oyun/dekorasyon';
import { KAPI_X } from './Dukkan';
import { renk } from './renkler';

// Tezgah önünde sıraya giren müşteriler (iş sırası 3).
// Kodla çizilmiş geçici low-poly ada sakinleri; adları, hikâyeleri yok.
// Dört görünüm (belge 7.1 önerisi: 3–4 müşteri görünümü).

interface Gorunum {
  ten: string;
  ust: string;
  alt: string;
  sac: string;
  boy: number;
  sapka: boolean;
  uzunSac: boolean;
}

export const musteriGorunumleri: Gorunum[] = [
  { ten: '#e9b48f', ust: '#ffd25a', alt: '#d98a3d', sac: '#5a3825', boy: 1.0, sapka: true, uzunSac: true },
  { ten: '#c98e66', ust: '#5fa8d3', alt: '#3d4f6b', sac: '#2b211c', boy: 1.06, sapka: false, uzunSac: false },
  { ten: '#8d5a3b', ust: '#ef7a7a', alt: '#f2efe6', sac: '#1d1512', boy: 0.97, sapka: false, uzunSac: true },
  { ten: '#f1c9a5', ust: '#8fcf8a', alt: '#6c5a8e', sac: '#b8763e', boy: 1.03, sapka: true, uzunSac: false },
];

// Sıradaki yerler: öndeki tezgahın ortasında, diğerleri sola doğru dizilir.
const ON_YER = new THREE.Vector3(0, 0, -1.62);
// Müşteri yolu (Kemal, 13 Ekim): iskelenin iki ucundan birinden, kameranın
// dışından yürüyerek gelir; kapıdan girer, sıraya geçer. Giderken kapıdan
// çıkıp yine iki uçtan birine yürür ve ekrandan çıkınca silinir.
const ISKELE_Z = -4.1; // terastaki yürüme yolu
const ISKELE_UCU = 17; // kameranın dışı
const KAPI_DIS = new THREE.Vector3(KAPI_X, 0, -3.1);
const KAPI_IC = new THREE.Vector3(KAPI_X, 0, -2.05);

function siraYeri(sira: number, hedef: THREE.Vector3) {
  if (sira === 0) return hedef.copy(ON_YER);
  return hedef.set(-0.82 * sira, 0, -1.85 - 0.04 * sira);
}

// Bacaklar kalçadan ve dizden bükülür: otururken uyluk öne, baldır aşağı
function Govde({ g, oturuyor = false }: { g: Gorunum; oturuyor?: boolean }) {
  const kafa = useMemo(() => new THREE.IcosahedronGeometry(0.13, 1), []);
  return (
    <group scale={g.boy}>
      {/* Bacaklar */}
      {[-0.08, 0.08].map((x) => (
        <group key={x} position={[x, 0.76, 0]} rotation={[oturuyor ? -Math.PI / 2 : 0, 0, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <boxGeometry args={[0.11, 0.38, 0.13]} />
            <meshStandardMaterial color={g.alt} roughness={0.85} flatShading />
          </mesh>
          <group position={[0, -0.38, 0]} rotation={[oturuyor ? Math.PI / 2 : 0, 0, 0]}>
            <mesh position={[0, -0.19, 0]} castShadow>
              <boxGeometry args={[0.11, 0.38, 0.13]} />
              <meshStandardMaterial color={g.alt} roughness={0.85} flatShading />
            </mesh>
          </group>
        </group>
      ))}
      {/* Otururken elinde külah */}
      {oturuyor && (
        <group position={[0.2, 1.0, 0.2]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.045, 0.14, 8]} />
            <meshStandardMaterial color="#d9a35b" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <icosahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial color="#ff8fa0" roughness={0.6} flatShading />
          </mesh>
        </group>
      )}
      {/* Gövde */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.21, 0.56, 7]} />
        <meshStandardMaterial color={g.ust} roughness={0.85} flatShading />
      </mesh>
      {/* Kollar */}
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} position={[x, 0.98, 0]} rotation={[0, 0, x > 0 ? 0.12 : -0.12]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.09]} />
          <meshStandardMaterial color={g.ten} roughness={0.8} flatShading />
        </mesh>
      ))}
      {/* Baş */}
      <mesh geometry={kafa} position={[0, 1.45, 0]} castShadow>
        <meshStandardMaterial color={g.ten} roughness={0.8} flatShading />
      </mesh>
      {/* Gözler */}
      {[-0.045, 0.045].map((x) => (
        <mesh key={x} position={[x, 1.47, 0.12]}>
          <sphereGeometry args={[0.015, 6, 4]} />
          <meshStandardMaterial color="#2a1d17" />
        </mesh>
      ))}
      {/* Saç */}
      <mesh position={[0, 1.5, -0.02]} scale={[1.08, 0.85, 1.08]}>
        <sphereGeometry args={[0.135, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={g.sac} roughness={0.9} flatShading />
      </mesh>
      {g.uzunSac && (
        <mesh position={[0, 1.36, -0.08]}>
          <boxGeometry args={[0.27, 0.3, 0.1]} />
          <meshStandardMaterial color={g.sac} roughness={0.9} flatShading />
        </mesh>
      )}
      {/* Hasır şapka */}
      {g.sapka && (
        <group position={[0, 1.57, 0]}>
          <mesh>
            <cylinderGeometry args={[0.27, 0.27, 0.02, 10]} />
            <meshStandardMaterial color="#e3c58a" roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.11, 10]} />
            <meshStandardMaterial color="#e3c58a" roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.142, 0.142, 0.03, 10]} />
            <meshStandardMaterial color={renk.mor} roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ---- Masalarda oturma (Kemal, 14 Ekim) ----
// Mutlu giden müşterinin bir kısmı boş bir sandalye varsa oturur, yer, gider.
// Hangi sandalyenin dolu olduğu yalnız sahnede tutulur (kayda girmez).
const OTURMA_OLASILIGI = 0.6;
const OTURMA_SURESI: [number, number] = [10, 16]; // saniye
const SANDALYE_ARALIGI = 0.62 * 0.85; // Dekorlar'daki masa ölçüsü
const KOSE_Y = -3.0; // dükkânın köşesini dönerken geçilen hat
const OTURAK_Y = 0.4; // sandalye oturağının masa zeminine göre yüksekliği

interface Koltuk {
  anahtar: string;
  yer: THREE.Vector3;
  bakis: number; // masaya dönük
  ic: boolean;
  yan: 0 | 1 | -1; // dükkânın yanındaki alanlardan biri mi
}

const doluKoltuklar = new Map<string, number>(); // anahtar → müşteri

function bosKoltuk(d: Durum): Koltuk | null {
  const bos: Koltuk[] = [];
  for (const y of d.yerlesim) {
    if (y.esya !== 'masa' && y.esya !== 'semsiyeliMasa') continue;
    const h = HUCRELER[y.hucre];
    if (!h || h.arkada) continue;
    const yan: 0 | 1 | -1 = !h.ic && h.z > -2.6 ? (h.x > 0 ? 1 : -1) : 0;
    for (const taraf of [1, -1]) {
      const anahtar = `${y.hucre}:${taraf}`;
      if (doluKoltuklar.has(anahtar)) continue;
      bos.push({
        anahtar,
        yer: new THREE.Vector3(h.x + taraf * (SANDALYE_ARALIGI - 0.05), h.ic ? 0 : 0.06, h.z),
        bakis: taraf > 0 ? -Math.PI / 2 : Math.PI / 2,
        ic: h.ic,
        yan,
      });
    }
  }
  return bos.length ? bos[Math.floor(Math.random() * bos.length)] : null;
}

type Asama = 'giris' | 'sirada' | 'masaya' | 'oturuyor' | 'cikiyor';

function TekMusteri({ musteri }: { musteri: Musteri }) {
  const ref = useRef<THREE.Group>(null);
  const icRef = useRef<THREE.Group>(null);
  const hedef = useMemo(() => new THREE.Vector3(), []);
  const baslangic = useMemo(
    () => new THREE.Vector3(musteri.gelisTarafi * ISKELE_UCU, 0, ISKELE_Z + ((musteri.id * 37) % 7) * 0.08 - 0.25),
    [musteri.gelisTarafi, musteri.id],
  );
  // Sıradaki yol noktaları: önce kapının dışı, sonra içi; sonra sıradaki yeri
  const yol = useRef<THREE.Vector3[]>([KAPI_DIS, KAPI_IC]);
  const asama = useRef<Asama>('giris');
  const koltuk = useRef<Koltuk | null>(null);
  const kalanOturma = useRef(0);
  const kaldirildi = useRef(false);
  const [oturuyor, setOturuyor] = useState(false);
  const g = musteriGorunumleri[musteri.gorunum % musteriGorunumleri.length];

  // Sahneden çıkınca sandalyeyi boşalt
  useEffect(
    () => () => {
      if (koltuk.current) doluKoltuklar.delete(koltuk.current.anahtar);
    },
    [],
  );

  useFrame(({ clock }, dt) => {
    const grup = ref.current;
    const ic = icRef.current;
    if (!grup || !ic) return;
    const d = durumuOku();
    const m = d.musteriler.find((x) => x.id === musteri.id);
    if (!m || d.duraklatildi) return; // duraklatınca herkes yerinde durur
    const son = new THREE.Vector3(m.gidisTarafi * ISKELE_UCU, 0, ISKELE_Z);

    // Servis bitti: ya bir masaya oturur ya da doğrudan gider
    if (m.hal === 'gidiyor' && (asama.current === 'giris' || asama.current === 'sirada')) {
      const k = m.mutlu && Math.random() < OTURMA_OLASILIGI ? bosKoltuk(d) : null;
      const cikis = new THREE.Vector3(grup.position.x, 0, -2.12);
      if (k) {
        doluKoltuklar.set(k.anahtar, m.id);
        koltuk.current = k;
        asama.current = 'masaya';
        yol.current = k.ic
          ? [cikis, new THREE.Vector3(k.yer.x, 0, -2.15), k.yer]
          : k.yan
            ? [cikis, KAPI_IC, KAPI_DIS, new THREE.Vector3(k.yan * 4.6, 0, KOSE_Y), k.yer]
            : [cikis, KAPI_IC, KAPI_DIS, new THREE.Vector3(k.yer.x, 0, ISKELE_Z), k.yer];
      } else {
        asama.current = 'cikiyor';
        yol.current = [cikis, KAPI_IC, KAPI_DIS, son];
      }
    }

    // Oturuyor: masaya dönük, yer; süre bitince kalkar
    if (asama.current === 'oturuyor' && koltuk.current) {
      const k = koltuk.current;
      grup.position.copy(k.yer);
      grup.rotation.y = k.bakis;
      // Kalça sandalyenin oturağına gelsin
      ic.position.y = OTURAK_Y - 0.76 * g.boy + Math.sin(clock.elapsedTime * 1.6 + musteri.id) * 0.004;
      kalanOturma.current -= dt;
      if (kalanOturma.current <= 0) {
        doluKoltuklar.delete(k.anahtar);
        asama.current = 'cikiyor';
        setOturuyor(false);
        yol.current = k.ic
          ? [new THREE.Vector3(k.yer.x, 0, -2.15), KAPI_IC, KAPI_DIS, son]
          : k.yan
            ? [new THREE.Vector3(k.yan * 4.6, 0, KOSE_Y), son]
            : [new THREE.Vector3(k.yer.x, 0, ISKELE_Z), son];
        koltuk.current = null;
      }
      return;
    }

    if (yol.current.length > 0) {
      hedef.copy(yol.current[0]);
      hedef.y = 0;
      if (grup.position.distanceTo(hedef) < 0.06) {
        yol.current = yol.current.slice(1);
        if (yol.current.length === 0) {
          if (asama.current === 'giris') asama.current = 'sirada';
          else if (asama.current === 'masaya') {
            asama.current = 'oturuyor';
            kalanOturma.current = OTURMA_SURESI[0] + Math.random() * (OTURMA_SURESI[1] - OTURMA_SURESI[0]);
            setOturuyor(true);
            return;
          } else if (asama.current === 'cikiyor' && !kaldirildi.current) {
            kaldirildi.current = true;
            musteriyiKaldir(m.id);
            return;
          }
        }
      }
    } else {
      const sira = d.musteriler.filter((x) => x.hal === 'sirada').findIndex((x) => x.id === m.id);
      siraYeri(sira, hedef);
    }

    // Yürüyüş: dışarıda biraz daha hızlı, içeride yavaş; gittiği yöne döner
    const fark = hedef.clone().sub(grup.position);
    fark.y = 0;
    const mesafe = fark.length();
    const disarida = grup.position.z < -2.6 || Math.abs(grup.position.x) > 4.2;
    const hiz = disarida ? 2.6 : 1.3;
    const yuruyor = mesafe > 0.02;
    if (yuruyor) grup.position.add(fark.clone().multiplyScalar(Math.min(1, (hiz * dt) / mesafe)));
    grup.position.y = 0;
    const bakis = yuruyor && mesafe > 0.05 ? Math.atan2(fark.x, fark.z) : 0; // durunca tezgaha bakar
    let aci = bakis - grup.rotation.y;
    aci = Math.atan2(Math.sin(aci), Math.cos(aci)); // en kısa yoldan dön
    grup.rotation.y += aci * Math.min(1, dt * 8);

    const t = clock.elapsedTime + musteri.id;
    const ziplama = yuruyor ? Math.abs(Math.sin(t * 9)) * 0.04 : Math.sin(t * 1.6) * 0.006;
    // Mutlu giden müşteri çıkarken sevinçle zıplar
    const sevinc = m.mutlu && asama.current === 'cikiyor' && yol.current.length >= 2 ? Math.abs(Math.sin(t * 7)) * 0.08 : 0;
    ic.position.y = ziplama + sevinc;
  });

  return (
    <group ref={ref} name={`musteri-${musteri.id}`} position={baslangic.toArray()}>
      <group ref={icRef}>
        <Govde g={g} oturuyor={oturuyor} />
      </group>
    </group>
  );
}

// Sipariş balonunun ekrandaki yeri: öndeki müşterinin başının üstü.
// Arayüz balon öğesini buraya bağlar; sahne her karede yerini günceller.
export const balon: { oge: HTMLDivElement | null } = { oge: null };

function BalonTakibi() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size, scene }) => {
    const oge = balon.oge;
    if (!oge) return;
    const m = ondekiMusteri(durumuOku());
    const nesne = m ? scene.getObjectByName(`musteri-${m.id}`) : undefined;
    if (!m || !nesne) {
      oge.style.opacity = '0';
      return;
    }
    nesne.getWorldPosition(v);
    // Yalnız yerine varınca göster
    const vardi = v.distanceTo(ON_YER) < 0.15;
    if (vardi) musteriTezgahaVardi(m.id);
    // Başın sağı: balon buradan aşağı doğru açılır (üstteki ipucu yazısıyla çakışmasın)
    v.x += 0.3;
    v.y += 1.5 * musteriGorunumleri[m.gorunum % musteriGorunumleri.length].boy;
    v.project(camera);
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((1 - v.y) / 2) * size.height;
    oge.style.transform = `translate(${x}px, ${y}px)`;
    oge.style.opacity = vardi ? '1' : '0';
  });
  return null;
}

export function Musteriler() {
  const { musteriler } = useDurum();
  return (
    <group>
      {musteriler.map((m) => (
        <TekMusteri key={m.id} musteri={m} />
      ))}
      <BalonTakibi />
    </group>
  );
}
