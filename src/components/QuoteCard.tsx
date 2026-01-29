'use client';

import { Heart, Trash2, Copy, Quote, Edit } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuoteProps {
    id: number;
    content: string;
    author: string | null;
    category: string | null;
    isFavorite: boolean;
    onToggleFavorite: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number) => void;
    selectionMode: boolean;
    isSelected?: boolean;
    onSelect?: (id: number) => void;
}

export default function QuoteCard({
    id, content, author, category, isFavorite,
    onToggleFavorite, onDelete,
    selectionMode, isSelected, onSelect
}: QuoteProps) {
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`"${content}" — ${author || 'Bilinmiyor'}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/edit/${id}`);
    };

    const handleClick = () => {
        if (selectionMode && onSelect) {
            onSelect(id);
        }
    };

    return (
        <div
            className={`card ${isSelected ? 'selected' : ''}`}
            onClick={handleClick}
            style={{ cursor: selectionMode ? 'pointer' : 'default' }}
        >
            {selectionMode && (
                <div
                    className={`card-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onSelect && onSelect(id); }}
                >
                    {isSelected && '✓'}
                </div>
            )}

            <div className="card-header">
                <div className={`card-icon ${isFavorite ? 'favorite' : ''}`}>
                    <Quote size={18} />
                </div>

                {!selectionMode && (
                    <div className="card-actions">
                        <button onClick={handleEdit} className="btn-icon" title="Düzenle">
                            <Edit size={16} />
                        </button>
                        <button onClick={handleCopy} className="btn-icon" title="Kopyala">
                            <Copy size={16} className={copied ? 'text-green-500' : ''} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                            className="btn-icon"
                            title="Sil"
                            style={{ color: copied ? '' : '#dc2626' }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="card-content">
                {content}
            </div>

            <div className="card-footer">
                <div className="card-meta">
                    <div className="card-author">{author || 'Bilinmeyen Yazar'}</div>
                    {category && <span className="card-category">#{category}</span>}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(id, isFavorite); }}
                    className="btn-icon"
                    title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    style={{ color: isFavorite ? '#ec4899' : undefined }}
                >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
            </div>
        </div>
    );
}
