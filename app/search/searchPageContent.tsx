'use client';

import { CocktailSearchResponse } from "@/types/cocktailTypes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

type Props = {
  initialData: CocktailSearchResponse | null;
  searchValue: string | string[] | undefined;
};

type Form = {
  searchValue: string | string[] | undefined;
};

const SearchPageContent = ({ initialData, searchValue }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<Form>({
    defaultValues: {
      searchValue,
    },
    mode: 'onSubmit',
  });

  const onSubmit = (data: Form) => {
    startTransition(() => {
      router.replace(window.location.pathname + `?searchValue=${data.searchValue}`);
    });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '1rem',
        background: 'var(--card)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <form onSubmit={handleSubmit(onSubmit)} className="container">
          <input
            {...register('searchValue', {
              validate: (value) => {
                if (!value || (typeof value === "string" && value.trim() === "")) {
                  return "검색어를 입력해주세요.";
                }
                return true;
              },
            })}
            className="input"
            style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
            disabled={isPending}
          />
          {isPending && (
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.4rem', textAlign: 'center' }}>
              칵테일 레시피 가져오는 중...
            </p>
          )}
        </form>
      </header>

      <main className="container" style={{ padding: '1.5rem 1rem' }}>
        <DrinksList initialData={initialData} searchValue={searchValue} />
      </main>
    </div>
  );
};

const DrinksList = ({ initialData, searchValue }: { initialData: CocktailSearchResponse | null; searchValue: string | string[] | undefined }) => {
  const pathname = usePathname();

  if (!searchValue) {
    return (
      <div className="flex-center" style={{ padding: '4rem 1rem', flexDirection: 'column' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <div className="text-muted">검색어를 입력하여 칵테일을 검색하세요</div>
      </div>
    );
  }

  if (!initialData?.drinks?.length) {
    return (
      <div className="flex-center" style={{ padding: '4rem 1rem', flexDirection: 'column' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <div className="text-muted">검색 결과가 없습니다</div>
        <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>다른 검색어를 시도해보세요</div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
        {initialData.drinks.length}개의 결과를 찾았습니다
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {initialData.drinks?.map((elem) => (
          <Link
            key={elem.idDrink}
            href={pathname + `/${elem.idDrink}`}
            className="card"
            style={{ padding: '0', textDecoration: 'none', overflow: 'hidden' }}
          >
            <img
              src={elem.strDrinkThumb + '/preview'}
              alt={elem.strDrink}
              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            />
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {elem.strDrink}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {elem.strCategory}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchPageContent;
