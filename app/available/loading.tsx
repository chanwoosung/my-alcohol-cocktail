import RouteLoading from '@/app/components/ui/RouteLoading';

const AvailableLoading = () => {
  return (
    <RouteLoading
      title="제작 가능한 칵테일 계산 중"
      description="보유 재료를 기준으로 만들 수 있는 칵테일을 빠르게 찾고 있어요."
    />
  );
};

export default AvailableLoading;

