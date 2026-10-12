import { Sahne } from './sahne/Sahne';
import { useEffect } from 'react';
import { Arayuz } from './arayuz/Arayuz';
import { kaydiYukle, musteriDongusu, zamanIlerlet } from './oyun/durum';

// Önceki oyunun kaydı varsa oradan devam edilir.
kaydiYukle();

// Oyun her zaman yatay görünür. Telefon dik tutuluyorsa (ekran döndürme
// kilidi açık olabilir) bütün oyun ekranda 90° çevrilir; oyuncu telefonu
// yana yatırınca oyun düz durur. Çevirme yalnız stil.css'te.
export function Uygulama() {
  // Oyun döngüsü: saat ilerler, sıra kontrol edilir, gerekirse müşteri gelir.
  useEffect(() => {
    let onceki = performance.now();
    const z = window.setInterval(() => {
      const simdi = performance.now();
      zamanIlerlet(simdi - onceki);
      onceki = simdi;
      musteriDongusu(simdi);
    }, 250);
    return () => window.clearInterval(z);
  }, []);

  return (
    <div className="oyun">
      <Sahne />
      <Arayuz />
    </div>
  );
}
