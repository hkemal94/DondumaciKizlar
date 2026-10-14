import { useEffect, useRef, useState } from 'react';
import { m, type MetinAnahtari } from '../metinler';
import { dondur, duvarlar, duvarModunuDegistir, ortala, yakinlikDegistir, type DuvarModu } from '../sahne/kameraKarisimi';

// Genel görünümün kamera düğmeleri (belge 0.8): yakınlaştır, uzaklaştır,
// ortala; basılı tuttukça dönen döndürme düğmesi; tek duvar düğmesi
// (yarım → açık → kapalı, her basışta sıradakine geçer).
const DONUS_HIZI = 1.4; // radyan / saniye

function DuvarSimgesi({ mod }: { mod: DuvarModu }) {
  // Küçük bir dükkân: kapalıda çatılı, yarımda ön duvarı yok, açıkta yalnız zemin
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden>
      <path d="M3 19h18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {mod !== 'duvarsiz' && <path d="M5 19V10M19 19V10M5 10h14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
      {mod === 'kapali' && <path d="M3.5 10.5 12 4l8.5 6.5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />}
      {mod === 'kesit' && <path d="M5 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2.4" fill="none" />}
    </svg>
  );
}

export function KameraDugmeleri() {
  const [duvarModu, setDuvarModu] = useState(duvarlar.mod);
  const donuyor = useRef(false);
  const kare = useRef(0);
  const dondurmeyiBitir = () => {
    donuyor.current = false;
    cancelAnimationFrame(kare.current);
  };
  const dondurmeyeBasla = () => {
    if (donuyor.current) return;
    donuyor.current = true;
    let once = performance.now();
    const adim = (simdi: number) => {
      if (!donuyor.current) return;
      dondur(((simdi - once) / 1000) * DONUS_HIZI, 0);
      once = simdi;
      kare.current = requestAnimationFrame(adim);
    };
    kare.current = requestAnimationFrame(adim);
  };
  useEffect(() => dondurmeyiBitir, []);
  return (
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
      <button
        className="dugme dugme-simge dondur-dugmesi"
        aria-label={m('kamera.dondur')}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dondurmeyeBasla();
        }}
        onPointerUp={dondurmeyiBitir}
        onPointerCancel={dondurmeyiBitir}
        onLostPointerCapture={dondurmeyiBitir}
        onContextMenu={(e) => e.preventDefault()}
      >
        ⟳
      </button>
      <button
        className="dugme dugme-simge"
        aria-label={`${m('gezme.duvarlar')}: ${m(`gezme.duvar.${duvarModu}` as MetinAnahtari)}`}
        title={`${m('gezme.duvarlar')}: ${m(`gezme.duvar.${duvarModu}` as MetinAnahtari)}`}
        onClick={() => setDuvarModu(duvarModunuDegistir())}
      >
        <DuvarSimgesi mod={duvarModu} />
      </button>
    </div>
  );
}
