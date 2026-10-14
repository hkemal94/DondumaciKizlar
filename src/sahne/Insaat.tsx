import { useMemo } from 'react';
import { parselDurumu, parselSec, useDurum, type ParselDurumu } from '../oyun/durum';
import {
  SATIR_EN_AZ,
  SATIR_EN_COK,
  SUTUN_EN_AZ,
  SUTUN_EN_COK,
  TEZGAH_DERINLIGI,
  Z0,
  kenarAnahtari,
  kenarYeri,
  parcaTuru,
  sinirKenarlari,
  type ParcaTuru,
  parselAnahtari,
  parselCoz,
  parselSiniri,
} from '../oyun/dekorasyon';

// İnşaat modu (belge 0.1, 0.2; Kemal, 14 Ekim): gün başında dükkâna üstten
// bakılır, arazi kareleri trafik ışığı renkleriyle görünür: alınmış yeşil,
// alınabilir sarı, alınamaz gri. Kareye dokununca seçilir; fiyat ve "Al"
// ekrandaki panelde. Tezgah bölümü mor görünür; seçilince taşınır, uzar.

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

// Duvar parçaları (belge 0.4): duvarların üstünde ince şeritler; türüne
// göre renkli (düz duvar bej, pencere mavi, kapı mor), dokununca seçilir
const PARCA_RENGI: Record<ParcaTuru, string> = { duvar: '#d8c8b2', pencere: '#8fd3ff', kapi: '#9b5fc9' };
function DuvarSecici({ secili }: { secili: string | null }) {
  const { kapaliParseller, duvarParcalari } = useDurum();
  const kenarlar = useMemo(() => sinirKenarlari(kapaliParseller), [kapaliParseller]);
  return (
    <group>
      {kenarlar.map((k) => {
        const anahtar = kenarAnahtari(k);
        const { x, z, nx } = kenarYeri(k);
        const buSecili = secili === `duvar:${anahtar}`;
        return (
          <mesh
            key={anahtar}
            position={[x, 3.45, z]}
            rotation={[-Math.PI / 2, 0, nx !== 0 ? Math.PI / 2 : 0]}
            onClick={(e) => {
              if (e.delta > 12) return;
              e.stopPropagation();
              parselSec(`duvar:${anahtar}`);
            }}
          >
            <planeGeometry args={[0.92, 0.45]} />
            <meshBasicMaterial color={buSecili ? '#ffffff' : PARCA_RENGI[parcaTuru(k, duvarParcalari)]} transparent opacity={buSecili ? 0.95 : 0.8} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

// Tezgah bölümü: üstünde mor yarı saydam bir kutu; dokununca seçilir
function TezgahSecici({ secili }: { secili: boolean }) {
  const { tezgah } = useDurum();
  const x = tezgah.c + tezgah.boy / 2;
  const z = Z0 + tezgah.r + TEZGAH_DERINLIGI / 2;
  return (
    <mesh
      position={[x, 1.25, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        if (e.delta > 12) return;
        e.stopPropagation();
        parselSec('tezgah');
      }}
    >
      <planeGeometry args={[tezgah.boy - 0.1, TEZGAH_DERINLIGI - 0.1]} />
      <meshBasicMaterial color="#9b5fc9" transparent opacity={secili ? 0.55 : 0.3} depthWrite={false} />
    </mesh>
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
      <TezgahSecici secili={durum.seciliParsel === 'tezgah'} />
      <DuvarSecici secili={durum.seciliParsel} />
    </group>
  );
}
