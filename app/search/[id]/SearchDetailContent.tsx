'use client';

import { useInventory } from '@/hooks/useInventory';
import { isIgnoredIngredient, isIngredientAvailable } from '@/lib/ingredientMatcher';
import { convertToOzWithMl } from '@/lib/convertUtils';
import { CocktailSearchResponse } from '@/types/cocktailTypes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  initialData: CocktailSearchResponse | null;
  slug: string;
};

interface Ingredient {
  name: string;
  measure: string;
}

const SearchDetailContent = ({ initialData }: Props) => {
  const { items, isLoaded } = useInventory();
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    if (!initialData?.drinks?.[0]) return;

    const cocktail = initialData.drinks[0];
    const ingredientList: Ingredient[] = Array.from({ length: 15 }, (_, i) => i + 1)
      .map(index => ({
        name: cocktail[`strIngredient${index}` as keyof typeof cocktail] as string,
        measure: cocktail[`strMeasure${index}` as keyof typeof cocktail] as string,
      }))
      .filter(({ name }) => name);

    const filtered = ingredientList.filter(ing => !isIgnoredIngredient(ing.name));
    setFilteredIngredients(filtered);

    if (isLoaded) {
      const userIngredients = items.map(item => item.nameEn.toLowerCase());
      const count = filtered.filter(ing => 
        isIngredientAvailable(ing.name, userIngredients)
      ).length;
      setAvailableCount(count);
    }
  }, [initialData, items, isLoaded]);

  if (!initialData?.drinks?.length) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <div>칵테일 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  const cocktail = initialData.drinks[0];
  const userIngredientNames = items.map((item) => item.nameEn);

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '1rem',
        background: 'var(--card)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/search" className="btn btn-ghost" style={{ height: 'auto', padding: '0.5rem' }}>
          ← 뒤로
        </Link>
      </header>

      <main className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <img
            src={cocktail.strDrinkThumb}
            alt={cocktail.strDrink}
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
          />
          
          <div style={{ padding: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {cocktail.strDrink}
            </h1>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="badge badge-secondary">{cocktail.strCategory}</span>
              <span className="badge badge-secondary">{cocktail.strAlcoholic}</span>
              {cocktail.strIBA && <span className="badge badge-secondary">IBA: {cocktail.strIBA}</span>}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Glass</div>
                <div>{cocktail.strGlass}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</div>
                <div>{cocktail.strCategory}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                레시피
              </h2>
              <div className="card" style={{ padding: '1rem', background: 'var(--muted)' }}>
                <div style={{ whiteSpace: 'pre-line' }}>{cocktail.strInstructions}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                재료
              </h2>
              
              {isLoaded && filteredIngredients.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      보유 재료: {availableCount} / {filteredIngredients.length}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: availableCount === filteredIngredients.length ? 'var(--primary)' : '#fab005' }}>
                      {availableCount === filteredIngredients.length ? '✓ 제작 가능' : '⚠ 재료 부족'}
                    </span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                      background: availableCount === filteredIngredients.length ? '#22c55e' : '#fab005',
                      width: `${(availableCount / filteredIngredients.length) * 100}%`,
                      height: '100%',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredIngredients.map((ing, idx) => {
                  const isAvailable = isLoaded && isIngredientAvailable(ing.name, userIngredientNames);
                  return (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isAvailable ? '#22c55e' : 'var(--muted-foreground)'
                      }} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {ing.measure ? `${convertToOzWithMl(ing.measure)} ` : ''}
                        <span style={{ fontWeight: 500 }}>{ing.name}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchDetailContent;
