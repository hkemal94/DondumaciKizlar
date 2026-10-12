import { Sahne } from './sahne/Sahne';
import { m } from './metinler';
import { useEffect } from 'react';
import { Arayuz } from './arayuz/Arayuz';
import { musteriDongusu } from './oyun/durum';

// Oyun her zaman yatay görünür. Telefon dik tutuluyorsa (ekran döndürme
// kilidi açık olabilir) bütün oyun ekranda 90° çevrilir; oyuncu telefonu
// yana yatırınca oyun düz durur. Çevirme yalnız stil.css'te.
export function Uygulama() {
  // Oyun döngüsü: yarım saniyede bir sıra kontrol edilir, gerekirse müşteri gelir.
  useEffect(() => {
    const z = window.setInterval(() => musteriDongusu(performance.now()), 500);
    return () => window.clearInterval(z);
  }, []);

  return (
    <div className="oyun">
      <Sahne />
      <Arayuz />
      <div className="iskelet-etiketi">{m('iskelet.etiket')}</div>
    </div>
  );
}
