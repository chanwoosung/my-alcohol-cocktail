import { fetchCocktailRecipe } from "@/apis/cocktailDB";
import { CocktailRecipe } from "@/types/cocktailTypes";
import { neon } from "@neondatabase/serverless";

// Cocktails와 Ingredients를 조인하여 데이터를 조회하는 함수
const getCocktailWithIngredients = async (idDrink: string): Promise<CocktailRecipe | null> => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  
    const sql = neon(process.env.DATABASE_URL);
  
    try {
      const result = await sql`
        SELECT 
          c.idDrink,
          COALESCE(c.strDrink, '') AS strDrink,
          COALESCE(c.strCategory, '') AS strCategory,
          COALESCE(c.strAlcoholic, '') AS strAlcoholic,
          COALESCE(c.strGlass, '') AS strGlass,
          COALESCE(c.strInstructions, '') AS strInstructions,
          COALESCE(c.strInstructionsKR, '') AS strInstructionsKR,
          COALESCE(c.strDrinkThumb, '') AS strDrinkThumb,
          COALESCE(c.strImageSource, '') AS strImageSource,
          COALESCE(c.dateModified, '') AS dateModified,
          json_agg(json_build_object(
            'ingredient', COALESCE(i.ingredientName, ''),
            'measure', COALESCE(i.measure, '')
          )) AS ingredients
        FROM Cocktails c
        LEFT JOIN Ingredients i ON c.idDrink = i.idDrink
        WHERE c.idDrink = ${idDrink}
        GROUP BY c.idDrink;
      `;
  
      if (result.length === 0) return null;
  
      const cocktail = result[0];
  
    // Flatten ingredients array and create CocktailRecipe object
    const flattenedIngredients = Object.fromEntries(
          (cocktail.ingredients as Array<{ ingredient: string; measure: string | null }>).flatMap(
            (ingredient, index) => [
              [`strIngredient${index + 1}`, ingredient.ingredient || null],
              [`strMeasure${index + 1}`, ingredient.measure || null],
            ]
          )
    );

    return {
      ...cocktail,
      ...flattenedIngredients,
      } as CocktailRecipe;
    } catch (error) {
      console.error("Error executing query in getCocktailWithIngredients:", error);
      return null; // 에러 발생 시 null 반환
    }
  };
  
// Ingredient 테이블에 데이터 추가
const addIngredientIfNotExists = async (ingredientName: string): Promise<number> => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const existing = await sql`SELECT idIngredient FROM Ingredient WHERE name = ${ingredientName}`;
    if (existing.length > 0) {
      return existing[0].idIngredient; // 이미 존재하면 해당 ID 반환
    }

    const result = await sql`
      INSERT INTO Ingredient (name)
      VALUES (${ingredientName})
      RETURNING idIngredient;
    `;
    return result[0].idIngredient;
  } catch (error) {
    console.error("Error executing query in addIngredientIfNotExists:", error);
    throw new Error("Failed to add or fetch ingredient");
  }
};

// Cocktails 및 Ingredients 테이블에 데이터 추가
const saveCocktailAndIngredients = async (recipe: CocktailRecipe): Promise<void> => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  
    const sql = neon(process.env.DATABASE_URL);
    try {
      await sql`
        INSERT INTO Cocktails (
          idDrink,
          strDrink,
          strCategory,
          strAlcoholic,
          strGlass,
          strInstructions,
          strInstructionsKR,
          strDrinkThumb,
          strImageSource,
          strImageAttribution,
          strCreativeCommonsConfirmed,
          dateModified
        )
        VALUES (
          ${recipe.idDrink},
          ${recipe.strDrink},
          ${recipe.strCategory},
          ${recipe.strAlcoholic},
          ${recipe.strGlass},
          ${recipe.strInstructions},
          ${recipe.strInstructionsKR || ''},
          ${recipe.strDrinkThumb},
          ${recipe.strImageSource},
          ${recipe.strImageAttribution},
          ${recipe.strCreativeCommonsConfirmed},
          ${recipe.dateModified}
      );
      `;
    } catch (error) {
      console.error("Error saving cocktail or ingredients:", error);
      throw new Error("Failed to save cocktail or ingredients");
    }
  };
  
// GET 메서드
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    let cocktail = await getCocktailWithIngredients(id);

    if (!cocktail) {
      const data = await fetchCocktailRecipe(id);
      if (!data?.drinks || data?.drinks.length === 0) {
        return new Response(JSON.stringify({ error: "Cocktail not found" }), {
          headers: { "Content-Type": "application/json" },
          status: 404,
        });
      }

      cocktail = data.drinks[0];
      await saveCocktailAndIngredients(cocktail);
    }

    // Return CocktailRecipe object
    return new Response(JSON.stringify({ success: true, data: { drinks: [cocktail] } }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching cocktail:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
