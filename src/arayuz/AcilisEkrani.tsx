import { acilisiKapat } from '../oyun/durum';
import { m } from '../metinler';
import { logoAdresi } from '../sahne/logo';

// Açılış ekranı (Kemal, 14 Ekim): arkada dükkânın sakin genel görünümü,
// önde külahlı logo, Oyna ve Ayarlar.
export function AcilisEkrani({ ayarlar }: { ayarlar: () => void }) {
  return (
    <div className="acilis">
      <img className="acilis-logo" src={logoAdresi('kulahli')} alt={m('acilis.logo')} />
      <div className="acilis-dugmeler">
        <button className="dugme dugme-servis acilis-oyna" onClick={acilisiKapat}>
          {m('acilis.oyna')}
        </button>
        <button className="dugme" onClick={ayarlar}>
          {m('acilis.ayarlar')}
        </button>
      </div>
    </div>
  );
}
