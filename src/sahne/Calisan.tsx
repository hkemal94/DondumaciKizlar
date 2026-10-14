import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku, useDurum } from '../oyun/durum';
import { ONLUKLER, SAC_RENKLERI, TENLER, type CalisanGorunumu, type Onluk } from '../oyun/calisan';
import { KenneyKarakter, type Hareket } from './KenneyKarakter';
import type { Karakter, Varyant } from './karakterler';
import { kameraKarisimi, odak, tezgahOfseti } from './kameraKarisimi';
import { renk } from './renkler';

// Tezgahın arkasındaki çalışan (Kemal, 13 Ekim). Genel görünümde görünür;
// tezgah görünümünde kamera onun yerinde olduğu için gizlenir.
// Kenney Mini Characters parçalarından (taslak; Kemal, 14 Ekim).

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

// Saç modeli → Kenney paketindeki baş (Kemal'in seçtiği saç biçimine en yakın)
const SAC_BASI: Record<CalisanGorunumu['sac'], number> = { kisa: 11, uzun: 4, topuz: 3, kivircik: 6 };

export function Calisan() {
  const { calisan } = useDurum();
  const ref = useRef<THREE.Group>(null);
  const hareket = useRef<Hareket>('dur');
  const v = useMemo(() => new THREE.Vector3(), []);
  const onluk = ONLUKLER.find((o) => o.id === calisan.onluk) ?? ONLUKLER[0];
  const doku = useMemo(() => onlukDokusu(onluk), [onluk]);
  // Çalışan da müşterilerle aynı Kenney parçalarından (Kemal, 14 Ekim)
  const varyant = useMemo<Varyant>(
    () => ({
      govde: 1,
      bas: SAC_BASI[calisan.sac],
      ten: TENLER[calisan.ten],
      sac: SAC_RENKLERI[calisan.sacRengi],
      ust: '#f6ecd6',
      alt: '#3d4f6b',
      ayakkabi: '#2a2830',
      aksesuarlar: calisan.aksesuarlar,
    }),
    [calisan.sac, calisan.ten, calisan.sacRengi, calisan.aksesuarlar],
  );
  // Önlük gövdenin önüne takılır; renk ve desen değişince doku yenilenir
  const onlukMalzemesi = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85 }), []);
  onlukMalzemesi.map = doku;
  onlukMalzemesi.needsUpdate = true;
  const onlukTak = (k: Karakter) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.22), onlukMalzemesi);
    m.position.set(0, 0.02, 0.135);
    k.govdeKemigi?.add(m);
  };

  useFrame(({ camera, size }) => {
    const g = ref.current;
    if (!g) return;
    g.visible = kameraKarisimi.deger > 0.12;
    const d = durumuOku();
    // Kepçe dalarken çalışır gibi uzanır
    hareket.current = d.asama === 'dolduruyor' ? 'calis' : 'dur';
    const etiket = calisanEtiketi.oge;
    if (etiket) {
      v.set(CALISAN_YERI.x + tezgahOfseti.x, 1.6, CALISAN_YERI.z + tezgahOfseti.z).project(camera);
      etiket.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      etiket.style.opacity = g.visible && d.calisan.ad && !odak.calisan ? '1' : '0';
    }
  });

  return (
    <group ref={ref} position={CALISAN_YERI.toArray()} rotation={[0, Math.PI, 0]}>
      {/* Tezgah arkasında basamakta durur ve müşterilerden biraz iri: vitrin camının üstünden görünsün */}
      <group position={[0, 0.12, 0]} scale={1.18}>
        <KenneyKarakter varyant={varyant} hareket={hareket} ekle={onlukTak} />
      </group>
    </group>
  );
}
