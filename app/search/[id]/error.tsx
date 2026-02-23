'use client';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const SearchDetailError = ({ reset }: Props) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.25rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠</div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          레시피를 불러오지 못했습니다
        </h2>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          네트워크 상태를 확인한 뒤 다시 시도해주세요.
        </p>
        <button className="btn btn-primary" onClick={reset}>
          다시 시도
        </button>
      </div>
    </div>
  );
};

export default SearchDetailError;

