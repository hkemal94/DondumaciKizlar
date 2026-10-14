import { hucreAcik, hucreDolu, hucreUygun, hucreyeKoy, useDurum, yerlesimiKaldir } from '../oyun/durum';
import { DUKKAN_PARSELLERI, HUCRELER, KARE_BOYU, hucreBul, parselCoz, parselSiniri, type Esya } from '../oyun/dekorasyon';
import { renk } from './renkler';
import { Bank, Bisiklet, CicekKasasi, CopKutusu, Flama, IsikliTabela, KaraTahta, KulahFiguru, SokakLambasi } from './DisSusler';

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

function Masa({ olcek = 1 }: { olcek?: number }) {
  return (
    <group scale={olcek}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 12]} />
        <meshStandardMaterial color={renk.ahsapAcik} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.72, 6]} />
        <meshStandardMaterial color={renk.ahsapKoyu} />
      </mesh>
      {[-0.62, 0.62].map((x) => (
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

// Tek çiçek saksısı (taşınabilir)
function TekSaksi() {
  const renkler = ['#ff6f7d', '#ffc928', '#9b5fc9', '#fffaf2'];
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.44, 8]} />
        <meshStandardMaterial color="#d9825b" roughness={0.9} flatShading />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.16, 0.5 + (i % 3) * 0.06, Math.sin(a) * 0.16]}>
            <mesh>
              <icosahedronGeometry args={[0.12, 0]} />
              <meshStandardMaterial color="#6aa84f" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 0.11, 0]}>
              <icosahedronGeometry args={[0.07, 0]} />
              <meshStandardMaterial color={renkler[i % renkler.length]} roughness={0.7} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function EsyaModeli({ esya }: { esya: Esya }) {
  if (esya === 'saksi') return <TekSaksi />;
  if (esya === 'masa') return <Masa olcek={0.85} />;
  if (esya === 'bank') return <Bank />;
  if (esya === 'karaTahta') return <KaraTahta />;
  if (esya === 'isikliTabela') return <IsikliTabela />;
  if (esya === 'kulahFiguru') return <KulahFiguru />;
  if (esya === 'flama') return <Flama />;
  if (esya === 'cicekKasasi') return <CicekKasasi />;
  if (esya === 'bisiklet') return <Bisiklet />;
  if (esya === 'copKutusu') return <CopKutusu />;
  if (esya === 'sokakLambasi') return <SokakLambasi />;
  return (
    <group>
      <Masa olcek={0.85} />
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

// Alınmış arazi karesi (dükkânın yanı ya da arkası): taş kaldırımın üstüne
// terasla aynı ahşap zemin. Ön teras zaten ahşap.
function ParselZemini({ anahtar }: { anahtar: string }) {
  const { i, j } = parselCoz(anahtar);
  const { solX, sagX, onZ, arkaZ } = parselSiniri(i, j);
  const genislik = sagX - solX;
  return (
    <group>
      {[0, 1, 2].map((n) => (
        <mesh key={n} position={[solX + (genislik / 3) * (n + 0.5), 0, (onZ + arkaZ) / 2]} receiveShadow>
          <boxGeometry args={[genislik / 3 - 0.06, 0.12, arkaZ - onZ - 0.06]} />
          <meshStandardMaterial color={n % 2 ? renk.ahsapAcik : renk.ahsapOrta} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Yerleştirme kareleri: alınmış arazideki boş kareler yeşil görünür. Dokunma tek bir görünmez
// zeminden alınır ve en yakın boş kareye konur (kareye tam isabet gerekmez).
function Kareler() {
  const durum = useDurum();
  return (
    <group>
      {HUCRELER.map((h) => {
        if (!durum.seciliEsya || !hucreAcik(h.id, durum) || hucreDolu(h.id, durum)) return null;
        if (!hucreUygun(h.id, durum.seciliEsya, durum)) return null; // dışarıya özel eşya içeri konmaz
        return (
          <mesh key={h.id} position={[h.x, h.ic ? 0.02 : 0.08, h.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[KARE_BOYU * 0.9, KARE_BOYU * 0.9]} />
            <meshBasicMaterial color="#8fe36b" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        );
      })}
      <mesh
        position={[0, 0.1, 1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          if (e.delta > 12) return; // sürükleme / yakınlaştırma değil
          e.stopPropagation();
          // En yakın kare doluysa oradaki eşya kalkar (taşımak için), boşsa seçili eşya konur
          let enYakin: string | null = null;
          let enKisa = KARE_BOYU * 0.85;
          HUCRELER.forEach((h) => {
            if (!hucreAcik(h.id)) return; // alınmamış araziye konmaz
            if (!hucreDolu(h.id) && !hucreUygun(h.id, durum.seciliEsya)) return;
            const d = Math.hypot(h.x - e.point.x, h.z - e.point.z);
            if (d < enKisa) {
              enKisa = d;
              enYakin = h.id;
            }
          });
          if (enYakin === null) return;
          if (hucreDolu(enYakin)) yerlesimiKaldir(enYakin);
          else hucreyeKoy(enYakin);
        }}
      >
        <planeGeometry args={[90, 24]} />
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
        const h = hucreBul(y.hucre);
        if (!h) return null;
        return (
          <group
            key={y.hucre}
            position={[h.x, h.ic ? 0 : 0.06, h.z]}
            onClick={(e) => {
              if (!yerlestirme || e.delta > 12) return;
              e.stopPropagation();
              yerlesimiKaldir(y.hucre);
            }}
          >
            <EsyaModeli esya={y.esya} />
            {/* Yerleştirirken eşyayı kolay tutmak için görünmez kutu */}
            {yerlestirme && (
              <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[KARE_BOYU * 0.9, 1.4, KARE_BOYU * 0.9]} />
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
