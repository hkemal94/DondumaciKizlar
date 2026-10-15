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
  // Kapalı alan (Kemal, 15 Ekim: "deneme dükkânının şeklini beğenmiyorum"):
  // dükkân iki sıra derin ve iki yana geniş. Önde pencereli oturma salonu,
  // arkada tezgah, en arkada iki karelik mutfak. Müşteri soldaki kapıdan
  // girer, salonun sol yanından tezgahın önündeki sıraya yürür.
  kapaliParseller: ['-2,0', '-1,0', '0,0', '1,0', '2,0', '-2,1', '-1,1', '0,1', '1,1', '2,1', '-1,2', '0,2'],
  duvarParcalari: {
    '-8,0,g': 'kapi',
    // Ön cephe: geniş vitrin camları
    '-6,0,g': 'pencere',
    '-5,0,g': 'pencere',
    '-4,0,g': 'pencere',
    '-3,0,g': 'pencere',
    '-2,0,g': 'pencere',
    '1,0,g': 'pencere',
    '2,0,g': 'pencere',
    '3,0,g': 'pencere',
    '4,0,g': 'pencere',
    '5,0,g': 'pencere',
    '6,0,g': 'pencere',
    '9,0,g': 'pencere',
    '10,0,g': 'pencere',
    // Yanlar
    '-8,1,b': 'pencere',
    '-8,2,b': 'pencere',
    '11,5,d': 'pencere',
    '11,6,d': 'pencere',
  },
  mutfakParseller: ['-1,2', '0,2'],
  // Tezgah arka sırada (r 5–7); önündeki sıra r 4
  tezgah: { c: -4, r: 5, boy: 8 },
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
  depo: { saksi: 2, haliYuvarlak: 1, tabloBos: 1 },
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
    // Salon (C4): sağda kilimin üstünde masa, ortada yuvarlak halıda masa,
    // duvarlarda tablolar, köşelerde saksı; kapının önünde paspas
    { esya: 'haliKilim', hucre: '7,1', yon: 0 },
    { esya: 'masa', hucre: '7,1', yon: 0 },
    { esya: 'haliYuvarlak', hucre: '3,1', yon: 0 },
    { esya: 'masa', hucre: '3,1', yon: 0 },
    { esya: 'tabloSoyut', hucre: '11,1', yon: 0 },
    { esya: 'tabloDeniz', hucre: '11,2', yon: 0 },
    { esya: 'tabloDondurma', hucre: '-8,6', yon: 0 },
    { esya: 'saksi', hucre: '11,3', yon: 0 },
    { esya: 'saksi', hucre: '-8,3', yon: 0 },
    { esya: 'saksi', hucre: '10,0', yon: 0 },
    { esya: 'paspas', hucre: '-7,0', yon: 0 },
  ],
  egitimGoruldu: ['ilkSiparis', 'susleme', 'tepsi', 'vitrin'],
};
