import { useEffect, useRef } from 'react';
import { egitimiAtla, ilkSiparisEgitimi, ondekiMusteri, tepsiyeKoyabilir, useDurum, type Durum } from '../oyun/durum';
import { m } from '../metinler';

// Yazısız eğitim (Kemal, 14 Ekim): yanıp sönen bir el, dokunulacak yeri
// gösterir. İlk sipariş üç adım (altlık → küvete basılı tut → servis et),
// sonra ilk kez görülenlerde birer işaret (süsleme, tepsi, vitrin).

// Küvet hedefinde elin yerini sahne (3B) her karede yazar
export const egitimEli: { oge: HTMLDivElement | null; kuvet: number | null } = { oge: null, kuvet: null };

type Hedef = { tur: 'dugme'; ad: string; hareket: 'dokun' } | { tur: 'kuvet'; cesit: number; hareket: 'basiliTut' };

export function egitimHedefi(d: Durum, vitrinAcik: boolean): Hedef | null {
  const musteri = ondekiMusteri(d);
  if (d.duraklatildi || d.gunSonu || d.gezme || d.yerlestirme) return null;
  if (ilkSiparisEgitimi(d) && musteri) {
    const s = musteri.siparis;
    if (d.kamera !== 'tezgah') return { tur: 'dugme', ad: 'tezgah', hareket: 'dokun' };
    if (d.asama === 'servis') return null;
    if (!d.altlik || d.altlik !== s.altlik) return { tur: 'dugme', ad: `altlik-${s.altlik}`, hareket: 'dokun' };
    // Yanlış çeşit konduysa önce geri al
    const kalan = [...s.kuvetler];
    for (const t of d.toplar) {
      const i = kalan.indexOf(t.kuvet);
      if (i < 0) return { tur: 'dugme', ad: 'geriAl', hareket: 'dokun' };
      kalan.splice(i, 1);
    }
    if (kalan.length > 0) return { tur: 'kuvet', cesit: kalan[0], hareket: 'basiliTut' };
    return { tur: 'dugme', ad: 'servis', hareket: 'dokun' };
  }
  if (!ilkSiparisEgitimi(d) && musteri && d.kamera === 'tezgah') {
    const s = musteri.siparis;
    // İlk süslemeli sipariş: toplar tamamken eksik süslemeyi göster
    if (!d.egitimGoruldu.includes('susleme') && d.asama === 'kepceBos' && d.toplar.length === s.kuvetler.length && !s.ikinci) {
      const eksik = s.susleme.find((x) => !d.susleme.includes(x));
      if (eksik) return { tur: 'dugme', ad: `susleme-${eksik}`, hareket: 'dokun' };
    }
    if (!d.egitimGoruldu.includes('tepsi') && tepsiyeKoyabilir(d)) return { tur: 'dugme', ad: 'tepsi', hareket: 'dokun' };
  }
  // İkinci günden itibaren sabah: vitrin seçimi
  if (!d.egitimGoruldu.includes('vitrin') && d.hazirlik && d.gun >= 2 && !vitrinAcik && d.kamera === 'dukkan')
    return { tur: 'dugme', ad: 'vitrin', hareket: 'dokun' };
  return null;
}

// Hedef ekranın altına yakınsa el ters döner, yukarıdan gösterir
export const EL_BOYU = 72;

// Düğmenin arayüz içindeki yeri (ekran çevrilse de doğru: dönüşümden önceki düzen)
function arayuzdekiYer(oge: HTMLElement, kok: HTMLElement) {
  let x = 0;
  let y = 0;
  let e: HTMLElement | null = oge;
  while (e && e !== kok) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return { x: x + oge.offsetWidth / 2, y: y + oge.offsetHeight * 0.62 };
}

export function EgitimEli({ vitrinAcik }: { vitrinAcik: boolean }) {
  const durum = useDurum();
  const hedef = egitimHedefi(durum, vitrinAcik);
  const ref = useRef<HTMLDivElement>(null);
  const anahtar = hedef ? (hedef.tur === 'kuvet' ? `kuvet-${hedef.cesit}` : hedef.ad) : '';

  // Küvet hedefini sahneye bildir
  useEffect(() => {
    egitimEli.kuvet = hedef?.tur === 'kuvet' ? hedef.cesit : null;
    return () => {
      egitimEli.kuvet = null;
    };
  }, [anahtar, hedef]);

  // Düğme hedefi: yerini her karede ölç (düğmeler belirip kaybolabiliyor)
  useEffect(() => {
    if (!hedef || hedef.tur !== 'dugme') return;
    let kare = 0;
    const olc = () => {
      const el = ref.current;
      const kok = el?.parentElement;
      const dugme = kok?.querySelector<HTMLElement>(`[data-egitim="${hedef.ad}"]`);
      if (el && kok && dugme) {
        const { x, y } = arayuzdekiYer(dugme, kok);
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.classList.toggle('asagi', y > kok.offsetHeight - EL_BOYU);
        el.style.opacity = '1';
      } else if (el) el.style.opacity = '0';
      kare = requestAnimationFrame(olc);
    };
    olc();
    return () => cancelAnimationFrame(kare);
  }, [anahtar, hedef]);

  if (!hedef) return null;
  return (
    <>
      <div
        className={`egitim-el ${hedef.hareket}`}
        ref={(oge) => {
          ref.current = oge;
          egitimEli.oge = oge;
        }}
        aria-hidden
      >
        <span className="egitim-halka" />
        <span className="egitim-cevir">
        <svg viewBox="0 0 48 60" className="egitim-parmak">
          {/* İşaret parmağı yukarıda, uç noktası (0,0) hedefte */}
          <path
            d="M18 4 C18 0.5 24 0.5 24 4 L24 26 L26 25 C26 21 32 21 32 25 L32 27 C33 23.5 39 24 39 28 L39 30 C40 27 46 27.5 46 31.5 L46 42 C46 52 39 58 30 58 L24 58 C17 58 13 54 9 47 L3.5 37 C1.5 33.5 5.5 30 9 33 L18 41 Z"
            fill="#fffaf0"
            stroke="#3a2350"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
        </svg>
        </span>
      </div>
      <button className="dugme egitim-gec" onClick={egitimiAtla}>
        {m('egitim.gec')}
      </button>
    </>
  );
}
