import { useState } from 'react';
import {
  bastanBasla,
  cesitAlinabilir,
  sonrakiVitrin,
  vitrinBuyut,
  bolgeAl,
  cesitAc,
  DENEME,
  denemeParasi,
  depodaki,
  esyaAl,
  isikAl,
  FIYAT_ETKISI,
  fiyatSec,
  KUP_FIYATI,
  kupAc,
  TEPSI_FIYATI,
  tepsiAc,
  TOP_FIYATI,
  useDurum,
  type FiyatSeviyesi,
} from '../oyun/durum';
import { CESITLER } from '../oyun/kuvetler';
import { BOLGELER, EN_YUKSEK_ISIK, ESYALAR, ISIK_SEVIYELERI } from '../oyun/dekorasyon';
import { m, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';

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
          <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
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
              {/* Vitrin büyütme: 4 → 6 → 8 → 10 → 12 küvet (Kemal, 14 Ekim) */}
              <div className={`gel-kart ${sonrakiVitrin(durum) ? '' : 'acik'}`}>
                <span className="gel-ad">
                  {m('vitrin.buyut')}
                  {sonrakiVitrin(durum) && (
                    <span className="gel-aciklama">
                      {' '}
                      · {m('vitrin.buyutAciklama', { simdi: durum.vitrinBoyu, sonra: sonrakiVitrin(durum)!.boy })}
                    </span>
                  )}
                </span>
                {sonrakiVitrin(durum) ? (
                  <button className="dugme gel-al" disabled={durum.para < sonrakiVitrin(durum)!.fiyat} onClick={vitrinBuyut}>
                    {m('gelistir.al')} <Para miktar={sonrakiVitrin(durum)!.fiyat} />
                  </button>
                ) : (
                  <span className="gel-durum">{m('vitrin.enBuyuk')}</span>
                )}
              </div>
              {CESITLER.map((c, i) => {
                const acik = durum.acikCesitler.includes(i);
                const alinabilir = cesitAlinabilir(i, durum);
                return (
                  <div key={i} className={`gel-kart ${acik ? 'acik' : ''}`}>
                    <span className="gel-renk" style={{ background: c.renk }} aria-hidden />
                    <span className="gel-ad">{m(`cesit.${c.ad}` as MetinAnahtari)}</span>
                    {acik ? (
                      <span className="gel-durum">{m('gelistir.acik')}</span>
                    ) : !alinabilir ? (
                      // Memnuniyet eşiğine ulaşılmadı: düğme yerine şart
                      <span className="gel-durum gel-kilit">{m('cesit.yildizGerek', { yildiz: String(c.yildiz).replace('.', ',') })}</span>
                    ) : (
                      <button className="dugme gel-al" disabled={durum.para < c.fiyat || !alinabilir} onClick={() => cesitAc(i)}>
                        {m('gelistir.al')} <Para miktar={c.fiyat} />
                      </button>
                    )}
                  </div>
                );
              })}
              {/* Tepsi: iki dondurmalı ve iki süslemeli siparişler başlar */}
              <div className={`gel-kart ${durum.tepsiAcik ? 'acik' : ''}`}>
                <span className="gel-ad">
                  {m('tepsi.ad')}
                  <span className="gel-aciklama"> · {m('tepsi.aciklama')}</span>
                </span>
                {durum.tepsiAcik ? (
                  <span className="gel-durum">{m('gelistir.alindi')}</span>
                ) : (
                  <button className="dugme gel-al" disabled={durum.para < TEPSI_FIYATI} onClick={tepsiAc}>
                    {m('gelistir.al')} <Para miktar={TEPSI_FIYATI} />
                  </button>
                )}
              </div>
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
              <p className="gel-not" style={{ gridColumn: '1 / -1' }}>
                {m('cesit.yildizNot', { ortalama: durum.enIyiOrtalama > 0 ? durum.enIyiOrtalama.toFixed(2).replace('.', ',') : '–' })}
              </p>
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
            <div className="gel-liste">
              {/* Genel: ışıklandırma seviyeleri */}
              <div className="gel-baslik">{m('dekor.genel')}</div>
              <div className="gel-kart acik">
                <span className="gel-ad">
                  {m('dekor.isik')}
                  <span className="gel-aciklama">
                    {' '}
                    · {durum.isikSeviyesi === 0 ? m('dekor.isikYok') : m(`dekor.isik.${durum.isikSeviyesi}` as MetinAnahtari)}
                  </span>
                </span>
                {durum.isikSeviyesi < EN_YUKSEK_ISIK ? (
                  <button className="dugme gel-al" disabled={durum.para < ISIK_SEVIYELERI[durum.isikSeviyesi].fiyat} onClick={isikAl}>
                    {m(`dekor.isik.${durum.isikSeviyesi + 1}` as MetinAnahtari)} <Para miktar={ISIK_SEVIYELERI[durum.isikSeviyesi].fiyat} />
                  </button>
                ) : (
                  <span className="gel-durum">{m('dekor.enIyi')}</span>
                )}
              </div>

              {/* Alanlar: dükkânın yanları ve yol kenarı (14 Ekim) */}
              <div className="gel-baslik">{m('dekor.alanlar')}</div>
              <div className="gel-izgara">
                {BOLGELER.map((b) => {
                  const alindi = durum.acikBolgeler.includes(b.id);
                  return (
                    <div key={b.id} className={`gel-kart ${alindi ? 'acik' : ''}`}>
                      <span className="gel-ad">{m(`bolge.${b.id}` as MetinAnahtari)}</span>
                      {alindi ? (
                        <span className="gel-durum">{m('bolge.alindi')}</span>
                      ) : (
                        <button className="dugme gel-al" disabled={durum.para < b.fiyat} onClick={() => bolgeAl(b.id)}>
                          {m('gelistir.al')} <Para miktar={b.fiyat} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="gel-not">{m('dekor.alanNot')}</p>

              {/* Taşınabilir eşyalar: alınır, depoya gider */}
              {(['oturma', 'dis'] as const).map((grup) => (
                <div key={grup}>
                  <div className="gel-baslik">{m(`dekor.${grup}`)}</div>
                  <div className="gel-izgara">
                    {ESYALAR.filter((e) => e.grup === grup).map((e) => (
                      <div key={e.id} className="gel-kart">
                        <span className="gel-ad">
                          {m(`esya.${e.id}` as MetinAnahtari)}
                          <span className="gel-aciklama"> · {m('dekor.depoda', { sayi: depodaki(e.id, durum) })}</span>
                        </span>
                        <button className="dugme gel-al" disabled={durum.para < e.fiyat} onClick={() => esyaAl(e.id)}>
                          {m('gelistir.al')} <Para miktar={e.fiyat} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="gel-not">{m('dekor.etki')}</p>
            </div>
          )}
        </div>

        <div className="gel-alt">
          {DENEME && (
            <button className="dugme gel-kucuk" onClick={denemeParasi}>
              {m('deneme.para')}
            </button>
          )}
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
