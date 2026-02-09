// ═══════════════════════════════════════════════════════════════
// 🎯 AMAÇ: Offline-first quote storage için IndexedDB database
// ═══════════════════════════════════════════════════════════════
// Bu dosya tarayıcıda local database oluşturur.
// Internet kesilse bile quotes burada saklanır ve görüntülenir.

"use client";

import Dexie, { Table } from "dexie";

// ───────────────────────────────────────────────────────────────
// 📋 Quote Interface - Hem local hem server ID'leri tutar
// ───────────────────────────────────────────────────────────────
export interface LocalQuote {
  id?: number; // IndexedDB local ID (otomatik artan)
  serverId?: number | null; // PostgreSQL server ID (sync olduktan sonra gelir)
  content: string; // Söz içeriği
  author: string; // Yazar/kaynak
  category: string; // Kategori
  isFavorite: boolean; // Favori mi?
  createdAt: Date; // Oluşturulma zamanı

  // ⭐️ Sync durumları (Offline-first için kritik!)
  synced: boolean; // Server'a gönderildi mi? (true = evet, false = henüz değil)
  pending: boolean; // Senkronizasyon bekliyor mu? (true = bekliyor)
}

// ───────────────────────────────────────────────────────────────
// 🗄️ QuotesDatabase Class - Dexie database yönetimi
// ───────────────────────────────────────────────────────────────
class QuotesDatabase extends Dexie {
  // Table tanımı - TypeScript type safety için
  quotes!: Table<LocalQuote>;

  constructor() {
    // Database ismi: QuotesDB (tarayıcıda bu isimle saklanır)
    super("QuotesDB");

    // ───────────────────────────────────────────────────────────
    // Schema Version 1 - İlk versiyon
    // ───────────────────────────────────────────────────────────
    this.version(1).stores({
      // quotes table schema
      quotes:
        "++id, serverId, synced, pending, createdAt, category, isFavorite",
      //      ^^^^
      //      └─ ++ = Auto-increment (otomatik artan ID)
      //
      // Index'ler:
      // - id: Primary key (otomatik)
      // - serverId: Server ID'sine göre arama
      // - synced: Sync edilenleri filtrele
      // - pending: Bekleyenleri bul
      // - createdAt: Tarihe göre sırala
      // - category: Kategoriye göre filtrele
      // - isFavorite: Favorileri filtrele
    });
  }
}

// ───────────────────────────────────────────────────────────────
// 🚀 Database Instance - Export et, her yerden kullan
// ───────────────────────────────────────────────────────────────
// Singleton pattern: Tek bir database instance tüm uygulama için
export const db = new QuotesDatabase();

// ───────────────────────────────────────────────────────────────
// 🔧 Yardımcı Fonksiyonlar
// ───────────────────────────────────────────────────────────────

/**
 * Tüm pending (bekleyen) quotes'ları al
 * @returns Senkronize edilmemiş quotes listesi
 */
export async function getPendingQuotes(): Promise<LocalQuote[]> {
  // Boolean indexing Dexie'de .equals() ile çalışmaz
  // .filter() kullanmalıyız
  return await db.quotes.filter((q) => q.pending === true).toArray();
}

/**
 * Pending quotes sayısını al
 * @returns Bekleyen quote sayısı
 */
export async function getPendingCount(): Promise<number> {
  return await db.quotes.filter((q) => q.pending === true).count();
}

/**
 * Server ID'sine göre local quote bul
 * @param serverId PostgreSQL server ID
 * @returns Local quote veya undefined
 */
export async function findByServerId(
  serverId: number,
): Promise<LocalQuote | undefined> {
  return await db.quotes.where("serverId").equals(serverId).first(); // İlk sonucu al (unique olmalı)
}

/**
 * Database'i temizle (dikkatli kullan!)
 * Test veya reset için kullanılır
 */
export async function clearDatabase(): Promise<void> {
  await db.quotes.clear();
  console.log("🗑️ Database temizlendi");
}
