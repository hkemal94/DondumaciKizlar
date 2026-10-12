import { useEffect, useRef, useState } from 'react';
import {
  altlikSec,
  birak,
  dolumHesapla,
  EN_COK_TOP,
  IYI_PAYI,
  MUKEMMEL_ALT,
  MUKEMMEL_UST,
  servisEt,
  topuYerlestir,
  useDurum,
} from '../oyun/durum';
import { m, type MetinAnahtari } from '../metinler';

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
  const anahtar = `sonuc.${bildirim.sonuc}` as MetinAnahtari;
  return (
    <div key={bildirim.zaman} className={`bildirim bildirim-${bildirim.sonuc}`}>
      {m(anahtar)}
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
  let ipucu: MetinAnahtari | null = null;
  if (durum.asama === 'altlikSec') ipucu = 'ipucu.altlik';
  else if (durum.asama === 'kepceDolu') ipucu = 'ipucu.yerlestir';
  else if (durum.asama === 'kepceBos')
    ipucu = topSayisi === 0 ? 'ipucu.kuvet' : topSayisi >= EN_COK_TOP ? 'ipucu.dolu' : 'ipucu.servisVeyaTop';

  const altlikDegisebilir = (durum.asama === 'altlikSec' || durum.asama === 'kepceBos') && topSayisi === 0;
  const servisHazir = durum.asama === 'kepceBos' && topSayisi > 0;

  return (
    <div className="arayuz">
      {/* Kepçede top varken ekranın herhangi bir yerine dokunmak topu yerleştirir */}
      {durum.asama === 'kepceDolu' && <div className="yerlestir-alani" onPointerDown={topuYerlestir} />}

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
    </div>
  );
}
