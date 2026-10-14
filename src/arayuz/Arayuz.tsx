import { useEffect, useRef, useState } from 'react';
import {
  altlikSec,
  birak,
  dolumHesapla,
  EN_COK_TOP,
  geriAl,
  geriAlinabilir,
  kameraSec,
  depodaki,
  esyaSec,
  yerlestirmeyiAc,
  yerlestirmeyiKapat,
  IYI_PAYI,
  MUKEMMEL_ALT,
  MUKEMMEL_UST,
  ondekiMusteri,
  ortalamaMemnuniyet,
  sabirOrani,
  haftaGunu,
  saatYazisi,
  servisEt,
  gunSonunuKapat,
  guneBasla,
  altlikDegisebilir,
  SUSLEMELER,
  suslemeDegistir,
  suslemeBasilabilir,
  type Susleme,
  type Siparis,
  type Urun,
  tepsiyeKoy,
  tepsiyeKoyabilir,
  useDurum,
} from '../oyun/durum';
import { m, type MetinAnahtari } from '../metinler';
import { CESITLER } from '../oyun/kuvetler';
import { balon } from '../sahne/Musteriler';
import { Gelistir } from './Gelistir';
import { CalisanAdi, CalisanEkrani } from './CalisanEkrani';
import { dukkanDonusu, ekrandaKaydir, ortala, yakinlikDegistir } from '../sahne/kameraKarisimi';
import { DuraklatDugmesi, DuraklatMenusu, GezmeEkrani } from './Duraklat';
import { ESYALAR } from '../oyun/dekorasyon';

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
    const z = window.setTimeout(() => setGorunur(false), bildirim.tur === 'susleme' ? 2200 : 1000);
    return () => window.clearTimeout(z);
  }, [bildirim]);
  if (!bildirim || !gorunur) return null;
  let yazi: string;
  let sinif: string = bildirim.tur;
  if (bildirim.tur === 'top') {
    yazi = m(`sonuc.${bildirim.sonuc}` as MetinAnahtari);
    sinif = bildirim.sonuc;
  } else if (bildirim.tur === 'para') yazi = `+${bildirim.miktar}`;
  else if (bildirim.tur === 'susleme') {
    // Hangi süsleme eksik ya da fazla: adıyla söylenir
    const ad = (x: Susleme) => m(`susleme.${x}` as MetinAnahtari);
    yazi = bildirim.eksik.length
      ? m('sonuc.suslemeEksik', { ad: bildirim.eksik.map(ad).join(', ') })
      : m('sonuc.suslemeFazla', { ad: bildirim.fazla.map(ad).join(', ') });
  } else if (bildirim.tur === 'sikildi') yazi = m('sonuc.sikildi');
  else if (bildirim.tur === 'ikiDondurma') yazi = m('sonuc.ikiDondurma');
  else yazi = m('sonuc.yanlis');
  return (
    <div key={bildirim.zaman} className={`bildirim bildirim-${sinif}`}>
      {bildirim.tur === 'para' && <span className="para-simge" aria-hidden />}
      {yazi}
    </div>
  );
}

// Sipariş balonunun içi: altlık ve top renkleri, resimle (yazısız).
function SiparisResmi({ siparis }: { siparis: Omit<Siparis, 'ikinci'> }) {
  const toplar = siparis.kuvetler.map((k) => CESITLER[k].renk);
  const kulah = siparis.altlik === 'kulah';
  const kup = siparis.altlik === 'kup';
  // Toplar: külahta üst üste, kapta yan yana (oyundaki gibi)
  const yerler: [number, number][] = kulah
    ? toplar.map((_, i) => [30, 40 - i * 15])
    : kup
      ? toplar.map((_, i) => [i === 1 ? 24 : i === 2 ? 36 : 30, 44 - i * 11] as [number, number])
    : toplar.length === 1
      ? [[30, 44]]
      : [[21, 46], [39, 46], [30, 33]].slice(0, toplar.length) as [number, number][];
  return (
    <svg viewBox="0 0 60 90" className="siparis-resmi" aria-hidden>
      {toplar.map((r, i) => (
        <circle key={i} cx={yerler[i][0]} cy={yerler[i][1]} r="11" fill={r} stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      ))}
      {/* İstenen süsleme en üstteki topun üstünde */}
      {siparis.susleme.map((s) => {
        const ust = yerler.slice(0, toplar.length).reduce((a, b) => (b[1] < a[1] ? b : a));
        return <SuslemeIsareti key={s} tur={s} x={ust[0]} y={ust[1]} />;
      })}
      {kulah ? (
        <path d="M17 47 L43 47 L30 86 Z" fill="#d9a066" stroke="#a8743f" strokeWidth="2" strokeLinejoin="round" />
      ) : kup ? (
        <g data-kup="1">
          <path d="M11 48 Q30 72 49 48 Z" fill="#dff1f7" stroke="#7ba7b8" strokeWidth="2" strokeLinejoin="round" />
          <rect x="28" y="62" width="4" height="16" fill="#9cc4d2" />
          <rect x="19" y="77" width="22" height="5" rx="2" fill="#7a3fa8" />
        </g>
      ) : (
        <path d="M12 50 L48 50 L43 74 L17 74 Z" fill="#7a3fa8" stroke="#4e2470" strokeWidth="2" strokeLinejoin="round" />
      )}
      {!kulah && !kup && <rect x="13" y="55" width="34" height="4" fill="#ffc928" />}
    </svg>
  );
}

// Süslemenin küçük resmi: balonda ve düğmede aynı
function SuslemeIsareti({ tur, x, y }: { tur: Susleme; x: number; y: number }) {
  if (tur === 'sos')
    return (
      <path
        d={`M${x - 11} ${y - 1} Q${x - 11} ${y - 12} ${x} ${y - 12} Q${x + 11} ${y - 12} ${x + 11} ${y - 1} L${x + 8} ${y + 3} L${x + 5} ${y - 1} L${x + 1} ${y + 5} L${x - 3} ${y - 1} L${x - 7} ${y + 3} Z`}
        fill="#5a2e1c"
      />
    );
  if (tur === 'seker')
    return (
      <g>
        {[[-6, -7, '#5fb7e8'], [1, -10, '#ffc928'], [6, -5, '#9b5fc9'], [-2, -3, '#fffaf2'], [-8, -1, '#ff6f7d']].map(([dx, dy, r], i) => (
          <rect key={i} x={x + (dx as number) - 2.5} y={y + (dy as number) - 1} width="5" height="2" rx="1" fill={r as string} transform={`rotate(${i * 40} ${x + (dx as number)} ${y + (dy as number)})`} />
        ))}
      </g>
    );
  return (
    <g fill="#a86d36">
      {[[-5, -7], [3, -9], [6, -3], [-2, -2], [-8, -2]].map(([dx, dy], i) => (
        <polygon key={i} points={`${x + dx},${y + dy - 2.5} ${x + dx + 2.5},${y + dy + 2} ${x + dx - 2.5},${y + dy + 2}`} />
      ))}
    </g>
  );
}

// Süsleme unutulduysa ipucu satırı bunu söyler (yeni servis ya da Geri al'a kadar)
function suslemeHatirlatmasi(durum: ReturnType<typeof useDurum>): string | null {
  const b = durum.bildirim;
  if (!b || b.tur !== 'susleme' || durum.asama !== 'kepceBos' || durum.kamera !== 'tezgah') return null;
  const ad = (x: Susleme) => m(`susleme.${x}` as MetinAnahtari);
  const eksik = b.eksik.filter((x) => !durum.susleme.includes(x));
  const fazla = b.fazla.filter((x) => durum.susleme.includes(x));
  if (eksik.length) return m('ipucu.suslemeEkle', { ad: eksik.map(ad).join(', ') });
  if (fazla.length) return m('ipucu.suslemeKaldir', { ad: fazla.map(ad).join(', ') });
  return null;
}

// Sağ kenardaki sütun: Geri al ve (top varken) süslemeler
function SuslemeDugmeleri() {
  const durum = useDurum();
  if (durum.kamera !== 'tezgah') return null;
  return (
    <div className="susleme-dugmeleri">
      <button className="dugme dugme-geri" disabled={!geriAlinabilir(durum)} onClick={geriAl}>
        <span className="geri-simge" aria-hidden>
          ↶
        </span>
        {m('geriAl.dugme')}
      </button>
      {durum.toplar.length > 0 && SUSLEMELER.map((s) => (
        <button
          key={s}
          className={`susleme-dugme ${durum.susleme.includes(s) ? 'eklendi' : ''} ${
            durum.bildirim?.tur === 'susleme' && durum.bildirim.eksik.includes(s) && !durum.susleme.includes(s) ? 'dikkat' : ''
          }`}
          disabled={!suslemeBasilabilir(durum)}
          aria-pressed={durum.susleme.includes(s)}
          onClick={() => suslemeDegistir(s)}
          aria-label={m(`susleme.${s}` as MetinAnahtari)}
        >
          <svg viewBox="0 0 30 30" aria-hidden>
            <circle cx="15" cy="17" r="11" fill="#fff0c8" />
            <SuslemeIsareti tur={s} x={15} y={17} />
          </svg>
          <span>{m(`susleme.${s}` as MetinAnahtari)}</span>
        </button>
      ))}
    </div>
  );
}

// Tepside bekleyen dondurmanın küçük resmi
function urunuSipariseCevir(u: Urun): Omit<Siparis, 'ikinci'> {
  return { altlik: u.altlik, kuvetler: u.toplar.map((t) => t.kuvet), susleme: u.susleme };
}

function TepsiGostergesi() {
  const durum = useDurum();
  if (durum.kamera !== 'tezgah' || durum.tepsi.length === 0) return null;
  return (
    <div className="tepsi-gostergesi">
      <span>{m('tepsi.ustunde')}</span>
      {durum.tepsi.map((u, i) => (
        <SiparisResmi key={i} siparis={urunuSipariseCevir(u)} />
      ))}
    </div>
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
        <div className={`balon-ic ${durum.bildirim?.tur === 'susleme' ? 'hatirlat' : ''}`}>
          {/* Bir ya da iki dondurma (tepsi), yan yana */}
          <div className="balon-dondurmalar">
            <SiparisResmi siparis={musteri.siparis} />
            {musteri.siparis.ikinci && <SiparisResmi siparis={musteri.siparis.ikinci} />}
          </div>
          {/* Sabır çubuğu: işlem yapılınca dolar, beklerken azalır */}
          {sabirOrani(durum) !== null && (
            <div className="sabir" aria-hidden>
              <div
                className="sabir-dolu"
                style={{
                  width: `${(sabirOrani(durum) ?? 0) * 100}%`,
                  background: (sabirOrani(durum) ?? 0) > 0.5 ? '#5fc06a' : (sabirOrani(durum) ?? 0) > 0.25 ? '#ffc928' : '#e8574f',
                }}
              />
            </div>
          )}
          {/* İstenen süsleme ayrıca rozet olarak: gözden kaçmasın */}
          {musteri.siparis.susleme.length + (musteri.siparis.ikinci?.susleme.length ?? 0) > 0 && (
            <div className="balon-rozetler">
              {[...musteri.siparis.susleme, ...(musteri.siparis.ikinci?.susleme ?? [])].map((s, i) => (
                <svg key={i} viewBox="0 0 30 30" className="balon-rozet" aria-label={m(`susleme.${s}` as MetinAnahtari)}>
                  <circle cx="15" cy="17" r="11" fill="#fff0c8" />
                  <SuslemeIsareti tur={s} x={15} y={17} />
                </svg>
              ))}
            </div>
          )}
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
      <DuraklatDugmesi />
      <div className="bilgi-kutusu">
        {m('ust.gun', { gun: durum.gun })} · {m(`haftaGunu.${haftaGunu(durum)}` as MetinAnahtari)}
      </div>
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
        {/* Yalnız Tamam: yeni gün ve alışveriş dükkânın genel görünümünde (13 Ekim) */}
        <button className="dugme dugme-yeni-gun" onClick={gunSonunuKapat}>
          {m('gunSonu.tamam')}
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

// Genel görünümde iki parmakla sıkıştır / aç ve fare tekerleği: yakınlaştırma.
function useYakinlastirma(etkin: boolean, gezme: boolean) {
  useEffect(() => {
    if (!etkin) return;
    let oncekiX: number | null = null;
    let oncekiY: number | null = null;
    const parmaklar = new Map<number, { x: number; y: number }>();
    let oncekiAralik = 0;
    const aralik = () => {
      const [a, b] = [...parmaklar.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const bas = (e: PointerEvent) => {
      // Panel, düğme ya da yazı kutusunun üstünde başlayan kaydırma görüntüyü oynatmaz
      if ((e.target as HTMLElement | null)?.closest('button, input, .calisan-panel, .gelistir, .gun-sonu')) return;
      parmaklar.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (parmaklar.size === 2) {
        oncekiAralik = aralik();
        oncekiX = null;
        oncekiY = null;
      }
    };
    const oynat = (e: PointerEvent) => {
      if (!parmaklar.has(e.pointerId)) return;
      parmaklar.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // Tek parmak: gezerken dükkânın çevresinde döner, yoksa görüntüyü kaydırır
      if (parmaklar.size === 1) {
        const dik = window.matchMedia('(orientation: portrait)').matches; // oyun çevrilmiş
        const x = dik ? e.clientY : e.clientX;
        const y = dik ? window.innerWidth - e.clientX : e.clientY;
        if (oncekiX !== null && oncekiY !== null) {
          if (gezme) dukkanDonusu.deger -= (x - oncekiX) * 0.008;
          else ekrandaKaydir(x - oncekiX, y - oncekiY, dik ? window.innerWidth : window.innerHeight);
        }
        oncekiX = x;
        oncekiY = y;
      }
      if (parmaklar.size === 2 && oncekiAralik > 0) {
        const yeni = aralik();
        yakinlikDegistir(oncekiAralik / yeni); // parmaklar açılınca yaklaşır
        oncekiAralik = yeni;
      }
    };
    const kaldir = (e: PointerEvent) => {
      parmaklar.delete(e.pointerId);
      oncekiAralik = 0;
      oncekiX = null;
      oncekiY = null;
    };
    const tekerlek = (e: WheelEvent) => {
      e.preventDefault();
      yakinlikDegistir(Math.exp(e.deltaY * 0.0015));
    };
    window.addEventListener('pointerdown', bas);
    window.addEventListener('pointermove', oynat);
    window.addEventListener('pointerup', kaldir);
    window.addEventListener('pointercancel', kaldir);
    window.addEventListener('wheel', tekerlek, { passive: false });
    return () => {
      window.removeEventListener('pointerdown', bas);
      window.removeEventListener('pointermove', oynat);
      window.removeEventListener('pointerup', kaldir);
      window.removeEventListener('pointercancel', kaldir);
      window.removeEventListener('wheel', tekerlek);
    };
  }, [etkin, gezme]);
}

export function Arayuz() {
  const durum = useDurum();
  const [gelistirAcik, setGelistirAcik] = useState(false);
  const [calisanAcik, setCalisanAcik] = useState(false);
  useYakinlastirma(durum.kamera === 'dukkan', durum.gezme);

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
  else if (durum.asama === 'kepceBos')
    ipucu = topSayisi === 0 ? 'ipucu.kuvet' : topSayisi >= EN_COK_TOP ? 'ipucu.dolu' : 'ipucu.servisVeyaTop';
  // İki dondurmalı sipariş: tepsiye yönlendir
  if (musteri?.siparis.ikinci && (durum.asama === 'kepceBos' || durum.asama === 'altlikSec')) {
    if (durum.tepsi.length === 0 && topSayisi > 0) ipucu = 'ipucu.tepsiyeKoy';
    else if (durum.tepsi.length > 0 && topSayisi === 0) ipucu = 'ipucu.ikinci';
  }

  const servisHazir = durum.asama === 'kepceBos' && topSayisi > 0 && !!musteri;

  if (durum.gezme)
    return (
      <div className="arayuz">
        <GezmeEkrani />
      </div>
    );

  const tezgahta = durum.kamera === 'tezgah';
  if (!tezgahta && durum.yerlestirme) ipucu = ESYALAR.some((e) => depodaki(e.id, durum) > 0) || durum.seciliEsya ? 'yerlestir.ipucu' : 'yerlestir.bos';
  else if (!tezgahta) ipucu = durum.hazirlik ? 'ipucu.hazirlik' : musteri ? 'ipucu.siparisVar' : durum.acik ? 'ipucu.musteriYok' : null;

  return (
    <div className="arayuz">
      <SiparisBalonu />
      <CalisanAdi />
      <UstBilgi />
      <GunSaat />
      {ipucu && !calisanAcik && <div className="ipucu">{suslemeHatirlatmasi(durum) ?? m(ipucu)}</div>}
      {tezgahta && durum.asama === 'dolduruyor' && <Gosterge />}
      <Bildirim />
      <SuslemeDugmeleri />
      <TepsiGostergesi />

      {tezgahta ? (
        <>
          <div className="altlik-dugmeleri">
            <button className="dugme dugme-simge" aria-label={m('kamera.dukkan')} title={m('kamera.dukkan')} onClick={() => kameraSec('dukkan')}>
              <span className="dukkan-simge" aria-hidden />
            </button>
            {durum.acikAltliklar.map((a) => (
              <button
                key={a}
                className={`dugme ${durum.altlik === a ? 'secili' : ''}`}
                disabled={!altlikDegisebilir(durum)}
                onClick={() => altlikSec(a)}
              >
                {m(`altlik.${a}` as MetinAnahtari)}
              </button>
            ))}
          </div>

          <div className="sag-dugmeler">
            {tepsiyeKoyabilir(durum) && (
              <button className="dugme dikkat" onClick={tepsiyeKoy}>
                {m('tepsi.koy')}
              </button>
            )}
            <button className="dugme dugme-servis" disabled={!servisHazir} onClick={servisEt}>
              {m('servis.dugme')}
            </button>
          </div>
        </>
      ) : (
        <div className="yakinlik-dugmeleri">
          <button className="dugme dugme-simge" aria-label={m('kamera.yakinlas')} onClick={() => yakinlikDegistir(0.8)}>
            +
          </button>
          <button className="dugme dugme-simge" aria-label={m('kamera.uzaklas')} onClick={() => yakinlikDegistir(1.25)}>
            −
          </button>
          <button className="dugme dugme-simge" aria-label={m('kamera.ortala')} onClick={ortala}>
            <span className="ortala-simge" aria-hidden />
          </button>
        </div>
      )}
      {!tezgahta && !durum.gunSonu && !calisanAcik && (
        <div className="sag-dugmeler">
          {durum.yerlestirme ? (
            // Yerleştirme: depodaki eşyalar, seçili olan vurgulu
            <>
              {ESYALAR.filter((e) => depodaki(e.id, durum) > 0 || durum.seciliEsya === e.id).map((e) => (
                <button
                  key={e.id}
                  className={`dugme esya-cip ${durum.seciliEsya === e.id ? 'secili' : ''}`}
                  onClick={() => esyaSec(e.id)}
                >
                  {m(`esya.${e.id}` as MetinAnahtari)} <span className="esya-sayi">{depodaki(e.id, durum)}</span>
                </button>
              ))}
              <button className="dugme dugme-servis" onClick={yerlestirmeyiKapat}>
                {m('yerlestir.bitti')}
              </button>
            </>
          ) : durum.hazirlik ? (
            // Gün başlamadan: dükkâna bak, alışveriş yap, yerleştir, hazır olunca başla
            <>
              <button className="dugme" onClick={() => setGelistirAcik(true)}>
                {m('gelistir.dugme')}
              </button>
              <button className="dugme" onClick={yerlestirmeyiAc}>
                {m('yerlestir.dugme')}
              </button>
              <button className="dugme" onClick={() => setCalisanAcik(true)}>
                {m('calisan.dugme')}
              </button>
              <button className="dugme dugme-servis" onClick={guneBasla}>
                {m('gunBasi.basla')}
              </button>
            </>
          ) : (
            <button className={`dugme dugme-servis ${musteri ? 'dikkat' : ''}`} onClick={() => kameraSec('tezgah')}>
              {m('kamera.tezgah')}
            </button>
          )}
        </div>
      )}
      {gelistirAcik && durum.hazirlik && <Gelistir kapat={() => setGelistirAcik(false)} />}
      {calisanAcik && durum.hazirlik && <CalisanEkrani kapat={() => setCalisanAcik(false)} />}
      <DuraklatMenusu />

      <GunSonu />
    </div>
  );
}
