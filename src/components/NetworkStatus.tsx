'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { getPendingCount } from '@/lib/db';
import styles from './NetworkStatus.module.css';

export default function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Initial state
        setIsOnline(navigator.onLine);

        // Online/Offline listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Pending count tracker - her 5 saniyede güncelle
        const updatePendingCount = async () => {
            try {
                const count = await getPendingCount();
                setPendingCount(count);
            } catch (error) {
                console.error('Pending count hatası:', error);
            }
        };

        updatePendingCount(); // İlk yükleme
        const interval = setInterval(updatePendingCount, 5000); // Her 5 saniye

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className={styles.networkStatus}>
            {isOnline ? (
                <Wifi className={styles.online} size={20} />
            ) : (
                <WifiOff className={styles.offline} size={20} />
            )}
            {pendingCount > 0 && (
                <span className={styles.badge}>{pendingCount}</span>
            )}
        </div>
    );
}
