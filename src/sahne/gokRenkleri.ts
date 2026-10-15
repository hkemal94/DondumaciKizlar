import * as THREE from 'three';
import { renk } from './renkler';

// Gökyüzünün o anki renkleri. Işık saate göre bunları değiştirir;
// gök küresi aynı nesneleri kullandığı için kendiliğinden güncellenir.
export const gokRenkleri = {
  ust: new THREE.Color(renk.gokUst),
  ufuk: new THREE.Color(renk.gokUfuk),
};

// Dükkânı gezerken ışık için seçilen saat (Kemal, 13 Ekim: gece / gündüz
// düğmesi). null = oyunun kendi saati. Oyunun saatini değiştirmez.
export type GezmeIsigi = 'simdi' | 'gunduz' | 'aksam' | 'gece';
export const gezmeIsigi: { mod: GezmeIsigi } = { mod: 'simdi' };
const SAATLER: Record<GezmeIsigi, number | null> = { simdi: null, gunduz: 13, aksam: 19.8, gece: 23 };
export function gezmeSaati(): number | null {
  return SAATLER[gezmeIsigi.mod];
}
export function gezmeIsiginiDegistir(): GezmeIsigi {
  const sira: GezmeIsigi[] = ['simdi', 'gunduz', 'aksam', 'gece'];
  gezmeIsigi.mod = sira[(sira.indexOf(gezmeIsigi.mod) + 1) % sira.length];
  return gezmeIsigi.mod;
}

// Işıklı tabelaların parlaklığı (C3, belge 0.11): akşam yanar, sabah söner (0–1).
// Işıklar her karede saate göre günceller.
export const tabelaIsigi = { deger: 0 };
