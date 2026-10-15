import { useState } from 'react';
import { urunAl, urunAlinabilir, useDurum, yuvayaKoy } from '../oyun/durum';
import { TEZGAH_URUNLERI, yuvaSayisi } from '../oyun/tezgahUrunleri';
import { m, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';

// Arka tezgah (belge 0.14; Kemal, 15 Ekim gece: "tezgahın içindeki ürünler de
// değiştirilebilir olmalı"): üstte yuvalar, altta ürünler. Yuvaya dokun, sonra
// ürüne: o yuvaya konur. Alınmamış ürün önce alınır; bir kez alınan her yuvaya konur.

function urunResmi(id: string) {
  return `${import.meta.env.BASE_URL}gorseller/urunler/${id}.webp`;
}

export function ArkaTezgahEkrani({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const n = yuvaSayisi(durum.tezgah.boy);
  const [secili, setSecili] = useState(0);
  const ad = (id: string) => m(`urun.${id}` as MetinAnahtari);
  return (
    <div className="gun-sonu-zemin sag-zemin">
      <div className="gun-sonu arka-tezgah-ekrani" role="dialog" aria-labelledby="arka-baslik">
        <div className="yetenek-ust">
          <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
          <h2 id="arka-baslik">{m('arkaTezgah.baslik')}</h2>
          <button className="dugme dugme-yeni-gun" onClick={kapat}>
            {m('arkaTezgah.kapat')}
          </button>
        </div>
        <p className="gel-not">{m('arkaTezgah.not')}</p>
        {/* Yuvalar: soldan sağa, dükkândan bakınca */}
        <div className="arka-yuvalar" role="listbox" aria-label={m('arkaTezgah.yuvalar')}>
          {Array.from({ length: n }, (_, i) => {
            const id = durum.arkaTezgah[i] ?? '';
            return (
              <button key={i} role="option" aria-selected={secili === i} className={`arka-yuva ${secili === i ? 'secili' : ''}`} onClick={() => setSecili(i)}>
                <b>{i + 1}</b>
                {id ? <img src={urunResmi(id)} alt={ad(id)} /> : <span className="arka-bos">{m('arkaTezgah.bos')}</span>}
              </button>
            );
          })}
        </div>
        <div className="arka-urunler">
          <button className="esya-kart" onClick={() => yuvayaKoy(secili, '')}>
            <span className="arka-bos-buyuk">×</span>
            <span className="esya-kart-ad">{m('arkaTezgah.bosalt')}</span>
          </button>
          {TEZGAH_URUNLERI.map((u) => {
            const acik = durum.acikUrunler.includes(u.id);
            return (
              <button
                key={u.id}
                className={`esya-kart ${durum.arkaTezgah[secili] === u.id ? 'secili' : ''}`}
                disabled={!acik && !urunAlinabilir(u.id, durum)}
                onClick={() => {
                  if (!acik) urunAl(u.id);
                  yuvayaKoy(secili, u.id);
                }}
              >
                <img src={urunResmi(u.id)} alt="" aria-hidden />
                <span className="esya-kart-ad">
                  {ad(u.id)}
                  {u.kod && <small> · {u.kod}</small>}
                </span>
                <span className="esya-kart-alt">
                  {!acik && (
                    <span className="gel-para">
                      <span className="para-simge" aria-hidden /> {u.fiyat}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
