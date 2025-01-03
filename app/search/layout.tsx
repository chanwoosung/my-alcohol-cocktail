import { Params } from "@/types/commonTypes";
import { use } from "react";

import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: { searchValue?: string } }): Promise<Metadata> {
  const searchValue = searchParams?.searchValue || '기본값';
  
  return {
    title: searchParams?`검색 결과: ${searchValue}`:`검색하기`,
    description: searchParams?`${searchValue}에 대한 검색 결과를 확인하세요.`: '궁금한 칵테일 이름을 검색해서 레시피를 확인하세요.',
  };
}

const SearchLayout = (props: {
    children: React.ReactNode
    params: Params
  }) => {
    const params = use(props.params)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { slug } = params

    return (
        props.children
    )
}

export default SearchLayout