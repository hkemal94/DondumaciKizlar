# Model hazırlama rehberi

Kemal kendi 3B modellerini yapacağı gün için (belge 0.14). Kısa: **GLB,
düşük çokgen, metre ölçüsünde, önü bir yöne bakan, düz renkli**. Gerisini oyun
kendisi yapar. Oyun her modeli yüklerken (`src/sahne/tasarimDili.ts`):

1. boyunu verilen ölçüye getirir (yükseklik ya da en, metre),
2. yere oturtur ve ortalar,
3. renklerini dükkânın paletine çevirir (istenirse renk renk "boya" tablosuyla),
4. yüzeyi mat yapar.

Yani modelin tam ölçüde ya da tam renkte olması gerekmez; ama aşağıdakiler
uyarsa daha iyi durur.

## Biçim

| | |
|---|---|
| Dosya | **GLB** (glTF ikili, tek dosya). Blender: *File → Export → glTF 2.0 → Format: glTF Binary (.glb)* |
| Dokular | Ya hiç doku yok (düz renkler, malzeme başına bir renk) ya da dosyanın **içine gömülü** tek küçük renk tablosu (en çok 512 × 512) |
| Ad | Küçük harf, Türkçe karakter ve boşluk yok: `dondurma-arabasi.glb`, `kasa-eski.glb` |
| Yer | `public/modeller/<klasör>/` (mutfak, tezgah, mobilya…). İstersen bana gönder, ben koyarım |

## Ölçü ve yön

- **1 birim = 1 metre.** Bir sandalye ~0,9, bir kapı ~2,1, bir külah ~0,17.
- **Taban yerde** (en alt nokta y = 0), modelin ortası x ve z'de sıfırda.
- **Önü tek bir yöne baksın** (Blender'da −Y, yani ekranın içine doğru).
  Oyunda hangi yöne döneceğini kodda tek satırla ayarlarım; önemli olan her
  modelin hep aynı kurala uyması.
- Duvara asılan bir şeyse (tablo, lamba) **arkası düz** ve duvara değen yüz
  modelin arka kenarında olsun.

## Çokgen (telefon için)

| Ne | Üçgen sayısı (en çok) |
|---|---|
| Küçük eşya (fincan, meyve, kavanoz) | 300 |
| Tezgah üstü makine, sandalye, saksı | 1.500 |
| Büyük eşya (buzdolabı, vitrin, masa takımı) | 3.000 |
| Bina, tekne | 8.000 |

Low-poly stil zaten bunu ister: yuvarlaklar 8–12 kenarla yeter.

## Renk

- Düz renkler kullan; ışık ve gölgeyi oyun verir (dokuya gölge boyama).
- Dükkânın renkleri **mor ve sarı**; Liman'daki öteki şeyler bu ikisini almaz.
  Oyun renkleri zaten palete çeviriyor; çok parlak ya da çok koyu renkler
  yumuşar.
- Cam gibi saydam bir parça varsa ayrı bir malzeme olsun (adı `Cam` ya da `Glass`).

## Karakterler (insan) yaparsan

Şimdiki insanlar Quaternius **Ultimate Modular** paketinden; hareketler
(yürüme, bekleme, uzanma…) bütün karakterlerde ortak bir iskeletle çalışıyor.
Kendi karakterin bu hareketleri kullanacaksa **aynı iskelet** (aynı kemik
adları) gerekir. En kolayı: Quaternius karakterinden başlayıp üstünde
değiştirmek. Saç için `Hair` ile başlayan bir malzeme adı kullan (oyun saç
rengini öyle bulur), ten için `Skin`.

## Deneme

Modeli yükleyince oyunun adresinin sonuna `#model=<klasör>/<ad>` yazarak tek
başına görebilirsin (örnek: `#model=mutfak/fridge_A`). Oyuna konduğunda nasıl
durduğunu ben ekran görüntüsüyle gösteririm.

## Lisans

Kendi yaptığın modeller senin. Bir paketten başlayıp değiştirdiysen o paketin
lisansı geçerli (şimdiki paketlerin hepsi CC0, serbest); `docs/lisanslar.md`'ye
yazarım.
