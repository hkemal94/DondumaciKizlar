import { useSyncExternalStore } from 'react';
import ayar from '../bulutAyari.json';
import { kayitDinleyicisiKur, kayitHamOku, kayitHamYaz, kaydiYenidenYukle } from './durum';

// Hesap ve bulut kayıt (paket E; belge 0.14, 0.15): Google ile giriş, dükkânın
// kaydı oyunun kendi Firebase projesinde (KKM'ninkine karışmaz). Ayar dosyası
// (src/bulutAyari.json) boşsa bu bölüm hiç görünmez.
// Buluta yalnız kayıt gider (takma ad + oyuncu ID'si içinde); Google'daki ad ve
// e-posta yazılmaz (belge 0.14: kişisel bilgi alınmaz).
// Yazma: oyun kaydettikçe en çok 30 saniyede bir, sekme kapanırken hemen.
// Giriş yapılınca bulut ile bu cihaz karşılaştırılır; farklıysa oyuncu seçer.

export interface KayitOzeti {
  gun: number;
  para: number;
}
export interface BulutDurumu {
  kullanici: { uid: string; eposta: string } | null;
  hazirlaniyor: boolean;
  // Bulut ve bu cihaz farklı: hangisi kalsın
  secim: { bulut: KayitOzeti; cihaz: KayitOzeti } | null;
  sonYazma: number | null;
  hata: 'giris' | 'yazma' | 'okuma' | null;
}

export const bulutHazir = Boolean(ayar.apiKey && ayar.projectId);

let durum: BulutDurumu = { kullanici: null, hazirlaniyor: false, secim: null, sonYazma: null, hata: null };
const dinleyenler = new Set<() => void>();
function guncelle(yeni: Partial<BulutDurumu>) {
  durum = { ...durum, ...yeni };
  dinleyenler.forEach((f) => f());
}
export function useBulut() {
  return useSyncExternalStore(
    (f) => {
      dinleyenler.add(f);
      return () => dinleyenler.delete(f);
    },
    () => durum,
  );
}

// Firebase yalnız gerekince yüklenir (oyunun açılışı ağırlaşmasın)
type Firebase = Awaited<ReturnType<typeof yukle>>;
async function yukle() {
  const [app, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
  const uygulama = app.initializeApp(ayar);
  return { auth, fs, oturum: auth.getAuth(uygulama), db: fs.getFirestore(uygulama) };
}
let fb: Promise<Firebase> | null = null;
function firebase() {
  fb ??= yukle();
  return fb;
}

function ozet(ham: string | null): KayitOzeti | null {
  if (!ham) return null;
  try {
    const k = JSON.parse(ham);
    return { gun: Number(k.gun) || 1, para: Number(k.para) || 0 };
  } catch {
    return null;
  }
}

// Açılışta: daha önce bağlanıldıysa oturum kendiliğinden gelir
export function bulutuBaslat() {
  if (!bulutHazir) return;
  void firebase().then(({ auth, oturum }) => {
    void auth.getRedirectResult(oturum).catch(() => guncelle({ hata: 'giris' }));
    auth.onAuthStateChanged(oturum, (k) => {
      guncelle({ kullanici: k ? { uid: k.uid, eposta: k.email ?? '' } : null });
      if (k) void karsilastir(k.uid);
      else kayitDinleyicisiKur(null);
    });
  });
}

export async function googleIleBaglan() {
  const { auth, oturum } = await firebase();
  const saglayici = new auth.GoogleAuthProvider();
  guncelle({ hata: null, hazirlaniyor: true });
  try {
    await auth.signInWithPopup(oturum, saglayici);
  } catch (e) {
    // Açılır pencere engellendiyse sayfa Google'a gidip döner
    const kod = (e as { code?: string }).code;
    if (kod === 'auth/popup-blocked' || kod === 'auth/operation-not-supported-in-this-environment') await auth.signInWithRedirect(oturum, saglayici);
    else if (kod !== 'auth/popup-closed-by-user' && kod !== 'auth/cancelled-popup-request') guncelle({ hata: 'giris' });
  } finally {
    guncelle({ hazirlaniyor: false });
  }
}

export async function bulutCikis() {
  const { auth, oturum } = await firebase();
  await bekleyeniYaz();
  kayitDinleyicisiKur(null);
  await auth.signOut(oturum);
  guncelle({ secim: null, sonYazma: null });
}

let buluttaki: string | null = null;
async function karsilastir(uid: string) {
  const { fs, db } = await firebase();
  guncelle({ hazirlaniyor: true });
  try {
    const belge = await fs.getDoc(fs.doc(db, 'oyuncular', uid));
    buluttaki = belge.exists() ? (belge.data().kayit as string) : null;
  } catch {
    guncelle({ hata: 'okuma', hazirlaniyor: false });
    return;
  }
  guncelle({ hazirlaniyor: false });
  const cihazda = kayitHamOku();
  const b = ozet(buluttaki);
  const c = ozet(cihazda);
  if (b && c && buluttaki !== cihazda) {
    guncelle({ secim: { bulut: b, cihaz: c } });
    return;
  }
  if (b && !c) {
    // Bu cihazda kayıt yok: buluttaki gelir
    kayitHamYaz(buluttaki!);
    kaydiYenidenYukle();
  } else if (c && !b) await yaz(uid, cihazda!);
  izlemeyeBasla(uid);
}

// Oyuncunun seçimi: "bulut" buluttakini bu cihaza alır, "cihaz" bu cihazdakini buluta yazar
export async function secimiUygula(hangisi: 'bulut' | 'cihaz') {
  const k = durum.kullanici;
  if (!k || !durum.secim) return;
  guncelle({ secim: null });
  if (hangisi === 'bulut' && buluttaki) {
    kayitHamYaz(buluttaki);
    kaydiYenidenYukle();
  } else {
    const ham = kayitHamOku();
    if (ham) await yaz(k.uid, ham);
  }
  izlemeyeBasla(k.uid);
}

async function yaz(uid: string, ham: string) {
  const { fs, db } = await firebase();
  try {
    await fs.setDoc(fs.doc(db, 'oyuncular', uid), { kayit: ham, guncel: fs.serverTimestamp() });
    buluttaki = ham;
    guncelle({ sonYazma: Date.now(), hata: null });
  } catch {
    guncelle({ hata: 'yazma' });
  }
}

// Oyun kaydettikçe: en çok 30 saniyede bir; sekme gizlenince bekleyen hemen yazılır
const ARALIK = 30_000;
let bekleyen: string | null = null;
let zamanlayici: ReturnType<typeof setTimeout> | null = null;
let izlenen: string | null = null;
function izlemeyeBasla(uid: string) {
  izlenen = uid;
  kayitDinleyicisiKur((ham) => {
    bekleyen = ham;
    zamanlayici ??= setTimeout(() => void bekleyeniYaz(), ARALIK);
  });
}
async function bekleyeniYaz() {
  if (zamanlayici) clearTimeout(zamanlayici);
  zamanlayici = null;
  const ham = bekleyen;
  bekleyen = null;
  if (ham && izlenen && ham !== buluttaki) await yaz(izlenen, ham);
}
if (typeof document !== 'undefined')
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void bekleyeniYaz();
  });
