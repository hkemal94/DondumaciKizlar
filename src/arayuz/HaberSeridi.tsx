import { useDurum } from '../oyun/durum';
import { m, type MetinAnahtari } from '../metinler';

// Haber şeridi (belge 0.8; Kemal, 14 Ekim gece): üstte saat ile jeton
// arasında sürekli kayan şerit. Genel görünümdeki ipucu ("Günaydın…") ve
// son haberler buradan geçer.
export function HaberSeridi({ ipucu }: { ipucu: string | null }) {
  const { haberler } = useDurum();
  const yazilar = [...(ipucu ? [ipucu] : []), ...haberler.map((h) => m(h.anahtar as MetinAnahtari, h.degerler))];
  if (!yazilar.length) return null;
  const metin = yazilar.join('   •   ');
  // Uzun metin daha uzun sürede geçer; okuma hızı sabit kalsın
  const sure = Math.max(10, metin.length * 0.22);
  return (
    <div className="haber-seridi" aria-live="polite">
      <div className="haber-kayan" style={{ animationDuration: `${sure}s` }}>
        <span>{metin}</span>
        <span aria-hidden>{metin}</span>
      </div>
    </div>
  );
}
