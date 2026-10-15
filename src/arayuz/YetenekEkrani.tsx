import { seviyeBilgisi } from '../oyun/seviye';
import { useDurum, yetenekAl, yetenekAlinabilir, yetenekPuani } from '../oyun/durum';
import { EN_COK_BASAMAK, YETENEKLER, basamakBedeli, yetenekEtkisi, type Yetenek } from '../oyun/yetenek';
import { AYAR } from '../oyun/ayarlar';
import { m, type MetinAnahtari } from '../metinler';
import { logoAdresi } from '../sahne/logo';

// Çalışanın yetenek ağacı (belge 0.12, 8b; Kemal'in taslağındaki "tarif
// ağacı" gibi): her satır bir yetenek, üç basamak sırayla alınır. Puan
// çalışanın seviyesinden gelir; alınan basamak hemen etki eder.

function etkiYazisi(y: Yetenek, basamak: number) {
  const oran = Math.round(yetenekEtkisi(y, basamak) * 100);
  const yazi = m(`yetenek.${y}.etki` as MetinAnahtari, { oran });
  return y === 'gulerYuz' && basamak === AYAR.yetenek.gulerYuzErkenBasamak ? `${yazi} · ${m('yetenek.erken')}` : yazi;
}

export function YetenekEkrani({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const puan = yetenekPuani(durum);
  const cal = seviyeBilgisi('calisan', durum.exp.calisan);
  return (
    <div className="gun-sonu-zemin sag-zemin">
      <div className="gun-sonu yetenek-ekrani" role="dialog" aria-labelledby="yetenek-baslik">
        <div className="yetenek-ust">
          <img className="baslik-logo" src={logoAdresi('yazi')} alt="" aria-hidden />
          <h2 id="yetenek-baslik">{m('yetenek.baslik')}</h2>
          <span className={`yetenek-puan ${puan > 0 ? 'var' : ''}`}>{m('yetenek.puan', { puan })}</span>
          <button className="dugme dugme-yeni-gun" onClick={kapat}>
            {m('yetenek.kapat')}
          </button>
        </div>
        <div className="yetenek-seviye">
          <span>{m('seviye.satir', { ad: m('seviye.calisan'), seviye: cal.seviye })}</span>
          <span className="seviye-cubuk" aria-hidden>
            <span style={{ width: `${(cal.ilerleme / cal.esik) * 100}%` }} />
          </span>
          <span className="seviye-sayi">
            {Math.floor(cal.ilerleme)} / {cal.esik}
          </span>
        </div>
        <div className="yetenek-agac">
          {YETENEKLER.map((y) => {
            const alinan = durum.yetenekler[y];
            return (
              <div key={y} className="yetenek-satir">
                <div className="yetenek-ad">
                  <b>{m(`yetenek.${y}` as MetinAnahtari)}</b>
                  <span>{m(`yetenek.${y}.aciklama` as MetinAnahtari)}</span>
                </div>
                <div className="yetenek-basamaklar">
                  {Array.from({ length: EN_COK_BASAMAK }, (_, i) => i + 1).map((b) => {
                    const alindi = b <= alinan;
                    const siradaki = b === alinan + 1;
                    const alinabilir = siradaki && yetenekAlinabilir(y, durum);
                    return (
                      <button
                        key={b}
                        className={`yetenek-dugum ${alindi ? 'alindi' : alinabilir ? 'alinabilir' : ''}`}
                        disabled={!alinabilir}
                        aria-label={`${m(`yetenek.${y}` as MetinAnahtari)} ${b}`}
                        onClick={() => yetenekAl(y)}
                      >
                        <span className="yetenek-etki">
                          <b>{b}</b> · {etkiYazisi(y, b)}
                        </span>
                        <span className="yetenek-bedel">{alindi ? m('yetenek.alindi') : m('yetenek.bedel', { puan: basamakBedeli(b) })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <p className="gel-not">{m('yetenek.not')}</p>
      </div>
    </div>
  );
}
