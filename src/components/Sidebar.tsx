'use client';

import { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import styles from './Sidebar.module.css';

interface Category {
    name: string;
    count: number;
}

interface SidebarStats {
    all: number;
    favorites: number;
    categories: Category[];
}

interface SidebarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onCollapseChange?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ selectedCategory, onCategoryChange, isOpen, onClose, onCollapseChange }: SidebarProps) {
    const [stats, setStats] = useState<SidebarStats>({ all: 0, favorites: 0, categories: [] });
    const [loading, setLoading] = useState(true);

    // Sidebar collapsed state
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar_collapsed');
            return saved !== null ? JSON.parse(saved) : false;
        }
        return false;
    });

    // Collapsible sections state with localStorage
    const [quickFiltersOpen, setQuickFiltersOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar_quickFilters_open');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    const [categoriesOpen, setCategoriesOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar_categories_open');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    useEffect(() => {
        fetchStats();
    }, []);

    // Save collapsed state to localStorage and notify parent
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
        }
        // Notify parent component about collapse state change
        if (onCollapseChange) {
            onCollapseChange(isCollapsed);
        }
    }, [isCollapsed, onCollapseChange]);

    // Save collapsible state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar_quickFilters_open', JSON.stringify(quickFiltersOpen));
        }
    }, [quickFiltersOpen]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar_categories_open', JSON.stringify(categoriesOpen));
        }
    }, [categoriesOpen]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category: string) => {
        onCategoryChange(category);
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`${styles.backdrop} ${isOpen ? styles.visible : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <h2>Kategoriler</h2>
                    <div className={styles.headerButtons}>
                        <button
                            className={styles.collapseBtn}
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            aria-label={isCollapsed ? "Genişlet" : "Daralt"}
                            title={isCollapsed ? "Sidebar'ı Genişlet" : "Sidebar'ı Daralt"}
                        >
                            {isCollapsed ? '»' : '«'}
                        </button>
                        <button className={styles.closeBtn} onClick={onClose} aria-label="Kapat">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Quick Filters */}
                <div className={styles.section}>
                    <button
                        className={styles.sectionHeader}
                        onClick={() => setQuickFiltersOpen(!quickFiltersOpen)}
                    >
                        <h3 className={styles.sectionTitle}>Hızlı Filtreler</h3>
                        <span className={`${styles.chevron} ${quickFiltersOpen ? styles.open : ''}`}>▼</span>
                    </button>

                    {quickFiltersOpen && (
                        <div className={styles.sectionContent}>
                            <button
                                className={`${styles.categoryItem} ${selectedCategory === 'all' ? styles.active : ''}`}
                                onClick={() => handleCategoryClick('all')}
                            >
                                <span className={styles.categoryIcon}>📊</span>
                                <span className={styles.categoryName}>Tümü</span>
                                <span className={styles.categoryCount}>{stats.all}</span>
                                {selectedCategory === 'all' && <ChevronRight className={styles.activeIcon} size={16} />}
                            </button>

                            <button
                                className={`${styles.categoryItem} ${selectedCategory === 'favorites' ? styles.active : ''}`}
                                onClick={() => handleCategoryClick('favorites')}
                            >
                                <span className={styles.categoryIcon}>⭐</span>
                                <span className={styles.categoryName}>Favoriler</span>
                                <span className={styles.categoryCount}>{stats.favorites}</span>
                                {selectedCategory === 'favorites' && <ChevronRight className={styles.activeIcon} size={16} />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Categories List */}
                <div className={styles.section}>
                    <button
                        className={styles.sectionHeader}
                        onClick={() => setCategoriesOpen(!categoriesOpen)}
                    >
                        <div className={styles.sectionTitleWrapper}>
                            <h3 className={styles.sectionTitle}>Kategoriler</h3>
                            <span className={styles.sectionCount}>{stats.categories.length}</span>
                        </div>
                        <span className={`${styles.chevron} ${categoriesOpen ? styles.open : ''}`}>▼</span>
                    </button>

                    {categoriesOpen && (
                        <div className={styles.sectionContent}>
                            {loading ? (
                                <div className={styles.loading}>Yükleniyor...</div>
                            ) : stats.categories.length === 0 ? (
                                <div className={styles.empty}>Henüz kategori yok</div>
                            ) : (
                                <div className={styles.categoriesList}>
                                    {stats.categories.map((cat) => (
                                        <button
                                            key={cat.name}
                                            className={`${styles.categoryItem} ${selectedCategory === cat.name ? styles.active : ''}`}
                                            onClick={() => handleCategoryClick(cat.name)}
                                        >
                                            <span className={styles.categoryIcon}>📂</span>
                                            <span className={styles.categoryName}>{cat.name}</span>
                                            <span className={styles.categoryCount}>{cat.count}</span>
                                            {selectedCategory === cat.name && <ChevronRight className={styles.activeIcon} size={16} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
