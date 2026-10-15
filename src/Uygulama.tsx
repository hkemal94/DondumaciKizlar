import { Sahne } from './sahne/Sahne';
import { useEffect } from 'react';
import { Arayuz } from './arayuz/Arayuz';
import { SesOlaylari } from './ses/SesOlaylari';
import { kaydiYukle, musteriDongusu, zamanIlerlet } from './oyun/durum';
import { bulutuBaslat } from './oyun/bulut';

// Önceki oyunun kaydı varsa oradan devam edilir.
kaydiYukle();
// Google'a bağlanılmışsa oturum gelir, bulut ile karşılaştırılır (paket E)
bulutuBaslat();

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
      <SesOlaylari />
    </div>
  );
}
