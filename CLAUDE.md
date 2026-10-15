# CLAUDE.md — Dondurmacı Kızlar (oyun)

Bu depoda çalışan her yapay zekâ oturumu önce bu dosyayı, sonra
`docs/tasarim-belgesi.md`'yi okur. Belge oyunun **tek kaynağıdır**.

## Kim için çalışıyorsun

Kemal. Oyunu tek başına, yapay zekâ desteğiyle yapıyor. **Kodlama deneyimi
yok.** Açıklamalar Türkçe, sade ve teknik terimsiz olur. Kodu değil,
**ekranda ne değiştiğini** anlat. Kod içindeki değişken adları ve yorumlar
Türkçe.

## Oyun bir cümlede

Düzada adasında, Liman'da iskelenin yakınındaki "Dondurmacı Kızlar"
dükkânının kuruluş yıllarında (2000'lerin başı) geçen, sakin bir dükkân
işletme oyunu. Oyuncu tezgahın arkasında dondurmayı kendi eliyle hazırlar.

## Sabitler (değişmez)

| Konu | Değer |
|---|---|
| Kamera | **İki sabit kamera:** dükkânın izometrik genel görünümü + sipariş gelince tezgahın arkasından birinci şahıs yakın plan. Aralarında yumuşak geçiş. **Oyuncu yürümez.** Genel görünümde her an 360° döndürme, aşağı yukarı eğme, kaydırma ve yakınlaştırma var (14 Ekim); tezgah yakın planı sabit |
| 3B | Gerçek 3B modeller, **sabit açılar** |
| Stil | Low-poly, yumuşak ışık; logo renkleri (mor, sarı) öne çıkar. Sakin, dinlendirici; kaybetme yok, para cezası yok (çok bekleyen müşteri gidip sıfır yıldız verebilir, 13 Ekim) |
| Platform | **Telefon önce.** Dokunmatik birincil kontrol; fare de çalışır. Mağaza ve PC paketi sonra |
| Teknoloji | Vite + TypeScript + React + **Three.js** (React Three Fiber). Oyun tarayıcıda çalışır |
| Yer | Düzada, **Liman Mahallesi, iskelenin yakını** ("sahil şeridi" değil) |
| Dönem | **2000'lerin başı** — dükkânın açılış yılları |
| Oyuncu | **13 Ekim'de değişti:** tezgahın arkasında oyuncunun kişiselleştirdiği bir çalışan; sahibi ara sıra dükkânda gezer. Çalışana hikâye / geçmiş yazma (Kemal'in) |
| Gün | Oyun içinde saat akar; dükkân kapanınca gün biter, gün sonu ekranı gelir |
| Ekran | **Yatay** (12 Ekim). Telefon dik tutulsa da oyun yatay görünür (ekran kilidi); "yan çevir" uyarısı yok |
| Görsel kalite | Taslak görseller (`docs/gorseller/`) temsilî ama **alt sınır**: en az o kalite. Ölçü taslak 2 |
| Yazım | **Düzada** (ü ile). "Dūzada", "Duzada" yazılmaz |

### Kanondan bilinenler (Düzada evreni)

- Dondurmacı Kızlar 2000 sonrası açıldı; Liman'da, iskelenin yakınında.
- Kışın tatlıcı / kafe olur (oyunda mevsim değişimi — **ilk sürümde değil**).
- Sahibi bir kadın; ailesi adalı, anakaradan gelmiş. Aynı kadın İskele'deki
  meyhane Sade Meze'nin de sahibi. **Adı yok** — ad Kemal'in.
- Dükkânın logo renkleri mor ve sarı (tonlar henüz taslak).
- Liman'da ayrıca bir "kafe" var; o başka bir yer, 2010 sonrası açılmış.
  Dondurmacı Kızlar ile karıştırma.

Burada ve belgede yazmayan bir coğrafi, tarihî ya da kurumsal bilgiyi
**uydurma.** Gerekirse geçici bırak ve Kemal'e sor.

## Henüz kararı verilmemiş — sor, seçme

Tam liste belgenin 7. bölümünde. Başlıcaları:

- Oyunun adı (15 Ekim: henüz karar yok) ve mevsim / kış dönemi ne zaman.
- Para modelinin ayrıntıları (14 Ekim: makyaj paketleri satılabilir; gerisi açık).
- Karakter ve mekân adları, müşteri yorumları, festival adları — hepsi Kemal'in.
  Aday önerebilirsin.
- Müşteri tipi yok (15 Ekim): müşteriler aynı davranır, görünüşleri farklı.

## Yazı kuralı

- **Kurgu metni yazma.** Müşteri konuşmaları, hikâye kırıntıları, karakter
  geçmişleri Kemal'in işi. Mekanik için yer tutucu gerekiyorsa açıkça
  "[YER TUTUCU]" diye işaretle; gerçek metin gibi görünmesin.
- Ekrandaki her yazı tek bir çeviri dosyasından gelir
  (`src/metinler/tr.json`); koda gömülmez. İngilizcesi `src/metinler/en.json`'da
  (6. adım); yeni yazı eklenince İngilizcesi de eklenir (eksikse derleme hata verir).

## 3B modeller

- İlk sürümde **hazır, ücretsiz ve ticari kullanıma açık (CC0)** low-poly
  paketler: Kenney, Quaternius, Tiny Treats, KayKit (son ikisi Kemal'in
  14 Ekim paket seçimiyle onaylandı). Başka kaynaktan model eklemeden önce sor.
- Her model tasarım diline göre yüklenir (`src/sahne/tasarimDili.ts`, belge 0.7):
  ölçüye getirilir, renkleri palete çevrilir, yüzeyi mat olur.
- Kullanılan her paketi `docs/lisanslar.md`'ye yaz: paket adı, kaynak
  bağlantısı, lisans.
- Modeller `public/modeller/` altında, glTF/GLB biçiminde.
- Telefonda akıcı çalışması öncelik: düşük çokgen, az ışık kaynağı, gölge
  ölçülü.

## Çalışma şekli

1. **Önce dinle.** Kemal isteklerini ve itirazlarını sıralamayı sever;
   yarısını duyup başlama, "başka var mı?" diye sor.
2. **Tek seferde tek adım.** Bir adım bitince dur, ekranda ne değiştiğini
   anlat, Kemal onaylamadan sonrakine geçme.
3. Her işin başında **belgedeki hangi maddeyi karşıladığını** söyle.
4. Belgede olmayan bir şeyi eklemek istersen önce öner, onay gelince yap.
5. **Her değişiklik ayrı dalda ve PR ile.** Ana dala kendin birleştirme.
   PR açıklaması Türkçe: ekranda ne değişti, telefonda nasıl denenir,
   Kemal'in yapması gereken bir şey var mı.
6. **Görsel iş görsel gösterilir.** Her PR'a telefon boyutunda ekran
   görüntüsü ekle.
7. **Yapılmayan iş yapıldı diye sunulmaz.** Test edilemediyse açıkça söyle.
8. Bir karar değişirse önce `docs/tasarim-belgesi.md` güncellenir, sonra kod.
9. `npm run build` her iş sonunda hatasız geçmeli.
10. Her PR `docs/yol-haritasi.md`'yi günceller (neredeyiz, paketler, bitenler,
    sona kalanlar). KKM'deki oyun sayfası onu canlı okur (Kemal, 14 Ekim gece).
11. **Gece / toplu çalışma** (Kemal, 15 Ekim): Kemal "uyuyorum" ya da benzeri
    bir şey deyince onay beklemeden sıradaki işlere geç, hepsini **tek PR**'da
    topla, sabah için kısa bir özet bırak. Kullanım sınırı dolarsa
    yenilenince kaldığın yerden devam et. Uyanıkken yine tek adım kuralı
    (madde 2) geçerli.
12. Kemal'in gönderdiği **konsept görseller fikirdir**: içlerindeki adlar,
    yerler, yazılar kanon değildir; bir şeyi oradan almadan önce sor.

## Kapsam

**Bu deponun işi:** yalnızca Dondurmacı Kızlar oyunu.

**Bu deponun işi DEĞİL — dokunma, yazma:**
- `hkemal94/TheImperialKemskoy` (resepsiyon oyunu, şu an bekliyor)
- Kems Komuta Merkezi (KKM) deposu — **istisna:** KKM'deki oyun sayfasına
  Kemal'in açıkça istediği işler (yol haritası sekmesi, ayar paneli) KKM'nin
  kendi kurallarıyla, ayrı PR'la yazılır (Kemal, 14–15 Ekim)

## İş sırası

İlk oynanabilir sürüm (iskelet, kepçe, müşteri sırası, gün ve saat,
izometrik görünüm) ve büyüme, karakterler, liman, kişiselleştirme
paketleri bitti. **Güncel sıra ve açık işler `docs/yol-haritasi.md`'de**;
kararların ayrıntısı belgenin 0.12 bölümünde. Sıralamayı Claude yapar;
Kemal "şimdi" derse o iş öne geçer.

Kemal ve yakın çevresi web bağlantısından telefonda dener.
