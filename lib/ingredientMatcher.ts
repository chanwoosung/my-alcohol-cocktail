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

const normalizeIngredientName = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[().,]/g, ' ')
    .replace(/\s+/g, ' ');

export const isIgnoredIngredient = (name: string): boolean => {
  const normalized = normalizeIngredientName(name);
  return IGNORED_INGREDIENTS.some((ignored) => normalized === ignored || normalized.includes(ignored));
};

export const getIngredientsFromCocktail = (cocktail: Record<string, unknown>): string[] => {
  const ingredients: string[] = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = cocktail[`strIngredient${i}`];
    if (ingredient) {
      ingredients.push(normalizeIngredientName(String(ingredient)));
    }
  }
  return ingredients;
};

export const isAlcoholIngredient = (name: string): boolean => {
  const normalized = normalizeIngredientName(name);
  return ALCOHOL_KEYWORDS.some((keyword) => normalized.includes(keyword));
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

export const isIngredientAvailable = (cocktailIngredient: string, userIngredients: string[]): boolean => {
  const normalizedUser = new Set(userIngredients.map(normalizeIngredientName));
  const normalizedUserList = userIngredients.map(normalizeIngredientName);
  const normalizedIngredient = normalizeIngredientName(cocktailIngredient);
  const candidates = getAliasCandidates(normalizedIngredient);

  for (const candidate of candidates) {
    if (normalizedUser.has(candidate)) {
      return true;
    }

    // Allow "scotch" vs "scotch whiskey", "white rum" vs "rum" level matching.
    if (normalizedUserList.some((owned) => owned.includes(candidate) || candidate.includes(owned))) {
      return true;
    }
  }

  return false;
};

export const getRequiredOwnedIngredients = (ingredients: string[]): string[] => {
  return ingredients.filter((ingredient) => !isIgnoredIngredient(ingredient) && isAlcoholIngredient(ingredient));
};
