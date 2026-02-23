import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const TARGET_COUNT = 1000;
const HF_DATASET = 'erwanlc/cocktails_recipe_no_brand';

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
  'vermouth',
  'wine',
  'champagne',
  'beer',
  'amaretto',
  'campari',
  'aperol',
  'kahlua',
  'curacao',
  'cointreau',
  'schnapps',
  'baileys',
  'drambuie',
  'pisco',
];

const normalizeName = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');

const isAlcoholicByIngredients = (ingredientNames) =>
  ingredientNames.some((name) => {
    const n = name.toLowerCase();
    return ALCOHOL_KEYWORDS.some((keyword) => n.includes(keyword));
  });

const emptyRecipe = () => ({
  strDrinkAlternate: null,
  strTags: null,
  strVideo: null,
  strIBA: null,
  strInstructionsKR: null,
  strInstructionsES: null,
  strInstructionsDE: null,
  strInstructionsFR: null,
  strInstructionsIT: null,
  strInstructionsZH_HANS: null,
  strInstructionsZH_HANT: null,
  strImageSource: null,
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
});

const parseIngredientPairs = (value) => {
  if (!value || typeof value !== 'string') return [];
  const pairs = [];
  const regex = /\['([^']*)'\s*,\s*'([^']*)'\]/g;
  let match = regex.exec(value);
  while (match) {
    const measure = match[1]?.trim() || '';
    const ingredient = match[2]?.trim() || '';
    if (ingredient) {
      pairs.push({ measure, ingredient });
    }
    match = regex.exec(value);
  }
  return pairs;
};

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed request: ${res.status} ${url}`);
  }
  return res.json();
};

const fetchCocktailDbRecipes = async () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const results = [];

  for (const letter of letters) {
    const data = await fetchJson(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`);
    if (Array.isArray(data?.drinks)) {
      for (const drink of data.drinks) {
        results.push({
          ...emptyRecipe(),
          ...drink,
          idDrink: String(drink.idDrink),
          strCategory: drink.strCategory || 'CocktailDB',
          strAlcoholic: drink.strAlcoholic || 'Alcoholic',
          strGlass: drink.strGlass || 'Cocktail glass',
          strInstructions: drink.strInstructions || '',
          strDrinkThumb:
            drink.strDrinkThumb ||
            'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
          source: 'thecocktaildb',
        });
      }
    }
  }

  return results;
};

const fetchHfRecipes = async (limit) => {
  const batchSize = 100;
  const results = [];

  for (let offset = 0; results.length < limit; offset += batchSize) {
    const url =
      `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(HF_DATASET)}` +
      `&config=default&split=train&offset=${offset}&length=${batchSize}`;
    const data = await fetchJson(url);
    const rows = data?.rows || [];
    if (!rows.length) break;

    for (const rowWrapper of rows) {
      const row = rowWrapper?.row || {};
      const title = String(row.title || '').trim();
      if (!title) continue;

      const ingredientPairs = parseIngredientPairs(row.raw_ingredients || row.ingredients || '');
      if (!ingredientPairs.length) continue;

      const recipe = {
        ...emptyRecipe(),
        idDrink: `static-hf-${offset + rowWrapper.row_idx}`,
        strDrink: title,
        strCategory: 'Static Collection',
        strAlcoholic: isAlcoholicByIngredients(ingredientPairs.map((p) => p.ingredient)) ? 'Alcoholic' : 'Non alcoholic',
        strGlass: row.glass || 'Cocktail glass',
        strInstructions: row.recipe || 'No instructions provided.',
        strDrinkThumb:
          'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
        strImageSource: 'HuggingFace',
        source: 'huggingface',
      };

      ingredientPairs.slice(0, 15).forEach((pair, idx) => {
        recipe[`strIngredient${idx + 1}`] = pair.ingredient;
        recipe[`strMeasure${idx + 1}`] = pair.measure || null;
      });

      results.push(recipe);
      if (results.length >= limit) break;
    }
  }

  return results;
};

const dedupeByName = (recipes) => {
  const byName = new Map();
  for (const recipe of recipes) {
    const key = normalizeName(recipe.strDrink || '');
    if (!key) continue;
    if (!byName.has(key)) {
      byName.set(key, recipe);
    }
  }
  return Array.from(byName.values());
};

const main = async () => {
  const cocktailDbRecipes = await fetchCocktailDbRecipes();
  const hfRecipes = await fetchHfRecipes(2500);

  const merged = dedupeByName([...cocktailDbRecipes, ...hfRecipes]).slice(0, TARGET_COUNT);
  if (merged.length < TARGET_COUNT) {
    throw new Error(`Not enough recipes after dedupe: ${merged.length}/${TARGET_COUNT}`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    count: merged.length,
    sources: ['thecocktaildb', 'huggingface'],
    drinks: merged,
  };

  const publicDir = path.resolve(process.cwd(), 'public');
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, 'data.json'), JSON.stringify(output));

  console.log(`Generated ${merged.length} recipes at public/data.json`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

