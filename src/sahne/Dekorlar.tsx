import * as THREE from 'three';
import { birimDolu, birimEngelli, birimIcMi, noktadakiEsya, noktayaKoy, useDurum, yerlesimiKaldir } from '../oyun/durum';
import {
  DUKKAN_PARSELLERI,
  ESYALAR,
  PARSEL,
  birimCoz,
  birimOrtasi,
  esyaOlcusu,
  esyaOrtasi,
  parselCoz,
  parselSiniri,
  type Esya,
} from '../oyun/dekorasyon';
import { renk } from './renkler';
import { HazirModel } from './HazirModel';
import type { Boya } from './tasarimDili';
import { Bisiklet, CicekKasasi, Flama, IsikliTabela, KaraTahta, KulahFiguru, SokakLambasi } from './DisSusler';

// Dekorasyon (belge bölüm 4; 13 Ekim): ışıklandırma seviyeleri ve
// oyuncunun kareli zemine yerleştirdiği taşınabilir eşyalar.
// Kodla çizilmiş geçici parçalar.

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

function Semsiye() {
  const dilimler = 8;
  return (
    <group>
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

// Hazır paketlerden eşyalar (belge 0.7): masa Tiny Treats'ten, örtüsünün
// kareleri bizim mor; sandalyeler eski masadaki yerlerinde (müşteri oturur).
const MASA_ORTUSU: Boya[] = [['#3f7fc0', renk.mor, 38]];
const MINDER: Boya[] = [['#f9a39e', renk.mor, 40]];
function KafeMasasi() {
  return (
    <group>
      <HazirModel yol="pastane/table_round_B" ayar={{ grup: 'dukkan', yukseklik: 0.72, boya: MASA_ORTUSU }} />
      {[-0.53, 0.53].map((x) => (
        <HazirModel
          key={x}
          yol="pastane/chair"
          ayar={{ grup: 'dukkan', yukseklik: 0.85 }}
          konum={[x, 0, 0]}
          donus={x > 0 ? -Math.PI / 2 : Math.PI / 2}
        />
      ))}
    </group>
  );
}

export function EsyaModeli({ esya }: { esya: Esya }) {
  if (esya === 'saksi') return <HazirModel yol="mobilya/pottedPlant" ayar={{ grup: 'dukkan', yukseklik: 0.95 }} />;
  if (esya === 'masa') return <KafeMasasi />;
  if (esya === 'bank') return <HazirModel yol="mobilya/benchCushion" ayar={{ grup: 'dukkan', en: 1.15, boya: MINDER }} donus={Math.PI} />;
  if (esya === 'karaTahta') return <KaraTahta />;
  if (esya === 'isikliTabela') return <IsikliTabela />;
  if (esya === 'kulahFiguru') return <KulahFiguru />;
  if (esya === 'flama') return <Flama />;
  if (esya === 'cicekKasasi') return <CicekKasasi />;
  if (esya === 'bisiklet') return <Bisiklet />;
  if (esya === 'copKutusu') return <HazirModel yol="mobilya/trashcan" ayar={{ grup: 'dukkan', yukseklik: 0.8 }} />;
  if (esya === 'sokakLambasi') return <SokakLambasi />;
  return (
    <group>
      <KafeMasasi />
      <Semsiye />
    </group>
  );
}

// Işıklandırma 2: terasın üstünde iki direk arasında asma ampuller
function AsmaAmpuller() {
  const direkler = [-9, -3, 3, 9];
  const ampuller = [];
  for (let k = 0; k < direkler.length - 1; k++) {
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const x = direkler[k] + (direkler[k + 1] - direkler[k]) * t;
      const y = 2.9 - Math.sin(t * Math.PI) * 0.5;
      ampuller.push(
        <mesh key={`${k}-${i}`} position={[x, y, -6.9]}>
          <sphereGeometry args={[0.07, 6, 4]} />
          <meshStandardMaterial color="#fff3c4" emissive={i % 2 ? '#ffd98a' : '#ffb3e0'} emissiveIntensity={1.6} />
        </mesh>,
      );
    }
  }
  return (
    <group>
      {direkler.map((x) => (
        <mesh key={x} position={[x, 1.5, -6.9]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 3, 6]} />
          <meshStandardMaterial color={renk.ahsapKoyu} />
        </mesh>
      ))}
      {ampuller}
    </group>
  );
}

// Işıklandırma 3: dükkânın önünde ışıklı mor-sarı şerit
function IsikliSerit() {
  return (
    <group position={[0, 0, -2.55]}>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[-3.75 + i * 0.5, 3.0, 0]}>
          <boxGeometry args={[0.46, 0.08, 0.06]} />
          <meshStandardMaterial color={i % 2 ? '#ffc928' : '#9b5fc9'} emissive={i % 2 ? '#ffc928' : '#9b5fc9'} emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

// Alınmış açık arazi karesi (dükkânın yanı ya da arkası): taş kaldırımın
// üstüne terasla aynı, 1 m genişlikte ve aynı hizada ahşap tahtalar (belge
// 0.3). Yan yana kareler tek zemin gibi görünür. Ön teras zaten ahşap.
function ParselZemini({ anahtar }: { anahtar: string }) {
  const { i, j } = parselCoz(anahtar);
  const { solX, onZ, arkaZ } = parselSiniri(i, j);
  return (
    <group>
      {Array.from({ length: PARSEL }, (_, n) => {
        const x = solX + n;
        return (
          <mesh key={n} position={[x + 0.5, 0, (onZ + arkaZ) / 2]} receiveShadow>
            <boxGeometry args={[0.96, 0.12, PARSEL]} />
            <meshStandardMaterial color={((x % 2) + 2) % 2 ? renk.ahsapAcik : renk.ahsapOrta} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

// Yerleştirme kareleri (1×1 m): alınmış arazideki boş yerler yeşil görünür.
// Dokunma tek bir görünmez zeminden alınır: konmuş eşyaya dokunulursa o
// kalkar (taşımak için), değilse seçili eşya en yakın sığdığı yere konur.
const yesilKare = new THREE.PlaneGeometry(0.86, 0.86);
const yesilMalzeme = new THREE.MeshBasicMaterial({ color: '#8fe36b', transparent: true, opacity: 0.35, depthWrite: false });

function Kareler() {
  const durum = useDurum();
  const disariya = !!ESYALAR.find((e) => e.id === durum.seciliEsya)?.disari;
  const kareler: { c: number; r: number; ic: boolean }[] = [];
  if (durum.seciliEsya)
    for (const p of durum.parseller) {
      const { i, j } = parselCoz(p);
      for (let a = 0; a < PARSEL; a++)
        for (let b = 0; b < PARSEL; b++) {
          const c = i * PARSEL + a;
          const r = j * PARSEL + b;
          const ic = birimIcMi(c, r, durum);
          if ((ic && disariya) || birimEngelli(c, r, durum) || birimDolu(c, r, durum)) continue;
          kareler.push({ c, r, ic });
        }
    }
  return (
    <group>
      {kareler.map(({ c, r, ic }) => {
        const o = birimOrtasi(c, r);
        return <mesh key={`${c},${r}`} geometry={yesilKare} material={yesilMalzeme} position={[o.x, ic ? 0.02 : 0.08, o.z]} rotation={[-Math.PI / 2, 0, 0]} />;
      })}
      <mesh
        position={[0, 0.1, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          if (e.delta > 12) return; // sürükleme / yakınlaştırma değil
          e.stopPropagation();
          const y = noktadakiEsya(e.point.x, e.point.z);
          if (y) yerlesimiKaldir(y);
          else noktayaKoy(e.point.x, e.point.z);
        }}
      >
        <planeGeometry args={[90, 26]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Dekorlar() {
  const durum = useDurum();
  const { isikSeviyesi, yerlesim, yerlestirme, parseller } = durum;
  return (
    <group>
      {parseller
        .filter((p) => !DUKKAN_PARSELLERI.includes(p) && parselCoz(p).j >= 0)
        .map((p) => (
          <ParselZemini key={p} anahtar={p} />
        ))}
      {isikSeviyesi >= 1 && (
        <>
          <Fener konum={[-4.6, 0.06, -8.0]} />
          <Fener konum={[4.6, 0.06, -8.0]} />
        </>
      )}
      {isikSeviyesi >= 2 && <AsmaAmpuller />}
      {isikSeviyesi >= 3 && <IsikliSerit />}

      {/* Yere konmuş eşyalar; yerleştirirken dokunulursa kalkar (taşımak için) */}
      {yerlesim.map((y) => {
        const { c, r } = birimCoz(y.hucre);
        const o = esyaOrtasi(y.esya, c, r, y.yon);
        const { en, boy } = esyaOlcusu(y.esya, y.yon);
        const ic = birimIcMi(c, r, durum);
        return (
          <group
            key={`${y.hucre}:${y.esya}`}
            position={[o.x, ic ? 0 : 0.06, o.z]}
            onClick={(e) => {
              if (!yerlestirme || e.delta > 12) return;
              e.stopPropagation();
              yerlesimiKaldir(y);
            }}
          >
            <group rotation={[0, (y.yon * Math.PI) / 2, 0]}>
              <EsyaModeli esya={y.esya} />
            </group>
            {/* Yerleştirirken eşyayı kolay tutmak için görünmez kutu */}
            {yerlestirme && (
              <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[en * 0.9, 1.4, boy * 0.9]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}

      {yerlestirme && <Kareler />}
    </group>
  );
}
