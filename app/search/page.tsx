import { fetchCocktails } from "@/apis/cocktailDB";
import { ServerComponentProps } from "@/types/commonTypes";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import SearchPageContent from "./searchPageContent";

const SearchPage = async ({ searchParams }: ServerComponentProps) => {
  const { searchValue } = await searchParams;
  const queryClient = new QueryClient();

  if (searchValue) {
    await queryClient.prefetchQuery({
      queryKey: ['search', 'cocktailName', searchValue],
      queryFn: () => fetchCocktails(searchValue),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <SearchPageContent
      dehydratedState={dehydratedState} // 직렬화 가능한 dehydratedState만 전달
      searchValue={searchValue}
    />
  );
};

export default SearchPage;
