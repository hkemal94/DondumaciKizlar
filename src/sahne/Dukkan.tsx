import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { duvarlar, kameraKarisimi, tezgahOfsetiniGuncelle } from './kameraKarisimi';
import {
  PARSEL,
  Z0,
  kenarAnahtari,
  kenarYeri,
  parcaTuru,
  parselCoz,
  parselSiniri,
  sinirKenarlari,
  type Kenar,
  type ParcaTuru,
  type Yon,
} from '../oyun/dekorasyon';
import * as THREE from 'three';
import { renk } from './renkler';
import { CESITLER, kuvetKonumu, vitrinGenisligi } from '../oyun/kuvetler';
import { m, type MetinAnahtari } from '../metinler';
import { useEkranAyari } from '../arayuz/ekranAyari';
import { logoDokusu, LOGO_DOSYALARI, type LogoTuru } from './logo';
import { durumuOku, kuveteBas, useDurum } from '../oyun/durum';

// Dükkânın içi, tezgahın arkasından görünen hâli (birinci şahıs yakın plan).
// Kodla çizilmiş geçici parçalar; asıl modeller sonra gelecek.

const ESIK = 1.05; // pencerenin alt kenarı
const PENCERE_UST = 2.75;
const TAVAN = 3.25;
// Başlangıçtaki dükkânın arka duvarı (menü panosu ve logo bunun üstünde)
const ARKA_Z = Z0 + PARSEL;

function Kutu({
  konum,
  boyut,
  renkAdi,
  golgeVer = true,
  golgeAl = true,
  puruz = 0.8,
}: {
  konum: [number, number, number];
  boyut: [number, number, number];
  renkAdi: string;
  golgeVer?: boolean;
  golgeAl?: boolean;
  puruz?: number;
}) {
  return (
    <mesh position={konum} castShadow={golgeVer} receiveShadow={golgeAl}>
      <boxGeometry args={boyut} />
      <meshStandardMaterial color={renkAdi} roughness={puruz} />
    </mesh>
  );
}

// Kapı: pencere duvarının sol ucunda, terasa açılır (Kemal, 13 Ekim:
// "müşterilerin girişi için bir kapı lazım"). Müşteriler buradan girip çıkar.
const KAPI_UST = 2.15;



// Dükkânın genel görünümünde (yukarıdan) tavan ve öndeki duvar kalkar;
// bebek evi gibi içi görünür. Tezgah görünümünde yerlerine gelir.
export function TezgahtaGorunur({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = kameraKarisimi.deger < 0.12;
  });
  return <group ref={ref}>{children}</group>;
}

// Bebek evi kesiti: genel görünümde kameraya dönük duvarlar kalkar, ötekiler
// kalır. Dükkân gezilirken (döndürünce) hangi duvarın kalkacağı değişir.
// Tezgah görünümünde bütün duvarlar yerinde.
function KesikDuvar({ yon, children }: { yon: [number, number]; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const kameraYonu = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    if (kameraKarisimi.deger < 0.12) {
      ref.current.visible = true;
      return;
    }
    // Gezerken duvar seçeneği: duvarsızda hepsi kalkar, kapalıda hepsi yerinde
    if (durumuOku().gezme && duvarlar.mod !== 'kesit') {
      ref.current.visible = duvarlar.mod === 'kapali';
      return;
    }
    kameraYonu.copy(camera.position).sub(DUKKAN_ORTASI);
    ref.current.visible = yon[0] * kameraYonu.x + yon[1] * kameraYonu.z <= 0;
  });
  return <group ref={ref}>{children}</group>;
}

// Tavan: tezgah görünümünde ve gezerken "kapalı" seçilince görünür
function Tavan({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const kapali = durumuOku().gezme && duvarlar.mod === 'kapali';
    ref.current.visible = kameraKarisimi.deger < 0.12 || kapali;
  });
  return <group ref={ref}>{children}</group>;
}

// ---- Kapalı alan: zemin, duvar parçaları, tavan (belge 0.4) ----
// Duvarlar 1 m'lik parçalar: düz duvar, pencere ya da kapı. Ön (denize
// bakan) parçalar kendiliğinden cam vitrin, üstlerinde tente ve ampuller.

// Bir duvar parçası; yerel x boyunca 1 m, dışa bakan yüz yerel −z
const PARCA_BOY = 1.1; // köşelerde boşluk kalmasın diye biraz taşar

function DuzDuvar() {
  return <Kutu konum={[0, 1.6, 0]} boyut={[PARCA_BOY, 3.3, 0.1]} renkAdi={renk.duvar} golgeVer={false} />;
}

function PencereParcasi({ on, c }: { on: boolean; c: number }) {
  return (
    <group>
      {/* Eşiğin altı: önde dikey ahşap tahtalar, yanlarda duvar */}
      {on ? (
        [-0.25, 0.25].map((x, i) => (
          <Kutu key={x} konum={[x, ESIK / 2, i * 0.01]} boyut={[0.49, ESIK, 0.18]} renkAdi={(c + i) % 2 ? renk.ahsapAcik : '#b98a5f'} />
        ))
      ) : (
        <Kutu konum={[0, ESIK / 2, 0]} boyut={[PARCA_BOY, ESIK, 0.1]} renkAdi={renk.duvar} golgeVer={false} />
      )}
      {/* Pencerenin üstü */}
      <Kutu konum={[0, (PENCERE_UST + TAVAN + 0.05) / 2, 0]} boyut={[PARCA_BOY, TAVAN + 0.05 - PENCERE_UST, 0.1]} renkAdi={renk.duvar} golgeVer={false} />
      {/* Cam */}
      <mesh position={[0, (ESIK + PENCERE_UST) / 2, 0]}>
        <boxGeometry args={[1, PENCERE_UST - ESIK, 0.02]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.18} roughness={0.05} />
      </mesh>
      {/* Çerçeve: kenar kaydı, eşik ve üst kayıt */}
      <Kutu konum={[-0.5, (ESIK + PENCERE_UST) / 2, 0.02]} boyut={[0.08, PENCERE_UST - ESIK, 0.2]} renkAdi={renk.pencereCerceve} golgeVer={false} />
      <Kutu konum={[0, ESIK, 0.06]} boyut={[1.04, 0.08, on ? 0.5 : 0.24]} renkAdi={renk.ahsapOrta} golgeVer={false} />
      <Kutu konum={[0, PENCERE_UST, 0.02]} boyut={[1.04, 0.12, 0.2]} renkAdi={renk.pencereCerceve} golgeVer={false} />
    </group>
  );
}

function KapiParcasi() {
  const sol = -0.45;
  const sag = 0.45;
  return (
    <group>
      {/* Kapının üstü */}
      <Kutu konum={[0, (KAPI_UST + TAVAN + 0.05) / 2, 0]} boyut={[PARCA_BOY, TAVAN + 0.05 - KAPI_UST, 0.1]} renkAdi={renk.duvar} golgeVer={false} />
      {/* Kapı kasası (mor) ve açık duran kapı kanadı */}
      {[sol, sag].map((x) => (
        <Kutu key={x} konum={[x, KAPI_UST / 2, 0]} boyut={[0.1, KAPI_UST, 0.24]} renkAdi={renk.pencereCerceve} golgeVer={false} />
      ))}
      <Kutu konum={[0, KAPI_UST, 0]} boyut={[sag - sol + 0.1, 0.1, 0.24]} renkAdi={renk.pencereCerceve} golgeVer={false} />
      <group position={[sol + 0.05, 0, 0.05]} rotation={[0, -1.35, 0]}>
        <Kutu konum={[0.4, KAPI_UST / 2 - 0.03, 0]} boyut={[0.8, KAPI_UST - 0.08, 0.05]} renkAdi={renk.mor} golgeVer={false} />
        <mesh position={[0.4, 1.25, 0.03]}>
          <boxGeometry args={[0.55, 0.8, 0.02]} />
          <meshPhysicalMaterial color={renk.cam} transparent opacity={0.4} roughness={0.05} />
        </mesh>
        <Kutu konum={[0.7, 1.0, 0.05]} boyut={[0.04, 0.2, 0.04]} renkAdi={renk.sari} golgeVer={false} />
      </group>
    </group>
  );
}

// Ön parçaların dışındaki tente şeridi (mor-sarı) ve içerideki ampuller
function TenteParcasi() {
  return (
    <group position={[0, PENCERE_UST + 0.12, -0.55]} rotation={[0.32, 0, 0]}>
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={x} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.04, 1.1]} />
          <meshStandardMaterial color={i % 2 ? renk.sari : renk.mor} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function AmpulParcasi() {
  return (
    <group>
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, PENCERE_UST - 0.2, 0.2]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshStandardMaterial color="#fff3c4" emissive="#ffd98a" emissiveIntensity={1.6} />
        </mesh>
      ))}
    </group>
  );
}

const DONUS: Record<Yon, number> = { g: 0, k: Math.PI, b: Math.PI / 2, d: -Math.PI / 2 };

function DuvarParcasi({ k, tur }: { k: Kenar; tur: ParcaTuru }) {
  const { x, z, nx, nz } = kenarYeri(k);
  const on = k.y === 'g';
  return (
    <group position={[x, 0, z]} rotation={[0, DONUS[k.y], 0]}>
      {/* Duvar genel görünümde kameraya dönükse kalkar; yerinde alçak bir dip kalır */}
      <KesikDuvar yon={[nx, nz]}>
        {tur === 'duvar' ? <DuzDuvar /> : tur === 'pencere' ? <PencereParcasi on={on} c={k.c} /> : <KapiParcasi />}
        {on && <TenteParcasi />}
        {on && tur === 'pencere' && <AmpulParcasi />}
      </KesikDuvar>
      {tur === 'kapi' ? (
        // Genel görünümde kapının yeri: zeminde mor eşik
        <Kutu konum={[0, 0.02, 0]} boyut={[0.9, 0.04, 0.3]} renkAdi={renk.mor} golgeVer={false} />
      ) : (
        <Kutu konum={[0, 0.18, 0]} boyut={[PARCA_BOY, 0.36, 0.14]} renkAdi={on ? renk.ahsapAcik : renk.duvar} golgeVer={false} />
      )}
    </group>
  );
}

// Kapalı alanın ortası: kesik duvarlar hangi yüzün kameraya döndüğüne buna göre bakar
const DUKKAN_ORTASI = new THREE.Vector3(0, 0, -0.4);

function Odalar() {
  const { kapaliParseller, duvarParcalari } = useDurum();
  const kenarlar = useMemo(() => sinirKenarlari(kapaliParseller), [kapaliParseller]);
  let solX = Infinity, sagX = -Infinity, onZ = Infinity, arkaZ = -Infinity;
  for (const p of kapaliParseller) {
    const { i, j } = parselCoz(p);
    const s = parselSiniri(i, j);
    solX = Math.min(solX, s.solX);
    sagX = Math.max(sagX, s.sagX);
    onZ = Math.min(onZ, s.onZ);
    arkaZ = Math.max(arkaZ, s.arkaZ);
  }
  DUKKAN_ORTASI.set((solX + sagX) / 2, 0, (onZ + arkaZ) / 2);
  // Arka duvardaki menü panosu ve logo: o parçalar düz duvar olarak durdukça
  const arkaDuvar = (c: number) => {
    const k: Kenar = { c, r: PARSEL - 1, y: 'k' };
    return kenarlar.some((x) => kenarAnahtari(x) === kenarAnahtari(k)) && parcaTuru(k, duvarParcalari) === 'duvar';
  };
  // Ön cephedeki logo: 0. sütunun en öndeki camının üstünde
  const onLogo = kenarlar.filter((k) => k.y === 'g' && k.c === 0 && parcaTuru(k, duvarParcalari) === 'pencere').sort((a, b) => a.r - b.r)[0];
  return (
    <group>
      {kapaliParseller.map((p) => {
        const { i, j } = parselCoz(p);
        const s = parselSiniri(i, j);
        const ox = (s.solX + s.sagX) / 2;
        const oz = (s.onZ + s.arkaZ) / 2;
        return (
          <group key={p}>
            {/* İç zemin: koyu ahşap */}
            <Kutu konum={[ox, -0.05, oz]} boyut={[PARSEL, 0.1, PARSEL]} renkAdi={renk.ahsapKoyu} golgeVer={false} />
            <Tavan>
              <Kutu konum={[ox, TAVAN, oz]} boyut={[PARSEL, 0.1, PARSEL]} renkAdi={renk.ahsapAcik} golgeVer={false} golgeAl={false} />
              {[-1.2, 0.8].map((dz) => (
                <Kutu key={dz} konum={[ox, TAVAN - 0.12, oz + dz]} boyut={[PARSEL, 0.16, 0.2]} renkAdi={renk.ahsapOrta} golgeVer={false} />
              ))}
              {/* Damın dış yüzü ve saçak: dışarıdan bakınca görünür */}
              <Kutu konum={[ox, TAVAN + 0.1, oz]} boyut={[PARSEL + 0.25, 0.12, PARSEL + 0.25]} renkAdi={renk.mor} golgeVer={false} golgeAl={false} />
              <Kutu konum={[ox, TAVAN + 0.2, oz]} boyut={[PARSEL + 0.1, 0.08, PARSEL + 0.1]} renkAdi="#e9d6bd" golgeVer={false} golgeAl={false} />
            </Tavan>
          </group>
        );
      })}
      {kenarlar.map((k) => (
        <DuvarParcasi key={kenarAnahtari(k)} k={k} tur={parcaTuru(k, duvarParcalari)} />
      ))}
      {arkaDuvar(-2) && (
        <KesikDuvar yon={[0, 1]}>
          <MenuPanosu />
        </KesikDuvar>
      )}
      {arkaDuvar(1) && (
        <KesikDuvar yon={[0, 1]}>
          <LogoLevhasi tur="yazi" genislik={1.5} konum={[1.25, 2.25, ARKA_Z - 0.07]} donuk={Math.PI} />
        </KesikDuvar>
      )}
      {onLogo && (
        <KesikDuvar yon={[0, -1]}>
          <LogoLevhasi tur="yazi" genislik={0.8} konum={[0.6, (PENCERE_UST + TAVAN) / 2 + 0.02, Z0 + onLogo.r - 0.1]} donuk={Math.PI} />
        </KesikDuvar>
      )}
      {/* Dükkânın etrafındaki taş kaldırım; derzler arazi karelerinin sınırında (4 m) */}
      <mesh position={[0, -0.12, 4.6]} receiveShadow>
        <boxGeometry args={[92, 0.1, 14.4]} />
        <meshStandardMaterial color="#d9c9ad" roughness={1} />
      </mesh>
      {Array.from({ length: 23 }, (_, n) => (n - 11) * 4).map((x) => (
        <mesh key={x} position={[x, -0.065, 4.6]}>
          <boxGeometry args={[0.06, 0.01, 14.4]} />
          <meshStandardMaterial color="#c4b293" />
        </mesh>
      ))}
      {[Z0 + PARSEL, Z0 + 2 * PARSEL, Z0 + 3 * PARSEL].map((z) => (
        <mesh key={z} position={[0, -0.065, z]}>
          <boxGeometry args={[92, 0.01, 0.06]} />
          <meshStandardMaterial color="#c4b293" />
        </mesh>
      ))}
    </group>
  );
}


// Tezgah bölümü (belge 0.3): vitrinli tezgah, arka tezgah, çalışan ve
// hazırlama tek parça; taşınınca hep birlikte kayar. İçindekiler bölümün
// eski (başlangıç) yerine göre çizilir.
export function TezgahGrubu({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.copy(tezgahOfsetiniGuncelle(durumuOku().tezgah));
  });
  return <group ref={ref}>{children}</group>;
}

// Bölümün iki ucundaki saksılar (boyla birlikte uçlara gider)
function BolumSaksilari() {
  const { tezgah } = useDurum();
  const uc = tezgah.boy / 2 - 0.4;
  return (
    <>
      <Saksi konum={[-uc, 0, 1.0]} />
      <Saksi konum={[uc, 0, 1.05]} olcek={0.9} />
    </>
  );
}

// Oyuncunun arkasındaki tezgah: dolap, kavanozlar, kahve makinesi, kasa.
// Tezgah görünümünde kameranın arkasında kalır; genel görünümde görünür.
function ArkaTezgah() {
  const kavanozRenkleri = ['#ff6f7d', '#ffc928', '#5fd08a', '#9b5fc9', '#8a4b2e'];
  const { tezgah } = useDurum();
  const genislik = tezgah.boy - 1.4;
  const kapakSayisi = Math.max(1, Math.floor(genislik / 1.3));
  return (
    <group position={[0, 0, 1.68]}>
      <Kutu konum={[0, 0.45, 0]} boyut={[genislik, 0.9, 0.55]} renkAdi={renk.ahsapOrta} />
      <Kutu konum={[0, 0.92, 0]} boyut={[genislik + 0.1, 0.05, 0.62]} renkAdi={renk.tezgahUst} puruz={0.6} />
      {/* Dolap kapakları */}
      {Array.from({ length: kapakSayisi }, (_, i) => (i - (kapakSayisi - 1) / 2) * 1.3).map((x) => (
        <Kutu key={x} konum={[x, 0.45, -0.28]} boyut={[1.15, 0.72, 0.02]} renkAdi={renk.ahsapAcik} golgeVer={false} />
      ))}
      {/* Kavanozlar */}
      {kavanozRenkleri.map((r, i) => (
        <group key={i} position={[-2.9 + i * 0.32, 0.95, 0.05]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.24, 8]} />
            <meshStandardMaterial color={renk.cam} transparent opacity={0.55} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.15, 8]} />
            <meshStandardMaterial color={r} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.03, 8]} />
            <meshStandardMaterial color={renk.mor} />
          </mesh>
        </group>
      ))}
      {/* Kahve makinesi (kışın kafe olacak dükkân için) */}
      <group position={[0.6, 0.95, 0.02]}>
        <Kutu konum={[0, 0.22, 0]} boyut={[0.55, 0.44, 0.4]} renkAdi="#c9d0d6" puruz={0.35} />
        <Kutu konum={[0, 0.46, 0]} boyut={[0.6, 0.05, 0.44]} renkAdi="#8d969e" puruz={0.35} />
        <Kutu konum={[0, 0.1, -0.22]} boyut={[0.3, 0.04, 0.12]} renkAdi="#5b6268" />
      </group>
      {/* Kasa */}
      <group position={[2.4, 0.95, 0]}>
        <Kutu konum={[0, 0.12, 0]} boyut={[0.5, 0.24, 0.4]} renkAdi={renk.mor} />
        <mesh position={[0, 0.3, -0.05]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.22]} />
          <meshStandardMaterial color="#4e2470" />
        </mesh>
      </group>
      {/* Kap yığınları */}
      {[1.5, 1.7].map((x, i) => (
        <mesh key={x} position={[x, 1.08, 0.05]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.26, 10]} />
          <meshStandardMaterial color={i ? renk.sari : renk.mor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Saksi({ konum, olcek = 1 }: { konum: [number, number, number]; olcek?: number }) {
  const yapraklar = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return (
      <mesh key={i} position={[Math.cos(a) * 0.12, 0.62, Math.sin(a) * 0.12]} rotation={[Math.sin(a) * 0.7, a, Math.cos(a) * 0.7]} castShadow>
        <coneGeometry args={[0.1, 0.55, 4]} />
        <meshStandardMaterial color={i % 2 ? '#5f9a4c' : '#78b45a'} roughness={0.9} flatShading />
      </mesh>
    );
  });
  return (
    <group position={konum} scale={olcek}>
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.34, 8]} />
        <meshStandardMaterial color="#d9825b" roughness={0.9} flatShading />
      </mesh>
      {yapraklar}
    </group>
  );
}

// Arka duvardaki menü panosu (taslak 1 gibi): yazısız, resimli (yazılar Kemal'in).
// Logo levhası (Kemal, 14 Ekim): mor zemin, sarı çerçeve, ortada logo.
// Arka duvarda (genel görünümde görünür) ve ön cephede, pencerenin üstünde.
function LogoLevhasi({ tur, genislik, konum, donuk = 0 }: { tur: LogoTuru; genislik: number; konum: [number, number, number]; donuk?: number }) {
  const doku = useMemo(() => logoDokusu(tur), [tur]);
  const yukseklik = genislik / LOGO_DOSYALARI[tur].oran;
  return (
    <group position={konum} rotation={[0, donuk, 0]}>
      <Kutu konum={[0, 0, 0]} boyut={[genislik + 0.22, yukseklik + 0.16, 0.05]} renkAdi={renk.sari} golgeVer={false} />
      <Kutu konum={[0, 0, 0.03]} boyut={[genislik + 0.12, yukseklik + 0.06, 0.02]} renkAdi={renk.mor} golgeVer={false} />
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[genislik, yukseklik]} />
        <meshBasicMaterial map={doku} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function MenuPanosu() {
  const resimler = ['#ff6f7d', '#8a4b2e', '#5fd08a', '#fff0c8'];
  return (
    <group position={[-1.6, 2.05, ARKA_Z - 0.07]} rotation={[0, Math.PI, 0]}>
      <Kutu konum={[0, 0, 0]} boyut={[1.7, 1.05, 0.05]} renkAdi={renk.ahsapKoyu} golgeVer={false} />
      <Kutu konum={[0, 0, 0.03]} boyut={[1.55, 0.9, 0.02]} renkAdi="#2f3b35" golgeVer={false} />
      {resimler.map((r, i) => (
        <mesh key={i} position={[-0.55 + i * 0.37, 0.12, 0.05]}>
          <circleGeometry args={[0.11, 10]} />
          <meshBasicMaterial color={r} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.18 - i * 0.12, 0.05]}>
          <planeGeometry args={[1.15 - i * 0.2, 0.03]} />
          <meshBasicMaterial color="#e9e4d8" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}


// Küvetteki dondurma: engebeli, basık bir tümsek.
function DondurmaYuzeyi({ renkAdi, tohum }: { renkAdi: string; tohum: number }) {
  const geometri = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const goruldu = new Map<string, number>();
    for (let i = 0; i < p.count; i++) {
      const anahtar = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
      let k = goruldu.get(anahtar);
      if (k === undefined) {
        k = 0.88 + (Math.sin(i * 12.9898 + tohum * 78.233) * 0.5 + 0.5) * 0.24;
        goruldu.set(anahtar, k);
      }
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [tohum]);
  return (
    <mesh geometry={geometri} position={[0, 0.02, 0]} scale={[0.24, 0.11, 0.2]} castShadow receiveShadow>
      <meshStandardMaterial color={renkAdi} roughness={0.55} flatShading />
    </mesh>
  );
}

// Küvetin önündeki küçük ad kartı (gerçek dondurmacılardaki gibi):
// çok çeşit olunca renkler karışmasın diye
const etiketDokulari = new Map<string, THREE.CanvasTexture>();
function etiketDokusu(yazi: string, renkAdi: string) {
  const anahtar = `${yazi}|${renkAdi}`;
  const var_ = etiketDokulari.get(anahtar);
  if (var_) return var_;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 72;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fffaf0';
  g.fillRect(0, 0, 256, 72);
  g.fillStyle = renkAdi;
  g.fillRect(0, 0, 18, 72);
  g.fillStyle = '#3a2350';
  let boy = 40;
  g.font = `700 ${boy}px Poppins, system-ui, sans-serif`;
  while (g.measureText(yazi).width > 220 && boy > 18) {
    boy -= 2;
    g.font = `700 ${boy}px Poppins, system-ui, sans-serif`;
  }
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillText(yazi, 137, 38);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  etiketDokulari.set(anahtar, t);
  return t;
}

// Tek sırada ve öndeki sırada kart küvetin önünde yatık durur; arka sırada
// öndeki dondurmaların üstünde görünsün diye küvetin arkasında, çubukta dikilir.
function KuvetEtiketi({ cesit, arkada }: { cesit: number; arkada: boolean }) {
  const c = CESITLER[cesit];
  const doku = useMemo(() => etiketDokusu(m(`cesit.${c.ad}` as MetinAnahtari), c.renk), [c]);
  if (arkada)
    return (
      <group position={[0, 0, -0.13]}>
        <mesh position={[0, 0.1, -0.01]}>
          <cylinderGeometry args={[0.008, 0.008, 0.2, 4]} />
          <meshStandardMaterial color="#b9c0c6" />
        </mesh>
        <mesh position={[0, 0.21, 0]} rotation={[-0.25, 0, 0]}>
          <planeGeometry args={[0.34, 0.095]} />
          <meshBasicMaterial map={doku} toneMapped={false} />
        </mesh>
      </group>
    );
  return (
    <mesh position={[0, 0.05, 0.25]} rotation={[-0.5, 0, 0]}>
      <planeGeometry args={[0.34, 0.095]} />
      <meshBasicMaterial map={doku} toneMapped={false} />
    </mesh>
  );
}

// Vitrin: oyuncunun seçtiği çeşitlerin küvetleri (4–12; 6'dan fazlası iki
// sıra), üstünde cam siper. Küvete basılı tutunca kepçe dalar.
function Vitrin() {
  const { vitrin } = useDurum();
  const { kuvetEtiketi } = useEkranAyari();
  const VITRIN_GENISLIGI = vitrinGenisligi(vitrin.length);
  return (
    <group position={[0, 0, -0.62]}>
      {/* Vitrin gövdesi */}
      <Kutu konum={[0, 0.48, 0]} boyut={[VITRIN_GENISLIGI, 0.96, 0.9]} renkAdi={renk.vitrinMetal} puruz={0.5} />
      {/* Vitrinin müşteri tarafı: logo renklerinde şerit */}
      <Kutu konum={[0, 0.62, -0.455]} boyut={[VITRIN_GENISLIGI, 0.5, 0.02]} renkAdi={renk.mor} />
      <Kutu konum={[0, 0.9, -0.46]} boyut={[VITRIN_GENISLIGI, 0.07, 0.02]} renkAdi={renk.sari} />
      {/* Küvet kasası */}
      <Kutu konum={[0, 0.98, 0]} boyut={[VITRIN_GENISLIGI - 0.3, 0.06, 0.66]} renkAdi="#8d969e" puruz={0.4} />
      {vitrin.map((cesit) => {
        const k = kuvetKonumu(cesit, vitrin);
        return (
          <group key={cesit} position={[k.x, 1.0, k.z + 0.62]}>
            <group scale={[k.olcekX, 1, k.olcekZ]}>
              <Kutu konum={[0, -0.02, 0]} boyut={[0.58, 0.06, 0.5]} renkAdi="#d4d9dd" golgeVer={false} puruz={0.3} />
              <DondurmaYuzeyi renkAdi={CESITLER[cesit].renk} tohum={cesit + 1} />
              {/* Dokunma alanı: küvetten biraz büyük, görünmez */}
              <mesh
                position={[0, 0.08, 0]}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  kuveteBas(cesit);
                }}
              >
                <boxGeometry args={[0.6, 0.25, 0.7]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            </group>
            <group position={[0, 0, k.arkada ? 0 : (k.olcekZ - 1) * 0.25]} scale={[k.olcekX, k.olcekX, 1]}>
              {kuvetEtiketi && <KuvetEtiketi cesit={cesit} arkada={k.arkada} />}
            </group>
          </group>
        );
      })}
      {/* Müşteri tarafında alçak cam siper */}
      <mesh position={[0, 1.2, -0.42]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[VITRIN_GENISLIGI - 0.1, 0.42, 0.02]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.18} roughness={0.05} />
      </mesh>
      <Kutu konum={[0, 1.41, -0.45]} boyut={[VITRIN_GENISLIGI - 0.05, 0.035, 0.06]} renkAdi={renk.vitrinMetal} golgeVer={false} puruz={0.4} />
    </group>
  );
}

// Sağdaki külah ve kap yığınları (geçici).
function Yiginlar({ vitrin }: { vitrin: number }) {
  const kulahlar = [];
  for (let i = 0; i < 5; i++) {
    kulahlar.push(
      <mesh key={i} position={[0, 0.1 + i * 0.045, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.055, 0.2, 8, 1, true]} />
        <meshStandardMaterial color="#d9a066" roughness={0.9} flatShading side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  const kaplar = [];
  for (let i = 0; i < 6; i++) {
    kaplar.push(
      <mesh key={i} position={[0, 0.05 + i * 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.05, 0.09, 10, 1, true]} />
        <meshStandardMaterial color={i % 2 ? renk.mor : renk.sari} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>,
    );
  }
  return (
    <group position={[vitrin / 2 + 0.5, 0.96, -0.5]}>
      <group position={[0, 0, 0]}>{kulahlar}</group>
      <group position={[0.28, 0, 0.05]}>{kulahlar}</group>
      <group position={[0.55, 0, -0.05]}>{kaplar}</group>
    </group>
  );
}

function Tezgah() {
  const { vitrin, tezgah } = useDurum();
  const VITRIN_GENISLIGI = vitrinGenisligi(vitrin.length);
  const TOPLAM = tezgah.boy - 0.2; // duvardan duvara değil, bölümün boyu kadar
  return (
    <group>
      {/* Yan tezgahlar (vitrinin iki yanı) */}
      {[-1, 1].map((yon) => (
        // Yan tezgahlar vitrinle duvar arasını doldurur (vitrin genişleyince kısalır)
        <group key={yon} position={[yon * (VITRIN_GENISLIGI / 2 + (TOPLAM - VITRIN_GENISLIGI) / 4), 0, -0.62]}>
          <Kutu konum={[0, 0.46, 0]} boyut={[Math.max(0.05, (TOPLAM - VITRIN_GENISLIGI) / 2 - 0.1), 0.92, 0.9]} renkAdi={renk.ahsapOrta} />
          <Kutu konum={[0, 0.94, 0]} boyut={[Math.max(0.05, (TOPLAM - VITRIN_GENISLIGI) / 2), 0.05, 1.0]} renkAdi={renk.tezgahUst} puruz={0.6} />
        </group>
      ))}
      <Vitrin />
      <Yiginlar vitrin={VITRIN_GENISLIGI} />
    </group>
  );
}

export function Dukkan() {
  return (
    <group>
      <Odalar />
      <TezgahGrubu>
        <Tezgah />
        <ArkaTezgah />
        <BolumSaksilari />
      </TezgahGrubu>
    </group>
  );
}
