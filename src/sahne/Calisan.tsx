import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, useDurum } from '../oyun/durum';
import { gecerliSac, ONLUK_ACIK, ONLUK_YOK, ONLUKLER, SAC_RENKLERI, TENLER, type CalisanGorunumu, type Onluk } from '../oyun/calisan';
import { InsanKarakter, type Hareket } from './InsanKarakter';
import type { Karakter, KarakterAksesuari, Varyant } from './karakterler';
import { istasyonOdagi, kameraKarisimi, odak, tezgahOfseti } from './kameraKarisimi';
import { renk } from './renkler';

// Tezgahın arkasındaki çalışan (Kemal, 13 Ekim). Genel görünümde görünür;
// tezgah görünümünde kamera onun yerinde olduğu için gizlenir.
// müşterilerle aynı Quaternius parçalarından (belge 0.9).

export const CALISAN_YERI = new THREE.Vector3(0, 0, 0.75);

// Önlük deseni: düz, çizgili ya da puantiyeli doku
export function onlukDokusu(o: Onluk) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = o.renk;
  g.fillRect(0, 0, 64, 64);
  if (o.desen === 'cizgili' && o.ikinciRenk) {
    g.fillStyle = o.ikinciRenk;
    for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 8, 64);
  } else if (o.desen === 'puantiye' && o.ikinciRenk) {
    g.fillStyle = o.ikinciRenk;
    for (let y = 6; y < 64; y += 16)
      for (let x = (y / 16) % 2 ? 14 : 6; x < 64; x += 16) {
        g.beginPath();
        g.arc(x, y, 3.5, 0, Math.PI * 2);
        g.fill();
      }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Adın ekrandaki yeri: başının üstü (arayüz öğeyi buraya bağlar)
export const calisanEtiketi: { oge: HTMLDivElement | null } = { oge: null };

// Deneme için gündelik kıyafet (Kemal: "değiştirebilelim, şimdilik casual")
const CALISAN_GOVDESI: Record<CalisanGorunumu['beden'], string> = { kadin: 'casual', erkek: 'casual_2' };
// Dükkân üniforması (belge 0.12): sarı tişört, mor kasket, mor önlük
export const UNIFORMA_USTU = '#ffc928';
export function uniformaAksesuari(aksesuarlar: KarakterAksesuari[]): KarakterAksesuari[] {
  return aksesuarlar.some((a) => a === 'bandana' || a === 'kasket') ? aksesuarlar : [...aksesuarlar, 'kasket'];
}
const CALISAN_BOYU: Record<CalisanGorunumu['beden'], number> = { kadin: 1.68, erkek: 1.76 };

// Bedene oturan önlük (belge 0.12; Kemal: "önlük berbat görünüyor"): gövdenin
// önünü saran iki kavisli parça. Etek kalçaya, göğüslük göğse bağlı;
// eğilince ve yürürken bedenle birlikte oynar.
export function onlukTakici(malzeme: THREE.Material) {
  return (k: Karakter) => {
    const bel = k.kalca * 1.12;
    const diz = k.kalca * 0.5;
    const gogus = k.kalca * 1.42;
    const yariEn = k.kalca * 0.2; // kollar kesite girmesin
    // Bedenin o hizadaki gerçek kesitine göre oval bir kabuk (önü +z)
    const kabuk = (alt: number, ust: number, aci: number, bolum: number, acilma: number) => {
      const ks = k.kesit(alt, ust, yariEn);
      const orta = ks.getCenter(new THREE.Vector3());
      const boyut = ks.getSize(new THREE.Vector3());
      const rz = boyut.z / 2 + 0.012;
      const geo = new THREE.CylinderGeometry(rz, rz * acilma, ust - alt, bolum, 1, true, -aci / 2, aci);
      const m = new THREE.Mesh(geo, malzeme);
      m.scale.x = (boyut.x / 2 + 0.012) / rz;
      m.position.set(orta.x, (alt + ust) / 2, orta.z);
      return m;
    };
    // Etek: belden dizlere, aşağı doğru hafif açılır; bacakların önünü sarar
    k.tak('Hips', kabuk(diz, bel, 2.2, 14, 1.12));
    // Göğüslük: belden göğse, daha dar
    k.tak('Chest', kabuk(bel, gogus, 1.3, 10, 1));
    // Bel bağı
    k.tak('Hips', kabuk(bel - 0.04, bel + 0.03, 3.4, 16, 1));
  };
}

export function Calisan() {
  const { calisan } = useDurum();
  const ref = useRef<THREE.Group>(null);
  const hareket = useRef<Hareket>('dur');
  const v = useMemo(() => new THREE.Vector3(), []);
  // Üniformada önlük mor
  const onlukVar = calisan.uniforma || calisan.onluk !== ONLUK_YOK;
  const onluk = ONLUKLER.find((o) => o.id === (calisan.uniforma ? 'mor' : calisan.onluk)) ?? ONLUKLER[0];
  const doku = useMemo(() => onlukDokusu(onluk), [onluk]);
  // Çalışan da müşterilerle aynı parçalardan (belge 0.9)
  // Yüz hep aynı baştan; saç ayrı seçilir (belge 0.12: saçlar başlardan ayrıldı),
  // kıyafet paketteki bedenlerden; üniformada sarı tişört ve mor kasket
  const varyant = useMemo<Varyant>(() => {
    return {
      cinsiyet: calisan.beden,
      govde: calisan.kiyafet || CALISAN_GOVDESI[calisan.beden],
      bas: CALISAN_GOVDESI[calisan.beden],
      sacBasi: gecerliSac(calisan.beden, calisan.sac).bas,
      boy: CALISAN_BOYU[calisan.beden],
      ten: TENLER[calisan.ten],
      sac: SAC_RENKLERI[calisan.sacRengi],
      ust: calisan.uniforma ? UNIFORMA_USTU : '#f6ecd6',
      alt: '#2f7fb3',
      ayakkabi: '#7a5236',
      aksesuarlar: calisan.uniforma ? uniformaAksesuari(calisan.aksesuarlar) : calisan.aksesuarlar,
    };
  }, [calisan.beden, calisan.sac, calisan.ten, calisan.sacRengi, calisan.aksesuarlar, calisan.kiyafet, calisan.uniforma]);
  // Önlük gövdenin önüne takılır; renk ve desen değişince doku yenilenir
  const onlukMalzemesi = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide }), []);
  onlukMalzemesi.map = doku;
  onlukMalzemesi.needsUpdate = true;
  const onlukTak = useMemo(() => onlukTakici(onlukMalzemesi), [onlukMalzemesi]);

  const selamZamani = useRef(15);
  useFrame(({ camera, size, clock }) => {
    const g = ref.current;
    if (!g) return;
    g.visible = kameraKarisimi.deger > 0.12;
    const d = durumuOku();
    // Oyuncunun istasyonunda durur (belge 0.5)
    g.position.x = CALISAN_YERI.x + istasyonOdagi.x;
    // Kepçe dalarken ya da makinede çalışırken uzanır
    const calisiyor = d.asama === 'dolduruyor' || ['dokuluyor', 'doluyor'].includes(d.makine.asama);
    // Boştayken genel görünümde ara sıra el sallar (belge 0.12)
    const t = clock.elapsedTime;
    if (t > selamZamani.current + 2) selamZamani.current = t + 25 + Math.random() * 20;
    hareket.current = calisiyor ? 'calis' : g.visible && t > selamZamani.current ? 'selam' : 'dur';
    const etiket = calisanEtiketi.oge;
    if (etiket) {
      v.set(g.position.x + tezgahOfseti.x, 2.0, CALISAN_YERI.z + tezgahOfseti.z).project(camera);
      etiket.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      etiket.style.opacity = g.visible && d.calisan.ad && !odak.calisan ? '1' : '0';
    }
  });

  return (
    <group ref={ref} position={CALISAN_YERI.toArray()} rotation={[0, Math.PI, 0]}>
      <group>
        <InsanKarakter key={onlukVar ? 'onluklu' : 'onluksuz'} varyant={varyant} hareket={hareket} ekle={ONLUK_ACIK && onlukVar ? onlukTak : undefined} />
      </group>
    </group>
  );
}
