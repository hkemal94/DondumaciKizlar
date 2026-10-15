import { useEffect } from 'react';
import { aksesuarAl, aksesuarDegistir, calisaniDegistir, onlukAl, useDurum } from '../oyun/durum';
import { AD_EN_UZUN, AKSESUARLAR, BEDEN_SECENEKLERI, KIYAFETLER, ONLUK_ACIK, ONLUK_YOK, ONLUKLER, gecerliSac, SACLAR, SAC_RENKLERI, TENLER } from '../oyun/calisan';
import { m, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';
import { odak } from '../sahne/kameraKarisimi';
import { calisanEtiketi } from '../sahne/Calisan';

// Çalışanı kişiselleştirme (Kemal, 13 Ekim): sağda panel, kamera çalışana
// yaklaşır, seçimler anında görünür. Desenli önlükler ve aksesuarlar parayla.

function Para({ miktar }: { miktar: number }) {
  return (
    <span className="gel-para">
      <span className="para-simge" aria-hidden /> {miktar}
    </span>
  );
}

export function CalisanEkrani({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const c = durum.calisan;

  useEffect(() => {
    odak.calisan = true;
    return () => {
      odak.calisan = false;
    };
  }, []);

  return (
    <div className="calisan-panel" role="dialog" aria-labelledby="calisan-baslik">
      <div className="gel-ust">
        <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
        <h2 id="calisan-baslik">{m('calisan.baslik')}</h2>
        <Para miktar={durum.para} />
      </div>

      <div className="calisan-icerik">
        <label className="calisan-satir" htmlFor="calisan-ad">
          <span className="gel-baslik">{m('calisan.ad')}</span>
          <input
            id="calisan-ad"
            className="calisan-ad"
            type="text"
            maxLength={AD_EN_UZUN}
            value={c.ad}
            placeholder={m('calisan.adYer')}
            onChange={(e) => calisaniDegistir({ ad: e.target.value })}
          />
        </label>

        {/* Beden (belge 0.9): oyuncu seçer */}
        <div className="calisan-satir">
          <span className="gel-baslik">{m('calisan.beden')}</span>
          <div className="secenek-cipleri">
            {BEDEN_SECENEKLERI.map((b) => (
              <button key={b} className={`cip ${c.beden === b ? 'secili' : ''}`} onClick={() => calisaniDegistir({ beden: b })}>
                {m(`beden.${b}` as MetinAnahtari)}
              </button>
            ))}
          </div>
        </div>

        {/* Kıyafet ve dükkân üniforması (belge 0.12) */}
        <div className="calisan-satir">
          <span className="gel-baslik">{m('calisan.kiyafet')}</span>
          <div className="secenek-cipleri">
            {KIYAFETLER[c.beden].map((k, i) => {
              const secili = c.kiyafet ? c.kiyafet === k : i === 0;
              return (
                <button key={k} className={`cip ${secili ? 'secili' : ''}`} onClick={() => calisaniDegistir({ kiyafet: k })}>
                  {m(`kiyafet.${k}` as MetinAnahtari)}
                </button>
              );
            })}
            <button className={`cip ${c.uniforma ? 'secili' : ''}`} aria-pressed={c.uniforma} onClick={() => calisaniDegistir({ uniforma: !c.uniforma })}>
              {m('calisan.uniforma')}
            </button>
          </div>
        </div>

        <div className="calisan-satir">
          <span className="gel-baslik">{m('calisan.ten')}</span>
          <div className="renk-secimi">
            {TENLER.map((r, i) => (
              <button key={r} className={`renk-dugme ${c.ten === i ? 'secili' : ''}`} style={{ background: r }} aria-label={`${m('calisan.ten')} ${i + 1}`} onClick={() => calisaniDegistir({ ten: i })} />
            ))}
          </div>
        </div>

        <div className="calisan-satir">
          <span className="gel-baslik">{m('calisan.sac')}</span>
          <div className="secenek-cipleri">
            {SACLAR[c.beden].map(({ id: s }) => (
              <button key={s} className={`cip ${gecerliSac(c.beden, c.sac).id === s ? 'secili' : ''}`} onClick={() => calisaniDegistir({ sac: s })}>
                {m(`sac.${s}` as MetinAnahtari)}
              </button>
            ))}
          </div>
          <div className="renk-secimi">
            {SAC_RENKLERI.map((r, i) => (
              <button key={r} className={`renk-dugme ${c.sacRengi === i ? 'secili' : ''}`} style={{ background: r }} aria-label={`${m('calisan.sacRengi')} ${i + 1}`} onClick={() => calisaniDegistir({ sacRengi: i })} />
            ))}
          </div>
        </div>

        {ONLUK_ACIK && <div className="calisan-satir">
          <span className="gel-baslik">{m('calisan.onluk')}</span>
          <div className="secenek-cipleri">
            <button className={`cip ${c.onluk === ONLUK_YOK ? 'secili' : ''}`} onClick={() => calisaniDegistir({ onluk: ONLUK_YOK })}>
              {m('onluk.yok')}
            </button>
            {ONLUKLER.map((o) => {
              const acik = durum.acikOnlukler.includes(o.id);
              return acik ? (
                <button key={o.id} className={`cip ${c.onluk === o.id ? 'secili' : ''}`} onClick={() => calisaniDegistir({ onluk: o.id })}>
                  <span className="onluk-ornek" style={{ background: o.ikinciRenk ? `repeating-linear-gradient(90deg, ${o.renk} 0 5px, ${o.ikinciRenk} 5px 10px)` : o.renk }} />
                  {m(`onluk.${o.id}` as MetinAnahtari)}
                </button>
              ) : (
                <button key={o.id} className="cip kilitli" disabled={durum.para < o.fiyat} onClick={() => onlukAl(o.id)}>
                  {m(`onluk.${o.id}` as MetinAnahtari)} <Para miktar={o.fiyat} />
                </button>
              );
            })}
          </div>
        </div>}

        <div className="calisan-satir">
          <span className="gel-baslik">{m('calisan.aksesuar')}</span>
          <div className="secenek-cipleri">
            {AKSESUARLAR.map((a) => {
              const acik = durum.acikAksesuarlar.includes(a.id);
              return acik ? (
                <button key={a.id} className={`cip ${c.aksesuarlar.includes(a.id) ? 'secili' : ''}`} aria-pressed={c.aksesuarlar.includes(a.id)} onClick={() => aksesuarDegistir(a.id)}>
                  {m(`aksesuar.${a.id}` as MetinAnahtari)}
                </button>
              ) : (
                <button key={a.id} className="cip kilitli" disabled={durum.para < a.fiyat} onClick={() => aksesuarAl(a.id)}>
                  {m(`aksesuar.${a.id}` as MetinAnahtari)} <Para miktar={a.fiyat} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button className="dugme dugme-yeni-gun" onClick={kapat}>
        {m('gelistir.kapat')}
      </button>
    </div>
  );
}

// Çalışanın adı, genel görünümde başının üstünde
export function CalisanAdi() {
  const { calisan } = useDurum();
  return (
    <div
      className="calisan-etiketi"
      ref={(oge) => {
        calisanEtiketi.oge = oge;
      }}
    >
      {calisan.ad && <span>{calisan.ad}</span>}
    </div>
  );
}
