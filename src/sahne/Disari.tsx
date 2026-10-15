import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { renk } from './renkler';
import { gokRenkleri, havaGorunusu } from './gokRenkleri';
import { PARSEL, YURUYUS_Z, Z0, parselAnahtari } from '../oyun/dekorasyon';
import { useDurum } from '../oyun/durum';
import { ISKELE_ENI, Liman, kiyiZ } from './Liman';

// Dükkânın penceresinden görünen dış dünya: gök, deniz, önündeki ahşap
// teras ve Liman (kumsal, T iskele, mendirek, mahalle, tekneler; belge 0.10,
// Liman.tsx). Uzakta tepeler.

// Aynı sahne her açılışta aynı görünsün diye tohumlu rastgele sayı.
function tohumluRastgele(tohum: number) {
  let s = tohum;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Gok() {
  const malzeme = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          ust: { value: gokRenkleri.ust },
          ufuk: { value: gokRenkleri.ufuk },
        },
        vertexShader: /* glsl */ `
          varying vec3 vYon;
          void main() {
            vYon = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 ust;
          uniform vec3 ufuk;
          varying vec3 vYon;
          void main() {
            float h = clamp(vYon.y * 2.2, 0.0, 1.0);
            gl_FragColor = vec4(mix(ufuk, ust, pow(h, 0.7)), 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  return (
    <mesh material={malzeme} renderOrder={-1}>
      <sphereGeometry args={[400, 24, 12]} />
    </mesh>
  );
}

// Deniz (belge 0.12; Kemal: "ne deniz bir şeye benziyor ne kumsal"): açılış
// konsept görseli gibi yumuşak low-poly. Dalgalar ekran kartında hesaplanır
// (köşeler her karede telefonda taşınmaz); kıyıya yakın açık turkuaz, açıkta
// koyu mavi; kıyıda gelip giden köpük çizgisi.
const DENIZ_Y = -0.9;
const denizSaati = { value: 0 };
// Rüzgârda ve yağmurda dalgalar büyür (belge 0.15)
const denizDalgasi = { value: 1 };
function Deniz() {
  const { geometri, malzeme } = useMemo(() => {
    const g = new THREE.PlaneGeometry(900, 640, 150, 100);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -15 - 320);
    // Renk: kıyıdan uzaklaştıkça koyulaşır
    const konum = g.attributes.position;
    const renkler: number[] = [];
    const sig = new THREE.Color('#5fc4c9');
    const orta = new THREE.Color(renk.denizSig);
    const derin = new THREE.Color('#1f5f8f');
    const c = new THREE.Color();
    for (let i = 0; i < konum.count; i++) {
      const x = konum.getX(i);
      const z = konum.getZ(i);
      const uzak = Math.max(0, kiyiZ(x) - z);
      if (uzak < 30) c.copy(sig).lerp(orta, uzak / 30);
      else c.copy(orta).lerp(derin, Math.min(1, (uzak - 30) / 220));
      renkler.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(renkler, 3));
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.05, flatShading: true });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.saat = denizSaati;
      sh.uniforms.dalga = denizDalgasi;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float saat;\nuniform float dalga;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float d1 = sin(position.x * 0.22 + saat * 0.9) * 0.16;
          float d2 = cos(position.z * 0.27 + saat * 0.7) * 0.14;
          float d3 = sin((position.x + position.z) * 0.12 + saat * 1.3) * 0.1;
          transformed.y += (d1 + d2 + d3) * dalga;`,
        );
    };
    return { geometri: g, malzeme: m };
  }, []);
  useFrame(({ clock }) => {
    denizSaati.value = clock.elapsedTime;
    denizDalgasi.value = 1 + havaGorunusu.ruzgar * 0.7 + havaGorunusu.yagmur * 0.3;
  });
  return <mesh geometry={geometri} material={malzeme} position={[0, DENIZ_Y, 0]} receiveShadow />;
}

// Kıyıda köpük: su ile kumun buluştuğu yerde gelip giden beyaz şerit
function Kopuk() {
  const { geometri, malzeme } = useMemo(() => {
    const konum: number[] = [];
    const uv: number[] = [];
    const indis: number[] = [];
    let n = 0;
    for (let x = -450; x <= 450; x += 4) {
      const z = kiyiZ(x);
      // Köpük suyun kuma değdiği yerin biraz dışından içine
      konum.push(x, DENIZ_Y + 0.22, z - 2.2, x, DENIZ_Y + 0.22, z + 1.2);
      uv.push(x / 18, 0, x / 18, 1);
      if (n > 0) {
        const a = (n - 1) * 2;
        indis.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
      n++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(indis);
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { saat: denizSaati },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float saat;
        varying vec2 vUv;
        void main() {
          // Dalga kıyıya gelip çekilir: köpük bandı v ekseninde ileri geri
          float gelis = 0.45 + 0.25 * sin(saat * 0.8 + vUv.x * 0.9);
          float bant = smoothstep(gelis - 0.28, gelis, vUv.y) * (1.0 - smoothstep(gelis, gelis + 0.06, vUv.y));
          float benek = 0.7 + 0.3 * sin(vUv.x * 9.0 + saat * 1.7) * sin(vUv.x * 4.0 - saat);
          gl_FragColor = vec4(1.0, 1.0, 1.0, bant * benek * 0.85);
        }`,
    });
    return { geometri: g, malzeme: m };
  }, []);
  return <mesh geometry={geometri} material={malzeme} renderOrder={2} />;
}

function Tepe({
  konum,
  olcek,
  tohum,
  renkAdi = renk.tepe,
}: {
  konum: [number, number, number];
  olcek: [number, number, number];
  tohum: number;
  renkAdi?: string;
}) {
  const geometri = useMemo(() => {
    const r = tohumluRastgele(tohum);
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    // Köşeleri biraz oynat: düzgün top yerine engebeli tepe.
    const goruldu = new Map<string, number>();
    for (let i = 0; i < p.count; i++) {
      const anahtar = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
      let k = goruldu.get(anahtar);
      if (k === undefined) {
        k = 0.85 + r() * 0.3;
        goruldu.set(anahtar, k);
      }
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [tohum]);
  return (
    <mesh geometry={geometri} position={konum} scale={olcek}>
      <meshStandardMaterial color={renkAdi} roughness={0.9} flatShading />
    </mesh>
  );
}

// Ahşap teras: dükkânın önünden rıhtıma kadar, iki yana uzun (dükkân
// büyüdükçe yer kalsın). Deniz tarafında taş yürüyüş yolu (Kemal, 14 Ekim:
// "yürüyüş yolu deniz tarafına"); iskelenin önünde korkulukta açıklık.
const TERAS_UCU = 46;
// Korkulukta açıklık: T iskeleye giden ahşap yol (belge 0.10)
const ISKELE_ACIKLIGI: [number, number] = [-ISKELE_ENI / 2 - 0.4, ISKELE_ENI / 2 + 0.4];

function Teras() {
  const { kapaliParseller } = useDurum();
  const tahtalar = [];
  // Tahtalar 1 m geniş, tam metrelerde: alınan karelerin ahşabıyla aynı hizada (belge 0.3).
  // Ön terastaki kare duvarla kapatılınca (belge 0.4) tahta o karenin önünde biter.
  for (let x = -TERAS_UCU; x < TERAS_UCU; x++) {
    const kapali = kapaliParseller.includes(parselAnahtari(Math.floor(x / PARSEL), -1));
    const arka = kapali ? Z0 - PARSEL : -2.4;
    tahtalar.push(
      <mesh key={x} position={[x + 0.5, 0, (-8.4 + arka) / 2]} receiveShadow>
        <boxGeometry args={[0.96, 0.12, arka + 8.4]} />
        <meshStandardMaterial color={((x % 2) + 2) % 2 ? renk.ahsapAcik : renk.ahsapOrta} roughness={0.9} />
      </mesh>,
    );
  }
  const korkuluk = [];
  for (let x = -TERAS_UCU + 2; x <= TERAS_UCU - 2; x += 2) {
    if (x > ISKELE_ACIKLIGI[0] && x < ISKELE_ACIKLIGI[1]) continue;
    korkuluk.push(
      <mesh key={x} position={[x, 0.5, -8.2]} castShadow>
        <boxGeometry args={[0.12, 1, 0.12]} />
        <meshStandardMaterial color={renk.ahsapKoyu} />
      </mesh>,
    );
  }
  // Korkuluğun tırabzanları: iskelenin iki yanında iki parça
  const parcalar: [number, number][] = [
    [-TERAS_UCU + 2, ISKELE_ACIKLIGI[0] + 0.4],
    [ISKELE_ACIKLIGI[1] - 0.4, TERAS_UCU - 2],
  ];
  return (
    <group>
      {tahtalar}
      {/* Taş yürüyüş yolu: müşteriler buradan gelip gider */}
      <mesh position={[0, 0.065, YURUYUS_Z]} receiveShadow>
        <boxGeometry args={[TERAS_UCU * 2, 0.02, 1.7]} />
        <meshStandardMaterial color="#d6c6a6" roughness={1} />
      </mesh>
      {[-1, 1].map((y) => (
        <mesh key={y} position={[0, 0.07, YURUYUS_Z + y * 0.88]}>
          <boxGeometry args={[TERAS_UCU * 2, 0.02, 0.07]} />
          <meshStandardMaterial color="#b9a581" roughness={1} />
        </mesh>
      ))}
      {korkuluk}
      {parcalar.map(([a, b]) => (
        <group key={a}>
          <mesh position={[(a + b) / 2, 1.0, -8.2]} castShadow>
            <boxGeometry args={[b - a, 0.1, 0.16]} />
            <meshStandardMaterial color={renk.ahsapKoyu} />
          </mesh>
          <mesh position={[(a + b) / 2, 0.55, -8.2]}>
            <boxGeometry args={[b - a, 0.07, 0.1]} />
            <meshStandardMaterial color={renk.ahsapKoyu} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Disari() {
  return (
    <group>
      <Gok />
      <Deniz />
      <Kopuk />
      <Teras />
      <Liman />
      {/* Mahallenin ardındaki tepeler (uzakta, sisin içinde) */}
      <Tepe konum={[-260, -8, 330]} olcek={[120, 45, 60]} tohum={3} />
      <Tepe konum={[-60, -10, 360]} olcek={[110, 55, 60]} tohum={7} renkAdi={renk.tepeKoyu} />
      <Tepe konum={[170, -8, 340]} olcek={[130, 50, 60]} tohum={11} />
      <Tepe konum={[380, -6, 300]} olcek={[90, 40, 50]} tohum={17} renkAdi={renk.tepeKoyu} />
    </group>
  );
}
