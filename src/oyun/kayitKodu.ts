import { kayitHamOku, kayitHamYaz } from './durum';

// Kayıt kodu (belge 0.14; Kemal, 15 Ekim gece: "iki ayrı yerde aynı kullanıcı
// oynamaya devam etsin"): kayıt sıkıştırılıp yazıya çevrilir. Bir cihazda kod
// alınır (kopyala / paylaş), öbüründe yapıştırılır; o cihazdaki kaydın yerine geçer.
// Sunucu yok: kod kaydın kendisi. Bulut kayıt sonra (ayrı Firebase projesi).

const ON_EK = 'DK1:';
const DUZ_ON_EK = 'DK0:';

function base64Yap(b: Uint8Array) {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64Coz(s: string) {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  const ikili = atob(t + '='.repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(ikili, (c) => c.charCodeAt(0));
}
async function akis(veri: Uint8Array, donusum: CompressionStream | DecompressionStream) {
  const yanit = new Response(new Blob([veri as BlobPart]).stream().pipeThrough(donusum));
  return new Uint8Array(await yanit.arrayBuffer());
}

export async function kayitKoduUret(): Promise<string | null> {
  const ham = kayitHamOku();
  if (!ham) return null;
  const bayt = new TextEncoder().encode(ham);
  if (typeof CompressionStream === 'undefined') return DUZ_ON_EK + base64Yap(bayt);
  return ON_EK + base64Yap(await akis(bayt, new CompressionStream('deflate-raw')));
}

// Kodu çözer ve kaydı yazar; kod bozuksa hata atar
export async function kayitKodunuYukle(kod: string) {
  const temiz = kod.trim().replace(/\s+/g, '');
  let bayt: Uint8Array;
  if (temiz.startsWith(ON_EK)) bayt = await akis(base64Coz(temiz.slice(ON_EK.length)), new DecompressionStream('deflate-raw'));
  else if (temiz.startsWith(DUZ_ON_EK)) bayt = base64Coz(temiz.slice(DUZ_ON_EK.length));
  else throw new Error('kod');
  kayitHamYaz(new TextDecoder().decode(bayt));
}
