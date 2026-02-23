import RouteLoading from '@/app/components/ui/RouteLoading';

const SearchDetailLoading = () => {
  return (
    <RouteLoading
      title="칵테일 레시피 가져오는 중"
      description="상세 레시피, 재료, 난이도 정보를 불러오고 있어요."
    />
  );
};

export default SearchDetailLoading;

