import { useState } from 'react';
import { OYUNCU_ADI_EN_UZUN, denemeDukkani, kayitVar, kayittanDevamEt, oyuncuAdiniDegistir, useDurum, yeniOyun } from '../oyun/durum';
import { seviyeBilgisi } from '../oyun/seviye';
import { YENILIKLER } from '../oyun/yenilikler';
import { KayitKoduEkrani } from './KayitKodu';
import type { MetinAnahtari } from '../metinler';
import { m } from '../metinler';
import { logoAdresi } from '../sahne/logo';
import { Galeri } from './Galeri';
import { tamEkraniDegistir, tamEkranVar, useTamEkran } from './tamEkran';
import { bulutCikis, bulutHazir, googleIleBaglan, secimiUygula, useBulut } from '../oyun/bulut';

// Açılış ekranı (Kemal, 14 Ekim; belge 0.8): arkada dükkânın sakin genel
// görünümü, önde külahlı logo. Kayıt varsa Devam et öne çıkar; Yeni oyun
// kayıtlı dükkânı silmeden önce sorar. Deneme dükkânı yayına kadar durur.
// 5. adımdan beri (belge 0.12) arkada oyuncunun kendi dükkânı gün batımında,
// kamera yavaşça döner (Sahne.tsx); Galeri buradan da açılır.
export function AcilisEkrani({ ayarlar }: { ayarlar: () => void }) {
  // Kayıt buluttan gelebilir: her çizimde yeniden bakılır
  useDurum();
  useBulut();
  const kayit = kayitVar();
  const [soruyor, setSoruyor] = useState(false);
  const [galeri, setGaleri] = useState(false);
  const [yenilikler, setYenilikler] = useState(false);
  const [kodAcik, setKodAcik] = useState(false);
  const tamEkran = useTamEkran();
  if (galeri) return <Galeri kapat={() => setGaleri(false)} />;
  if (yenilikler) return <YeniliklerEkrani kapat={() => setYenilikler(false)} />;
  if (kodAcik) return <KayitKoduEkrani kapat={() => setKodAcik(false)} />;
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
        {kayit && (
          <button className="dugme" onClick={() => setGaleri(true)}>
            {m('acilis.galeri')}
          </button>
        )}
        <button className="dugme" onClick={ayarlar}>
          {m('acilis.ayarlar')}
        </button>
        {tamEkranVar() && (
          <button className="dugme" onClick={() => void tamEkraniDegistir()}>
            {m(tamEkran ? 'duraklat.tamEkrandanCik' : 'duraklat.tamEkran')}
          </button>
        )}
        <div className="acilis-ikili">
          <button className="dugme" onClick={() => setYenilikler(true)}>
            {m('acilis.yenilikler')}
          </button>
          <button className="dugme" onClick={() => setKodAcik(true)}>
            {m('kod.baslik')}
          </button>
        </div>
      </div>
      <Kunye />
      {(kayit || bulutHazir) && <OyuncuKarti kayit={kayit} />}
    </div>
  );
}

// Künye (belge 0.14, 0.16): sol altta Kemal'in etiketi (21 Ekim). Yıl cihazın
// saatinden, her yıl kendiliğinden değişir
function Kunye() {
  return (
    <div className="acilis-kunye">
      <b>{m('kunye.ad')}</b>
      <span>{m('kunye.yer', { yil: new Date().getFullYear() })}</span>
    </div>
  );
}

// Oyuncu kartı (belge 0.14): takma ad (dokununca değişir), ID, dükkân seviyesi ve gün
function OyuncuKarti({ kayit }: { kayit: boolean }) {
  const durum = useDurum();
  const bulut = useBulut();
  const [duzenle, setDuzenle] = useState(false);
  const dukkan = seviyeBilgisi('dukkan', durum.exp.dukkan).seviye;
  return (
    <div className="acilis-oyuncu">
      {duzenle ? (
        <input
          className="yardimci-ad"
          autoFocus
          maxLength={OYUNCU_ADI_EN_UZUN}
          placeholder={m('oyuncu.adYaz')}
          value={durum.oyuncuAdi}
          onChange={(e) => oyuncuAdiniDegistir(e.target.value)}
          onBlur={() => setDuzenle(false)}
          onKeyDown={(e) => e.key === 'Enter' && setDuzenle(false)}
        />
      ) : !kayit ? null : (
        <button className="acilis-oyuncu-ad" onClick={() => setDuzenle(true)}>
          {durum.oyuncuAdi || m('oyuncu.adsiz')} <span aria-hidden>✎</span>
        </button>
      )}
      {kayit && <span className="acilis-oyuncu-id">{durum.oyuncuId}</span>}
      {kayit && <span>{m('oyuncu.ozet', { seviye: dukkan, gun: durum.gun })}</span>}
      {/* Hesap ve bulut kayıt (paket E): Google ile bağlanınca dükkân bulutta da durur */}
      {bulutHazir &&
        (bulut.kullanici ? (
          <span className="acilis-bulut">
            ☁ {m('bulut.bagli')}{' '}
            <button className="acilis-bulut-dugme" onClick={() => void bulutCikis()}>
              {m('bulut.cikis')}
            </button>
          </span>
        ) : (
          <button className="acilis-bulut-dugme" disabled={bulut.hazirlaniyor} onClick={() => void googleIleBaglan()}>
            ☁ {m(bulut.hazirlaniyor ? 'bulut.baglaniyor' : 'bulut.baglan')}
          </button>
        ))}
      {bulut.hata && <span className="acilis-bulut-hata">{m(`bulut.hata.${bulut.hata}` as MetinAnahtari)}</span>}
    </div>
  );
}

function YeniliklerEkrani({ kapat }: { kapat: () => void }) {
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu yenilikler-ekrani" role="dialog" aria-labelledby="yenilik-baslik">
        <h2 id="yenilik-baslik">{m('acilis.yenilikler')}</h2>
        <ul>
          {YENILIKLER.map((y) => (
            <li key={y.anahtar}>
              <span className="yenilik-tarih">{y.tarih}</span> {m(`yenilik.${y.anahtar}` as MetinAnahtari)}
            </li>
          ))}
        </ul>
        <button className="dugme dugme-yeni-gun" onClick={kapat}>
          {m('acilis.vazgec')}
        </button>
      </div>
    </div>
  );
}

// Bulut ile bu cihaz farklıysa (paket E): hangi dükkân kalsın
export function BulutSecimi() {
  const { secim } = useBulut();
  if (!secim) return null;
  const satir = (o: { gun: number; para: number }) => m('bulut.ozet', { gun: o.gun, para: o.para });
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu bulut-secimi" role="dialog" aria-labelledby="bulut-baslik">
        <h2 id="bulut-baslik">{m('bulut.secimBaslik')}</h2>
        <p className="gel-not">{m('bulut.secimNot')}</p>
        <div className="gun-sonu-dugmeler">
          <button className="dugme" onClick={() => void secimiUygula('cihaz')}>
            {m('bulut.cihazdaki')}
            <small>{satir(secim.cihaz)}</small>
          </button>
          <button className="dugme dugme-yeni-gun" onClick={() => void secimiUygula('bulut')}>
            {m('bulut.buluttaki')}
            <small>{satir(secim.bulut)}</small>
          </button>
        </div>
      </div>
    </div>
  );
}
