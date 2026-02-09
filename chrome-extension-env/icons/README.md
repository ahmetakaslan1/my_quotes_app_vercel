# Icon Files

Bu klasörde Chrome Extension için ikonlar bulunmaktadır.

## Gerekli İkonlar

Chrome Extension için 3 farklı boyutta ikon gereklidir:

- `icon16.png` - 16x16 piksel (toolbar)
- `icon48.png` - 48x48 piksel (extensions sayfası)
- `icon128.png` - 128x128 piksel (Chrome Web Store)

## Mevcut Durum

Şu anda `icon.svg` dosyası bulunmaktadır. Bu SVG dosyasını PNG formatına dönüştürmeniz gerekiyor.

## SVG'yi PNG'ye Dönüştürme

### Online Araçlar (En Kolay):

1. **CloudConvert** - https://cloudconvert.com/svg-to-png
   - `icon.svg` dosyasını yükleyin
   - 16x16, 48x48 ve 128x128 boyutlarında ayrı ayrı indirin
2. **Convertio** - https://convertio.co/svg-png/
   - SVG yükleyin ve boyut seçin

3. **SVG to PNG Online** - https://svgtopng.com/
   - Drag & drop ile yükleyin

### Masaüstü Araçları:

1. **Inkscape** (Ücretsiz)

   ```
   Dosya → Dışa Aktar → PNG Resmi
   Genişlik/Yükseklik: 16, 48, 128
   ```

2. **GIMP** (Ücretsiz)
   ```
   SVG'yi aç → Resmi Ölçeklendir → PNG olarak dışa aktar
   ```

### Kod ile (Node.js):

```bash
npm install -g svgexport
svgexport icon.svg icon16.png 16:16
svgexport icon.svg icon48.png 48:48
svgexport icon.svg icon128.png 128:128
```

## Alternatif: Kendi İkonunuzu Oluşturun

Eğer özel bir ikon tasarlamak isterseniz:

- **Canva** - https://canva.com
- **Figma** - https://figma.com
- **Free Icon Libraries** - https://icons8.com, https://flaticon.com

Tasarlarken dikkat edilecekler:

- ✅ Basit ve minimal tasarım
- ✅ Purple-blue gradient renk şeması (#667eea to #764ba2)
- ✅ Quote/alıntı temalı
- ✅ PNG formatında transparent background

## Manuel SVG Dönüştürme Adımları

1. https://cloudconvert.com/svg-to-png adresine gidin
2. "Select File" ile `icon.svg` dosyasını yükleyin
3. "Convert" butonuna tıklayın
4. İndirilen PNG'yi boyutlandırın:
   - 128x128 için orijinal boyutta indirin → `icon128.png` olarak kaydedin
   - 48x48 ve 16x16 için tekrar yükleyin ve boyut seçeneğiyle indirin
5. Tüm PNG dosyalarını bu klasöre koyun

Extension, PNG dosyaları bu klasörde olduktan sonra çalışacaktır!
