'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import QuoteCard from '@/components/QuoteCard';
import { Search, Filter, CheckSquare, Trash, X, Menu } from 'lucide-react';

interface Quote {
  id: number;
  content: string;
  author: string | null;
  category: string | null;
  isFavorite: boolean;
  createdAt: string;
}

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
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

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sort });

      // Add category filter if not 'all'
      if (selectedCategory !== 'all' && selectedCategory !== 'favorites') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/quotes?${params}`);
      const data = await res.json();
      setQuotes(data);
    } catch (error) {
      console.error('Notlar yüklenirken hata oluştu', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sort, selectedCategory]);

  const toggleFavorite = async (id: number, currentStatus: boolean) => {
    setQuotes(quotes.map(q => q.id === id ? { ...q, isFavorite: !currentStatus } : q));
    try {
      await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentStatus }),
      });
    } catch (error) {
      console.error('Favori güncellenemedi', error);
      fetchQuotes();
    }
  };

  const deleteQuote = async (id: number) => {
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    setQuotes(quotes.filter(q => q.id !== id));
    try {
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
    if (!confirm(`${selectedIds.length} adet notu silmek istediğinize emin misiniz?`)) return;

    const prevQuotes = [...quotes];
    setQuotes(quotes.filter(q => !selectedIds.includes(q.id)));

    try {
      const res = await fetch('/api/quotes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error('Failed');

      setIsSelectionMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error('Çoklu silme hatası', error);
      alert('Silme işleminde hata oluştu');
      setQuotes(prevQuotes);
    }
  };

  const displayedQuotes = selectedCategory === 'favorites'
    ? quotes.filter(q => q.isFavorite)
    : quotes;

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
            <div className="page-title-section">
              <h1>Kütüphanem</h1>
              <p>Kaydettiğin tüm ilham verici sözler ve notlar burada.</p>
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
          ) : displayedQuotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h2>Henüz bir şey yok</h2>
              <p>Kütüphanen boş görünüyor. Hemen ilk notunu ekle!</p>
            </div>
          ) : (
            <div className="quotes-grid">
              {displayedQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  {...quote}
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteQuote}
                  selectionMode={isSelectionMode}
                  isSelected={selectedIds.includes(quote.id)}
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
