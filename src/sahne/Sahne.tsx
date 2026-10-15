import { Suspense, useLayoutEffect } from 'react';
import { Canvas, events, useFrame, useThree, type RootState } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { albumCekildi, albumZamani, durumuOku, istasyonX, kayitYuvasi, saatDakikasi, havaNe } from '../oyun/durum';
import { fotoEkle } from '../oyun/galeri';
import { gezmeSaati, gokRenkleri, havaGorunusu, tabelaIsigi } from './gokRenkleri';
import type { Hava } from '../oyun/hava';
import { Bulutlar, Yagmur } from './HavaEtkileri';
import { useEkranAyari } from '../arayuz/ekranAyari';
import * as THREE from 'three';
import { Disari } from './Disari';
import { parselCoz, parselSiniri } from '../oyun/dekorasyon';
import { alanCercevesi, istasyonOdagi, tezgahOfseti, dukkanDonusu, dukkanEgimi, dukkanKaydirma, dukkanYakinligi, fotograf, kameraKarisimi, odak, tezgahDikligi } from './kameraKarisimi';
import { Calisan } from './Calisan';
import { Sahip } from './Sahip';
import { Dukkan, TezgahGrubu } from './Dukkan';
import { Hazirlama } from './Hazirlama';
import { Musteriler } from './Musteriler';
import { EgitimTakibi } from './EgitimTakibi';
import { Dekorlar } from './Dekorlar';
import { Insaat } from './Insaat';
import { renk } from './renkler';

// İki sabit kamera (belge bölüm 0): dükkânın genel görünümü ve tezgahın
// arkasından yakın plan. Aralarında yumuşak geçiş; oyuncu yürümez.
// Ekran ne kadar geniş ya da dar olursa olsun yatayda aşağı yukarı aynı
// alanı göstersin diye görüş açısı ekran oranına göre ayarlanır.
const TEZGAH = { konum: new THREE.Vector3(0, 1.95, 1.5), hedef: new THREE.Vector3(0, 0.9, -4), yatay: 80 };
// Vitrin iki sıra olunca (6'dan fazla küvet): biraz daha yukarıdan ve dik bakış
const TEZGAH_DIK = { konum: new THREE.Vector3(0.12, 2.25, 1.3), hedef: new THREE.Vector3(0.12, 0.55, -2.9), yatay: 80 };
// Genel görünüm dükkânın önünden (deniz / müşteri tarafı) çeker (Kemal, 13 Ekim)
// Çalışanı kişiselleştirirken: müşteri tarafından ona yakından bakış (sağda panel olduğu için çalışan solda)
const CALISAN_ODAGI = { konum: new THREE.Vector3(-0.62, 2.15, -1.95), hedef: new THREE.Vector3(-0.68, 1.0, 0.75) };

const DUKKAN = { konum: new THREE.Vector3(-13.5, 15.5, -20), hedef: new THREE.Vector3(-0.4, 0.2, -1.6), yatay: 50 };


// Alınmış arazinin ortası (başlangıç arazisine göre kayma) ve ne kadar geri
// çekilmek gerektiği. Başlangıç arazisi 8 m geniş, 8 m derin.
const BASLANGIC_MERKEZI = { x: 0, z: -2.4 };
let sonArazi = '';
let sonCerceve = { merkezX: 0, merkezZ: 0, olcek: 1 };
function araziCercevesi(parseller: string[]) {
  const anahtar = parseller.join('|');
  if (anahtar === sonArazi) return sonCerceve;
  let solX = Infinity, sagX = -Infinity, onZ = Infinity, arkaZ = -Infinity;
  for (const p of parseller) {
    const { i, j } = parselCoz(p);
    const s = parselSiniri(i, j);
    solX = Math.min(solX, s.solX);
    sagX = Math.max(sagX, s.sagX);
    onZ = Math.min(onZ, s.onZ);
    arkaZ = Math.max(arkaZ, s.arkaZ);
  }
  sonArazi = anahtar;
  sonCerceve = {
    merkezX: (solX + sagX) / 2 - BASLANGIC_MERKEZI.x,
    merkezZ: (onZ + arkaZ) / 2 - BASLANGIC_MERKEZI.z,
    olcek: Math.max(1, (sagX - solX) / 16, (arkaZ - onZ) / 11),
  };
  return sonCerceve;
}

function dikeyAci(yatayDerece: number, oran: number) {
  const yatay = THREE.MathUtils.degToRad(yatayDerece);
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(yatay / 2) / oran));
}

// Albümün bakışı (belge 0.12): oyuncunun döndürmesinden bağımsız, genel
// görünümün biraz yanından ve geriden, bütün dükkânı alan sabit bir açı
const ALBUM = { donus: 0.15, yakinlik: 1.05 };

// Fotoğraf çekmek için o anki görüntüyü verir; ayda bir albüm fotoğrafını
// kendiliğinden çeker (ayrı kamerayla, ekranda görünmeden)
function FotografMakinesi() {
  const { gl, scene, camera, size } = useThree();
  const albumKamerasi = useMemo(() => new THREE.PerspectiveCamera(40, 1, 0.05, 900), []);
  const bekliyor = useRef(false);
  useFrame(() => {
    // Genel görünümdeyken (tezgahta çalışan gizli, yakın plan eşyaları ortada)
    if (bekliyor.current || kameraKarisimi.deger < 0.99 || odak.calisan || !albumZamani()) return;
    const d = durumuOku();
    const alan = araziCercevesi(d.parseller);
    const fark = DUKKAN.konum.clone().sub(DUKKAN.hedef).multiplyScalar(ALBUM.yakinlik * alan.olcek);
    fark.applyAxisAngle(new THREE.Vector3(0, 1, 0), ALBUM.donus);
    const hedef = DUKKAN.hedef.clone().add(new THREE.Vector3(alan.merkezX, 0, alan.merkezZ));
    albumKamerasi.position.copy(hedef).add(fark);
    albumKamerasi.lookAt(hedef);
    albumKamerasi.aspect = size.width / size.height;
    albumKamerasi.fov = THREE.MathUtils.clamp(dikeyAci(DUKKAN.yatay, albumKamerasi.aspect), 22, 48);
    albumKamerasi.updateProjectionMatrix();
    // Bu karede önce albüm için çizilir, hemen ardından oyun kendi kamerasıyla
    // yeniden çizer; ekranda bir şey değişmez
    gl.render(scene, albumKamerasi);
    const resim = gl.domElement.toDataURL('image/jpeg', 0.88);
    bekliyor.current = true;
    const gun = d.gun;
    albumCekildi();
    void fotoEkle(kayitYuvasi(), 'album', gun, resim).finally(() => (bekliyor.current = false));
  });
  useLayoutEffect(() => {
    fotograf.cek = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/jpeg', 0.9);
    };
    return () => {
      fotograf.cek = null;
    };
  }, [gl, scene, camera]);
  return null;
}

function KameraYoneticisi() {
  const { camera, size } = useThree();
  const hedef = useRef(new THREE.Vector3());
  const konum = useRef(new THREE.Vector3());
  const dukkanKonumu = useRef(new THREE.Vector3());
  const yakinlik = useRef(dukkanYakinligi.deger);
  const donus = useRef(0);
  const acilisDonusu = useRef(0);
  const egim = useRef(0);
  const odakKarisimi = useRef(0);
  const kayma = useRef(new THREE.Vector3());
  const dukkanHedefi = useRef(new THREE.Vector3());
  const tezgahKonumu = useRef(new THREE.Vector3());
  const tezgahHedefi = useRef(new THREE.Vector3());
  const calisanOdakKonumu = useMemo(() => new THREE.Vector3(), []);
  const calisanOdakHedefi = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const kamera = camera as THREE.PerspectiveCamera;
    const istenen = durumuOku().kamera === 'dukkan' ? 1 : 0;
    // Yaklaşık bir saniyelik yumuşak geçiş
    const k = kameraKarisimi;
    k.deger += Math.sign(istenen - k.deger) * Math.min(Math.abs(istenen - k.deger), dt * 1.1);
    const t = k.deger * k.deger * (3 - 2 * k.deger); // yavaş başla, yavaş bitir
    // Geçişte kamera kısa bir yay çizer: önce biraz yükselir
    // Yakınlaştırma: hedefe doğru yaklaşıp uzaklaşır, yumuşakça
    // Açılışta biraz geriden: dükkânla birlikte liman ve gün batımı da görünsün
    yakinlik.current = THREE.MathUtils.damp(yakinlik.current, dukkanYakinligi.deger * (durumuOku().acilis ? 1.35 : 1), 10, dt);
    // Genel görünümde oyuncu dükkânın çevresinde döner ve aşağı yukarı bakar
    const d = durumuOku();
    // Açılış ekranında kamera dükkânın çevresinde yavaşça döner (belge 0.12);
    // oyun başlayınca en kısa yoldan oyuncunun bakışına döner
    if (d.acilis) acilisDonusu.current += dt * 0.05;
    else if (acilisDonusu.current !== 0) {
      donus.current -= Math.round(acilisDonusu.current / (Math.PI * 2)) * Math.PI * 2;
      acilisDonusu.current = 0;
    }
    donus.current = THREE.MathUtils.damp(donus.current, dukkanDonusu.deger + acilisDonusu.current, 8, dt);
    egim.current = THREE.MathUtils.damp(egim.current, dukkanEgimi.deger, 8, dt);
    // Varsayılan bakışın yerden yüksekliği (açı) ile uzaklığı; eğim açıya eklenir
    const fark = DUKKAN.konum.clone().sub(DUKKAN.hedef);
    const yerde = Math.hypot(fark.x, fark.z);
    const aci = Math.atan2(fark.y, yerde) + egim.current;
    // Arazi büyüdükçe görünüm geri çekilir ve arazinin ortasına bakar
    const alan = araziCercevesi(d.parseller);
    alanCercevesi.olcek = THREE.MathUtils.damp(alanCercevesi.olcek, alan.olcek, 3, dt);
    alanCercevesi.merkezX = THREE.MathUtils.damp(alanCercevesi.merkezX, alan.merkezX, 3, dt);
    alanCercevesi.merkezZ = THREE.MathUtils.damp(alanCercevesi.merkezZ, alan.merkezZ, 3, dt);
    const uzaklik = fark.length() * yakinlik.current * alanCercevesi.olcek;
    dukkanKonumu.current
      .set((fark.x / yerde) * Math.cos(aci) * uzaklik, Math.sin(aci) * uzaklik, (fark.z / yerde) * Math.cos(aci) * uzaklik)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), donus.current)
      .add(DUKKAN.hedef);
    // Kaydırma: bakılan nokta ve kamera birlikte kayar, açı değişmez
    kayma.current.x = THREE.MathUtils.damp(kayma.current.x, dukkanKaydirma.x, 12, dt);
    kayma.current.z = THREE.MathUtils.damp(kayma.current.z, dukkanKaydirma.z, 12, dt);
    dukkanKonumu.current.add(kayma.current);
    dukkanKonumu.current.x += alanCercevesi.merkezX;
    dukkanKonumu.current.z += alanCercevesi.merkezZ;
    dukkanHedefi.current.copy(DUKKAN.hedef).add(kayma.current);
    dukkanHedefi.current.x += alanCercevesi.merkezX;
    dukkanHedefi.current.z += alanCercevesi.merkezZ;
    // Tezgah pozu: vitrin büyüyünce dikleşir
    const dik = (tezgahDikligi.deger = THREE.MathUtils.damp(tezgahDikligi.deger, d.vitrin.length > 6 ? 1 : 0, 4, dt));
    // Tezgah bölümü taşınınca yakın plan da onunla gider (belge 0.3)
    istasyonOdagi.x = THREE.MathUtils.damp(istasyonOdagi.x, istasyonX(d), 6, dt);
    tezgahKonumu.current.lerpVectors(TEZGAH.konum, TEZGAH_DIK.konum, dik).add(tezgahOfseti);
    tezgahHedefi.current.lerpVectors(TEZGAH.hedef, TEZGAH_DIK.hedef, dik).add(tezgahOfseti);
    tezgahKonumu.current.x += istasyonOdagi.x;
    tezgahHedefi.current.x += istasyonOdagi.x;
    konum.current.lerpVectors(tezgahKonumu.current, dukkanKonumu.current, t);
    konum.current.y += Math.sin(t * Math.PI) * 0.8;
    hedef.current.lerpVectors(tezgahHedefi.current, dukkanHedefi.current, t);
    const oran = size.width / size.height;
    const fovTezgah = THREE.MathUtils.clamp(dikeyAci(THREE.MathUtils.lerp(TEZGAH.yatay, TEZGAH_DIK.yatay, dik), oran), 38, 66);
    const fovDukkan = THREE.MathUtils.clamp(dikeyAci(DUKKAN.yatay, oran), 22, 48);
    kamera.fov = THREE.MathUtils.lerp(fovTezgah, fovDukkan, t);
    // Çalışan ekranı açıksa kamera çalışana yaklaşır
    odakKarisimi.current = THREE.MathUtils.damp(odakKarisimi.current, odak.calisan ? 1 : 0, 5, dt);
    const o = odakKarisimi.current;
    if (o > 0.001) {
      konum.current.lerp(calisanOdakKonumu.copy(CALISAN_ODAGI.konum).add(tezgahOfseti).setX(CALISAN_ODAGI.konum.x + tezgahOfseti.x + istasyonOdagi.x), o);
      hedef.current.lerp(calisanOdakHedefi.copy(CALISAN_ODAGI.hedef).add(tezgahOfseti).setX(CALISAN_ODAGI.hedef.x + tezgahOfseti.x + istasyonOdagi.x), o);
      kamera.fov = THREE.MathUtils.lerp(kamera.fov, 40, o);
    }
    kamera.position.copy(konum.current);
    kamera.lookAt(hedef.current);
    kamera.updateProjectionMatrix();
  });
  return null;
}

// Işık saate göre (yaz akşamı, Ege): öğleden sonra güneş alçalır,
// 19:30–20:30 gün batımı, sonra gece. Gece dükkânın içi ve ampuller öne çıkar.
const ACILIS_SAATI = 19.7;
const OGLE = new THREE.Color('#fff4e2');
const AKSAM = new THREE.Color('#ff9a5a');
const GOK_UST_GUNDUZ = new THREE.Color(renk.gokUst);
const GOK_UFUK_GUNDUZ = new THREE.Color(renk.gokUfuk);
const GOK_UFUK_BATIM = new THREE.Color('#ffb07a');
const GOK_UST_GECE = new THREE.Color('#0f1a3d');
const GOK_UFUK_GECE = new THREE.Color('#2c3566');
// Hava (belge 0.15): kapalı gök grisi, sıcakta solgun ufuk ve sarı güneş
const GOK_UST_KAPALI = new THREE.Color('#8e9aa8');
const GOK_UFUK_KAPALI = new THREE.Color('#bcc4cd');
const GOK_UFUK_SICAK = new THREE.Color('#f6e3bd');
const GUNES_SICAK = new THREE.Color('#ffd27a');
const GUNES_KAPALI = new THREE.Color('#d9dee4');
const HAVA_HEDEFI: Record<Hava, typeof havaGorunusu> = {
  gunesli: { bulut: 0.1, yagmur: 0, sicak: 0, ruzgar: 0.2 },
  sicak: { bulut: 0, yagmur: 0, sicak: 1, ruzgar: 0.05 },
  bulutlu: { bulut: 0.75, yagmur: 0, sicak: 0, ruzgar: 1 },
  yagmurlu: { bulut: 1, yagmur: 1, sicak: 0, ruzgar: 0.6 },
};

function Isiklar() {
  const { grafik } = useEkranAyari();
  const gunes = useRef<THREE.DirectionalLight>(null);
  const yarimKure = useRef<THREE.HemisphereLight>(null);
  const icIsik = useRef<THREE.PointLight>(null);
  const { scene } = useThree();
  useFrame((_, dt) => {
    const isik = gunes.current;
    if (!isik) return;
    const d = durumuOku();
    // Hava hedefe birkaç saniyede kayar; açılış ekranında hep açık gün batımı
    const hedef = HAVA_HEDEFI[d.acilis ? 'gunesli' : havaNe(d)];
    const k = Math.min(1, dt * 0.6);
    for (const a of ['bulut', 'yagmur', 'sicak', 'ruzgar'] as const) havaGorunusu[a] += (hedef[a] - havaGorunusu[a]) * k;
    const { bulut, yagmur, sicak } = havaGorunusu;
    // Gezerken gece / gündüz düğmesi ışığın saatini seçebilir
    // Açılış ekranında dükkân gün batımında (belge 0.12)
    const secilen = d.gezme ? gezmeSaati() : d.acilis ? ACILIS_SAATI : null;
    const saat = secilen ?? saatDakikasi(d) / 60;
    const aksam = THREE.MathUtils.smoothstep(saat, 16.5, 20); // güneş alçalır, turuncuya döner
    const gece = THREE.MathUtils.smoothstep(saat, 20, 21.5); // gök kararır
    const batim = aksam * (1 - gece);
    // Tabelalar güneş batarken yanar (saat ~19), sabah 7'ye doğru söner
    tabelaIsigi.deger = Math.max(THREE.MathUtils.smoothstep(saat, 18.5, 19.5), 1 - THREE.MathUtils.smoothstep(saat, 6, 7));

    isik.color.copy(OGLE).lerp(GUNES_SICAK, sicak * 0.8).lerp(AKSAM, aksam).lerp(GUNES_KAPALI, bulut * 0.5);
    isik.intensity = ((2.6 - aksam * 1.2) * (1 - gece) + gece * 0.25) * (1 - bulut * 0.6 - yagmur * 0.15) * (1 + sicak * 0.2);
    isik.position.set(6 - aksam * 12, 11 - aksam * 7 + gece * 6, 5);
    if (yarimKure.current) yarimKure.current.intensity = (0.9 - gece * 0.55) * (1 - yagmur * 0.25 - bulut * 0.2);
    if (icIsik.current) icIsik.current.intensity = 2.5 + gece * 3;

    gokRenkleri.ust.copy(GOK_UST_GUNDUZ).lerp(GOK_UST_GECE, gece);
    gokRenkleri.ufuk.copy(GOK_UFUK_GUNDUZ).lerp(GOK_UFUK_SICAK, sicak * 0.45 * (1 - aksam)).lerp(GOK_UFUK_BATIM, batim * (1 - bulut * 0.6)).lerp(GOK_UFUK_GECE, gece);
    // Kapalı hava: gök grileşir (gece pek fark etmez)
    const kapali = Math.min(1, bulut * 0.55 + yagmur * 0.35) * (1 - gece * 0.7);
    gokRenkleri.ust.lerp(GOK_UST_KAPALI, kapali);
    gokRenkleri.ufuk.lerp(GOK_UFUK_KAPALI, kapali);
    // Yağmurda uzak görünmez olur
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 90 - yagmur * 50;
      scene.fog.far = 320 - yagmur * 150;
    }
    if (scene.background instanceof THREE.Color) scene.background.copy(gokRenkleri.ufuk);
    if (scene.fog) scene.fog.color.copy(gokRenkleri.ufuk);
  });
  return (
    <>
      <hemisphereLight ref={yarimKure} args={['#cfe6f7', renk.ahsapOrta, 0.9]} />
      <ambientLight intensity={0.25} color="#fff1df" />
      {/* Güneş: arkadan-sağdan, gölgeler tezgaha düşer */}
      <directionalLight
        ref={gunes}
        position={[6, 11, 5]}
        intensity={2.6}
        color="#fff4e2"
        castShadow={grafik !== 'dusuk'}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      {/* Dükkân içine sıcak dolgu ışığı */}
      <pointLight ref={icIsik} position={[0, 2.8, 0.2]} intensity={2.5} distance={7} color="#ffd9a8" />
    </>
  );
}

// Telefon dik tutulunca oyun CSS ile 90° çevrilir (stil.css). Parmağın
// ekrandaki yerini çevrilmiş oyunun içindeki yere dönüştürür.
function ekrandanSahneye(x: number, y: number) {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return { x: y, y: window.innerWidth - x };
  }
  return { x, y };
}

function dokunmaOlaylari(store: Parameters<typeof events>[0]) {
  return {
    ...events(store),
    compute(olay: { clientX: number; clientY: number }, durum: RootState) {
      const { x, y } = ekrandanSahneye(olay.clientX, olay.clientY);
      durum.pointer.set((x / durum.size.width) * 2 - 1, -(y / durum.size.height) * 2 + 1);
      durum.raycaster.setFromCamera(durum.pointer, durum.camera);
    },
  };
}

export function Sahne() {
  // Grafik kalitesi (belge 0.12): çözünürlük ve gölge
  const { grafik } = useEkranAyari();
  return (
    <Canvas
      shadows="percentage"
      dpr={grafik === 'dusuk' ? 1 : grafik === 'orta' ? [1, 1.5] : [1, 2]}
      // Çevrilmiş hâlde de doğru boyu ölçsün (döndürmeyi hesaba katmadan)
      resize={{ offsetSize: true }}
      events={dokunmaOlaylari}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ near: 0.05, far: 900 }}
      onCreated={({ gl }) => {
        // Pastel renkler soluklaşmasın diye yumuşak ton eşleme.
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <color attach="background" args={[renk.gokUfuk]} />
      <fog attach="fog" args={[renk.gokUfuk, 90, 320]} />
      <KameraYoneticisi />
      <FotografMakinesi />
      <Isiklar />
      <Bulutlar />
      <Yagmur />
      <Suspense fallback={null}>
        <Disari />
        <Dukkan />
        <TezgahGrubu>
          <Hazirlama />
          <Calisan />
        </TezgahGrubu>
        <Musteriler />
        <EgitimTakibi />
        <Dekorlar />
        <Insaat />
        <Sahip />
      </Suspense>
    </Canvas>
  );
}
