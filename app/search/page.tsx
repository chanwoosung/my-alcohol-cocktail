import { ServerComponentProps } from "@/types/commonTypes";
import SearchPageContent from "./searchPageContent";



const SearchPage = async ({ searchParams }: ServerComponentProps) => {
    const { searchValue } = await searchParams;
    console.log(searchValue)
    return (
        <SearchPageContent searchValue={(searchValue)} />
    )
}

export default SearchPage