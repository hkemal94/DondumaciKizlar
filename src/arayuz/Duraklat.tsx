import { useState } from 'react';
import { devamEt, duraklat, duraklatilabilir, gezmeyeBasla, gezmeyiBitir, useDurum } from '../oyun/durum';
import { m } from '../metinler';
import { fotograf, ortala, yakinlikDegistir } from '../sahne/kameraKarisimi';

// Duraklatma menüsü (Kemal, 13 Ekim): devam et, dükkânı gez, fotoğraf çek,
// ses ayarı. Saat, müşteriler ve sabır durur.

const SES_ANAHTARI = 'dondurmaci-kizlar-ses';

interface SesAyari {
  muzik: number;
  efekt: number;
}

function sesiOku(): SesAyari {
  try {
    const k = JSON.parse(localStorage.getItem(SES_ANAHTARI) ?? '{}') as Partial<SesAyari>;
    return { muzik: k.muzik ?? 70, efekt: k.efekt ?? 80 };
  } catch {
    return { muzik: 70, efekt: 80 };
  }
}

function sesiYaz(a: SesAyari) {
  try {
    localStorage.setItem(SES_ANAHTARI, JSON.stringify(a));
  } catch {
    // tarayıcı izin vermezse ayar yalnız bu açılışta geçerli
  }
}

export function DuraklatDugmesi() {
  const durum = useDurum();
  if (durum.duraklatildi) return null;
  return (
    <button className="dugme dugme-simge duraklat-dugme" aria-label={m('duraklat.dugme')} disabled={!duraklatilabilir(durum)} onClick={duraklat}>
      <span className="duraklat-simge" aria-hidden />
    </button>
  );
}

export function DuraklatMenusu() {
  const durum = useDurum();
  const [ses, setSes] = useState(sesiOku);
  if (!durum.duraklatildi || durum.gezme) return null;
  const degistir = (yeni: SesAyari) => {
    setSes(yeni);
    sesiYaz(yeni);
  };
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu duraklat-menu" role="dialog" aria-labelledby="duraklat-baslik">
        <h2 id="duraklat-baslik">{m('duraklat.baslik')}</h2>
        <button className="dugme dugme-yeni-gun" onClick={devamEt}>
          {m('duraklat.devam')}
        </button>
        <button className="dugme" onClick={gezmeyeBasla}>
          {m('duraklat.gez')}
        </button>
        <div className="ses-ayari">
          {(['muzik', 'efekt'] as const).map((tur) => (
            <label key={tur} className="ses-satir" htmlFor={`ses-${tur}`}>
              <span>{m(tur === 'muzik' ? 'ses.muzik' : 'ses.efekt')}</span>
              <input
                id={`ses-${tur}`}
                type="range"
                min={0}
                max={100}
                value={ses[tur]}
                onChange={(e) => degistir({ ...ses, [tur]: Number(e.target.value) })}
              />
              <span className="ses-deger">{ses[tur]}</span>
            </label>
          ))}
          <p className="gel-not">{m('ses.not')}</p>
        </div>
      </div>
    </div>
  );
}

// Gezme ekranı: yalnız geri, fotoğraf ve yakınlaştırma düğmeleri
export function GezmeEkrani() {
  const durum = useDurum();
  const [resim, setResim] = useState<string | null>(null);
  if (!durum.gezme) return null;
  const cek = () => {
    const r = fotograf.cek?.();
    if (r) setResim(r);
  };
  return (
    <>
      <button className="dugme gezme-geri" onClick={gezmeyiBitir}>
        ← {m('gezme.geri')}
      </button>
      <div className="ipucu">{m('gezme.ipucu')}</div>
      <div className="yakinlik-dugmeleri">
        <button className="dugme dugme-simge" aria-label={m('kamera.yakinlas')} onClick={() => yakinlikDegistir(0.8)}>
          +
        </button>
        <button className="dugme dugme-simge" aria-label={m('kamera.uzaklas')} onClick={() => yakinlikDegistir(1.25)}>
          −
        </button>
        <button className="dugme dugme-simge" aria-label={m('kamera.ortala')} onClick={ortala}>
          <span className="ortala-simge" aria-hidden />
        </button>
      </div>
      <div className="sag-dugmeler">
        <button className="dugme dugme-servis" onClick={cek}>
          <span className="foto-simge" aria-hidden /> {m('gezme.foto')}
        </button>
      </div>
      {resim && (
        <div className="gun-sonu-zemin">
          <div className="gun-sonu foto-kart" role="dialog" aria-label={m('gezme.foto')}>
            <img src={resim} alt={m('gezme.fotoAlt')} className="foto-resim" />
            <p className="gel-not">{m('gezme.fotoNot')}</p>
            <div className="gun-sonu-dugmeler">
              <a className="dugme" href={resim} download="dondurmaci-kizlar.jpg">
                {m('gezme.indir')}
              </a>
              <button className="dugme dugme-yeni-gun" onClick={() => setResim(null)}>
                {m('gunSonu.tamam')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
