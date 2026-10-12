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
| Kamera | **İki sabit kamera:** dükkânın izometrik genel görünümü + sipariş gelince tezgahın arkasından birinci şahıs yakın plan. Aralarında yumuşak geçiş. **Oyuncu yürümez**, serbest kamera yok |
| 3B | Gerçek 3B modeller, **sabit açılar** |
| Stil | Low-poly, pastel tonlar, yumuşak ışık. Sakin, dinlendirici; kaybetme ve sert ceza yok |
| Platform | **Telefon önce.** Dokunmatik birincil kontrol; fare de çalışır. Mağaza ve PC paketi sonra |
| Teknoloji | Vite + TypeScript + React + **Three.js** (React Three Fiber). Oyun tarayıcıda çalışır |
| Yer | Düzada, **Liman Mahallesi, iskelenin yakını** ("sahil şeridi" değil) |
| Dönem | **2000'lerin başı** — dükkânın açılış yılları |
| Oyuncu | **İsimsiz.** Oyuncuya ad, yüz, geçmiş verme |
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

- Bir oyun gününün gerçek süresi (öneri: 5–8 dakika).
- İlk sürümde kaç dondurma çeşidi, kaç müşteri tipi.
- Para modeli.
- Oyunun adı ("Dondurmacı Kızlar" dükkânın adı; oyunun adı da bu mu?).
- Karakter ve mekân adları — hepsi Kemal'in. Aday önerebilirsin.

## Yazı kuralı

- **Kurgu metni yazma.** Müşteri konuşmaları, hikâye kırıntıları, karakter
  geçmişleri Kemal'in işi. Mekanik için yer tutucu gerekiyorsa açıkça
  "[YER TUTUCU]" diye işaretle; gerçek metin gibi görünmesin.
- Ekrandaki her yazı tek bir çeviri dosyasından gelir
  (`src/metinler/tr.json`); koda gömülmez. İngilizce sonra eklenecek.

## 3B modeller

- İlk sürümde **hazır, ücretsiz ve ticari kullanıma açık (CC0)** low-poly
  paketler: Kenney, Quaternius. Başka kaynaktan model eklemeden önce sor.
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

## Kapsam

**Bu deponun işi:** yalnızca Dondurmacı Kızlar oyunu.

**Bu deponun işi DEĞİL — dokunma, yazma:**
- `hkemal94/TheImperialKemskoy` (resepsiyon oyunu, şu an bekliyor)
- Kems Komuta Merkezi (KKM) deposu

## İş sırası

1. **İskelet:** proje kurulumu, boş 3B sahne, telefonda açılan önizleme
   bağlantısı.
2. **Tezgah yakın planı + kepçe mini oyunu:** altlık seç (külah / kap) →
   basılı tut, küvete daldır → "MÜKEMMEL" anında bırak → topu yerleştir →
   servis et. *Çekirdek bu; eğlenceli değilse dur ve Kemal'le konuş.*
3. **Müşteri sırası:** tezgah önünde sıraya giren 3B müşteriler, üstlerinde
   sipariş balonu; doğru sipariş → para ve memnuniyet.
4. **Gün ve saat:** saat akar, kapanışta gün sonu ekranı.
5. **İzometrik dükkân görünümü** ve iki kamera arası geçiş.
6. Sonra: yeni çeşitler ve tarif ağacı, fiyatlar, dekorasyon, süsleme ve
   sos, mevsim (kış: tatlıcı / kafe), hikâye kırıntıları.

**İlk oynanabilir sürüm = 1–3.** Kemal ve yakın çevresi telefonda dener.
