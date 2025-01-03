import { Params } from "@/types/commonTypes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색하기",
  description: "궁금한 칵테일 이름을 검색해서 레시피를 확인하세요.",
};

const SearchLayout = (props: {
  children: React.ReactNode;
  params: Params;
}) => {
  const { children } = props;

  return <>{children}</>;
};

export default SearchLayout;
