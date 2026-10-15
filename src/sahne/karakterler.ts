import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as iskeletliKopya } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { paletRengi } from './tasarimDili';

// İnsanlar (belge 0.9; Kemal, 14 Ekim gece): Quaternius Ultimate Modular
// Women + Men (CC0, docs/lisanslar.md). Müşteri, çalışan, yardımcı ve sahip
// hepsi bu parçalardan. Bütün karakterlerin iskeleti aynı; bu yüzden:
//  - hareketler (bekleme, yürüme, uzanma…) her cinsiyet için tek dosyada,
//  - aynı cinsiyetten bir karakterin başı (saçıyla) ötekinin gövdesine takılır,
//  - ten, saç, üst, alt ve ayakkabı renkleri ayrı seçilir; asıl renklerin
//    açık / koyu farkı korunur, kalan ayrıntılar palete oturtulur,
//  - aksesuarlar başın ölçüsüne göre yerleşir.
// Oturma hareketi pakette yok: bacaklar kalçadan ve dizden bükülerek yapılır.

export type Cinsiyet = 'kadin' | 'erkek';
// Kemal'in seçtiği 10 gündelik kıyafet (14 Ekim gece)
export const BEDENLER: Record<Cinsiyet, readonly string[]> = {
  kadin: ['casual', 'formal', 'worker', 'suit'],
  erkek: ['casual_2', 'casual_hoodie', 'beach', 'farmer', 'worker', 'suit'],
};

export type KarakterAksesuari = 'gozluk' | 'gunesGozlugu' | 'hasirSapka' | 'kasket' | 'bandana' | 'kupe';

export interface Varyant {
  cinsiyet: Cinsiyet;
  govde: string; // BEDENLER'den
  bas: string; // aynı cinsiyetten bir bedenin başı (yüzü; saç ayrı seçilmezse saçıyla)
  // Saç başka bir bedenin başından (belge 0.12: "saçları başlardan ayır");
  // bütün başlar aynı iskelette olduğu için saç parçası öteki yüze oturur
  sacBasi?: string;
  boy: number; // metre
  ten: string;
  sac: string;
  ust: string;
  alt: string;
  ayakkabi: string;
  aksesuarlar: KarakterAksesuari[];
}

type Bolum = 'bas' | 'govde' | 'bacak' | 'ayak';
type Rol = 'ten' | 'sac' | 'ust' | 'alt' | 'ayakkabi' | 'sabit';

interface Parca {
  mesh: THREE.SkinnedMesh; // paketteki asıl parça (başı başka bedene takarken yeri için)
  bolum: Bolum;
  geometri: THREE.BufferGeometry;
  malzemeAdi: string;
  renk: THREE.Color; // paketteki asıl renk (doğrusal)
  rol: Rol;
  oran: number; // rolün ana rengine göre açıklık (gölge ve ayrıntı korunsun)
}

interface Taban {
  sahne: THREE.Object3D;
  parcalar: Parca[];
  boy: number; // model biriminde
}

interface Yuklu {
  tabanlar: Record<Cinsiyet, Record<string, Taban>>;
  hareketler: Record<Cinsiyet, THREE.AnimationClip[]>;
  gozluk: THREE.Object3D;
  gunesGozlugu: THREE.Object3D;
}

const parlaklik = (c: THREE.Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

function bolumBul(o: THREE.Object3D): Bolum {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) {
    const ad = p.name.toLowerCase();
    if (ad.includes('head')) return 'bas';
    if (ad.includes('feet')) return 'ayak';
    if (ad.includes('legs') || ad.includes('pants')) return 'bacak';
    if (ad.includes('body')) return 'govde';
  }
  return 'govde';
}

const kosegenSayisi = (g: THREE.BufferGeometry) => (g.index ? g.index.count : g.getAttribute('position').count);

// Her parçanın hangi rengi oyuncunun / müşterinin seçimine göre boyanır:
// ten ve saç malzeme adından; kıyafette her bölümün en büyük rengi
function parcalariHazirla(sahne: THREE.Object3D): Parca[] {
  const parcalar: Parca[] = [];
  sahne.traverse((o) => {
    const m = o as THREE.SkinnedMesh;
    if (!m.isSkinnedMesh) return;
    const mal = m.material as THREE.MeshStandardMaterial;
    parcalar.push({ mesh: m, bolum: bolumBul(m), geometri: m.geometry, malzemeAdi: mal.name, renk: mal.color.clone(), rol: 'sabit', oran: 1 });
  });
  const tenMi = (p: Parca) => p.malzemeAdi.startsWith('Skin');
  const sacMi = (p: Parca) => p.malzemeAdi.startsWith('Hair') || p.malzemeAdi === 'Eyebrows' || p.malzemeAdi === 'Moustache';
  const enBuyuk = (bolum: Bolum) =>
    parcalar.filter((p) => p.bolum === bolum && !tenMi(p)).sort((a, b) => kosegenSayisi(b.geometri) - kosegenSayisi(a.geometri))[0];
  const ust = enBuyuk('govde');
  const alt = enBuyuk('bacak');
  const ayak = enBuyuk('ayak');
  for (const p of parcalar) {
    if (tenMi(p)) p.rol = 'ten';
    else if (p.bolum === 'bas') p.rol = sacMi(p) ? 'sac' : 'sabit';
    else if (p === ust) p.rol = 'ust';
    // Elbise: bacaktaki kumaş üsttekiyle aynıysa üst rengini alır
    else if (p === alt) p.rol = ust && alt.malzemeAdi === ust.malzemeAdi ? 'ust' : 'alt';
    else if (p === ayak) p.rol = 'ayakkabi';
  }
  // Rolün ana rengine göre açıklık oranı (Skin_Darker, ikinci saç tonu…)
  const ana: Partial<Record<Rol, number>> = {};
  for (const p of parcalar) {
    if (p.rol === 'sabit') continue;
    const asil = p.rol === 'ten' ? parcalar.find((x) => x.malzemeAdi === 'Skin') : p.rol === 'sac' ? parcalar.find((x) => x.malzemeAdi.startsWith('Hair')) : p;
    ana[p.rol] = Math.max(1e-4, parlaklik((asil ?? p).renk));
  }
  for (const p of parcalar) if (p.rol !== 'sabit') p.oran = Math.min(1.6, Math.max(0.35, parlaklik(p.renk) / ana[p.rol]!));
  return parcalar;
}

let yukleme: Promise<Yuklu> | null = null;

export function karakterleriYukle() {
  if (yukleme) return yukleme;
  const yukleyici = new GLTFLoader();
  const yol = (ad: string) => `${import.meta.env.BASE_URL}modeller/${ad}.glb`;
  const cinsiyetler: Cinsiyet[] = ['kadin', 'erkek'];
  yukleme = Promise.all([
    Promise.all(cinsiyetler.map((c) => Promise.all(BEDENLER[c].map((b) => yukleyici.loadAsync(yol(`insanlar/${c}-${b}`)))))),
    Promise.all(cinsiyetler.map((c) => yukleyici.loadAsync(yol(`insanlar/${c}-hareketler`)))),
    yukleyici.loadAsync(yol('karakterler/aid-glasses')),
    yukleyici.loadAsync(yol('karakterler/aid-sunglasses')),
  ]).then(([bedenler, hareketler, gozluk, gunesGozlugu]) => {
    const tabanlar = { kadin: {}, erkek: {} } as Yuklu['tabanlar'];
    cinsiyetler.forEach((c, i) =>
      bedenler[i].forEach((g, j) => {
        g.scene.updateMatrixWorld(true);
        const kutu = new THREE.Box3().setFromObject(g.scene, true);
        tabanlar[c][BEDENLER[c][j]] = { sahne: g.scene, parcalar: parcalariHazirla(g.scene), boy: kutu.max.y - kutu.min.y };
      }),
    );
    return {
      tabanlar,
      hareketler: { kadin: hareketler[0].animations, erkek: hareketler[1].animations },
      gozluk: gozluk.scene,
      gunesGozlugu: gunesGozlugu.scene,
    };
  });
  return yukleme;
}

// Aynı renkteki parçalar aynı malzemeyi paylaşır (telefon için)
const malzemeler = new Map<string, THREE.MeshStandardMaterial>();
function malzeme(renk: THREE.Color) {
  const anahtar = renk.getHexString();
  let m = malzemeler.get(anahtar);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: renk, roughness: 0.85, metalness: 0 });
    malzemeler.set(anahtar, m);
  }
  return m;
}

function parcaRengi(p: Parca, v: Varyant) {
  if (p.rol === 'sabit') {
    // Gözler, kaşlar, kemer, baret gibi ayrıntılar: kendi renkleri, palete oturtulmuş
    return new THREE.Color(paletRengi(`#${p.renk.getHexString(THREE.SRGBColorSpace)}`, 'liman'));
  }
  const hedef = new THREE.Color({ ten: v.ten, sac: v.sac, ust: v.ust, alt: v.alt, ayakkabi: v.ayakkabi }[p.rol]);
  return hedef.multiplyScalar(p.oran);
}

// ---- Aksesuarlar ----
const altin = new THREE.MeshStandardMaterial({ color: '#f2c14e', metalness: 0.6, roughness: 0.3 });

function hasirSapka(en: number) {
  const g = new THREE.Group();
  const r = en * 0.85;
  const hasir = new THREE.MeshStandardMaterial({ color: '#e3c58a', roughness: 0.95, flatShading: true });
  const kenar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 14), hasir);
  const tepe = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.52, r * 0.58, r * 0.4, 14), hasir);
  tepe.position.y = r * 0.2;
  const serit = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.59, r * 0.59, r * 0.11, 14), new THREE.MeshStandardMaterial({ color: '#c8705a' }));
  serit.position.y = r * 0.08;
  g.add(kenar, tepe, serit);
  return g;
}

// Başın kutusu (metre): aksesuarların yeri ve büyüklüğü buna göre
// Ortası baş kemiğinden: saç (atkuyruğu, yan saç) kutuyu bir yana kaydırabilir
function aksesuarKur(ak: KarakterAksesuari, bas: THREE.Box3, basOrtasi: THREE.Vector3, yuklu: Yuklu) {
  const en = Math.min(bas.max.x - basOrtasi.x, basOrtasi.x - bas.min.x) * 2;
  const boy = bas.max.y - bas.min.y;
  const orta = new THREE.Vector3(basOrtasi.x, bas.min.y + boy / 2, basOrtasi.z);
  const g = new THREE.Group();
  if (ak === 'gozluk' || ak === 'gunesGozlugu') {
    const model = (ak === 'gozluk' ? yuklu.gozluk : yuklu.gunesGozlugu).clone();
    const k = new THREE.Box3().setFromObject(model);
    const s = (en * 0.78) / (k.max.x - k.min.x);
    model.scale.setScalar(s);
    model.position.set(-((k.min.x + k.max.x) / 2) * s, -((k.min.y + k.max.y) / 2) * s, -k.min.z * s);
    g.add(model);
    g.position.set(orta.x, bas.min.y + boy * 0.42, bas.max.z - en * 0.1);
  } else if (ak === 'hasirSapka') {
    g.add(hasirSapka(en));
    g.position.set(orta.x, bas.max.y - boy * 0.16, orta.z);
  } else if (ak === 'kasket') {
    // Mor kasket, sarı siper (çalışanın aksesuarı)
    const r = en * 0.52;
    const kubbe = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#7a3fa8', roughness: 0.8 }));
    const siper = new THREE.Mesh(new THREE.BoxGeometry(r * 1.3, 0.012, r * 0.7), new THREE.MeshStandardMaterial({ color: '#ffc928', roughness: 0.8 }));
    siper.position.set(0, 0.004, r * 1.05);
    g.add(kubbe, siper);
    g.position.set(orta.x, bas.max.y - boy * 0.3, orta.z);
  } else if (ak === 'bandana') {
    const r = en * 0.52;
    const bant = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, boy * 0.12, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: '#c8705a', roughness: 0.8, side: THREE.DoubleSide }),
    );
    bant.rotation.x = 0.12;
    g.add(bant);
    g.position.set(orta.x, bas.max.y - boy * 0.28, orta.z);
  } else {
    for (const x of [-en * 0.42, en * 0.42]) {
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), altin);
      k.position.set(x, 0, 0);
      g.add(k);
    }
    g.position.set(orta.x, bas.min.y + boy * 0.33, orta.z);
  }
  return g;
}

// Ağız: yüzün alt üçte birinde, önünde ince bir yay
const agizMalzemesi = new THREE.MeshStandardMaterial({ color: '#7a3b3b', roughness: 0.8 });
function gulumseme(yuz: THREE.Box3, basOrtasi: THREE.Vector3) {
  const en = Math.min(yuz.max.x - basOrtasi.x, basOrtasi.x - yuz.min.x) * 2;
  const boy = yuz.max.y - yuz.min.y;
  const yay = new THREE.Mesh(new THREE.TorusGeometry(en * AGIZ.genislik, en * 0.012, 4, 10, Math.PI), agizMalzemesi);
  yay.rotation.z = Math.PI; // yayın kolları yukarı: gülümseme
  const g = new THREE.Group();
  g.add(yay);
  g.position.set(basOrtasi.x, yuz.min.y + boy * AGIZ.yukseklik, yuz.max.z - en * AGIZ.derinlik);
  return g;
}
const AGIZ = { genislik: 0.1, yukseklik: 0.3, derinlik: 0.02 };

// Bir nesneyi kemiğe, dünyadaki (dinlenme duruşundaki) yerini koruyarak bağlar
function kemigeTak(kemik: THREE.Object3D, nesne: THREE.Object3D) {
  nesne.updateMatrix();
  nesne.matrix.premultiply(new THREE.Matrix4().copy(kemik.matrixWorld).invert());
  nesne.matrix.decompose(nesne.position, nesne.quaternion, nesne.scale);
  kemik.add(nesne);
}

export interface Karakter {
  kok: THREE.Object3D;
  karistirici: THREE.AnimationMixer;
  eylemler: Record<string, THREE.AnimationAction>;
  govdeKemigi: THREE.Object3D | null; // önlük gibi gövdeye takılanlar için
  govdeKutusu: THREE.Box3; // dinlenme duruşunda gövde (metre)
  kalca: number; // kalçanın yerden yüksekliği (metre), oturmak için
  oturt: () => void; // hareket güncellendikten sonra bacakları büker
  // Bir nesneyi kemiğe bağlar; nesnenin yeri karakterin dinlenme duruşunda,
  // ayakların ortasına göre metre cinsinden verilir (önlük gibi)
  tak: (kemikAdi: string, nesne: THREE.Object3D) => void;
  // Gövdenin iki yükseklik arasındaki kesiti (dinlenme duruşu, metre); kollar
  // dışarıda kalsın diye ortadan en çok yariEn kadar yana bakılır
  kesit: (altY: number, ustY: number, yariEn: number) => THREE.Box3;
}

export function karakterKur(v: Varyant, yuklu: Yuklu): Karakter {
  const tabanlar = yuklu.tabanlar[v.cinsiyet];
  const govdeTaban = tabanlar[v.govde] ?? Object.values(tabanlar)[0];
  const basTaban = tabanlar[v.bas] ?? govdeTaban;
  const sacTaban = (v.sacBasi && tabanlar[v.sacBasi]) || basTaban;
  const sacParcasi = (p: Parca) => p.malzemeAdi.startsWith('Hair');
  const kok = iskeletliKopya(govdeTaban.sahne);
  const kemikler: Record<string, THREE.Object3D> = {};
  const govdeMeshleri: THREE.SkinnedMesh[] = [];
  kok.traverse((o) => {
    if ((o as THREE.Bone).isBone) kemikler[o.name] = o;
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) govdeMeshleri.push(o as THREE.SkinnedMesh);
  });
  // Baş başka bedenden geliyorsa: kendi başı çıkar, onunki aynı iskelete bağlanır
  const ornek = govdeMeshleri.find((m) => bolumBul(m) !== 'bas') ?? govdeMeshleri[0];
  const meshler: { mesh: THREE.SkinnedMesh; parca: Parca }[] = [];
  // Yüz başın kendisinden, saç (ayrı seçildiyse) öteki başın saç parçalarından
  const basAyri = basTaban !== govdeTaban || sacTaban !== basTaban;
  const basParcalari = [
    ...basTaban.parcalar.filter((p) => p.bolum === 'bas' && (sacTaban === basTaban || !sacParcasi(p))),
    ...(sacTaban !== basTaban ? sacTaban.parcalar.filter((p) => p.bolum === 'bas' && sacParcasi(p)) : []),
  ];
  govdeMeshleri.forEach((m, i) => {
    const p = govdeTaban.parcalar[i];
    if (p.bolum === 'bas' && basAyri) {
      m.parent?.remove(m);
      return;
    }
    meshler.push({ mesh: m, parca: p });
  });
  if (basAyri) {
    // Kemikler bu karakterin; kemik ayarları (dosya küçültülürken ölçü bilgisi
    // buraya gömülü) başın kendi dosyasından
    for (const p of basParcalari) {
      const asil = p.mesh;
      const m = new THREE.SkinnedMesh(p.geometri, ornek.material);
      ornek.parent?.add(m);
      m.position.copy(ornek.position);
      m.quaternion.copy(ornek.quaternion);
      m.scale.copy(ornek.scale);
      m.updateMatrixWorld(true);
      m.bind(new THREE.Skeleton(ornek.skeleton.bones, asil.skeleton.boneInverses), ornek.bindMatrix.clone());
      meshler.push({ mesh: m, parca: p });
    }
  }
  for (const { mesh, parca } of meshler) {
    mesh.material = malzeme(parcaRengi(parca, v));
    mesh.castShadow = true;
    mesh.frustumCulled = false;
  }
  kok.scale.setScalar(v.boy / govdeTaban.boy);
  // Ölçüler ve takılanlar bekleme hareketinin ilk anında: paketteki dinlenme
  // duruşunda gövde 27° yana dönük, gözlük kayık kalıyordu (Kemal: "gözlükler kayık")
  const karistirici = new THREE.AnimationMixer(kok);
  const eylemler: Record<string, THREE.AnimationAction> = {};
  for (const a of yuklu.hareketler[v.cinsiyet]) eylemler[a.name] = karistirici.clipAction(a);
  eylemler.Idle?.play();
  karistirici.update(0);
  // updateMatrixWorld: iskeletli parçaların bağ ayarları da güncellensin (updateWorldMatrix güncellemez)
  kok.updateMatrixWorld(true);
  // Ölçüler (metre)
  const basKutusu = new THREE.Box3();
  const govdeKutusu = new THREE.Box3();
  for (const { mesh, parca } of meshler) (parca.bolum === 'bas' ? basKutusu : govdeKutusu).expandByObject(mesh, true);
  const basKemigi = kemikler.Head ?? null;
  if (basKemigi) {
    const basOrtasi = basKemigi.getWorldPosition(new THREE.Vector3());
    for (const ak of v.aksesuarlar) kemigeTak(basKemigi, aksesuarKur(ak, basKutusu, basOrtasi, yuklu));
    // Gülümseme (Kemal: "basit bir gülümseme, hep aynı"); yüz kutusu saçsız ölçülür
    const yuzKutusu = new THREE.Box3();
    for (const { mesh, parca } of meshler) if (parca.rol === 'ten' && parca.bolum === 'bas') yuzKutusu.expandByObject(mesh, true);
    kemigeTak(basKemigi, gulumseme(yuzKutusu.isEmpty() ? basKutusu : yuzKutusu, basOrtasi));
  }
  // Yükleyici kemik adlarındaki noktayı siler: UpperLeg.L → UpperLegL
  const kalcaKemigi = kemikler.UpperLegL;
  const kalca = kalcaKemigi ? kalcaKemigi.getWorldPosition(new THREE.Vector3()).y : v.boy * 0.5;


  // Oturma: uyluklar öne 90°, baldırlar aşağı (dünyada, karakterin yan ekseninde)
  const eksen = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const ust = new THREE.Quaternion();
  const dunyada = new THREE.Quaternion();
  const bük = (kemik: THREE.Object3D | undefined, aci: number) => {
    if (!kemik?.parent) return;
    kemik.parent.updateWorldMatrix(true, false);
    kemik.getWorldQuaternion(dunyada);
    q.setFromAxisAngle(eksen, aci);
    dunyada.premultiply(q);
    kemik.parent.getWorldQuaternion(ust);
    kemik.quaternion.copy(ust.invert().multiply(dunyada));
    kemik.updateWorldMatrix(false, true);
  };
  const oturt = () => {
    kok.updateMatrixWorld(true);
    eksen.set(1, 0, 0).applyQuaternion(kok.getWorldQuaternion(q)).normalize();
    for (const yan of ['L', 'R']) {
      bük(kemikler[`UpperLeg${yan}`], -Math.PI / 2);
      bük(kemikler[`LowerLeg${yan}`], Math.PI / 2);
    }
  };
  const tak = (kemikAdi: string, nesne: THREE.Object3D) => {
    const kemik = kemikler[kemikAdi];
    if (kemik) kemigeTak(kemik, nesne);
  };
  // Kesit: köşeler dinlenme duruşunda okunur (yalnız önlük gibi takılanlar
  // istediğinde; yayalarda boşuna hesaplanmasın)
  const ortaX = (govdeKutusu.min.x + govdeKutusu.max.x) / 2;
  const n = new THREE.Vector3();
  const kesit = (altY: number, ustY: number, yariEn: number) => {
    const k = new THREE.Box3();
    for (const { mesh, parca } of meshler) {
      if (parca.bolum === 'bas') continue;
      const sayi = mesh.geometry.attributes.position.count;
      for (let i = 0; i < sayi; i++) {
        mesh.getVertexPosition(i, n).applyMatrix4(mesh.matrixWorld);
        if (n.y >= altY && n.y <= ustY && Math.abs(n.x - ortaX) <= yariEn) k.expandByPoint(n);
      }
    }
    return k;
  };
  return { kok, karistirici, eylemler, govdeKemigi: kemikler.Chest ?? null, govdeKutusu, kalca, oturt, tak, kesit };
}

// ---- Rastgele müşteri ----
// Kıyafet renkleri paletten (belge 0.7): mor ve sarı yalnız dükkânın önlüğünde
const UST_RENKLERI = ['#5f8fa8', '#c8705a', '#e7c9b8', '#93b86a', '#f4efe6', '#2f93c4', '#e9d6bd', '#a87650', '#6f9157', '#fbf1e3', '#2f7fb3', '#c9b9a3'];
const ALT_RENKLERI = ['#2f7fb3', '#5f8fa8', '#7a5236', '#c9b9a3', '#6f9157', '#e8d3ad', '#a87650', '#4a5568'];
const AYAKKABI_RENKLERI = ['#7a5236', '#f4efe6', '#a87650', '#c8705a', '#4a5568'];
export const MUSTERI_TENLERI = ['#f3cfae', '#e3b08a', '#c98e66', '#9a6545', '#6b4430'];
export const MUSTERI_SACLARI = ['#2b211c', '#5a3825', '#8a5a34', '#c98a4a', '#e8cf8a', '#9a9aa2', '#3a2a22'];

// Tohumdan (müşteri numarası) her seferinde aynı varyant
export function rastgeleVaryant(tohum: number): Varyant {
  let t = tohum * 9301 + 49297;
  const r = () => {
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
  const sec = <T,>(dizi: readonly T[]) => dizi[Math.floor(r() * dizi.length)];
  const cinsiyet: Cinsiyet = r() < 0.5 ? 'kadin' : 'erkek';
  const aks = r();
  return {
    cinsiyet,
    govde: sec(BEDENLER[cinsiyet]),
    bas: sec(BEDENLER[cinsiyet]),
    // Boylar karışık (belge 0.7): kadın 1,55–1,75, erkek 1,65–1,85
    boy: cinsiyet === 'kadin' ? 1.55 + r() * 0.2 : 1.65 + r() * 0.2,
    ten: sec(MUSTERI_TENLERI),
    sac: sec(MUSTERI_SACLARI),
    ust: sec(UST_RENKLERI),
    alt: sec(ALT_RENKLERI),
    ayakkabi: sec(AYAKKABI_RENKLERI),
    aksesuarlar: aks < 0.15 ? ['hasirSapka'] : aks < 0.25 ? ['gunesGozlugu'] : aks < 0.32 ? ['gozluk'] : aks < 0.38 ? ['kupe'] : [],
  };
}
