import { useEffect, useState } from 'react';

// Tam ekran (Kemal, 15 Ekim akşam: "web'den oynadığımız için tam ekran
// düğmesi"). Tarayıcı izin vermezse (iPhone Safari) düğme hiç görünmez.
// Tam ekrana geçince ekran yatay kilitlenmeye çalışılır.

export function tamEkranVar() {
  return typeof document !== 'undefined' && !!document.documentElement.requestFullscreen && document.fullscreenEnabled !== false;
}

export function useTamEkran() {
  const [acik, setAcik] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement);
  useEffect(() => {
    const dinle = () => setAcik(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', dinle);
    return () => document.removeEventListener('fullscreenchange', dinle);
  }, []);
  return acik;
}

export async function tamEkraniDegistir() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    const yon = screen.orientation as ScreenOrientation & { lock?: (y: string) => Promise<void> };
    await yon.lock?.('landscape').catch(() => {});
  } catch {
    // Tarayıcı reddetti; oyun olduğu gibi sürer
  }
}
