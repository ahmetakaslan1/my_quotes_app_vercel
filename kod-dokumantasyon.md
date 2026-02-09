# My Quotes App - Offline-First Kod Dokümantasyonu

## 🎯 Ana Mantık

**Uygulama Amacı:**  
Kullanıcılar sözler/notlar ekleyip yönetebilsin. İnternet olsa da olmasa da çalışsın (Offline-First).

**Temel Özellikler:**

- ✅ Quote CRUD (Create, Read, Update, Delete)
- ✅ Kategoriler & Favoriler
- ✅ Offline çalışma (IndexedDB)
- ✅ Online sync (PostgreSQL)
- ✅ Responsive sidebar

---

## 📐 Mimari Genel Bakış

### Next.js Hybrid Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TARAYICI (Client)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  React Components (Client-Side)                          │
│  ├── page.tsx ('use client')                            │
│  ├── Sidebar.tsx                                         │
│  ├── QuoteCard.tsx                                       │
│  └── OfflineBanner, SyncStatus                          │
│                                                           │
│  IndexedDB (Dexie)                                       │
│  ├── lib/db.ts                                           │
│  └── QuotesDB (local storage)                           │
│                                                           │
│  Offline Service (Business Logic)                        │
│  └── lib/offline-service.ts                             │
│                                                           │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP (fetch)
                  ↓
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (Server-Side)                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  API Routes (Server-Side)                                │
│  ├── /api/quotes (GET, POST, DELETE, PATCH)            │
│  └── /api/categories (GET)                              │
│                                                           │
│  Prisma ORM                                              │
│  └── Database Client                                     │
│                                                           │
└─────────────────┬───────────────────────────────────────┘
                  │ SQL
                  ↓
┌─────────────────────────────────────────────────────────┐
│                   POSTGRESQL (Database)                   │
│  ├── quotes table                                        │
│  └── Persistent storage                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Veri Akışı: Başlangıçtan Bitişe

### 1️⃣ Uygulama İlk Açılış

**ADIM 1: Next.js Server Render**

```
Kullanıcı → https://library.ahmetakaslan.com/
      ↓
Next.js Server:
  - page.tsx server-side render (initial HTML)
  - CSS/JS bundle'ları hazırla
  - Client'a gönder
```

**ADIM 2: Client Hydration**

```
Tarayıcı HTML alır
      ↓
React Hydration başlar:
  - useEffect() hooks çalışır
  - State initialize edilir
  - Event listeners eklenir
```

**ADIM 3: İlk Veri Yükleme**

```typescript
// page.tsx - useEffect içinde
useEffect(() => {
  fetchQuotes(); // İlk çağrı
}, []);
```

**fetchQuotes() Akışı:**

```
1. getAllQuotesOffline() çağır
2. IndexedDB'den oku (HIZLI - cache)
3. navigator.onLine kontrolü:
   └─ Online ise:
      - Server'a fetch() isteği at
      - PostgreSQL'den veriyi çek
      - IndexedDB ile merge et (sync)
   └─ Offline ise:
      - Sadece IndexedDB'deki veriyi göster
4. setQuotes(data) → UI güncelle
```

---

### 2️⃣ Yeni Quote Ekleme Akışı

**Kullanıcı "Add" sayfasına gider:**

```
Add Butonu → /add route
      ↓
add/page.tsx render olur
      ↓
Form gösterilir (content, author, category)
```

**Form Submit Edildiğinde:**

```typescript
// add/page.tsx - handleSubmit()
const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. OFFLINE SERVICE ÇAĞIR
  await addQuoteOffline({
    content: content.trim(),
    author: author.trim(),
    category: category.trim(),
  });

  // 2. Navigate home
  router.push("/");
};
```

**addQuoteOffline() İçinde Ne Oluyor?**

```typescript
// lib/offline-service.ts

export async function addQuoteOffline(quote) {
  // ─────────────────────────────────────────────────
  // ADIM 1: INDEXEDDB'YE HEMEN KAYDET
  // ─────────────────────────────────────────────────
  const localId = await db.quotes.add({
    ...quote,
    isFavorite: false,
    createdAt: new Date(),
    serverId: null, // Henüz server ID yok!
    synced: false, // ❌ Server'a GİTMEDİ
    pending: true, // ⏳ Senkronizasyon BEKLİYOR
  });

  console.log("💾 Offline kaydedildi, local ID:", localId);

  // ─────────────────────────────────────────────────
  // ADIM 2: ONLINE KONTROLÜ
  // ─────────────────────────────────────────────────
  if (navigator.onLine) {
    // ✅ Internet var → Hemen server'a gönder
    await syncQuote(localId);
  } else {
    // 📴 Internet yok → Beklemede kal
    console.log("Offline - sync bekliyor");
  }

  return localId;
}
```

**syncQuote() - Server'a Gönderme:**

```typescript
async function syncQuote(localId) {
  // Local quote'u al
  const quote = await db.quotes.get(localId);

  try {
    // ─────────────────────────────────────────────────
    // SERVER'A POST İSTEĞİ
    // ─────────────────────────────────────────────────
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: quote.content,
        author: quote.author,
        category: quote.category,
      }),
    });

    if (response.ok) {
      const serverQuote = await response.json();

      // ─────────────────────────────────────────────────
      // INDEXEDDB'Yİ GÜNCELLE - SYNC EDİLDİ!
      // ─────────────────────────────────────────────────
      await db.quotes.update(localId, {
        serverId: serverQuote.id, // PostgreSQL ID
        synced: true, // ✅ SYNC EDİLDİ
        pending: false, // ⏳ Artık BEKLEMİYOR
      });
    }
  } catch (error) {
    // Network hatası → pending: true olarak kal
    console.error("Network hatası:", error);
  }
}
```

**Server Tarafı (`/api/quotes` POST):**

```typescript
// app/api/quotes/route.ts

export async function POST(req: Request) {
  const { content, author, category } = await req.json();

  // ─────────────────────────────────────────────────
  // PRISMA İLE POSTGRESQL'E KAYDET
  // ─────────────────────────────────────────────────
  const quote = await prisma.quote.create({
    data: {
      content,
      author,
      category,
      isFavorite: false,
    },
  });

  // PostgreSQL'e kaydedildi!
  return NextResponse.json(quote); // { id: 123, ... }
}
```

---

### 3️⃣ Offline Senaryosu - Internet Yok

**Kullanıcı offline iken quote ekliyor:**

```
1. Form submit
      ↓
2. addQuoteOffline() çağrılır
      ↓
3. IndexedDB'ye kaydet (pending: true)
      ↓
4. navigator.onLine === false
      ↓
5. syncQuote() ÇALIŞMAZ (skip edilir)
      ↓
6. Quote UI'da görünür ⏳ badge ile
      ↓
7. SyncStatus component: "1 senkronizasyon bekliyor"
```

**Internet gelince ne olur?**

```typescript
// page.tsx - useEffect içinde

useEffect(() => {
  // ─────────────────────────────────────────────────
  // ONLINE EVENT LISTENER
  // ─────────────────────────────────────────────────
  const handleOnline = () => {
    console.log("✅ İnternet geldi!");
    fetchQuotes(); // Yeniden yükle (sync tetikler)
  };

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}, []);
```

**fetchQuotes() tekrar çalışır:**

```
getAllQuotesOffline()
      ↓
navigator.onLine === true
      ↓
Server'a fetch('/api/quotes')
      ↓
Pending quotes tespit edilir
      ↓
syncQuote() otomatik çalışır
      ↓
synced: true, pending: false
      ↓
UI'dan ⏳ badge kalkır
```

---

## 🧩 Kritik Kontrol Noktaları

### ❓ Ne Zaman Offline Kontrolü Yapılır?

| İşlem                | Kontrol Noktası                     | Kod Yeri                                |
| -------------------- | ----------------------------------- | --------------------------------------- |
| **Quote Ekleme**     | `addQuoteOffline()` içinde          | `if (navigator.onLine)`                 |
| **Quote Silme**      | `deleteQuoteOffline()` içinde       | `if (quote.synced && navigator.onLine)` |
| **Favorite Toggle**  | `toggleFavoriteOffline()` içinde    | `if (quote.synced && navigator.onLine)` |
| **Tüm Quotes Alma**  | `getAllQuotesOffline()` içinde      | `if (navigator.onLine)`                 |
| **Internet Gelince** | `window.addEventListener('online')` | `page.tsx` useEffect                    |

### 🎯 Optimistic UI Pattern

**Ne:** Kullanıcıya hemen yanıt ver, server'a arkaplanda gönder

**Örnek: Favorite Toggle**

```typescript
const toggleFavorite = async (id, currentStatus) => {
  // ─────────────────────────────────────────────────
  // 1. UI'I HEMEN GÜNCELLE (Optimistic)
  // ─────────────────────────────────────────────────
  setQuotes(
    quotes.map((q) => (q.id === id ? { ...q, isFavorite: !currentStatus } : q)),
  );

  // ─────────────────────────────────────────────────
  // 2. ARKAPLANDA SYNC ET
  // ─────────────────────────────────────────────────
  try {
    await toggleFavoriteOffline(id, false);
  } catch (error) {
    // Hata varsa geri al
    fetchQuotes(); // Rollback
  }
};
```

**Neden Optimistic UI?**

- ⚡️ Hızlı response (kullanıcı beklemez)
- 🎨 Smooth UX (lag yok)
- 🔄 Background sync (kullanıcı farketmez)

---

## 🗄️ IndexedDB vs PostgreSQL

### IndexedDB (Client-Side)

**Amaç:** Tarayıcıda local cache/storage

**Ne Zaman Kullanılır:**

- Offline veri saklama
- Hızlı okuma (cache)
- Pending operations (sync queue)

**Schema:**

```typescript
{
  id: 1,              // Local ID
  serverId: 123,      // PostgreSQL ID
  content: "...",
  synced: true,       // Sync durumu
  pending: false      // Bekliyor mu?
}
```

### PostgreSQL (Server-Side)

**Amaç:** Kalıcı, merkezi database

**Ne Zaman Kullanılır:**

- User'lar arası senkronizasyon
- Multi-device sync
- Backup/recovery
- Güvenlik (server-side validation)

**Schema:**

```sql
CREATE TABLE quote (
  id SERIAL PRIMARY KEY,
  content TEXT,
  author TEXT,
  category TEXT,
  isFavorite BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🔀 Sync Stratejileri

### 1. Stale-While-Revalidate

**Ne:** Cache'den göster, arkaplanda güncelle

```typescript
async function getAllQuotesOffline() {
  // 1️⃣ CACHE'DEN AL (HIZLI)
  const localQuotes = await db.quotes.toArray();

  // 2️⃣ ONLINE İSE SERVER'DAN GÜNCELLE
  if (navigator.onLine) {
    const serverQuotes = await fetch("/api/quotes");

    // 3️⃣ MERGE ET
    for (const sq of serverQuotes) {
      const existing = await db.quotes.where("serverId").equals(sq.id).first();

      if (existing) {
        // GÜNCELLE
        await db.quotes.update(existing.id, sq);
      } else {
        // YENİ EKLE
        await db.quotes.add({ ...sq, synced: true });
      }
    }
  }

  return localQuotes; // Cache veya güncellenmiş
}
```

**Avantajlar:**

- ⚡️ Instant load (cache)
- 🔄 Always fresh (background update)
- 📴 Offline support

### 2. Last-Write-Wins

**Ne:** Conflict olursa server kazanır

```typescript
if (existing) {
  // Server'dan gelen veri her zaman daha yeni kabul edilir
  await db.quotes.update(existing.id, serverQuote);
}
```

**Neden:**

- Basit (conflict resolution yok)
- Tek kullanıcı uygulamalar için yeterli
- İleri seviye: Timestamp-based merge

---

## 🧪 Debug & Test Stratejisi

### 1. Online/Offline Simülasyonu

```javascript
// DevTools Console
// Offline simüle et
navigator.onLine = false;

// Online simüle et
navigator.onLine = true;

// Event trigger
window.dispatchEvent(new Event("offline"));
window.dispatchEvent(new Event("online"));
```

### 2. IndexedDB İnceleme

```
Chrome DevTools → Application → Storage → IndexedDB
  └─ QuotesDB
     └─ quotes table
        - Tüm local data görünür
        - synced/pending kontrol edilir
```

### 3. Network Monitoring

```
DevTools → Network Tab
  - Fetch requests görünür
  - Response times
  - Failed requests (retry logic test)
```

---

## 📦 Deployment Sırası

### 1. Geliştirme (Local)

```bash
npm run dev # localhost:3000
```

**Çalışan:**

- Next.js dev server
- Hot reload
- Hata detayları

### 2. Build (Production Test)

```bash
npm run build
npm start
```

**Çalışan:**

- Optimized bundle
- Minified JS/CSS
- Production simülasyonu

### 3. Vercel Deploy

```bash
git push origin master
```

**Vercel Otomatik:**

1. GitHub webhook alır
2. `npm run build` çalıştırır
3. Static files deploy eder
4. Edge network'e dağıtır
5. Live URL: `library.ahmetakaslan.com`

---

## 🎓 Önemli Kavramlar

### Client Components vs Server Components

**Server Component:**

- Default Next.js
- Server'da render olur
- Database direkt erişim
- `'use client'` YOK

**Client Component:**

- `'use client'` directive ile
- Tarayıcıda çalışır
- useState, useEffect kullanır
- Event handlers

**Bizim app:**

- `page.tsx` → Client Component (hooks kullanıyor)
- `/api/quotes` → Server-side (Prisma kullanıyor)

### Hydration

**Ne:** Server'dan gelen HTML'e React interactivity ekleme

```
Server HTML → Client JavaScript → Interactive App
```

**Neden önemli:**

- İlk render hızlı (server HTML)
- Sonra interactive olur (hydrate)

---

## 🚀 Performans İpuçları

### 1. IndexedDB Cache

```typescript
// ✅ İyi
const quotes = await getAllQuotesOffline(); // Cache-first

// ❌ Kötü
const quotes = await fetch("/api/quotes"); // Always network
```

### 2. Debounce Search

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    fetchQuotes(); // 300ms sonra
  }, 300);
  return () => clearTimeout(timer);
}, [search]); // Her tuşta değil, pause sonra
```

### 3. Optimistic UI

```typescript
// UI hemen güncelle, server background'da
setQuotes([...quotes, newQuote]); // Instant
await addQuoteOffline(newQuote); // Background
```

---

## 📖 Özet: Tüm Akış Bir Arada

```
┌─────────────────────────────────────────────────────────┐
│  1. USER OPENS APP                                       │
│     ↓                                                     │
│  2. Next.js Server → HTML/JS                            │
│     ↓                                                     │
│  3. React Hydration → Interactive                        │
│     ↓                                                     │
│  4. useEffect() → fetchQuotes()                         │
│     ↓                                                     │
│  5. getAllQuotesOffline()                               │
│     ├─ IndexedDB → Fast load                            │
│     └─ Online? → Server sync                            │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  USER ADDS QUOTE                                         │
│     ↓                                                     │
│  1. Form submit → addQuoteOffline()                     │
│     ↓                                                     │
│  2. IndexedDB.add(pending: true)                        │
│     ↓                                                     │
│  3. Optimistic UI → Show immediately                     │
│     ↓                                                     │
│  4. Online?                                              │
│     ├─ Yes → POST /api/quotes → PostgreSQL             │
│     │         synced: true, serverId: 123               │
│     └─ No  → Keep pending: true                         │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  INTERNET RETURNS                                         │
│     ↓                                                     │
│  1. window.addEventListener('online')                    │
│     ↓                                                     │
│  2. fetchQuotes() → Trigger sync                        │
│     ↓                                                     │
│  3. Pending quotes → syncQuote()                        │
│     ↓                                                     │
│  4. POST to server → synced: true                       │
│     ↓                                                     │
│  5. UI updates → Remove pending badge                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Final Notlar

**Başarı için 3 altın kural:**

1. **Offline-First Düşün**
   - Her işlem önce local
   - Sonra sync (background)

2. **Optimistic UI Kullan**
   - Kullanıcı beklemez
   - Hızlı response

3. **Error Handling**
   - Network hatası → Rollback
   - Pending queue → Retry

**Bu sistem sayesinde:**

- ✅ Kullanıcı her zaman çalışan bir app görür
- ✅ Network yavaş olsa bile hızlı
- ✅ Offline çalışır
- ✅ Online olunca otomatik sync

🎉 **Modern Web App!**
