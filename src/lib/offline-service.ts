// ═══════════════════════════════════════════════════════════════
// 🎯 AMAÇ: Offline-first CRUD operasyonları
// ═══════════════════════════════════════════════════════════════
// Bu service internet olsa da olmasa da çalışır.
// Önce IndexedDB'ye yazar, sonra server'a gönderir.
// "Optimistic UI" - Kullanıcı hızlı yanıt alır!

"use client";

import { db, LocalQuote, getPendingQuotes } from "./db";

// ─── Admin Token Helper ───────────────────────────────────────────
function getAdminHeaders(): HeadersInit {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ───────────────────────────────────────────────────────────────
// ➕ OFFLINE QUOTE EKLEME
// ───────────────────────────────────────────────────────────────
/**
 * Yeni quote ekle (offline-ready)
 *
 * AKIŞ:
 * 1. IndexedDB'ye hemen kaydet (pending: true)
 * 2. Kullanıcıya anında göster (Optimistic UI)
 * 3. Internet varsa server'a gönder
 * 4. Başarılıysa synced: true yap
 *
 * @param quote Quote bilgileri (content, author, category)
 * @returns Local ID
 */
export async function addQuoteOffline(quote: {
  content: string;
  author: string;
  category: string;
}): Promise<number> {
  // ──────────────────────────────────────────────────────────
  // 1️⃣ IndexedDB'ye HEMEN kaydet
  // ──────────────────────────────────────────────────────────
  const localId = await db.quotes.add({
    ...quote,
    isFavorite: false,
    createdAt: new Date(),
    serverId: null, // Henüz server ID yok
    synced: false, // ⭐️ Server'a GİTMEDİ
    pending: true, // ⭐️ Senkronizasyon BEKL İYOR
  });

  console.log("💾 Offline kaydedildi, local ID:", localId);

  // ──────────────────────────────────────────────────────────
  // 2️⃣ Internet varsa HEMEN gönder
  // ──────────────────────────────────────────────────────────
  if (navigator.onLine) {
    await syncQuote(localId);
  } else {
    console.log("📴 Offline - İnternet gelince senkronize edilecek");
  }

  return localId;
}

// ───────────────────────────────────────────────────────────────
// 🔄 TEK QUOTE SENKRONİZASYONU
// ───────────────────────────────────────────────────────────────
/**
 * Tek bir quote'u server'a gönder
 *
 * @param localId Local IndexedDB ID
 */
async function syncQuote(localId: number): Promise<void> {
  // Local quote'u al
  const quote = await db.quotes.get(localId);
  if (!quote) {
    console.error("Quote bulunamadı:", localId);
    return;
  }

  // Zaten sync edildiyse tekrar gönderme
  if (quote.synced) {
    console.log("✅ Zaten sync edilmiş");
    return;
  }

  try {
    // ──────────────────────────────────────────────────────────
    // 🌐 Server'a POST isteği gönder
    // ──────────────────────────────────────────────────────────
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({
        content: quote.content,
        author: quote.author,
        category: quote.category,
      }),
    });

    if (response.ok) {
      // ✅ Başarılı! Server'dan gelen ID'yi kaydet
      const serverQuote = await response.json();

      await db.quotes.update(localId, {
        serverId: serverQuote.id, // PostgreSQL ID
        synced: true, // ✅ Sync EDİLDİ
        pending: false, // ⏳ Artık BEKLEMİYOR
      });

      console.log("✅ Senkronize edildi! Server ID:", serverQuote.id);
    } else {
      console.error("❌ Server hatası:", response.status);
      // pending: true olarak kal (tekrar denenecek)
    }
  } catch (error) {
    console.error("❌ Network hatası:", error);
    // pending: true olarak kal (tekrar denenecek)
  }
}

// ───────────────────────────────────────────────────────────────
// 📥 TÜM QUOTES'LARI AL (Hybrid: Cache + Network)
// ───────────────────────────────────────────────────────────────
/**
 * Tüm quotes'ları al (offline-first)
 *
 * STRATEJI: "Stale-While-Revalidate"
 * 1. IndexedDB'den al → Hemen göster (HIZLI!)
 * 2. Server'dan çek → Arkaplanda güncelle (TAZE!)
 *
 * @returns Quotes listesi
 */
export async function getAllQuotesOffline(): Promise<LocalQuote[]> {
  // ──────────────────────────────────────────────────────────
  // 1️⃣ IndexedDB'den AL (Cache - Hızlı!)
  // ──────────────────────────────────────────────────────────
  const localQuotes = await db.quotes.toArray();

  // ──────────────────────────────────────────────────────────
  // 2️⃣ Internet varsa server'dan GÜNCELLE
  // ──────────────────────────────────────────────────────────
  if (navigator.onLine) {
    try {
      const response = await fetch("/api/quotes?sort=newest");
      const serverQuotes = await response.json();

      // ═══════════════════════════════════════════════════════
      // 🔄 Server quotes'ları IndexedDB'ye merge et
      // ═══════════════════════════════════════════════════════
      for (const sq of serverQuotes) {
        // Server ID'sine göre local'de var mı kontrol et
        const existing = await db.quotes
          .where("serverId")
          .equals(sq.id)
          .first();

        if (existing) {
          // ♻️ Varsa GÜNCELLE (server kazanır - last-write-wins)
          await db.quotes.update(existing.id!, {
            content: sq.content,
            author: sq.author,
            category: sq.category,
            isFavorite: sq.isFavorite,
            createdAt: new Date(sq.createdAt),
            serverId: sq.id,
            synced: true,
            pending: false,
          });
        } else {
          // ➕ Yoksa YENİ EKLE
          await db.quotes.add({
            ...sq,
            serverId: sq.id,
            createdAt: new Date(sq.createdAt),
            synced: true,
            pending: false,
          });
        }
      }

      // 🗑️ Server'da olmayıp local'de sync edilmiş olanları SİL
      // (Server silmiş demektir)
      const serverIds = serverQuotes.map((q: any) => q.id);
      await db.quotes
        .filter(
          (q) =>
            q.synced === true &&
            q.serverId !== null &&
            !serverIds.includes(q.serverId),
        )
        .delete();

      // ✅ Güncellenmiş listeyi döndür
      return await db.quotes.toArray();
    } catch (error) {
      console.log("📴 Network hatası, cache kullanılıyor:", error);
      return localQuotes; // Network hatası → Cache kullan
    }
  }

  // 📴 Offline → Sadece local data
  return localQuotes;
}

// ───────────────────────────────────────────────────────────────
// 🗑️ OFFLINE QUOTE SİLME
// ───────────────────────────────────────────────────────────────
/**
 * Quote sil (offline-ready)
 *
 * @param id Local ID veya Server ID
 */
export async function deleteQuoteOffline(
  id: number,
  isServerId = false,
): Promise<void> {
  let quote: LocalQuote | undefined;

  // ID tipine göre quote bul
  if (isServerId) {
    quote = await db.quotes.where("serverId").equals(id).first();
  } else {
    quote = await db.quotes.get(id);
  }

  if (!quote) {
    console.error("Quote bulunamadı");
    return;
  }

  // ──────────────────────────────────────────────────────────
  // Eğer sync edilmişse, server'dan da sil
  // ──────────────────────────────────────────────────────────
  if (quote.synced && quote.serverId && navigator.onLine) {
    try {
      await fetch(`/api/quotes/${quote.serverId}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      console.log("✅ Server dan silindi");
    } catch (error) {
      console.error("❌ Server silme hatası:", error);
    }
  }

  // ──────────────────────────────────────────────────────────
  // Local'den sil
  // ──────────────────────────────────────────────────────────
  await db.quotes.delete(quote.id!);
  console.log("🗑️ Local den silindi");
}

// ───────────────────────────────────────────────────────────────
// ⭐ OFFLINE FAVORİ TOGGLE
// ───────────────────────────────────────────────────────────────
/**
 * Favorite durumunu değiştir (offline-ready)
 */
export async function toggleFavoriteOffline(
  id: number,
  isServerId = false,
): Promise<void> {
  let quote: LocalQuote | undefined;

  if (isServerId) {
    quote = await db.quotes.where("serverId").equals(id).first();
  } else {
    quote = await db.quotes.get(id);
  }

  if (!quote) return;

  const newFavoriteStatus = !quote.isFavorite;

  // Local güncelleme
  await db.quotes.update(quote.id!, {
    isFavorite: newFavoriteStatus,
  });

  // Server'a gönder
  if (quote.synced && quote.serverId && navigator.onLine) {
    try {
      await fetch(`/api/quotes/${quote.serverId}`, {
        method: "PATCH",
        headers: getAdminHeaders(),
        body: JSON.stringify({ isFavorite: newFavoriteStatus }),
      });
    } catch (error) {
      console.error("Favorite sync hatası:", error);
    }
  }
}

// ───────────────────────────────────────────────────────────────
// 🔄 BEKLEYEN TÜM QUOTES'LARI SENKRONİZE ET
// ───────────────────────────────────────────────────────────────
/**
 * Pending (bekleyen) tüm quotes'ları sync et
 * Internet geldiğinde otomatik çağrılır
 */
export async function syncAllPendingQuotes(): Promise<void> {
  const pendingQuotes = await getPendingQuotes();

  console.log(`🔄 ${pendingQuotes.length} quote senkronize ediliyor...`);

  for (const quote of pendingQuotes) {
    await syncQuote(quote.id!);
  }

  console.log("✅ Tüm pending quotes senkronize edildi");
}
