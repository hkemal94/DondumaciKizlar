import { Sahne } from './sahne/Sahne';
import { m } from './metinler';

export function Uygulama() {
  return (
    <div className="oyun">
      <Sahne />
      <div className="iskelet-etiketi">{m('iskelet.etiket')}</div>
      {/* Telefon dik tutulunca çıkar (yalnız CSS ile) */}
      <div className="yon-uyarisi">
        <div className="yon-simge" aria-hidden>
          ⟳
        </div>
        <div className="yon-baslik">{m('yon.cevir')}</div>
        <div className="yon-aciklama">{m('yon.aciklama')}</div>
      </div>
    </div>
  );
}
