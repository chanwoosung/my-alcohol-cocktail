import { CocktailSearchResponse, CocktailFilterResponse } from '@/types/cocktailTypes';
import { client, cocktailDBClient } from './client';

export const fetchCocktails = async (searchValue: string | string[] | undefined) => {
  if (!searchValue || typeof searchValue === 'string' && searchValue.trim() === '') {
    console.log('Invalid searchValue:', searchValue);
    return [];
  }

  try {
    const { data } = await cocktailDBClient.get<CocktailSearchResponse>('/search.php', {
      params: { s: searchValue },
    });
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const fetchCocktailsByIngredient = async (ingredient: string) => {
  if (!ingredient || ingredient.trim() === '') {
    console.log('Invalid ingredient:', ingredient);
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
      cocktails.forEach((cocktail) => {
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
  if (!cocktailId || typeof cocktailId === 'string' && cocktailId.trim() === '') {
    console.log('Invalid searchValue:', cocktailId);
    return {};
  }

  try {
    const { data } = await client.get<CocktailSearchResponse>(`/api/search/${cocktailId}`);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {};
  }
};

export const fetchCocktailRecipe = async (cocktailId: string | string[] | undefined) => {
  if (!cocktailId || typeof cocktailId === 'string' && cocktailId.trim() === '') {
    console.log('Invalid searchValue:', cocktailId);
    return;
  }

  try {
    const { data } = await cocktailDBClient.get<CocktailSearchResponse>('/lookup.php', {
      params: { i: cocktailId },
    });
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return;
  }
};
