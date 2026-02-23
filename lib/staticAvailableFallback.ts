import { CocktailRecipe } from '@/types/cocktailTypes';
import { getIngredientsFromCocktail, getRequiredOwnedIngredients, isIngredientAvailable } from './ingredientMatcher';

type StaticDataShape = {
  drinks?: CocktailRecipe[];
};

export const getAvailableFromStaticData = async (userAlcoholIngredients: string[]): Promise<CocktailRecipe[]> => {
  if (!userAlcoholIngredients.length) {
    return [];
  }

  try {
    const response = await fetch('/data.json', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as StaticDataShape;
    const drinks = Array.isArray(data?.drinks) ? data.drinks : [];

    return drinks.filter((drink) => {
      const ingredients = getIngredientsFromCocktail(drink as unknown as Record<string, unknown>);
      const required = getRequiredOwnedIngredients(ingredients);
      if (!required.length) return false;
      return required.every((ingredient) => isIngredientAvailable(ingredient, userAlcoholIngredients));
    });
  } catch {
    return [];
  }
};

