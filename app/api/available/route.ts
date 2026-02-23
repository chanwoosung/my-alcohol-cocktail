import { cocktailDBClient } from '@/apis/client';
import { CocktailRecipe, CocktailSearchResponse } from '@/types/cocktailTypes';
import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
let staticCocktailsCache: CocktailRecipe[] | null = null;

const normalizeName = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');

const ALCOHOL_KEYWORDS = [
  'vodka',
  'gin',
  'rum',
  'whiskey',
  'whisky',
  'bourbon',
  'scotch',
  'brandy',
  'cognac',
  'tequila',
  'mezcal',
  'liqueur',
  'kahlua',
  'amaretto',
  'campari',
  'aperol',
  'vermouth',
  'wine',
  'champagne',
  'port',
  'sherry',
  'madeira',
  'beer',
  'pisco',
  'schnapps',
  'baileys',
  'drambuie',
  'fernet',
  'galliano',
  'cassis',
  'curacao',
  'cointreau',
  'grand marnier',
];

const IGNORED_INGREDIENTS = [
  'water',
  'ice',
  'cubed ice',
  'crushed ice',
  'ice cubes',
  'soda water',
  'tonic water',
  'cola',
  'sprite',
  '7-up',
  'soda',
  'soft drink',
  'lemon',
  'lime',
  'orange',
  'mint',
  'sugar',
  'salt',
  'cream',
  'egg',
  'egg white',
  'bitters',
  'cranberry juice',
  'orange juice',
  'pineapple juice',
  'grapefruit juice',
  'apple juice',
  'tomato juice',
];

const INGREDIENT_ALIAS_GROUPS: string[][] = [
  ['rum', 'white rum', 'light rum', 'dark rum', 'gold rum', 'spiced rum', 'coconut rum', 'vanilla rum'],
  ['whiskey', 'whisky', 'bourbon', 'scotch', 'irish whiskey', 'rye whiskey'],
  ['tequila', 'silver tequila', 'gold tequila', 'mezcal'],
  ['vermouth', 'dry vermouth', 'sweet vermouth'],
  ['orange liqueur', 'triple sec', 'cointreau', 'curacao', 'blue curacao', 'grand marnier'],
];

const normalizeIngredient = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[().,]/g, ' ')
    .replace(/\s+/g, ' ');

const isAlcoholIngredient = (name: string): boolean => {
  const normalized = normalizeIngredient(name);
  return ALCOHOL_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const isIgnoredIngredient = (name: string): boolean => {
  const normalized = normalizeIngredient(name);
  return IGNORED_INGREDIENTS.some((ignored) => normalized === ignored || normalized.includes(ignored));
};

const getIngredientsFromCocktail = (cocktail: Record<string, unknown>): string[] => {
  const ingredients: string[] = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = cocktail[`strIngredient${i}`];
    if (ingredient) {
      ingredients.push(normalizeIngredient(String(ingredient)));
    }
  }
  return ingredients;
};

const getAliasCandidates = (ingredient: string): Set<string> => {
  const candidates = new Set<string>([ingredient]);
  for (const group of INGREDIENT_ALIAS_GROUPS) {
    if (group.some((entry) => ingredient.includes(entry) || entry.includes(ingredient))) {
      group.forEach((entry) => candidates.add(entry));
    }
  }
  return candidates;
};

const isIngredientAvailable = (cocktailIngredient: string, userIngredients: string[]): boolean => {
  const normalizedUser = new Set(userIngredients.map(normalizeIngredient));
  const normalizedUserList = userIngredients.map(normalizeIngredient);
  const normalizedIngredient = normalizeIngredient(cocktailIngredient);
  const candidates = getAliasCandidates(normalizedIngredient);

  for (const candidate of candidates) {
    if (normalizedUser.has(candidate)) return true;
    if (normalizedUserList.some((owned) => owned.includes(candidate) || candidate.includes(owned))) {
      return true;
    }
  }
  return false;
};

const getRequiredOwnedIngredients = (ingredients: string[]): string[] =>
  ingredients.filter((ingredient) => !isIgnoredIngredient(ingredient) && isAlcoholIngredient(ingredient));

const mapCocktailRecipeRow = (row: Record<string, unknown>): CocktailRecipe => {
  const recipe: CocktailRecipe = {
    idDrink: String(row.iddrink || ''),
    strDrink: String(row.strdrink || ''),
    strDrinkAlternate: row.strdrinkalternate ? String(row.strdrinkalternate) : null,
    strTags: row.strtags ? String(row.strtags) : null,
    strVideo: row.strvideo ? String(row.strvideo) : null,
    strCategory: String(row.strcategory || ''),
    strIBA: row.striba ? String(row.striba) : null,
    strAlcoholic: String(row.stralcoholic || ''),
    strGlass: String(row.strglass || ''),
    strInstructions: String(row.strinstructions || ''),
    strInstructionsKR: row.strinstructionskr ? String(row.strinstructionskr) : null,
    strInstructionsES: row.strinstructionses ? String(row.strinstructionses) : null,
    strInstructionsDE: row.strinstructionsde ? String(row.strinstructionsde) : null,
    strInstructionsFR: row.strinstructionsfr ? String(row.strinstructionsfr) : null,
    strInstructionsIT: row.strinstructionsit ? String(row.strinstructionsit) : null,
    strInstructionsZH_HANS: row.strinstructionszh_hans ? String(row.strinstructionszh_hans) : null,
    strInstructionsZH_HANT: row.strinstructionszh_hant ? String(row.strinstructionszh_hant) : null,
    strDrinkThumb: String(row.strdrinkthumb || ''),
    strImageSource: row.strimagesource ? String(row.strimagesource) : null,
    strImageAttribution: row.strimageattribution ? String(row.strimageattribution) : null,
    strCreativeCommonsConfirmed: row.strcreativecommonsconfirmed ? String(row.strcreativecommonsconfirmed) : null,
    dateModified: row.datemodified ? String(row.datemodified) : null,
    strIngredient1: null,
    strIngredient2: null,
    strIngredient3: null,
    strIngredient4: null,
    strIngredient5: null,
    strIngredient6: null,
    strIngredient7: null,
    strIngredient8: null,
    strIngredient9: null,
    strIngredient10: null,
    strIngredient11: null,
    strIngredient12: null,
    strIngredient13: null,
    strIngredient14: null,
    strIngredient15: null,
    strMeasure1: null,
    strMeasure2: null,
    strMeasure3: null,
    strMeasure4: null,
    strMeasure5: null,
    strMeasure6: null,
    strMeasure7: null,
    strMeasure8: null,
    strMeasure9: null,
    strMeasure10: null,
    strMeasure11: null,
    strMeasure12: null,
    strMeasure13: null,
    strMeasure14: null,
    strMeasure15: null,
  };

  for (let i = 1; i <= 15; i++) {
    const ingredient = row[`stringredient${i}`];
    const measure = row[`strmeasure${i}`];
    recipe[`strIngredient${i}` as keyof CocktailRecipe] = ingredient ? String(ingredient) : null;
    recipe[`strMeasure${i}` as keyof CocktailRecipe] = measure ? String(measure) : null;
  }
  return recipe;
};

const getStaticCocktails = async (): Promise<CocktailRecipe[]> => {
  if (staticCocktailsCache) return staticCocktailsCache;
  try {
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    const raw = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    staticCocktailsCache = Array.isArray(parsed?.drinks) ? (parsed.drinks as CocktailRecipe[]) : [];
    return staticCocktailsCache;
  } catch (error) {
    console.error('Failed to read public/data.json:', error);
    staticCocktailsCache = [];
    return [];
  }
};

const fetchDbCocktails = async (): Promise<CocktailRecipe[]> => {
  if (!sql) return [];
  try {
    const rows = await sql`SELECT * FROM cocktailrecipe LIMIT 3000`;
    return rows.map((row) => mapCocktailRecipeRow(row as Record<string, unknown>));
  } catch (error) {
    console.error('Failed to fetch DB cocktails:', error);
    return [];
  }
};

const fetchCocktailDbLookup = async (idDrink: string): Promise<CocktailRecipe | null> => {
  try {
    const response = await cocktailDBClient.get<CocktailSearchResponse>('/lookup.php', {
      params: { i: idDrink },
    });
    return response.data?.drinks?.[0] || null;
  } catch (error) {
    console.error('Failed lookup from CocktailDB:', error);
    return null;
  }
};

const fetchExternalCocktailsByIngredients = async (ingredients: string[]): Promise<CocktailRecipe[]> => {
  const ids = new Set<string>();
  for (const ingredient of ingredients) {
    try {
      const response = await cocktailDBClient.get<{ drinks: Array<{ idDrink: string }> | null }>('/filter.php', {
        params: { i: ingredient },
      });
      const drinks = response.data?.drinks || [];
      drinks.forEach((drink) => {
        if (drink?.idDrink) ids.add(String(drink.idDrink));
      });
    } catch (error) {
      console.error(`Failed filter from CocktailDB for ${ingredient}:`, error);
    }
  }

  const lookupIds = Array.from(ids).slice(0, 120);
  const results = await Promise.all(lookupIds.map((idDrink) => fetchCocktailDbLookup(idDrink)));
  return results.filter((recipe): recipe is CocktailRecipe => recipe !== null);
};

const filterAvailableCocktails = (recipes: CocktailRecipe[], userAlcoholIngredients: string[]): CocktailRecipe[] => {
  return recipes.filter((recipe) => {
    const ingredients = getIngredientsFromCocktail(recipe as unknown as Record<string, unknown>);
    const required = getRequiredOwnedIngredients(ingredients);
    if (required.length === 0) return false;
    return required.every((ingredient) => isIngredientAvailable(ingredient, userAlcoholIngredients));
  });
};

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const ingredientsRaw = searchParams.get('ingredients');
  const ingredients = (ingredientsRaw || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (ingredients.length === 0) {
    return new Response(JSON.stringify({ drinks: [] }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  const userAlcoholIngredients = ingredients.filter((ingredient) => isAlcoholIngredient(ingredient));
  if (userAlcoholIngredients.length === 0) {
    return new Response(JSON.stringify({ drinks: [] }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  try {
    const [dbCocktails, staticCocktails, externalCocktails] = await Promise.all([
      fetchDbCocktails(),
      getStaticCocktails(),
      fetchExternalCocktailsByIngredients(userAlcoholIngredients),
    ]);

    const merged = [...dbCocktails, ...staticCocktails, ...externalCocktails];
    const dedupedByName = new Map<string, CocktailRecipe>();
    for (const recipe of merged) {
      const key = normalizeName(recipe.strDrink || '');
      if (!key || dedupedByName.has(key)) continue;
      dedupedByName.set(key, recipe);
    }

    const available = filterAvailableCocktails(Array.from(dedupedByName.values()), userAlcoholIngredients).slice(0, 300);
    return new Response(JSON.stringify({ drinks: available }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' },
      status: 200,
    });
  } catch (error) {
    console.error('Failed to build available cocktails:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch available cocktails', drinks: [] }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

