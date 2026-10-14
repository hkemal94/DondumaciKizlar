import { m, type MetinAnahtari } from '../metinler';

// Gün başı menüsü (Kemal, 14 Ekim: "menü sistemi yok, her şey ortada"):
// işler tek şeritte, küçük simge ve kısa adla. İnşaat 14 Ekim'de eklendi.
export type MenuIsi = 'gelistir' | 'vitrin' | 'yerlestir' | 'insaat' | 'calisan' | 'yardimci';

function Simge({ is }: { is: MenuIsi }) {
  const ortak = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (is === 'gelistir')
    // Tenteli dükkân
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M3 9 L5 4 H19 L21 9" {...ortak} />
        <path d="M3 9 Q6 12 9 9 Q12 12 15 9 Q18 12 21 9" {...ortak} />
        <path d="M5 11 V20 H19 V11" {...ortak} />
        <path d="M10 20 V15 H14 V20" {...ortak} />
      </svg>
    );
  if (is === 'vitrin')
    // Küvette dondurma
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M6 12 Q6 6 12 6 Q18 6 18 12" {...ortak} />
        <path d="M3 12 H21 L19 19 H5 Z" {...ortak} />
      </svg>
    );
  if (is === 'yerlestir')
    // Sandalye
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M7 3 V13 H17" {...ortak} />
        <path d="M7 13 V21 M17 13 V21 M7 17 H17" {...ortak} />
      </svg>
    );
  if (is === 'insaat')
    // Kare kare arazi ve çekiç
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M3 3 H11 V11 H3 Z M13 13 H21 V21 H13 Z" {...ortak} />
        <path d="M13 3 H21 V11 H13 Z M3 13 H11 V21 H3 Z" {...ortak} strokeDasharray="2 2" />
      </svg>
    );
  if (is === 'yardimci')
    // İki kişi
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="9" cy="8" r="3.2" {...ortak} />
        <circle cx="16.5" cy="9" r="2.6" {...ortak} />
        <path d="M3 20 Q3 14 9 14 Q15 14 15 20" {...ortak} />
        <path d="M14 15 Q20 13.5 21 19" {...ortak} />
      </svg>
    );
  // Çalışan
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="4" {...ortak} />
      <path d="M4 21 Q4 14 12 14 Q20 14 20 21" {...ortak} />
    </svg>
  );
}

export function MenuSeridi({ sec }: { sec: (is: MenuIsi) => void }) {
  return (
    <nav className="menu-seridi" aria-label={m('menu.baslik')}>
      {(['gelistir', 'vitrin', 'yerlestir', 'insaat', 'calisan', 'yardimci'] as const).map((is) => (
        <button key={is} className="menu-dugme" data-egitim={is} onClick={() => sec(is)}>
          <Simge is={is} />
          <span>{m(`menu.${is}` as MetinAnahtari)}</span>
        </button>
      ))}
    </nav>
  );
}
