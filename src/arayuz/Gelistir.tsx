import { useState } from 'react';
import {
  esyaSec,
  yerlestirmeyiAc,
  butunFiyatlariSec,
  cesitFiyati,
  cesitFiyatiSec,
  fiyatlariKaydet,
  istekDurumu,
  makulFiyatlaraDon,
  satisFiyati,
  cesitAlinabilir,
  sonrakiVitrin,
  vitrinBuyut,
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
  useDurum,
  type FiyatSeviyesi,
} from '../oyun/durum';
import { CESITLER, FIYAT_ARALIGI, makulFiyat } from '../oyun/kuvetler';
import { EN_YUKSEK_ISIK, ESYALAR, ISIK_SEVIYELERI, type Esya } from '../oyun/dekorasyon';
import { m, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';

// Dükkânı geliştir (belge 2.4 ve 4; taslak 3): yeni çeşitler, fiyat,
// dekorasyon. Gün sonu ekranından açılır. Sayılar geçici (belge 7.4).

type Sekme = 'cesitler' | 'fiyat' | 'dekorasyon';

// Mağaza resmi: public/gorseller/esyalar/ (oyundaki modelden çekildi; Onizleme.tsx)
function esyaResmi(e: Esya) {
  return `${import.meta.env.BASE_URL}gorseller/esyalar/${e}.webp`;
}

function Para({ miktar }: { miktar: number }) {
  return (
    <span className="gel-para">
      <span className="para-simge" aria-hidden /> {miktar}
    </span>
  );
}

// Fiyat (Kemal, 14 Ekim): genel seviye kalır; her çeşidin kendi fiyat çubuğu
// ve hepsini birden ayarlayan çubuk. Pahalı çeşit daha seyrek istenir.
function FiyatEkrani() {
  const durum = useDurum();
  const fiyatlar = durum.acikCesitler.map((c) => cesitFiyati(c, durum));
  const hepsiAyni = fiyatlar.every((f) => f === fiyatlar[0]);
  const ortalama = Math.round(fiyatlar.reduce((a, b) => a + b, 0) / Math.max(1, fiyatlar.length));
  const cubuk = (deger: number, degistir: (f: number) => void, etiket: string) => (
    <input
      type="range"
      className="fiyat-cubugu"
      min={FIYAT_ARALIGI[0]}
      max={FIYAT_ARALIGI[1]}
      value={deger}
      aria-label={etiket}
      onChange={(e) => degistir(Number(e.target.value))}
      onPointerUp={fiyatlariKaydet}
      onKeyUp={fiyatlariKaydet}
    />
  );
  return (
    <div className="gel-liste">
      <div className="gel-baslik">{m('fiyat.genel')}</div>
      <div className="fiyat-seviyeleri">
        {(Object.keys(FIYAT_ETKISI) as FiyatSeviyesi[]).map((f) => (
          <button key={f} className={`gel-secenek ${durum.fiyatSeviyesi === f ? 'secili' : ''}`} onClick={() => fiyatSec(f)}>
            <span className="gel-ad">{m(`fiyat.${f}` as MetinAnahtari)}</span>
            <span className="gel-aciklama">{m(`fiyat.${f}.etki` as MetinAnahtari)}</span>
          </button>
        ))}
      </div>

      <div className="gel-baslik">{m('fiyat.cesitler')}</div>
      {/* Toplu çubuk: hepsine aynı fiyat */}
      <div className="fiyat-satir fiyat-hepsi">
        <span className="gel-ad">{m('fiyat.hepsi')}</span>
        {cubuk(ortalama, butunFiyatlariSec, m('fiyat.hepsi'))}
        <span className="fiyat-deger">{hepsiAyni ? ortalama : m('fiyat.karisik')}</span>
        <button className="gel-bag" onClick={makulFiyatlaraDon}>
          {m('fiyat.makul')}
        </button>
      </div>
      {durum.acikCesitler.map((c) => {
        const istek = istekDurumu(c, durum);
        return (
          <div key={c} className="fiyat-satir">
            <span className="gel-renk" style={{ background: CESITLER[c].renk }} aria-hidden />
            <span className="gel-ad">{m(`cesit.${CESITLER[c].ad}` as MetinAnahtari)}</span>
            {cubuk(cesitFiyati(c, durum), (f) => cesitFiyatiSec(c, f), m(`cesit.${CESITLER[c].ad}` as MetinAnahtari))}
            <span className="fiyat-deger">
              <span className="para-simge" aria-hidden /> {satisFiyati(c, durum)}
            </span>
            <span className={`fiyat-istek ${istek}`} title={m('fiyat.makulDeger', { fiyat: makulFiyat(c) })}>
              {m(`fiyat.istek.${istek}` as MetinAnahtari)}
            </span>
          </div>
        );
      })}
      <p className="gel-not">{m('fiyat.not')}</p>
    </div>
  );
}

export function Gelistir({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const [sekme, setSekme] = useState<Sekme>('cesitler');
  const [alinan, setAlinan] = useState<Esya | null>(null);

  return (
    <div className="gun-sonu-zemin">
      {/* Eşya alınınca: hemen yerleştir ya da alışverişe devam et (Kemal, 14 Ekim) */}
      {alinan && (
        <div className="alindi-zemin">
          <div className="alindi" role="dialog" aria-labelledby="alindi-baslik">
            <img src={esyaResmi(alinan)} alt="" aria-hidden />
            <h3 id="alindi-baslik">{m('alindi.baslik', { ad: m(`esya.${alinan}` as MetinAnahtari) })}</h3>
            <p>{m('alindi.depoda', { sayi: depodaki(alinan, durum) })}</p>
            <div className="alindi-dugmeler">
              <button className="dugme" onClick={() => setAlinan(null)}>
                {m('alindi.devam')}
              </button>
              <button
                className="dugme dugme-servis"
                onClick={() => {
                  const e = alinan;
                  setAlinan(null);
                  kapat();
                  yerlestirmeyiAc();
                  esyaSec(e);
                }}
              >
                {m('alindi.yerlestir')}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="gelistir" role="dialog" aria-labelledby="gelistir-baslik">
        <div className="gel-ust">
          <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
          <h2 id="gelistir-baslik">{m('gelistir.baslik')}</h2>
          <span className="gel-bosluk" />
          {DENEME && (
            <button className="dugme gel-kucuk" onClick={denemeParasi}>
              {m('deneme.para')}
            </button>
          )}
          <Para miktar={durum.para} />
          <button className="dugme gel-tamam" onClick={kapat}>
            {m('gelistir.kapat')}
          </button>
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

          {sekme === 'fiyat' && <FiyatEkrani />}

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

              {/* Taşınabilir eşyalar: alınır, depoya gider */}
              {(['oturma', 'dis'] as const).map((grup) => (
                <div key={grup}>
                  <div className="gel-baslik">{m(`dekor.${grup}`)}</div>
                  {/* Resimli kartlar (Kemal, 14 Ekim): eşyanın oyundaki modelinden küçük resim */}
                  <div className="esya-izgara">
                    {ESYALAR.filter((e) => e.grup === grup).map((e) => (
                      <button
                        key={e.id}
                        className="esya-kart"
                        disabled={durum.para < e.fiyat}
                        onClick={() => {
                          esyaAl(e.id);
                          setAlinan(e.id);
                        }}
                      >
                        <img src={esyaResmi(e.id)} alt="" aria-hidden />
                        <span className="esya-kart-ad">{m(`esya.${e.id}` as MetinAnahtari)}</span>
                        <span className="esya-kart-alt">
                          <Para miktar={e.fiyat} />
                          {depodaki(e.id, durum) > 0 && <span className="esya-sayi">{depodaki(e.id, durum)}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="gel-not">{m('dekor.etki')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
