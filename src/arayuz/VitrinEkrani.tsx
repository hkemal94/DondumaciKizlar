import { otomatikVitrinSec, useDurum, vitrinDegistir } from '../oyun/durum';
import { CESITLER } from '../oyun/kuvetler';
import { m, type MetinAnahtari } from '../metinler';

// Gün başında vitrin seçimi (Kemal, 14 Ekim): açık çeşitlerden hangileri
// bugün küvette olacak. Elle seçilir ya da "Otomatik" denir; otomatikte her
// sabah dünün en çok satanları ve bir yeni çeşit gelir.
export function VitrinEkrani({ kapat }: { kapat: () => void }) {
  const durum = useDurum();
  const dolu = durum.vitrin.length >= durum.vitrinBoyu;
  return (
    <div className="gun-sonu-zemin">
      <div className="gelistir vitrin-ekrani" role="dialog" aria-labelledby="vitrin-baslik">
        <div className="gel-ust">
          <h2 id="vitrin-baslik">{m('vitrin.baslik')}</h2>
          <span className="vitrin-sayi">{m('vitrin.sayi', { sayi: durum.vitrin.length, boy: durum.vitrinBoyu })}</span>
        </div>

        <button
          className={`gel-secenek vitrin-otomatik ${durum.otomatikVitrin ? 'secili' : ''}`}
          aria-pressed={durum.otomatikVitrin}
          onClick={() => otomatikVitrinSec(!durum.otomatikVitrin)}
        >
          <span className="gel-ad">
            <span className="vitrin-kutu" aria-hidden>
              {durum.otomatikVitrin ? '✓' : ''}
            </span>{' '}
            {m('vitrin.otomatik')}
          </span>
          <span className="gel-aciklama">{m('vitrin.otomatikAciklama')}</span>
        </button>

        <div className="gel-icerik">
          <p className="gel-not">{m('vitrin.elle')}</p>
          <div className="vitrin-izgara">
            {durum.acikCesitler.map((i) => {
              const c = CESITLER[i];
              const icinde = durum.vitrin.includes(i);
              return (
                <button
                  key={i}
                  className={`vitrin-cesit ${icinde ? 'secili' : ''}`}
                  aria-pressed={icinde}
                  disabled={!icinde && dolu}
                  onClick={() => vitrinDegistir(i)}
                >
                  <span className="gel-renk" style={{ background: c.renk }} aria-hidden />
                  {m(`cesit.${c.ad}` as MetinAnahtari)}
                </button>
              );
            })}
          </div>
          <p className="gel-not">{m('vitrin.not')}</p>
        </div>

        <div className="gel-alt">
          <span />
          <button className="dugme dugme-yeni-gun" onClick={kapat}>
            {m('vitrin.kapat')}
          </button>
        </div>
      </div>
    </div>
  );
}
