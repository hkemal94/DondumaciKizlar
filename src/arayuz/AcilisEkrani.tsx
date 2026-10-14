import { useState } from 'react';
import { denemeDukkani, kayitVar, kayittanDevamEt, yeniOyun } from '../oyun/durum';
import { m } from '../metinler';
import { logoAdresi } from '../sahne/logo';

// Açılış ekranı (Kemal, 14 Ekim; belge 0.8): arkada dükkânın sakin genel
// görünümü, önde külahlı logo. Kayıt varsa Devam et öne çıkar; Yeni oyun
// kayıtlı dükkânı silmeden önce sorar. Deneme dükkânı yayına kadar durur.
export function AcilisEkrani({ ayarlar }: { ayarlar: () => void }) {
  const [kayit] = useState(kayitVar);
  const [soruyor, setSoruyor] = useState(false);
  if (soruyor)
    return (
      <div className="acilis">
        <img className="acilis-logo" src={logoAdresi('kulahli')} alt={m('acilis.logo')} />
        <div className="acilis-dugmeler">
          <p className="acilis-soru">{m('acilis.yeniSoru')}</p>
          <button className="dugme dugme-servis" onClick={yeniOyun}>
            {m('acilis.evet')}
          </button>
          <button className="dugme" onClick={() => setSoruyor(false)}>
            {m('acilis.vazgec')}
          </button>
        </div>
      </div>
    );
  return (
    <div className="acilis">
      <img className="acilis-logo" src={logoAdresi('kulahli')} alt={m('acilis.logo')} />
      <div className="acilis-dugmeler">
        {kayit && (
          <button className="dugme dugme-servis acilis-oyna" onClick={kayittanDevamEt}>
            {m('acilis.devam')}
          </button>
        )}
        <button className={`dugme ${kayit ? '' : 'dugme-servis acilis-oyna'}`} onClick={() => (kayit ? setSoruyor(true) : yeniOyun())}>
          {m('acilis.yeni')}
        </button>
        <button className="dugme acilis-deneme" onClick={denemeDukkani}>
          {m('acilis.deneme')}
        </button>
        <button className="dugme" onClick={ayarlar}>
          {m('acilis.ayarlar')}
        </button>
      </div>
    </div>
  );
}
