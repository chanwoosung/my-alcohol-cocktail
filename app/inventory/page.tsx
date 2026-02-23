'use client';

import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { alcoholCategoryMappedKorean } from '@/constants/ingredient';
import Link from 'next/link';

interface IngredientOption {
  name: string;
  nameEn: string;
}

const allIngredients: IngredientOption[] = Object.entries(alcoholCategoryMappedKorean).map(([korean, english]) => ({
  name: korean,
  nameEn: english,
}));

export default function InventoryPage() {
  const { items, addItem, removeItem, clearAll, isLoaded } = useInventory();
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = allIngredients.filter((option) =>
    option.name.toLowerCase().includes(searchText.toLowerCase()) ||
    option.nameEn.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = (ingredient: IngredientOption) => {
    addItem({
      id: Date.now().toString(),
      name: ingredient.name,
      nameEn: ingredient.nameEn,
      category: 'base',
    });
    setSearchText('');
    setShowDropdown(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '2rem 1rem',
        background: 'var(--card)',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            내 술 관리
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            가지고 있는 술을 추가하거나 관리하세요
          </p>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
            술/재료 검색
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="보드카, 진, 럼..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="input"
            />
            {showDropdown && searchText && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                maxHeight: '240px',
                overflowY: 'auto',
                zIndex: 50,
                boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
              }}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.slice(0, 8).map((option) => (
                    <div
                      key={option.name}
                      onClick={() => handleAdd(option)}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>{option.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{option.nameEn}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '0.75rem 1rem' }}>
                    <div className="text-muted">결과 없음</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600 }}>내 술 목록 ({items.length}개)</span>
            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', color: 'var(--destructive)', height: 'auto', padding: '0.25rem 0.5rem' }}
              >
                전체 삭제
              </button>
            )}
          </div>
          
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍾</div>
              <p className="text-muted">아직 가지고 있는 술이 없습니다</p>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>위에서 검색하여 추가해주세요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {items.map((item) => (
                <span
                  key={item.id}
                  className="badge badge-secondary"
                  style={{ 
                    padding: '0.5rem 0.75rem', 
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => removeItem(item.id)}
                  title="클릭하여 삭제"
                >
                  {item.name} ×
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Link href="/available" className="btn btn-outline">
            제작 가능한 칵테일 보기
          </Link>
          <Link href="/" className="btn btn-ghost">
            홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}
