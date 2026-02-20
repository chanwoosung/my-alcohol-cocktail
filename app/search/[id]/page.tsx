import { fetchCocktailRecipe, getCocktailRecipe } from "@/apis/cocktailDB";
import { CocktailSearchResponse } from "@/types/cocktailTypes";
import { Params } from "@/types/commonTypes";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import SearchDetailContent from "./SearchDetailContent";

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: slug } = await params;

  const queryClient = new QueryClient();

  if (slug) {
    await queryClient.prefetchQuery({
      queryKey: ["search", "cocktailRecipe", slug],
      queryFn: () => getCocktailRecipe(slug),
    });
  }

  const cocktailData = queryClient.getQueryData<CocktailSearchResponse>(["search", "cocktailRecipe", slug]);
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
  const queryClient = new QueryClient();

  if (slug) {
    await queryClient.prefetchQuery({
      queryKey: ["search", "cocktailRecipe", slug],
      queryFn: () => fetchCocktailRecipe(slug),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <SearchDetailContent dehydratedState={dehydratedState} slug={slug} />
  );
};

export default SearchDetailPage;
