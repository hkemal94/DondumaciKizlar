import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gecerliGorunus, gorunenTabelalar, useDurum } from '../oyun/durum';
import type { Kenar } from '../oyun/dekorasyon';
import { kenarYeri } from '../oyun/dekorasyon';
import { m, useDil } from '../metinler';
import { logoDokusu, LOGO_DOSYALARI, type LogoTuru } from './logo';
import { tabelaIsigi } from './gokRenkleri';
import { renk } from './renkler';

// Tabelalar (C3, belge 0.11): çatı tabelası, kaldırımda direk tabela,
// pencerede neon, iskele girişinde kemer. Hepsinde dükkânın adı; ışıklılar
// akşam kendiliğinden yanar (tabelaIsigi, Sahne → Isiklar). Işık kaynağı
// eklenmez (telefon): yalnız parlayan yüzeyler.

const CATI_TABANI = 3.25; // Dukkan.tsx TAVAN

// Akşam parlayan malzeme: gündüz sönük, gece taban parlaklığına çıkar
function useParlayan(renkAdi: string, taban: number) {
  const mal = useMemo(() => new THREE.MeshStandardMaterial({ color: renkAdi, emissive: renkAdi, emissiveIntensity: 0 }), [renkAdi]);
  useFrame(() => {
    mal.emissiveIntensity = taban * tabelaIsigi.deger;
  });
  return mal;
}

// Logo levhası: gündüz boyalı, gece içten aydınlatılmış gibi parlar
function IsikliLogo({ tur, genislik }: { tur: LogoTuru; genislik: number }) {
  const doku = logoDokusu(tur);
  const mal = useMemo(
    () => new THREE.MeshStandardMaterial({ map: doku, emissiveMap: doku, emissive: '#ffffff', transparent: true, roughness: 0.6 }),
    [doku],
  );
  useFrame(() => {
    mal.emissiveIntensity = 0.15 + 0.85 * tabelaIsigi.deger;
  });
  return (
    <mesh material={mal}>
      <planeGeometry args={[genislik, genislik / LOGO_DOSYALARI[tur].oran]} />
    </mesh>
  );
}

// Levhanın çevresinde ampuller
function Ampuller({ en, boy, aralik = 0.3 }: { en: number; boy: number; aralik?: number }) {
  const mal = useParlayan('#ffe9a8', 2.2);
  const yerler = useMemo(() => {
    const l: [number, number][] = [];
    for (let x = -en / 2; x <= en / 2 + 0.01; x += aralik) l.push([x, boy / 2], [x, -boy / 2]);
    for (let y = -boy / 2 + aralik; y < boy / 2 - 0.01; y += aralik) l.push([-en / 2, y], [en / 2, y]);
    return l;
  }, [en, boy, aralik]);
  return (
    <group>
      {yerler.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]} material={mal}>
          <sphereGeometry args={[0.045, 6, 4]} />
        </mesh>
      ))}
    </group>
  );
}

function Kutu({ konum, boyut, renkAdi }: { konum: [number, number, number]; boyut: [number, number, number]; renkAdi: string }) {
  return (
    <mesh position={konum} castShadow>
      <boxGeometry args={boyut} />
      <meshStandardMaterial color={renkAdi} roughness={0.8} />
    </mesh>
  );
}

// Çatının ön kenarında, iki ayak üstünde büyük levha (denize bakar)
function CatiTabelasi({ x, z, y }: { x: number; z: number; y: number }) {
  const en = 2.8;
  const boy = en / LOGO_DOSYALARI.yazi.oran;
  return (
    <group position={[x, y, z]} rotation={[0, Math.PI, 0]}>
      {[-en / 2 + 0.3, en / 2 - 0.3].map((ax) => (
        <Kutu key={ax} konum={[ax, 0.25, 0.05]} boyut={[0.1, 0.5, 0.1]} renkAdi={renk.morKoyu} />
      ))}
      <group position={[0, 0.5 + boy / 2 + 0.12, 0]}>
        <Kutu konum={[0, 0, -0.04]} boyut={[en + 0.3, boy + 0.25, 0.08]} renkAdi={renk.mor} />
        <group position={[0, 0, 0.01]}>
          <IsikliLogo tur="yazi" genislik={en} />
        </group>
        <Ampuller en={en + 0.2} boy={boy + 0.15} />
      </group>
    </group>
  );
}

// Kaldırımda direk tabela: iki yüzlü külahlı logo, tepesinde fener
function DirekTabela({ x, z }: { x: number; z: number }) {
  const en = 1.0;
  const boy = en / LOGO_DOSYALARI.kulahli.oran;
  const fener = useParlayan('#fff3c4', 2);
  return (
    <group position={[x, 0, z]}>
      <Kutu konum={[0, 1.4, 0]} boyut={[0.1, 2.8, 0.1]} renkAdi="#3a3340" />
      <Kutu konum={[0.55, 2.55, 0]} boyut={[1.2, 0.07, 0.07]} renkAdi="#3a3340" />
      <group position={[0.6, 2.5 - boy / 2 - 0.12, 0]}>
        <Kutu konum={[0, 0, 0]} boyut={[en + 0.16, boy + 0.16, 0.06]} renkAdi={renk.sari} />
        {[1, -1].map((yon) => (
          <group key={yon} position={[0, 0, 0.035 * yon]} rotation={[0, yon > 0 ? 0 : Math.PI, 0]}>
            <IsikliLogo tur="kulahli" genislik={en} />
          </group>
        ))}
      </group>
      <mesh position={[0, 2.92, 0]} material={fener}>
        <sphereGeometry args={[0.12, 10, 8]} />
      </mesh>
    </group>
  );
}

// Neon: külah çizgisi ve "DONDURMA" yazısı; tr.json'dan gelir
function neonDokusu(yazi: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const g = c.getContext('2d')!;
  g.lineCap = g.lineJoin = 'round';
  const cizgi = (renkAdi: string, kalinlik: number) => {
    g.strokeStyle = renkAdi;
    g.shadowColor = renkAdi;
    g.shadowBlur = 14;
    g.lineWidth = kalinlik;
  };
  // Külah: üçgen ve top
  cizgi('#7af0ff', 9);
  g.beginPath();
  g.moveTo(98, 70);
  g.lineTo(158, 70);
  g.lineTo(128, 128);
  g.closePath();
  g.stroke();
  cizgi('#ff7ad9', 9);
  g.beginPath();
  g.arc(128, 54, 26, Math.PI * 1.05, Math.PI * 1.95);
  g.stroke();
  // Yazı
  g.font = 'bold 40px sans-serif';
  g.textAlign = 'center';
  g.fillStyle = '#ff9be6';
  g.shadowColor = '#ff7ad9';
  g.shadowBlur = 16;
  g.fillText(yazi, 128, 172);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Neon({ k }: { k: Kenar }) {
  const { x, z } = kenarYeri(k);
  useDil();
  const neonYazi = m('tabela.neonYazi');
  const doku = useMemo(() => neonDokusu(neonYazi), [neonYazi]);
  const mal = useMemo(
    () => new THREE.MeshBasicMaterial({ map: doku, transparent: true, depthWrite: false, toneMapped: false }),
    [doku],
  );
  useFrame(() => {
    // Gündüz sönük cam boru, akşam parlak
    mal.color.setScalar(0.85 + 0.6 * tabelaIsigi.deger);
  });
  return (
    <mesh position={[x, 1.9, z + 0.07]} rotation={[0, Math.PI, 0]} material={mal}>
      <planeGeometry args={[1.0, 0.75]} />
    </mesh>
  );
}

// İskele girişinde kemer: iki direk, alçak bir yay, üstünde logo ve ampuller
const KEMER_Z = -8.9;
function IskeleKemeri() {
  const yari = 2.3;
  const ampul = useParlayan('#ffe9a8', 2.2);
  const yay = useMemo(() => {
    const l: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const a = (Math.PI * i) / 12;
      l.push([-Math.cos(a) * yari, Math.sin(a) * 0.7]);
    }
    return l;
  }, []);
  return (
    <group position={[0, 0, KEMER_Z]} rotation={[0, Math.PI, 0]}>
      {[-yari, yari].map((ax) => (
        <Kutu key={ax} konum={[ax, 1.5, 0]} boyut={[0.2, 3.0, 0.2]} renkAdi={renk.ahsapOrta} />
      ))}
      {/* Yay: kısa tahtalar */}
      {yay.slice(0, -1).map(([ax, ay], i) => {
        const [bx, by] = yay[i + 1];
        return (
          <group key={i} position={[(ax + bx) / 2, 3.0 + (ay + by) / 2, 0]} rotation={[0, 0, Math.atan2(by - ay, bx - ax)]}>
            <Kutu konum={[0, 0, 0]} boyut={[Math.hypot(bx - ax, by - ay) + 0.04, 0.16, 0.18]} renkAdi={renk.ahsapAcik} />
          </group>
        );
      })}
      {yay.map(([ax, ay], i) => (
        <mesh key={i} position={[ax, 3.0 + ay - 0.12, 0.1]} material={ampul}>
          <sphereGeometry args={[0.05, 6, 4]} />
        </mesh>
      ))}
      <group position={[0, 3.25, 0.12]}>
        <Kutu konum={[0, 0, -0.04]} boyut={[1.9, 0.9, 0.06]} renkAdi={renk.mor} />
        <group position={[0, 0, 0.01]}>
          <IsikliLogo tur="yazi" genislik={1.7} />
        </group>
      </group>
    </group>
  );
}

// Dükkânın dışındakiler (kapalı alandan bağımsız)
export function CatiTabelasiYeri({ x, z }: { x: number; z: number }) {
  const durum = useDurum();
  if (!gorunenTabelalar(durum).includes('cati')) return null;
  return <CatiTabelasi x={x} z={z} y={CATI_TABANI + (gecerliGorunus(durum).cati === 'kiremit' ? 0.05 : 0.25)} />;
}

export function DisTabelalar() {
  const tabelalar = gorunenTabelalar(useDurum());
  return (
    <>
      {tabelalar.includes('direk') && <DirekTabela x={3.4} z={-7.7} />}
      {tabelalar.includes('kemer') && <IskeleKemeri />}
    </>
  );
}

export function NeonTabela({ kenarlar, pencereMi }: { kenarlar: Kenar[]; pencereMi: (k: Kenar) => boolean }) {
  const tabelalar = gorunenTabelalar(useDurum());
  // Ön cephenin ortasına yakın bir cam (logo camın üstünde, neon camın içinde)
  const k = useMemo(
    () =>
      kenarlar
        .filter((x) => x.y === 'g' && pencereMi(x))
        .sort((a, b) => a.r - b.r || Math.abs(a.c + 1) - Math.abs(b.c + 1))[0],
    [kenarlar, pencereMi],
  );
  if (!tabelalar.includes('neon') || !k) return null;
  return <Neon k={k} />;
}
