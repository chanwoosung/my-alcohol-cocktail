import { CocktailSearchResponse } from '@/types/cocktailTypes';
import { client } from './client';

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
