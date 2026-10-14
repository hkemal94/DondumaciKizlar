import { m, type MetinAnahtari } from '../metinler';

// Gün başı menüsü (Kemal, 14 Ekim: "menü sistemi yok, her şey ortada"):
// dört iş tek şeritte, küçük simge ve kısa adla.
export type MenuIsi = 'gelistir' | 'vitrin' | 'yerlestir' | 'calisan';

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
      {(['gelistir', 'vitrin', 'yerlestir', 'calisan'] as const).map((is) => (
        <button key={is} className="menu-dugme" data-egitim={is} onClick={() => sec(is)}>
          <Simge is={is} />
          <span>{m(`menu.${is}` as MetinAnahtari)}</span>
        </button>
      ))}
    </nav>
  );
}
