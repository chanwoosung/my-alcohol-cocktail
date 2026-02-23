import { cocktailDBClient, cocktailNinjasClient } from '@/apis/client';
import { localCocktailRecipes } from '@/data/localRecipes';
import { CocktailRecipe, CocktailSearchResponse } from '@/types/cocktailTypes';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const API_NINJAS_KEY = process.env.API_NINJAS_KEY;
const NINJA_ID_PREFIX = 'ninja-';
const LOCAL_ID_PREFIX = 'local-';

type NinjaCocktailResponse = {
  name?: string;
  ingredients?: string[];
  instructions?: string;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const stableHash = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const extractIngredientName = (raw: string): string => {
  const trimmed = raw.trim().toLowerCase();
  return trimmed
    .replace(/^\d+(?:[./]\d+)?\s*/g, '')
    .replace(/^(oz|ml|cl|cup|cups|tbsp|tsp|dash|dashes|part|parts|slice|slices|leaf|leaves|piece|pieces)\s+/g, '')
    .trim();
};

const buildNinjaId = (name: string, ingredients: string[]): string => {
  const fingerprint = `${name}|${ingredients.join('|')}`;
  return `${NINJA_ID_PREFIX}${slugify(name)}-${stableHash(fingerprint)}`;
};

const inferNinjaNameFromId = (idDrink: string): string => {
  const withoutPrefix = idDrink.replace(NINJA_ID_PREFIX, '');
  const idx = withoutPrefix.lastIndexOf('-');
  const slugName = idx >= 0 ? withoutPrefix.slice(0, idx) : withoutPrefix;
  return slugName.replace(/-/g, ' ').trim();
};

const mapNinjaRecipeToCocktail = (recipe: NinjaCocktailResponse): CocktailRecipe | null => {
  const rawName = recipe.name?.trim();
  const rawIngredients = recipe.ingredients?.map((item) => item.trim()).filter(Boolean) || [];

  if (!rawName || rawIngredients.length === 0 || !recipe.instructions?.trim()) {
    return null;
  }

  const normalizedIngredients = rawIngredients.map(extractIngredientName).filter(Boolean);
  const idDrink = buildNinjaId(rawName, normalizedIngredients);

  const cocktail: CocktailRecipe = {
    idDrink,
    strDrink: rawName,
    strDrinkAlternate: null,
    strTags: 'api-ninjas',
    strVideo: null,
    strCategory: 'API Ninjas',
    strIBA: null,
    strAlcoholic: 'Alcoholic',
    strGlass: 'Cocktail glass',
    strInstructions: recipe.instructions,
    strInstructionsKR: null,
    strInstructionsES: null,
    strInstructionsDE: null,
    strInstructionsFR: null,
    strInstructionsIT: null,
    strInstructionsZH_HANS: null,
    strInstructionsZH_HANT: null,
    strDrinkThumb: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    strImageSource: 'API Ninjas',
    strImageAttribution: null,
    strCreativeCommonsConfirmed: null,
    dateModified: null,
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

  normalizedIngredients.slice(0, 15).forEach((ingredient, index) => {
    (cocktail as unknown as Record<string, string>)[`strIngredient${index + 1}`] = ingredient;
  });

  return cocktail;
};

const fetchCocktailFromCocktailDBById = async (idDrink: string): Promise<CocktailRecipe | null> => {
  try {
    const { data } = await cocktailDBClient.get<CocktailSearchResponse>('/lookup.php', {
      params: { i: idDrink },
    });
    return data?.drinks?.[0] || null;
  } catch (error) {
    console.error('Error fetching detail from CocktailDB:', error);
    return null;
  }
};

const searchCocktailsFromCocktailDB = async (searchValue: string): Promise<CocktailRecipe[]> => {
  try {
    const { data } = await cocktailDBClient.get<CocktailSearchResponse>('/search.php', {
      params: { s: searchValue },
    });
    return data?.drinks || [];
  } catch (error) {
    console.error('Error searching CocktailDB:', error);
    return [];
  }
};

const searchCocktailsFromNinjas = async (searchValue: string): Promise<CocktailRecipe[]> => {
  if (!API_NINJAS_KEY) {
    return [];
  }

  try {
    const { data } = await cocktailNinjasClient.get<NinjaCocktailResponse[]>('/cocktail', {
      params: { name: searchValue },
      headers: {
        'X-Api-Key': API_NINJAS_KEY,
      },
    });

    return (data || []).map(mapNinjaRecipeToCocktail).filter((item): item is CocktailRecipe => item !== null);
  } catch (error) {
    console.error('Error searching API Ninjas:', error);
    return [];
  }
};

const fetchCocktailFromNinjasById = async (idDrink: string): Promise<CocktailRecipe | null> => {
  if (!API_NINJAS_KEY || !idDrink.startsWith(NINJA_ID_PREFIX)) {
    return null;
  }

  const inferredName = inferNinjaNameFromId(idDrink);
  if (!inferredName) {
    return null;
  }

  const candidates = await searchCocktailsFromNinjas(inferredName);
  return candidates.find((candidate) => candidate.idDrink === idDrink) || candidates[0] || null;
};

const getLocalRecipeById = (idDrink: string): CocktailRecipe | null => {
  return localCocktailRecipes.find((recipe) => recipe.idDrink === idDrink) || null;
};

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

const getCocktailByIdFromDB = async (idDrink: string): Promise<CocktailRecipe | null> => {
  if (!sql) return null;

  try {
    const result = await sql`SELECT * FROM cocktailrecipe WHERE iddrink = ${idDrink} LIMIT 1`;
    if (result.length === 0) return null;
    return mapCocktailRecipeRow(result[0] as Record<string, unknown>);
  } catch (error) {
    console.error('Error getting cocktail from DB:', error);
    return null;
  }
};

const searchCocktailsInDB = async (searchValue: string): Promise<CocktailRecipe[]> => {
  if (!sql) return [];

  try {
    const result = await sql`
      SELECT * FROM cocktailrecipe
      WHERE strdrink ILIKE ${`%${searchValue}%`}
      LIMIT 30;
    `;
    return result.map((row) => mapCocktailRecipeRow(row as Record<string, unknown>));
  } catch (error) {
    console.error('Error searching in DB:', error);
    return [];
  }
};

const saveCocktailAndIngredients = async (recipe: CocktailRecipe): Promise<boolean> => {
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO cocktailrecipe (
        iddrink, strdrink, strdrinkalternate, strtags, strvideo, strcategory, striba, stralcoholic, strglass,
        strinstructions, strinstructionses, strinstructionsde, strinstructionsfr, strinstructionsit,
        strinstructionszh_hans, strinstructionszh_hant, strinstructionskr, strdrinkthumb,
        stringredient1, stringredient2, stringredient3, stringredient4, stringredient5,
        stringredient6, stringredient7, stringredient8, stringredient9, stringredient10,
        stringredient11, stringredient12, stringredient13, stringredient14, stringredient15,
        strmeasure1, strmeasure2, strmeasure3, strmeasure4, strmeasure5,
        strmeasure6, strmeasure7, strmeasure8, strmeasure9, strmeasure10,
        strmeasure11, strmeasure12, strmeasure13, strmeasure14, strmeasure15,
        strimagesource, strimageattribution, strcreativecommonsconfirmed, datemodified
      )
      VALUES (
        ${recipe.idDrink}, ${recipe.strDrink || ''}, ${recipe.strDrinkAlternate || null}, ${recipe.strTags || null}, ${recipe.strVideo || null},
        ${recipe.strCategory || ''}, ${recipe.strIBA || null}, ${recipe.strAlcoholic || ''}, ${recipe.strGlass || ''},
        ${recipe.strInstructions || ''}, ${recipe.strInstructionsES || null}, ${recipe.strInstructionsDE || null}, ${recipe.strInstructionsFR || null}, ${recipe.strInstructionsIT || null},
        ${recipe.strInstructionsZH_HANS || null}, ${recipe.strInstructionsZH_HANT || null}, ${recipe.strInstructionsKR || null}, ${recipe.strDrinkThumb || ''},
        ${recipe.strIngredient1 || null}, ${recipe.strIngredient2 || null}, ${recipe.strIngredient3 || null}, ${recipe.strIngredient4 || null}, ${recipe.strIngredient5 || null},
        ${recipe.strIngredient6 || null}, ${recipe.strIngredient7 || null}, ${recipe.strIngredient8 || null}, ${recipe.strIngredient9 || null}, ${recipe.strIngredient10 || null},
        ${recipe.strIngredient11 || null}, ${recipe.strIngredient12 || null}, ${recipe.strIngredient13 || null}, ${recipe.strIngredient14 || null}, ${recipe.strIngredient15 || null},
        ${recipe.strMeasure1 || null}, ${recipe.strMeasure2 || null}, ${recipe.strMeasure3 || null}, ${recipe.strMeasure4 || null}, ${recipe.strMeasure5 || null},
        ${recipe.strMeasure6 || null}, ${recipe.strMeasure7 || null}, ${recipe.strMeasure8 || null}, ${recipe.strMeasure9 || null}, ${recipe.strMeasure10 || null},
        ${recipe.strMeasure11 || null}, ${recipe.strMeasure12 || null}, ${recipe.strMeasure13 || null}, ${recipe.strMeasure14 || null}, ${recipe.strMeasure15 || null},
        ${recipe.strImageSource || null}, ${recipe.strImageAttribution || null}, ${recipe.strCreativeCommonsConfirmed || null},
        ${recipe.dateModified ? new Date(recipe.dateModified) : null}
      )
      ON CONFLICT (iddrink) DO NOTHING;
    `;
    return true;
  } catch (error) {
    console.error('Error saving cocktail:', error);
    return false;
  }
};

const saveMissingRecipesToDB = async (
  recipes: CocktailRecipe[],
  existingIds: Set<string>,
): Promise<void> => {
  const missing = recipes.filter((recipe) => !existingIds.has(recipe.idDrink));
  if (missing.length === 0) {
    return;
  }

  for (const recipe of missing) {
    try {
      await saveCocktailAndIngredients(recipe);
    } catch (error) {
      console.error('Error saving missing recipe:', error);
    }
  }
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
      status: 400,
    });
  }

  try {
    const isNumericId = /^\d+$/.test(id);
    const isDetailRequest = id.startsWith(LOCAL_ID_PREFIX) || isNumericId || id.startsWith(NINJA_ID_PREFIX);

    if (isDetailRequest) {
      let cocktail = await getCocktailByIdFromDB(id);

      if (!cocktail) {
        if (id.startsWith(LOCAL_ID_PREFIX)) {
          cocktail = getLocalRecipeById(id);
        } else if (isNumericId) {
          cocktail = await fetchCocktailFromCocktailDBById(id);
        } else if (id.startsWith(NINJA_ID_PREFIX)) {
          cocktail = await fetchCocktailFromNinjasById(id);
        }

        if (!cocktail) {
          return new Response(JSON.stringify({ error: 'Cocktail not found' }), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
            status: 404,
          });
        }

        await saveCocktailAndIngredients(cocktail);
      }

      const response: CocktailSearchResponse = { drinks: [cocktail] };
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
        status: 200,
      });
    }

    const [dbResults, cocktailDbResults, ninjaResults] = await Promise.all([
      searchCocktailsInDB(id).catch(() => []),
      searchCocktailsFromCocktailDB(id).catch(() => []),
      searchCocktailsFromNinjas(id).catch(() => []),
    ]);

    const dbIds = new Set(dbResults.map((recipe) => recipe.idDrink));
    const externalRecipes = [...cocktailDbResults, ...ninjaResults];

    void saveMissingRecipesToDB(externalRecipes, dbIds);

    const allRecipes = [...dbResults];
    const existingIds = new Set(dbResults.map((recipe) => recipe.idDrink));

    for (const recipe of externalRecipes) {
      if (!existingIds.has(recipe.idDrink)) {
        allRecipes.push(recipe);
        existingIds.add(recipe.idDrink);
      }
    }

    const response: CocktailSearchResponse = {
      drinks: allRecipes.slice(0, 30),
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching cocktail:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: 'Failed to fetch cocktail data' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
