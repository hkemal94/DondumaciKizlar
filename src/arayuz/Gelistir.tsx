import { useState } from 'react';
import {
  bastanBasla,
  cesitAc,
  DEKORLAR,
  dekorAl,
  FIYAT_ETKISI,
  fiyatSec,
  KUP_FIYATI,
  kupAc,
  TOP_FIYATI,
  useDurum,
  type FiyatSeviyesi,
} from '../oyun/durum';
import { CESITLER } from '../oyun/kuvetler';
import { m, type MetinAnahtari } from '../metinler';

// Dükkânı geliştir (belge 2.4 ve 4; taslak 3): yeni çeşitler, fiyat,
// dekorasyon. Gün sonu ekranından açılır. Sayılar geçici (belge 7.4).

type Sekme = 'cesitler' | 'fiyat' | 'dekorasyon';

function Para({ miktar }: { miktar: number }) {
  return (
    <span className="gel-para">
      <span className="para-simge" aria-hidden /> {miktar}
    </span>
  );
}

export function Gelistir({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const [sekme, setSekme] = useState<Sekme>('cesitler');
  const [silmeOnayi, setSilmeOnayi] = useState(false);

  return (
    <div className="gun-sonu-zemin">
      <div className="gelistir" role="dialog" aria-labelledby="gelistir-baslik">
        <div className="gel-ust">
          <h2 id="gelistir-baslik">{m('gelistir.baslik')}</h2>
          <Para miktar={durum.para} />
        </div>

        <div className="gel-sekmeler" role="tablist">
          {(['cesitler', 'fiyat', 'dekorasyon'] as const).map((s) => (
            <button key={s} role="tab" aria-selected={sekme === s} className={sekme === s ? 'secili' : ''} onClick={() => setSekme(s)}>
              {m(`gelistir.${s}` as MetinAnahtari)}
            </button>
          ))}
        </div>

        <div className="gel-icerik">
          {sekme === 'cesitler' && (
            <div className="gel-izgara">
              {CESITLER.map((c, i) => {
                const acik = durum.acikCesitler.includes(i);
                return (
                  <div key={i} className={`gel-kart ${acik ? 'acik' : ''}`}>
                    <span className="gel-renk" style={{ background: c.renk }} aria-hidden />
                    <span className="gel-ad">{m(`cesit.${c.ad}` as MetinAnahtari)}</span>
                    {acik ? (
                      <span className="gel-durum">{m('gelistir.acik')}</span>
                    ) : (
                      <button className="dugme gel-al" disabled={durum.para < c.fiyat} onClick={() => cesitAc(i)}>
                        {m('gelistir.al')} <Para miktar={c.fiyat} />
                      </button>
                    )}
                  </div>
                );
              })}
              {/* Kup: üçüncü altlık */}
              <div className={`gel-kart ${durum.acikAltliklar.includes('kup') ? 'acik' : ''}`}>
                <span className="gel-renk gel-kup" aria-hidden />
                <span className="gel-ad">{m('altlik.kup')}</span>
                {durum.acikAltliklar.includes('kup') ? (
                  <span className="gel-durum">{m('gelistir.alindi')}</span>
                ) : (
                  <button className="dugme gel-al" disabled={durum.para < KUP_FIYATI} onClick={kupAc}>
                    {m('gelistir.al')} <Para miktar={KUP_FIYATI} />
                  </button>
                )}
              </div>
            </div>
          )}

          {sekme === 'fiyat' && (
            <div className="gel-liste">
              {(Object.keys(FIYAT_ETKISI) as FiyatSeviyesi[]).map((f) => (
                <button key={f} className={`gel-secenek ${durum.fiyatSeviyesi === f ? 'secili' : ''}`} onClick={() => fiyatSec(f)}>
                  <span className="gel-ad">{m(`fiyat.${f}` as MetinAnahtari)}</span>
                  <span className="gel-aciklama">
                    {m('fiyat.top', { fiyat: Math.round(TOP_FIYATI * FIYAT_ETKISI[f].fiyat) })} ·{' '}
                    {m(`fiyat.${f}.etki` as MetinAnahtari)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {sekme === 'dekorasyon' && (
            <div className="gel-izgara">
              {DEKORLAR.map((d) => {
                const alindi = durum.dekorlar.includes(d.id);
                return (
                  <div key={d.id} className={`gel-kart ${alindi ? 'acik' : ''}`}>
                    <span className="gel-ad">{m(`dekor.${d.id}` as MetinAnahtari)}</span>
                    {alindi ? (
                      <span className="gel-durum">{m('gelistir.alindi')}</span>
                    ) : (
                      <button className="dugme gel-al" disabled={durum.para < d.fiyat} onClick={() => dekorAl(d.id)}>
                        {m('gelistir.al')} <Para miktar={d.fiyat} />
                      </button>
                    )}
                  </div>
                );
              })}
              <p className="gel-not">{m('dekor.etki')}</p>
            </div>
          )}
        </div>

        <div className="gel-alt">
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
          <button className="dugme dugme-yeni-gun" onClick={kapat}>
            {m('gelistir.kapat')}
          </button>
        </div>
      </div>
    </div>
  );
}
