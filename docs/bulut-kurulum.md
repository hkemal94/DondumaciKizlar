# Bulut kayıt kurulumu (Kemal için, bir kez)

Oyunun kendi Firebase projesi (KKM'ninkine karışmaz). 10 dakika sürer.
Bitince en sondaki dört değeri Claude'a gönder; Claude oyuna yazar ve
giriş ekranında "☁ Google ile bağlan" düğmesi çıkar.

1. **Proje aç:** https://console.firebase.google.com → **Proje ekle** →
   ad: `dondurmaci-kizlar` → Google Analytics **kapalı** → Oluştur.
2. **Google ile giriş:** soldan **Authentication** → Başlayın →
   **Sign-in method** → **Google** → Etkinleştir → destek e-postası seç → Kaydet.
3. **Oyunun adresine izin:** Authentication → **Settings** →
   **Authorized domains** → Add domain → `hkemal94.github.io` → Ekle.
4. **Veritabanı:** soldan **Firestore Database** → Veritabanı oluştur →
   konum **eur3 (Avrupa)** → **üretim modu** → Oluştur.
5. **Kurallar:** Firestore → **Rules** sekmesi → içindekini sil, depodaki
   `firestore.rules` dosyasının içeriğini yapıştır → **Yayınla**.
   (Herkes yalnız kendi dükkânını görür.)
6. **Web uygulaması:** sol üstte dişli → **Proje ayarları** → aşağıda
   "Uygulamalarınız" → **</>** (Web) → takma ad: `oyun` → Hosting işaretleme →
   Kaydet. Çıkan kutuda `firebaseConfig` var.
7. Oradaki şu dört değeri Claude'a gönder (gizli değiller, oyunun içinde
   herkes görebilir; güvenliği 5. adımdaki kurallar sağlar):
   `apiKey`, `authDomain`, `projectId`, `appId`.

Ücret: Firebase'in ücretsiz katmanı (Spark) yeter; kart istemez. Oyun en çok
30 saniyede bir yazar.
