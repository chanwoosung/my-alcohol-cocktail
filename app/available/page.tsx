'use client';

import { client } from '@/apis/client';
import { searchLocalRecipes } from '@/data/localRecipes';
import { useInventory } from '@/hooks/useInventory';
import {
  getIngredientsFromCocktail,
  getRequiredOwnedIngredients,
  isAlcoholIngredient,
  isIngredientAvailable,
} from '@/lib/ingredientMatcher';
import { getAvailableFromStaticData } from '@/lib/staticAvailableFallback';
import { CocktailRecipe } from '@/types/cocktailTypes';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface CocktailWithIngredients {
  id: string;
  name: string;
  image: string;
  category: string;
  source: 'local' | 'api' | 'custom';
  ingredients?: string[];
}

const CACHE_KEY = 'availableCocktailsPageCache_v1';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const LEGACY_CACHE_PREFIXES = ['availableCocktailsCache_', 'availableCocktailsCache_v3_', 'homeAvailableCocktailsCache_'];

const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION && Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache error:', e);
  }
  return null;
};

const setCachedData = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.error('Cache set error:', e);
  }
};

const clearLegacyAvailableCaches = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (LEGACY_CACHE_PREFIXES.some(prefix => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Cache cleanup error:', e);
  }
};

export default function AvailablePage() {
  const { items, isLoaded } = useInventory();
  const [recipes, setRecipes] = useState<CocktailWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    clearLegacyAvailableCaches();

    const cacheKey = `${CACHE_KEY}_${items
      .map(i => i.id)
      .sort()
      .join('_')}`;
    const cached = getCachedData(cacheKey);
    const hasCached = Array.isArray(cached) && cached.length > 0;

    if (hasCached) {
      setRecipes(cached);
      setLoading(false);
      setError(null);
    }

    if (!hasCached) {
      setLoading(true);
    }
    setError(null);

    const userIngredients = items
      .map(item => (item.nameEn || item.name || '').toLowerCase().trim())
      .filter(Boolean);
    const userAlcoholIngredients = userIngredients.filter(ingredient => isAlcoholIngredient(ingredient));
    try {
      const localRecipes = searchLocalRecipes(userIngredients).map(recipe => ({
        id: recipe.idDrink,
        name: recipe.strDrink,
        image: recipe.strDrinkThumb,
        category: recipe.strCategory || 'Local',
        ingredients: getIngredientsFromCocktail(recipe as unknown as Record<string, unknown>),
      }));

      const availableLocal = localRecipes.filter(cocktail => {
        const required = getRequiredOwnedIngredients(cocktail.ingredients);
        if (required.length === 0) return false;
        return required.every(ing => isIngredientAvailable(ing, userAlcoholIngredients));
      });

      const customData = localStorage.getItem('customRecipes');
      let customRecipes: (CocktailWithIngredients & { ingredients: string[] })[] = [];
      if (customData) {
        try {
          const parsed = JSON.parse(customData);
          customRecipes = parsed.map(
            (r: { id: string; name: string; image: string; ingredients: { name: string }[] }) => ({
              id: r.id,
              name: r.name,
              image: r.image,
              category: 'Custom',
              ingredients: r.ingredients?.map((i: { name: string }) => i.name.toLowerCase()) || [],
            }),
          );
        } catch (error) {
          console.error('Failed to parse custom recipes:', error);
        }
      }

      const availableCustom = customRecipes.filter(cocktail => {
        const required = getRequiredOwnedIngredients(cocktail.ingredients);
        if (required.length === 0) return false;
        return required.every(ing => isIngredientAvailable(ing, userAlcoholIngredients));
      });

      let apiRecipes: CocktailWithIngredients[] = [];
      if (userAlcoholIngredients.length > 0) {
        let drinks: CocktailRecipe[] = [];
        try {
          const response = await client.get<{ drinks: CocktailRecipe[] }>('/api/available', {
            params: {
              ingredients: userAlcoholIngredients.join(','),
            },
            timeout: 5000,
          });
          drinks = response.data?.drinks || [];
        } catch (apiError) {
          console.error('Failed to fetch /api/available:', apiError);
        }

        if (drinks.length === 0) {
          drinks = await getAvailableFromStaticData(userAlcoholIngredients);
        }

        apiRecipes = drinks
          .map(drink => ({
            id: drink.idDrink,
            name: drink.strDrink,
            image: drink.strDrinkThumb,
            category: drink.strCategory || 'API',
            source: 'api' as const,
            ingredients: getIngredientsFromCocktail(drink as unknown as Record<string, unknown>),
          }))
          .filter(cocktail => {
            const required = getRequiredOwnedIngredients(cocktail.ingredients);
            if (required.length === 0) return false;
            return required.every(ing => isIngredientAvailable(ing, userAlcoholIngredients));
          });
      }
      console.log(apiRecipes);
      const allRecipes = [
        ...availableLocal.map(r => ({ ...r, source: 'local' as const })),
        ...availableCustom.map(r => ({ ...r, source: 'custom' as const })),
        ...apiRecipes.map(r => ({ ...r, source: 'api' as const })),
      ];

      const unique = Array.from(new Map(allRecipes.map(c => [c.id, c])).values());

      if (unique.length > 0) {
        setCachedData(cacheKey, unique);
      }
      setRecipes(unique);
    } catch (error) {
      console.error('Failed to load available cocktails:', error);
      if (!hasCached) {
        setRecipes([]);
      }
      setError('칵테일 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    if (!isLoaded) return;
    loadRecipes();
  }, [isLoaded, loadRecipes]);

  const getSourceLabel = (source: 'local' | 'api' | 'custom') => {
    switch (source) {
      case 'local':
        return '로컬';
      case 'custom':
        return '내 레시피';
      case 'api':
        return 'API';
    }
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-muted">칵테일 레시피 가져오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem 1rem',
          background: 'var(--card)',
        }}>
        <div className="container">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>제작 가능한 칵테일</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            가지고 있는 술로 만들 수 있는 칵테일 목록입니다
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              보유:
            </span>
            {items.length > 0 ? (
              items.map(item => (
                <span key={item.id} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                  {item.name}
                </span>
              ))
            ) : (
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                없음
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '1.5rem 1rem' }}>
        {items.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>재료를 추가해주세요</div>
            <p className="text-muted">소유한 술을 추가하면 제작 가능한 칵테일을 보여드려요</p>
            <Link href="/inventory" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              술 추가하러 가기
            </Link>
          </div>
        ) : recipes.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>제작 가능한 칵테일이 없습니다</div>
            <p className="text-muted">{error || '재료를 더 추가해보세요'}</p>
            <Link href="/inventory" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              술 추가하러 가기
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              총 {recipes.length}개의 칵테일을 만들 수 있습니다
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {recipes.map(recipe => (
                <Link key={recipe.id} href={`/search/${recipe.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}>
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        {recipe.name}
                      </div>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {getSourceLabel(recipe.source)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
