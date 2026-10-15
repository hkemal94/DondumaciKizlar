import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { gecerliDuvarModu, kameraKarisimi, tezgahOfsetiniGuncelle } from './kameraKarisimi';
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
import { m, useDil, type MetinAnahtari } from '../metinler';
import { useEkranAyari } from '../arayuz/ekranAyari';
import { TezgahParcalari } from './TezgahParcalari';
import { Mutfak } from './Mutfak';
import { logoDokusu, LOGO_DOSYALARI, type LogoTuru } from './logo';
import { durumuOku, gecerliGorunus, kuveteBas, useDurum } from '../oyun/durum';
import { gorunusSecenegi } from '../oyun/gorunus';
import { zeminDokusu } from './zeminDokusu';
import { tasDokusu } from './Mahalle';
import { CatiTabelasiYeri, DisTabelalar, NeonTabela } from './Tabelalar';
import { yuruyenler } from './yuruyenler';
import { sesler } from '../ses/ses';

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

// Görünüş (C paketi, belge 0.11): oyuncunun seçtiği (ya da denediği) renkler
function useGorunusRenkleri() {
  const g = gecerliGorunus(useDurum());
  const tente = gorunusSecenegi('tente', g.tente);
  return {
    dis: gorunusSecenegi('disBoya', g.disBoya).renk,
    ic: gorunusSecenegi('icBoya', g.icBoya).renk,
    cerceve: gorunusSecenegi('cerceve', g.cerceve).renk,
    tente: [tente.renk, tente.ikinciRenk ?? tente.renk] as const,
    zemin: gorunusSecenegi('zemin', g.zemin),
    cati: gorunusSecenegi('cati', g.cati),
  };
}

// Duvar kutusu: dışa bakan yüz (yerel −z) dış boya, içe bakan (+z) iç boya
function IkiYuzKutu({ konum, boyut }: { konum: [number, number, number]; boyut: [number, number, number] }) {
  const { dis, ic } = useGorunusRenkleri();
  return (
    <mesh position={konum} receiveShadow>
      <boxGeometry args={boyut} />
      {[dis, dis, dis, dis, ic, dis].map((r, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} color={r} roughness={0.8} />
      ))}
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
    // Duvar düğmesi (belge 0.8): açıkta (duvarsız) hepsi kalkar, kapalıda hepsi yerinde
    const mod = gecerliDuvarModu();
    if (mod !== 'kesit') {
      ref.current.visible = mod === 'kapali';
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
    const kapali = gecerliDuvarModu() === 'kapali';
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
  return <IkiYuzKutu konum={[0, 1.6, 0]} boyut={[PARCA_BOY, 3.3, 0.1]} />;
}

// Vitrin camı (Kemal, 15 Ekim: "camların hücre parmaklığı gibi olmasını
// beğenmiyorum"): yan yana camlar tek parça görünür; dikme yalnız camın
// uçlarında ve üç metrede bir, ince.
function PencereParcasi({ on, c, solDikme, sagDikme }: { on: boolean; c: number; solDikme: boolean; sagDikme: boolean }) {
  const { cerceve } = useGorunusRenkleri();
  return (
    <group>
      {/* Eşiğin altı: önde dikey ahşap tahtalar, yanlarda duvar */}
      {on ? (
        [-0.25, 0.25].map((x, i) => (
          <Kutu key={x} konum={[x, ESIK / 2, i * 0.01]} boyut={[0.49, ESIK, 0.18]} renkAdi={(c + i) % 2 ? renk.ahsapAcik : '#b98a5f'} />
        ))
      ) : (
        <IkiYuzKutu konum={[0, ESIK / 2, 0]} boyut={[PARCA_BOY, ESIK, 0.1]} />
      )}
      {/* Pencerenin üstü */}
      <IkiYuzKutu konum={[0, (PENCERE_UST + TAVAN + 0.05) / 2, 0]} boyut={[PARCA_BOY, TAVAN + 0.05 - PENCERE_UST, 0.1]} />
      {/* Cam */}
      <mesh position={[0, (ESIK + PENCERE_UST) / 2, 0]}>
        <boxGeometry args={[1, PENCERE_UST - ESIK, 0.02]} />
        <meshPhysicalMaterial color={renk.cam} transparent opacity={0.18} roughness={0.05} />
      </mesh>
      {/* Çerçeve: kenar kaydı, eşik ve üst kayıt */}
      {solDikme && <Kutu konum={[-0.5, (ESIK + PENCERE_UST) / 2, 0.02]} boyut={[0.06, PENCERE_UST - ESIK, 0.16]} renkAdi={cerceve} golgeVer={false} />}
      {sagDikme && <Kutu konum={[0.5, (ESIK + PENCERE_UST) / 2, 0.02]} boyut={[0.06, PENCERE_UST - ESIK, 0.16]} renkAdi={cerceve} golgeVer={false} />}
      <Kutu konum={[0, ESIK, 0.06]} boyut={[1.04, 0.08, on ? 0.5 : 0.24]} renkAdi={renk.ahsapOrta} golgeVer={false} />
      <Kutu konum={[0, PENCERE_UST, 0.02]} boyut={[1.04, 0.12, 0.2]} renkAdi={cerceve} golgeVer={false} />
    </group>
  );
}

// Kapı (Kemal, 15 Ekim): biri yaklaşınca açılır, geçince kapanır; açılırken zil
const KAPI_ACIK = -1.35;
const KAPI_MESAFESI = 1.7;
function KapiParcasi({ x, z }: { x: number; z: number }) {
  const { cerceve } = useGorunusRenkleri();
  const sol = -0.45;
  const sag = 0.45;
  const kanat = useRef<THREE.Group>(null);
  const acik = useRef(false);
  useFrame((_, dt) => {
    const g = kanat.current;
    if (!g) return;
    let yakin = false;
    for (const p of yuruyenler.values())
      if (Math.hypot(p.x - x, p.z - z) < KAPI_MESAFESI) {
        yakin = true;
        break;
      }
    if (yakin && !acik.current) sesler.kapiZili();
    acik.current = yakin;
    const hedef = yakin ? KAPI_ACIK : 0;
    g.rotation.y += (hedef - g.rotation.y) * Math.min(1, dt * 6);
  });
  return (
    <group>
      {/* Kapının üstü */}
      <IkiYuzKutu konum={[0, (KAPI_UST + TAVAN + 0.05) / 2, 0]} boyut={[PARCA_BOY, TAVAN + 0.05 - KAPI_UST, 0.1]} />
      {/* Kapı kasası ve açık duran kapı kanadı (çerçeve rengi) */}
      {[sol, sag].map((x) => (
        <Kutu key={x} konum={[x, KAPI_UST / 2, 0]} boyut={[0.1, KAPI_UST, 0.24]} renkAdi={cerceve} golgeVer={false} />
      ))}
      <Kutu konum={[0, KAPI_UST, 0]} boyut={[sag - sol + 0.1, 0.1, 0.24]} renkAdi={cerceve} golgeVer={false} />
      <group ref={kanat} position={[sol + 0.05, 0, 0.05]}>
        <Kutu konum={[0.4, KAPI_UST / 2 - 0.03, 0]} boyut={[0.8, KAPI_UST - 0.08, 0.05]} renkAdi={cerceve} golgeVer={false} />
        <mesh position={[0.4, 1.25, 0.03]}>
          <boxGeometry args={[0.55, 0.8, 0.02]} />
          <meshPhysicalMaterial color={renk.cam} transparent opacity={0.4} roughness={0.05} />
        </mesh>
        <Kutu konum={[0.7, 1.0, 0.05]} boyut={[0.04, 0.2, 0.04]} renkAdi={renk.sari} golgeVer={false} />
      </group>
    </group>
  );
}

// Ön parçaların dışındaki tente şeridi (seçilen iki renk) ve içerideki ampuller.
// Tente duvardan dışa doğru aşağı iner ve pencerenin hemen üstünden başlar;
// yukarı kalkık olunca cephedeki logoyu kesiyordu (Kemal, 15 Ekim akşam)
function TenteParcasi() {
  const { tente } = useGorunusRenkleri();
  return (
    <group position={[0, PENCERE_UST - 0.05, -0.53]} rotation={[-0.32, 0, 0]}>
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={x} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.04, 1.1]} />
          <meshStandardMaterial color={tente[i % 2 ? 1 : 0]} roughness={0.9} />
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

// Duvar parçasının yerel +x yönündeki komşu parça (aynı duvar boyunca)
function yandakiKenar(k: Kenar, yon: 1 | -1): Kenar {
  if (k.y === 'g') return { ...k, c: k.c + yon };
  if (k.y === 'k') return { ...k, c: k.c - yon };
  if (k.y === 'b') return { ...k, r: k.r - yon };
  return { ...k, r: k.r + yon };
}

function DuvarParcasi({ k, tur, pencereMi }: { k: Kenar; tur: ParcaTuru; pencereMi: (k: Kenar) => boolean }) {
  const { x, z, nx, nz } = kenarYeri(k);
  const on = k.y === 'g';
  return (
    <group position={[x, 0, z]} rotation={[0, DONUS[k.y], 0]}>
      {/* Duvar genel görünümde kameraya dönükse kalkar; yerinde alçak bir dip kalır */}
      <KesikDuvar yon={[nx, nz]}>
        {tur === 'duvar' ? <DuzDuvar /> : tur === 'pencere' ? <PencereParcasi
            on={on}
            c={k.c}
            // Camın sol ucu ya da üç metrede bir dikme; sağ uçta kapanış dikmesi
            solDikme={!pencereMi(yandakiKenar(k, -1)) || ((k.c + k.r) % 3 + 3) % 3 === 0}
            sagDikme={!pencereMi(yandakiKenar(k, 1))}
          /> : <KapiParcasi x={x} z={z} />}
        {on && <TenteParcasi />}
        {on && tur === 'pencere' && <AmpulParcasi />}
      </KesikDuvar>
      {tur === 'kapi' ? (
        // Genel görünümde kapının yeri: zeminde mor eşik
        <Kutu konum={[0, 0.02, 0]} boyut={[0.9, 0.04, 0.3]} renkAdi={renk.mor} golgeVer={false} />
      ) : (
        on ? (
          <Kutu konum={[0, 0.18, 0]} boyut={[PARCA_BOY, 0.36, 0.14]} renkAdi={renk.ahsapAcik} golgeVer={false} />
        ) : (
          <IkiYuzKutu konum={[0, 0.18, 0]} boyut={[PARCA_BOY, 0.36, 0.14]} />
        )
      )}
    </group>
  );
}

// Kapalı alanın ortası: kesik duvarlar hangi yüzün kameraya döndüğüne buna göre bakar
const DUKKAN_ORTASI = new THREE.Vector3(0, 0, -0.4);

// ---- Çatı (C2, belge 0.11): düz dam, teras + korkuluk, kiremit, ahşap + pergola ----
// Her arazi karesi kendi damını taşır; kiremitte sırt dükkân boyunca (x) uzanır.
const KIREMIT_YUKSEKLIGI = 1.3;
const PERGOLA_DERINLIGI = 2.4;

// Kiremit sıraları: dokunun bir birimi 1 m, üç sıra
let kiremitDokusu: THREE.CanvasTexture | null = null;
function kiremitSiralari() {
  if (kiremitDokusu) return kiremitDokusu;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < 64; y += 64 / 3) g.fillRect(0, y, 64, 3);
  for (let n = 0; n < 3; n++) for (let x = (n % 2) * 8; x < 64; x += 16) g.fillRect(x, (n * 64) / 3, 2, 64 / 3);
  kiremitDokusu = new THREE.CanvasTexture(c);
  kiremitDokusu.wrapS = kiremitDokusu.wrapT = THREE.RepeatWrapping;
  kiremitDokusu.colorSpace = THREE.SRGBColorSpace;
  return kiremitDokusu;
}

// Üçgen kesitli dam: kesit (z, y) düzleminde, x boyunca uzar
function kiremitGeometrisi() {
  const yari = PARSEL / 2 + 0.3;
  const sekil = new THREE.Shape();
  sekil.moveTo(-yari, 0);
  sekil.lineTo(yari, 0);
  sekil.lineTo(0, KIREMIT_YUKSEKLIGI);
  sekil.closePath();
  const g = new THREE.ExtrudeGeometry(sekil, { depth: PARSEL + 0.02, bevelEnabled: false });
  g.translate(0, 0, -(PARSEL + 0.02) / 2);
  g.rotateY(Math.PI / 2);
  return g;
}

function CatiParseli({ ox, oz }: { ox: number; oz: number }) {
  const { cati, dis } = useGorunusRenkleri();
  const geo = useMemo(kiremitGeometrisi, []);
  if (cati.id === 'kiremit')
    return (
      <group position={[ox, TAVAN + 0.05, oz]}>
        <mesh geometry={geo} castShadow>
          {/* 0: üçgen uçlar (dış boya), 1: eğimli yüzler (kiremit) */}
          <meshStandardMaterial attach="material-0" color={dis} roughness={0.85} />
          <meshStandardMaterial attach="material-1" color={cati.renk} map={kiremitSiralari()} roughness={0.75} flatShading />
        </mesh>
        <Kutu konum={[0, KIREMIT_YUKSEKLIGI + 0.02, 0]} boyut={[PARSEL + 0.02, 0.1, 0.16]} renkAdi={cati.ikinciRenk!} golgeVer={false} />
      </group>
    );
  // Düz dam, teras ve ahşap: düz döşeme ve sacak
  const sacak = cati.id === 'duz' ? renk.mor : cati.id === 'teras' ? '#f7f3ea' : renk.ahsapKoyu;
  return (
    <group>
      <Kutu konum={[ox, TAVAN + 0.1, oz]} boyut={[PARSEL + 0.25, 0.12, PARSEL + 0.25]} renkAdi={sacak} golgeVer={false} golgeAl={false} />
      <Kutu konum={[ox, TAVAN + 0.2, oz]} boyut={[PARSEL + 0.1, 0.08, PARSEL + 0.1]} renkAdi={cati.ikinciRenk!} golgeVer={false} golgeAl={false} />
      {cati.id === 'pergola' &&
        // Ahşap döşeme: tahta çizgileri
        [-1.5, -0.5, 0.5, 1.5].map((dz) => (
          <Kutu key={dz} konum={[ox, TAVAN + 0.245, oz + dz]} boyut={[PARSEL + 0.1, 0.01, 0.05]} renkAdi={renk.ahsapOrta} golgeVer={false} golgeAl={false} />
        ))}
      {cati.id === 'teras' &&
        // Teras: pişmiş karo döşeme
        <Kutu konum={[ox, TAVAN + 0.245, oz]} boyut={[PARSEL - 0.2, 0.01, PARSEL - 0.2]} renkAdi={cati.renk} golgeVer={false} golgeAl={false} />}
    </group>
  );
}

// Damın kenarları: terasta korkuluk, pergolada öne uzanan ahşap kirişler
function CatiKenarlari({ kenarlar }: { kenarlar: Kenar[] }) {
  const { cati } = useGorunusRenkleri();
  if (cati.id === 'teras')
    return (
      <group>
        {kenarlar.map((k) => {
          const { x, z } = kenarYeri(k);
          return (
            <group key={kenarAnahtari(k)} position={[x, TAVAN + 0.25, z]} rotation={[0, DONUS[k.y], 0]}>
              <Kutu konum={[-0.5, 0.45, 0.08]} boyut={[0.07, 0.9, 0.07]} renkAdi="#f7f3ea" golgeVer={false} />
              <Kutu konum={[0, 0.9, 0.08]} boyut={[1.06, 0.07, 0.1]} renkAdi="#f7f3ea" golgeVer={false} />
              {[-0.25, 0, 0.25].map((bx) => (
                <Kutu key={bx} konum={[bx, 0.42, 0.08]} boyut={[0.035, 0.84, 0.035]} renkAdi="#f7f3ea" golgeVer={false} />
              ))}
            </group>
          );
        })}
      </group>
    );
  if (cati.id === 'pergola') {
    const onler = kenarlar.filter((k) => k.y === 'g');
    const onAnahtarlari = new Set(onler.map((k) => `${k.c},${k.r}`));
    return (
      <group>
        {onler.map((k) => {
            const { x, z } = kenarYeri(k);
            const d = PERGOLA_DERINLIGI;
            // Sıranın sağ ucu: kapanış kirişi ve direği
            const sagUc = !onAnahtarlari.has(`${k.c + 1},${k.r}`);
            return (
              <group key={kenarAnahtari(k)} position={[x, 0, z]}>
                {/* Kiriş, iki birimde bir direk, üstte çıtalar */}
                <Kutu konum={[-0.5, TAVAN + 0.05, -d / 2]} boyut={[0.1, 0.18, d]} renkAdi={renk.ahsapOrta} />
                {k.c % 2 === 0 && <Kutu konum={[-0.5, (TAVAN + 0.05) / 2, -d + 0.06]} boyut={[0.12, TAVAN + 0.05, 0.12]} renkAdi={renk.ahsapOrta} />}
                {sagUc && (
                  <>
                    <Kutu konum={[0.5, TAVAN + 0.05, -d / 2]} boyut={[0.1, 0.18, d]} renkAdi={renk.ahsapOrta} />
                    <Kutu konum={[0.5, (TAVAN + 0.05) / 2, -d + 0.06]} boyut={[0.12, TAVAN + 0.05, 0.12]} renkAdi={renk.ahsapOrta} />
                  </>
                )}
                {[0.6, 1.2, 1.8, 2.3].map((dz) => (
                  <Kutu key={dz} konum={[0, TAVAN + 0.18, -dz]} boyut={[1.06, 0.07, 0.07]} renkAdi={renk.ahsapAcik} />
                ))}
              </group>
            );
          })}
      </group>
    );
  }
  return null;
}

// İç zemin (belge 0.11): seçilen desen bir arazi karesini kaplar
function IcZemin({ konum }: { konum: [number, number, number] }) {
  const { zemin } = useGorunusRenkleri();
  const doku = zeminDokusu(zemin);
  return (
    <mesh position={konum} receiveShadow>
      <boxGeometry args={[PARSEL, 0.1, PARSEL]} />
      <meshStandardMaterial map={doku} roughness={zemin.desen === 'cila' || zemin.desen === 'dama' ? 0.55 : 0.8} />
    </mesh>
  );
}

// Dükkânın çevresindeki kaldırım: mahalle sokaklarıyla aynı taş döşeme (belge 0.12)
const kaldirimDokusu = (() => {
  const d = tasDokusu();
  d.repeat.set(92 / 4, 14.4 / 4);
  return d;
})();

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
  // Sınırdaki bir parça pencere mi (sınırda olmayan komşu sayılmaz)
  const sinirAnahtarlari = useMemo(() => new Set(kenarlar.map(kenarAnahtari)), [kenarlar]);
  const pencereMi = useCallback(
    (k: Kenar) => sinirAnahtarlari.has(kenarAnahtari(k)) && parcaTuru(k, duvarParcalari) === 'pencere',
    [duvarParcalari, sinirAnahtarlari],
  );
  // En öndeki kapalı sıra: ortası ve ön kenarı
  let onSol = Infinity, onSag = -Infinity;
  for (const p of kapaliParseller) {
    const { i, j } = parselCoz(p);
    const s = parselSiniri(i, j);
    if (s.onZ !== onZ) continue;
    onSol = Math.min(onSol, s.solX);
    onSag = Math.max(onSag, s.sagX);
  }
  const onSira = { x: (onSol + onSag) / 2, z: onZ };
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
            <IcZemin konum={[ox, -0.05, oz]} />
            <Tavan>
              <Kutu konum={[ox, TAVAN, oz]} boyut={[PARSEL, 0.1, PARSEL]} renkAdi={renk.ahsapAcik} golgeVer={false} golgeAl={false} />
              {[-1.2, 0.8].map((dz) => (
                <Kutu key={dz} konum={[ox, TAVAN - 0.12, oz + dz]} boyut={[PARSEL, 0.16, 0.2]} renkAdi={renk.ahsapOrta} golgeVer={false} />
              ))}
              {/* Damın dış yüzü: oyuncunun seçtiği çatı (belge 0.11) */}
              <CatiParseli ox={ox} oz={oz} />
            </Tavan>
          </group>
        );
      })}
      {kenarlar.map((k) => (
        <DuvarParcasi key={kenarAnahtari(k)} k={k} tur={parcaTuru(k, duvarParcalari)} pencereMi={pencereMi} />
      ))}
      <Tavan>
        <CatiKenarlari kenarlar={kenarlar} />
        {/* Çatı tabelası: en öndeki sıranın ortasında (C3) */}
        <CatiTabelasiYeri x={onSira.x} z={onSira.z + 0.45} />
      </Tavan>
      <KesikDuvar yon={[0, -1]}>
        <NeonTabela kenarlar={kenarlar} pencereMi={pencereMi} />
      </KesikDuvar>
      <DisTabelalar />
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
        <meshStandardMaterial map={kaldirimDokusu} roughness={1} />
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
  useDil();
  const ad = m(`cesit.${c.ad}` as MetinAnahtari);
  const doku = useMemo(() => etiketDokusu(ad, c.renk), [ad, c.renk]);
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
      <Mutfak />
      <TezgahGrubu>
        <Tezgah />
        <ArkaTezgah />
        <BolumSaksilari />
        <TezgahParcalari />
      </TezgahGrubu>
    </group>
  );
}
