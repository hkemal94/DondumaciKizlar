import { useEffect, useState } from 'react';
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
  MAKINE_FIYAT_ARALIGI,
  makineFiyatiSec,
  makineSatisFiyati,
  vitrinBuyut,
  cesitAc,
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
  gecerliGorunus,
  gorunusAcikMi,
  gorunusAl,
  gorunusDenemesiniBitir,
  gorunusSec,
  tabelaAcikMi,
  tabelaAl,
  tabelaSec,
  type FiyatSeviyesi,
  kilitAcik,
  icecekAc,
  istasyonKurulu,
} from '../oyun/durum';
import { ICECEKLER, ICECEK_TANIMI, icecekAcmaFiyati } from '../oyun/makine';
import { IcecekResmi } from './MakineArayuzu';
import { DIS_GRUPLAR, GORUNUS_GRUPLARI, GORUNUS_SECENEKLERI, TABELALAR, type GorunusGrubu, type GorunusSecenegi } from '../oyun/gorunus';
import { dukkanKaydirma, duvarlar, ekrandaKaydir } from '../sahne/kameraKarisimi';
import { CESITLER, FIYAT_ARALIGI, makulFiyat } from '../oyun/kuvetler';
import { EN_YUKSEK_ISIK, ESYALAR, ISIK_SEVIYELERI, type Esya } from '../oyun/dekorasyon';
import { m, ondalik, type MetinAnahtari } from '../metinler';
import { Kilit } from './Seviye';
import { logoAdresi } from '../sahne/logo';

// Dükkânı geliştir (belge 2.4 ve 4; taslak 3): yeni çeşitler, fiyat,
// dekorasyon. Gün sonu ekranından açılır. Sayılar geçici (belge 7.4).

type Sekme = 'cesitler' | 'fiyat' | 'dekorasyon' | 'gorunus';

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
      {/* Waffle ve içecek (belge 0.5, 0.6): makine / stand alındıysa */}
      {(['waffle', 'icecek'] as const)
        .filter((u) => durum.sahipParcalar.includes(u))
        .map((u) => (
          <div key={u} className="fiyat-satir">
            <span className="gel-ad">{m(`urun.${u}` as MetinAnahtari)}</span>
            <input
              type="range"
              className="fiyat-cubugu"
              min={MAKINE_FIYAT_ARALIGI[u][0]}
              max={MAKINE_FIYAT_ARALIGI[u][1]}
              value={durum.makineFiyatlari[u]}
              aria-label={m(`urun.${u}` as MetinAnahtari)}
              onChange={(e) => makineFiyatiSec(u, Number(e.target.value))}
              onPointerUp={fiyatlariKaydet}
              onKeyUp={fiyatlariKaydet}
            />
            <span className="fiyat-deger">
              <span className="para-simge" aria-hidden /> {makineSatisFiyati(u, durum)}
            </span>
          </div>
        ))}
      <p className="gel-not">{m('fiyat.not')}</p>
    </div>
  );
}

// Seçeneğin küçük örneği: düz renk, iki renkli şerit ya da zemin deseni
function GorunusOrnegi({ s }: { s: Pick<GorunusSecenegi, 'renk' | 'ikinciRenk' | 'desen'> }) {
  const b = s.ikinciRenk;
  const arka = !b
    ? s.renk
    : s.desen === 'dama'
      ? `repeating-conic-gradient(${s.renk} 0 25%, ${b} 0 50%) 0 0 / 14px 14px`
      : s.desen === 'tahta'
        ? `repeating-linear-gradient(0deg, ${s.renk} 0 6px, ${b} 6px 12px)`
        : s.desen
          ? `radial-gradient(${b} 18%, transparent 22%) 0 0 / 8px 8px, ${s.renk}`
          : `repeating-linear-gradient(90deg, ${s.renk} 0 8px, ${b} 8px 16px)`;
  return <span className="gorunus-ornek" style={{ background: arka }} aria-hidden />;
}

// Görünüş (C paketi, belge 0.11): dokununca dükkân hemen öyle görünür (deneme);
// beğenilirse "Al". Panel küçülür, dükkân arkada görünür ve döndürülebilir.
function GorunusEkrani() {
  const [grup, setGrup] = useState<GorunusGrubu | 'tabela'>('disBoya');
  // Panel sağda: dükkân soldaki boşlukta ortalansın; çıkınca kamera eski yerine
  useEffect(() => {
    const eski = { ...dukkanKaydirma };
    const eskiMod = duvarlar.mod;
    ekrandaKaydir(-Math.min(340, innerWidth * 0.46) / 2, 0, innerHeight);
    return () => {
      Object.assign(dukkanKaydirma, eski);
      duvarlar.mod = eskiMod;
    };
  }, []);
  // Dış seçeneklerde duvarlar kapanır (dışarıdan bakılır), içtekilerde yarım
  useEffect(() => {
    duvarlar.mod = grup === 'tabela' || DIS_GRUPLAR.includes(grup) ? 'kapali' : 'kesit';
  }, [grup]);
  return (
    <div className="gorunus">
      <div className="gorunus-gruplar" role="tablist">
        {[...GORUNUS_GRUPLARI, 'tabela' as const].map((g) => (
          <button key={g} role="tab" aria-selected={grup === g} className={`cip ${grup === g ? 'secili' : ''}`} onClick={() => setGrup(g)}>
            {m(`gorunus.${g}` as MetinAnahtari)}
          </button>
        ))}
      </div>
      {grup === 'tabela' ? <TabelaSecimi /> : <GrupSecimi grup={grup} />}
    </div>
  );
}

// Tek seçimli gruplar: boya, çerçeve, tente, zemin, çatı
function GrupSecimi({ grup }: { grup: GorunusGrubu }) {
  const durum = useDurum();
  const secili = gecerliGorunus(durum)[grup];
  const s = GORUNUS_SECENEKLERI[grup].find((x) => x.id === secili)!;
  const denemede = !gorunusAcikMi(grup, secili, durum);
  return (
    <>
      <div className="gorunus-secenekler">
        {GORUNUS_SECENEKLERI[grup].map((x) => {
          const acik = gorunusAcikMi(grup, x.id, durum);
          return (
            <button
              key={x.id}
              className={`gorunus-kart ${secili === x.id ? 'secili' : ''} ${acik ? '' : 'kilitli'}`}
              onClick={() => gorunusSec(grup, x.id)}
            >
              <GorunusOrnegi s={x} />
              <span className="gorunus-ad">{m(`gorunus.${grup}.${x.id}` as MetinAnahtari)}</span>
              {!acik && (kilitAcik(`gorunus.${grup}.${x.id}`, durum) ? <Para miktar={x.fiyat} /> : <Kilit anahtar={`gorunus.${grup}.${x.id}`} kisa />)}
            </button>
          );
        })}
      </div>
      <div className="gorunus-alt">
        {denemede ? (
          <>
            <span className="gel-aciklama">{m('gorunus.deneniyor')}</span>
            {kilitAcik(`gorunus.${grup}.${secili}`, durum) ? (
              <button className="dugme gel-al" disabled={durum.para < s.fiyat} onClick={() => gorunusAl(grup, secili)}>
                {m('gelistir.al')} <Para miktar={s.fiyat} />
              </button>
            ) : (
              <Kilit anahtar={`gorunus.${grup}.${secili}`} />
            )}
          </>
        ) : (
          <span className="gel-aciklama">{m('gorunus.not')}</span>
        )}
      </div>
    </>
  );
}

// Tabelalar (C3): birden çok takılır; alınana dokununca takılır / çıkar
function TabelaSecimi() {
  const durum = useDurum();
  const deneme = durum.tabelaDenemesi;
  const denenen = TABELALAR.find((t) => t.id === deneme);
  return (
    <>
      <div className="gorunus-secenekler">
        {TABELALAR.map((t) => {
          const acik = tabelaAcikMi(t.id, durum);
          const takili = durum.tabelalar.includes(t.id);
          return (
            <button
              key={t.id}
              className={`gorunus-kart ${takili || deneme === t.id ? 'secili' : ''} ${acik ? '' : 'kilitli'}`}
              aria-pressed={takili}
              onClick={() => tabelaSec(t.id)}
            >
              <GorunusOrnegi s={t} />
              <span className="gorunus-ad">{m(`tabela.${t.id}` as MetinAnahtari)}</span>
              {acik ? (
                <span className="gel-aciklama">{m(takili ? 'tabela.takili' : 'tabela.takiliDegil')}</span>
              ) : kilitAcik(`tabela.${t.id}`, durum) ? (
                <Para miktar={t.fiyat} />
              ) : (
                <Kilit anahtar={`tabela.${t.id}`} kisa />
              )}
            </button>
          );
        })}
      </div>
      <div className="gorunus-alt">
        {denenen ? (
          <>
            <span className="gel-aciklama">{m('gorunus.deneniyor')}</span>
            {kilitAcik(`tabela.${denenen.id}`, durum) ? (
              <button className="dugme gel-al" disabled={durum.para < denenen.fiyat} onClick={() => tabelaAl(denenen.id)}>
                {m('gelistir.al')} <Para miktar={denenen.fiyat} />
              </button>
            ) : (
              <Kilit anahtar={`tabela.${denenen.id}`} />
            )}
          </>
        ) : (
          <span className="gel-aciklama">{m('tabela.not')}</span>
        )}
      </div>
    </>
  );
}

export type GelistirSekmesi = 'cesitler' | 'fiyat' | 'dekorasyon' | 'gorunus';

export function Gelistir({ kapat, ilkSekme = 'dekorasyon' }: { kapat: () => void; ilkSekme?: GelistirSekmesi }) {
  const durum = useDurum();
  const [sekme, setSekme] = useState<Sekme>(ilkSekme);
  const [alinan, setAlinan] = useState<Esya | null>(null);
  // Mağaza kapanınca ya da sekme değişince denenen ama alınmayanlar geri döner
  useEffect(() => {
    if (sekme !== 'gorunus') gorunusDenemesiniBitir();
  }, [sekme]);
  useEffect(() => gorunusDenemesiniBitir, []);

  return (
    <div className={`gun-sonu-zemin ${sekme === 'gorunus' ? 'gelistir-gorunus' : 'sag-zemin'}`}>
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
          <Para miktar={durum.para} />
          <button className="dugme gel-tamam" onClick={kapat}>
            {m('gelistir.kapat')}
          </button>
        </div>

        <div className="gel-sekmeler" role="tablist">
          {(['cesitler', 'fiyat', 'dekorasyon', 'gorunus'] as const).map((s) => (
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
                {sonrakiVitrin(durum) && !kilitAcik(`vitrin.${sonrakiVitrin(durum)!.boy}`, durum) ? (
                  <Kilit anahtar={`vitrin.${sonrakiVitrin(durum)!.boy}`} />
                ) : sonrakiVitrin(durum) ? (
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
                    ) : !kilitAcik(`cesit.${c.ad}`, durum) ? (
                      <Kilit anahtar={`cesit.${c.ad}`} />
                    ) : !alinabilir ? (
                      // Memnuniyet eşiğine ulaşılmadı: düğme yerine şart
                      <span className="gel-durum gel-kilit">{m('cesit.yildizGerek', { yildiz: ondalik(c.yildiz ?? 0) })}</span>
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
              {/* İçecekler (9d, belge 0.13): stand kuruluysa; dükkân seviyesi + para */}
              {istasyonKurulu('icecek', durum) && (
                <>
                  <div className="gel-baslik" style={{ gridColumn: '1 / -1' }}>
                    {m('stok.tur.icecek')}
                  </div>
                  {ICECEKLER.map((i) => {
                    const acik = durum.acikIcecekler.includes(i);
                    return (
                      <div key={i} className={`gel-kart ${acik ? 'acik' : ''}`}>
                        <svg viewBox="-12 -18 24 34" aria-hidden className="icecek-simge">
                          <IcecekResmi i={i} />
                        </svg>
                        <span className="gel-ad">
                          {m(`icecek.${i}` as MetinAnahtari)}
                          {ICECEK_TANIMI[i].hazirlik && (
                            <span className="gel-aciklama" title={m('icecek.hazirlanir')}>
                              {' '}
                              ⏱
                            </span>
                          )}
                        </span>
                        {acik ? (
                          <span className="gel-durum">{m('gelistir.alindi')}</span>
                        ) : !kilitAcik(`icecek.${i}`, durum) ? (
                          <Kilit anahtar={`icecek.${i}`} />
                        ) : (
                          <button className="dugme gel-al" disabled={durum.para < icecekAcmaFiyati(i)} onClick={() => icecekAc(i)}>
                            {m('gelistir.al')} <Para miktar={icecekAcmaFiyati(i)} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
              <p className="gel-not" style={{ gridColumn: '1 / -1' }}>
                {m('cesit.yildizNot', { ortalama: durum.enIyiOrtalama > 0 ? ondalik(durum.enIyiOrtalama, 2) : '–' })}
              </p>
            </div>
          )}

          {sekme === 'fiyat' && <FiyatEkrani />}

          {sekme === 'gorunus' && <GorunusEkrani />}

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
                {durum.isikSeviyesi < EN_YUKSEK_ISIK && !kilitAcik(`isik.${durum.isikSeviyesi + 1}`, durum) ? (
                  <Kilit anahtar={`isik.${durum.isikSeviyesi + 1}`} />
                ) : durum.isikSeviyesi < EN_YUKSEK_ISIK ? (
                  <button className="dugme gel-al" disabled={durum.para < ISIK_SEVIYELERI[durum.isikSeviyesi].fiyat} onClick={isikAl}>
                    {m(`dekor.isik.${durum.isikSeviyesi + 1}` as MetinAnahtari)} <Para miktar={ISIK_SEVIYELERI[durum.isikSeviyesi].fiyat} />
                  </button>
                ) : (
                  <span className="gel-durum">{m('dekor.enIyi')}</span>
                )}
              </div>

              {/* Taşınabilir eşyalar: alınır, depoya gider */}
              {(['oturma', 'dis', 'ic', 'mutfak'] as const).map((grup) => (
                <div key={grup}>
                  <div className="gel-baslik">{m(`dekor.${grup}`)}</div>
                  {/* Resimli kartlar (Kemal, 14 Ekim): eşyanın oyundaki modelinden küçük resim */}
                  <div className="esya-izgara">
                    {ESYALAR.filter((e) => e.grup === grup).map((e) => (
                      <button
                        key={e.id}
                        className={`esya-kart ${kilitAcik(`esya.${e.id}`, durum) ? '' : 'kilitli'}`}
                        disabled={durum.para < e.fiyat || !kilitAcik(`esya.${e.id}`, durum)}
                        onClick={() => {
                          esyaAl(e.id);
                          setAlinan(e.id);
                        }}
                      >
                        <img src={esyaResmi(e.id)} alt="" aria-hidden />
                        <span className="esya-kart-ad">{m(`esya.${e.id}` as MetinAnahtari)}</span>
                        <span className="esya-kart-alt">
                          {kilitAcik(`esya.${e.id}`, durum) ? <Para miktar={e.fiyat} /> : <Kilit anahtar={`esya.${e.id}`} kisa />}
                          {depodaki(e.id, durum) > 0 && <span className="esya-sayi">{depodaki(e.id, durum)}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="gel-not">{m('dekor.icNot')}</p>
              <p className="gel-not">{m('dekor.mutfakNot')}</p>
              <p className="gel-not">{m('dekor.etki')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
