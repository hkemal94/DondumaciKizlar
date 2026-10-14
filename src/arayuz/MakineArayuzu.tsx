import { useEffect, useRef, useState } from 'react';
import { m, type MetinAnahtari } from '../metinler';
import {
  IYI_PAYI,
  MUKEMMEL_ALT,
  MUKEMMEL_UST,
  adaylariGetir,
  durumuOku,
  ikinciVitrinX,
  istasyonKurulu,
  istasyonSec,
  istasyonSeciminiKapat,
  istasyonlaBasla,
  limonataBuz,
  makineBas,
  makineDolumu,
  makineServisEt,
  makineServisHazir,
  makineSifirla,
  ondekiMusteri,
  pismeOrani,
  useDurum,
  vitrinOdakDegistir,
  waffleAc,
  waffleSusle,
  yardimciAl,
  yardimciAlinabilir,
  yardimciCikar,
  yardimciYeriniDegistir,
  type Musteri,
} from '../oyun/durum';
import { ILK_VITRIN_SINIRI } from '../oyun/kuvetler';
import {
  ALTIN_ALT,
  ALTIN_UST,
  EN_COK_YARDIMCI,
  ISTASYONLAR,
  WAFFLE_SUSLEMELERI,
  YARDIMCI_FIYATI,
  YEVMIYE,
  type Istasyon,
  type WaffleSusleme,
} from '../oyun/makine';
import { AD_EN_UZUN } from '../oyun/calisan';

// Waffle ve limonata (belge 0.5): tezgah yakın planındaki düğmeler, gösterge,
// sipariş resmi; güne başlarken istasyon seçimi; yardımcı işe alma.

// ---- Gösterge: hamur / bardak dolumu (MÜKEMMEL aralığı) ya da pişme (altın sarı) ----
const YAY_R = 70;
function yayNoktasi(oran: number) {
  const aci = Math.PI * (1 - Math.min(1, Math.max(0, oran)));
  return [90 + YAY_R * Math.cos(aci), 86 - YAY_R * Math.sin(aci)] as const;
}
function yayYolu(bas: number, son: number) {
  const [x1, y1] = yayNoktasi(bas);
  const [x2, y2] = yayNoktasi(son);
  return `M ${x1} ${y1} A ${YAY_R} ${YAY_R} 0 0 1 ${x2} ${y2}`;
}

export function MakineGostergesi() {
  const durum = useDurum();
  const ibre = useRef<SVGLineElement>(null);
  const pisme = durum.makine.asama === 'pisiyor';
  useEffect(() => {
    let istek = 0;
    const dongu = () => {
      const simdi = performance.now();
      const d = durumuOku();
      const [x, y] = yayNoktasi(d.makine.asama === 'pisiyor' ? pismeOrani(simdi, d) : makineDolumu(simdi, d));
      ibre.current?.setAttribute('x2', String(x));
      ibre.current?.setAttribute('y2', String(y));
      istek = requestAnimationFrame(dongu);
    };
    dongu();
    return () => cancelAnimationFrame(istek);
  }, []);
  const yazi: MetinAnahtari = pisme ? 'makine.gostergePisme' : durum.istasyon === 'waffle' ? 'makine.gostergeHamur' : 'makine.gostergeDolum';
  return (
    <div className="gosterge">
      <svg viewBox="0 0 180 100" aria-hidden>
        <path d={yayYolu(0, 1)} className="yay-zemin" />
        {pisme ? (
          <>
            <path d={yayYolu(0.02, ALTIN_ALT)} style={{ stroke: '#f3dca6', fill: 'none', strokeWidth: 16 }} />
            <path d={yayYolu(ALTIN_ALT, ALTIN_UST)} style={{ stroke: '#ffb627', fill: 'none', strokeWidth: 16 }} />
            <path d={yayYolu(ALTIN_UST, 0.98)} style={{ stroke: '#6b3f1d', fill: 'none', strokeWidth: 16 }} />
          </>
        ) : (
          <>
            <path d={yayYolu(MUKEMMEL_ALT - IYI_PAYI, MUKEMMEL_UST + IYI_PAYI)} className="yay-iyi" />
            <path d={yayYolu(MUKEMMEL_ALT, MUKEMMEL_UST)} className="yay-mukemmel" />
          </>
        )}
        <line ref={ibre} x1="90" y1="86" x2="20" y2="86" className="ibre" />
        <circle cx="90" cy="86" r="6" className="ibre-merkez" />
      </svg>
      <div className="gosterge-yazi">{m(yazi)}</div>
    </div>
  );
}

// ---- Sipariş resmi: waffle (süslemesiyle) ya da limonata (buzlu / buzsuz) ----
export function WaffleSuslemeIsareti({ s, x, y }: { s: WaffleSusleme; x: number; y: number }) {
  if (s === 'cikolata') return <path d={`M${x - 12} ${y - 2} Q${x} ${y + 8} ${x + 12} ${y - 2}`} stroke="#4a2614" strokeWidth="5" fill="none" strokeLinecap="round" />;
  if (s === 'cilek')
    return (
      <g>
        {[-8, 0, 8].map((dx) => (
          <circle key={dx} cx={x + dx} cy={y + (dx ? 2 : -2)} r="4" fill="#e2384b" />
        ))}
      </g>
    );
  return <ellipse cx={x} cy={y} rx="13" ry="5" fill="#ffffff" opacity="0.9" />;
}

export function MakineSiparisResmi({ musteri }: { musteri: Musteri }) {
  if (musteri.urun === 'waffle')
    return (
      <svg viewBox="0 0 60 90" className="siparis-resmi" aria-label={m('urun.waffle')}>
        <rect x="10" y="30" width="40" height="40" rx="6" fill="#e0a64a" stroke="#a8743f" strokeWidth="2" />
        {[20, 30, 40].map((v) => (
          <g key={v}>
            <line x1={v} y1="32" x2={v} y2="68" stroke="#b8792f" strokeWidth="2" />
            <line x1="12" y1={v + 10} x2="48" y2={v + 10} stroke="#b8792f" strokeWidth="2" />
          </g>
        ))}
        {musteri.makine.susleme && <WaffleSuslemeIsareti s={musteri.makine.susleme} x={30} y={44} />}
      </svg>
    );
  return (
    <svg viewBox="0 0 60 90" className="siparis-resmi" aria-label={m('urun.limonata')}>
      <path d="M16 26 L44 26 L40 82 L20 82 Z" fill="#fff9d6" stroke="#9cc4d2" strokeWidth="2" />
      <path d="M18 40 L42 40 L39.5 80 L20.5 80 Z" fill="#f7e36a" />
      <circle cx="44" cy="28" r="8" fill="#ffe14d" stroke="#c9a400" strokeWidth="1.5" />
      {musteri.makine.buz &&
        [
          [24, 44],
          [33, 50],
          [27, 58],
        ].map(([x, y], i) => <rect key={i} x={x} y={y} width="8" height="8" rx="1.5" fill="#e8f7ff" stroke="#9cc4d2" strokeWidth="1" />)}
    </svg>
  );
}

// ---- Tezgah yakın planındaki düğmeler (makine istasyonunda) ----
export function makineIpucu(durum: ReturnType<typeof useDurum>): MetinAnahtari | null {
  if (!ondekiMusteri(durum)) return null;
  const a = durum.makine.asama;
  if (durum.istasyon === 'waffle') return a === 'bos' || a === 'dokuluyor' ? 'ipucu.hamur' : a === 'pisiyor' ? 'ipucu.pisiyor' : a === 'acildi' ? 'ipucu.waffleSusle' : null;
  return a === 'bos' || a === 'doluyor' ? 'ipucu.limonata' : a === 'doldu' ? 'ipucu.limonataBuz' : null;
}

export function MakineDugmeleri() {
  const durum = useDurum();
  const a = durum.makine.asama;
  const musteri = ondekiMusteri(durum);
  const waffle = durum.istasyon === 'waffle';
  return (
    <div className="sag-dugmeler">
      {waffle && a === 'acildi' && (
        <div className="makine-susler">
          {WAFFLE_SUSLEMELERI.map((s) => (
            <button key={s} className={`dugme susleme-dugme ${durum.makine.susleme.includes(s) ? 'secili' : ''}`} onClick={() => waffleSusle(s)}>
              <svg viewBox="0 0 30 24" aria-hidden className="susleme-simge">
                <WaffleSuslemeIsareti s={s} x={15} y={12} />
              </svg>
              {m(`waffle.${s}` as MetinAnahtari)}
            </button>
          ))}
        </div>
      )}
      {!waffle && a === 'doldu' && (
        <button className={`dugme ${durum.makine.buz ? 'secili' : ''}`} onClick={limonataBuz}>
          {m('makine.buz')}
        </button>
      )}
      {a !== 'bos' && a !== 'servis' && a !== 'dokuluyor' && a !== 'doluyor' && (
        <button className="dugme" onClick={makineSifirla}>
          {m('makine.bastan')}
        </button>
      )}
      {waffle && a === 'pisiyor' ? (
        // Her düğmenin ayrı anahtarı var: parmak kalkınca yerine gelen düğme kendiliğinden basılmasın
        <button key="ac" className="dugme dugme-servis dikkat" onClick={waffleAc}>
          {m('makine.ac')}
        </button>
      ) : a === 'bos' || a === 'dokuluyor' || a === 'doluyor' ? (
        // Basılı tut: hamur dökülür / bardak dolar; parmak kalkınca bırakılır
        <button
          key="bas"
          className="dugme dugme-servis makine-bas"
          disabled={!musteri}
          onPointerDown={(e) => {
            e.preventDefault();
            makineBas();
          }}
        >
          {m(waffle ? 'makine.hamur' : 'makine.doldur')}
        </button>
      ) : (
        <button key="servis" className="dugme dugme-servis" disabled={!makineServisHazir(durum)} onClick={makineServisEt}>
          {m('servis.dugme')}
        </button>
      )}
    </div>
  );
}

// Dondurma istasyonunda ikinci vitrine bakma düğmesi
export function VitrinOdakDugmesi() {
  const durum = useDurum();
  if (durum.istasyon !== 'dondurma' || ikinciVitrinX(durum) === null || durum.vitrin.length <= ILK_VITRIN_SINIRI) return null;
  return (
    <button className="dugme" onClick={vitrinOdakDegistir}>
      {m(durum.vitrinOdak ? 'vitrin.birinci' : 'vitrin.ikinci')}
    </button>
  );
}

// ---- İstasyon seçimi (güne başlarken) ----
function Hiz({ n }: { n: number }) {
  return (
    <span className="yardimci-hiz" aria-label={`${m('yardimci.hiz')} ${n}`}>
      {'★'.repeat(n)}
      <span className="sonuk">{'★'.repeat(3 - n)}</span>
    </span>
  );
}

export function IstasyonSecimi() {
  const durum = useDurum();
  if (!durum.istasyonSecimi) return null;
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu istasyon-secimi" role="dialog" aria-labelledby="istasyon-baslik">
        <h2 id="istasyon-baslik">{m('istasyon.baslik')}</h2>
        <div className="istasyon-kartlar">
          {ISTASYONLAR.map((i) => (
            <button key={i} className={`istasyon-kart ${durum.istasyon === i ? 'secili' : ''}`} disabled={!istasyonKurulu(i, durum)} onClick={() => istasyonSec(i)}>
              <IstasyonResmi ist={i} />
              <span>{m(`istasyon.${i}` as MetinAnahtari)}</span>
              {!istasyonKurulu(i, durum) && <small>{m('istasyon.kurulmadi')}</small>}
            </button>
          ))}
        </div>
        {durum.yardimcilar.length > 0 && (
          <>
            <div className="gel-baslik">{m('istasyon.yardimcilar')}</div>
            <div className="istasyon-yardimcilar">
              {durum.yardimcilar.map((y) => (
                <button key={y.id} className="dugme yardimci-cip" onClick={() => yardimciYeriniDegistir(y.id)}>
                  <b>{y.ad}</b> <Hiz n={y.hiz} /> → {y.istasyon ? m(`istasyon.${y.istasyon}` as MetinAnahtari) : m('istasyon.dinleniyor')}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="gun-sonu-dugmeler">
          <button className="dugme" onClick={istasyonSeciminiKapat}>
            {m('istasyon.geri')}
          </button>
          <button className="dugme dugme-yeni-gun" onClick={istasyonlaBasla}>
            {m('istasyon.basla')}
          </button>
        </div>
      </div>
    </div>
  );
}

function IstasyonResmi({ ist }: { ist: Istasyon }) {
  if (ist === 'dondurma')
    return (
      <svg viewBox="0 0 40 40" aria-hidden className="istasyon-simge">
        <circle cx="20" cy="14" r="8" fill="#ff6f7d" />
        <path d="M12 18 L28 18 L20 36 Z" fill="#d9a066" />
      </svg>
    );
  if (ist === 'waffle')
    return (
      <svg viewBox="0 0 40 40" aria-hidden className="istasyon-simge">
        <rect x="8" y="10" width="24" height="24" rx="4" fill="#e0a64a" stroke="#a8743f" strokeWidth="2" />
        <path d="M16 10 V34 M24 10 V34 M8 18 H32 M8 26 H32" stroke="#b8792f" strokeWidth="2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 40 40" aria-hidden className="istasyon-simge">
      <path d="M12 8 L28 8 L26 36 L14 36 Z" fill="#f7e36a" stroke="#9cc4d2" strokeWidth="2" />
      <circle cx="28" cy="10" r="5" fill="#ffe14d" />
    </svg>
  );
}

// ---- Yardımcı işe alma (menü şeridinden) ----
export function YardimciEkrani({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const [adlar, setAdlar] = useState<Record<number, string>>({});
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu yardimci-ekrani" role="dialog" aria-labelledby="yardimci-baslik">
        <div className="gel-ust">
          <h2 id="yardimci-baslik">{m('yardimci.baslik')}</h2>
          <span className="gel-bosluk" />
          <span className="gel-para">
            <span className="para-simge" aria-hidden /> {durum.para}
          </span>
          <button className="dugme gel-tamam" onClick={kapat}>
            {m('yardimci.tamam')}
          </button>
        </div>
        <p className="gel-not">{m('yardimci.not', { fiyat: YARDIMCI_FIYATI, yevmiye: YEVMIYE, sayi: EN_COK_YARDIMCI })}</p>
        {durum.yardimcilar.length === 0 && <p className="gel-not">{m('yardimci.yok')}</p>}
        <div className="yardimci-liste">
          {durum.yardimcilar.map((y) => (
            <div key={y.id} className="yardimci-kart">
              <b>{y.ad}</b>
              <span>{m('yardimci.yetenek', { yer: m(`istasyon.${y.yetenek}` as MetinAnahtari) })}</span>
              <Hiz n={y.hiz} />
              <button className="dugme gel-kucuk" onClick={() => yardimciCikar(y.id)}>
                {m('yardimci.cikar')}
              </button>
            </div>
          ))}
        </div>
        <div className="gel-baslik">{m('yardimci.adaylar')}</div>
        {durum.yardimcilar.length >= EN_COK_YARDIMCI ? (
          <p className="gel-not">{m('yardimci.dolu')}</p>
        ) : durum.adaylar.length === 0 ? (
          <button className="dugme" onClick={adaylariGetir}>
            {m('yardimci.getir')}
          </button>
        ) : (
          <div className="yardimci-liste">
            {durum.adaylar.map((a) => (
              <div key={a.id} className="yardimci-kart">
                <span>{m('yardimci.yetenek', { yer: m(`istasyon.${a.yetenek}` as MetinAnahtari) })}</span>
                <Hiz n={a.hiz} />
                <input
                  className="yardimci-ad"
                  maxLength={AD_EN_UZUN}
                  placeholder={m('yardimci.adYaz')}
                  value={adlar[a.id] ?? ''}
                  onChange={(e) => setAdlar({ ...adlar, [a.id]: e.target.value })}
                />
                <button
                  className="dugme gel-al"
                  disabled={!yardimciAlinabilir(durum) || !(adlar[a.id] ?? '').trim()}
                  onClick={() => yardimciAl(a.id, adlar[a.id] ?? '')}
                >
                  {m('yardimci.al')} <span className="para-simge" aria-hidden /> {YARDIMCI_FIYATI}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
