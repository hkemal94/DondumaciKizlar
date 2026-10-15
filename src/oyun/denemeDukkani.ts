import { CESITLER } from './kuvetler';
import { toplamEsik } from './seviye';

// Deneme dükkânı (belge 0.8; Kemal, 14 Ekim gece): oyun yayınlanana kadar
// ileri seviyedeki dükkânı görmek için hazır kayıt. Açılış ekranından her
// açılışta baştan kurulur; oyuncunun kendi kaydına dokunmaz. Oyuna yeni bir
// şey eklendiğinde buraya da konur. Kayıt okunurken uymayan parça kendiliğinden
// düşer (eşya depoya döner, tezgah başa alınır).

// Arazi: dükkânın iki yanı ve arkası dahil 6 × 4 kare
const parseller: string[] = [];
for (let i = -3; i <= 2; i++) for (let j = -1; j <= 2; j++) parseller.push(`${i},${j}`);

export const DENEME_KAYDI = {
  para: 25000,
  gun: 30,
  // Exp (8. adım): ileri seviye; dükkânda hiçbir şey kilitli kalmaz
  exp: { ana: toplamEsik('ana', 30) + 40, dukkan: toplamEsik('dukkan', 60), calisan: toplamEsik('calisan', 15) + 10 },
  memnuniyetler: Array.from({ length: 40 }, (_, i) => (i % 5 === 0 ? 4 : 5)),
  acikCesitler: CESITLER.map((_, i) => i),
  vitrin: CESITLER.slice(0, 12).map((_, i) => i),
  vitrinBoyu: 12,
  otomatikVitrin: false,
  dunkuSatislar: [],
  enIyiOrtalama: 4.8,
  acikAltliklar: ['kulah', 'kap', 'kup'],
  tepsiAcik: true,
  fiyatSeviyesi: 'normal',
  cesitFiyatlari: [],
  isikSeviyesi: 3,
  parseller,
  // Kapalı alan: dükkân iki yana büyümüş, arkada iki karelik mutfak; sağda
  // oturma odası (halı ve tablo, C4)
  kapaliParseller: ['-2,0', '-1,0', '0,0', '1,0', '2,0', '-1,1', '0,1'],
  duvarParcalari: {
    '-8,0,g': 'kapi',
    '-8,1,b': 'pencere',
    '-8,2,b': 'pencere',
    '11,1,d': 'pencere',
    '11,2,d': 'pencere',
  },
  mutfakParseller: ['-1,1', '0,1'],
  tezgah: { c: -4, r: 1, boy: 8 },
  tezgahAlinanBoy: 8,
  tezgahParcalari: [
    { tur: 'waffle', yan: 1 },
    { tur: 'servis', yan: 1 },
    { tur: 'icecek', yan: -1 },
    { tur: 'kose', yan: -1 },
  ],
  sahipParcalar: ['waffle', 'icecek', 'servis', 'kose'],
  // Adları oyuncu yazar (boş bırakıldı)
  yardimcilar: [
    { id: 1, ad: '', tohum: 1234, yetenek: 'waffle', hiz: 2 },
    { id: 2, ad: '', tohum: 777, yetenek: 'icecek', hiz: 3 },
  ],
  istasyon: 'dondurma',
  depo: { saksi: 2, haliYuvarlak: 1, paspas: 1, tabloDondurma: 1, tabloDeniz: 1, tabloBos: 1 },
  // Terastaki eşyalar (köşe birim "c,r"; teras r = -4 … -1)
  yerlesim: [
    { esya: 'semsiyeliMasa', hucre: '-12,-4', yon: 0 },
    { esya: 'semsiyeliMasa', hucre: '4,-4', yon: 0 },
    { esya: 'masa', hucre: '0,-4', yon: 0 },
    { esya: 'bank', hucre: '-4,-4', yon: 0 },
    { esya: 'bank', hucre: '8,-4', yon: 0 },
    { esya: 'saksi', hucre: '-10,-1', yon: 0 },
    { esya: 'saksi', hucre: '10,-1', yon: 0 },
    { esya: 'copKutusu', hucre: '7,-1', yon: 0 },
    { esya: 'karaTahta', hucre: '-6,-2', yon: 0 },
    { esya: 'isikliTabela', hucre: '2,-1', yon: 0 },
    { esya: 'kulahFiguru', hucre: '-3,-1', yon: 0 },
    { esya: 'flama', hucre: '11,-4', yon: 0 },
    { esya: 'sokakLambasi', hucre: '-12,-1', yon: 0 },
    { esya: 'bisiklet', hucre: '9,-2', yon: 0 },
    { esya: 'cicekKasasi', hucre: '-11,-2', yon: 0 },
    // Sağdaki oda (C4): kilimin üstünde masa, duvarda tablo, köşede saksı
    { esya: 'haliKilim', hucre: '8,1', yon: 0 },
    { esya: 'masa', hucre: '9,1', yon: 0 },
    { esya: 'tabloSoyut', hucre: '9,3', yon: 0 },
    { esya: 'saksi', hucre: '11,3', yon: 0 },
  ],
  egitimGoruldu: ['ilkSiparis', 'susleme', 'tepsi', 'vitrin'],
};
