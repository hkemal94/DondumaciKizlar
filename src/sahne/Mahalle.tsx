import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { renk } from './renkler';
import { SaydamEngel } from './SaydamEngel';

// Liman mahallesi (belge 0.12; Kemal, 15 Ekim: "savaş alanı gibi duruyor"):
// Quaternius Simple Buildings ve Kenney Modular Buildings evleri (Kemal seçti),
// taş döşeli sokaklar, bahçeler, zeytin / çam / begonvil. Çoğu ev beyaz
// badana, aralarda pastel; pencere camları açık renk.
//
// Telefon için: her ev tipi bir kez yüklenir, dokusu köşe renklerine çevrilir
// (doku kalmaz), duvar ve öteki parçalar ayrı iki çizime ayrılır; aynı tipteki
// bütün evler tek seferde çizilir (duvar rengi evden eve değişir). Ağaçlar
// kodla çizilen sade şekiller. Uzak sokaklar sisin içinde kalır.

const YOL_ON = 15;
const YOL_ENI = 7;
export const MAHALLE_BASI = YOL_ON + YOL_ENI + 4;
const SOKAK_ENI = 5;
const ADA_DERINLIGI = 30; // iki sokak arası
const ADA_ENI = 40;
const ADA_SATIRI = 4; // kıyıya paralel kaç sıra ada
const X_SINIRI = 200;

// ---- Ev tipleri: dosya ve boyu (metre) ----
const EV_TIPLERI: { yol: string; boy: number; agirlik: number }[] = [
  { yol: 'q-house2', boy: 6.5, agirlik: 3 },
  { yol: 'q-house3', boy: 7.5, agirlik: 2 },
  { yol: 'q-house5', boy: 6.5, agirlik: 2 },
  { yol: 'q-flat', boy: 10, agirlik: 1.5 },
  { yol: 'q-flat2', boy: 10, agirlik: 1 },
  { yol: 'k-house-a', boy: 7, agirlik: 2 },
  { yol: 'k-house-b', boy: 7.5, agirlik: 2 },
  { yol: 'k-house-c', boy: 7, agirlik: 2 },
  { yol: 'k-tower-a', boy: 10, agirlik: 1.5 },
  { yol: 'k-tower-b', boy: 8.5, agirlik: 1.5 },
  { yol: 'k-tower-c', boy: 11, agirlik: 1 },
  { yol: 'k-tower-d', boy: 12, agirlik: 0.7 },
];

// Duvar renkleri: çoğu beyaz badana, aralarda krem, sıva pembesi, açık sarı
const DUVARLAR = ['#f6f3ec', '#f6f3ec', '#f6f3ec', '#f6f3ec', '#f1e6d2', '#efd9cc', '#f3e5b5', '#f6f3ec', '#e6eef0'];

// Paketin rengi → Ege rengi. Duvar sayılan renkler için null (evden eve boyanır)
const hsl = { h: 0, s: 0, l: 0 };
function egeRengi(c: THREE.Color): THREE.Color | null {
  c.getHSL(hsl);
  const { h, s, l } = hsl;
  if (s < 0.35 && l > 0.5) return null; // duvar (badana)
  if (s < 0.25 && l > 0.25) return new THREE.Color('#d9d2c6'); // taş, kenarlar
  if (s < 0.25) return new THREE.Color('#4a5866'); // koyu: dam kenarı, gölge
  if (h < 0.07 || h > 0.93) return new THREE.Color('#c8705a'); // kiremit
  if (h < 0.16) return l < 0.45 ? new THREE.Color('#8a5a3c') : new THREE.Color('#efe2c8'); // ahşap, kum
  if (h < 0.45) return new THREE.Color(l > 0.4 ? '#c8705a' : '#5f7d4a'); // açık yeşil dam → kiremit; koyu yeşil bitki
  // Mavi: açık olanlar cam (Kemal: "pencere camları açık renk olsun"), koyular panjur / kapı
  return new THREE.Color(l > 0.45 ? '#cfe8f2' : '#2f7fb3');
}

// Dokudan renk okumak için resmi bir kez tuvale çiz
const tuvaller = new Map<unknown, ImageData>();
function resimVerisi(t: THREE.Texture): ImageData | null {
  const img = t.image as CanvasImageSource & { width: number; height: number };
  if (!img) return null;
  let v = tuvaller.get(img);
  if (!v) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, 0, 0);
    v = g.getImageData(0, 0, c.width, c.height);
    tuvaller.set(img, v);
  }
  return v;
}

interface EvParcalari {
  duvar: THREE.BufferGeometry;
  diger: THREE.BufferGeometry;
  en: number; // x boyu
  der: number; // z boyu
}

// Bir ev modelini iki geometriye çevirir: duvar (tek renk) ve öteki (köşe renkli)
async function eviHazirla(yukleyici: GLTFLoader, yol: string, boy: number): Promise<EvParcalari> {
  const gltf = await yukleyici.loadAsync(`${import.meta.env.BASE_URL}modeller/evler/${yol}.glb`);
  const kok = gltf.scene;
  kok.updateMatrixWorld(true);
  const duvarlar: THREE.BufferGeometry[] = [];
  const digerleri: THREE.BufferGeometry[] = [];
  const uv = new THREE.Vector2();
  const c = new THREE.Color();
  kok.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const malzeme = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
    const g = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld).toNonIndexed();
    g.deleteAttribute('tangent');
    const konum = g.getAttribute('position');
    const uvlar = g.getAttribute('uv');
    const doku = malzeme.map;
    const veri = doku ? resimVerisi(doku) : null;
    if (doku) doku.updateMatrix();
    const duvarK: number[] = [];
    const duvarN: number[] = [];
    const digerK: number[] = [];
    const digerN: number[] = [];
    const digerR: number[] = [];
    const normal = g.getAttribute('normal');
    for (let i = 0; i < konum.count; i += 3) {
      // Üçgenin rengi ilk köşesinden
      if (veri && uvlar) {
        uv.set(uvlar.getX(i), uvlar.getY(i)).applyMatrix3(doku!.matrix);
        const px = Math.min(veri.width - 1, Math.max(0, Math.floor((uv.x - Math.floor(uv.x)) * veri.width)));
        const py = Math.min(veri.height - 1, Math.max(0, Math.floor((uv.y - Math.floor(uv.y)) * veri.height)));
        const j = (py * veri.width + px) * 4;
        c.setRGB(veri.data[j] / 255, veri.data[j + 1] / 255, veri.data[j + 2] / 255, THREE.SRGBColorSpace);
      } else c.copy(malzeme.color);
      const yeni = egeRengi(c);
      for (let k = 0; k < 3; k++) {
        const hedefK = yeni ? digerK : duvarK;
        const hedefN = yeni ? digerN : duvarN;
        hedefK.push(konum.getX(i + k), konum.getY(i + k), konum.getZ(i + k));
        hedefN.push(normal.getX(i + k), normal.getY(i + k), normal.getZ(i + k));
        if (yeni) digerR.push(yeni.r, yeni.g, yeni.b);
      }
    }
    const yap = (k: number[], n: number[], r?: number[]) => {
      const b = new THREE.BufferGeometry();
      b.setAttribute('position', new THREE.Float32BufferAttribute(k, 3));
      b.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
      if (r) b.setAttribute('color', new THREE.Float32BufferAttribute(r, 3));
      return b;
    };
    if (duvarK.length) duvarlar.push(yap(duvarK, duvarN));
    if (digerK.length) digerleri.push(yap(digerK, digerN, digerR));
  });
  const birlestir = (l: THREE.BufferGeometry[], renkli: boolean) => {
    if (!l.length) {
      const b = new THREE.BufferGeometry();
      b.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
      b.setAttribute('normal', new THREE.Float32BufferAttribute([], 3));
      if (renkli) b.setAttribute('color', new THREE.Float32BufferAttribute([], 3));
      return b;
    }
    return mergeGeometries(l)!;
  };
  const duvar = birlestir(duvarlar, false);
  const diger = birlestir(digerleri, true);
  // Ölçü: tabanı yere, ortası sıfıra, boyu istenen kadar; önü −z (sokağa) bakar
  const kutu = new THREE.Box3();
  for (const g of [duvar, diger]) {
    g.computeBoundingBox();
    if (g.boundingBox && isFinite(g.boundingBox.min.x)) kutu.union(g.boundingBox);
  }
  const olcek = boy / (kutu.max.y - kutu.min.y);
  const orta = kutu.getCenter(new THREE.Vector3());
  for (const g of [duvar, diger]) {
    g.translate(-orta.x, -kutu.min.y, -orta.z);
    g.scale(olcek, olcek, olcek);
  }
  return { duvar, diger, en: (kutu.max.x - kutu.min.x) * olcek, der: (kutu.max.z - kutu.min.z) * olcek };
}

// Sabit tohumlu rastgele: mahalle her açılışta aynı
function rastgele(tohum: number) {
  let s = tohum;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Yer {
  tip: number;
  x: number;
  z: number;
  don: number;
  duvar: string;
}

// Evlerin yerleri: kıyıya paralel sokakların iki yanında, ada ada.
// Ön sıranın dükkânın arkasına düşen kısmı ayrı (yarı saydam olabilsin)
function yerleriHesapla() {
  const r = rastgele(11);
  const toplam = EV_TIPLERI.reduce((a, t) => a + t.agirlik, 0);
  const tipSec = () => {
    let x = r() * toplam;
    for (let i = 0; i < EV_TIPLERI.length; i++) if ((x -= EV_TIPLERI[i].agirlik) <= 0) return i;
    return 0;
  };
  const evler: Yer[] = [];
  const bahceler: { x: number; z: number; en: number; der: number }[] = [];
  const agaclar: { x: number; z: number; tur: 'zeytin' | 'cam' | 'begonvil'; boy: number }[] = [];
  for (let s = 0; s < ADA_SATIRI; s++) {
    const z0 = MAHALLE_BASI + s * (ADA_DERINLIGI + SOKAK_ENI);
    for (let x0 = -X_SINIRI; x0 < X_SINIRI; x0 += ADA_ENI + SOKAK_ENI) {
      // Adanın iki sırası: önde sokağa (−z) bakan, arkada arka sokağa (+z) bakan
      for (const arka of [false, true]) {
        let x = x0 + 1;
        while (x < x0 + ADA_ENI - 6) {
          const tip = tipSec();
          const genislik = 8 + r() * 3;
          if (r() < 0.14) {
            // Boş arsa: bahçe ve ağaç
            bahceler.push({ x: x + genislik / 2, z: z0 + (arka ? ADA_DERINLIGI - 7 : 7), en: genislik, der: 12 });
            agaclar.push({ x: x + genislik / 2, z: z0 + (arka ? ADA_DERINLIGI - 7 : 7), tur: r() < 0.7 ? 'zeytin' : 'cam', boy: 4 + r() * 3 });
          } else {
            evler.push({
              tip,
              x: x + genislik / 2,
              z: z0 + (arka ? ADA_DERINLIGI - 5 : 5),
              don: (arka ? 0 : Math.PI) + (r() - 0.5) * 0.06,
              duvar: DUVARLAR[Math.floor(r() * DUVARLAR.length)],
            });
            if (r() < 0.35) agaclar.push({ x: x + genislik / 2 + (r() - 0.5) * 4, z: z0 + (arka ? ADA_DERINLIGI - 10.5 : 10.5), tur: 'zeytin', boy: 3 + r() * 2 });
            if (r() < 0.3) agaclar.push({ x: x + 1, z: z0 + (arka ? ADA_DERINLIGI - 1.2 : 1.2), tur: 'begonvil', boy: 2 + r() });
          }
          x += genislik + 1.5;
        }
      }
      // Adanın ortası: bahçeler (çimen) ve birkaç ağaç
      bahceler.push({ x: x0 + ADA_ENI / 2, z: z0 + ADA_DERINLIGI / 2, en: ADA_ENI - 2, der: ADA_DERINLIGI - 22 });
      for (let k = 0; k < 3; k++) agaclar.push({ x: x0 + 5 + r() * (ADA_ENI - 10), z: z0 + ADA_DERINLIGI / 2 + (r() - 0.5) * 4, tur: r() < 0.6 ? 'zeytin' : 'cam', boy: 4 + r() * 4 });
    }
  }
  // Araba yolunun kenarında, kaldırımda ağaç sırası
  for (let x = -X_SINIRI; x < X_SINIRI; x += 14) agaclar.push({ x: x + r() * 3, z: YOL_ON + YOL_ENI + 2.2, tur: 'zeytin', boy: 3.5 + r() * 1.5 });
  // Dükkânın hemen arkasındaki evler ayrı (kamerayla dükkân arasına girince solarlar)
  const onde = (e: Yer) => e.z < MAHALLE_BASI + 2 * (ADA_DERINLIGI + SOKAK_ENI) && Math.abs(e.x) < 50;
  return { evler: evler.filter((e) => !onde(e)), ondekiler: evler.filter(onde), bahceler, agaclar };
}

// ---- Taş döşeme dokusu (sokaklar) ----
export function tasDokusu() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#b8ad9c';
  g.fillRect(0, 0, 128, 128);
  const r = rastgele(3);
  for (let y = 0; y < 128; y += 16)
    for (let x = (y / 16) % 2 ? -8 : 0; x < 128; x += 16) {
      const t = 0.9 + r() * 0.15;
      g.fillStyle = `rgb(${Math.round(214 * t)},${Math.round(204 * t)},${Math.round(188 * t)})`;
      g.fillRect(x + 1.5, y + 1.5, 13, 13);
    }
  const d = new THREE.CanvasTexture(c);
  d.wrapS = d.wrapT = THREE.RepeatWrapping;
  d.colorSpace = THREE.SRGBColorSpace;
  return d;
}

// ---- Ağaçlar: sade low-poly şekiller ----
export function agacGeometrileri() {
  // Zeytin: eğri gövde, gri-yeşil yayvan tepe (birkaç top)
  const govde = new THREE.CylinderGeometry(0.12, 0.2, 1.6, 5);
  govde.translate(0, 0.8, 0);
  const tepeParcalari = [
    [0, 1.9, 0, 1.1],
    [0.7, 1.7, 0.2, 0.8],
    [-0.6, 1.75, -0.2, 0.85],
  ].map(([x, y, z, r]) => new THREE.IcosahedronGeometry(r, 0).scale(1, 0.75, 1).translate(x, y, z));
  const zeytinTepe = mergeGeometries(tepeParcalari.map((g) => g.toNonIndexed()))!;
  // Çam: üst üste iki koni
  const camTepe = mergeGeometries([
    new THREE.ConeGeometry(1.2, 2.2, 6).translate(0, 2.2, 0).toNonIndexed(),
    new THREE.ConeGeometry(0.85, 1.8, 6).translate(0, 3.3, 0).toNonIndexed(),
  ])!;
  // Begonvil: duvar dibinde pembe-mor çiçekli çalı
  const begonvil = mergeGeometries(
    [
      [0, 0.6, 0, 0.7],
      [0.6, 1.1, 0.1, 0.55],
      [-0.5, 1.2, 0, 0.5],
    ].map(([x, y, z, r]) => new THREE.IcosahedronGeometry(r, 0).translate(x, y, z).toNonIndexed()),
  )!;
  return { govde, zeytinTepe, camTepe, begonvil };
}

export function Ornekler({ geo, renkAdi, yerler, puruz = 0.9 }: { geo: THREE.BufferGeometry; renkAdi: string; yerler: THREE.Matrix4[]; puruz?: number }) {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: renkAdi, roughness: puruz, flatShading: true }), yerler.length);
    yerler.forEach((y, i) => m.setMatrixAt(i, y));
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }, [geo, renkAdi, yerler, puruz]);
  return <primitive object={mesh} />;
}

// Bir ev tipinin bütün kopyaları: duvar (evden eve renk) + öteki parçalar
function EvTipi({ p, yerler }: { p: EvParcalari; yerler: Yer[] }) {
  const meshler = useMemo(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const yukari = new THREE.Vector3(0, 1, 0);
    const bir = new THREE.Vector3(1, 1, 1);
    const duvar = new THREE.InstancedMesh(p.duvar, new THREE.MeshStandardMaterial({ roughness: 0.95 }), yerler.length);
    const diger = new THREE.InstancedMesh(p.diger, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), yerler.length);
    const c = new THREE.Color();
    yerler.forEach((y, i) => {
      q.setFromAxisAngle(yukari, y.don);
      m.compose(new THREE.Vector3(y.x, 0, y.z), q, bir);
      duvar.setMatrixAt(i, m);
      diger.setMatrixAt(i, m);
      duvar.setColorAt(i, c.set(y.duvar));
    });
    for (const x of [duvar, diger]) {
      x.castShadow = false;
      x.receiveShadow = true;
    }
    return [duvar, diger];
  }, [p, yerler]);
  return (
    <>
      <primitive object={meshler[0]} />
      <primitive object={meshler[1]} />
    </>
  );
}

// Tek ev (öndeki evler): kutusu doğru ölçülsün diye tek tek çizilir
function TekEv({ p, yer }: { p: EvParcalari; yer: Yer }) {
  const malzemeler = useMemo(
    () => [new THREE.MeshStandardMaterial({ color: yer.duvar, roughness: 0.95 }), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 })],
    [yer.duvar],
  );
  return (
    <group position={[yer.x, 0, yer.z]} rotation={[0, yer.don, 0]}>
      <mesh geometry={p.duvar} material={malzemeler[0]} receiveShadow />
      <mesh geometry={p.diger} material={malzemeler[1]} receiveShadow />
    </group>
  );
}

export function Mahalle() {
  const [parcalar, setParcalar] = useState<EvParcalari[] | null>(null);
  useEffect(() => {
    let iptal = false;
    const y = new GLTFLoader();
    Promise.all(EV_TIPLERI.map((t) => eviHazirla(y, t.yol, t.boy))).then((p) => {
      if (!iptal) setParcalar(p);
    });
    return () => {
      iptal = true;
    };
  }, []);
  const { evler, ondekiler, bahceler, agaclar } = useMemo(yerleriHesapla, []);
  const dokular = useMemo(() => {
    const sokak = tasDokusu();
    sokak.repeat.set(200, 1.25);
    const dik = tasDokusu();
    dik.repeat.set(1.25, 40);
    return { sokak, dik };
  }, []);
  const agac = useMemo(agacGeometrileri, []);
  const agacYerleri = useMemo(() => {
    const m = (x: number, z: number, s: number, don = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), don), new THREE.Vector3(s, s, s));
    const zeytin = agaclar.filter((a) => a.tur === 'zeytin').map((a, i) => m(a.x, a.z, a.boy / 2.6, i * 1.7));
    const cam = agaclar.filter((a) => a.tur === 'cam').map((a, i) => m(a.x, a.z, a.boy / 4.2, i));
    const begonvil = agaclar.filter((a) => a.tur === 'begonvil').map((a, i) => m(a.x, a.z, a.boy / 1.7, i));
    return { zeytin, cam, begonvil, govde: [...zeytin, ...cam] };
  }, [agaclar]);
  const derinlik = ADA_SATIRI * (ADA_DERINLIGI + SOKAK_ENI);
  return (
    <group>
      {/* Mahallenin zemini: kuru çimen */}
      <mesh position={[0, -0.09, MAHALLE_BASI - 2 + derinlik / 2 + 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, derinlik + 160]} />
        <meshStandardMaterial color="#b9b98a" roughness={1} />
      </mesh>
      {/* Kıyıya paralel taş sokaklar ve dik sokaklar */}
      {Array.from({ length: ADA_SATIRI + 1 }, (_, s) => (
        <mesh key={`p${s}`} position={[0, -0.05, MAHALLE_BASI - SOKAK_ENI / 2 + s * (ADA_DERINLIGI + SOKAK_ENI)]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1000, SOKAK_ENI]} />
          <meshStandardMaterial map={dokular.sokak} roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: Math.ceil((2 * X_SINIRI) / (ADA_ENI + SOKAK_ENI)) + 1 }, (_, i) => (
        <mesh key={`d${i}`} position={[-X_SINIRI - SOKAK_ENI / 2 + i * (ADA_ENI + SOKAK_ENI), -0.05, MAHALLE_BASI + derinlik / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[SOKAK_ENI, derinlik]} />
          <meshStandardMaterial map={dokular.dik} roughness={1} />
        </mesh>
      ))}
      {/* Bahçeler: daha yeşil çimen, alçak beyaz duvar */}
      {bahceler.map((b, i) => (
        <group key={`b${i}`}>
          <mesh position={[b.x, -0.04, b.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[b.en, b.der]} />
            <meshStandardMaterial color="#93b86a" roughness={1} />
          </mesh>
        </group>
      ))}
      <Ornekler geo={agac.govde} renkAdi="#7a6550" yerler={agacYerleri.govde} />
      <Ornekler geo={agac.zeytinTepe} renkAdi="#8a9a6a" yerler={agacYerleri.zeytin} />
      <Ornekler geo={agac.camTepe} renkAdi="#4f6e45" yerler={agacYerleri.cam} />
      <Ornekler geo={agac.begonvil} renkAdi="#c2408a" yerler={agacYerleri.begonvil} />
      {parcalar &&
        EV_TIPLERI.map((_, t) => {
          const yerler = evler.filter((e) => e.tip === t);
          return yerler.length ? <EvTipi key={t} p={parcalar[t]} yerler={yerler} /> : null;
        })}
      {/* Dükkânın arkasındaki evler: kamerayla dükkân arasına girince solar */}
      {parcalar &&
        ondekiler.map((e, i) => (
          <SaydamEngel key={`o${i}`}>
            <TekEv p={parcalar[e.tip]} yer={e} />
          </SaydamEngel>
        ))}
    </group>
  );
}
