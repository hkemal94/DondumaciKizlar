# Dondurmacı Kızlar · Yol haritası

Son güncelleme: **15 Ekim 2026**. Bu dosya her PR'da güncellenir. KKM →
Oyun → Dondurmacı Kızlar → **Yol haritası** sekmesi onu buradan canlı okur.
Kararların ayrıntısı `docs/tasarim-belgesi.md`'de (son turlar: bölüm 0.12);
bu sayfa yalnız nerede olduğumuzu ve sırayı gösterir. Sıralamayı Claude
yapar; Kemal "şimdi" demedikçe işler bu sırayla gider.

## Neredeyiz

| | |
|---|---|
| Aşama | Oynanabilir sürüm, büyüme, karakterler, liman ve kişiselleştirme bitti. Sırada görsel kalite |
| Son biten | Giriş ekranında ince düğmeler (bu PR) |
| Şu an | Hataların denetimi; sıradaki soruları Kemal'e tek tek sor (belge 0.13.2 son satır) |
| Sıradaki | 9d: içecekler (tek istasyon; seçilen dolap, makine ve bardaklarla); sonra hesap ve bulut kayıt (ayrı Firebase projesi) |
| Yayın | Deneme sürümü webde; tarih yok, acele yok |

## Sıra (15 Ekim, belge 0.12)

| # | İş | İçerik | Durum |
|---|---|---|---|
| 0 | Toparlama | Belge, CLAUDE.md ve yol haritası güncel kararlarla; `#deneme`, `#hizli` kalktı | Bitti ([#34](https://github.com/hkemal94/DondumaciKizlar/pull/34)) |
| 1 | Hatalar ve düzen | Mutfak İnşaat'tan kurulunca dolaplar doğru yönde; büyük vitrin camı; müşteri gelince açılıp kapanan kapı + zil; araya giren ev yarı saydam; menü dört grup (Dükkân / Ekip / Ürünler / Mağaza) | Bitti ([#35](https://github.com/hkemal94/DondumaciKizlar/pull/35)) |
| 2 | Dış dünya | Ege evleri (önce paket adayları, Kemal seçer), taş sokaklar, bahçeler, zeytin / çam / begonvil, kum yalnız sahilde; deniz ve kumsal açılış konsept görseli gibi (dalga, köpük, kaya); boşluklar dolar | Bitti ([#36](https://github.com/hkemal94/DondumaciKizlar/pull/36)) |
| 3 | Liman canlılığı | Yürüyüş yolu sise kadar, iki yanı ışıklı; sokak lambaları, arabalar, yayalar, martı ve kediler, tekne çeşitleri; ortam sesi; eğik mahalle sokakları ve sis; Ayarlar'da grafik kalitesi | Bitti ([#37](https://github.com/hkemal94/DondumaciKizlar/pull/37)) |
| 4 | Karakterler | Gülümseme, bedene oturan önlük + dükkân üniforması, el sallama ve mutlu / mutsuz ayrılış, kıyafet seçimi, saçları başlardan ayırma denemesi | Bitti ([#38](https://github.com/hkemal94/DondumaciKizlar/pull/38)) |
| 5 | Açılış ve galeri | Arkada kendi dükkânın gün batımında, galeri, ayda bir otomatik dükkân fotoğrafı | Bitti ([#39](https://github.com/hkemal94/DondumaciKizlar/pull/39)) |
| 6 | İngilizce | Bütün yazılar İngilizce; Ayarlar'da dil seçimi | Bitti ([#40](https://github.com/hkemal94/DondumaciKizlar/pull/40)) |
| 7 | Ayar paneli | Bütün sayılar oyunda tek ayar dosyasında; KKM'de "Ayarlar" sekmesi (KKM deposunda ayrı PR) | Bitti ([#41](https://github.com/hkemal94/DondumaciKizlar/pull/41), KKM [#94](https://github.com/hkemal94/Kems-Company/pull/94)). Yazma yolu: GitHub anahtarı (Kemal, 15 Ekim) |
| 8 | Exp sistemi | Ana seviye + dükkân ve çalışan seviyeleri; günlük hedefler; yıldızlar yorum gibi; sıra bazen uzun bazen boş; otomatik kamera ayarı; eşyalara konfor ve çekicilik | Soru turu bitti (15 Ekim). 8a exp + seviyeler + kilitler: bitti ([#42](https://github.com/hkemal94/DondumaciKizlar/pull/42)). 8b yetenekler: bitti ([#43](https://github.com/hkemal94/DondumaciKizlar/pull/43)). 8c günlük hedefler, yorumlar, sıra, otomatik kamera: bitti ([#44](https://github.com/hkemal94/DondumaciKizlar/pull/44)). Eşya konfor / çekicilik 10. maddeye kaldı |
| 9 | İçecekler ve stok | Soru turu bitti (15 Ekim akşam, belge 0.13). 9a ince arayüz, sağda açılan menüler, yol çizgileri ve lambalar: bitti ([#46](https://github.com/hkemal94/DondumaciKizlar/pull/46)). 9b vitrin ve bar model adayları: bitti ([#47](https://github.com/hkemal94/DondumaciKizlar/pull/47)), Kemal seçti. 9c gerçekçi vitrin + hafif stok: bitti ([#49](https://github.com/hkemal94/DondumaciKizlar/pull/49)) → 9d içecekler (tek istasyon; limonata / ayran / buzlu çay → milkshake / frappe → Türk kahvesi, buzlu kahve, espresso → taze sıkma) | |
| 10 | Sonra | Kayan yazıda müşteri yorumları (cümleler Kemal'in), eşya renkleri ve yumuşak yıpranma, gedikli müşteriler, hava durumu, duvar deseni, seyyar dondurma arabası, festival / bayramlar, yeni süslemeler, mevsim | |

## Paketler (eski adlarla)

| Paket | İçerik | Durum |
|---|---|---|
| A | Test kolaylıkları ve ekran | Bitti ([#26](https://github.com/hkemal94/DondumaciKizlar/pull/26), [#27](https://github.com/hkemal94/DondumaciKizlar/pull/27)) |
| D | Karakterler | Bitti ([#28](https://github.com/hkemal94/DondumaciKizlar/pull/28)) |
| KKM | KKM'deki oyun sayfasında bu yol haritası | Kodu bitti ([#29](https://github.com/hkemal94/DondumaciKizlar/pull/29), KKM [#92](https://github.com/hkemal94/Kems-Company/pull/92)). Görünmüyorsa AI Studio GitHub'dan eşitlenmeli |
| B | Liman haritası | Bitti ([#30](https://github.com/hkemal94/DondumaciKizlar/pull/30)); güzelleştirmesi sıranın 2–3. adımında |
| C | Kişiselleştirme (belge 0.11) | Bitti ([#31](https://github.com/hkemal94/DondumaciKizlar/pull/31), [#32](https://github.com/hkemal94/DondumaciKizlar/pull/32), [#33](https://github.com/hkemal94/DondumaciKizlar/pull/33)) |
| E | Hesap ve bulut kayıt (Google ile) | Yayına yakın |

## Bitenler

- Oynanabilir sürüm: kepçe mini oyunu, müşteri sırası, gün ve saat, iki kamera, dekorasyon, mola menüsü, ses, tepsi, çalışan, sahip · [#1](https://github.com/hkemal94/DondumaciKizlar/pull/1), [#2](https://github.com/hkemal94/DondumaciKizlar/pull/2)
- Satın alınan alanlar, masaya oturan müşteriler, dış süs eşyaları · [#3](https://github.com/hkemal94/DondumaciKizlar/pull/3), [#4](https://github.com/hkemal94/DondumaciKizlar/pull/4)
- 29 çeşit, büyüyen vitrin, fiyat ekranı · [#5](https://github.com/hkemal94/DondumaciKizlar/pull/5), [#8](https://github.com/hkemal94/DondumaciKizlar/pull/8)
- Yazısız eğitim, büyük küvetler, logo · [#6](https://github.com/hkemal94/DondumaciKizlar/pull/6), [#7](https://github.com/hkemal94/DondumaciKizlar/pull/7)
- Ekran düzeni, resimli mağaza, efektler, bahşiş, açılış ekranı, Ayarlar · [#9](https://github.com/hkemal94/DondumaciKizlar/pull/9), [#10](https://github.com/hkemal94/DondumaciKizlar/pull/10), [#11](https://github.com/hkemal94/DondumaciKizlar/pull/11)
- Kamera: döndürme, eğme, harita düzeninde parmak ve fare · [#14](https://github.com/hkemal94/DondumaciKizlar/pull/14), [#15](https://github.com/hkemal94/DondumaciKizlar/pull/15), [#16](https://github.com/hkemal94/DondumaciKizlar/pull/16)
- Büyüme: kare kare arazi, İnşaat, 1 m ölçü, taşınabilir tezgah, duvar ve pencere, mutfak, istasyonlar, waffle, içecek standı, yardımcı · [#17](https://github.com/hkemal94/DondumaciKizlar/pull/17)–[#22](https://github.com/hkemal94/DondumaciKizlar/pull/22)
- Tasarım dili: palet, ışık, ölçü; tekneler, mutfak deposu, dekorasyon eşyaları hazır paketlerden · [#23](https://github.com/hkemal94/DondumaciKizlar/pull/23), [#24](https://github.com/hkemal94/DondumaciKizlar/pull/24), [#25](https://github.com/hkemal94/DondumaciKizlar/pull/25)
- A paketi ve haber şeridi · [#26](https://github.com/hkemal94/DondumaciKizlar/pull/26), [#27](https://github.com/hkemal94/DondumaciKizlar/pull/27)
- Liman haritası: kumsal, T iskele, mendirek, liman yapıları, mahalle · [#30](https://github.com/hkemal94/DondumaciKizlar/pull/30)
- Görünüş sekmesi: dış boya, iç duvar, çerçeve, tente, iç zemin; satın almadan önce deneme · [#31](https://github.com/hkemal94/DondumaciKizlar/pull/31)
- Çatı: düz dam, teras + korkuluk, kiremit, ahşap + pergola · [#32](https://github.com/hkemal94/DondumaciKizlar/pull/32)
- Tabelalar: çatı tabelası, direk tabela, pencerede neon, iskele kemeri; akşam yanar · [#33](https://github.com/hkemal94/DondumaciKizlar/pull/33)
- Halı ve tablo: paspas, yuvarlak halı, kilim, üç tablo, boş çerçeve; tablolar duvara asılır · [#33](https://github.com/hkemal94/DondumaciKizlar/pull/33)
- Düzeltme: sonradan duvarla kapatılan karelerde dışarının ahşap tahtası iç zemini (seçilen zemin, mutfak fayansı) örtüyordu · [#33](https://github.com/hkemal94/DondumaciKizlar/pull/33)
- Karakterler (eski Kenney karakterleri [#12](https://github.com/hkemal94/DondumaciKizlar/pull/12), [#13](https://github.com/hkemal94/DondumaciKizlar/pull/13) yerine) · [#28](https://github.com/hkemal94/DondumaciKizlar/pull/28)
- Toparlama: belge ve CLAUDE.md güncel kararlarla düzenlendi, açık sorular yeniden yazıldı, eski deneme araçları (`#deneme`, `#hizli`) kalktı · [#34](https://github.com/hkemal94/DondumaciKizlar/pull/34)
- Hatalar ve düzen: mutfak dolapları doğru yönde, büyük vitrin camı, yaklaşınca açılan kapı ve zil, araya giren bina yarı saydam, dört gruplu menü · [#35](https://github.com/hkemal94/DondumaciKizlar/pull/35)
- Dış dünya: Ege evleri (Quaternius + Kenney, Kemal seçti), taş sokaklar, bahçeler, zeytin / çam / begonvil; dalgalı deniz ve köpük; plajda şezlong, şemsiye, sandal, kaya · [#36](https://github.com/hkemal94/DondumaciKizlar/pull/36)
- Liman canlılığı: sise kadar uzanan fenerli yürüyüş yolu, arabalar, gezenler, martılar, kediler, yeni tekneler, martı sesi, eğik sokaklar ve kiremit damlar, Ayarlar'da grafik kalitesi · [#37](https://github.com/hkemal94/DondumaciKizlar/pull/37)
- Karakterler: gülümseme, bedene oturan önlük, dükkân üniforması (yardımcılar da giyer), kıyafet seçimi, saçlar başlardan ayrı; el sallama, memnun / memnun olmayan ayrılış · [#38](https://github.com/hkemal94/DondumaciKizlar/pull/38)
- Açılış ve galeri: açılışta kendi dükkânın gün batımında, dönen kamera; Galeri (Fotoğraflarım / Albüm), gezerken çekilen fotoğraflar birikir, ayda bir dükkânın fotoğrafı kendiliğinden albüme girer · [#39](https://github.com/hkemal94/DondumaciKizlar/pull/39)
- İngilizce: bütün yazılar İngilizce, Ayarlar'da Türkçe / English; telefonun diline göre açılır · [#40](https://github.com/hkemal94/DondumaciKizlar/pull/40)
- Ayar dosyası: bütün fiyat, süre ve oranlar (197 ayar) tek dosyada, Türkçe adlarıyla · [#41](https://github.com/hkemal94/DondumaciKizlar/pull/41), KKM [#94](https://github.com/hkemal94/Kems-Company/pull/94)
- Exp ve seviyeler (8a): ana, dükkân ve çalışan seviyesi; dükkân seviyesi kilitleri; seviye rozeti, parlama, gün sonunda "YENİ!" · [#42](https://github.com/hkemal94/DondumaciKizlar/pull/42)
- Yetenekler (8b): Usta kepçe, Hızlı eller, Sohbet, Güler yüz; çalışan seviyesinden puan, üç basamaklı ağaç · [#43](https://github.com/hkemal94/DondumaciKizlar/pull/43)
- Günlük hedefler, yorumlar, sıra dalgası, otomatik kamera ayarı (8c) · [#44](https://github.com/hkemal94/DondumaciKizlar/pull/44)
- Hatalar: içecek / waffle istasyonundayken gün bitmiyordu; buzdolabı arkadan taşıyordu; İnşaat'ta tezgah / mutfak taşıma ipuçları; deneme dükkânı yeniden yerleşti · [#45](https://github.com/hkemal94/DondumaciKizlar/pull/45)
- İnce arayüz (9a): ince kenar, yumuşak gölge, küçük yazı; menüler sağdan açılır; arka yolda çizgiler, yaya geçitleri, bordür, eski tip sokak lambaları · [#46](https://github.com/hkemal94/DondumaciKizlar/pull/46)
- Hatalar (15 Ekim akşam): mola menüsünde Çıkış (giriş ekranına döner) ve Tam ekran; buzdolabı duvardan taşmıyor; tente aşağı eğik, tabelayı kesmiyor; dükkânın arkasındaki ilk sıra alçak evler; yardımcı adayları hazır adla; saçlar gerçekte olanlarla (kadın 2, erkek 4); önlük "Yok"; İnşaat'ta "Ne yapmak istersin?" menüsü (tezgahı taşı, pencere ve kapı, duvarlar arasında oklarla gezme) · [#47](https://github.com/hkemal94/DondumaciKizlar/pull/47)
- Vitrin ve bar model adayları (9b): `docs/gorseller/vitrin-bar-adaylari/` · [#47](https://github.com/hkemal94/DondumaciKizlar/pull/47)
- Mola menüsünde tek Çıkış: kaydedip giriş ekranına döner (Kemal: "ana sayfa gibi düşün") · [#48](https://github.com/hkemal94/DondumaciKizlar/pull/48)
- Gerçekçi dondurma vitrini ve hafif stok (9c): paslanmaz küvetler, kavisli cam; dondurma stokla alçalır; biten istenmez, hepsi biterse erken kapanış; gün sonunda ve Ürünler → Stok'ta "Hepsini doldur" ya da kalem kalem · [#49](https://github.com/hkemal94/DondumaciKizlar/pull/49)
- Hatalar (15 Ekim gece): tezgahta hedefler, gün sonunda çarpı, iki sıra küvet dokunuşu, gözlük ve küpe, 2 m ortalı ön tabela, iki dondurmalı balon, mesaiden sonra ilerleyen saat, eşit süsleme düğmeleri, tablolar taşınır, "İpucunu geç", "günlük ücret" · [#50](https://github.com/hkemal94/DondumaciKizlar/pull/50)
- Fazla mesai ücreti: kapanıştan sonra her saat için yardımcılara ek; gün sonunda ayrı satır · [#51](https://github.com/hkemal94/DondumaciKizlar/pull/51)
- İş kısmına ışık: tezgahın üstünde sarkan zayıf lambalar; mağazada duvar lambası (mutfak duvarına da asılır) · [#52](https://github.com/hkemal94/DondumaciKizlar/pull/52)
- Soru turu 0.14: mutfağa yalnız mutfak eşyası ve fayans zemin; Dükkân → Arka tezgah ile ürün seçme; giriş ekranında künye, oyuncu kartı, Yenilikler, canlı liman; iki cihaz için kayıt kodu; model hazırlama rehberi · [#53](https://github.com/hkemal94/DondumaciKizlar/pull/53)
- Yerel eşyalar arka tezgahta (çay bardakları, Türk kahvesi fincanları, cezve, çaydanlık, su ısıtıcısı); künyeye "Düzada evreninden bir oyun" · [#54](https://github.com/hkemal94/DondumaciKizlar/pull/54)
- Yerel eşya düzeltmeleri: dar ağızlı çay bardağı, sapı bağlı cezve, kulplu çaydanlık · [#55](https://github.com/hkemal94/DondumaciKizlar/pull/55)
- Giriş ekranı düğmeleri ince ve yana uzun · bu PR

## Bilinen eksikler

- Telefonda akıcılık gerçek telefonda ölçülmedi; takılırsa Ayarlar → Grafik → Düşük
- Bugünkü başlangıç dükkânının içi tezgahla dolu; halı için önce büyütmek gerekiyor
- Çocuk müşteri yok (seçilen pakette çocuk yok)
- Saç çeşidi az: pakette kadın için 2, erkek için 4 saç var; daha çoğu yeni model ister
- Tam ekran iPhone Safari'de yok (tarayıcı izin vermiyor; düğme orada görünmez). Gün ortasında Çıkış'a basılınca o günün sırası ve saati saklanmaz

## Yayından önce

- 10.000 jeton kalkar (`GELISTIRME_JETONU` 0 olur)
- Deneme dükkânı düğmesi kalkar
- Hesap ve bulut kayıt (E, Google ile giriş)
- Mağaza ve bilgisayar paketi (sonra)

## Kemal'in kararını bekleyenler

- Oyunun adı
- Mevsim / kış dönemi ne zaman
- Para modelinin ayrıntıları (makyaj paketleri satılabilir; gerisi açık)
- Çalışanın, sahibin ve mekânların adları; müşteri yorum cümleleri; festival adları
- Boş çerçeve resimleri (Kemal gönderecek)
