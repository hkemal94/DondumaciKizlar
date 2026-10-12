# Dondurmacı Kızlar — Oyun Tasarım Belgesi (GDD)

**Proje:** Dondurmacı Kızlar (Kems Company)
**Aşama:** Detaylandırılmış konsept ve oynanış belgesi
**Son güncelleme:** 12 Ekim 2026 — Kemal'in taslağı + aynı gün verilen
kararlar (bölüm 0). Taslak görseller `docs/gorseller/` altında (kanon
değil; neyin alınmayacağı oradaki README'de). KKM oyun dosyasından gelen
ek maddeler bölüm 7'de.

| | |
|---|---|
| **Tür** | Cozy casual / tycoon ve elle dükkân işletme hibriti |
| **Platform** | **Önce telefon** (iOS ve Android, tarayıcıdan); PC sonra |
| **Kamera** | İzometrik (yönetim) + sabit birinci şahıs tezgah görünümü (hazırlama) |
| **Görsel stil** | Sevimli, huzurlu low-poly 3D; yumuşak ışık, pastel tonlar |
| **Oyuncu sayısı** | Tek oyunculu |

---

## 0. Kararlar (12 Ekim 2026)

Taslakla çelişen yerde bu bölüm geçerli.

| Konu | Karar |
|---|---|
| Kamera | İki sabit kamera: dükkânın izometrik genel görünümü + sipariş gelince tezgahın arkasından yakın plan; aralarında yumuşak geçiş. **Oyuncu yürümez** |
| 3B | Gerçek 3B modeller, **sabit açılar** (serbest kamera yok) |
| Stil | Low-poly, pastel, yumuşak ışık |
| Platform | Telefon önce; tarayıcıdan bağlantıyla denenir, mağaza ve PC sonra |
| Teknoloji | Web 3B — Three.js |
| 3B modeller | Hazır, ücretsiz, ticari kullanıma açık paketlerle başla (Kenney, Quaternius); beğenilince özel modeller |
| İlk oynanabilir sürüm | Kepçe mini oyunu + müşteri sırası |
| Gün | Oyun içinde saat akar, dükkân kapanınca gün biter |
| Karakterler | Küçük hikâye kırıntıları: müşteri konuşmalarından adadaki olaylar sızar |
| Oyuncu | İsimsiz — oyuncu kendini koyar |
| Kanon | Liman Mahallesi, iskelenin yakını. Oyun dükkânın **kuruluş hikâyesi** |
| Dönem | 2000'lerin başı |
| Mevsim | Kışın tatlıcı / kafe: menü ve görünüm mevsimle değişir. İlk sürümde değil |
| Para modeli | Henüz karar yok |
| Öncelik | Dondurmacı Kızlar önce; The Imperial (resepsiyon oyunu) bekliyor |
| Ekran yönü | **Yatay** (Kemal, 12 Ekim: "yatay olabilir"). Telefon dik tutulsa da oyun yatay görünür (ekran döndürme kilidi açık olabilir); "yan çevir" uyarısı yok |
| Görsel kalite | Taslak görseller temsilî, ama **en az o kalite** hedef (Kemal, 12 Ekim). Ölçü: taslak 2 |
| Tarz | Karışım (Kemal, 12 Ekim): **3B dünya taslak 2 gibi** (temiz low-poly, yumuşak ışık); **arayüz taslak 1 ve 3 gibi** (sıcak, ahşap paneller ve düğmeler) |
| Renkler | Pastel fazla; **Dondurmacı Kızlar renkleri** (logo: mor ve sarı) öne çıksın (Kemal, 12 Ekim). Düğmeler, pencere çerçevesi, vitrin şeridi mor-sarı. Tonlar taslak |
| Kepçe göstergesi | İbre 1,5 sn'de yavaştı; 1 sn'ye indi (Kemal, 12 Ekim) |
| Topların dizilişi | Külahta üst üste, kapta yan yana (üçüncü üste). Başka dizilişler de denenebilir (Kemal, 12 Ekim) |
| Çeşit sayısı | Sonradan artabilir: küvet listesine bir satır eklenince vitrin genişler. Bu açıdan rahat sığan 6; fazlası için ikinci sıra ya da kaydırma gerekir |
| Deneme telefonu | Elde hangisi varsa; orta seviye bir telefonda akıcı çalışmak hedef |

---

## 1. Oyunun özeti ve vizyonu

### 1.1 Tek cümlelik özet

Düzada'da, Liman'da iskelenin yakınındaki "Dondurmacı Kızlar" dükkânını
kuruluş yıllarında yönettiğiniz; dükkânı büyütüp yeni yetenekler açarken
müşterilerin siparişlerini tezgahın arkasından kendi ellerinizle
hazırladığınız, sakinleştirici ve lofi atmosferli bir dükkân işletme oyunu.

### 1.2 Temel tasarım sütunları

- **Huzurlu atmosfer:** Oyunda kaybetmek ya da sert ceza yok. Lofi müzik,
  deniz esintisi sesleri ve sevimli Düzada sakinleri oyuncuya güvenli ve
  dinlendirici bir alan sunar.
- **Çift bakış açısı:** Oyuncu yalnızca menüleri tıklayan bir yönetici
  değil; tezgaha geçip dondurmayı fiziksel olarak yapmanın (kepçe daldırma,
  sos dökme) tatminini yaşar.
- **Sürekli ilerleme:** Küçük bir dondurma tezgahından onlarca çeşit
  dondurma, waffle, limonata satan ve her köşesi dekore edilmiş, bilinen bir
  dükkâna dönüşme hissi.

---

## 2. Ekranlar ve oynanış senaryoları

### 2.1 Dükkân geneli ve ana arayüz (izometrik yönetim)

![Taslak 1](gorseller/taslak-1-izometrik-dukkan.jpg)

Oyuncu güne başlar. Ekranın üst kısmında günlük kazanç, itibar göstergesi
ve günün saati yer alır. Tezgahta mevcut dondurma çeşitleri sergilenir.

### 2.2 Müşteri ağırlama ve servis

Düzada sakinleri tezgah önünde sıraya girer. Müşterilerin üzerinde
istedikleri dondurmayı gösteren konuşma balonları belirir.

### 2.3 Dondurma hazırlama (birinci şahıs tezgah görünümü)

![Taslak 2](gorseller/taslak-2-tezgah-yakin-plan.jpg)

Müşteri tezgaha geldiğinde kamera yumuşakça tezgahın arkasındaki sabit
birinci şahıs açıya geçer. Oyuncu altlığı seçer, zamanlama çubuğunu
kullanarak kepçeyle küvetten dondurmayı alır, külaha yerleştirir ve servis
eder. (Oyuncu yürümez; kamera sabittir.)

### 2.4 İlerleme, yetenek ve menü yönetimi

![Taslak 3](gorseller/taslak-3-yetenek-menu.jpg)

Biriktirilen parayla yeni tariflerin kilidi açılır, ürün fiyatları
ayarlanır, dükkân için yeni masa, bitki ve dekorasyon alınır.

---

## 3. Dondurma hazırlama mekaniği

1. **Altlık seçimi:** Külah, kap ya da kup — siparişe uygun olan seçilir.
2. **Dondurma alımı (kepçe):** Basılı tutarak küvete daldırılır;
   "MÜKEMMEL!" hizasında bırakılınca kusursuz top elde edilir.
3. **Yerleştirme:** Top külahın üstüne yerleştirilir.
4. **Süsleme ve sos:** İsteğe bağlı sos ya da şekerleme eklenir.
5. **Servis:** Dondurma müşteriye sunulur; para ve itibar kazanılır.

İlk oynanabilir sürümde 1, 2, 3 ve 5 var; süsleme ve sos sonra.

---

## 4. Ekonomi ve ilerleme

- **Yeni çeşitler ve tarif ağacı:** Mango, yaban mersini dondurmalarından
  waffle, kup ve limonataya uzanan genişleme.
- **Dükkân özelleştirme:** Masa, sandalye, şemsiye, bitki ve ışıklarla
  dükkânın çekiciliğini artırma.
- **Mevsim (sonra):** Kışın dükkân tatlıcı / kafe olur; menü ve görünüm
  değişir.

---

## 5. Dünya ve kurgu

- **Yer:** Düzada, Liman Mahallesi, iskelenin yakını.
- **Dönem:** 2000'lerin başı — dükkânın açılış yılları.
- **Hikâye:** Dükkânın kuruluş hikâyesi: küçük başlar, adanın bilinen
  dükkânına dönüşür.
- **Oyuncu:** İsimsiz.
- **Karakterler:** Müşterilerin konuşmalarından adadaki olaylara dair küçük
  kırıntılar sızar. Metinleri Kemal yazar.
- **Kanondan:** Sahibi bir kadın (ailesi adalı, anakaradan gelmiş; Sade
  Meze'nin de sahibi; adı yok). Logo renkleri mor ve sarı (taslak).

---

## 6. Görsel ve işitsel yönelim

- **Sanat yönetimi:** Low-poly, pastel tonlarda sevimli 3D grafikler.
  Telefonda akıcı çalışacak kadar sade.
- **Ses ve müzik:** Sakin lofi hip-hop, akustik müzik; deniz ve rüzgâr
  sesleri.

---

## 7. Açık sorular

"Öneri" sütunu yapay zekânın önerisidir, **karar değildir**. Karar Kemal'in;
karar verilince bölüm 0'a taşınır.

### 7.1 Taslaktan gelenler

| Konu | Durum | Öneri |
|---|---|---|
| Bir oyun gününün gerçek süresi | Öneri 5–8 dakika | 6 dakikayla başla, Kemal'in denemesine göre ayarla |
| İlk sürümde kaç çeşit, kaç müşteri tipi | Açık | 4 çeşit (taslak 2'deki çilek, çikolata, nane, vanilya) + 2 altlık (külah, kap); 3–4 müşteri görünümü |
| Birinci şahısta eller | Kemal henüz karar vermedi; değişebilir | İlk denemede eller olmadan, yalnız külah ve kepçe; sonra eklenip karşılaştırılır |
| Para modeli | Açık | İlk sürümde yok; yakın çevre denemesi bitince konuşulur |
| Oyunun adı | "Dondurmacı Kızlar" dükkânın adı; oyunun adı da bu mu? | — (Kemal'in) |
| İsimsiz oyuncu + kuruluş hikâyesi | Oyuncu sahip mi, ilk çalışan mı — belli olmak zorunda değil | Belirsiz kalsın; ekranda hep birinci şahıs eller, izometrikte oyuncu görünmez |

### 7.2 KKM oyun dosyasından gelenler (12 Ekim)

KKM'deki oyun dosyasında olup bu belgede olmayan maddeler:

| Konu | KKM dosyasında | Öneri |
|---|---|---|
| Zaman aralığı | "Onyıllara yayılır" — belgede dönem 2000'lerin başı | Oyun 2000'lerin başında başlar; yıllar sonraki güncellemelerle ilerleyebilir. İlk sürüm tek dönem |
| Seslendirme | Kısmi | İlk sürümde yok; müşteriler balonla anlatır. Sonra kısa sesler (selam, teşekkür) |
| Başarımlar | Var | İlk sürümde yok; sonraki sürümlere |
| Kaynak yönetimi | Ana mekanik | İlk sürümde stok yok; sonra "küvet biter, gün sonu sipariş verilir" gibi hafif bir biçim |
| Bir oturum | 15–30 dakika | Belgeyle uyumlu: bir oturum 3–4 oyun günü |
| Platform | PC, mobil | Bölüm 0 geçerli: önce telefon |
| Hedef oyuncu | Aile / herkes | Belgeyle uyumlu |
| Oyunun sonu | Açık uçlu | Belgeyle uyumlu |
| Riskler | Kapsam büyür, motivasyon düşer | İlk oynanabilir sürümü küçük tut (bölüm 0); her adım telefonda denenebilir olsun |

### 7.3 Taslak görsellerden doğan sorular

| Konu | Durum | Öneri |
|---|---|---|
| Para birimi | Görsellerde altın (g), yıldız, "Skill Points" karışık | Tek para (dönemin parası mı, oyuna özel mi — Kemal'in) + itibar yıldızları. Tarif ağacı da parayla açılsın; üçüncü birim olmasın |
| İzometrikte tezgah arkasındaki kız (taslak 1) | Oyuncu mu, sahibi mi, çalışan mı? | Oyuncu görünmez; orada biri olacaksa çalışan ya da sahibi olur, adı ve görünüşü Kemal'in |
| Logo renkleri | Görsellerde pembe / krem / kahve; kanonda mor ve sarı | Kanon geçerli: mor ve sarı |
| Dükkânın çevresi | Görsellerde kumlu plaj | Kanon geçerli: iskelenin yakını. Plaj yerine iskele ve tekneler görünsün |
| Kepçe göstergesi | Taslak 2'de "HIZ" yazıyor | Gösterge "MÜKEMMEL" bölgesini göstersin, yazısı çeviri dosyasından gelsin |

### 7.4 3. ve 4. adımda geçici konan sayılar (Kemal'in onayını bekliyor)

| Konu | Geçici değer | Not |
|---|---|---|
| Para birimi | Adsız, sarı jeton simgesi | Ad ve biçim Kemal'in (7.3) |
| Top fiyatı | 10; MÜKEMMEL top +5, İyi top +2 | Fiyat ekranı gelince değişir |
| Memnuniyet | Her müşteri 1–5 yıldız: MÜKEMMEL 5, İyi 4, küçük / büyük 3. Ekranda ortalama | |
| Yanlış sipariş | Ceza yok: dondurma kenara konur, müşteri bekler, yeniden yapılır | Sütun: kaybetme yok |
| Sıra | En çok 4 kişi; yeni müşteri 5–9 sn'de bir | Gün süresi kararıyla ayarlanır |
| Sipariş | Altlık rastgele; yarısı 1 top, üçte biri 2 top, kalanı 3 top | |
| Müşteri görünümü | 4 kodla çizilmiş geçici görünüm; adsız | Model kararı sonra |
| Gün süresi | Gerçekte 6 dakika (7.1 önerisi) | Adresin sonuna `#hizli` yazılırsa 30 sn (deneme için) |
| Açılış / kapanış | 10:00 – 20:00 (oyun saati) | Kanon değil; Kemal'in |
| Kapanış | 20:00'de yeni müşteri gelmez; sıradakilere servis bitince gün sonu ekranı | Ceza yok |
| Gün sonu ekranı | Servis edilen müşteri, günün kazancı, MÜKEMMEL top, günün memnuniyeti, kasadaki para | |
| Akşam ışığı | Gün ilerledikçe güneş alçalır, ışık turuncuya döner | Belgede yoktu; beğenilmezse kalkar |
| Kayıt | Yok: sayfa kapanınca para ve gün sıfırlanır | Sonraki iş olarak önerildi |
