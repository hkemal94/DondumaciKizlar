import { useEffect, useMemo, useState } from 'react';
import { kayitYuvasi } from '../oyun/durum';
import { fotolar, fotoSil, galeriDegisince, type Foto, type FotoTuru } from '../oyun/galeri';
import { m, yerel } from '../metinler';

// Galeri (belge 0.12, 5. adım): iki sekme. "Fotoğraflarım" dükkânı gezerken
// çekilenler, "Albüm" ayda bir kendiliğinden çekilen dükkân fotoğrafları.
// Fotoğrafa dokununca büyür; oradan indirilir ya da silinir.
export function Galeri({ kapat }: { kapat: () => void }) {
  const [sekme, setSekme] = useState<FotoTuru>('gezme');
  const [liste, setListe] = useState<Foto[] | null>(null);
  const [secili, setSecili] = useState<Foto | null>(null);
  const [siliyor, setSiliyor] = useState(false);

  useEffect(() => {
    const yukle = () => void fotolar(kayitYuvasi()).then(setListe);
    yukle();
    return galeriDegisince(yukle);
  }, []);

  // Resimlerin ekrandaki adresleri; liste değişince eskileri bırakılır
  const adresler = useMemo(() => new Map((liste ?? []).map((f) => [f.id, URL.createObjectURL(f.resim)])), [liste]);
  useEffect(() => () => adresler.forEach((a) => URL.revokeObjectURL(a)), [adresler]);

  const gosterilen = (liste ?? []).filter((f) => f.tur === sekme);

  if (secili) {
    const adres = adresler.get(secili.id);
    return (
      <div className="gun-sonu-zemin">
        <div className="gun-sonu foto-kart" role="dialog" aria-label={m('galeri.baslik')}>
          {adres && <img src={adres} alt={m('gezme.fotoAlt')} className="foto-resim" />}
          <p className="gel-not">
            {m('galeri.gun', { gun: secili.gun })} · {new Date(secili.zaman).toLocaleDateString(yerel())}
          </p>
          <div className="gun-sonu-dugmeler">
            {siliyor ? (
              <button
                className="dugme dikkat"
                onClick={() => {
                  void fotoSil(secili.id);
                  setSiliyor(false);
                  setSecili(null);
                }}
              >
                {m('galeri.silEvet')}
              </button>
            ) : (
              <button className="dugme" onClick={() => setSiliyor(true)}>
                {m('galeri.sil')}
              </button>
            )}
            {adres && (
              <a className="dugme" href={adres} download={`dondurmaci-kizlar-gun-${secili.gun}.jpg`}>
                {m('gezme.indir')}
              </a>
            )}
            <button
              className="dugme dugme-yeni-gun"
              onClick={() => {
                setSiliyor(false);
                setSecili(null);
              }}
            >
              {m('galeri.geri')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu galeri" role="dialog" aria-labelledby="galeri-baslik">
        <h2 id="galeri-baslik">{m('galeri.baslik')}</h2>
        <div className="gel-sekmeler">
          {(['gezme', 'album'] as const).map((t) => (
            <button key={t} className={sekme === t ? 'secili' : ''} onClick={() => setSekme(t)}>
              {m(t === 'gezme' ? 'galeri.fotolar' : 'galeri.album')}
            </button>
          ))}
        </div>
        {liste && gosterilen.length === 0 ? (
          <p className="gel-not galeri-bos">{m(sekme === 'gezme' ? 'galeri.bos' : 'galeri.albumBos')}</p>
        ) : (
          <div className="galeri-izgara">
            {gosterilen.map((f) => (
              <button key={f.id} className="galeri-foto" onClick={() => setSecili(f)}>
                <img src={adresler.get(f.id)} alt={m('gezme.fotoAlt')} />
                <span>{m('galeri.gun', { gun: f.gun })}</span>
              </button>
            ))}
          </div>
        )}
        <button className="dugme dugme-yeni-gun" onClick={kapat}>
          {m('galeri.kapat')}
        </button>
      </div>
    </div>
  );
}
