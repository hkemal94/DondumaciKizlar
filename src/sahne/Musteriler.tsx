import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { birimIcMi, durumuOku, kapaliParseller, musteriTezgahaVardi, musteriyiKaldir, ondekiMusteri, useDurum, type Durum, type Musteri } from '../oyun/durum';
import { PARSEL, YURUYUS_Z, birimCoz, esyaOrtasi, parselCoz } from '../oyun/dekorasyon';
import { tezgahOfseti } from './kameraKarisimi';
import { BANK_OTURAKLARI } from './DisSusler';
import { Parcaciklar } from './Efektler';
import { rastgeleVaryant } from './karakterler';
import { KenneyKarakter, type Hareket } from './KenneyKarakter';
import { KAPI_X } from './Dukkan';

// Tezgah önünde sıraya giren müşteriler (iş sırası 3). Kenney Mini Characters
// (CC0) üzerine her müşteri için farklı baş, gövde, renk ve aksesuar
// (Kemal, 14 Ekim). Adları, hikâyeleri yok.

const BULUT_RENKLERI = ['#9aa0a8', '#b8bec6', '#7e848c'];

// Sıradaki yerler: öndeki tezgahın ortasında, diğerleri sola doğru dizilir.
const ON_YER = new THREE.Vector3(0, 0, -1.55); // tezgah bölümünün başlangıç yerine göre
// Müşteri yolu (Kemal, 13 Ekim): yürüyüş yolunun iki ucundan birinden,
// kameranın dışından gelir; kapının önüne dönüp içeri girer, sıraya geçer.
// Giderken kapıdan çıkıp yine iki uçtan birine yürür ve silinir.
// Yürüyüş yolu 14 Ekim'de deniz tarafına alındı (belge 0.1).
const ISKELE_Z = YURUYUS_Z;
// Yolun ucu kameranın dışında: dükkân yana büyüdükçe uç da uzaklaşır
function yolUcu(d: Durum) {
  const kenar = Math.max(...d.parseller.map((p) => Math.max(Math.abs(parselCoz(p).i * PARSEL), Math.abs(parselCoz(p).i * PARSEL + PARSEL))));
  return Math.max(22, kenar + 12);
}
const KAPI_DIS = new THREE.Vector3(KAPI_X, 0, -3.1);
const KAPI_IC = new THREE.Vector3(KAPI_X, 0, -2.05);
const KAPI_YOLU = new THREE.Vector3(KAPI_X, 0, ISKELE_Z); // kapının önünden yürüyüş yoluna
const DUKKAN_KENARI = 4.6; // dükkânın arkasına giderken yanından geçilen hat

// Yürüyüş yolundan bir oturma yerine: dükkânın arkasındaysa yanından dolaşır
function yoldanKoltuga(yer: THREE.Vector3): THREE.Vector3[] {
  if (yer.z < -2.5 || Math.abs(yer.x) > DUKKAN_KENARI - 0.3) return [new THREE.Vector3(yer.x, 0, ISKELE_Z), yer];
  const yan = yer.x >= 0 ? DUKKAN_KENARI : -DUKKAN_KENARI;
  return [new THREE.Vector3(yan, 0, ISKELE_Z), new THREE.Vector3(yan, 0, yer.z), yer];
}

// Sıra tezgah bölümüyle birlikte kayar (belge 0.3). Öndeki tezgahın
// ortasında; ötekiler kapalı alanın daha geniş kalan yanına doğru dizilir.
function siraYeri(sira: number, hedef: THREE.Vector3) {
  if (sira === 0) hedef.copy(ON_YER);
  else {
    let sol = Infinity;
    let sag = -Infinity;
    for (const p of kapaliParseller()) {
      const { i } = parselCoz(p);
      sol = Math.min(sol, i * PARSEL);
      sag = Math.max(sag, i * PARSEL + PARSEL);
    }
    const yon = tezgahOfseti.x - sol >= sag - tezgahOfseti.x ? -1 : 1;
    hedef.set(yon * 0.82 * sira, 0, -1.78 - 0.04 * sira);
  }
  return hedef.add(tezgahOfseti);
}


// ---- Masalarda oturma (Kemal, 14 Ekim) ----
// Mutlu giden müşterinin bir kısmı boş bir sandalye ya da bank varsa oturur, yer, gider.
// Hangi sandalyenin dolu olduğu yalnız sahnede tutulur (kayda girmez).
const OTURMA_OLASILIGI = 0.6;
const OTURMA_SURESI: [number, number] = [10, 16]; // saniye
const SANDALYE_ARALIGI = 0.62 * 0.85; // Dekorlar'daki masa ölçüsü
const OTURAK_Y = 0.4; // sandalye oturağının masa zeminine göre yüksekliği
// Kenney karakterinde oturma hareketindeki kalça yüksekliği (ölçekli) ve baş üstü
const KENNEY_KALCA = 0.12;
const BAS_USTU = 1.3;
const BALON_YUKSEKLIGI = 1.05;

interface Koltuk {
  anahtar: string;
  yer: THREE.Vector3;
  bakis: number; // masaya dönük
  ic: boolean;
}

const doluKoltuklar = new Map<string, number>(); // anahtar → müşteri

function bosKoltuk(d: Durum): Koltuk | null {
  const bos: Koltuk[] = [];
  for (const y of d.yerlesim) {
    if (y.esya !== 'masa' && y.esya !== 'semsiyeliMasa' && y.esya !== 'bank') continue;
    const { c, r } = birimCoz(y.hucre);
    const o = esyaOrtasi(y.esya, c, r, y.yon);
    const ic = birimIcMi(c, r, d);
    // Eşya çevrilmişse oturma yerleri ve bakış da onunla döner
    const aci = (y.yon * Math.PI) / 2;
    const yer = (lx: number, lz: number) =>
      new THREE.Vector3(o.x + lx * Math.cos(aci) + lz * Math.sin(aci), ic ? 0 : 0.06, o.z - lx * Math.sin(aci) + lz * Math.cos(aci));
    if (y.esya === 'bank') {
      // Bankta iki kişi yan yana, bankın önüne bakar
      for (const ox of BANK_OTURAKLARI) {
        const anahtar = `${y.hucre}:${ox}`;
        if (doluKoltuklar.has(anahtar)) continue;
        bos.push({ anahtar, yer: yer(ox, 0.02), bakis: Math.PI + aci, ic });
      }
      continue;
    }
    for (const taraf of [1, -1]) {
      const anahtar = `${y.hucre}:${taraf}`;
      if (doluKoltuklar.has(anahtar)) continue;
      bos.push({
        anahtar,
        yer: yer(taraf * (SANDALYE_ARALIGI - 0.05), 0),
        bakis: (taraf > 0 ? -Math.PI / 2 : Math.PI / 2) + aci,
        ic,
      });
    }
  }
  return bos.length ? bos[Math.floor(Math.random() * bos.length)] : null;
}

type Asama = 'giris' | 'sirada' | 'masaya' | 'oturuyor' | 'cikiyor';

function TekMusteri({ musteri }: { musteri: Musteri }) {
  const ref = useRef<THREE.Group>(null);
  const icRef = useRef<THREE.Group>(null);
  const hedef = useMemo(() => new THREE.Vector3(), []);
  const baslangic = useMemo(
    () => new THREE.Vector3(musteri.gelisTarafi * yolUcu(durumuOku()), 0, ISKELE_Z + ((musteri.id * 37) % 7) * 0.08 - 0.25),
    [musteri.gelisTarafi, musteri.id],
  );
  // Sıradaki yol noktaları: önce kapının dışı, sonra içi; sonra sıradaki yeri
  const yol = useRef<THREE.Vector3[]>([KAPI_YOLU, KAPI_DIS, KAPI_IC]);
  const asama = useRef<Asama>('giris');
  const koltuk = useRef<Koltuk | null>(null);
  const kalanOturma = useRef(0);
  const kaldirildi = useRef(false);
  const hareket = useRef<Hareket>('yuru');
  // Her müşteri farklı: baş, gövde, renkler, aksesuar müşterinin numarasından
  const varyant = useMemo(() => rastgeleVaryant(musteri.id * 7 + musteri.gorunum), [musteri.id, musteri.gorunum]);

  // Sahneden çıkınca sandalyeyi boşalt
  useEffect(
    () => () => {
      if (koltuk.current) doluKoltuklar.delete(koltuk.current.anahtar);
    },
    [],
  );

  useFrame(({ clock }, dt) => {
    const grup = ref.current;
    const ic = icRef.current;
    if (!grup || !ic) return;
    const d = durumuOku();
    const m = d.musteriler.find((x) => x.id === musteri.id);
    if (!m || d.duraklatildi) return; // duraklatınca herkes yerinde durur
    const son = new THREE.Vector3(m.gidisTarafi * yolUcu(d), 0, ISKELE_Z);

    // Servis bitti: ya bir masaya oturur ya da doğrudan gider
    if (m.hal === 'gidiyor' && (asama.current === 'giris' || asama.current === 'sirada')) {
      const k = m.mutlu && Math.random() < OTURMA_OLASILIGI ? bosKoltuk(d) : null;
      const cikis = new THREE.Vector3(grup.position.x, 0, grup.position.z - 0.2);
      if (k) {
        doluKoltuklar.set(k.anahtar, m.id);
        koltuk.current = k;
        asama.current = 'masaya';
        yol.current = k.ic
          ? [cikis, new THREE.Vector3(k.yer.x, 0, -2.15), k.yer]
          : [cikis, KAPI_IC, KAPI_DIS, KAPI_YOLU, ...yoldanKoltuga(k.yer)];
      } else {
        asama.current = 'cikiyor';
        yol.current = [cikis, KAPI_IC, KAPI_DIS, KAPI_YOLU, son];
      }
    }

    // Oturuyor: masaya dönük, yer; süre bitince kalkar
    if (asama.current === 'oturuyor' && koltuk.current) {
      const k = koltuk.current;
      grup.position.copy(k.yer);
      grup.rotation.y = k.bakis;
      // Kalça sandalyenin oturağına gelsin
      hareket.current = 'otur';
      ic.position.y = OTURAK_Y - KENNEY_KALCA;
      kalanOturma.current -= dt;
      if (kalanOturma.current <= 0) {
        doluKoltuklar.delete(k.anahtar);
        asama.current = 'cikiyor';
        yol.current = k.ic
          ? [new THREE.Vector3(k.yer.x, 0, -2.15), KAPI_IC, KAPI_DIS, KAPI_YOLU, son]
          : [...yoldanKoltuga(k.yer).slice(0, -1).reverse(), son];
        koltuk.current = null;
      }
      return;
    }

    if (yol.current.length > 0) {
      hedef.copy(yol.current[0]);
      hedef.y = 0;
      if (grup.position.distanceTo(hedef) < 0.06) {
        yol.current = yol.current.slice(1);
        if (yol.current.length === 0) {
          if (asama.current === 'giris') asama.current = 'sirada';
          else if (asama.current === 'masaya') {
            asama.current = 'oturuyor';
            kalanOturma.current = OTURMA_SURESI[0] + Math.random() * (OTURMA_SURESI[1] - OTURMA_SURESI[0]);
            return;
          } else if (asama.current === 'cikiyor' && !kaldirildi.current) {
            kaldirildi.current = true;
            musteriyiKaldir(m.id);
            return;
          }
        }
      }
    } else {
      const sira = d.musteriler.filter((x) => x.hal === 'sirada').findIndex((x) => x.id === m.id);
      siraYeri(sira, hedef);
    }

    // Yürüyüş: dışarıda biraz daha hızlı, içeride yavaş; gittiği yöne döner
    const fark = hedef.clone().sub(grup.position);
    fark.y = 0;
    const mesafe = fark.length();
    const disarida = grup.position.z < -2.6 || Math.abs(grup.position.x) > 4.2;
    const hiz = disarida ? 2.6 : 1.3;
    const yuruyor = mesafe > 0.02;
    if (yuruyor) grup.position.add(fark.clone().multiplyScalar(Math.min(1, (hiz * dt) / mesafe)));
    grup.position.y = 0;
    const bakis = yuruyor && mesafe > 0.05 ? Math.atan2(fark.x, fark.z) : 0; // durunca tezgaha bakar
    let aci = bakis - grup.rotation.y;
    aci = Math.atan2(Math.sin(aci), Math.cos(aci)); // en kısa yoldan dön
    grup.rotation.y += aci * Math.min(1, dt * 8);

    // Yürüme ve bekleme hareketi modelin kendi animasyonundan
    hareket.current = yuruyor && mesafe > 0.03 ? 'yuru' : 'dur';
    ic.position.y = 0;
  });

  return (
    <group ref={ref} name={`musteri-${musteri.id}`} position={baslangic.toArray()}>
      <group ref={icRef}>
        <KenneyKarakter varyant={varyant} hareket={hareket} />
      </group>
      {/* Sıkılıp giden müşterinin başında küçük gri bulut (14 Ekim) */}
      <group position={[0, BAS_USTU, 0]}>
        <Parcaciklar tetik={musteri.hal === 'gidiyor' && !musteri.mutlu ? 1 : 0} tur="bulut" renkler={BULUT_RENKLERI} />
      </group>
    </group>
  );
}

// Sipariş balonunun ekrandaki yeri: öndeki müşterinin başının üstü.
// Arayüz balon öğesini buraya bağlar; sahne her karede yerini günceller.
export const balon: { oge: HTMLDivElement | null } = { oge: null };

function BalonTakibi() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size, scene }) => {
    const oge = balon.oge;
    if (!oge) return;
    const m = ondekiMusteri(durumuOku());
    const nesne = m ? scene.getObjectByName(`musteri-${m.id}`) : undefined;
    if (!m || !nesne) {
      oge.style.opacity = '0';
      return;
    }
    nesne.getWorldPosition(v);
    // Yalnız yerine varınca göster
    const vardi = v.distanceTo(ON_YER) < 0.15;
    if (vardi) musteriTezgahaVardi(m.id);
    // Başın sağı: balon buradan aşağı doğru açılır (üstteki ipucu yazısıyla çakışmasın)
    v.x += 0.3;
    v.y += BALON_YUKSEKLIGI;
    v.project(camera);
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((1 - v.y) / 2) * size.height;
    oge.style.transform = `translate(${x}px, ${y}px)`;
    oge.style.opacity = vardi ? '1' : '0';
  });
  return null;
}

export function Musteriler() {
  const { musteriler } = useDurum();
  return (
    <group>
      {musteriler.map((m) => (
        <TekMusteri key={m.id} musteri={m} />
      ))}
      <BalonTakibi />
    </group>
  );
}
