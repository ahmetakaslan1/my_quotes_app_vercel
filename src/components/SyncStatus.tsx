// ═══════════════════════════════════════════════════════════════
// 🎯 AMAÇ: Pending (bekleyen) sync sayısını göster
// ═══════════════════════════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';
import { getPendingCount } from '@/lib/db';
import { syncAllPendingQuotes } from '@/lib/offline-service';
import styles from './SyncStatus.module.css';

export default function SyncStatus() {
    const [pendingCount, setPendingCount] = useState(0);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        // İlk yüklemede pending count'u al
        updatePendingCount();

        // ──────────────────────────────────────────────────────────
        // 🔄 Periyodik güncelleme (5 saniyede bir kontrol et)
        // ──────────────────────────────────────────────────────────
        const interval = setInterval(updatePendingCount, 5000);

        // ──────────────────────────────────────────────────────────
        // 📶 Online olunca otomatik sync
        // ──────────────────────────────────────────────────────────
        const handleOnline = () => {
            console.log('✅ İnternet geldi - Otomatik sync başlatılıyor');
            handleSync();
        };

        window.addEventListener('online', handleOnline);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    async function updatePendingCount() {
        const count = await getPendingCount();
        setPendingCount(count);
    }

    async function handleSync() {
        if (!navigator.onLine) {
            alert('❌ İnternet bağlantınız yok');
            return;
        }

        setSyncing(true);

        try {
            await syncAllPendingQuotes();
            await updatePendingCount(); // Güncellenen count'u al
            console.log('✅ Senkronizasyon tamamlandı');
        } catch (error) {
            console.error('❌ Senkronizasyon hatası:', error);
            alert('Senkronizasyon sırasında hata oluştu');
        } finally {
            setSyncing(false);
        }
    }

    // Pending yoksa gösterme
    if (pendingCount === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.badge}>
                <span className={styles.icon}>⏳</span>
                <span className={styles.count}>{pendingCount}</span>
                <span className={styles.text}>senkronizasyon bekliyor</span>
            </div>

            {navigator.onLine && (
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className={styles.syncBtn}
                >
                    {syncing ? '🔄 Gönderiliyor...' : '📤 Şimdi Gönder'}
                </button>
            )}
        </div>
    );
}
