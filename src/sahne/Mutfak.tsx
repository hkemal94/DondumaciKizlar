import { useMemo } from 'react';
import * as THREE from 'three';
import { useDurum } from '../oyun/durum';
import { PARSEL, parselAnahtari, parselCoz, parselSiniri } from '../oyun/dekorasyon';
import { renk } from './renkler';
import { HazirModel } from './HazirModel';

// Açık mutfak (belge 0.5): fayans zemin, dükkânla arasında duvar yok, alçak
// bir sınır. Depo şimdilik yalnız görüntü: raflar, buzdolabı, kasalar
// (buzdolabı ve kasalar hazır paketten, belge 0.7).

function fayansDokusu() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      g.fillStyle = (i + j) % 2 ? '#e9e4dc' : '#f7f4ee';
      g.fillRect(i * 32, j * 32, 32, 32);
    }
  g.strokeStyle = '#cfc7ba';
  g.lineWidth = 2;
  g.strokeRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(PARSEL * 2, PARSEL * 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Kutu({ konum, boyut, renkAdi }: { konum: [number, number, number]; boyut: [number, number, number]; renkAdi: string }) {
  return (
    <mesh position={konum} castShadow receiveShadow>
      <boxGeometry args={boyut} />
      <meshStandardMaterial color={renkAdi} roughness={0.7} />
    </mesh>
  );
}

// Bir mutfak karesinin arka kenarında raf, buzdolabı ve kasalar
function DepoSusleri() {
  const kasaRenkleri = ['#ffc928', '#9b5fc9', '#5fd08a', '#ff6f7d'];
  return (
    <group>
      {/* Raf: sığ, arka duvara dayalı */}
      <group position={[-0.9, 0, 0.37]}>
        {[0.05, 0.6, 1.15, 1.7].map((y) => (
          <Kutu key={y} konum={[0, y, 0]} boyut={[1.6, 0.05, 0.45]} renkAdi={renk.ahsapAcik} />
        ))}
        {[-0.78, 0.78].map((x) => (
          <Kutu key={x} konum={[x, 0.9, 0]} boyut={[0.05, 1.8, 0.45]} renkAdi={renk.ahsapKoyu} />
        ))}
        {[0.6, 1.15, 1.7].flatMap((y, i) =>
          [-0.5, 0, 0.5].map((x, j) => <Kutu key={`${y}${x}`} konum={[x, y + 0.13, 0]} boyut={[0.3, 0.22, 0.3]} renkAdi={kasaRenkleri[(i + j) % 4]} />),
        )}
      </group>
      {/* Buzdolabı (KayKit, belge 0.7): nane yeşili, önü dükkâna dönük */}
      <HazirModel
        yol="mutfak/fridge_A"
        ayar={{ grup: 'dukkan', yukseklik: 1.9, boya: [['#3ad7a7', '#a8eccf', 30], ['#19927f', '#7fc4a6', 30]] }}
        konum={[0.7, 0, 0]}
        donus={Math.PI}
      />
      {/* Yerde üst üste kasalar (KayKit) */}
      <HazirModel yol="mutfak/crate" ayar={{ grup: 'dukkan', yukseklik: 0.4 }} konum={[1.5, 0, -0.1]} donus={Math.PI} />
      <HazirModel yol="mutfak/crate" ayar={{ grup: 'dukkan', yukseklik: 0.4 }} konum={[1.5, 0.4, -0.1]} donus={Math.PI + 0.2} />
    </group>
  );
}

export function Mutfak() {
  const { mutfakParseller, kapaliParseller } = useDurum();
  const doku = useMemo(fayansDokusu, []);
  return (
    <group>
      {mutfakParseller.map((p) => {
        const { i, j } = parselCoz(p);
        const s = parselSiniri(i, j);
        const ox = (s.solX + s.sagX) / 2;
        const oz = (s.onZ + s.arkaZ) / 2;
        // Dükkâna bakan kenarlarda alçak sınır (mutfak olmayan kapalı komşu)
        const sinirlar: { x: number; z: number; en: number; boy: number }[] = [];
        const komsu = (a: number, b: number) => {
          const k = parselAnahtari(a, b);
          return kapaliParseller.includes(k) && !mutfakParseller.includes(k);
        };
        if (komsu(i, j - 1)) sinirlar.push({ x: ox, z: s.onZ + 0.05, en: PARSEL - 1.2, boy: 0.1 });
        if (komsu(i - 1, j)) sinirlar.push({ x: s.solX + 0.05, z: oz, en: 0.1, boy: PARSEL - 1.2 });
        if (komsu(i + 1, j)) sinirlar.push({ x: s.sagX - 0.05, z: oz, en: 0.1, boy: PARSEL - 1.2 });
        return (
          <group key={p}>
            <mesh position={[ox, 0.004, oz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[PARSEL, PARSEL]} />
              <meshStandardMaterial map={doku} roughness={0.6} />
            </mesh>
            {sinirlar.map((b, n) => (
              <group key={n}>
                <Kutu konum={[b.x, 0.45, b.z]} boyut={[b.en, 0.9, b.boy]} renkAdi={renk.ahsapOrta} />
                <Kutu konum={[b.x, 0.92, b.z]} boyut={[b.en + 0.06, 0.05, b.boy + 0.12]} renkAdi={renk.tezgahUst} />
              </group>
            ))}
            {/* Depo arka duvarın dibinde, önü dükkâna (−z) dönük. Buzdolabı
                derin (~1 m): ortası duvardan 0,65 m içeride, arkası taşmasın
                (Kemal, 15 Ekim: "buzdolabı hâlâ arkadan taşıyor") */}
            <group position={[ox, 0, s.arkaZ - 0.65]}>
              <DepoSusleri />
            </group>
          </group>
        );
      })}
    </group>
  );
}
