import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, useDurum } from '../oyun/durum';
import { ONLUKLER, SAC_RENKLERI, TENLER, type CalisanGorunumu, type Onluk } from '../oyun/calisan';
import { InsanKarakter, type Hareket } from './InsanKarakter';
import type { Karakter, Varyant } from './karakterler';
import { istasyonOdagi, kameraKarisimi, odak, tezgahOfseti } from './kameraKarisimi';
import { renk } from './renkler';

// Tezgahın arkasındaki çalışan (Kemal, 13 Ekim). Genel görünümde görünür;
// tezgah görünümünde kamera onun yerinde olduğu için gizlenir.
// müşterilerle aynı Quaternius parçalarından (belge 0.9).

export const CALISAN_YERI = new THREE.Vector3(0, 0, 0.75);

// Önlük deseni: düz, çizgili ya da puantiyeli doku
function onlukDokusu(o: Onluk) {
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

// Saç modeli → paketteki baş (belge 0.9; şapkalı ve baretli başlar seçilmez).
// Saçlar ileride başlardan ayrılıp ayrı seçilebilir (Kemal, 14 Ekim gece)
const SAC_BASI: Record<CalisanGorunumu['beden'], Record<CalisanGorunumu['sac'], string>> = {
  kadin: { kisa: 'formal', uzun: 'casual', topuz: 'suit', kivircik: 'formal' },
  erkek: { kisa: 'casual_2', uzun: 'casual_hoodie', topuz: 'suit', kivircik: 'beach' },
};
// Deneme için gündelik kıyafet (Kemal: "değiştirebilelim, şimdilik casual")
const CALISAN_GOVDESI: Record<CalisanGorunumu['beden'], string> = { kadin: 'casual', erkek: 'casual_2' };
const CALISAN_BOYU: Record<CalisanGorunumu['beden'], number> = { kadin: 1.68, erkek: 1.76 };

export function Calisan() {
  const { calisan } = useDurum();
  const ref = useRef<THREE.Group>(null);
  const hareket = useRef<Hareket>('dur');
  const v = useMemo(() => new THREE.Vector3(), []);
  const onluk = ONLUKLER.find((o) => o.id === calisan.onluk) ?? ONLUKLER[0];
  const doku = useMemo(() => onlukDokusu(onluk), [onluk]);
  // Çalışan da müşterilerle aynı parçalardan (belge 0.9)
  const varyant = useMemo<Varyant>(
    () => ({
      cinsiyet: calisan.beden,
      govde: CALISAN_GOVDESI[calisan.beden],
      bas: SAC_BASI[calisan.beden][calisan.sac],
      boy: CALISAN_BOYU[calisan.beden],
      ten: TENLER[calisan.ten],
      sac: SAC_RENKLERI[calisan.sacRengi],
      ust: '#f6ecd6',
      alt: '#2f7fb3',
      ayakkabi: '#7a5236',
      aksesuarlar: calisan.aksesuarlar,
    }),
    [calisan.beden, calisan.sac, calisan.ten, calisan.sacRengi, calisan.aksesuarlar],
  );
  // Önlük gövdenin önüne takılır; renk ve desen değişince doku yenilenir
  const onlukMalzemesi = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85 }), []);
  onlukMalzemesi.map = doku;
  onlukMalzemesi.needsUpdate = true;
  // Önlük: göğüsten dizlere, gövdenin önünde; kalçaya bağlı (eğilince onunla eğilir)
  const onlukTak = (k: Karakter) => {
    const boy = k.kalca * 0.75;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, boy), onlukMalzemesi);
    m.position.set(0, k.kalca * 1.05, k.govdeKutusu.max.z * 0.62);
    k.tak('Hips', m);
  };

  useFrame(({ camera, size }) => {
    const g = ref.current;
    if (!g) return;
    g.visible = kameraKarisimi.deger > 0.12;
    const d = durumuOku();
    // Oyuncunun istasyonunda durur (belge 0.5)
    g.position.x = CALISAN_YERI.x + istasyonOdagi.x;
    // Kepçe dalarken ya da makinede çalışırken uzanır
    hareket.current = d.asama === 'dolduruyor' || ['dokuluyor', 'doluyor'].includes(d.makine.asama) ? 'calis' : 'dur';
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
        <InsanKarakter varyant={varyant} hareket={hareket} ekle={onlukTak} />
      </group>
    </group>
  );
}
