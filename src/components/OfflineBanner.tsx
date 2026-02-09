// ═══════════════════════════════════════════════════════════════
// 🎯 AMAÇ: Offline/Online durumunu kullanıcıya göster
// ═══════════════════════════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';
import styles from './OfflineBanner.module.css';

export default function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // İlk durum
        setIsOnline(navigator.onLine);

        // ──────────────────────────────────────────────────────────
        // 📶 Online/Offline event listeners
        // ──────────────────────────────────────────────────────────
        const handleOnline = () => {
            setIsOnline(true);
            setShowBanner(true);

            // 3 saniye sonra banner'ı gizle
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Banner gösterilmiyorsa render etme
    if (!showBanner) return null;

    return (
        <div className={`${styles.banner} ${isOnline ? styles.online : styles.offline}`}>
            {isOnline ? (
                <>
                    <span className={styles.icon}>✅</span>
                    <span className={styles.text}>İnternete bağlandınız - Senkronize ediliyor...</span>
                </>
            ) : (
                <>
                    <span className={styles.icon}>📴</span>
                    <span className={styles.text}>Offline Modu - Değişiklikler internet gelince senkronize edilecek</span>
                </>
            )}
        </div>
    );
}
