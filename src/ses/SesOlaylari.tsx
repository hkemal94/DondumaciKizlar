import { useEffect, useRef } from 'react';
import { saatDakikasi, havaNe, useDurum, type Durum } from '../oyun/durum';
import { geceAyari, havaSesi, sesiBaslat, sesler } from './ses';

// Oyunda olanları dinler, uygun sesi çalar. Ekrana bir şey çizmez.
export function SesOlaylari() {
  const durum = useDurum();
  const onceki = useRef<Durum>(durum);

  // İlk dokunuşta ses açılır; düğmelere basınca hafif tık
  useEffect(() => {
    const dokun = () => sesiBaslat();
    const tikla = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest('button')) sesler.tik();
    };
    window.addEventListener('pointerdown', dokun);
    window.addEventListener('click', tikla);
    return () => {
      window.removeEventListener('pointerdown', dokun);
      window.removeEventListener('click', tikla);
    };
  }, []);

  useEffect(() => {
    const o = onceki.current;
    onceki.current = durum;
    if (o === durum) return;

    if (durum.asama === 'dolduruyor' && o.asama !== 'dolduruyor') sesler.kepce();
    if (durum.toplar.length > o.toplar.length) sesler.top();
    if (durum.susleme.length > o.susleme.length) sesler.susleme();
    if (durum.sabirMusteri !== null && durum.sabirMusteri !== o.sabirMusteri) sesler.zil();

    const b = durum.bildirim;
    if (b && b !== o.bildirim) {
      if (b.tur === 'top') {
        if (b.sonuc === 'mukemmel') sesler.mukemmel();
        else if (b.sonuc === 'iyi') sesler.iyi();
      } else if (b.tur === 'para') sesler.jeton();
      else if (b.tur === 'yanlis') sesler.yanlis();
      else if (b.tur === 'sikildi') sesler.sikildi();
      else if (b.tur === 'susleme') sesler.hatirlat();
    }

    // Gece deniz sesi kısılır
    const saat = saatDakikasi(durum) / 60;
    geceAyari(Math.min(1, Math.max(0, (saat - 20) / 1.5)));
    // Hava: yağmur ve rüzgâr sesi (açılış ekranında açık hava)
    const hava = durum.acilis ? 'gunesli' : havaNe(durum);
    havaSesi(hava === 'yagmurlu' ? 1 : 0, hava === 'bulutlu' ? 1 : hava === 'yagmurlu' ? 0.6 : 0.1);
  }, [durum]);

  return null;
}
