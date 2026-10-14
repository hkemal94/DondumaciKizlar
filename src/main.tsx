import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Uygulama } from './Uygulama';
import { Onizleme } from './sahne/Onizleme';
import type { Esya } from './oyun/dekorasyon';
import './stil.css';

createRoot(document.getElementById('kok')!).render(
  <StrictMode>
    {/* Geliştirirken mağaza resimleri için: #onizleme=eşya */}
    {location.hash.startsWith('#onizleme=') ? <Onizleme esya={location.hash.slice(10) as Esya} /> : <Uygulama />}
  </StrictMode>,
);
