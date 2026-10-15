import { useState } from 'react';
import { kayitKodunuYukle, kayitKoduUret } from '../oyun/kayitKodu';
import { kayittanDevamEt, kayitVar } from '../oyun/durum';
import { m } from '../metinler';

// Kayıt kodu ekranı (belge 0.14): bu cihazdaki dükkânı başka cihaza taşı ya da
// başka cihazdan gelen kodu yükle. Kod uzun: kopyalayıp kendine mesajla gönder.
export function KayitKoduEkrani({ kapat }: { kapat: () => void }) {
  const [kod, setKod] = useState<string | null>(null);
  const [gelen, setGelen] = useState('');
  const [soruyor, setSoruyor] = useState(false);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const kayit = kayitVar();
  const uret = async () => setKod(await kayitKoduUret());
  const kopyala = async () => {
    if (!kod) return;
    try {
      await navigator.clipboard.writeText(kod);
      setBilgi(m('kod.kopyalandi'));
    } catch {
      setBilgi(m('kod.kopyalanamadi'));
    }
  };
  const paylas = async () => {
    if (!kod) return;
    try {
      await navigator.share({ text: kod });
    } catch {
      // vazgeçildi ya da desteklenmiyor
    }
  };
  const yukle = async () => {
    try {
      await kayitKodunuYukle(gelen);
      kayittanDevamEt();
    } catch {
      setSoruyor(false);
      setBilgi(m('kod.bozuk'));
    }
  };
  return (
    <div className="gun-sonu-zemin">
      <div className="gun-sonu kayit-kodu" role="dialog" aria-labelledby="kod-baslik">
        <button className="gun-sonu-kapat" aria-label={m('kod.kapat')} onClick={kapat}>
          ×
        </button>
        <h2 id="kod-baslik">{m('kod.baslik')}</h2>
        <div className="kod-ikili">
          <section>
            <div className="gel-baslik">{m('kod.gonder')}</div>
            {!kayit ? (
              <p className="gel-not">{m('kod.kayitYok')}</p>
            ) : kod ? (
              <>
                <textarea readOnly value={kod} onFocus={(e) => e.currentTarget.select()} />
                <div className="kod-dugmeler">
                  <button className="dugme gel-al" onClick={kopyala}>
                    {m('kod.kopyala')}
                  </button>
                  {typeof navigator.share === 'function' && (
                    <button className="dugme gel-al" onClick={paylas}>
                      {m('kod.paylas')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button className="dugme gel-al" onClick={uret}>
                {m('kod.olustur')}
              </button>
            )}
          </section>
          <section>
            <div className="gel-baslik">{m('kod.al')}</div>
            <textarea placeholder={m('kod.yapistir')} value={gelen} onChange={(e) => setGelen(e.target.value)} />
            {soruyor ? (
              <div className="kod-dugmeler">
                <span className="gel-not">{m('kod.uyari')}</span>
                <button className="dugme dugme-servis" onClick={yukle}>
                  {m('kod.evet')}
                </button>
                <button className="dugme" onClick={() => setSoruyor(false)}>
                  {m('acilis.vazgec')}
                </button>
              </div>
            ) : (
              <button className="dugme gel-al" disabled={!gelen.trim()} onClick={() => setSoruyor(true)}>
                {m('kod.yukle')}
              </button>
            )}
          </section>
        </div>
        {bilgi && <p className="gel-not">{bilgi}</p>}
        <p className="gel-not">{m('kod.not')}</p>
      </div>
    </div>
  );
}
