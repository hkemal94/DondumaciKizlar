import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calismaSaatleri, dukkanKapilari, durumuOku } from '../oyun/durum';
import { YURUYUS_Z, kenarYeri } from '../oyun/dekorasyon';
import { InsanKarakter, type Hareket } from './InsanKarakter';
import type { Varyant } from './karakterler';
import { yuruyenler } from './yuruyenler';

// Dükkânın sahibi (Kemal, 13 Ekim: "arada dükkânda gezsin"). Kanondaki kadın;
// adı ve görünüşü yok — buradaki görünüş GEÇİCİ (mor elbise, topuz saç),
// Kemal belirleyecek. Günde bir kez rastgele bir saatte iskeleden gelir,
// kapıdan girer, içeride ve terasta biraz dolaşır, gider. Başka bir şey yapmaz.

const ISKELE_Z = YURUYUS_Z + 0.2;
const ISKELE_UCU = 22;

interface Nokta {
  yer: THREE.Vector3;
  bekle: number; // saniye
}

function gezintiYolu(donus: 1 | -1): Nokta[] {
  const n = (x: number, z: number, bekle = 0): Nokta => ({ yer: new THREE.Vector3(x, 0, z), bekle });
  // İlk kapıdan girer çıkar (belge 0.4)
  const kapi = dukkanKapilari()[0];
  const ky = kapi ? kenarYeri(kapi) : { x: -3.5, z: -2.4 };
  const KAPI_X = ky.x;
  const KAPI_DIS = new THREE.Vector3(ky.x, 0, ky.z - 0.7);
  const KAPI_IC = new THREE.Vector3(ky.x, 0, ky.z + 0.3);
  return [
    n(KAPI_X, ISKELE_Z),
    { yer: KAPI_DIS, bekle: 0 },
    { yer: KAPI_IC, bekle: 0 },
    n(1.6, -2.15, 3.5), // dükkânın içinde, vitrinin yanında durur, bakar
    n(3.0, -1.95, 2.5),
    { yer: KAPI_IC, bekle: 0 },
    { yer: KAPI_DIS, bekle: 0 },
    n(1.2, -5.6, 3), // terasta denize bakar
    n(-1.2, -6.9, 2.5),
    n(donus * ISKELE_UCU, ISKELE_Z),
  ];
}

// Görünüş GEÇİCİ (Kemal belirleyecek): mor elbise, topuz, küpe — müşterilerle
// aynı Kenney parçalarından (14 Ekim)
// Sahip (belge 0.9; Kemal, 14 Ekim gece): elbiseli kadın (Formal), dükkânın moru
const SAHIP: Varyant = {
  cinsiyet: 'kadin',
  govde: 'formal',
  bas: 'formal',
  boy: 1.68,
  ten: '#e3b08a',
  sac: '#3a2a22',
  ust: '#7a3fa8',
  alt: '#7a3fa8',
  ayakkabi: '#7a5236',
  aksesuarlar: ['kupe'],
};

export function Sahip() {
  const ref = useRef<THREE.Group>(null);
  const icRef = useRef<THREE.Group>(null);
  // O günün ziyaret planı
  const plan = useRef<{ gun: number; dakika: number; yapildi: boolean }>({ gun: -1, dakika: 0, yapildi: false });
  const yol = useRef<Nokta[]>([]);
  const bekleme = useRef(0);
  const hedef = useMemo(() => new THREE.Vector3(), []);
  const hareket = useRef<Hareket>('dur');

  useFrame((_, dt) => {
    const g = ref.current;
    const ic = icRef.current;
    if (!g || !ic) return;
    const d = durumuOku();
    // Kapı yanındayken kapı açılsın diye yeri paylaşılır
    if (g.visible) yuruyenler.set('sahip', g.position);
    else yuruyenler.delete('sahip');

    // Her gün için rastgele bir ziyaret saati (açılıştan 1,5 saat sonra ile kapanıştan 2 saat önce arası)
    if (plan.current.gun !== d.gun) {
      const uzunluk = calismaSaatleri(d).kapanis - calismaSaatleri(d).acilis;
      plan.current = { gun: d.gun, dakika: 90 + Math.random() * Math.max(30, uzunluk - 210), yapildi: false };
      yol.current = [];
      g.visible = false;
    }

    // Zamanı gelince iskelenin bir ucundan başlar
    if (!plan.current.yapildi && !d.hazirlik && !d.gunSonu && d.dakika >= plan.current.dakika) {
      plan.current.yapildi = true;
      const taraf: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const donus: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      g.position.set(taraf * ISKELE_UCU, 0, ISKELE_Z);
      yol.current = gezintiYolu(donus);
      bekleme.current = 0;
      g.visible = true;
    }

    if (!g.visible || yol.current.length === 0 || d.duraklatildi) return;

    const nokta = yol.current[0];
    hedef.copy(nokta.yer);
    const fark = hedef.clone().sub(g.position);
    const mesafe = fark.length();
    let yuruyor = false;
    if (mesafe > 0.05) {
      const disarida = g.position.z < -2.6 || Math.abs(g.position.x) > 4.2;
      const hiz = disarida ? 2.0 : 1.1;
      g.position.add(fark.clone().multiplyScalar(Math.min(1, (hiz * dt) / mesafe)));
      yuruyor = true;
      let aci = Math.atan2(fark.x, fark.z) - g.rotation.y;
      aci = Math.atan2(Math.sin(aci), Math.cos(aci));
      g.rotation.y += aci * Math.min(1, dt * 8);
    } else {
      bekleme.current += dt;
      if (bekleme.current >= nokta.bekle) {
        bekleme.current = 0;
        yol.current = yol.current.slice(1);
        if (yol.current.length === 0) g.visible = false; // iskeleden çıktı
      }
    }
    // Durduğu yerde ilk iki saniye el sallar (belge 0.12)
    hareket.current = yuruyor ? 'yuru' : bekleme.current > 0.3 && bekleme.current < 2.2 ? 'selam' : 'dur';
    ic.position.y = 0;
  });

  return (
    <group ref={ref} visible={false}>
      <group ref={icRef}>
        <InsanKarakter varyant={SAHIP} hareket={hareket} />
      </group>
    </group>
  );
}
