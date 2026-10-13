// Oyunun sesleri (Kemal, 13 Ekim). Hepsi kodla üretilir; dışarıdan dosya
// yok, lisans gerekmez. Telefonlar dokunmadan ses çaldırmadığı için ses
// ilk dokunuşta açılır. Müzik geçici: Kemal'in müziği gelince yerini alır.

export interface SesAyari {
  muzik: number; // 0–100
  efekt: number; // 0–100
}

const AYAR_ANAHTARI = 'dondurmaci-kizlar-ses';

export function sesAyariniOku(): SesAyari {
  try {
    const k = JSON.parse(localStorage.getItem(AYAR_ANAHTARI) ?? '{}') as Partial<SesAyari>;
    return { muzik: k.muzik ?? 60, efekt: k.efekt ?? 80 };
  } catch {
    return { muzik: 60, efekt: 80 };
  }
}

let ayar = sesAyariniOku();
let ctx: AudioContext | null = null;
let muzikKazanci: GainNode | null = null;
let efektKazanci: GainNode | null = null;
let denizKazanci: GainNode | null = null;

// Ayar çubukları: kaydedilir ve anında uygulanır
export function sesAyariniYaz(yeni: SesAyari) {
  ayar = yeni;
  try {
    localStorage.setItem(AYAR_ANAHTARI, JSON.stringify(yeni));
  } catch {
    // tarayıcı izin vermezse ayar yalnız bu açılışta geçerli
  }
  if (!ctx) return;
  muzikKazanci?.gain.setTargetAtTime((ayar.muzik / 100) * 0.5, ctx.currentTime, 0.1);
  efektKazanci?.gain.setTargetAtTime(ayar.efekt / 100, ctx.currentTime, 0.1);
}

// ---- Başlatma (ilk dokunuşta) ----
export function sesiBaslat() {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return;
  }
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  ctx = new Ctx();
  muzikKazanci = ctx.createGain();
  efektKazanci = ctx.createGain();
  muzikKazanci.gain.value = (ayar.muzik / 100) * 0.5;
  efektKazanci.gain.value = ayar.efekt / 100;
  muzikKazanci.connect(ctx.destination);
  efektKazanci.connect(ctx.destination);
  denizBaslat();
  muzikBaslat();
}

// Sekme arkaya geçince ses durur, dönünce devam eder
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });
}

function gurultu(saniye: number) {
  const c = ctx!;
  const tampon = c.createBuffer(1, Math.floor(c.sampleRate * saniye), c.sampleRate);
  const veri = tampon.getChannelData(0);
  let onceki = 0;
  for (let i = 0; i < veri.length; i++) {
    // Kahverengimsi gürültü: daha yumuşak, deniz gibi
    onceki = (onceki + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    veri[i] = onceki * 3.5;
  }
  return tampon;
}

// ---- Deniz ve rüzgâr: arkada sürekli ----
function denizBaslat() {
  const c = ctx!;
  denizKazanci = c.createGain();
  denizKazanci.gain.value = 0.35;
  denizKazanci.connect(efektKazanci!);

  const dalga = c.createBufferSource();
  dalga.buffer = gurultu(6);
  dalga.loop = true;
  const suzgec = c.createBiquadFilter();
  suzgec.type = 'lowpass';
  suzgec.frequency.value = 520;
  const dalgaKazanci = c.createGain();
  dalgaKazanci.gain.value = 0.5;
  // Dalgaların gelip gitmesi: yavaş salınım
  const salinim = c.createOscillator();
  salinim.frequency.value = 0.09;
  const salinimDerinligi = c.createGain();
  salinimDerinligi.gain.value = 0.35;
  salinim.connect(salinimDerinligi).connect(dalgaKazanci.gain);
  dalga.connect(suzgec).connect(dalgaKazanci).connect(denizKazanci);

  const ruzgar = c.createBufferSource();
  ruzgar.buffer = gurultu(5);
  ruzgar.loop = true;
  const ruzgarSuzgeci = c.createBiquadFilter();
  ruzgarSuzgeci.type = 'bandpass';
  ruzgarSuzgeci.frequency.value = 900;
  ruzgarSuzgeci.Q.value = 0.6;
  const ruzgarKazanci = c.createGain();
  ruzgarKazanci.gain.value = 0.06;
  ruzgar.connect(ruzgarSuzgeci).connect(ruzgarKazanci).connect(denizKazanci);

  dalga.start();
  ruzgar.start();
  salinim.start();
}

// Gece deniz sesi biraz kısılır (0 = gündüz, 1 = gece)
export function geceAyari(gece: number) {
  if (!ctx || !denizKazanci) return;
  denizKazanci.gain.setTargetAtTime(0.35 - gece * 0.17, ctx.currentTime, 1.5);
}

// ---- Kısa sesler ----
function ton(
  frekans: number,
  sure: number,
  { tur = 'sine', baslangic = 0, ses = 0.3, bitisFrekansi }: { tur?: OscillatorType; baslangic?: number; ses?: number; bitisFrekansi?: number } = {},
) {
  if (!ctx || !efektKazanci) return;
  const t = ctx.currentTime + baslangic;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tur;
  o.frequency.setValueAtTime(frekans, t);
  if (bitisFrekansi) o.frequency.exponentialRampToValueAtTime(bitisFrekansi, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(efektKazanci);
  o.start(t);
  o.stop(t + sure + 0.05);
}

function hisirti(sure: number, frekans: number, ses = 0.25, baslangic = 0) {
  if (!ctx || !efektKazanci) return;
  const t = ctx.currentTime + baslangic;
  const k = ctx.createBufferSource();
  k.buffer = gurultu(sure + 0.05);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = frekans;
  const g = ctx.createGain();
  g.gain.setValueAtTime(ses, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  k.connect(f).connect(g).connect(efektKazanci);
  k.start(t);
  k.stop(t + sure + 0.05);
}

export const sesler = {
  // Kepçe küvete dalar
  kepce() {
    hisirti(0.18, 500, 0.5);
    ton(140, 0.12, { tur: 'sine', ses: 0.25, bitisFrekansi: 90 });
  },
  // Top altlığa yerleşir
  top() {
    ton(320, 0.09, { ses: 0.3, bitisFrekansi: 190 });
  },
  mukemmel() {
    ton(1046, 0.35, { tur: 'triangle', ses: 0.18 });
    ton(1568, 0.45, { tur: 'triangle', ses: 0.14, baslangic: 0.08 });
  },
  iyi() {
    ton(784, 0.25, { tur: 'triangle', ses: 0.14 });
  },
  // Süsleme serpme: minik tıkırtılar
  susleme() {
    for (let i = 0; i < 7; i++) ton(2400 + Math.random() * 1600, 0.03, { tur: 'square', ses: 0.03, baslangic: i * 0.03 + Math.random() * 0.02 });
  },
  jeton() {
    ton(1568, 0.12, { tur: 'square', ses: 0.06 });
    ton(2093, 0.35, { tur: 'square', ses: 0.06, baslangic: 0.08 });
  },
  // Müşteri tezgaha gelince zil
  zil() {
    ton(1318, 0.9, { ses: 0.12 });
    ton(2637, 0.5, { ses: 0.04 });
  },
  sikildi() {
    ton(240, 0.45, { tur: 'triangle', ses: 0.15, bitisFrekansi: 150 });
  },
  yanlis() {
    ton(440, 0.15, { tur: 'triangle', ses: 0.12 });
    ton(330, 0.25, { tur: 'triangle', ses: 0.12, baslangic: 0.13 });
  },
  hatirlat() {
    ton(660, 0.12, { tur: 'triangle', ses: 0.12 });
    ton(660, 0.12, { tur: 'triangle', ses: 0.12, baslangic: 0.16 });
  },
  tik() {
    ton(1400, 0.025, { tur: 'square', ses: 0.025 });
  },
};

// ---- Geçici müzik: sakin bir lofi döngüsü ----
// Dört akor (Fmaj7 – Em7 – Dm7 – Cmaj7), yumuşak tuşlar ve ara sıra ezgi.
const AKORLAR = [
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 60],
  [48, 52, 55, 59],
];
const EZGI = [72, 74, 76, 79, 81, 84];
const VURUS = 60 / 72; // saniye

function notaFrekansi(n: number) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

function muzikNotasi(n: number, t: number, sure: number, ses: number, tur: OscillatorType = 'triangle') {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 1400;
  o.type = tur;
  o.frequency.value = notaFrekansi(n);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(f).connect(g).connect(muzikKazanci!);
  o.start(t);
  o.stop(t + sure + 0.1);
}

function muzikBaslat() {
  const c = ctx!;
  let olcu = 0;
  let sonraki = c.currentTime + 0.3;
  const planla = () => {
    // Biraz ilerisini planla: zamanlama kaymasın
    while (sonraki < c.currentTime + 1.5) {
      const akor = AKORLAR[olcu % AKORLAR.length];
      for (let v = 0; v < 4; v++) {
        const t = sonraki + v * VURUS;
        // Akor: ilk vuruşta tümü, sonra yumuşak tekrar
        akor.forEach((n, i) => muzikNotasi(n, t + i * 0.012, VURUS * (v === 0 ? 3.6 : 0.9), v === 0 ? 0.05 : 0.025));
        muzikNotasi(akor[0] - 12, t, VURUS * 0.9, 0.06, 'sine');
        if (Math.random() < 0.45) muzikNotasi(EZGI[Math.floor(Math.random() * EZGI.length)], t + VURUS * 0.5, VURUS * 1.2, 0.035, 'sine');
      }
      sonraki += VURUS * 4;
      olcu++;
    }
  };
  planla();
  window.setInterval(planla, 400);
}
