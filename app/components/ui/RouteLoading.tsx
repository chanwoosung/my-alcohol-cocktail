type RouteLoadingProps = {
  title?: string;
  description?: string;
};

const RouteLoading = ({
  title = '칵테일 레시피 가져오는 중',
  description = '레시피와 재료 정보를 불러오고 있어요. 잠시만 기다려주세요.',
}: RouteLoadingProps) => {
  return (
    <div className="route-loading-wrap">
      <div className="route-loading-card">
        <div className="route-loading-header">
          <div className="route-loading-dot" />
          <div>
            <div className="route-loading-title">{title}</div>
            <div className="route-loading-desc">{description}</div>
          </div>
        </div>

        <div className="route-loading-image skeleton-shimmer" />
        <div className="route-loading-line skeleton-shimmer" />
        <div className="route-loading-line short skeleton-shimmer" />
        <div className="route-loading-grid">
          <div className="route-loading-chip skeleton-shimmer" />
          <div className="route-loading-chip skeleton-shimmer" />
          <div className="route-loading-chip skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default RouteLoading;

