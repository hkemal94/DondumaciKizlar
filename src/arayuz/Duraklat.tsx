import { useState } from 'react';
import { devamEt, duraklat, duraklatilabilir, gezmeyeBasla, gezmeyiBitir, kayitYuvasi, useDurum } from '../oyun/durum';
import { fotoEkle } from '../oyun/galeri';
import { Galeri } from './Galeri';
import { m, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';
import { gezmeIsigi, gezmeIsiginiDegistir } from '../sahne/gokRenkleri';
import { duvarlar, duvarModunuDegistir, fotograf, ortala, yakinlikDegistir } from '../sahne/kameraKarisimi';

// Duraklatma menüsü (Kemal, 13 Ekim): devam et, dükkânı gez (fotoğraf),
// Ayarlar (14 Ekim'den beri ses ve ekran ayarı orada). Saat, müşteriler ve sabır durur.

export function DuraklatDugmesi() {
  const durum = useDurum();
  if (durum.duraklatildi) return null;
  return (
    <button className="dugme dugme-simge duraklat-dugme" aria-label={m('duraklat.dugme')} disabled={!duraklatilabilir(durum)} onClick={duraklat}>
      <span className="duraklat-simge" aria-hidden />
    </button>
  );
}

export function DuraklatMenusu({ ayarlar }: { ayarlar: () => void }) {
  const durum = useDurum();
  const [galeri, setGaleri] = useState(false);
  if (!durum.duraklatildi || durum.gezme) return null;
  if (galeri) return <Galeri kapat={() => setGaleri(false)} />;
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu duraklat-menu" role="dialog" aria-labelledby="duraklat-baslik">
        <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
        <h2 id="duraklat-baslik">{m('duraklat.baslik')}</h2>
        <button className="dugme dugme-yeni-gun" onClick={devamEt}>
          {m('duraklat.devam')}
        </button>
        <button className="dugme" onClick={gezmeyeBasla}>
          {m('duraklat.gez')}
        </button>
        <button className="dugme" onClick={() => setGaleri(true)}>
          {m('duraklat.galeri')}
        </button>
        <button className="dugme" onClick={ayarlar}>
          {m('acilis.ayarlar')}
        </button>
      </div>
    </div>
  );
}

// Gezme ekranı: yalnız geri, fotoğraf ve yakınlaştırma düğmeleri
export function GezmeEkrani() {
  const durum = useDurum();
  const [resim, setResim] = useState<string | null>(null);
  const [duvarModu, setDuvarModu] = useState(duvarlar.mod);
  const [isik, setIsik] = useState(gezmeIsigi.mod);
  if (!durum.gezme) return null;
  const duvarDegistir = () => setDuvarModu(duvarModunuDegistir());
  const cek = () => {
    const r = fotograf.cek?.();
    if (!r) return;
    setResim(r);
    // Galeriye girer (belge 0.12)
    void fotoEkle(kayitYuvasi(), 'gezme', durum.gun, r);
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
        <button className="dugme" onClick={() => setIsik(gezmeIsiginiDegistir())}>
          {m(`gezme.isik.${isik}` as MetinAnahtari)}
        </button>
        <button className="dugme" onClick={duvarDegistir}>
          {m('gezme.duvarlar')}: {m(`gezme.duvar.${duvarModu}` as MetinAnahtari)}
        </button>
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
