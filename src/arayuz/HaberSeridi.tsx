import { useState } from 'react';
import { useDurum } from '../oyun/durum';
import { m, type MetinAnahtari } from '../metinler';

// Haber şeridi (belge 0.8; Kemal, 14 Ekim gece): üstte saat ile jeton
// arasında. Yeni bir haber ya da ipucu gelince makul bir hızda 3 kez geçer,
// sonra kaybolur ("sürekli aynı yazının dönmesini sevmedim").
const GECIS_SAYISI = 3;
const HARF_SURESI = 0.12; // saniye: okunur bir hız

export function HaberSeridi({ ipucu }: { ipucu: string | null }) {
  const { haberler } = useDurum();
  const enYeni = haberler[0];
  // Yorumun nedeni bir yazı anahtarı olarak gelir; o anki dilde yazılır (8c)
  const degerler = enYeni?.degerler && { ...enYeni.degerler, ...(typeof enYeni.degerler.neden === 'string' ? { neden: m(enYeni.degerler.neden as MetinAnahtari) } : {}), ...(typeof enYeni.degerler.cesit === 'string' ? { cesit: m(enYeni.degerler.cesit as MetinAnahtari) } : {}) };
  const yazilar = [...(ipucu ? [ipucu] : []), ...(enYeni ? [m(enYeni.anahtar as MetinAnahtari, degerler)] : [])];
  const metin = yazilar.join('   •   ');
  // Hangi yazının geçişi bitti: metin ya da yeni haber değişince şerit yeniden başlar
  const anahtar = `${metin}|${enYeni?.zaman ?? 0}`;
  const [biten, setBiten] = useState<string | null>(null);
  if (!metin || biten === anahtar) return null;
  const sure = Math.max(6, metin.length * HARF_SURESI);
  return (
    <div className="haber-seridi" aria-live="polite">
      <div
        key={anahtar}
        className="haber-kayan"
        style={{ animationDuration: `${sure}s`, animationIterationCount: GECIS_SAYISI }}
        onAnimationEnd={() => setBiten(anahtar)}
      >
        <span>{metin}</span>
        <span aria-hidden>{metin}</span>
      </div>
    </div>
  );
}
