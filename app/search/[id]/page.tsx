import { fetchCocktailRecipe } from "@/apis/cocktailDB";
import { Params } from "@/types/commonTypes";
import { Metadata } from "next";
import SearchDetailContent from "./SearchDetailContent";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: slug } = await params;

  const cocktailData = slug ? await fetchCocktailRecipe(slug) : null;
  
  if (!cocktailData?.drinks) {
    return {
      title: "칵테일 정보 없음",
      description: "해당 칵테일 정보를 찾을 수 없습니다.",
    };
  }

  const cocktail = cocktailData.drinks[0];

  return {
    title: `${cocktail.strDrink} | 칵테일 레시피`,
    description: `${cocktail.strDrink} 레시피: ${cocktail.strInstructions.slice(0, 100)}...`,
    openGraph: {
      title: `${cocktail.strDrink} | 칵테일 레시피`,
      description: `${cocktail.strDrink} 레시피: ${cocktail.strInstructions.slice(0, 100)}...`,
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
  const data = slug ? await fetchCocktailRecipe(slug) : null;

  return (
    <SearchDetailContent initialData={data} slug={slug} />
  );
};

export default SearchDetailPage;
