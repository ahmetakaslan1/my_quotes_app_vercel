'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Plus, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
            document.body.setAttribute('data-theme', storedTheme);
        } else {
            setTheme('dark');
            document.body.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
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
                    <button
                        onClick={toggleTheme}
                        className="btn-icon"
                        title={theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {pathname === '/add' ? (
                        <Link href="/" className="btn btn-ghost">
                            İptal
                        </Link>
                    ) : (
                        <Link href="/add" className="btn btn-primary">
                            <Plus size={18} />
                            <span>Yeni Ekle</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
