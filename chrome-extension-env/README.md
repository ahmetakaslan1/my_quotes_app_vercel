# My Quotes Library - Chrome Extension

Chrome extension uygulamanızın quotes kütüphanenize hızlı erişim ve söz ekleme özelliği.

> [!IMPORTANT]
> **Template Kurulumu**
>
> Bu klasör template içerir. Kendi extension'ınızı kullanmak için:
>
> 1. `popup.js` dosyasını açın ve kendi URL'lerinizi girin:
>    ```javascript
>    const API_BASE_URL = "https://your-app.vercel.app/api";
>    const SITE_URL = "https://your-app.vercel.app";
>    ```
> 2. `manifest.json` dosyasını açın ve `host_permissions` güncelleyin:
>    ```json
>    "host_permissions": ["https://your-app.vercel.app/*"]
>    ```
> 3. Kaydedin ve Chrome'a yükleyin!

## 🎯 Özellikler

- 📝 **Hızlı Söz Ekleme**: Extension popup'ından direkt yeni söz ekleyin
- 🔗 **Site Erişimi**: Tek tıkla ana web sitenize gidin
- ⚡ **Hızlı ve Hafif**: Minimal tasarım, maksimum performans
- 🌓 **Tema Desteği**: Otomatik koyu/açık mod
- ✅ **Gerçek Zamanlı Feedback**: Başarı/hata mesajları

## 📦 Kurulum

### Chrome'a Yükleme

1. Chrome tarayıcınızı açın
2. Adres çubuğuna `chrome://extensions/` yazın
3. Sağ üst köşedeki **Developer mode** (Geliştirici modu) düğmesini aktif edin
4. **Load unpacked** (Paketlenmemiş uzantı yükle) butonuna tıklayın
5. `chrome-extension` klasörünü seçin
6. Extension toolbar'a eklenecektir! 🎉

### Edge'e Yükleme

1. Edge tarayıcınızı açın
2. Adres çubuğuna `edge://extensions/` yazın
3. Sol alttaki **Developer mode** düğmesini aktif edin
4. **Load unpacked** butonuna tıklayın
5. `chrome-extension` klasörünü seçin

## 🚀 Kullanım

1. **Extension ikonuna tıklayın** - Toolbar'daki extension ikonuna tıklayın
2. **Söz ekleyin**:
   - Söz içeriğini yazın (zorunlu)
   - Yazar adını girin (opsiyonel, varsayılan: "Anonymous")
   - Kategori ekleyin (opsiyonel, varsayılan: "General")
   - **Kaydet** butonuna tıklayın
3. **Siteye gidin** - Sağ üst köşedeki bağlantı ikonuna tıklayarak ana siteyi yeni sekmede açın

## 📂 Dosya Yapısı

```
chrome-extension/
├── manifest.json          # Extension yapılandırması
├── popup.html            # Popup arayüzü
├── popup.css             # Stil dosyası
├── popup.js              # JavaScript logic
├── icons/                # Extension ikonları
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # Bu dosya
```

## 🔧 Geliştirme

Extension'da değişiklik yaptıktan sonra:

1. `chrome://extensions/` sayfasına gidin
2. Extension'un altındaki **Reload** (🔄) butonuna tıklayın
3. Değişiklikleriniz aktif olacaktır

## 🎨 İkonları Özelleştirme

Şu an placeholder ikonlar kullanılıyor. Kendi ikonlarınızı eklemek için:

1. 16x16, 48x48 ve 128x128 piksel PNG ikonlar oluşturun
2. `icons/` klasörüne koyun
3. Extension'ı yeniden yükleyin

**Önerilen araçlar:**

- [Canva](https://canva.com)
- [Figma](https://figma.com)
- [GIMP](https://gimp.org)

## 🔐 Güvenlik

- Extension yalnızca `YOUR_SITE_URL_HERE` ile iletişim kurar
- Hiçbir veri üçüncü taraflarla paylaşılmaz
- Tüm veriler sizin Next.js backend'inize gider

## 📝 API Entegrasyonu

Extension şu API endpoint'i kullanır:

- **POST** `YOUR_SITE_URL_HERE/api/quotes`

Eğer API URL'nizi değiştirirseniz, `popup.js` dosyasındaki `API_BASE_URL` ve `SITE_URL` değişkenlerini güncelleyin.

## 🐛 Sorun Giderme

### Extension yüklenmiyor

- Developer mode'un aktif olduğundan emin olun
- Tüm dosyaların `chrome-extension` klasöründe olduğunu kontrol edin

### API hatası alıyorum

- Web sitenizin yayında olduğundan emin olun
- CORS ayarlarının düzgün olduğunu kontrol edin
- Browser console'da hata mesajlarını inceleyin (F12)

### İkonlar görünmüyor

- `icons/` klasöründe tüm icon dosyalarının olduğunu kontrol edin
- Extension'ı reload edin

## 📄 Lisans

Bu extension, My Quotes App projesinin bir parçasıdır.

---

**Web Site:** YOUR_SITE_URL_HERE
**Geliştirici:** Ahmet Akaslan
