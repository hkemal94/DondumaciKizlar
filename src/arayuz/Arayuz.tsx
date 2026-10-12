import { useEffect, useRef, useState } from 'react';
import {
  altlikSec,
  birak,
  dolumHesapla,
  EN_COK_TOP,
  IYI_PAYI,
  MUKEMMEL_ALT,
  MUKEMMEL_UST,
  ondekiMusteri,
  ortalamaMemnuniyet,
  saatYazisi,
  servisEt,
  yeniGun,
  type Siparis,
  topuYerlestir,
  useDurum,
} from '../oyun/durum';
import { m, type MetinAnahtari } from '../metinler';
import { kuvetler } from '../oyun/kuvetler';
import { balon } from '../sahne/Musteriler';

// Tezgah ekranının düğmeleri, ipucu yazısı, kepçe göstergesi ve sonuç yazısı.
// Tarz: taslak 1 ve 3 gibi sıcak ahşap paneller.

// Göstergedeki yay: sol uç 0 (boş), sağ uç 1 (ağzına kadar).
const YAY_R = 70;
function yayNoktasi(oran: number) {
  const aci = Math.PI * (1 - oran);
  return [90 + YAY_R * Math.cos(aci), 86 - YAY_R * Math.sin(aci)] as const;
}
function yayYolu(bas: number, son: number) {
  const [x1, y1] = yayNoktasi(bas);
  const [x2, y2] = yayNoktasi(son);
  return `M ${x1} ${y1} A ${YAY_R} ${YAY_R} 0 0 1 ${x2} ${y2}`;
}

function Gosterge() {
  const ibre = useRef<SVGLineElement>(null);
  useEffect(() => {
    let istek = 0;
    const dongu = () => {
      const [x, y] = yayNoktasi(dolumHesapla(performance.now()));
      ibre.current?.setAttribute('x2', String(x));
      ibre.current?.setAttribute('y2', String(y));
      istek = requestAnimationFrame(dongu);
    };
    dongu();
    return () => cancelAnimationFrame(istek);
  }, []);
  return (
    <div className="gosterge">
      <svg viewBox="0 0 180 100" aria-hidden>
        <path d={yayYolu(0, 1)} className="yay-zemin" />
        <path d={yayYolu(MUKEMMEL_ALT - IYI_PAYI, MUKEMMEL_UST + IYI_PAYI)} className="yay-iyi" />
        <path d={yayYolu(MUKEMMEL_ALT, MUKEMMEL_UST)} className="yay-mukemmel" />
        <line ref={ibre} x1="90" y1="86" x2="20" y2="86" className="ibre" />
        <circle cx="90" cy="86" r="6" className="ibre-merkez" />
      </svg>
      <div className="gosterge-yazi">{m('gosterge.baslik')}</div>
    </div>
  );
}

function Bildirim() {
  const { bildirim } = useDurum();
  const [gorunur, setGorunur] = useState(false);
  useEffect(() => {
    if (!bildirim) return;
    setGorunur(true);
    const z = window.setTimeout(() => setGorunur(false), 1000);
    return () => window.clearTimeout(z);
  }, [bildirim]);
  if (!bildirim || !gorunur) return null;
  let yazi: string;
  let sinif: string = bildirim.tur;
  if (bildirim.tur === 'top') {
    yazi = m(`sonuc.${bildirim.sonuc}` as MetinAnahtari);
    sinif = bildirim.sonuc;
  } else if (bildirim.tur === 'para') yazi = `+${bildirim.miktar}`;
  else yazi = m('sonuc.yanlis');
  return (
    <div key={bildirim.zaman} className={`bildirim bildirim-${sinif}`}>
      {bildirim.tur === 'para' && <span className="para-simge" aria-hidden />}
      {yazi}
    </div>
  );
}

// Sipariş balonunun içi: altlık ve top renkleri, resimle (yazısız).
function SiparisResmi({ siparis }: { siparis: Siparis }) {
  const toplar = siparis.kuvetler.map((k) => kuvetler[k].renk);
  const kulah = siparis.altlik === 'kulah';
  // Toplar: külahta üst üste, kapta yan yana (oyundaki gibi)
  const yerler: [number, number][] = kulah
    ? toplar.map((_, i) => [30, 40 - i * 15])
    : toplar.length === 1
      ? [[30, 44]]
      : [[21, 46], [39, 46], [30, 33]].slice(0, toplar.length) as [number, number][];
  return (
    <svg viewBox="0 0 60 90" className="siparis-resmi" aria-hidden>
      {toplar.map((r, i) => (
        <circle key={i} cx={yerler[i][0]} cy={yerler[i][1]} r="11" fill={r} stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      ))}
      {kulah ? (
        <path d="M17 47 L43 47 L30 86 Z" fill="#d9a066" stroke="#a8743f" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <path d="M12 50 L48 50 L43 74 L17 74 Z" fill="#7a3fa8" stroke="#4e2470" strokeWidth="2" strokeLinejoin="round" />
      )}
      {!kulah && <rect x="13" y="55" width="34" height="4" fill="#ffc928" />}
    </svg>
  );
}

function SiparisBalonu() {
  const durum = useDurum();
  const musteri = ondekiMusteri(durum);
  return (
    <div
      className="balon"
      ref={(oge) => {
        balon.oge = oge;
      }}
    >
      {musteri && (
        <div className="balon-ic">
          <SiparisResmi siparis={musteri.siparis} />
        </div>
      )}
    </div>
  );
}

function Yildizlar({ puan }: { puan: number | null }) {
  return (
    <span className="yildizlar" aria-label={puan === null ? '' : `${puan.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const dolu = puan === null ? 0 : Math.max(0, Math.min(1, puan - (i - 1)));
        return (
          <span key={i} className="yildiz">
            <span className="yildiz-dolu" style={{ width: `${dolu * 100}%` }}>
              ★
            </span>
            ★
          </span>
        );
      })}
    </span>
  );
}

function GunSaat() {
  const durum = useDurum();
  return (
    <div className="gun-saat">
      <div className="bilgi-kutusu">{m('ust.gun', { gun: durum.gun })}</div>
      <div className={`bilgi-kutusu ${durum.acik ? '' : 'kapali'}`}>
        <span className="saat-simge" aria-hidden />
        {saatYazisi(durum)}
      </div>
    </div>
  );
}

// Gün sonu ekranı (belge: dükkân kapanınca gün biter, gün sonu ekranı gelir).
function GunSonu() {
  const durum = useDurum();
  if (!durum.gunSonu) return null;
  const g = durum.gunluk;
  const ortalama = g.puanlar.length ? g.puanlar.reduce((a, b) => a + b, 0) / g.puanlar.length : null;
  const satirlar: [string, React.ReactNode][] = [
    [m('gunSonu.musteri'), g.musteri],
    [m('gunSonu.kazanc'), <><span className="para-simge" aria-hidden /> {g.kazanc}</>],
    [m('gunSonu.mukemmel'), g.mukemmel],
    [m('gunSonu.memnuniyet'), <Yildizlar puan={ortalama} />],
    [m('gunSonu.toplam'), <><span className="para-simge" aria-hidden /> {durum.para}</>],
  ];
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu" role="dialog" aria-labelledby="gun-sonu-baslik">
        <h2 id="gun-sonu-baslik">{m('gunSonu.baslik', { gun: durum.gun })}</h2>
        <dl>
          {satirlar.map(([ad, deger]) => (
            <div key={ad} className="gun-sonu-satir">
              <dt>{ad}</dt>
              <dd>{deger}</dd>
            </div>
          ))}
        </dl>
        <button className="dugme dugme-yeni-gun" onClick={yeniGun}>
          {m('gunSonu.devam')}
        </button>
      </div>
    </div>
  );
}

function UstBilgi() {
  const durum = useDurum();
  return (
    <div className="ust-bilgi">
      <div className="bilgi-kutusu">
        <span className="para-simge" aria-hidden />
        <span className="para-sayi">{durum.para}</span>
      </div>
      <div className="bilgi-kutusu" title={m('memnuniyet')}>
        <Yildizlar puan={ortalamaMemnuniyet(durum)} />
      </div>
    </div>
  );
}

export function Arayuz() {
  const durum = useDurum();

  // Parmak ekranın neresinde kalkarsa kalksın kepçe bırakılır.
  useEffect(() => {
    window.addEventListener('pointerup', birak);
    window.addEventListener('pointercancel', birak);
    return () => {
      window.removeEventListener('pointerup', birak);
      window.removeEventListener('pointercancel', birak);
    };
  }, []);

  const topSayisi = durum.toplar.length;
  const musteri = ondekiMusteri(durum);
  let ipucu: MetinAnahtari | null = null;
  if (!durum.acik && musteri) ipucu = 'ipucu.kapandi';
  else if (!musteri && durum.asama === 'altlikSec') ipucu = durum.acik ? 'ipucu.musteriYok' : null;
  else if (durum.asama === 'altlikSec') ipucu = 'ipucu.altlik';
  else if (durum.asama === 'kepceDolu') ipucu = 'ipucu.yerlestir';
  else if (durum.asama === 'kepceBos')
    ipucu = topSayisi === 0 ? 'ipucu.kuvet' : topSayisi >= EN_COK_TOP ? 'ipucu.dolu' : 'ipucu.servisVeyaTop';

  const altlikDegisebilir = (durum.asama === 'altlikSec' || durum.asama === 'kepceBos') && topSayisi === 0;
  const servisHazir = durum.asama === 'kepceBos' && topSayisi > 0 && !!musteri;

  return (
    <div className="arayuz">
      {/* Kepçede top varken ekranın herhangi bir yerine dokunmak topu yerleştirir */}
      {durum.asama === 'kepceDolu' && <div className="yerlestir-alani" onPointerDown={topuYerlestir} />}

      <SiparisBalonu />
      <UstBilgi />
      <GunSaat />
      {ipucu && <div className="ipucu">{m(ipucu)}</div>}
      {durum.asama === 'dolduruyor' && <Gosterge />}
      <Bildirim />

      <div className="altlik-dugmeleri">
        {(['kulah', 'kap'] as const).map((a) => (
          <button
            key={a}
            className={`dugme ${durum.altlik === a ? 'secili' : ''}`}
            disabled={!altlikDegisebilir}
            onClick={() => altlikSec(a)}
          >
            {m(a === 'kulah' ? 'altlik.kulah' : 'altlik.kap')}
          </button>
        ))}
      </div>

      <button className="dugme dugme-servis" disabled={!servisHazir} onClick={servisEt}>
        {m('servis.dugme')}
      </button>

      <GunSonu />
    </div>
  );
}
