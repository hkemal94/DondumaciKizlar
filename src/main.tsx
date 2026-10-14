import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Uygulama } from './Uygulama';
import { Onizleme } from './sahne/Onizleme';
import { TasarimOnizleme } from './sahne/TasarimOnizleme';
import type { Esya } from './oyun/dekorasyon';
import './stil.css';

createRoot(document.getElementById('kok')!).render(
  <StrictMode>
    {/* Geliştirirken mağaza resimleri için: #onizleme=eşya */}
    {location.hash.startsWith('#onizleme=') ? (
      <Onizleme esya={location.hash.slice(10) as Esya} />
    ) : location.hash.startsWith('#varyant=') ? (
      <Onizleme varyant={Number(location.hash.slice(9))} />
    ) : location.hash.startsWith('#tasarim=') ? (
      <TasarimOnizleme adres={location.hash.slice(9)} />
    ) : location.hash.startsWith('#model=') ? (
      <Onizleme model={decodeURIComponent(location.hash.slice(7))} />
    ) : (
      <Uygulama />
    )}
  </StrictMode>,
);
