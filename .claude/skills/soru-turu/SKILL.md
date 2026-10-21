---
name: soru-turu
description: Kemal'le tıklamalı sorularla bir işi ya da bütün açık işleri netleştirme turu ("grill me"). Kemal "soru turu", "sorularla netleştirelim", "grill me" dediğinde, yeni ve belirsiz bir iş geldiğinde ya da yapılacaklar listesi kararsız maddelerle dolduğunda kullan. Kod yazmadan önce her kararı Kemal'e verdirir ve cevapları docs/soru-cevap/ altına kaydeder.
---

# Soru turu

Amaç: Kemal'in kafasındakini **tahmin etmeden**, kısa tıklamalı sorularla
çıkarmak; kod yazmadan önce her açık kararı netleştirmek. Kemal'in dikkat
süresi kısa ve kodlama bilmiyor: sorular sade, cevaplar dokunmalık olur.

## Ne zaman

- Kemal "soru turu", "grill me", "sorularla netleştirelim" der.
- Yeni bir iş belirsiz geldi (ne, nerede, nasıl görünür, ne zaman belli değil).
- Yol haritasında "Kemal'in kararı" bekleyen maddeler birikti.
- Bir iş başka bir işle çelişiyor ya da belgeyle (`docs/tasarim-belgesi.md`) uyuşmuyor.

## Hazırlık (soru sormadan önce, sessizce)

1. `CLAUDE.md`, `docs/tasarim-belgesi.md` (özellikle 7. bölüm "karar yok"),
   `docs/yol-haritasi.md` ve `docs/soru-cevap/` altındaki eski turları oku.
   **Daha önce cevaplanmış bir şeyi tekrar sorma.**
2. Kemal'in son mesajlarındaki istekleri, itirazları ve ekran görüntülerini
   tek bir liste yap. Her maddeyi şöyle etiketle:
   - **Net**: sormadan yapılabilir → soruya koyma, listede "net" yaz.
   - **Kararı Kemal'in**: ad, metin, hikâye, para modeli, yeni kaynak, kapsam.
   - **Bağımlı**: başka bir cevaba göre değişir → o cevaptan sonra sor.
3. Maddeleri konulara topla (ör. arayüz, görsel dil, oyun mekaniği, yeni mod,
   yayın). Her konu bir tur olur.

## Soru kuralları

- **AskUserQuestion** kullan; bir çağrıda en fazla 4 soru, her soruda 2–4 seçenek.
  Kemal her zaman "Diğer" yazabilir; ayrıca "Diğer" seçeneği koyma.
- Önerdiğin seçenek **ilk sırada** ve sonunda "(Önerim)" yazar.
- Soru tek bir şeyi sorar. "X ve Y" diye iki karar birleştirilmez.
- Seçenek açıklaması **ekranda ne olacağını** anlatır, teknik terim yok.
  Gerekirse `preview` alanına küçük bir taslak (ASCII yerleşim) koy.
- Etiket (header) en fazla 12 harf.
- Birbirini dışlamayan seçeneklerde `multiSelect: true`.
- **Kurgu metni önerme**: ad, slogan, müşteri cümlesi, festival adı Kemal'in.
  Aday önerebilirsin ama "aday" diye işaretle; seçenekte gerçek metin gibi durmasın.
- Belgede ya da `CLAUDE.md`'de "sabit" yazan bir şeyi seçenek olarak sunma
  (kamera, yatay ekran, dönem, yazım...). Değişmesi gerekiyorsa açıkça
  "sabiti değiştirir" diye uyar.

## Tur akışı

1. **Açılış (tek mesaj, 3–5 satır):** kaç konu, kaç tur olacağını söyle.
   Netleri listeleme; "şunları sormadan yapacağım" diye tek satır yeter.
2. **Her tur:** önce en çok işi açan / en çok şeyi etkileyen soru.
   Kapsam → yer → görünüş → ayrıntı sırasıyla daral.
3. **Cevaptan sonra derinleş:** her cevap yeni bir belirsizlik açıyorsa
   (ör. "ayrı oyun" → hangi depo, hangi ad, ne zaman) bir sonraki turda sor.
   Bir konu ancak şu sorulara cevap varken kapanır:
   - Ne yapılacak, ne yapılmayacak (kapsamın sınırı)?
   - Oyuncu nerede görecek, nasıl dokunacak?
   - Neye benzeyecek (örnek, ekran görüntüsü, mevcut bir şey)?
   - Hangi sırayla, hangisi önce?
   - Kemal'in hazırlaması gereken bir şey var mı (metin, görsel, hesap)?
4. **"Diğer" cevapları:** Kemal kendi cümlesini yazdıysa onu aynen kaydet;
   anlamı belirsizse bir sonraki turda iki yorumu seçenek yapıp sor.
5. **Bölme:** tek turda 4'ten fazla soru gerekiyorsa böl; bir mesajda tek
   AskUserQuestion çağrısı.
6. **Ara özet:** her 2–3 turda bir, 3 satırı geçmeyen özet ("Şunlar kesinleşti").
7. **Bitiş:** Kemal "yeter" derse ya da bütün konular kapandıysa dur.

## Kayıt

Her turdan sonra `docs/soru-cevap/<konu>-<n>.md` dosyasına yaz
(KKM deposundaki `docs/soru-cevap/` biçimiyle aynı):

```markdown
# Soru-cevap · <Konu>, <n>. set

Kemal'in tıklamalı cevapları, <tarih>.

## 1. tur — <başlık>

| Soru | Cevap |
|---|---|
| <kısa soru> | **<seçilen>** ya da "<Kemal'in kendi cümlesi>" |
```

Tur bitince:
- Kesinleşen kararları `docs/tasarim-belgesi.md`'ye (ilgili bölüm + 7. bölümden
  çıkar) ve sırayı `docs/yol-haritasi.md`'ye işle.
- Hâlâ açık kalanları belgenin 7. bölümünde bırak.
- Kemal'e son mesaj: kesinleşenler (en fazla 5 satır) + "ilk iş şu, başlayayım mı?".
  Uyanıksa onay bekle (CLAUDE.md madde 2); gece modundaysa başla (madde 11).

## Yapma

- Cevabı belli olan şeyi sorma (belgede yazıyor, kod gösteriyor).
- Uzun açıklama yazma; Kemal "uzun yazıyorsun" der.
- Bir turda sorulmamış bir kararı kendin verip "zaten öyle düşündüm" deme.
- Turu bitirmeden koda başlama.
