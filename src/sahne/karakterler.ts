import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as iskeletliKopya } from 'three/examples/jsm/utils/SkeletonUtils.js';

// Kenney Mini Characters (CC0, docs/lisanslar.md) ile değişken karakterler
// (Kemal, 14 Ekim: "her gün aynı karakterlere neden hizmet versin").
// Her karakter iki parça: gövde ve baş; 12 modelin iskeleti aynı. Bu yüzden:
//  - bir modelin başı ötekinin gövdesine takılır (12 × 12),
//  - ten, saç, üst, alt ve ayakkabı renkleri ayrı seçilir (gölge korunur),
//  - aksesuar eklenir (gözlük, güneş gözlüğü, hasır şapka).
// Renkler dokudan köşe rengine çevrilir; hangi rengin ne olduğu modelin
// hangi kemiğe bağlı olduğundan ve yüzdeki ten renginden anlaşılır.

export const TABANLAR = [
  'female-a',
  'female-b',
  'female-c',
  'female-d',
  'female-e',
  'female-f',
  'male-a',
  'male-b',
  'male-c',
  'male-d',
  'male-e',
  'male-f',
] as const;

const BAS_KEMIGI_Y = 0.17625 + 0.167;
// Polis şapkalı baş (male-c) boyanınca tümüyle ten rengine dönüyor: baş olarak seçilmez
const BAS_ADAYLARI = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11];

// Modeller ~0,78 birim boyunda; oyundaki insanlar ~1,6 m
export const KARAKTER_OLCEGI = 1.55;

export type KarakterAksesuari = 'gozluk' | 'gunesGozlugu' | 'hasirSapka' | 'kasket' | 'bandana' | 'kupe';

export interface Varyant {
  govde: number; // TABANLAR sırası
  bas: number;
  ten: string;
  sac: string;
  ust: string;
  alt: string;
  ayakkabi: string;
  aksesuarlar: KarakterAksesuari[];
}

// Rol: 0 ten, 1 saç, 2 üst, 3 alt, 4 ayakkabı, 5 dokunulmaz (göz, ağız, gözlük…)
const TEN = 0,
  SAC = 1,
  UST = 2,
  ALT = 3,
  AYAKKABI = 4,
  SABIT = 5;

interface Parca {
  geometri: THREE.BufferGeometry;
  rol: Uint8Array;
  renk: Float32Array; // dokudan gelen asıl renk (doğrusal)
  rolParlakligi: number[]; // her rolün ortalama parlaklığı (gölgeyi korumak için)
}

interface Taban {
  sahne: THREE.Object3D;
  basTepesi: number; // başın en üstü (şapka için), model biriminde
  govde: Parca;
  bas: Parca;
  animasyonlar: THREE.AnimationClip[];
}

let yukleme: Promise<{ tabanlar: Taban[]; gozluk: THREE.Object3D; gunesGozlugu: THREE.Object3D }> | null = null;

const parlaklik = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function hsl(r: number, g: number, b: number) {
  const c = new THREE.Color(r, g, b);
  const h = { h: 0, s: 0, l: 0 };
  c.getHSL(h);
  return h;
}

// Dokunun piksellerini oku (renkleri köşelere taşımak için)
function dokuPikselleri(doku: THREE.Texture) {
  const resim = doku.image as HTMLImageElement | ImageBitmap;
  const tuval = document.createElement('canvas');
  tuval.width = resim.width;
  tuval.height = resim.height;
  const c = tuval.getContext('2d')!;
  c.drawImage(resim, 0, 0);
  return { veri: c.getImageData(0, 0, resim.width, resim.height).data, en: resim.width, boy: resim.height };
}

function parcaHazirla(mesh: THREE.SkinnedMesh, piksel: ReturnType<typeof dokuPikselleri>, tenKumesi: Set<string> | null, bas: boolean) {
  const g = mesh.geometry;
  const uv = g.getAttribute('uv') as THREE.BufferAttribute;
  const konum = g.getAttribute('position') as THREE.BufferAttribute;
  const normal = g.getAttribute('normal') as THREE.BufferAttribute;
  const eklem = g.getAttribute('skinIndex') as THREE.BufferAttribute;
  const agirlik = g.getAttribute('skinWeight') as THREE.BufferAttribute;
  const n = konum.count;
  const renk = new Float32Array(n * 3);
  const anahtarlar: string[] = [];
  const kemikAdi = mesh.skeleton.bones.map((b) => b.name);
  let yEn = Infinity,
    yEnCok = -Infinity,
    zEnCok = -Infinity;
  for (let i = 0; i < n; i++) {
    yEn = Math.min(yEn, konum.getY(i));
    yEnCok = Math.max(yEnCok, konum.getY(i));
    zEnCok = Math.max(zEnCok, konum.getZ(i));
  }
  for (let i = 0; i < n; i++) {
    const x = Math.min(piksel.en - 1, Math.max(0, Math.floor(uv.getX(i) * piksel.en)));
    const y = Math.min(piksel.boy - 1, Math.max(0, Math.floor(uv.getY(i) * piksel.boy)));
    const k = (y * piksel.en + x) * 4;
    const c = new THREE.Color().setRGB(piksel.veri[k] / 255, piksel.veri[k + 1] / 255, piksel.veri[k + 2] / 255, THREE.SRGBColorSpace);
    renk[i * 3] = c.r;
    renk[i * 3 + 1] = c.g;
    renk[i * 3 + 2] = c.b;
    anahtarlar.push(`${piksel.veri[k]},${piksel.veri[k + 1]},${piksel.veri[k + 2]}`);
  }
  // Baş: yüzün alt-ön bölgesindeki renkler ten (koyu olanlar göz / ağız)
  const yuzBolgesi = (i: number) =>
    normal.getZ(i) > 0.5 && konum.getY(i) < yEn + (yEnCok - yEn) * 0.55 && konum.getZ(i) > zEnCok - 0.06;
  const kume = tenKumesi ?? new Set<string>();
  if (bas) {
    for (let i = 0; i < n; i++) {
      const h = hsl(renk[i * 3], renk[i * 3 + 1], renk[i * 3 + 2]);
      if (yuzBolgesi(i) && h.l > 0.12 && h.s > 0.2 && h.h > 0.01 && h.h < 0.12) kume.add(anahtarlar[i]);
    }
  }
  const tenOrt = [...kume].map((a) => a.split(',').map(Number));
  const tenRengiMi = (i: number) => {
    if (kume.has(anahtarlar[i])) return true;
    // Aynı tonun açık / koyu gölgeleri de ten
    const h = hsl(renk[i * 3], renk[i * 3 + 1], renk[i * 3 + 2]);
    return tenOrt.some((t) => {
      const th = hsl(...(new THREE.Color().setRGB(t[0] / 255, t[1] / 255, t[2] / 255, THREE.SRGBColorSpace).toArray() as [number, number, number]));
      return Math.abs(th.h - h.h) < 0.02 && Math.abs(th.s - h.s) < 0.12;
    });
  };
  const rol = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (tenRengiMi(i)) {
      rol[i] = TEN;
      continue;
    }
    if (bas) {
      const h = hsl(renk[i * 3], renk[i * 3 + 1], renk[i * 3 + 2]);
      // Yüzdeki ten olmayanlar (göz, ağız, kaş, gözlük) dokunulmaz; gerisi saç / şapka
      rol[i] = yuzBolgesi(i) && (h.l < 0.2 || h.s < 0.2) ? SABIT : SAC;
      continue;
    }
    // Gövde: en ağır bağlı kemik
    let en = 0;
    for (let j = 1; j < 4; j++) if (agirlik.getComponent(i, j) > agirlik.getComponent(i, en)) en = j;
    const ad = kemikAdi[eklem.getComponent(i, en)] ?? '';
    if (ad.startsWith('leg')) rol[i] = konum.getY(i) < yEn + 0.045 ? AYAKKABI : ALT;
    else rol[i] = UST;
  }
  const toplam = [0, 0, 0, 0, 0, 0];
  const sayi = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    toplam[rol[i]] += parlaklik(renk[i * 3], renk[i * 3 + 1], renk[i * 3 + 2]);
    sayi[rol[i]]++;
  }
  return {
    parca: { geometri: g, rol, renk, rolParlakligi: toplam.map((t, i) => (sayi[i] ? t / sayi[i] : 1)) } as Parca,
    tenKumesi: kume,
  };
}

export function karakterleriYukle() {
  if (yukleme) return yukleme;
  const yukleyici = new GLTFLoader();
  const yol = (ad: string) => `${import.meta.env.BASE_URL}modeller/karakterler/${ad}.glb`;
  yukleme = Promise.all([
    ...TABANLAR.map((ad) => yukleyici.loadAsync(yol(`character-${ad}`))),
    yukleyici.loadAsync(yol('aid-glasses')),
    yukleyici.loadAsync(yol('aid-sunglasses')),
  ]).then((sonuclar) => {
    const gltflar = sonuclar.slice(0, TABANLAR.length);
    const tabanlar = gltflar.map((gltf) => {
      let govde: THREE.SkinnedMesh | null = null;
      let bas: THREE.SkinnedMesh | null = null;
      gltf.scene.traverse((o) => {
        if ((o as THREE.SkinnedMesh).isSkinnedMesh) {
          if (o.name.includes('head')) bas = o as THREE.SkinnedMesh;
          else govde = o as THREE.SkinnedMesh;
        }
      });
      const piksel = dokuPikselleri(((bas as unknown as THREE.SkinnedMesh).material as THREE.MeshStandardMaterial).map!);
      const b = parcaHazirla(bas!, piksel, null, true);
      const gv = parcaHazirla(govde!, piksel, b.tenKumesi, false);
      const tepe = new THREE.Box3().setFromBufferAttribute((bas! as THREE.SkinnedMesh).geometry.getAttribute('position') as THREE.BufferAttribute).max.y;
      return { sahne: gltf.scene, basTepesi: tepe, govde: gv.parca, bas: b.parca, animasyonlar: gltf.animations } as Taban;
    });
    return { tabanlar, gozluk: sonuclar[TABANLAR.length].scene, gunesGozlugu: sonuclar[TABANLAR.length + 1].scene };
  });
  return yukleme;
}

const ortakMalzeme = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 });

function boya(p: Parca, hedefler: (THREE.Color | null)[]) {
  const g = p.geometri.clone();
  const n = p.rol.length;
  const renk = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = p.rol[i];
    const h = hedefler[r];
    if (!h) {
      renk.set(p.renk.subarray(i * 3, i * 3 + 3), i * 3);
      continue;
    }
    // Gölge korunur: asıl rengin, rolün ortalamasına göre açıklığı
    const oran = parlaklik(p.renk[i * 3], p.renk[i * 3 + 1], p.renk[i * 3 + 2]) / p.rolParlakligi[r];
    const o = Math.min(1.35, Math.max(0.55, oran));
    renk[i * 3] = Math.min(1, h.r * o);
    renk[i * 3 + 1] = Math.min(1, h.g * o);
    renk[i * 3 + 2] = Math.min(1, h.b * o);
  }
  g.setAttribute('color', new THREE.BufferAttribute(renk, 3));
  return g;
}

const dogrusal = (hex: string) => new THREE.Color(hex);

// Hasır şapka (müşterilerin eski görünümündeki gibi), başın üstüne
function hasirSapka() {
  const g = new THREE.Group();
  const hasir = new THREE.MeshStandardMaterial({ color: '#e3c58a', roughness: 0.95, flatShading: true });
  const kenar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 12), hasir);
  const tepe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.115, 0.08, 12), hasir);
  tepe.position.y = 0.045;
  const serit = new THREE.Mesh(new THREE.CylinderGeometry(0.117, 0.117, 0.022, 12), new THREE.MeshStandardMaterial({ color: '#7a3fa8' }));
  serit.position.y = 0.02;
  g.add(kenar, tepe, serit);
  return g;
}

const altin = new THREE.MeshStandardMaterial({ color: '#f2c14e', metalness: 0.6, roughness: 0.3 });

function aksesuarKur(ak: KarakterAksesuari, tepe: number, yuklu: Awaited<ReturnType<typeof karakterleriYukle>>) {
  if (ak === 'gozluk' || ak === 'gunesGozlugu') {
    const g = (ak === 'gozluk' ? yuklu.gozluk : yuklu.gunesGozlugu).clone();
    g.position.set(0, 0.115, 0.13);
    return g;
  }
  if (ak === 'hasirSapka') {
    const g = hasirSapka();
    g.position.set(0, tepe - 0.035, -0.01);
    return g;
  }
  const g = new THREE.Group();
  if (ak === 'kasket') {
    // Mor kasket, sarı siper (çalışanın aksesuarı)
    const kubbe = new THREE.Mesh(new THREE.SphereGeometry(0.235, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#7a3fa8', roughness: 0.8 }));
    const siper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.015, 0.16), new THREE.MeshStandardMaterial({ color: '#ffc928', roughness: 0.8 }));
    siper.position.set(0, 0.005, 0.24);
    g.add(kubbe, siper);
    g.position.set(0, tepe - 0.1, 0);
  } else if (ak === 'bandana') {
    const bant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.242, 0.242, 0.06, 14, 1, true),
      new THREE.MeshStandardMaterial({ color: '#e8574f', roughness: 0.8, side: THREE.DoubleSide }),
    );
    bant.rotation.x = 0.12;
    g.add(bant);
    g.position.set(0, tepe - 0.11, 0);
  } else {
    for (const x of [-0.235, 0.235]) {
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), altin);
      k.position.set(x, 0.1, 0.01);
      g.add(k);
    }
  }
  return g;
}

export interface Karakter {
  kok: THREE.Object3D;
  karistirici: THREE.AnimationMixer;
  eylemler: Record<string, THREE.AnimationAction>;
  sagEl: THREE.Object3D | null;
  govdeKemigi: THREE.Object3D | null; // önlük gibi gövdeye takılanlar için
}

export function karakterKur(v: Varyant, yuklu: Awaited<ReturnType<typeof karakterleriYukle>>): Karakter {
  const govdeTaban = yuklu.tabanlar[v.govde];
  const basTaban = yuklu.tabanlar[v.bas];
  const kok = iskeletliKopya(govdeTaban.sahne);
  const hedef = [dogrusal(v.ten), dogrusal(v.sac), dogrusal(v.ust), dogrusal(v.alt), dogrusal(v.ayakkabi), null];
  let basKemigi: THREE.Object3D | null = null;
  let sagEl: THREE.Object3D | null = null;
  kok.traverse((o) => {
    if (o.name === 'head') basKemigi = o;
    if (o.name === 'arm-right') sagEl = o;
    const m = o as THREE.SkinnedMesh;
    if (!m.isSkinnedMesh) return;
    m.geometry = m.name.includes('head') ? boya(basTaban.bas, hedef) : boya(govdeTaban.govde, hedef);
    m.material = ortakMalzeme;
    m.castShadow = true;
    m.frustumCulled = false;
  });
  // Aksesuarlar başa bağlanır (baş kemiği modelde ~0,343 yükseklikte)
  if (basKemigi) {
    const tepe = basTaban.basTepesi - BAS_KEMIGI_Y;
    for (const ak of v.aksesuarlar) (basKemigi as THREE.Object3D).add(aksesuarKur(ak, tepe, yuklu));
  }
  kok.scale.setScalar(KARAKTER_OLCEGI);
  const karistirici = new THREE.AnimationMixer(kok);
  const eylemler: Record<string, THREE.AnimationAction> = {};
  for (const a of govdeTaban.animasyonlar) eylemler[a.name] = karistirici.clipAction(a);
  let govdeKemigi: THREE.Object3D | null = null;
  kok.traverse((o) => {
    if (o.name === 'torso') govdeKemigi = o;
  });
  return { kok, karistirici, eylemler, sagEl, govdeKemigi };
}

// Tohumdan (müşteri numarası) her seferinde aynı varyant
const UST_RENKLERI = ['#ffd25a', '#5fa8d3', '#ef7a7a', '#8fcf8a', '#f2efe6', '#ff9f43', '#9b5fc9', '#4bc0b4', '#e8574f', '#fbf1e3', '#6c8ebf', '#f6a5c0'];
const ALT_RENKLERI = ['#3d4f6b', '#2f3a4a', '#d98a3d', '#f2efe6', '#6c5a8e', '#4a6b3d', '#c9b48a', '#2b2b33', '#5b7fa8'];
const AYAKKABI_RENKLERI = ['#2a2830', '#f2efe6', '#8a5a34', '#c2453d', '#3d4f6b'];
export const MUSTERI_TENLERI = ['#f3cfae', '#e3b08a', '#c98e66', '#9a6545', '#6b4430'];
export const MUSTERI_SACLARI = ['#2b211c', '#5a3825', '#8a5a34', '#c98a4a', '#e8cf8a', '#9a9aa2', '#3a2a22'];

export function rastgeleVaryant(tohum: number): Varyant {
  let t = tohum * 9301 + 49297;
  const r = () => {
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
  const sec = <T,>(dizi: readonly T[]) => dizi[Math.floor(r() * dizi.length)];
  const aks = r();
  return {
    govde: Math.floor(r() * TABANLAR.length),
    bas: sec(BAS_ADAYLARI),
    ten: sec(MUSTERI_TENLERI),
    sac: sec(MUSTERI_SACLARI),
    ust: sec(UST_RENKLERI),
    alt: sec(ALT_RENKLERI),
    ayakkabi: sec(AYAKKABI_RENKLERI),
    aksesuarlar: aks < 0.15 ? ['hasirSapka'] : aks < 0.25 ? ['gunesGozlugu'] : aks < 0.32 ? ['gozluk'] : aks < 0.38 ? ['kupe'] : [],
  };
}
