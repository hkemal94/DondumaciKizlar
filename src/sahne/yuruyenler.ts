import type * as THREE from 'three';

// Dükkânın içinde ve çevresinde yürüyenlerin o anki yerleri (müşteriler,
// sahip). Kapı yakınında biri olunca açılır (Kemal, 15 Ekim). Konumlar
// her karede kendiliğinden güncel: kişinin kendi konum nesnesi tutulur.
export const yuruyenler = new Map<string, THREE.Vector3>();
