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
| Para modeli | **Makyaj paketleri satılabilir** (Kemal, 14 Ekim): mevsim paketleri gibi, oyunun görünüşünü değiştiren ürünler ayrıca satılabilir. Ayrıntılar (fiyat, mağaza) sonra |
| Öncelik | Dondurmacı Kızlar önce; The Imperial (resepsiyon oyunu) bekliyor |
| Ekran yönü | **Yatay** (Kemal, 12 Ekim: "yatay olabilir"). Telefon dik tutulsa da oyun yatay görünür (ekran döndürme kilidi açık olabilir); "yan çevir" uyarısı yok |
| Görsel kalite | Taslak görseller temsilî, ama **en az o kalite** hedef (Kemal, 12 Ekim). Ölçü: taslak 2 |
| Tarz | Karışım (Kemal, 12 Ekim): **3B dünya taslak 2 gibi** (temiz low-poly, yumuşak ışık); **arayüz taslak 1 ve 3 gibi** (sıcak, ahşap paneller ve düğmeler) |
| Renkler | Pastel fazla; **Dondurmacı Kızlar renkleri** (logo: mor ve sarı) öne çıksın (Kemal, 12 Ekim). Düğmeler, pencere çerçevesi, vitrin şeridi mor-sarı. Tonlar taslak |
| Kepçe göstergesi | İbre 1,5 sn'de yavaştı; 1 sn'ye indi (Kemal, 12 Ekim) |
| Topların dizilişi | Külahta üst üste, kapta yan yana (üçüncü üste). Başka dizilişler de denenebilir (Kemal, 12 Ekim) |
| Çeşit sayısı | Sonradan artabilir: küvet listesine bir satır eklenince vitrin genişler. Bu açıdan rahat sığan 6; fazlası için ikinci sıra ya da kaydırma gerekir |
| Geri al | "Hata yaptığım zaman geri alamıyorum" (Kemal, 12 Ekim). **Geri al** düğmesi sırayla: kepçedeki topu küvete geri koyar → son konan topu çıkarır. 13 Ekim'den beri altlık ve süsleme için kullanılmaz (doğrudan değiştirilir). Ceza yok |
| Saatin akışı | Saat beşer dakika ilerler. İlk ayar saniyede 5 dakikaydı (Kemal, 13 Ekim: "beş dakikalar saniye gibi aksın"); iPhone denemesinde "günler çok uzun" dendi, Kemal 2 dakika istedi (13 Ekim): her adım **0,77 saniye**. Hafta içi bir gün ≈ 2 dk, hafta sonu ≈ 2,5 dk sürer |
| Çalışma saatleri (yaz dönemi) | **Hafta içi 11:00–00:00, hafta sonu 10:00–02:00** (Kemal, 13 Ekim). Mevsimler gelince kış saatleri ayrıca konuşulacak |
| Genel görünüm açısı | Dükkânın **önünden** (deniz / müşteri tarafından) çekilir; önceki açı 180° ters idi (Kemal, 13 Ekim) |
| Genel görünümde yakınlaştırma | Açı sabit, ama oyuncu **yakınlaştırıp uzaklaştırabilir** (iki parmak, fare tekerleği, + / − düğmeleri); başlangıçta uzaktan (Kemal, 13 Ekim: "insanlar dükkânlarını görebilsinler"). Tezgah görünümü sabit kalır |
| Eksik / fazla süsleme | Altlık ve toplar doğruysa ama süsleme tutmuyorsa dondurma çöpe gitmez: oyun hangi süslemenin eksik ya da fazla olduğunu hatırlatır (Kemal, 13 Ekim) |
| Haftanın günü | 1. gün pazartesi (Kemal, 13 Ekim) |
| Oyunun adı | **Dondurmacı Kızlar** (dükkânla aynı; Kemal, 13 Ekim) |
| İlk dört çeşit | **Çilek, Çikolata, Fıstık, Kaymak** (Kemal, 13 Ekim) |
| Para | Adsız jeton (Kemal, 13 Ekim) |
| Oyuncu ve dükkândakiler | **Karar değişti** (13 Ekim): tezgahın arkasında oyuncunun **kişiselleştirebileceği bir çalışan** olur: ten rengi, saç, kıyafet ve önlük, **ad** (oyuncu yazar); parayla yeni kıyafet açılır; vakti gelince şapka, küpe, gözlük gibi aksesuarlar. Dükkânın sahibi (kanondaki kadın, adı yok) **ara sıra gelip dükkânda dolaşır**, şimdilik başka bir şey yapmaz. Eski "oyuncuya ad, yüz verme" kuralının yerine geçer |
| Müşteri sabrı | **Karar değişti** (13 Ekim): yalnız **öndeki** (sırası gelen) müşteri sabırsızlanır. Hiç işlem yapılmadan **oyun saatiyle 80 dakika** (gerçekte ~12 sn; önce yarım saat, sonra bir saatti. Saat 13 Ekim'de hızlanınca Kemal sabrın kısalmamasını istedi: "onu durağanlığın önüne geçmek için koyduk") geçerse sıkılıp gider ve memnuniyete **sıfır yıldız** verir. Herhangi bir işlem (yanlış bile olsa) sabrı sıfırlar. Para kaybı yok. Balonun altında sabır çubuğu (yeşil → sarı → kırmızı). Kapanıştan sonra saat durduğu için sıradakilerin sabrı azalmaz. |
| Hafta sonu | Hafta sonu daha kalabalık (Kemal, 13 Ekim): müşteri aralığı ×0,65 (geçici). |
| Siparişlerin büyümesi | Bazen **iki dondurma**, bazen **birden çok süsleme**; bir şey **açılınca** başlar (Kemal, 13 Ekim). Açılan şey: **Tepsi** (aşağıda) |
| Waffle ve limonata | Şimdilik yok. Gelince **kendi mini oyunları** olur; makineleri **parayla alınıp dükkâna konur**; geliri ve memnuniyeti etkileyen bir yapı düşünülebilir (Kemal, 13 Ekim) |
| Ses | Kodla üretilir, dışarıdan dosya yok (Kemal, 13 Ekim): **deniz ve rüzgâr** (arkada sürekli, gece daha sessiz); **tezgah** (kepçe dalışı, top yerleşmesi, MÜKEMMEL çınlaması, süsleme serpme); **para ve müşteri** (jeton, müşteri tezgaha gelince zil, sıkılıp gidince alçak ses); **düğme tıkları**. **Müzik:** şimdilik kodla basit, sakin bir ezgi; Kemal'in müziği (Suno vb.) gelince yerini alır. Sesler **ilk dokunuşta** açılır (telefonlar dokunmadan ses çaldırmaz). Mola menüsünde müzik ve ses ayarı |
| Gerçek 3B modeller | Sonra; her parça ayrı değiştirilebilir, bugünkü geçici parçalar sonradan kolayca değişir |
| Eller | **Olmayacak** (Kemal, 14 Ekim: "eller olmasın, bu hali güzel"). Tezgahta yalnız altlık ve kepçe görünür |
| Gün sonu ve gün başı | Gün sonu ekranı kalır, altında yalnız **Tamam**. Tamam'dan sonra dükkânın genel görünümüne dönülür; **Yeni güne başla** ve **dekorasyon / geliştirme** orada. Gün oyuncu başlatınca başlar: günün başında oyuncu dükkânına bakıp vakit geçirebilir, menülere sıkışmaz (Kemal, 13 Ekim). |
| Altlık değiştirme | Külah / kap / kup arasında her an doğrudan geçilir, Geri al gerekmez; konmuş toplar ve süslemeler yeni altlığa geçer (Kemal, 13 Ekim). |
| Süsleme kaldırma | Aynı süslemeye yeniden basınca o süsleme kalkar; süsleme için Geri al gerekmez (Geri al yalnız kepçedeki ve konmuş toplar için kalır). Bir dondurmaya birden çok süsleme gelebilir (Kemal, 13 Ekim). |
| Dekorasyon türleri | İki tür (Kemal, 13 Ekim): **genel** (ör. ışıklandırma; tek tip, daha pahalı üst seviyeleri olabilir) ve **taşınabilir** (ör. masa takımı: alınır, yerini oyuncu elle seçer; kareli yerleştirme düzeni önerildi). Taşınabilir eşyalar **dükkânın içine de önüne (terasa) de** konabilir (Kemal, 13 Ekim). Dekorasyon uzun soluklu bir alan. *Uygulamada henüz yok* |
| Kapı ve müşteri yolu | Dükkânın önünde (teras / iskele tarafında) bir **kapı** olur. Müşteriler havadan belirmez: kameranın dışından **iskele boyunca yürüyerek** gelir, kapıdan girer, sıraya geçer; giderken kapıdan çıkıp yürür. Hep aynı taraftan gelmezler, iki yönden de gelirler (Kemal, 13 Ekim) |
| Dekorasyon | **Genel:** ışıklandırma üç seviye — 1 fenerler, 2 terasa asma ampuller, 3 dükkân önünde ışıklı mor-sarı şerit; her seviye öncekinden pahalı. **Taşınabilir:** masa takımı, şemsiyeli masa, çiçek saksısı; alınınca depoya gider, gün başında "Yerleştir" ile kareli zeminde bir kareye konur (terasa ve içeri); konmuş eşyaya dokunulunca yeniden seçilir, başka yere taşınır. Müşteri yolu ve kapı önü boş kalır. Yerleştirilen her eşya ve her ışık seviyesi müşterileri biraz daha sık getirir. Fiyatlar geçici |
| Genel görünümde kamera | **Değişti (Kemal, 14 Ekim):** "360 döndürme ve aşağı yukarı bakma, her yerde". Genel görünümde her an, alışılmış harita düzeniyle (Kemal, 14 Ekim): **tek parmak** kaydırır (açı değişmez, dükkândan uzaklaşamaz); **iki parmak açıp kapama** yakınlaştırır (sınırlı); **iki parmağı çevirmek** dükkânın çevresinde döndürür; **iki parmakla birlikte yukarı aşağı sürüklemek** eğer (alçak bakıştan neredeyse tepeden bakışa). İki parmakta önce belirginleşen hareket, parmaklar kalkana dek tek başına çalışır; birbirine karışmaz. Farede sol tuş kaydırır, sağ tuş döndürür ve eğer, tekerlek yakınlaştırır. Sol alttaki **ortala** düğmesi baştaki görünüme döndürür. Tezgah yakın planı sabit kalır. (13 Ekim'deki "tek parmak kaydırır, açı değişmez" kuralının yerine geçer) |
| Tezgah düzeni | Dar telefon ekranında külah çikolata küvetini kapatıyordu (Kemal, 13 Ekim). Kamera biraz aşağı eğildi, küvetler ekranda yukarı çıktı; külah küvetlerin üstüne, sola alındı |
| Duraklatma menüsü | Sol üstte duraklat düğmesi (Kemal, 13 Ekim). Saat, müşteriler ve sabır durur. Menüde: **Devam et**, **Dükkânı gez**, **ses ayarı** (müzik ve sesler; ses henüz yok, ayar saklanır) |
| Dükkânı gezme | Duraklatınca dükkânın çevresinde **parmakla döndürülür**, yakınlaştırılır; bakılan yöne dönük duvarlar kalkar. 14 Ekim'den beri genel görünümde de döndürülebiliyor; gezmenin farkı duvar ve ışık seçenekleri ile fotoğraf |
| Gezerken duvarlar | Tek düğme sırayla değiştirir (Kemal, 13 Ekim): **Kesit** (bakılan yöne dönük duvarlar kalkar) → **Duvarsız** (hepsi kalkar) → **Kapalı** (bütün duvarlar ve tavan yerinde; dükkâna tümden dışarıdan bakılır) |
| Gezerken gece / gündüz | Dükkânı gezerken bir düğme ışığı sırayla değiştirir: şimdiki saat → gündüz → akşam → gece (Kemal, 13 Ekim). Yalnız görünüş; oyunun saati değişmez |
| Deneme parası | Yalnız adresin sonuna `#deneme` yazılınca, Dükkânı geliştir'de "Deneme parası +5000" düğmesi çıkar; dekorasyonu denemek için (Kemal, 13 Ekim). Oyunun kendisinde yok |
| Fotoğraf | Gezerken **Fotoğraf çek**: o anki görüntü gösterilir; telefonda resme basılı tutarak kaydedilir (Claude önizlemesinde İndir düğmesi çalışmaz, yayın bağlantısında çalışır) |
| Sipariş balonu | Müşterinin başının sağında, aşağı doğru açılır (üstteki ipucuyla çakışmasın; 13 Ekim) |
| İpucu yazısı | Üst sıranın altında, ortada; dili sıcak (Kemal, 13 Ekim: "üst üste gelmiş, çok soğuk") |
| Tepsi | Dükkânı geliştir → Yeni çeşitler'den **Tepsi** (geçici 400) alınınca siparişlerin bazıları **iki dondurma** ya da **iki süsleme** ister. İki dondurmalı siparişte ilk dondurma hazırlanınca **Tepsiye koy**'a basılır, sonra ikincisi hazırlanır, Servis et ikisini birden verir. Balonda iki dondurma yan yana görünür. Sıra kural değil |
| Çalışan | Tezgahın arkasında, genel görünümde görünür (tezgah görünümünde kameranın yerinde olduğu için görünmez). Gün başında **Çalışan** düğmesiyle sağda panel açılır, kamera çalışana yaklaşır: ad, ten (5), saç (kısa, uzun, topuz, kıvırcık; 6 renk), önlük (mor, sarı, krem; parayla çizgili 150, puantiyeli 200), aksesuar (parayla küpe 100, bandana 120, gözlük 160, kasket 180; başa tek şey). Adı genel görünümde başının üstünde yazar. Kepçe dalarken öne eğilir. Fiyatlar geçici; çalışana hikâye yazılmaz |
| Sahibi | Günde bir kez, rastgele bir saatte iskeleden gelir, kapıdan girer, dükkânda ve terasta biraz dolaşıp gider; başka bir şey yapmaz. Görünüşü **geçici** (mor elbise, topuz saç); kanonda görünüşü yok, Kemal belirleyecek |
| Alanlar | (Kemal, 14 Ekim) Dükkânın **iki yanındaki boş alanlar** ve **yol kenarındaki teras** satın alınır; yalnız **dükkânın hizasındaki** teras başta açıktır. Alınan alana eşya konur; yan alan alınınca ahşap zemin döşenir. Dört alan: iki yan, iki yol kenarı. Yerleştirirken kilitli kareler gri görünür |
| Dış süsler | (Kemal, 14 Ekim: "dükkân dışı için tabela benzeri ürünler; dekorasyonda market çok zayıf") Dokuz yeni eşya: bank, çöp kutusu, çiçekli kasa, ayaklı kara tahta, flama direği, sokak lambası, sepetli bisiklet, ışıklı tabela, dev külah. Hepsi **yalnız dışarıya** konur (şemsiyeli masa da). Tabela ve kara tahtada **yazı yok**, yalnız dondurma çizimleri. Bankta iki müşteri oturabilir. Mağazada iki başlık: "Oturma ve çiçek", "Dükkânın dışı için" |
| Çeşitler (14 Ekim) | **29 çeşit**, zamanla açılır (Kemal: "24'ten fazla"; liste Claude'un önerisi, Kemal onayladı). Baştan açık: kaymak, çikolata, çilek, fıstık. Parayla: mango, yaban mersini (dönem için az yaygın ama kalsın, Kemal), limon, vişne, kavun, karpuz, muz, kahve, fındık, karamel, portakal, kayısı, şeftali, hindistan cevizi, nane, böğürtlen. Memnuniyetle **satın alınabilir** olanlar: ortalama **4** yıldızda ahududu, bitter çikolata, tarçın, ballı yoğurt; **4,5**'te karadut, sakızlı, incir; **4,75**'te gül, kestane. Eşik en az 10 müşteriden sonraki en iyi ortalamaya bakar; bir kez açılan kapanmaz |
| Vitrin (14 Ekim) | **4 küvetle başlar**, Dükkânı geliştir'den 6, 8, 10, 12'ye büyür; 6'dan fazlası iki sıra. Gün başında **Vitrin** ekranı: çeşide dokunarak elle seçilir ya da **Otomatik** (her sabah dünün en çok satanları + bir yeni çeşit). Müşteriler **yalnız vitrindekileri** ister. Her küvetin önünde çeşidin adı yazan kart var (arka sırada çubukta); sipariş balonunda da adlar yazar |
| Işıklı tabela | Üstünde dükkânın adı: "Dondurmacı Kızlar" (Kemal, 14 Ekim) |
| Çeşit fiyatları (sonraki parça) | Genel fiyat (ucuz / normal / pahalı) kalır; Fiyat ekranı ayrıntılanır: **her çeşidin kendi fiyat çubuğu** ve hepsini birden ayarlayan çubuk. Pahalı çeşit daha seyrek istenir (Kemal, 14 Ekim). Fiyat ekranında: genel seviye, "Hepsi" çubuğu, "Makul fiyatlara dön", her açık çeşidin çubuğu (5–25), müşterinin ödediği fiyat ve "çok istenir / olağan / az istenir". Makul fiyat: klasik 10, 4 yıldızlılar 12, 4,5'lar 14, 4,75'ler 16. Makulün %20'sinden pahalısı memnuniyeti biraz düşürür (sayılar geçici) |
| Eğitim (14 Ekim) | **Yazısız el işareti**. İlk siparişte üç adım (altlık → küvete basılı tut → servis et); sonra **ilk kez görülenlerde** birer kısa işaret (ilk süslemeli sipariş, ilk tepsi, ilk vitrin seçimi). İlk sipariş boyunca **saat durur, tek müşteri** gelir, sabır azalmaz. Köşede **Geç** düğmesi; Ayarlar'da (şimdilik mola menüsünde) "Eğitimi yeniden göster" |
| Menüler (14 Ekim) | Tam ekran pencere kalır ama **resimli**: kartlarda eşyanın oyundaki modelinden **küçük 3B resmi**, az yazı. Ekran boş grafiklerle harcanmasın (Kemal: "özellikle dekorasyon bölümünde") |
| Satın alınca (14 Ekim) | Eşya alınınca küçük bir ekran çıkar: **Yerleştir** ya da **Alışverişe devam et**. Devam edilirse eşya depoya gider, sonra istenince yerleştirilir |
| Tezgah küvetleri (14 Ekim) | Çok küvette dokunma alanları küçük kalıyordu. Vitrin **yanlara genişler**, tezgah kamerası **biraz dikleşir**; iki sıra kalır, küvetler büyür, düğmeler kenarlara çekilir |
| Oyun hissi (14 Ekim) | Parçacık efektleri **orta, sakin**: mükemmel topta kısa kıvılcım, doğru serviste kasaya uçan birkaç jeton, süslemede serpinti, sıkılan müşteride küçük bulut. Ekran sarsma yok. **Titreşim yok** |
| Yatay sipariş balonu (Kemal, 14 Ekim) | Balon uzayıp küvet etiketlerinin üstüne biniyordu: yatay olur (solda dondurma resmi, sağda adlar ve sabır çubuğu). 5. paketle birlikte |
| Bahşiş (14 Ekim) | Arka arkaya mükemmel servislerde müşteri küçük **bahşiş** bırakır; seri bozulunca ceza yok, sessizce sıfırlanır |
| Yardımcı çalışan (14 Ekim) | Parayla bir **yardımcı çalışan** alınabilecek (ör. masaları toplar, waffle makinesine bakar). **Assetlerden sonra**, makinelerle birlikte tasarlanır |
| Açılış ekranı ve Ayarlar (14 Ekim) | Açılışta arkada dükkânın sakin görünümü, önde **logo**, **Oyna** ve **Ayarlar**. Logo dosyasını **Kemal gönderecek**. Ayarlar: müzik ve ses, eğitimi yeniden göster, baştan başla (onaylı), dil (İngilizce gelince), **ekran ayarları**: küvet etiketlerini ve sipariş balonundaki çeşit adlarını gösterme / gizleme (Kemal, 14 Ekim) |
| Makineler (14 Ekim) | Waffle ve limonata makineleri + yardımcı çalışan **assetlerden sonra** |
| Assetler (14 Ekim) | Önce **ücretsiz paketler** (Kenney, Quaternius; CC0). Claude indirir, yerleştirir, `docs/lisanslar.md`'ye yazar; Kemal'in bir şey yüklemesi gerekmez. **İlk karakterler** değişir (müşteriler, çalışan, sahip; yürüme ve oturma hareketleriyle) |
| Kroki | Kemal paylaştı (14 Ekim, `docs/gorseller/kroki-liman.webp`): dükkân sahil yolunun deniz tarafında, **T biçimli iskelenin karşısındaki küçük kare** (yaklaşık 15–18 m). Krokide dükkânla deniz arasında kum var; oyunda **şimdiki ahşap teras kalır** (Kemal: "şimdiki kalsın"). Bugünkü düzen zaten yakın |
| Logo | Kemal gönderdi (14 Ekim): `public/gorseller/logo-kulahli.webp` (külahlı) ve `logo-yazi.webp` (yalnız yazı). Yazı kırmızı-krem, logonun asıl zemini **mor ve sarı**: oyunun renkleri **mor-sarı kalır**. Kullanılacak yerler: **açılış ekranı, ışıklı tabela, dükkânın ön cephesi (tentenin üstü), menü başlıkları**; yerine göre külahlı ya da yalnız yazı |
| Büyüme (14 Ekim) | Soru turuyla planlandı: aşağıda **bölüm 0.1**. Bugünkü "Alanlar" satın alması bu planla değişecek. **Assetlerden sonra** yapılır |
| Arayüz sıkışık (Kemal, 14 Ekim, telefon görüntüleriyle) | "Düğmeler inanılmaz büyük, çok fazla yer kaplıyor. Menü sistemi yok, her şey ortada." Düğmeler küçülecek; gün başı düğmeleri (Dükkânı geliştir, Vitrin, Yerleştir, Çalışan) tek bir menü düzeninde toplanacak; tezgahta altlık, süsleme, Geri al, Servis et daha az yer kaplayacak. 4. maddeyle (resimli menüler) birlikte ele alınır |
| Etiket boyu (Kemal, 14 Ekim) | Küvetlerdeki ad kartları ve sipariş balonundaki çeşit adları "inanılmaz büyük": küçülecek. Ayarlar'daki ekran ayarlarından ikisi de kapatılabilecek |
| Kış paketi (Kemal, 14 Ekim) | Aciliyeti yok: oyun hazır olduğunda, dönemi gelince yapılır |
| İş sırası (14 Ekim) | 1. Eğitim → 2. Tezgah küvetleri (vitrin yanlara, kamera dik) → 3. Çeşit başına fiyat ekranı → 3b. Etiketleri küçült → 4. Menü sistemi + küçük düğmeler + resimli menüler + "Yerleştir / devam et" ekranı → 5. Efektler + bahşiş + yatay balon → 6. Açılış ekranı + Ayarlar (logo gelince) → 7. Assetler (önce karakterler) → 8. Makineler + yardımcı çalışan → 9. Büyüme yapısı |
| Masalarda oturan müşteriler | (Kemal, 14 Ekim: "misafirler arada varsa masalara otursun") Dondurmasını alıp mutlu giden müşterilerin bir kısmı boş bir masa varsa oturup yer, sonra iskeleden gider. Tezgahın arkasındaki köşelere konan masalara oturulmaz |
| Sonraki iş sırası (14 Ekim) | 1. Alanlar + masalarda oturan müşteriler → 2. Dükkân dışı için tabela benzeri yeni dekorasyon ürünleri (market zayıf kaldı) → 3. Çok çeşit dondurma (Türkiye'de 20 çeşit olağan): çeşitler zamanla açılır, vitrine sınırlı küvet sığar, **her sabah vitrine hangi çeşitlerin gireceği seçilir** (önerildi, onay bekliyor) → 4. **Kış paketi:** dükkân tatlıcı / kafe olur, kışın yalnız **sıcak çikolata** istenir; makyaj paketi olarak satılabilir |
| Topların sırası | Kural değil: yalnız altlık, çeşitler ve top sayısı tutmalı (13 Ekim) |
| Deneme telefonu | Elde hangisi varsa; orta seviye bir telefonda akıcı çalışmak hedef |

---

## 0.1 Büyüme planı (Kemal, 14 Ekim soru turu)

*Uygulamada henüz yok.* İş sırasında assetlerden sonra (madde 9). Sayılar sonra ayarlanır.

**Arazi**
- Dükkânın sağı, solu ve arkası **eşit dilimlere** (~4 m) bölünür; her dilim ayrı alınır.
- **Üst sınır yok:** krokideki dükkân sınır değil; sağa sola boş arazi oldukça büyüme sürer.
- Oyun **bugünkü boyutla** başlar. Dekorasyon yalnız dükkânın önündeki hizaya konur; yeni yerler satın alınır.
- **Yürüyüş yolu deniz tarafına alınır**, böylece her dilimin önü büyür. Bir dilim alınınca önü de oyuncunun olur. Yalnız alınmış dilimlerin önü kullanılır.
- Fiyat **her alımda artar** ve **yere göre** değişir: ön ve iskele tarafı pahalı, arka ucuz.

**Aşamalar (her biri ayrı ödeme)**
1. **Dilimi al.** Önce açık alan olur, masa ve dekorasyon konur.
2. **Duvar ör.** Dilim kapalı alana katılır. Şimdilik **anında** olur. Oyun çıkınca bir süre konur ve hızlandırma için ödeme yapılabilir (Kemal).
   - Pencere ve kapı kendiliğinden gelir (önde cam vitrin), sonradan değiştirilebilir.
   - Kapalı alan **ücret ödenerek** tekrar açık alana çevrilebilir.
3. **Mutfak (arka dilimler).** Duvarla kapatılan arka dilim, bir ödeme daha ile mutfağa katılır.
   - Mutfak önce **yalnız alan** verir, sonra alınanlar eklenir: makineler, yardımcı çalışanın yeri, depo (vitrinden ayrı, daha çok çeşit stokta).

**Kapalı alan ne işe yarar**
- İç masalar. Kışın, paket gelince yalnız içerideki masalar kullanılır.
- Makine yeri: waffle ve limonata makineleri.
- Daha uzun sıra, yani daha çok müşteri.
- İç dekorasyon: duvar süsleri, raflar, lambalar.

**Tezgah**
- Tezgah da dekorasyon gibi **modüler parçalarla** kurulur: düz, köşe, vitrinli, süsleme, makine.
- Parçalar alınıp kapalı alanda kareye konur. Kemal'in hayali: arka duvardan gelen, **önü açık U biçimi** bir dükkân.
- Tezgah uzayınca gelenler:
  - daha büyük vitrin (12'den fazla küvet olabilir),
  - **ikinci servis noktası,**
  - ayrı süsleme ya da makine tezgahı.

**İstasyonlar**
- Tezgah yakın planı **istasyonlara** bölünür: vitrin, süsleme, makine…
- **Sabah oyuncu bir istasyon seçer**, o gün onu oynar.
- Yardımcı çalışan yokken öteki istasyonlar **kapalı** kalır. Yardımcılar alındıkça açılır ve **yeteneklerine göre** o istasyonlarda çalışır.

**Ekran**
- Gün başında **İnşaat modu**: dükkâna üstten bakılır, dilimler renkli görünür.
- Dilime dokununca seçenekler ve fiyat çıkar: Al / Duvar ör / Mutfağa kat / Tezgah parçası koy.

### 0.2 Büyüme soru turu 2 (Kemal, 14 Ekim akşam)

0.1'i şu cevaplar netleştirir; çelişirse **bunlar geçerli**.

| Konu | Karar |
|---|---|
| Ön teras | Yol deniz tarafına kayar. **Ön teras da satın alınır**: başta yalnız dükkânın içi ve kapının önü açık |
| Arazi biçimi | **Kare kare** (~4×4 m). Her kare ayrı alınır |
| Alma sırası | Yalnız sahip olunan yere **komşu** kare alınır; arada boşluk kalmaz |
| Kamera | Dükkân büyüdükçe genel görünüm **kendiliğinden geri çekilir**; yakınlaştırma yine oyuncuda |
| İnşaat modu | **Yalnız gün başında** (müşteri yokken) |
| Renkler | Trafik ışığı: alınmış **yeşil**, alınabilir **sarı**, alınamaz **gri** |
| Duvar örülünce | İçeriye uymayan dış eşyalar **depoya döner**; içe uyanlar yerinde kalır |
| Kapı | Bugünkü kapı yerinde kalır. Ön duvar yeterince uzayınca (ör. 3 kare) **ikinci kapı** alınabilir; müşteri yakın olandan girer |
| Fiyat ölçüsü | **Bugünkü gibi**: ilk kare ~150–250, her alımda biraz artar; ön / iskele tarafı pahalı, arka ucuz |
| Duvarı yıkmak | **Ücretli**, duvara ödenen para geri gelmez |
| Eski "Alanlar" | Eski alınan yerin üstüne düşen kareler oyuncunun olur, eşyalar yerinde kalır |
| Boş mutfak | Fayans zemin, boş; makine ve depo geldikçe dolar |
| Uzun sıra | **Duvarla birlikte**: her kapalı kare sıraya yer ekler |
| İç masalar | Müşteriler dış masalar gibi iç masalara da oturur |
| İş sırası | 1) Kareler + yol denize + İnşaat modu + Al → 2) Duvar ör / yık + uzun sıra + ikinci kapı → 3) Mutfağa kat → sonra 3b (tezgah parçaları, istasyonlar, makineler, yardımcı). Her adım ayrı PR |

### 0.3 Ölçü ve tezgah bölümü (Kemal, 14 Ekim gece soru turu)

0.1 ve 0.2'yi şu kararlar netleştirir; çelişirse **bunlar geçerli**.

| Konu | Karar |
|---|---|
| Ölçü birimi | **Her şey 1×1 m'lik birimle.** Küsurat yok (Kemal: "küsurat istemiyorum") |
| Arazi karesi | **4×4 m**, içi **16 adet 1×1 m** eşya yeri (Kemal kararı Claude'a bıraktı: 4×4 bugünkü dükkâna ve alınmış karelere tam oturuyor) |
| Dükkân | **8×4 m** (2 kare). Önde 1 m müşteri sırası, arkada 8×3 m tezgah bölümü. Arka duvar 4,45'ten 4 m'ye gelir |
| Ön teras | 4 m (1 kare sırası) |
| Zemin | Dışarısı (teras ve alınan açık kareler) **1 m genişlikte, aynı hizada ahşap tahta**; yan yana kareler tek zemin gibi. İçerisi başka (koyu ahşap) |
| Eşya boyu | **Boyuna göre:** küçükler 1×1 (saksı, çöp kutusu, flama, sokak lambası, kara tahta, ışıklı tabela, külah figürü); bank, bisiklet, çiçekli kasa 2×1; sandalyeli masa ve şemsiyeli masa 2×2. Yerleştirirken **çevir** düğmesi |
| Tezgah bölümü | Bugün kullanılan çalışma alanı (vitrinli tezgah, arka tezgah, çalışanın yeri; 8×3 m) **tek parça**. Önünde hep 1 m müşteri sırası kalır, önü hep denize dönük |
| Taşıma | **İnşaat modunda, ücretsiz**; kapalı alanda her yere, 1 m adımlarla (ileri, geri, sağa, sola). Tezgah yakın planı ve müşteri sırası onunla birlikte gider. Altında kalan eşyalar depoya döner |
| Boy | İnşaat'ta **1 m adımlarla uzatılır / kısaltılır, 4–16 m**. Her yeni metre ücretli (80, geçici), kısaltmak bedava; bir kez alınan metre tekrar uzatınca yeniden ödenmez |
| 3b ile ilişki | Tek parça kalabilir; ileride gelecek modüler tezgah parçaları (köşe, süsleme, makine…) yanına eklenebilecek biçimde |
| Ne zaman | **Bu adımda.** Bugünkü 8×4 dükkânda yer yok; kısaltınca yana kayabilir, duvar adımıyla kapalı alan büyüyünce her yöne taşınır |

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
3. **Yerleştirme:** Parmak kalkınca top kendiliğinden külaha / kaba iner; ikinci dokunuş yok (iPhone denemesi, Kemal 13 Ekim).
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
| Birinci şahısta eller | **Karar verildi** (14 Ekim): eller yok | — |
| Para modeli | Kısmen karar verildi (14 Ekim): makyaj paketleri satılabilir | Ayrıntılar sonra |
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
| Alan fiyatları | Yan alanlar 250, yol kenarları 400. 14 Ekim'den önce kurulmuş bir dükkânda eşya duran alan kendiliğinden açık sayılır | Geçici |
| Dış süs fiyatları | Bank 140, çöp kutusu 50, çiçekli kasa 80, kara tahta 90, flama 110, sokak lambası 160, bisiklet 180, ışıklı tabela 260, dev külah 380. Her biri öteki eşyalar gibi müşteri sıklığını biraz artırır | Geçici |
| Çeşit ve vitrin fiyatları | Çeşitler 100–600 (özel olanlar pahalı); vitrin büyütme 6 küvet 300, 8 küvet 600, 10 küvet 1000, 12 küvet 1500. 14 Ekim'den önce kurulmuş dükkânda vitrin, açık çeşit sayısı kadar büyük başlar | Geçici |
| Masada oturma | Mutlu giden müşterinin %60'ı, boş sandalye varsa 10–16 sn oturur | Geçici oran |
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
| Tepsi, iki dondurmalı sipariş | Bitti (13 Ekim) |
| Kişiselleştirilebilir çalışan | Bitti (13 Ekim) |
| Dolaşan sahip | Bitti; görünüşü geçici (13 Ekim) |
| Ses ve geçici müzik | Bitti; müzik Kemal'inkiyle değişecek (13 Ekim) |
| Alanlar + masalarda oturan müşteriler | Bitti (14 Ekim) |
| Dış süsler (9 eşya) | Bitti (14 Ekim) |
| 29 çeşit, vitrin (4–12) ve günlük seçim, tabelada ad | Bitti (14 Ekim); çeşit başına fiyat sonraki parça |
| Yazısız eğitim (ilk sipariş + süsleme, tepsi, vitrin) | Bitti (14 Ekim). "Eğitimi yeniden göster" Ayarlar gelene kadar mola menüsünde |
| Çeşit başına fiyat ekranı | Bitti (14 Ekim) |
| Müşteriler Kenney karakterleri (varyasyonlu) | Bitti (14 Ekim). Kemal: "tek tip 12 karakteri beğenmedim… kıyafetleri, saç, aksesuar değişsin; her gün aynı karakterlere neden hizmet versin". Her müşteride baş (11) ve gövde (12) ayrı seçilir; ten, saç, üst, alt, ayakkabı renkleri; aksesuar (hasır şapka, gözlük, güneş gözlüğü). Yürüme / bekleme / oturma modelin kendi hareketleri. Çalışan ve sahip henüz eski hâlinde (Kemal'in kararı bekleniyor) |
| Bütün karakterler aynı parçalardan (**taslak**) | Bitti (14 Ekim). Kemal: "Tüm karakterler aynı assetlerden üretilsin bir fark olmasın. Bunu şimdilik taslak olarak kabul edeceğim, daha sonra revize ederiz, pek beğenmedim". Çalışan ve sahip de müşterilerle aynı Kenney parçalarından. Çalışan ekranındaki seçimler sürer: saç biçimi → baş modeli, ten ve saç rengi, önlük gövdenin üstünde, aksesuarlar (gözlük, güneş gözlüğü, hasır şapka, kasket, bandana, küpe). Sahip geçici: mor kıyafet, topuz, küpe. **Hepsi taslak; Kemal sonra yeniden ele alacak** |
| Büyüme 1. adım: kareler + İnşaat modu | Bitti (14 Ekim). Arazi 4×4 m karelere bölündü (yana 10'ar sütun, arkaya 2 sıra; sınır şimdilik bu). Başta dükkânın içi ve kapının önü. Gün başı menüsünde **İnşaat**: kamera önden ve üstten bakar, kareler yeşil / sarı / gri; kareye dokununca yeri ve fiyatı, sarıysa "Al". Fiyat ön teras 250, dükkân sırası 200, arka 150; iskele tarafı %15 pahalı; her alımda %20 artar (geçici sayılar). Alınan yan / arka kareye ahşap zemin döşenir, Yerleştir'de kareleri açılır. Yürüyüş yolu deniz tarafına alındı (taş yol); kapının önü müşteri yolu olarak boş kalır. Arazi büyüdükçe genel görünüm geri çekilir. Eski "Alanlar" Geliştir'den kalktı; eski kayıtlarda alınan alanlar ve eşyaların durduğu yerler karelere taşınır |
| Ölçü düzeni + tezgah bölümü (0.3) | Bitti (14 Ekim gece). Her şey 1 m'lik birimle: 4×4 m kare, içi 16 eşya yeri. Dükkân 8×4 m (arka duvar 0,45 m öne geldi; tezgah bölümü ve içindekiler 0,4 m öne alındı). Terasın ve alınan karelerin tahtaları 1 m, tam metrelerde, aynı hizada. Eşyalar boyuna göre 1×1 / 2×1 / 2×2, Yerleştir'de "Çevir". Tezgah bölümü İnşaat'ta seçilir (mor): ok tuşlarıyla 1 m taşınır, 4–16 m uzar / kısalır (her yeni metre 80, geçici); yakın plan, çalışan, hazırlama ve müşteri sırası onunla gider; altında kalan eşya depoya döner. Bugünkü 8×4 dükkânda yalnız kısaltıp yana kaydırmak mümkün; asıl taşıma duvar adımıyla açılır |
| Açılış ekranı + Ayarlar | Bitti (14 Ekim). Ses, ekran (etiketler), eğitimi yeniden göster, dil (İngilizce gelince), baştan başla Ayarlar'da; mola menüsünde yalnız Devam et, Dükkânı gez, Ayarlar |
| Efektler (kıvılcım, serpinti, sıkılan müşteride bulut, kasaya uçan jeton) + bahşiş + yatay balon | Bitti (14 Ekim). Bahşiş: arka arkaya 3. mükemmel servisten başlar (+2, +4… en çok +10), gün sonunda ayrı satır. Uçan jetonlar test ortamında görüntülenemedi; telefonda bakılacak |
| Küçük düğmeler, gün başı menü şeridi, küçük etiketler + ekran ayarı (mola menüsünde), resimli eşya kartları, "Şimdi yerleştir / Alışverişe devam et" | Bitti (14 Ekim). Eşya resimleri `public/gorseller/esyalar/`; yeni eşya eklenince adresin sonuna `#onizleme=<eşya>` yazılıp çekilir |
| Tezgah küvetleri büyüdü (iki sırada vitrin yanlara, kamera dik) + logo (tabela, arka duvar, ön cephe, pencere başlıkları) | Bitti (14 Ekim) |

Uygulamada **olmayan** ama belgede geçenler: Kemal'in müziği (şimdilik kodla geçici ezgi), gerçek 3B modeller (hepsi kodla çizilmiş geçici parçalar), İngilizce.
