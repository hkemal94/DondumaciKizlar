import * as THREE from 'three';

// Kemal'in logosu (14 Ekim): public/gorseller/ altındaki iki dosya.
// Külahlı olan kareye yakın, yalnız yazı olan geniş.
export const LOGO_DOSYALARI = {
  kulahli: { yol: 'gorseller/logo-kulahli.webp', oran: 1203 / 1280 },
  yazi: { yol: 'gorseller/logo-yazi.webp', oran: 1280 / 557 },
} as const;
export type LogoTuru = keyof typeof LOGO_DOSYALARI;

const dokular = new Map<LogoTuru, THREE.Texture>();
export function logoDokusu(tur: LogoTuru) {
  let t = dokular.get(tur);
  if (!t) {
    t = new THREE.TextureLoader().load(import.meta.env.BASE_URL + LOGO_DOSYALARI[tur].yol);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    dokular.set(tur, t);
  }
  return t;
}

export function logoAdresi(tur: LogoTuru) {
  return import.meta.env.BASE_URL + LOGO_DOSYALARI[tur].yol;
}
