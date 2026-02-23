import { CocktailFilterResponse, CocktailSearchResponse } from '@/types/cocktailTypes';
import { client, cocktailDBClient } from './client';

export const fetchCocktails = async (
  searchValue: string | string[] | undefined,
): Promise<CocktailSearchResponse | null> => {
  if (!searchValue || (typeof searchValue === 'string' && searchValue.trim() === '')) {
    return null;
  }

  try {
    const strValue = Array.isArray(searchValue) ? searchValue[0] : searchValue;
    const { data } = await client.get<CocktailSearchResponse>(`/api/search/${encodeURIComponent(strValue)}`);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const fetchCocktailsByIngredient = async (ingredient: string) => {
  if (!ingredient || ingredient.trim() === '') {
    return [];
  }

  try {
    const { data } = await cocktailDBClient.get<CocktailFilterResponse>('/filter.php', {
      params: { i: ingredient },
    });
    return data.drinks || [];
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const fetchCocktailsByMultipleIngredients = async (ingredients: string[]) => {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }

  try {
    const allCocktails: Map<string, { idDrink: string; strDrink: string; strDrinkThumb: string }> = new Map();

    for (const ingredient of ingredients) {
      const cocktails = await fetchCocktailsByIngredient(ingredient);
      if (!cocktails || !Array.isArray(cocktails)) continue;
      
      cocktails.forEach(cocktail => {
        if (allCocktails.has(cocktail.idDrink)) {
          const existing = allCocktails.get(cocktail.idDrink)!;
          existing.strDrink += ` (${ingredient})`;
        } else {
          allCocktails.set(cocktail.idDrink, cocktail);
        }
      });
    }

    return Array.from(allCocktails.values());
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const getCocktailRecipe = async (cocktailId: string | string[] | undefined) => {
  if (!cocktailId || (typeof cocktailId === 'string' && cocktailId.trim() === '')) {
    return null;
  }

  try {
    const strId = Array.isArray(cocktailId) ? cocktailId[0] : cocktailId;
    const { data } = await client.get<CocktailSearchResponse>(`/api/search/${encodeURIComponent(strId)}`);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const fetchCocktailRecipe = async (
  cocktailId: string | string[] | undefined,
): Promise<CocktailSearchResponse | null> => {
  if (!cocktailId || (typeof cocktailId === 'string' && cocktailId.trim() === '')) {
    return null;
  }

  try {
    const strId = Array.isArray(cocktailId) ? cocktailId[0] : cocktailId;
    const { data } = await client.get<CocktailSearchResponse>(`/api/search/${encodeURIComponent(strId)}`);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};
