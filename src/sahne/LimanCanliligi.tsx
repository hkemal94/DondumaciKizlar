import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { YURUYUS_Z } from '../oyun/dekorasyon';
import { durumuOku, havaNe, useDurum } from '../oyun/durum';
import { useEkranAyari } from '../arayuz/ekranAyari';
import { HazirModel } from './HazirModel';
import { InsanKarakter, type Hareket } from './InsanKarakter';
import { rastgeleVaryant } from './karakterler';
import { tabelaIsigi } from './gokRenkleri';
import { renk } from './renkler';
import { sesler } from '../ses/ses';

// Limanın canlılığı (belge 0.12; Kemal, 15 Ekim: "biraz daha canlı bir
// liman"): yürüyüş yolu iki yana sise kadar uzar, iki yanı fenerli; arka
// yoldan arabalar geçer; yürüyüş yolunda gezenler; limanın üstünde martılar,
// yürüyüş yolunda kediler. Hepsi yalnız görüntü. Düşük grafikte kalabalık azalır.

const TERAS_UCU = 46; // Disari.tsx: terasın iki ucu
const YOL_SONU = 320; // yürüyüş yolu bu kadar uzar (ötesi sis)
const YOL_ON = 15; // araba yolunun ön kenarı (Liman.tsx)

// ---- Yürüyüş yolunun uzantısı, korkuluğu ve fenerleri ----
function YuruyusYolu() {
  const { direkler, fenerler } = useMemo(() => {
    const m = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
    const direkler: THREE.Matrix4[] = [];
    for (const yon of [-1, 1])
      for (let x = TERAS_UCU; x <= YOL_SONU; x += 2) direkler.push(m(yon * x, 0.5, -8.2));
    // Fenerler: deniz tarafında bütün yol boyunca, kara tarafında terasın dışında
    const fenerler: THREE.Matrix4[] = [];
    for (let x = -YOL_SONU; x <= YOL_SONU; x += 16) {
      if (Math.abs(x) < 4) continue; // iskele açıklığı
      fenerler.push(m(x, 0, -8.55));
      if (Math.abs(x) > TERAS_UCU) fenerler.push(m(x + 8, 0, -5.4));
    }
    return { direkler, fenerler };
  }, []);
  const camMalzeme = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffd98a', emissiveIntensity: 0 }), []);
  useFrame(() => {
    camMalzeme.emissiveIntensity = 0.1 + 1.6 * tabelaIsigi.deger;
  });
  const ornek = (geo: THREE.BufferGeometry, malzeme: THREE.Material, yerler: THREE.Matrix4[]) => {
    const im = new THREE.InstancedMesh(geo, malzeme, yerler.length);
    yerler.forEach((y, i) => im.setMatrixAt(i, y));
    return im;
  };
  const meshler = useMemo(() => {
    const koyu = new THREE.MeshStandardMaterial({ color: renk.ahsapKoyu });
    const demir = new THREE.MeshStandardMaterial({ color: '#3a3340', roughness: 0.6 });
    return [
      ornek(new THREE.BoxGeometry(0.12, 1, 0.12), koyu, direkler),
      ornek(new THREE.CylinderGeometry(0.05, 0.07, 3, 6).translate(0, 1.5, 0), demir, fenerler),
      ornek(new THREE.BoxGeometry(0.3, 0.4, 0.3).translate(0, 3.1, 0), camMalzeme, fenerler),
      ornek(new THREE.ConeGeometry(0.26, 0.2, 4).rotateY(Math.PI / 4).translate(0, 3.4, 0), demir, fenerler),
    ];
  }, [direkler, fenerler, camMalzeme]);
  return (
    <group>
      {/* Taş yol ve tırabzanlar: terasın iki ucundan sise kadar */}
      {[-1, 1].map((yon) => (
        <group key={yon} position={[(yon * (TERAS_UCU + YOL_SONU)) / 2, 0, 0]}>
          <mesh position={[0, 0.0, YURUYUS_Z + 0.9]} receiveShadow>
            <boxGeometry args={[YOL_SONU - TERAS_UCU, 0.14, 5.2]} />
            <meshStandardMaterial color="#d6c6a6" roughness={1} />
          </mesh>
          <mesh position={[0, 1.0, -8.2]}>
            <boxGeometry args={[YOL_SONU - TERAS_UCU, 0.1, 0.16]} />
            <meshStandardMaterial color={renk.ahsapKoyu} />
          </mesh>
          <mesh position={[0, 0.55, -8.2]}>
            <boxGeometry args={[YOL_SONU - TERAS_UCU, 0.07, 0.1]} />
            <meshStandardMaterial color={renk.ahsapKoyu} />
          </mesh>
        </group>
      ))}
      {meshler.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </group>
  );
}

// ---- Araba yolunun çizgileri, bordürü ve lambaları (Kemal, 15 Ekim: "yol
// tarafına yol çizgileri ve sokak lambaları") ----
const YOL_ENI = 7; // Liman.tsx
const YOL_ORTA = YOL_ON + YOL_ENI / 2;
const YAYA_GECITLERI = [-128, -64, 0, 64, 128];
function ArabaYolu() {
  const m = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
  const { kesikler, zebralar, lambalar } = useMemo(() => {
    const kesikler: THREE.Matrix4[] = [];
    const zebralar: THREE.Matrix4[] = [];
    const lambalar: THREE.Matrix4[] = [];
    // Orta çizgi: 3 m çizgi, 3 m boşluk; yaya geçidinde kesilir
    for (let x = -YOL_SONU; x <= YOL_SONU; x += 6) if (!YAYA_GECITLERI.some((g) => Math.abs(g - x) < 3)) kesikler.push(m(x, 0, YOL_ORTA));
    // Yaya geçidi: yol boyunca uzanan şeritler, yolun enine dizili
    for (const g of YAYA_GECITLERI) for (let z = YOL_ON + 0.6; z < YOL_ON + YOL_ENI - 0.4; z += 1) zebralar.push(m(g, 0, z + 0.25));
    // Eski tip lambalar iki yanda, karşılıklı değil sıralı (yaya geçidinin yanında boşluk)
    for (let x = -YOL_SONU; x <= YOL_SONU; x += 24) {
      lambalar.push(m(x + 6, 0, YOL_ON - 0.95));
      lambalar.push(m(x + 18, 0, YOL_ON + YOL_ENI + 0.95));
    }
    return { kesikler, zebralar, lambalar };
  }, []);
  const camMalzeme = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffd98a', emissiveIntensity: 0 }), []);
  useFrame(() => {
    camMalzeme.emissiveIntensity = 0.1 + 1.6 * tabelaIsigi.deger;
  });
  const meshler = useMemo(() => {
    const ornek = (geo: THREE.BufferGeometry, malzeme: THREE.Material, yerler: THREE.Matrix4[]) => {
      const im = new THREE.InstancedMesh(geo, malzeme, yerler.length);
      yerler.forEach((y, i) => im.setMatrixAt(i, y));
      im.receiveShadow = true;
      return im;
    };
    const boya = new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.9 });
    // Dönemin demir lambası: koyu yeşil direk, ayak, fener ve şapka
    const demir = new THREE.MeshStandardMaterial({ color: '#2f3d35', roughness: 0.55 });
    return [
      ornek(new THREE.PlaneGeometry(3, 0.14).rotateX(-Math.PI / 2).translate(0, -0.012, 0), boya, kesikler),
      ornek(new THREE.PlaneGeometry(2.6, 0.5).rotateX(-Math.PI / 2).translate(0, -0.012, 0), boya, zebralar),
      ornek(new THREE.CylinderGeometry(0.16, 0.2, 0.35, 8).translate(0, 0.17, 0), demir, lambalar),
      ornek(new THREE.CylinderGeometry(0.045, 0.06, 3.2, 8).translate(0, 1.8, 0), demir, lambalar),
      ornek(new THREE.CylinderGeometry(0.17, 0.1, 0.42, 6).translate(0, 3.6, 0), camMalzeme, lambalar),
      ornek(new THREE.ConeGeometry(0.24, 0.22, 6).translate(0, 3.92, 0), demir, lambalar),
      ornek(new THREE.SphereGeometry(0.05, 6, 4).translate(0, 4.06, 0), demir, lambalar),
    ];
  }, [kesikler, zebralar, lambalar, camMalzeme]);
  return (
    <group>
      {/* Kenar çizgileri: ince, kesintisiz */}
      {[YOL_ON + 0.35, YOL_ON + YOL_ENI - 0.35].map((z) => (
        <mesh key={z} position={[0, -0.012, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2 * YOL_SONU, 0.1]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.9} />
        </mesh>
      ))}
      {/* Bordür: yolla kaldırım arasında açık gri taş */}
      {[YOL_ON - 0.08, YOL_ON + YOL_ENI + 0.08].map((z) => (
        <mesh key={z} position={[0, 0.03, z]} receiveShadow>
          <boxGeometry args={[2 * YOL_SONU, 0.17, 0.16]} />
          <meshStandardMaterial color="#d9d3c9" roughness={0.95} />
        </mesh>
      ))}
      {meshler.map((im, i) => (
        <primitive key={i} object={im} />
      ))}
    </group>
  );
}

// ---- Arabalar: arka yolda iki yönde ----
const ARABALAR = ['car_sedan', 'car_hatchback', 'car_stationwagon', 'car_taxi'];
function Araba({ model, serit, hiz, baslangic }: { model: string; serit: 1 | -1; hiz: number; baslangic: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const yol = 2 * YOL_SONU;
    const t = ((clock.elapsedTime * hiz + baslangic) % yol + yol) % yol;
    g.position.x = serit * (t - YOL_SONU);
  });
  return (
    <group ref={ref} position={[0, 0, YOL_ON + (serit > 0 ? 2 : 5)]} rotation={[0, serit > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <HazirModel yol={`sokak/${model}`} ayar={{ grup: 'liman', en: 1.9 }} />
    </group>
  );
}

// ---- Yürüyüş yolunda gezenler: iki uç arasında gidip gelir ----
function Gezen({ tohum, hiz, uc, serit }: { tohum: number; hiz: number; uc: number; serit: number }) {
  const ref = useRef<THREE.Group>(null);
  const hareket = useRef<Hareket>('yuru');
  const varyant = useMemo(() => rastgeleVaryant(tohum), [tohum]);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    // Duraklatınca herkes yerinde durur
    if (durumuOku().duraklatildi) {
      hareket.current = 'dur';
      return;
    }
    hareket.current = 'yuru';
    const yol = 4 * uc;
    const t = ((clock.elapsedTime * hiz + tohum * 7) % yol + yol) % yol;
    const gidiyor = t < 2 * uc;
    g.position.x = gidiyor ? -uc + t : uc - (t - 2 * uc);
    g.rotation.y = gidiyor ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={ref} position={[0, 0.07, YURUYUS_Z + serit]}>
      <InsanKarakter varyant={varyant} hareket={hareket} />
    </group>
  );
}

// ---- Martılar: limanın üstünde daire çizer, kanat çırpar ----
function Marti({ merkez, yaricap, yukseklik, hiz, faz }: { merkez: [number, number]; yaricap: number; yukseklik: number; hiz: number; faz: number }) {
  const ref = useRef<THREE.Group>(null);
  const sol = useRef<THREE.Mesh>(null);
  const sag = useRef<THREE.Mesh>(null);
  const kanat = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.15, 0, 0, 0.2, 0.75, 0, 0.05], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const a = clock.elapsedTime * hiz + faz;
    g.position.set(merkez[0] + Math.cos(a) * yaricap, yukseklik + Math.sin(a * 2.3) * 0.8, merkez[1] + Math.sin(a) * yaricap);
    g.rotation.y = -a + (hiz > 0 ? 0 : Math.PI);
    const cirp = Math.sin(clock.elapsedTime * 7 + faz * 3) * 0.6;
    if (sol.current) sol.current.rotation.z = cirp;
    if (sag.current) sag.current.rotation.z = -cirp;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.16, 0.14, 0.55]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <mesh ref={sag} geometry={kanat}>
        <meshStandardMaterial color="#e8e6e0" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={sol} geometry={kanat} scale={[-1, 1, 1]}>
        <meshStandardMaterial color="#e8e6e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---- Kedi: yürüyüş yolunda oturur, kuyruğunu sallar ----
function Kedi({ konum, donus, renkAdi }: { konum: [number, number, number]; donus: number; renkAdi: string }) {
  const kuyruk = useRef<THREE.Group>(null);
  const bas = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + konum[0];
    if (kuyruk.current) kuyruk.current.rotation.y = Math.sin(t * 1.6) * 0.5;
    if (bas.current) bas.current.rotation.y = Math.sin(t * 0.3) * 0.6;
  });
  return (
    <group position={konum} rotation={[0, donus, 0]}>
      {/* Oturan gövde */}
      <mesh position={[0, 0.16, 0]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.28, 0.3]} />
        <meshStandardMaterial color={renkAdi} roughness={0.9} />
      </mesh>
      <group ref={bas} position={[0, 0.36, 0.08]}>
        <mesh>
          <boxGeometry args={[0.17, 0.14, 0.15]} />
          <meshStandardMaterial color={renkAdi} roughness={0.9} />
        </mesh>
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]}>
            <coneGeometry args={[0.035, 0.07, 4]} />
            <meshStandardMaterial color={renkAdi} />
          </mesh>
        ))}
      </group>
      <group ref={kuyruk} position={[0, 0.06, -0.16]}>
        <mesh position={[0, 0.02, -0.14]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.3]} />
          <meshStandardMaterial color={renkAdi} />
        </mesh>
      </group>
    </group>
  );
}

// Ara sıra martı sesi: genel görünümde, oyun duraklatılmamışken 18–35 saniyede bir
function MartiSesi() {
  const sonraki = useRef(8);
  useFrame(({ clock }) => {
    if (clock.elapsedTime < sonraki.current) return;
    sonraki.current = clock.elapsedTime + 18 + Math.random() * 17;
    const d = durumuOku();
    // Yağmurda martılar susar (belge 0.15)
    if (d.kamera === 'dukkan' && !d.duraklatildi && !d.acilis && havaNe(d) !== 'yagmurlu') sesler.marti();
  });
  return null;
}

export function LimanCanliligi() {
  const { grafik } = useEkranAyari();
  const kalabalik = grafik === 'dusuk' ? 0 : grafik === 'orta' ? 1 : 2;
  const arabalar = useMemo(() => {
    const sayi = [3, 6, 9][kalabalik];
    return Array.from({ length: sayi }, (_, i) => ({
      model: ARABALAR[i % ARABALAR.length],
      serit: (i % 2 ? 1 : -1) as 1 | -1,
      hiz: 8 + ((i * 37) % 5),
      baslangic: (i * 173) % (2 * YOL_SONU),
    }));
  }, [kalabalik]);
  const gezenler = [0, 4, 7][kalabalik];
  // Giriş ekranında liman daha canlı (belge 0.14): dükkânın önünde kısa
  // yürüyenler ve alçaktan dönen martılar
  const { acilis } = useDurum();
  const girisGezenleri = acilis ? [3, 5, 6][kalabalik] : 0;
  return (
    <group>
      <YuruyusYolu />
      <ArabaYolu />
      <MartiSesi />
      {arabalar.map((a, i) => (
        <Araba key={i} {...a} />
      ))}
      {Array.from({ length: gezenler }, (_, i) => (
        <Gezen key={i} tohum={500 + i * 13} hiz={1.1 + (i % 3) * 0.15} uc={60 + (i % 4) * 25} serit={i % 2 ? 0.7 : 1.6} />
      ))}
      {Array.from({ length: girisGezenleri }, (_, i) => (
        <Gezen key={`g${i}`} tohum={900 + i * 17} hiz={0.9 + (i % 3) * 0.2} uc={18 + (i % 3) * 8} serit={i % 2 ? 0.9 : 1.8} />
      ))}
      {acilis && (
        <>
          <Marti merkez={[2, -14]} yaricap={9} yukseklik={7} hiz={0.35} faz={0.5} />
          <Marti merkez={[-6, -20]} yaricap={12} yukseklik={9} hiz={-0.3} faz={2.5} />
        </>
      )}
      <Marti merkez={[10, -50]} yaricap={22} yukseklik={14} hiz={0.25} faz={0} />
      <Marti merkez={[-20, -70]} yaricap={30} yukseklik={18} hiz={-0.2} faz={2} />
      <Marti merkez={[30, -90]} yaricap={18} yukseklik={12} hiz={0.3} faz={4} />
      {kalabalik > 0 && (
        <>
          <Marti merkez={[-5, -110]} yaricap={25} yukseklik={20} hiz={0.22} faz={1} />
          <Marti merkez={[60, -40]} yaricap={15} yukseklik={10} hiz={-0.28} faz={3} />
        </>
      )}
      <Kedi konum={[-52, 0.07, -6.2]} donus={2.6} renkAdi="#d08a4a" />
      <Kedi konum={[58, 0.07, -5.6]} donus={-2.2} renkAdi="#4a4540" />
      <Kedi konum={[48.5, 0.07, -6.8]} donus={3.0} renkAdi="#e8e2d6" />
    </group>
  );
}
