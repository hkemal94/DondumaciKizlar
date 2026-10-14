import { m, type MetinAnahtari } from '../metinler';
import { insaattanCik, parselAl, parselDurumu, parselFiyatiNe, useDurum } from '../oyun/durum';
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
  if (secili) {
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
