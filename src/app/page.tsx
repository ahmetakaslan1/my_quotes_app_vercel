'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import QuoteCard from '@/components/QuoteCard';
import NetworkStatus from '@/components/NetworkStatus';
import { Search, Filter, CheckSquare, Trash, X, Menu } from 'lucide-react';
import {
  getAllQuotesOffline,
  toggleFavoriteOffline,
  deleteQuoteOffline
} from '@/lib/offline-service';
import { LocalQuote } from '@/lib/db';

export default function Home() {
  const [quotes, setQuotes] = useState<LocalQuote[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Offline-first: IndexedDB + Network
  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const allQuotes = await getAllQuotesOffline();
      setQuotes(allQuotes);
    } catch (error) {
      console.error('Quote yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Online olunca refresh et (sync için)
    const handleOnline = () => fetchQuotes();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Client-side filtering - Tüm filtreler birlikte çalışır
  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    // 1. Kategori filtresi
    if (selectedCategory !== 'all' && selectedCategory !== 'favorites') {
      result = result.filter(q => q.category === selectedCategory);
    }

    // 2. Favoriler filtresi
    if (filter === 'favorites' || selectedCategory === 'favorites') {
      result = result.filter(q => q.isFavorite);
    }

    // 3. Search filtresi
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(q =>
        q.content.toLowerCase().includes(searchLower) ||
        q.author?.toLowerCase().includes(searchLower) ||
        q.category?.toLowerCase().includes(searchLower)
      );
    }

    // 4. Sort
    if (sort === 'newest') {
      result.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === 'oldest') {
      result.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sort === 'alphabetical') {
      result.sort((a, b) => a.content.localeCompare(b.content));
    }

    return result;
  }, [quotes, selectedCategory, filter, search, sort]);

  // Offline-first favorite toggle
  const toggleFavorite = async (id: number, currentStatus: boolean) => {
    // Optimistic UI update
    setQuotes(quotes.map(q => q.id === id ? { ...q, isFavorite: !currentStatus } : q));

    try {
      await toggleFavoriteOffline(id, false); // local ID
    } catch (error) {
      console.error('Favori güncelleme hatası:', error);
      fetchQuotes(); // Hata varsa geri yükle
    }
  };

  // Offline-first delete
  const deleteQuote = async (id: number) => {
    if (!confirm('Bu sözü silmek istediğinize emin misiniz?')) return;

    // Optimistic UI update
    setQuotes(quotes.filter(q => q.id !== id));

    try {
      await deleteQuoteOffline(id, false); // local ID
      await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Silme işlemi başarısız', error);
      fetchQuotes();
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  };

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} adet sözü silmek istediğinize emin misiniz?`)) return;

    const prevQuotes = [...quotes];
    setQuotes(quotes.filter(q => q.id && !selectedIds.includes(q.id)));

    try {
      for (const id of selectedIds) {
        await deleteQuoteOffline(id, false);
      }

      setIsSelectionMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error('Toplu silme hatası:', error);
      setQuotes(prevQuotes);
    }
  };

  return (
    <>
      <Navbar />

      {/* Hamburger Button (Mobile only) */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Menüyü Aç"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="container">
          <div className="page-header">
            <div className="page-title-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h1>Kütüphanem</h1>
                <p>Kaydettiğin tüm ilham verici sözler ve notlar burada.</p>
              </div>
              <NetworkStatus />
            </div>

            <div>
              {!isSelectionMode ? (
                <button onClick={toggleSelectionMode} className="btn btn-ghost">
                  <CheckSquare size={18} /> Seç
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={toggleSelectionMode} className="btn btn-ghost">
                    <X size={18} /> İptal
                  </button>
                  <button
                    onClick={deleteSelected}
                    disabled={selectedIds.length === 0}
                    className="btn btn-danger"
                  >
                    <Trash size={18} /> Sil ({selectedIds.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isSelectionMode && (
            <div className="controls-panel">
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Notlarda veya yazarlarda ara..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="controls-group">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="select"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="alphabetical">A-Z Sıralı</option>
                </select>

                <button
                  onClick={() => setFilter(filter === 'all' ? 'favorites' : 'all')}
                  className={`btn ${filter === 'favorites' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <Filter size={18} />
                  {filter === 'favorites' ? 'Tümü' : 'Favoriler'}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <p>Veriler yükleniyor...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h2>Henüz bir şey yok</h2>
              <p>Kütüphanen boş görünüyor. Hemen ilk notunu ekle!</p>
            </div>
          ) : (
            <div className="quotes-grid">
              {filteredQuotes
                .filter((q: LocalQuote) => q.id !== undefined)
                .map((quote: LocalQuote) => (
                  <QuoteCard
                    key={quote.id!}
                    id={quote.id!}
                    content={quote.content}
                    author={quote.author}
                    category={quote.category}
                    isFavorite={quote.isFavorite}
                    onToggleFavorite={toggleFavorite}
                    onDelete={deleteQuote}
                    selectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(quote.id!)}
                    onSelect={handleSelect}
                  />
                ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
