import { CocktailSearchResponse } from '@/types/cocktailTypes';
import { cocktailDBClient } from './client';

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
