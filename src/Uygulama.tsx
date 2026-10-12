import { Sahne } from './sahne/Sahne';
import { m } from './metinler';
import { Arayuz } from './arayuz/Arayuz';

// Oyun her zaman yatay görünür. Telefon dik tutuluyorsa (ekran döndürme
// kilidi açık olabilir) bütün oyun ekranda 90° çevrilir; oyuncu telefonu
// yana yatırınca oyun düz durur. Çevirme yalnız stil.css'te.
export function Uygulama() {
  return (
    <div className="oyun">
      <Sahne />
      <Arayuz />
      <div className="iskelet-etiketi">{m('iskelet.etiket')}</div>
    </div>
  );
}
