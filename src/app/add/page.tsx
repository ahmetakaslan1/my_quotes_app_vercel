'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddQuote() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);

    // Load last used author and category from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastAuthor = localStorage.getItem('last_used_author');
            const lastCategory = localStorage.getItem('last_used_category');

            if (lastAuthor) setAuthor(lastAuthor);
            if (lastCategory) setCategory(lastCategory);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);

        try {
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, author, category }),
            });

            if (res.ok) {
                // Save last used values to localStorage
                if (author.trim()) localStorage.setItem('last_used_author', author.trim());
                if (category.trim()) localStorage.setItem('last_used_category', category.trim());

                router.push('/');
                router.refresh();
            } else {
                alert('Kaydedilemedi!');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <Navbar />

            <div className="container" style={{ maxWidth: '700px', paddingTop: '2rem' }}>
                <Link href="/" className="btn btn-ghost" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                    <ArrowLeft size={18} /> Listeye Dön
                </Link>

                <div className="card">
                    <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <h1>Yeni Not Oluştur</h1>
                        <p>Aklına gelen fikirleri veya beğendiğin sözleri kaydet.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="label">Notun İçeriği <span style={{ color: 'var(--primary)' }}>*</span></label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                className="textarea"
                                placeholder="Buraya yazabilirsin..."
                                rows={6}
                            ></textarea>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="label">Yazar / Kaynak</label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="input"
                                    placeholder="Örn: Mevlana (son kullanılan hatırlanır)"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="label">Kategori</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input"
                                    placeholder="Örn: Motivasyon (son kullanılan hatırlanır)"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn btn-ghost"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !content.trim()}
                                className="btn btn-primary"
                                style={{ minWidth: '150px' }}
                            >
                                <Save size={18} />
                                {loading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
