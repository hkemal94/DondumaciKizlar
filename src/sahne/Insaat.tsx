import { useMemo } from 'react';
import { parselDurumu, parselSec, useDurum, type ParselDurumu } from '../oyun/durum';
import { SATIR_EN_AZ, SATIR_EN_COK, SUTUN_EN_AZ, SUTUN_EN_COK, parselAnahtari, parselCoz, parselSiniri } from '../oyun/dekorasyon';

// İnşaat modu (belge 0.1, 0.2; Kemal, 14 Ekim): gün başında dükkâna üstten
// bakılır, arazi kareleri trafik ışığı renkleriyle görünür: alınmış yeşil,
// alınabilir sarı, alınamaz gri. Kareye dokununca seçilir; fiyat ve "Al"
// ekrandaki panelde.

const RENKLER: Record<ParselDurumu, string> = {
  sahip: '#4fc46a',
  alinabilir: '#ffc928',
  kilitli: '#8b8790',
};
const YUKSEKLIK = 0.16; // terasın ve ahşap zeminin üstünde
const KENAR = 0.08;

function Kare({ anahtar, durumu, secili }: { anahtar: string; durumu: ParselDurumu; secili: boolean }) {
  const { i, j } = parselCoz(anahtar);
  const { solX, sagX, onZ, arkaZ } = parselSiniri(i, j);
  const genislik = sagX - solX;
  const derinlik = arkaZ - onZ;
  const x = (solX + sagX) / 2;
  const z = (onZ + arkaZ) / 2;
  const kenarRengi = secili ? '#ffffff' : RENKLER[durumu];
  const kalinlik = secili ? KENAR * 2 : KENAR;
  return (
    <group position={[x, YUKSEKLIK, z]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          if (e.delta > 12) return; // kaydırma / çevirme değil
          e.stopPropagation();
          parselSec(anahtar);
        }}
      >
        <planeGeometry args={[genislik - 0.3, derinlik - 0.3]} />
        <meshBasicMaterial color={RENKLER[durumu]} transparent opacity={secili ? 0.55 : durumu === 'kilitli' ? 0.18 : 0.32} depthWrite={false} />
      </mesh>
      {/* Kenar çizgisi */}
      {[
        [0, -derinlik / 2 + 0.15, genislik - 0.3, kalinlik],
        [0, derinlik / 2 - 0.15, genislik - 0.3, kalinlik],
        [-genislik / 2 + 0.15, 0, kalinlik, derinlik - 0.3],
        [genislik / 2 - 0.15, 0, kalinlik, derinlik - 0.3],
      ].map(([kx, kz, en, boy], n) => (
        <mesh key={n} position={[kx, 0.005, kz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[en, boy]} />
          <meshBasicMaterial color={kenarRengi} transparent opacity={durumu === 'kilitli' && !secili ? 0.35 : 0.9} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Insaat() {
  const durum = useDurum();
  // Gösterilen kareler: sahip olunanların çevresinde iki sıra
  const kareler = useMemo(() => {
    const sutunlar = durum.parseller.map((p) => parselCoz(p).i);
    const enAz = Math.max(SUTUN_EN_AZ, Math.min(...sutunlar) - 2);
    const enCok = Math.min(SUTUN_EN_COK, Math.max(...sutunlar) + 2);
    const liste: string[] = [];
    for (let i = enAz; i <= enCok; i++) for (let j = SATIR_EN_AZ; j <= SATIR_EN_COK; j++) liste.push(parselAnahtari(i, j));
    return liste;
  }, [durum.parseller]);
  if (!durum.insaat) return null;
  return (
    <group>
      {kareler.map((k) => (
        <Kare key={k} anahtar={k} durumu={parselDurumu(k, durum)} secili={durum.seciliParsel === k} />
      ))}
    </group>
  );
}
