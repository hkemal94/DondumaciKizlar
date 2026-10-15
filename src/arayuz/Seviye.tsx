import { useEffect, useState } from 'react';
import { gerekenSeviye, seviyeBilgisi, type SeviyeTuru } from '../oyun/seviye';
import { useDurum, yetenekPuani, type Yenilik } from '../oyun/durum';
import { AYAR } from '../oyun/ayarlar';
import { CESITLER } from '../oyun/kuvetler';
import { m, type MetinAnahtari } from '../metinler';

// Deneyim ve seviyeler (belge 0.12, 8. adım): üstte seviye rozeti (dokununca
// üç seviyenin ilerlemesi), seviye atlayınca kısa parlama, gün sonunda
// "YENİ!" listesi ve kilitli şeylerde "Dükkân seviyesi N gerekli".

const TURLER: SeviyeTuru[] = ['ana', 'dukkan', 'calisan'];

function Cubuk({ tur, exp }: { tur: SeviyeTuru; exp: number }) {
  const b = seviyeBilgisi(tur, exp);
  return (
    <div className="seviye-satir">
      <span className="seviye-ad">
        {m(`seviye.${tur}` as MetinAnahtari)} <b>{b.seviye}</b>
      </span>
      <span className="seviye-cubuk" aria-hidden>
        <span style={{ width: `${(b.ilerleme / b.esik) * 100}%` }} />
      </span>
      <span className="seviye-sayi">
        {Math.floor(b.ilerleme)} / {b.esik}
      </span>
    </div>
  );
}

export function SeviyeRozeti() {
  const durum = useDurum();
  const [acik, setAcik] = useState(false);
  const ana = seviyeBilgisi('ana', durum.exp.ana);
  return (
    <div className="seviye-rozet-kap">
      <button className="bilgi-kutusu seviye-rozet" aria-expanded={acik} aria-label={m('seviye.baslik')} onClick={() => setAcik(!acik)}>
        <span className="seviye-rozet-yazi">{m('seviye.kisa', { seviye: ana.seviye })}</span>
        <span className="seviye-rozet-cubuk" aria-hidden>
          <span style={{ width: `${(ana.ilerleme / ana.esik) * 100}%` }} />
        </span>
      </button>
      {acik && (
        <div className="seviye-panel" role="dialog" aria-label={m('seviye.baslik')}>
          {TURLER.map((t) => (
            <Cubuk key={t} tur={t} exp={durum.exp[t]} />
          ))}
          <div className="seviye-satir">{m('seviye.puan', { puan: yetenekPuani(durum) })}</div>
          <p className="gel-not">{m('seviye.not')}</p>
        </div>
      )}
    </div>
  );
}

// Seviye atlayınca ekranın üstünde kısa parlama (servisi bölmez)
export function SeviyeParlamasi() {
  const { seviyeParlama } = useDurum();
  const [gorunen, setGorunen] = useState<number | null>(null);
  useEffect(() => {
    if (!seviyeParlama) return;
    setGorunen(seviyeParlama.seviye);
    const z = window.setTimeout(() => setGorunen(null), 2600);
    return () => window.clearTimeout(z);
  }, [seviyeParlama]);
  if (gorunen === null) return null;
  return (
    <div className="seviye-parlama" key={gorunen} aria-live="polite">
      {m('seviye.atladi', { seviye: gorunen })}
    </div>
  );
}

// Kilitli şeyin adı (gün sonu listesinde)
function kilitAdi(anahtar: string) {
  const [tur, ...geri] = anahtar.split('.');
  const id = geri.join('.');
  if (tur === 'esya') return m(`esya.${id}` as MetinAnahtari);
  if (tur === 'isik') return m(`dekor.isik.${id}` as MetinAnahtari);
  if (tur === 'gorunus') return m(`gorunus.${id}` as MetinAnahtari);
  if (tur === 'tabela') return m(`tabela.${id}` as MetinAnahtari);
  if (tur === 'parca') return m(`insaat.parca.${id}` as MetinAnahtari);
  if (tur === 'vitrin') return m('seviye.vitrin', { boy: id });
  if (tur === 'icecek') return m(`icecek.${id}` as MetinAnahtari);
  if (tur === 'cesit') {
    const c = CESITLER.find((x) => x.ad === id);
    return c ? m(`cesit.${c.ad}` as MetinAnahtari) : id;
  }
  return anahtar;
}

// Uzun liste: ilk altısı ve "ve N tane daha"
function kisaListe(adlar: string[]) {
  const EN_COK = 6;
  return adlar.length <= EN_COK ? adlar.join(', ') : m('seviye.dahaFazla', { liste: adlar.slice(0, EN_COK).join(', '), sayi: adlar.length - EN_COK });
}

// Gün sonu: bugün atlanan seviyeler, ödüller ve açılanlar
export function GunYenilikleri({ yenilikler }: { yenilikler: Yenilik[] }) {
  if (yenilikler.length === 0) return null;
  const seviyeSatirlari = yenilikler.filter((y) => y.tur === 'seviye');
  const jeton = yenilikler.reduce((t, y) => t + (y.tur === 'jeton' ? y.miktar : 0), 0);
  const hediyeler = yenilikler.filter((y) => y.tur === 'hediye');
  const kilitler = yenilikler.filter((y) => y.tur === 'kilit');
  const calisanSeviyesi = seviyeSatirlari.filter((y) => y.seviyeTuru === 'calisan').length;
  // Aynı türden birden çok seviye: yalnız en sonuncusu
  const sonSeviyeler = TURLER.map((t) => seviyeSatirlari.filter((y) => y.seviyeTuru === t).pop()).filter((y) => !!y);
  return (
    <div className="gun-yenilikler">
      <div className="gun-yeni-baslik">{m('seviye.yeni')}</div>
      <ul>
        {sonSeviyeler.map((y) => (
          <li key={y.seviyeTuru}>{m('seviye.satir', { ad: m(`seviye.${y.seviyeTuru}` as MetinAnahtari), seviye: y.seviye })}</li>
        ))}
        {/* Çalışan seviye atladıysa kazanılan yetenek puanı (8b) */}
        {calisanSeviyesi > 0 && <li>{m('seviye.yetenekPuani', { puan: calisanSeviyesi * AYAR.yetenek.puanSeviyeBasina })}</li>}
        {jeton > 0 && (
          <li>
            {m('seviye.odul')} <span className="para-simge" aria-hidden /> {jeton}
          </li>
        )}
        {hediyeler.map((h, i) => (
          <li key={i}>{m('seviye.hediye', { ad: m(`esya.${h.esya}` as MetinAnahtari) })}</li>
        ))}
        {kilitler.length > 0 && <li>{m('seviye.acilanlar', { liste: kisaListe(kilitler.map((k) => kilitAdi(k.anahtar))) })}</li>}
      </ul>
    </div>
  );
}

// Kilitli satın almada düğme yerine
// kisa: dar kartlarda (eşya, görünüş) yalnız "Sv. N"
export function Kilit({ anahtar, seviye, kisa }: { anahtar?: string; seviye?: number; kisa?: boolean }) {
  const s = seviye ?? gerekenSeviye(anahtar ?? '');
  return (
    <span className="gel-durum gel-kilit seviye-kilit" title={m('seviye.gerekli', { seviye: s })}>
      {m(kisa ? 'seviye.gerekliKisa' : 'seviye.gerekli', { seviye: s })}
    </span>
  );
}

