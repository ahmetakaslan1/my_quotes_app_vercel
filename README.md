# 📝 Quote Management App

Kişisel notlarınızı ve ilham verici sözlerinizi yönetebileceğiniz modern bir web uygulaması.

## 🎯 Özellikler

- ✍️ **CRUD İşlemleri**: Not oluşturma, listeleme, güncelleme ve silme
- 🔍 **Arama & Filtreleme**: İçerik veya yazara göre arama, favorilere göre filtreleme
- 📊 **Sıralama**: En yeni, en eski veya alfabetik sıralama
- ⭐ **Favori Sistemi**: Önemli notları favorilere ekleme
- 🗑️ **Toplu Silme**: Birden fazla notu tek seferde silme
- 🌓 **Tema Desteği**: Açık/Koyu mod geçişi
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- 📄 **API Dokümantasyonu**: Swagger UI ile interaktif API dökümanları

## 🛠️ Teknolojiler

- **Framework**: Next.js 16 (App Router)
- **Dil**: TypeScript
- **Veritabanı**: MySQL (Prisma ORM)
- **Styling**: Vanilla CSS (CSS Variables ile tema desteği)
- **İkonlar**: Lucide React
- **API Docs**: Swagger UI

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd my_quotes_app
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env` dosyasını oluşturun ve veritabanı bağlantı bilgilerinizi ekleyin:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 4. Prisma Client Oluşturun

```bash
npx prisma generate
npx prisma db push
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📡 API Dokümantasyonu

Uygulamanın API endpoint'leri ve kullanım detayları için `/api-docs` sayfasındaki Swagger dokümantasyonunu inceleyebilirsiniz.

**API Dokümantasyonu**: `/api-docs` sayfasından Swagger UI ile tüm endpoint'leri test edebilirsiniz.

## 🌐 Vercel'e Deploy

1. GitHub'a push edin
2. Vercel'de projeyi import edin
3. Environment Variables ekleyin:
   - `DATABASE_URL`: MySQL bağlantı string'i
4. Deploy edin

supabase veya daha farklı bir alternatif veritabanı kullanabilirsiniz.

## 📝 Lisans

Bu proje kişisel kullanım için oluşturulmuştur.
