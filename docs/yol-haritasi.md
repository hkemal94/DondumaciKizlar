# Dondurmacı Kızlar · Yol haritası

Son güncelleme: **14 Ekim 2026, gece**. Bu dosya her PR'da güncellenir. KKM →
Oyun → Dondurmacı Kızlar → **Yol haritası** sekmesi onu buradan canlı okur.
Kararların ayrıntısı `docs/tasarim-belgesi.md`'de; bu sayfa yalnız nerede
olduğumuzu ve sırayı gösterir. Sıralamayı Claude yapar; Kemal "şimdi"
demedikçe işler bu sırayla gider (belge 0.8).

## Neredeyiz

| | |
|---|---|
| Aşama | İlk oynanabilir sürüm bitti (iş sırası 1–5). Büyüme ve görünüş paketleri sürüyor |
| Son biten | C3 + C4: tabelalar, halı ve tablo (bu PR; Kemal'in isteğiyle gece işleri tek PR) |
| Şu an | C paketinin denetimi: Kemal telefonda bakacak |
| Sıradaki | KKM'de yol haritası sekmesinin görünmemesi (Kemal'le birlikte) · sona kalanlar |
| Yayın | Tarih yok; acele yok (Kemal, 14 Ekim gece) |

## Paketler

| Paket | İçerik | Durum |
|---|---|---|
| A | Test kolaylıkları ve ekran: 10.000 jeton, açılış ekranı (Yeni oyun / Devam et / Deneme dükkânı), döndürme ve duvar düğmeleri, haber şeridi | Bitti ([#26](https://github.com/hkemal94/DondumaciKizlar/pull/26), [#27](https://github.com/hkemal94/DondumaciKizlar/pull/27)) |
| D | Karakterler: müşteri, çalışan, yardımcı, sahip yeni pakette; çalışanda beden seçimi | Bitti ([#28](https://github.com/hkemal94/DondumaciKizlar/pull/28)) |
| KKM | KKM'deki oyun sayfasında bu yol haritası | Bitti ([#29](https://github.com/hkemal94/DondumaciKizlar/pull/29), KKM [#92](https://github.com/hkemal94/Kems-Company/pull/92)); Kemal KKM'de göremiyor, bakılıyor |
| B | Liman haritası: Kemal'in KKM 2D haritasına göre dış dünya; kumsal, T iskele, mendirek (giriş solda), Liman İdare ve Deposu, araba yolu, mahalle, tekneler | Bitti ([#30](https://github.com/hkemal94/DondumaciKizlar/pull/30)) |
| C | Kişiselleştirme (Sims gibi, belge 0.11): C1 boya, çerçeve, tente, zemin · C2 çatı · C3 tabelalar · C4 halı ve tablo | C1 bitti ([#31](https://github.com/hkemal94/DondumaciKizlar/pull/31)), C2 bitti ([#32](https://github.com/hkemal94/DondumaciKizlar/pull/32)), C3 ve C4 bitti (bu PR); C paketi tamam |
| E | Hesap ve bulut kayıt: aynı dükkân telefonda ve bilgisayarda | Yayına yakın |

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
- Tabelalar: çatı tabelası, direk tabela, pencerede neon, iskele kemeri; akşam yanar · bu PR
- Halı ve tablo: paspas, yuvarlak halı, kilim, üç tablo, boş çerçeve; tablolar duvara asılır · bu PR
- Düzeltme: sonradan duvarla kapatılan karelerde dışarının ahşap tahtası iç zemini (seçilen zemin, mutfak fayansı) örtüyordu · bu PR
- Karakterler (eski Kenney karakterleri [#12](https://github.com/hkemal94/DondumaciKizlar/pull/12), [#13](https://github.com/hkemal94/DondumaciKizlar/pull/13) yerine) · [#28](https://github.com/hkemal94/DondumaciKizlar/pull/28)

## Sona kalanlar

Kemal'in "sona bırakalım" dedikleri ve test sırasında görülen eksikler.

- Karakterlere ağız: basit bir gülümseme
- Çalışanın önlüğü yeniden, daha iyi biçimli (şimdilik kaldırıldı); kıyafeti değiştirilebilsin
- Saçları başlardan ayırıp ayrı seçmek
- Hareketler: tezgaha varınca el sallama, servisi uzanıp alma, mutlu / mutsuz ayrılış
- Çocuk müşteriler (pakette çocuk yok; uygun bir paket bulununca)
- Doğa paketindeki çam yaprakları ışığı ters alıp koyu görünüyor
- Yeni içecek istasyonları: limonata / ayran / buzlu çay; milkshake / frappe; kahve (barista); taze sıkma
- Depo oynanışı (şimdi yalnız görüntü)
- Mevsim: kışın tatlıcı / kafe
- Deneyim (exp) sistemi: görünüş ve diğer şeyler para, memnuniyet, servis sayısı gibi ölçülerle açılsın (ayrı çalışma)
- Tablolara reklam (belki)
- Telefonda akıcılık: ekranda 10'dan çok karakter varken ve liman / mahalle görünürken kontrol
- Liman: mahalle sokakları haritadaki gibi eğik değil, düz ızgara; liman yapılarının tabelası yok

## Yayından önce

- 10.000 jeton kalkar (`GELISTIRME_JETONU` 0 olur)
- Deneme dükkânı düğmesi kalkar
- Hesap ve bulut kayıt (E)
- Mağaza ve bilgisayar paketi (CLAUDE.md: sonra)

## Kemal'in kararını bekleyenler

- Kaç müşteri tipi olacağı
- Para modelinin ayrıntıları (makyaj paketleri satılabilir; gerisi açık)
- Çalışanın, sahibin ve mekânların adları
