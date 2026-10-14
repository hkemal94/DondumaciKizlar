import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { renk } from './renkler';
import { CESITLER } from '../oyun/kuvetler';
import { ICECEK_RENGI } from '../oyun/makine';

// Tasarım dili (belge 0.7; Kemal, 14 Ekim): hazır paketler (Kenney, Quaternius,
// Tiny Treats, KayKit) farklı ellerden çıkma. Oyun her modeli yüklerken
// 1) boyunu bizim ölçüye getirir, 2) her rengini paletteki en yakın renge
// çevirir, 3) yüzeyini mat ve köşeli yapar. Böylece hepsi tek oyun gibi durur.

// ---- Palet ----
const TEMEL = [
  renk.krem,
  renk.duvar,
  renk.ahsapAcik,
  renk.ahsapOrta,
  renk.ahsapKoyu,
  renk.tezgahUst,
  renk.vitrinMetal,
  renk.cam,
  renk.fayans,
  renk.kaya,
  renk.kum,
  renk.tekneGovde,
  renk.kiremit,
  renk.pembeSiva,
];
const DOGA = [renk.tepe, renk.tepeKoyu];
const LOGO = [renk.mor, renk.morAcik, renk.morKoyu, renk.sari];
const DENIZ = [renk.denizSig, renk.denizDerin, renk.tekneMavisi];
const URUN = [...CESITLER.map((c) => c.renk), ...Object.values(ICECEK_RENGI)];

// Mor ve sarı yalnız bizim dükkânın: Liman'daki öteki binalar ve tekneler almaz
export type PaletGrubu = 'dukkan' | 'liman' | 'urun';
const GRUPLAR: Record<PaletGrubu, string[]> = {
  dukkan: [...TEMEL, ...DOGA, ...LOGO],
  liman: [...TEMEL, ...DOGA, ...DENIZ],
  urun: [...TEMEL, ...DOGA, ...LOGO, ...URUN],
};

// Renkleri göze yakın bir uzayda (Lab) karşılaştırırız: "en yakın" gözün gördüğü gibi olsun
type Lab = [number, number, number];
function dogrusal(c: number) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function labdan(r: number, g: number, b: number): Lab {
  const R = dogrusal(r), G = dogrusal(g), B = dogrusal(b);
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047);
  const y = f(R * 0.2126 + G * 0.7152 + B * 0.0722);
  const z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
function ters(t: number) {
  return t > 0.206893 ? t ** 3 : (t - 16 / 116) / 7.787;
}
function sRGB(c: number) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}
function labtan([L, a, b]: Lab): [number, number, number] {
  const y = (L + 16) / 116;
  const X = ters(a / 500 + y) * 0.95047, Y = ters(y), Z = ters(y - b / 200) * 1.08883;
  return [
    sRGB(X * 3.2406 - Y * 1.5372 - Z * 0.4986),
    sRGB(-X * 0.9689 + Y * 1.8758 + Z * 0.0415),
    sRGB(X * 0.0557 - Y * 0.204 + Z * 1.057),
  ];
}
interface PaletRengi {
  lab: Lab;
}
const paletler = new Map<PaletGrubu, PaletRengi[]>();
function paletiAl(grup: PaletGrubu) {
  let p = paletler.get(grup);
  if (!p) {
    p = [...new Set(GRUPLAR[grup])].map((h) => {
      const c = new THREE.Color(h);
      return { lab: labdan(c.r * 255, c.g * 255, c.b * 255) };
    });
    paletler.set(grup, p);
  }
  return p;
}
// Renk tonu paletten gelir; açıklık modelin kendi tonuyla paletinkinin ortası.
// Böylece paketlerin açık / koyu tonları (gölgeleme) kaybolmaz. Eşlerken
// açıklık farkı az sayılır: koyu bir yeşil yine yeşile gitsin, kahveye değil.
const ACIKLIK_AGIRLIGI = 0.35;
const ACIKLIK_KARISIMI = 0.35;
function enYakin(grup: PaletGrubu, r: number, g: number, b: number) {
  const lab = labdan(r, g, b);
  let enIyi = paletiAl(grup)[0];
  let enAz = Infinity;
  for (const p of paletiAl(grup)) {
    const d = ((p.lab[0] - lab[0]) * ACIKLIK_AGIRLIGI) ** 2 + (p.lab[1] - lab[1]) ** 2 + (p.lab[2] - lab[2]) ** 2;
    if (d < enAz) {
      enAz = d;
      enIyi = p;
    }
  }
  const L = lab[0] * ACIKLIK_KARISIMI + enIyi.lab[0] * (1 - ACIKLIK_KARISIMI);
  return labtan([L, enIyi.lab[1], enIyi.lab[2]]);
}

// ---- Boya tablosu ----
// Otomatik eşleme tutarlı ama bazen yanlış rengi seçer (camgöbeği buzdolabı
// zeytin yeşili olur). Boya tablosu "şu renge yakın her şey şu renge" der;
// açık / koyu farkı korunur. Tabloda olmayan renkler otomatik eşlenir.
export type Boya = [kaynak: string, hedef: string, tolerans?: number];
interface Cevirici {
  anahtar: string;
  cevir: (r: number, g: number, b: number) => [number, number, number];
}
const civiriciler = new Map<string, Cevirici>();
function ceviriciAl(grup: PaletGrubu, boyalar: Boya[]): Cevirici {
  const anahtar = `${grup}|${boyalar.map((b) => b.join(',')).join(';')}`;
  let c = civiriciler.get(anahtar);
  if (c) return c;
  const tablo = boyalar.map(([kaynak, hedef, tolerans = 22]) => {
    const k = new THREE.Color(kaynak), h = new THREE.Color(hedef);
    return { k: labdan(k.r * 255, k.g * 255, k.b * 255), h: labdan(h.r * 255, h.g * 255, h.b * 255), tolerans };
  });
  c = {
    anahtar,
    cevir(r, g, b) {
      const lab = labdan(r, g, b);
      let enIyi: (typeof tablo)[number] | null = null;
      let enAz = Infinity;
      for (const s of tablo) {
        const d = Math.sqrt(((s.k[0] - lab[0]) * ACIKLIK_AGIRLIGI) ** 2 + (s.k[1] - lab[1]) ** 2 + (s.k[2] - lab[2]) ** 2);
        if (d < s.tolerans && d < enAz) {
          enAz = d;
          enIyi = s;
        }
      }
      if (!enIyi) return enYakin(grup, r, g, b);
      const L = Math.max(4, Math.min(99, enIyi.h[0] + (lab[0] - enIyi.k[0]) * 0.6));
      return labtan([L, enIyi.h[1], enIyi.h[2]]);
    },
  };
  civiriciler.set(anahtar, c);
  return c;
}

// Kenney paketlerinin hepsi aynı renk tablosu resmini kullanır (colormap.png);
// bir kez eşlemek Food, Watercraft ve City Kit'in hepsine yeter. Mor ve sarı
// Liman'da yok: oralarda başka tona gider.
function kenneyBoyasi(grup: PaletGrubu): Boya[] {
  const liman = grup === 'liman';
  const notr: Boya[] = [
    ['#ffffff', renk.krem, 6],
    ['#fde4c7', renk.krem, 6],
    ['#a0a8c9', renk.duvar, 6],
    ['#8e95b3', renk.kaya, 6],
    ['#868ba1', renk.kaya, 6],
    ['#666b80', renk.ahsapOrta, 6],
    ['#515566', renk.ahsapKoyu, 6],
    ['#4f5260', renk.ahsapKoyu, 6],
    ['#38383d', renk.ahsapKoyu, 10],
    ['#3a3c3f', renk.ahsapKoyu, 10],
    ['#d0e8ff', renk.cam, 6],
    // City Kit duvarları açık-koyu geçişli morumsu gri: hepsi sıcak duvar rengine
    ['#6e7390', renk.duvar, 24],
  ];
  // Ürünler (dondurma, meyve, içecek) canlı kalır: renkleri çeşit renklerine kendiliğinden gider
  if (grup === 'urun') return notr;
  return [
    ...notr,
    ['#61cb8b', renk.tepe, 6],
    ['#6794d9', renk.tekneMavisi, 6],
    ['#ffc044', liman ? renk.kum : renk.sari, 6],
    ['#a878e8', liman ? renk.tekneMavisi : renk.morAcik, 6],
    ['#f378f0', renk.pembeSiva, 6],
    ['#cf534f', renk.kiremit, 6],
    ['#ff7e44', renk.kiremit, 6],
    ['#cf735b', renk.kiremit, 6],
    ['#b06041', renk.ahsapOrta, 6],
    ['#faae8a', renk.pembeSiva, 6],
    ['#f2bf99', renk.kum, 6],
    ['#f1976c', renk.kiremit, 6],
  ];
}

// ---- Doku (renk tablosu) çevirme ----
// Kenney ve KayKit renkleri küçük bir renk tablosu resminden alır; resmin her
// noktasını palete çeviririz. Büyük resimler önce küçültülür (telefon).
const EN_BUYUK_DOKU = 256;
const cevrilmisDokular = new Map<string, THREE.Texture>();
function dokuyuCevir(doku: THREE.Texture, cevirici: Cevirici) {
  const anahtar = `${doku.uuid}:${cevirici.anahtar}`;
  const hazir = cevrilmisDokular.get(anahtar);
  if (hazir) return hazir;
  const resim = doku.image as CanvasImageSource & { width: number; height: number };
  const olcek = Math.min(1, EN_BUYUK_DOKU / Math.max(resim.width, resim.height));
  const tuval = document.createElement('canvas');
  tuval.width = Math.max(1, Math.round(resim.width * olcek));
  tuval.height = Math.max(1, Math.round(resim.height * olcek));
  const ctx = tuval.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(resim, 0, 0, tuval.width, tuval.height);
  const veri = ctx.getImageData(0, 0, tuval.width, tuval.height);
  const onbellek = new Map<number, [number, number, number]>();
  const d = veri.data;
  for (let i = 0; i < d.length; i += 4) {
    const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    let c = onbellek.get(k);
    if (!c) {
      c = cevirici.cevir(d[i], d[i + 1], d[i + 2]);
      onbellek.set(k, c);
    }
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
  }
  ctx.putImageData(veri, 0, 0);
  const yeni = new THREE.CanvasTexture(tuval);
  yeni.flipY = doku.flipY;
  yeni.wrapS = doku.wrapS;
  yeni.wrapT = doku.wrapT;
  yeni.colorSpace = THREE.SRGBColorSpace;
  yeni.channel = doku.channel;
  // Renk tablosu resimlerinde komşu renkler karışmasın
  yeni.magFilter = THREE.NearestFilter;
  yeni.minFilter = THREE.NearestFilter;
  yeni.generateMipmaps = false;
  cevrilmisDokular.set(anahtar, yeni);
  return yeni;
}

// ---- Malzeme ----
const cevrilmisMalzemeler = new Map<string, THREE.Material>();
function malzemeyiCevir(m: THREE.Material, grup: PaletGrubu, boyalar: Boya[]): THREE.Material {
  // Kenney'nin renk tablosu kendi boyasıyla gelir; parçanın özel boyası önce gelir
  const cevirici = ceviriciAl(grup, m.name === 'colormap' ? [...boyalar, ...kenneyBoyasi(grup)] : boyalar);
  const anahtar = `${m.uuid}:${cevirici.anahtar}`;
  const hazir = cevrilmisMalzemeler.get(anahtar);
  if (hazir) return hazir;
  const eski = m as THREE.MeshStandardMaterial;
  const saydam = eski.transparent && eski.opacity < 0.9;
  const yeni = new THREE.MeshStandardMaterial({
    name: eski.name,
    transparent: eski.transparent,
    opacity: eski.opacity,
    alphaTest: eski.alphaTest,
    side: eski.side,
    // Köşe renkleri (Quaternius ağaçlarında karartma) kullanılmaz: renk yalnız paletten
    vertexColors: false,
    // Her şey mat; cam hafifçe parlar
    roughness: saydam ? 0.25 : 0.85,
    metalness: 0,
    flatShading: true,
  });
  const c = eski.color ?? new THREE.Color(1, 1, 1);
  const beyaz = c.r > 0.99 && c.g > 0.99 && c.b > 0.99;
  if (eski.map) {
    yeni.map = dokuyuCevir(eski.map, cevirici);
    if (!beyaz) yeni.color.copy(c); // doku ile renk birlikte geliyorsa rengi koru
  } else {
    const s = c.clone().convertLinearToSRGB();
    const [r, g, b] = cevirici.cevir(s.r * 255, s.g * 255, s.b * 255);
    yeni.color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
  }
  cevrilmisMalzemeler.set(anahtar, yeni);
  return yeni;
}

// ---- Ölçü ----
// Model yerde durur, ortası x/z'de sıfırda; hedef yükseklik ya da en (m)
export interface Olcu {
  yukseklik?: number;
  en?: number; // en uzun yatay kenar
}
function olcule(nesne: THREE.Object3D, olcu: Olcu) {
  nesne.updateWorldMatrix(true, true);
  const kutu = new THREE.Box3().setFromObject(nesne);
  const boyut = kutu.getSize(new THREE.Vector3());
  const oran = olcu.yukseklik ? olcu.yukseklik / boyut.y : olcu.en ? olcu.en / Math.max(boyut.x, boyut.z) : 1;
  const ic = new THREE.Group();
  while (nesne.children.length) ic.add(nesne.children[0]);
  const merkez = kutu.getCenter(new THREE.Vector3());
  ic.position.set(-merkez.x, -kutu.min.y, -merkez.z);
  nesne.add(ic);
  nesne.scale.setScalar(oran);
}

// ---- Yükleme ----
const yukleyici = new GLTFLoader();
const yuklenenler = new Map<string, Promise<THREE.Object3D>>();
function yukle(yol: string) {
  let s = yuklenenler.get(yol);
  if (!s) {
    s = yukleyici.loadAsync(`${import.meta.env.BASE_URL}modeller/${yol}.glb`).then((g) => g.scene);
    yuklenenler.set(yol, s);
  }
  return s;
}

export interface ModelAyari extends Olcu {
  grup: PaletGrubu;
  ham?: boolean; // karşılaştırma için: renk ve yüzey olduğu gibi kalır
  boya?: Boya[];
}

// Modeli yükler, ölçüye getirir, palete oturtur. Her çağrı yeni bir kopya verir.
export async function paletliModel(yol: string, ayar: ModelAyari) {
  const kaynak = await yukle(yol);
  const kopya = kaynak.clone(true);
  const kok = new THREE.Group();
  kok.add(kopya);
  olcule(kok, ayar);
  kok.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (!ayar.ham) {
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => malzemeyiCevir(m, ayar.grup, ayar.boya ?? []))
        : malzemeyiCevir(mesh.material, ayar.grup, ayar.boya ?? []);
    }
    // Gölgeyi yalnız büyük şeyler verir
    mesh.castShadow = (ayar.yukseklik ?? 1) >= 0.5;
    mesh.receiveShadow = true;
  });
  return kok;
}
