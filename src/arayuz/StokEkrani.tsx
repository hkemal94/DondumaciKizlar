import { useState } from 'react';
import { hepsiniDoldurSiparisi, siparisBedeli, stokKalemleriNe, stokSiparisVer, useDurum } from '../oyun/durum';
import { CESITLER } from '../oyun/kuvetler';
import { kapasite, miktar, paket, stokTuru, type StokTuru } from '../oyun/stok';
import { m, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';

// Stok (belge 0.13, 9c): tek tuşla "Hepsini doldur" ya da kalem kalem
// artı / eksi; düz liste. Gün sonunda ve gün başında Ürünler → Stok'tan.

export function kalemAdi(anahtar: string) {
  const [tur, id] = anahtar.split('.');
  if (tur === 'dondurma') return m(`cesit.${CESITLER[Number(id)]?.ad}` as MetinAnahtari);
  return m(`${tur}.${id}` as MetinAnahtari);
}

function Para({ miktar: n }: { miktar: number }) {
  return (
    <>
      <span className="para-simge" aria-hidden /> {n}
    </>
  );
}

// Gün sonu kartında kısa hâli: biten / azalanlar ve tek tuş
export function GunSonuStok({ ayrinti }: { ayrinti: () => void }) {
  const durum = useDurum();
  const doldur = hepsiniDoldurSiparisi(durum);
  const bedel = siparisBedeli(doldur);
  const azalanlar = stokKalemleriNe(durum).filter((a) => miktar(durum.stok, a) < kapasite(a) / 4);
  return (
    <div className="gun-stok">
      <div className="gun-yeni-baslik">{m('stok.baslik')}</div>
      <p className="gel-not">{azalanlar.length ? m('stok.azalanlar', { liste: azalanlar.map(kalemAdi).join(', ') }) : bedel > 0 ? m('stok.biraz') : m('stok.dolu')}</p>
      <div className="gun-stok-dugmeler">
        <button className="dugme gel-al" disabled={bedel === 0 || durum.para < bedel} onClick={() => stokSiparisVer(doldur)}>
          {m('stok.hepsiniDoldur')} {bedel > 0 && <Para miktar={bedel} />}
        </button>
        <button className="dugme gel-kucuk" onClick={ayrinti}>
          {m('stok.ayrinti')}
        </button>
      </div>
    </div>
  );
}

const TUR_SIRASI: StokTuru[] = ['dondurma', 'altlik', 'susleme', 'icecek'];

export function StokEkrani({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const [ek, setEk] = useState<Record<string, number>>({});
  const kalemler = stokKalemleriNe(durum);
  const doldur = hepsiniDoldurSiparisi(durum);
  const doldurBedeli = siparisBedeli(doldur);
  const ekBedeli = siparisBedeli(ek);
  const degistir = (a: string, yon: 1 | -1) => {
    const bos = kapasite(a) - miktar(durum.stok, a);
    const n = Math.max(0, Math.min(bos, (ek[a] ?? 0) + yon * paket(a)));
    setEk({ ...ek, [a]: n });
  };
  return (
    <div className="gun-sonu-zemin sag-zemin">
      <div className="gun-sonu stok-ekrani" role="dialog" aria-labelledby="stok-baslik">
        <div className="yetenek-ust">
          <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
          <h2 id="stok-baslik">{m('stok.baslik')}</h2>
          <button className="dugme dugme-yeni-gun" onClick={kapat}>
            {m('stok.kapat')}
          </button>
        </div>
        <button className="dugme dugme-servis stok-doldur" disabled={doldurBedeli === 0 || durum.para < doldurBedeli} onClick={() => stokSiparisVer(doldur) && setEk({})}>
          {doldurBedeli === 0 ? m('stok.hepsiDolu') : <>{m('stok.hepsiniDoldur')} <Para miktar={doldurBedeli} /></>}
        </button>
        <div className="stok-liste">
          {TUR_SIRASI.map((tur) => {
            const bu = kalemler.filter((a) => stokTuru(a) === tur);
            if (!bu.length) return null;
            return (
              <div key={tur} className="stok-grup">
                <div className="gel-baslik">{m(`stok.tur.${tur}` as MetinAnahtari)}</div>
                {bu.map((a) => {
                  const var_ = miktar(durum.stok, a);
                  const kap = kapasite(a);
                  const eklenecek = ek[a] ?? 0;
                  const renk = tur === 'dondurma' ? CESITLER[Number(a.split('.')[1])]?.renk : undefined;
                  return (
                    <div key={a} className={`stok-satir ${var_ === 0 ? 'bitti' : ''}`}>
                      <span className="stok-ad">
                        {renk && <span className="stok-renk" style={{ background: renk }} aria-hidden />}
                        {kalemAdi(a)}
                      </span>
                      <span className="stok-cubuk" aria-hidden>
                        <span style={{ width: `${(var_ / kap) * 100}%` }} />
                        <span className="stok-ek" style={{ left: `${(var_ / kap) * 100}%`, width: `${(eklenecek / kap) * 100}%` }} />
                      </span>
                      <span className="stok-sayi">
                        {var_}
                        {eklenecek > 0 && <b> +{eklenecek}</b>} / {kap}
                      </span>
                      <span className="stok-oklar">
                        <button className="dugme dugme-simge" aria-label={m('stok.azalt', { ad: kalemAdi(a) })} disabled={eklenecek === 0} onClick={() => degistir(a, -1)}>
                          −
                        </button>
                        <button className="dugme dugme-simge" aria-label={m('stok.arttir', { ad: kalemAdi(a) })} disabled={var_ + eklenecek >= kap} onClick={() => degistir(a, 1)}>
                          +
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="stok-alt">
          <button className="dugme gel-al" disabled={ekBedeli === 0 || durum.para < ekBedeli} onClick={() => stokSiparisVer(ek) && setEk({})}>
            {m('stok.siparisVer')} {ekBedeli > 0 && <Para miktar={ekBedeli} />}
          </button>
          <p className="gel-not">{m('stok.not')}</p>
        </div>
      </div>
    </div>
  );
}
