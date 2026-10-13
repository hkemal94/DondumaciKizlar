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
| Oyuncu | ~~İsimsiz — oyuncu kendini koyar~~ → 13 Ekim: kişiselleştirilebilir çalışan (aşağıda) |
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
| Geri al | "Hata yaptığım zaman geri alamıyorum" (Kemal, 12 Ekim). **Geri al** düğmesi sırayla: kepçedeki topu küvete geri koyar → son konan topu çıkarır. 13 Ekim'den beri altlık ve süsleme için kullanılmaz (doğrudan değiştirilir). Ceza yok |
| Saatin akışı | Her gerçek saniye oyun saatine **5 dakika** ekler; saat beşer dakika ilerler (Kemal, 13 Ekim: "beş dakikalar saniye gibi aksın"). Hafta içi bir gün ≈ 2,5 dk, hafta sonu ≈ 3 dk sürer |
| Çalışma saatleri (yaz dönemi) | **Hafta içi 11:00–00:00, hafta sonu 10:00–02:00** (Kemal, 13 Ekim). Mevsimler gelince kış saatleri ayrıca konuşulacak |
| Genel görünüm açısı | Dükkânın **önünden** (deniz / müşteri tarafından) çekilir; önceki açı 180° ters idi (Kemal, 13 Ekim) |
| Genel görünümde yakınlaştırma | Açı sabit, ama oyuncu **yakınlaştırıp uzaklaştırabilir** (iki parmak, fare tekerleği, + / − düğmeleri); başlangıçta uzaktan (Kemal, 13 Ekim: "insanlar dükkânlarını görebilsinler"). Tezgah görünümü sabit kalır |
| Eksik / fazla süsleme | Altlık ve toplar doğruysa ama süsleme tutmuyorsa dondurma çöpe gitmez: oyun hangi süslemenin eksik ya da fazla olduğunu hatırlatır (Kemal, 13 Ekim) |
| Haftanın günü | 1. gün pazartesi (Kemal, 13 Ekim) |
| Oyunun adı | **Dondurmacı Kızlar** (dükkânla aynı; Kemal, 13 Ekim) |
| İlk dört çeşit | **Çilek, Çikolata, Fıstık, Kaymak** (Kemal, 13 Ekim) |
| Para | Adsız jeton (Kemal, 13 Ekim) |
| Oyuncu ve dükkândakiler | **Karar değişti** (13 Ekim): tezgahın arkasında oyuncunun **kişiselleştirebileceği bir çalışan** olur: ten rengi, saç, kıyafet ve önlük, **ad** (oyuncu yazar); parayla yeni kıyafet açılır; vakti gelince şapka, küpe, gözlük gibi aksesuarlar. Dükkânın sahibi (kanondaki kadın, adı yok) **ara sıra gelip dükkânda dolaşır**, şimdilik başka bir şey yapmaz. Eski "oyuncuya ad, yüz verme" kuralının yerine geçer |
| Müşteri sabrı | **Karar değişti** (13 Ekim): yalnız **öndeki** (sırası gelen) müşteri sabırsızlanır. Hiç işlem yapılmadan **oyun saatiyle bir saat** (gerçekte ~12 sn; önce yarım saatti, Kemal 13 Ekim'de uzattı) geçerse sıkılıp gider ve memnuniyete **sıfır yıldız** verir. Herhangi bir işlem (yanlış bile olsa) sabrı sıfırlar. Para kaybı yok. Balonun altında sabır çubuğu (yeşil → sarı → kırmızı). Kapanıştan sonra saat durduğu için sıradakilerin sabrı azalmaz. |
| Hafta sonu | Hafta sonu daha kalabalık (Kemal, 13 Ekim): müşteri aralığı ×0,65 (geçici). |
| Siparişlerin büyümesi | Bazen **iki dondurma**, bazen **birden çok süsleme**; bir şey **açılınca** başlar (Kemal, 13 Ekim). Açılan şey: **Tepsi** (aşağıda) |
| Waffle ve limonata | Şimdilik yok. Gelince **kendi mini oyunları** olur; makineleri **parayla alınıp dükkâna konur**; geliri ve memnuniyeti etkileyen bir yapı düşünülebilir (Kemal, 13 Ekim) |
| Ses | Kodla üretilir, dışarıdan dosya yok (Kemal, 13 Ekim): **deniz ve rüzgâr** (arkada sürekli, gece daha sessiz); **tezgah** (kepçe dalışı, top yerleşmesi, MÜKEMMEL çınlaması, süsleme serpme); **para ve müşteri** (jeton, müşteri tezgaha gelince zil, sıkılıp gidince alçak ses); **düğme tıkları**. **Müzik:** şimdilik kodla basit, sakin bir ezgi; Kemal'in müziği (Suno vb.) gelince yerini alır. Sesler **ilk dokunuşta** açılır (telefonlar dokunmadan ses çaldırmaz). Mola menüsünde müzik ve ses ayarı |
| Gerçek 3B modeller | Sonra; her parça ayrı değiştirilebilir, bugünkü geçici parçalar sonradan kolayca değişir |
| Eller | Sonra bakılacak |
| Gün sonu ve gün başı | Gün sonu ekranı kalır, altında yalnız **Tamam**. Tamam'dan sonra dükkânın genel görünümüne dönülür; **Yeni güne başla** ve **dekorasyon / geliştirme** orada. Gün oyuncu başlatınca başlar: günün başında oyuncu dükkânına bakıp vakit geçirebilir, menülere sıkışmaz (Kemal, 13 Ekim). |
| Altlık değiştirme | Külah / kap / kup arasında her an doğrudan geçilir, Geri al gerekmez; konmuş toplar ve süslemeler yeni altlığa geçer (Kemal, 13 Ekim). |
| Süsleme kaldırma | Aynı süslemeye yeniden basınca o süsleme kalkar; süsleme için Geri al gerekmez (Geri al yalnız kepçedeki ve konmuş toplar için kalır). Bir dondurmaya birden çok süsleme gelebilir (Kemal, 13 Ekim). |
| Dekorasyon türleri | İki tür (Kemal, 13 Ekim): **genel** (ör. ışıklandırma; tek tip, daha pahalı üst seviyeleri olabilir) ve **taşınabilir** (ör. masa takımı: alınır, yerini oyuncu elle seçer; kareli yerleştirme düzeni önerildi). Taşınabilir eşyalar **dükkânın içine de önüne (terasa) de** konabilir (Kemal, 13 Ekim). Dekorasyon uzun soluklu bir alan. *Uygulamada henüz yok* |
| Kapı ve müşteri yolu | Dükkânın önünde (teras / iskele tarafında) bir **kapı** olur. Müşteriler havadan belirmez: kameranın dışından **iskele boyunca yürüyerek** gelir, kapıdan girer, sıraya geçer; giderken kapıdan çıkıp yürür. Hep aynı taraftan gelmezler, iki yönden de gelirler (Kemal, 13 Ekim) |
| Dekorasyon | **Genel:** ışıklandırma üç seviye — 1 fenerler, 2 terasa asma ampuller, 3 dükkân önünde ışıklı mor-sarı şerit; her seviye öncekinden pahalı. **Taşınabilir:** masa takımı, şemsiyeli masa, çiçek saksısı; alınınca depoya gider, gün başında "Yerleştir" ile kareli zeminde bir kareye konur (terasa ve içeri); konmuş eşyaya dokunulunca yeniden seçilir, başka yere taşınır. Müşteri yolu ve kapı önü boş kalır. Yerleştirilen her eşya ve her ışık seviyesi müşterileri biraz daha sık getirir. Fiyatlar geçici |
| Genel görünümde kaydırma | Tek parmakla sürükleyince görüntü sağa, sola, ileri, geri kayar; açı değişmez (Kemal, 13 Ekim). Sol alttaki **ortala** düğmesi baştaki görünüme döndürür. Dükkânı gezerken tek parmak döndürür |
| Tezgah düzeni | Dar telefon ekranında külah çikolata küvetini kapatıyordu (Kemal, 13 Ekim). Kamera biraz aşağı eğildi, küvetler ekranda yukarı çıktı; külah küvetlerin üstüne, sola alındı |
| Duraklatma menüsü | Sol üstte duraklat düğmesi (Kemal, 13 Ekim). Saat, müşteriler ve sabır durur. Menüde: **Devam et**, **Dükkânı gez**, **ses ayarı** (müzik ve sesler; ses henüz yok, ayar saklanır) |
| Dükkânı gezme | Duraklatınca dükkânın çevresinde **parmakla döndürülür**, yakınlaştırılır; bakılan yöne dönük duvarlar kalkar. Serbest kameranın tek istisnası budur; oyun sırasında açılar sabit |
| Gezerken duvarlar | Tek düğme sırayla değiştirir (Kemal, 13 Ekim): **Kesit** (bakılan yöne dönük duvarlar kalkar) → **Duvarsız** (hepsi kalkar) → **Kapalı** (bütün duvarlar ve tavan yerinde; dükkâna tümden dışarıdan bakılır) |
| Gezerken gece / gündüz | Dükkânı gezerken bir düğme ışığı sırayla değiştirir: şimdiki saat → gündüz → akşam → gece (Kemal, 13 Ekim). Yalnız görünüş; oyunun saati değişmez |
| Deneme parası | Yalnız adresin sonuna `#deneme` yazılınca, Dükkânı geliştir'de "Deneme parası +5000" düğmesi çıkar; dekorasyonu denemek için (Kemal, 13 Ekim). Oyunun kendisinde yok |
| Fotoğraf | Gezerken **Fotoğraf çek**: o anki görüntü gösterilir; telefonda resme basılı tutarak kaydedilir (Claude önizlemesinde İndir düğmesi çalışmaz, yayın bağlantısında çalışır) |
| Sipariş balonu | Müşterinin başının sağında, aşağı doğru açılır (üstteki ipucuyla çakışmasın; 13 Ekim) |
| İpucu yazısı | Üst sıranın altında, ortada; dili sıcak (Kemal, 13 Ekim: "üst üste gelmiş, çok soğuk") |
| Tepsi | Dükkânı geliştir → Yeni çeşitler'den **Tepsi** (geçici 400) alınınca siparişlerin bazıları **iki dondurma** ya da **iki süsleme** ister. İki dondurmalı siparişte ilk dondurma hazırlanınca **Tepsiye koy**'a basılır, sonra ikincisi hazırlanır, Servis et ikisini birden verir. Balonda iki dondurma yan yana görünür. Sıra kural değil |
| Çalışan | Tezgahın arkasında, genel görünümde görünür (tezgah görünümünde kameranın yerinde olduğu için görünmez). Gün başında **Çalışan** düğmesiyle sağda panel açılır, kamera çalışana yaklaşır: ad, ten (5), saç (kısa, uzun, topuz, kıvırcık; 6 renk), önlük (mor, sarı, krem; parayla çizgili 150, puantiyeli 200), aksesuar (parayla küpe 100, bandana 120, gözlük 160, kasket 180; başa tek şey). Adı genel görünümde başının üstünde yazar. Kepçe dalarken öne eğilir. Fiyatlar geçici; çalışana hikâye yazılmaz |
| Sahibi (5. paket) | Günde bir kez, rastgele bir saatte iskeleden gelir, kapıdan girer, dükkânda ve terasta biraz dolaşıp gider; başka bir şey yapmaz. Görünüşü **geçici** (mor elbise, topuz saç); kanonda görünüşü yok, Kemal belirleyecek |
| Topların sırası | Kural değil: yalnız altlık, çeşitler ve top sayısı tutmalı (13 Ekim) |
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
| Gün süresi | Saniyede 5 oyun dakikası (bölüm 0) | Adresin sonuna `#hizli` yazılırsa gün 30 sn (deneme için) |
| Kapanış | 20:00'de yeni müşteri gelmez; sıradakilere servis bitince gün sonu ekranı | Ceza yok |
| Gün sonu ekranı | Servis edilen müşteri, günün kazancı, MÜKEMMEL top, günün memnuniyeti, kasadaki para | |
| Akşam ve gece ışığı | Saate göre: öğleden sonra güneş alçalır, 20:00 sularında gün batımı, sonra gece (gök kararır, ampuller ve fenerler yanar) | Belgede yoktu; beğenilmezse kalkar |
| Kamera geçişi | Gün dükkânın genel görünümüyle başlar. Öndeki müşteri tezgaha varınca kamera kendiliğinden tezgaha geçer; sıra boşalınca genele döner. Oyuncu düğmeyle de geçer (genelde "Tezgaha geç", tezgahta ev simgesi) | 5. adım |
| Genel görünüm | Önden, bebek evi gibi: tavan, pencere duvarı ve sol duvar kalkar, yalnız dipleri görünür; menü panosu arka duvarda. Oyuncu görünmez | 5. adım, 13 Ekim'de 180° çevrildi |
| Dükkân içi | Arka tezgah (kavanozlar, kahve makinesi, kasa), yazısız menü panosu, üç saksı; dışarıda taş kaldırım. Hepsi geçici | Taslak 1'e göre; ad ve yazı yok |
| Süsleme ve sos | Üç tane: çikolata sosu, renkli şeker, fındık (belge 3, adım 4). En az bir top konunca sağdaki sütunda çıkar; her biri bir kez. Süslemeden sonra top eklenmez | Çeşitler ve adları Kemal'in onayına |
| Süslemeli sipariş | Siparişlerin üçte birinde bir süsleme istenir; balonda topun üstünde ve ayrıca balonun altında rozet olarak görünür. Süsleme başına +3 | Geçici oran ve fiyat |
| Düğme yerleri | Altlık düğmeleri solda, Geri al ve süslemeler sağda dikey sütun, Servis et sağ altta: küvetlerin üstüne binmesinler diye | |
| Dükkânı geliştir | Gün başlamadan, dükkânın genel görünümündeki düğmeyle açılır (13 Ekim'den önce gün sonu ekranındaydı); üç sekme (taslak 3 gibi): Yeni çeşitler, Fiyat, Dekorasyon | Belge 2.4 ve 4 |
| Yeni çeşitler | Mango 150, yaban mersini 250 (belge 4'teki adlar). Açılınca vitrine küvet eklenir, müşteriler de istemeye başlar. İlk dört çeşidin adı yok | Fiyatlar geçici |
| Fiyat | Ucuz (top 8, müşteri daha sık), Normal (10), Pahalı (13, daha seyrek, memnuniyet −0,5) | Geçici |
| Dekorasyon | Çiçek saksıları 80, fenerler 120, şemsiye 160, masa takımı 200. Her biri müşteri aralığını %6 kısaltır; dükkânın önünde görünür | Geçici |
| Kayıt | Para, gün, açılan çeşitler, fiyat ve dekorasyon bu tarayıcıda saklanır (gün başında ve alışverişte). "Baştan başla" onay ister | Belgede yoktu; ilerlemenin anlamı olsun diye eklendi |
| Kup | Üçüncü altlık (belge 3: "külah, kap ya da kup"): Dükkânı geliştir → Yeni çeşitler'den 200'e açılır. Açılınca müşteriler kup da ister; kuplu sipariş +5 | Geçici fiyat; ayaklı cam kâse, kodla çizilmiş |

---

## 8. Yapım durumu (12 Ekim gece)

Uygulamada **olan**:

| İş sırası | Durum |
|---|---|
| 1. İskelet | Bitti |
| 2. Tezgah + kepçe mini oyunu | Bitti (geri al dahil) |
| 3. Müşteri sırası | Bitti |
| 4. Gün ve saat | Bitti |
| 5. İzometrik görünüm + kamera geçişi | Bitti |
| 6. Süsleme ve sos | Bitti (3 süsleme) |
| 6. Yeni çeşitler ve tarif ağacı | Kısmen: mango, yaban mersini, kup açılır. Waffle ve limonata yok (yeni hazırlama biçimi ister; Kemal'le konuşulacak) |
| 6. Fiyatlar | Bitti (3 seviye) |
| 6. Dekorasyon | Bitti (4 parça) |
| 6. Mevsim (kış: tatlıcı / kafe) | Yok (ilk sürümde değil) |
| 6. Hikâye kırıntıları | Yok (metinler Kemal'in) |

Uygulamada **olmayan** ama belgede geçenler: Kemal'in müziği (şimdilik kodla geçici ezgi), eller, gerçek 3B modeller (hepsi kodla çizilmiş geçici parçalar), İngilizce.
