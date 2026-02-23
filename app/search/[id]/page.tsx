import { fetchCocktailRecipe } from "@/apis/cocktailDB";
import { Params } from "@/types/commonTypes";
import { Metadata } from "next";
import { cache } from "react";
import SearchDetailContent from "./SearchDetailContent";

const getCocktailById = cache(async (slug: string) => {
  return fetchCocktailRecipe(slug);
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: slug } = await params;

  const cocktailData = slug ? await getCocktailById(slug) : null;
  
  if (!cocktailData?.drinks?.length) {
    return {
      title: "칵테일 정보 없음",
      description: "해당 칵테일 정보를 찾을 수 없습니다.",
    };
  }

  const cocktail = cocktailData.drinks[0];
  const descriptionSource = cocktail.strInstructions || "칵테일 레시피 정보를 확인하세요.";
  const description = `${cocktail.strDrink} 레시피: ${descriptionSource.slice(0, 100)}...`;

  return {
    title: `${cocktail.strDrink} | 칵테일 레시피`,
    description,
    openGraph: {
      title: `${cocktail.strDrink} | 칵테일 레시피`,
      description,
      images: [
        {
          url: cocktail.strDrinkThumb,
          width: 800,
          height: 600,
          alt: cocktail.strDrink,
        },
      ],
    },
  };
}

const SearchDetailPage = async ({ params }: { params: Params }) => {
  const { id: slug } = await params;
  const data = slug ? await getCocktailById(slug) : null;

  return (
    <SearchDetailContent initialData={data} />
  );
};

export default SearchDetailPage;
