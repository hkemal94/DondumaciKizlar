import * as THREE from 'three';
import { renk } from './renkler';

// Gökyüzünün o anki renkleri. Işık saate göre bunları değiştirir;
// gök küresi aynı nesneleri kullandığı için kendiliğinden güncellenir.
export const gokRenkleri = {
  ust: new THREE.Color(renk.gokUst),
  ufuk: new THREE.Color(renk.gokUfuk),
};
