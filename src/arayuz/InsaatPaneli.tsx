import { m, type MetinAnahtari } from '../metinler';
import {
  duvarOr,
  duvarOrulebilir,
  duvarYik,
  duvarYikilabilir,
  insaattanCik,
  parcaDegistir,
  parcaSecenekleri,
  parselAl,
  parselDurumu,
  parselFiyatiNe,
  tezgahKisaltilabilir,
  tezgahTasinabilir,
  tezgahUzatilabilir,
  tezgahUzatmaFiyati,
  tezgahiKisalt,
  tezgahiTasi,
  tezgahiUzat,
  useDurum,
} from '../oyun/durum';
import { DUVAR_FIYATI, YIKIM_FIYATI, parcaTuru, parselCoz, type Kenar } from '../oyun/dekorasyon';
import { ortala } from '../sahne/kameraKarisimi';

// İnşaat modunun paneli (belge 0.2–0.4): seçilen karenin yeri, durumu,
// fiyatı; "Al", "Duvar ör / yık"; duvar parçası; tezgah bölümü. Mutfak
// sonraki adımda buraya eklenecek.
export function InsaatPaneli() {
  const durum = useDurum();
  const secili = durum.seciliParsel;
  const bitir = () => {
    insaattanCik();
    ortala();
  };
  let icerik = null;
  if (secili === 'tezgah') {
    // Tezgah bölümü (belge 0.3): taşı, uzat, kısalt. Oklar İnşaat'ın önden
    // bakışına göre: ekranın solu +x, yukarısı dükkânın arkası.
    const yonler: [MetinAnahtari, string, number, number][] = [
      ['insaat.sola', '◀', 1, 0],
      ['insaat.arkaya', '▲', 0, 1],
      ['insaat.one', '▼', 0, -1],
      ['insaat.saga', '▶', -1, 0],
    ];
    const fiyat = tezgahUzatmaFiyati(durum);
    icerik = (
      <>
        <span className="insaat-yer">{m('insaat.tezgah', { boy: durum.tezgah.boy })}</span>
        <span className="insaat-durum">{m('insaat.tezgahNot')}</span>
        <div className="insaat-oklar">
          {yonler.map(([ad, ok, dc, dr]) => (
            <button key={ad} className="dugme dugme-simge" aria-label={m(ad)} disabled={!tezgahTasinabilir(dc, dr, durum)} onClick={() => tezgahiTasi(dc, dr)}>
              {ok}
            </button>
          ))}
        </div>
        <div className="insaat-oklar">
          <button className="dugme gel-al" disabled={!tezgahUzatilabilir(durum)} onClick={tezgahiUzat}>
            {m('insaat.uzat')}
            {fiyat > 0 && (
              <>
                {' '}
                <span className="para-simge" aria-hidden /> {fiyat}
              </>
            )}
          </button>
          <button className="dugme gel-al" disabled={!tezgahKisaltilabilir(durum)} onClick={tezgahiKisalt}>
            {m('insaat.kisalt')}
          </button>
        </div>
      </>
    );
  } else if (secili?.startsWith('duvar:')) {
    // Duvar parçası (belge 0.4): düz duvar / pencere / kapı
    const anahtar = secili.slice(6);
    const [c, r, y] = anahtar.split(',');
    const k: Kenar = { c: Number(c), r: Number(r), y: y as Kenar['y'] };
    const simdiki = parcaTuru(k, durum.duvarParcalari);
    icerik = (
      <>
        <span className="insaat-yer">
          {m('insaat.parca')} · {m(`insaat.tur.${simdiki}` as MetinAnahtari)}
        </span>
        <div className="insaat-oklar">
          {parcaSecenekleri(k, durum)
            .filter((s) => s.tur !== simdiki)
            .map((s) => (
              <button key={s.tur} className="dugme gel-al" disabled={!s.olur} onClick={() => parcaDegistir(anahtar, s.tur)}>
                {m(`insaat.tur.${s.tur}` as MetinAnahtari)}
                {s.fiyat > 0 && (
                  <>
                    {' '}
                    <span className="para-simge" aria-hidden /> {s.fiyat}
                  </>
                )}
              </button>
            ))}
        </div>
      </>
    );
  } else if (secili) {
    const { i, j } = parselCoz(secili);
    const durumu = parselDurumu(secili, durum);
    const fiyat = parselFiyatiNe(secili, durum);
    const sira: MetinAnahtari = j === -1 ? 'insaat.sira.on' : j === 0 ? 'insaat.sira.yan' : 'insaat.sira.arka';
    icerik = (
      <>
        <span className="insaat-yer">
          {m(sira)}
          {i < 0 && j !== 0 ? ` · ${m('insaat.iskeleTarafi')}` : ''}
        </span>
        {durum.kapaliParseller.includes(secili) ? (
          // Kapalı alan: duvarı yıkılıp açık alana çevrilebilir (belge 0.2, 0.4)
          <>
            <span className="insaat-durum">{m('insaat.kapali')}</span>
            {duvarYikilabilir(secili, durum) ? (
              <button className="dugme gel-al" disabled={durum.para < YIKIM_FIYATI} onClick={() => duvarYik(secili)}>
                {m('insaat.duvarYik')} <span className="para-simge" aria-hidden /> {YIKIM_FIYATI}
              </button>
            ) : (
              <span className="insaat-durum">{m('insaat.yikilamaz')}</span>
            )}
          </>
        ) : durumu === 'sahip' ? (
          // Açık alan: duvar örülüp kapalı alana katılabilir
          <>
            <span className="insaat-durum">{m('insaat.sahip')}</span>
            {duvarOrulebilir(secili, durum) ? (
              <button className="dugme gel-al" disabled={durum.para < DUVAR_FIYATI} onClick={() => duvarOr(secili)}>
                {m('insaat.duvarOr')} <span className="para-simge" aria-hidden /> {DUVAR_FIYATI}
              </button>
            ) : (
              <span className="insaat-durum">{m('insaat.orulemez')}</span>
            )}
          </>
        ) : durumu === 'alinabilir' ? (
          <button className="dugme gel-al" disabled={durum.para < fiyat} onClick={() => parselAl(secili)}>
            {m('insaat.al')} <span className="para-simge" aria-hidden /> {fiyat}
          </button>
        ) : (
          <span className="insaat-durum">{m('insaat.kilitli')}</span>
        )}
      </>
    );
  }
  return (
    <>
      {icerik && <div className="insaat-panel">{icerik}</div>}
      <button className="dugme dugme-servis" onClick={bitir}>
        {m('insaat.bitti')}
      </button>
    </>
  );
}
