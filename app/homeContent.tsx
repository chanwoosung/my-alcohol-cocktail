'use client';

import { client } from '@/apis/client';
import { searchLocalRecipes } from '@/data/localRecipes';
import { useInventory } from '@/hooks/useInventory';
import { getIngredientsFromCocktail, getRequiredOwnedIngredients, isAlcoholIngredient, isIngredientAvailable } from '@/lib/ingredientMatcher';
import { getAvailableFromStaticData } from '@/lib/staticAvailableFallback';
import { CocktailRecipe } from '@/types/cocktailTypes';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

interface CocktailWithIngredients {
  id: string;
  name: string;
  image: string;
  ingredients: string[];
}

const CACHE_KEY = 'availableCocktailsCache_v3';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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

export default function HomeContent() {
  const { items, isLoaded } = useInventory();
  const [recipes, setRecipes] = useState<CocktailWithIngredients[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecipes = useCallback(async () => {
    const cacheKey = `${CACHE_KEY}_${items.map(i => i.id).sort().join('_')}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      setRecipes(cached);
      return;
    }

    setLoading(true);

    const userIngredients = items
      .map(item => (item.nameEn || item.name || '').toLowerCase().trim())
      .filter(Boolean);
    const userAlcoholIngredients = userIngredients.filter((ingredient) => isAlcoholIngredient(ingredient));

    try {
      const localRecipes = searchLocalRecipes(userIngredients)
        .map(recipe => ({
          id: recipe.idDrink,
          name: recipe.strDrink,
          image: recipe.strDrinkThumb,
          ingredients: getIngredientsFromCocktail(recipe as unknown as Record<string, unknown>),
        }));

      const availableLocal = localRecipes.filter(cocktail => {
        const required = getRequiredOwnedIngredients(cocktail.ingredients);
        if (required.length === 0) return false;
        return required.every(ing => isIngredientAvailable(ing, userAlcoholIngredients));
      });

      const customData = localStorage.getItem('customRecipes');
      let customRecipes: CocktailWithIngredients[] = [];
      if (customData) {
        try {
          const parsed = JSON.parse(customData);
          customRecipes = parsed.map((r: { id: string; name: string; image: string; ingredients: { name: string }[] }) => ({
            id: r.id,
            name: r.name,
            image: r.image,
            ingredients: r.ingredients?.map((i: { name: string }) => i.name.toLowerCase()) || [],
          }));
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
          .map((drink) => ({
            id: drink.idDrink,
            name: drink.strDrink,
            image: drink.strDrinkThumb,
            ingredients: getIngredientsFromCocktail(drink as unknown as Record<string, unknown>),
          }))
          .filter((cocktail) => {
            const required = getRequiredOwnedIngredients(cocktail.ingredients);
            if (required.length === 0) return false;
            return required.every((ing) => isIngredientAvailable(ing, userAlcoholIngredients));
          });
      }

      const combined = [...availableLocal, ...availableCustom, ...apiRecipes];
      const unique = Array.from(new Map(combined.map(c => [c.id, c])).values());

      const result = unique.slice(0, 4);
      if (result.length > 0) {
        setCachedData(cacheKey, result);
      }
      setRecipes(result);
    } catch (error) {
      console.error('Failed to load home cocktails:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    if (!isLoaded) return;
    loadRecipes();
  }, [isLoaded, loadRecipes]);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-muted">칵테일 레시피 가져오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <section style={{
        padding: '4rem 1rem 3rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--muted) 0%, var(--background) 100%)',
      }}>
        <div className="container">
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            borderRadius: '16px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '2.5rem' }}>🍸</span>
          </div>
          
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
            My Cocktail Book
          </h1>
          <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            나만의 칵테일 레시피를 찾아보세요
          </p>
          
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/inventory" className="btn btn-primary" style={{ minWidth: '140px' }}>
              🍾 내 술 관리
            </Link>
            <Link href="/search" className="btn btn-outline" style={{ minWidth: '140px' }}>
              🔍 칵테일 검색
            </Link>
          </div>
        </div>
      </section>

      <main className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <Link href="/available" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✓</span>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>제작 가능한 칵테일</h2>
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                가지고 있는 재료로 만들 수 있는 모든 칵테일
              </p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {items.length}개 재료
              </div>
            </div>
          </Link>
          
          <Link href="/recipes" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>내 레시피</h2>
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                커스텀 레시피를 추가하고 관리하기
              </p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                직접 만들기
              </div>
            </div>
          </Link>
        </div>

        {items.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                내 술로 만들 수 있는 칵테일
              </h3>
              <Link href="/available" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                전체 보기 →
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="text-muted">칵테일 레시피 가져오는 중...</div>
              </div>
            ) : recipes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {recipes.map(recipe => (
                  <Link
                    key={recipe.id}
                    href={`/search/${recipe.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}>
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '0.625rem' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem', marginBottom: '0.25rem', lineClamp: 1 }}>
                          {recipe.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <p className="text-muted">
                  만들 수 있는 칵테일이 없습니다. 재료를 더 추가해보세요.
                </p>
              </div>
            )}
          </section>
        )}

        {items.length === 0 && (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍸</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              시작해보세요!
            </h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              가지고 있는 술을 추가하면<br /> 만들 수 있는 칵테일을 추천해드려요
            </p>
            <Link href="/inventory" className="btn btn-primary">
              술 추가하러 가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
