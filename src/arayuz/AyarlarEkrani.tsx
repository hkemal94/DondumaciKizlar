import { useState } from 'react';
import { bastanBasla, egitimiYenidenGoster } from '../oyun/durum';
import { DILLER, dilSec, m, useDil, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';
import { sesAyariniOku, sesAyariniYaz, type SesAyari } from '../ses/ses';
import { GRAFIK_KALITELERI, ekranAyariniYaz, useEkranAyari } from './ekranAyari';

// Ayarlar (Kemal, 14 Ekim): müzik ve ses, ekran (etiketler), eğitimi yeniden
// göster, dil (Türkçe / İngilizce, 6. adım), baştan başla (onaylı). Açılış ekranından ve
// mola menüsünden açılır.
export function AyarlarEkrani({ kapat, egitimSonrasi }: { kapat: () => void; egitimSonrasi?: () => void }) {
  const [ses, setSes] = useState(sesAyariniOku);
  const ekran = useEkranAyari();
  const dil = useDil();
  const [silmeOnayi, setSilmeOnayi] = useState(false);
  const sesDegistir = (yeni: SesAyari) => {
    setSes(yeni);
    sesAyariniYaz(yeni);
  };
  return (
    <div className="gun-sonu-zemin ayarlar-zemin">
      <div className="gelistir ayarlar" role="dialog" aria-labelledby="ayarlar-baslik">
        <div className="gel-ust">
          <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
          <h2 id="ayarlar-baslik">{m('ayarlar.baslik')}</h2>
          <span />
        </div>
        <div className="gel-icerik ayarlar-icerik">
          <section>
            <div className="gel-baslik">{m('ayarlar.ses')}</div>
            {(['muzik', 'efekt'] as const).map((tur) => (
              <label key={tur} className="ses-satir" htmlFor={`ayar-ses-${tur}`}>
                <span>{m(tur === 'muzik' ? 'ses.muzik' : 'ses.efekt')}</span>
                <input
                  id={`ayar-ses-${tur}`}
                  type="range"
                  min={0}
                  max={100}
                  value={ses[tur]}
                  onChange={(e) => sesDegistir({ ...ses, [tur]: Number(e.target.value) })}
                />
                <span className="ses-deger">{ses[tur]}</span>
              </label>
            ))}
            <p className="gel-not">{m('ses.not')}</p>
          </section>
          <section>
            <div className="gel-baslik">{m('ayarlar.ekran')}</div>
            <label className="ekran-satir">
              <input type="checkbox" checked={ekran.kuvetEtiketi} onChange={(e) => ekranAyariniYaz({ kuvetEtiketi: e.target.checked })} />
              <span>{m('ekran.kuvetEtiketi')}</span>
            </label>
            <label className="ekran-satir">
              <input type="checkbox" checked={ekran.balonAdlari} onChange={(e) => ekranAyariniYaz({ balonAdlari: e.target.checked })} />
              <span>{m('ekran.balonAdlari')}</span>
            </label>
            <div className="ekran-satir">
              <span>{m('ekran.grafik')}</span>
              {GRAFIK_KALITELERI.map((g) => (
                <button key={g} className={`cip ${ekran.grafik === g ? 'secili' : ''}`} onClick={() => ekranAyariniYaz({ grafik: g })}>
                  {m(`ekran.grafik.${g}` as MetinAnahtari)}
                </button>
              ))}
            </div>
            <p className="gel-not">{m('ekran.grafikNot')}</p>
          </section>
          <section>
            <div className="gel-baslik">{m('ayarlar.oyun')}</div>
            <div className="ayarlar-satir">
              <button
                className="dugme"
                onClick={() => {
                  egitimiYenidenGoster();
                  kapat();
                  egitimSonrasi?.();
                }}
              >
                {m('egitim.yeniden')}
              </button>
            </div>
            {/* Dil (belge 0.12): dil adları her dilde kendi yazılışıyla */}
            <div className="ekran-satir">
              <span>{m('ayarlar.dil')}</span>
              {DILLER.map((d) => (
                <button key={d} className={`cip ${dil === d ? 'secili' : ''}`} onClick={() => dilSec(d)}>
                  {m(`dil.${d}` as MetinAnahtari)}
                </button>
              ))}
            </div>
            {silmeOnayi ? (
              <span className="gel-sil">
                {m('bastan.soru')}
                <button
                  className="dugme gel-kucuk tehlike"
                  onClick={() => {
                    bastanBasla();
                    kapat();
                  }}
                >
                  {m('bastan.evet')}
                </button>
                <button className="dugme gel-kucuk" onClick={() => setSilmeOnayi(false)}>
                  {m('bastan.hayir')}
                </button>
              </span>
            ) : (
              <button className="gel-bag" onClick={() => setSilmeOnayi(true)}>
                {m('bastan.dugme')}
              </button>
            )}
          </section>
        </div>
        <div className="gel-alt">
          <span />
          <button className="dugme dugme-yeni-gun" onClick={kapat}>
            {m('ayarlar.kapat')}
          </button>
        </div>
      </div>
    </div>
  );
}
