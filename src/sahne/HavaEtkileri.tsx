import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { durumuOku } from '../oyun/durum';
import { havaGorunusu } from './gokRenkleri';
import { PARSEL, Z0, parselAnahtari } from '../oyun/dekorasyon';

// Hava durumunun sahnedeki hâli (belge 0.15): gökte low-poly bulutlar ve
// yağmur damlaları. Güçleri havaGorunusu'ndan (Işıklar her karede kaydırır).

// ---- Bulutlar: gökte yavaşça sürüklenen, birkaç küreden low-poly öbekler ----
const BULUT_SAYISI = 16;
export function Bulutlar() {
  const grup = useRef<THREE.Group>(null);
  const malzeme = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', flatShading: true, roughness: 1, transparent: true, opacity: 0, fog: false }), []);
  const geometri = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const bulutlar = useMemo(
    () =>
      Array.from({ length: BULUT_SAYISI }, (_, i) => {
        const aci = (i / BULUT_SAYISI) * Math.PI * 2 + Math.random() * 0.3;
        const uzak = 110 + Math.random() * 120;
        return {
          aci,
          uzak,
          y: 42 + Math.random() * 30,
          olcek: 7 + Math.random() * 7,
          // Bulutluda hepsi, güneşlide yalnız birkaçı görünür
          esik: i / BULUT_SAYISI,
          parcalar: Array.from({ length: 4 + Math.floor(Math.random() * 3) }, (_, n) => [n * 0.9 - 2 + Math.random() * 0.4, Math.random() * 0.6, Math.random() * 0.8 - 0.4, 0.8 + Math.random() * 0.6] as const),
        };
      }),
    [],
  );
  const gri = useMemo(() => new THREE.Color('#9aa3ad'), []);
  useFrame((_, dt) => {
    const g = grup.current;
    if (!g) return;
    const { bulut, yagmur, ruzgar } = havaGorunusu;
    malzeme.opacity = Math.min(0.95, 0.35 + bulut * 0.6);
    malzeme.color.set('#ffffff').lerp(gri, yagmur * 0.8);
    g.children.forEach((c, i) => {
      const b = bulutlar[i];
      b.aci += dt * (0.002 + ruzgar * 0.01);
      c.position.set(Math.cos(b.aci) * b.uzak, b.y, Math.sin(b.aci) * b.uzak);
      c.visible = b.esik < bulut * 1.1;
    });
  });
  return (
    <group ref={grup}>
      {bulutlar.map((b, i) => (
        <group key={i} scale={[b.olcek, b.olcek * 0.55, b.olcek]} rotation={[0, -b.aci, 0]}>
          {b.parcalar.map(([x, y, z, s], n) => (
            <mesh key={n} geometry={geometri} material={malzeme} position={[x, y, z]} scale={s} />
          ))}
        </group>
      ))}
    </group>
  );
}

// ---- Yağmur: kameranın baktığı yerin çevresinde düşen ince çizgiler ----
const DAMLA = 2000;
const ALAN = 44; // metre (kare)
const YUKSEKLIK = 22;
export function Yagmur() {
  const { camera } = useThree();
  const { geometri, damlalar } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DAMLA * 6), 3));
    const d = Array.from({ length: DAMLA }, () => ({ x: (Math.random() - 0.5) * ALAN, y: Math.random() * YUKSEKLIK, z: (Math.random() - 0.5) * ALAN, hiz: 16 + Math.random() * 6 }));
    return { geometri: g, damlalar: d };
  }, []);
  const malzeme = useMemo(() => new THREE.LineBasicMaterial({ color: '#e8f2fa', transparent: true, opacity: 0, fog: false }), []);
  const cizgi = useRef<THREE.LineSegments>(null);
  const yon = useMemo(() => new THREE.Vector3(), []);
  const kapaliRef = useRef<string[] | null>(null);
  const kapali = useRef(new Set<string>());
  useFrame((_, dt) => {
    const c = cizgi.current;
    if (!c) return;
    const { yagmur, ruzgar } = havaGorunusu;
    c.visible = yagmur > 0.03;
    if (!c.visible) return;
    malzeme.opacity = 0.6 * yagmur;
    // Dükkânın içine (kapalı parseller) yağmur yağmaz
    const d0 = durumuOku();
    if (d0.kapaliParseller !== kapaliRef.current) {
      kapaliRef.current = d0.kapaliParseller;
      kapali.current = new Set(d0.kapaliParseller);
    }
    // Merkez: kameranın baktığı yer (en çok 30 m ileride); tezgahta kameranın önü
    camera.getWorldDirection(yon);
    const tezgah = d0.kamera === 'tezgah';
    const ileri = tezgah ? 6 : Math.min(30, yon.y < -0.05 ? camera.position.y / -yon.y : 30);
    const mx = camera.position.x + yon.x * ileri;
    const mz = camera.position.z + yon.z * ileri;
    const egim = 0.08 + ruzgar * 0.18;
    const p = geometri.attributes.position as THREE.BufferAttribute;
    const a = p.array as Float32Array;
    for (let i = 0; i < DAMLA; i++) {
      const d = damlalar[i];
      d.y -= d.hiz * dt;
      if (d.y < 0) {
        d.y += YUKSEKLIK;
        d.x = (Math.random() - 0.5) * ALAN;
        d.z = (Math.random() - 0.5) * ALAN;
      }
      let x = mx + d.x;
      const z = mz + d.z;
      // Tezgah yakın planında çalışanın dibine (dükkânın içine) damla düşmesin
      if (tezgah && Math.hypot(x - camera.position.x, z - camera.position.z) < 3) x += 100;
      else if (kapali.current.has(parselAnahtari(Math.floor(x / PARSEL), Math.floor((z - Z0) / PARSEL)))) x += 100;
      const o = i * 6;
      a[o] = x;
      a[o + 1] = d.y;
      a[o + 2] = z;
      a[o + 3] = x - egim * 0.5;
      a[o + 4] = d.y + 0.8;
      a[o + 5] = z;
    }
    p.needsUpdate = true;
  });
  return <lineSegments ref={cizgi} geometry={geometri} material={malzeme} frustumCulled={false} />;
}
