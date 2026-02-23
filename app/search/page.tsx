import { fetchCocktails } from "@/apis/cocktailDB";
import { ServerComponentProps } from "@/types/commonTypes";
import SearchPageContent from "./searchPageContent";

const SearchPage = async ({ searchParams }: ServerComponentProps) => {
  const { searchValue } = await searchParams;
  const data = searchValue ? await fetchCocktails(searchValue) : null;

  return (
    <SearchPageContent
      initialData={data}
      searchValue={searchValue}
    />
  );
};

export default SearchPage;
