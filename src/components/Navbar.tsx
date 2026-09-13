'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Plus, Sun, Moon, Lock, LockOpen, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [theme, setTheme] = useState('dark');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Tema yükle
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
            document.body.setAttribute('data-theme', storedTheme);
        } else {
            setTheme('dark');
            document.body.setAttribute('data-theme', 'dark');
        }

        // Admin durumunu yükle
        setIsAdmin(!!localStorage.getItem('admin_token'));
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
    };

    const handleAdminLogin = () => {
        const password = prompt('Admin şifresi:');
        if (!password) return;

        localStorage.setItem('admin_token', password);
        setIsAdmin(true);

        // Diğer bileşenlerin (page.tsx vb.) haberi olsun
        window.dispatchEvent(new Event('storage'));
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('admin_token');
        setIsAdmin(false);

        // Diğer bileşenlerin haberi olsun
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="nav-logo">
                    <div className="nav-logo-icon">
                        <Book size={20} />
                    </div>
                    <span>Notlarım</span>
                </Link>

                <div className="nav-actions">
                    <Link href="/api-docs" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        📄 API
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className="btn-icon"
                        title={theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Admin Login / Logout */}
                    {isAdmin ? (
                        <button
                            onClick={handleAdminLogout}
                            className="btn-icon"
                            title="Admin Çıkışı"
                            style={{ color: '#22c55e' }}
                        >
                            <LogOut size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleAdminLogin}
                            className="btn-icon"
                            title="Admin Girişi"
                            style={{ opacity: 0.35 }}
                        >
                            <Lock size={16} />
                        </button>
                    )}

                    {/* Yeni Ekle — sadece admin görebilir */}
                    {isAdmin && (
                        pathname === '/add' ? (
                            <Link href="/" className="btn btn-ghost">
                                İptal
                            </Link>
                        ) : (
                            <Link href="/add" className="btn btn-primary">
                                <Plus size={18} />
                                <span>Yeni Ekle</span>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}
