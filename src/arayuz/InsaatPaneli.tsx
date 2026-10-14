import { m, type MetinAnahtari } from '../metinler';
import {
  insaattanCik,
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
import { DUKKAN_PARSELLERI, parselCoz } from '../oyun/dekorasyon';
import { ortala } from '../sahne/kameraKarisimi';

// İnşaat modunun paneli (belge 0.2): seçilen karenin yeri, durumu, fiyatı ve
// "Al". Duvar örme ve mutfak sonraki adımlarda buraya eklenecek.
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
        {DUKKAN_PARSELLERI.includes(secili) ? (
          <span className="insaat-durum">{m('insaat.dukkan')}</span>
        ) : durumu === 'sahip' ? (
          <span className="insaat-durum">{m('insaat.sahip')}</span>
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
