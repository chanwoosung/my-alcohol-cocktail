import RouteLoading from '@/app/components/ui/RouteLoading';

const SearchLoading = () => {
  return (
    <RouteLoading
      title="칵테일 검색 결과 가져오는 중"
      description="검색 결과를 정리하고 있어요. 잠시만 기다려주세요."
    />
  );
};

export default SearchLoading;

