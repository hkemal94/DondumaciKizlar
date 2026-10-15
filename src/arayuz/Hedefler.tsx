import { hedefIlerlemesi, useDurum, yildizYazisi, type Hedef, type Yorum } from '../oyun/durum';
import { AYAR } from '../oyun/ayarlar';
import { m, type MetinAnahtari } from '../metinler';

// Günlük hedefler ve müşteri yorumları (belge 0.12, 8c).

function HedefSatiri({ h }: { h: Hedef }) {
  const durum = useDurum();
  const ilerleme = Math.min(h.hedef, Math.floor(hedefIlerlemesi(h, durum)));
  return (
    <li className={h.tamam ? 'tamam' : ''}>
      <span className="hedef-isaret" aria-hidden>
        {h.tamam ? '✓' : ''}
      </span>
      <span className="hedef-ad">{m(`hedef.${h.tur}` as MetinAnahtari, { hedef: h.hedef })}</span>
      <span className="hedef-sayi">
        {ilerleme}/{h.hedef}
      </span>
    </li>
  );
}

// Gün içinde, genel görünümde sol üstte küçük liste
export function GunlukHedefler() {
  const durum = useDurum();
  if (durum.hazirlik || durum.gunSonu || durum.kamera !== 'dukkan' || durum.hedefler.length === 0) return null;
  return (
    <div className="gunluk-hedefler" aria-label={m('hedef.baslik')}>
      <div className="hedef-baslik">{m('hedef.baslik')}</div>
      <ul>
        {durum.hedefler.map((h) => (
          <HedefSatiri key={h.tur} h={h} />
        ))}
      </ul>
    </div>
  );
}

// Gün sonu kartı: hedefler
export function GunSonuHedefleri() {
  const { hedefler } = useDurum();
  if (hedefler.length === 0) return null;
  return (
    <div className="gun-sonu-kutu">
      <div className="gun-yeni-baslik">{m('hedef.baslik')}</div>
      <ul className="hedef-liste">
        {hedefler.map((h) => (
          <HedefSatiri key={h.tur} h={h} />
        ))}
      </ul>
      <p className="gel-not">{m('hedef.odul', { jeton: AYAR.hedef.odulJeton, exp: AYAR.hedef.odulExp })}</p>
    </div>
  );
}

// Müşterinin küçük yüzü: görünümüne göre renkli daire (kurgu yok)
const YUZ_RENKLERI = ['#f3cfae', '#c98e66', '#e3b08a', '#9a6545', '#6b4430'];

// Gün sonu kartı: en iyi ve en düşük iki yorum
export function GunSonuYorumlari() {
  const { yorumlar } = useDurum();
  const sirali = [...yorumlar].sort((a, b) => b.yildiz - a.yildiz);
  const secilen: Yorum[] = sirali.length <= 4 ? sirali : [...sirali.slice(0, 2), ...sirali.slice(-2)];
  return (
    <div className="gun-sonu-kutu">
      <div className="gun-yeni-baslik">{m('yorum.baslik')}</div>
      {secilen.length === 0 ? (
        <p className="gel-not">{m('yorum.yok')}</p>
      ) : (
        <ul className="yorum-liste">
          {secilen.map((y, i) => (
            <li key={i}>
              <span className="yorum-yuz" style={{ background: YUZ_RENKLERI[y.gorunum % YUZ_RENKLERI.length] }} aria-hidden />
              <span className="yorum-govde">
                <span className="yorum-yildiz">{yildizYazisi(y.yildiz)}</span> {m(`yorum.${y.neden}` as MetinAnahtari)}
                <span className="yorum-cumle">{m('yorum.yerTutucu')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
