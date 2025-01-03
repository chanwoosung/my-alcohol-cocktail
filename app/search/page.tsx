import { ServerComponentProps } from "@/types/commonTypes";
import SearchPageContent from "./searchPageContent";



const SearchPage = async ({ searchParams }: ServerComponentProps) => {
    const { queryText } = await searchParams;
    return (
        <SearchPageContent queryText={String(queryText)} />
    )
}

export default SearchPage