'use client';

import { CocktailSearchResponse } from "@/types/cocktailTypes";
import { Box, Input } from "@mantine/core";
import { HydrationBoundary, QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  dehydratedState: unknown; // 서버에서 전달된 직렬화된 상태
  searchValue: string | string[] | undefined;
};

type Form = {
  searchValue: string | string[] | undefined;
};

const SearchPageContent = ({ dehydratedState, searchValue }: Props) => {
  const [queryClient] = useState(() => new QueryClient()); // 클라이언트에서 QueryClient 생성
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    defaultValues: {
      searchValue,
    },
    mode: 'onSubmit',
  });

  const onSubmit = (data: Form) => {
    router.replace(window.location.pathname + `?searchValue=${data.searchValue}`);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <Box component="form" w="90%" mx="auto" p="md" onSubmit={handleSubmit(onSubmit)}>
          <Input.Wrapper error={errors.searchValue?.message}>
            <Input
              {...register('searchValue', {
                validate: (value) => {
                  if (!value || (typeof value === "string" && value.trim() === "")) {
                    return "검색어를 입력해주세요.";
                  }
                  return true;
                },
              })}
              error={errors.searchValue?.message}
              enterKeyHint="search"
              inputMode="search"
            />
          </Input.Wrapper>
        </Box>
        {/* React Query를 사용하여 데이터 처리 */}
        <DrinksList searchValue={searchValue} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

const DrinksList = ({ searchValue }: { searchValue: string | string[] | undefined }) => {
  const { data, isLoading } = useQuery<CocktailSearchResponse>({
    queryKey: ['search', 'cocktailName', searchValue],
    enabled: !!searchValue, // searchValue가 있을 때만 쿼리 실행
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.drinks?.map((elem) => (
        <Link key={elem.idDrink} href={window.location.pathname+`/${elem.idDrink}`}>{elem.strDrink}</Link>
      ))}
    </ul>
  );
};

export default SearchPageContent;
