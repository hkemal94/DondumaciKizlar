// Galeri ve albüm (belge 0.12, 5. adım): "Dükkânı gez"de çekilen fotoğraflar
// ve ayda bir kendiliğinden çekilen dükkân fotoğrafı burada birikir.
// Fotoğraflar büyük olduğu için kayıttan ayrı, tarayıcının veritabanında
// (IndexedDB) durur; kayıt silinse de galeri kalır. Her kayıt yuvasının
// (asıl dükkân / deneme dükkânı) fotoğrafları ayrıdır.

export type FotoTuru = 'gezme' | 'album';

export interface Foto {
  id: number;
  yuva: string;
  tur: FotoTuru;
  gun: number; // oyundaki gün
  zaman: number; // gerçek tarih (ms)
  resim: Blob;
}

const VERITABANI = 'dondurmaci-kizlar-galeri';
const DEPO = 'fotolar';

let acik: Promise<IDBDatabase> | null = null;
function ac(): Promise<IDBDatabase> {
  if (!acik) {
    acik = new Promise((coz, reddet) => {
      const istek = indexedDB.open(VERITABANI, 1);
      istek.onupgradeneeded = () => istek.result.createObjectStore(DEPO, { keyPath: 'id', autoIncrement: true });
      istek.onsuccess = () => coz(istek.result);
      istek.onerror = () => reddet(istek.error);
    });
    acik.catch(() => (acik = null));
  }
  return acik;
}

function islem<T>(tur: IDBTransactionMode, yap: (depo: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return ac().then(
    (vt) =>
      new Promise<T>((coz, reddet) => {
        const istek = yap(vt.transaction(DEPO, tur).objectStore(DEPO));
        istek.onsuccess = () => coz(istek.result);
        istek.onerror = () => reddet(istek.error);
      }),
  );
}

// Galeri ekranı açıkken yeni fotoğraf gelince yenilensin
const dinleyiciler = new Set<() => void>();
export function galeriDegisince(f: () => void) {
  dinleyiciler.add(f);
  return () => {
    dinleyiciler.delete(f);
  };
}
const haberVer = () => dinleyiciler.forEach((f) => f());

export async function fotoEkle(yuva: string, tur: FotoTuru, gun: number, resimAdresi: string) {
  try {
    const resim = await (await fetch(resimAdresi)).blob();
    await islem('readwrite', (d) => d.add({ yuva, tur, gun, zaman: Date.now(), resim }));
    haberVer();
    return true;
  } catch {
    // Tarayıcı izin vermezse (gizli pencere vb.) fotoğraf yalnız ekranda kalır
    return false;
  }
}

export async function fotolar(yuva: string): Promise<Foto[]> {
  try {
    const hepsi = (await islem('readonly', (d) => d.getAll())) as Foto[];
    return hepsi.filter((f) => f.yuva === yuva).sort((a, b) => b.zaman - a.zaman);
  } catch {
    return [];
  }
}

export async function fotoSil(id: number) {
  try {
    await islem('readwrite', (d) => d.delete(id));
    haberVer();
  } catch {
    // silinemedi; galeri olduğu gibi kalır
  }
}
