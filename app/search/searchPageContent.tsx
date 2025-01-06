'use client';

import { CocktailSearchResponse } from "@/types/cocktailTypes";
import { Box, Flex, Image, Input, Text, Title } from "@mantine/core";
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
        <Box component="form" w="90%" mx="auto" py="md" pos={'sticky'} top={0} onSubmit={handleSubmit(onSubmit)} style={{
          backgroundColor:'#ffffff'
        }}>
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
              size="lg"
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
  console.log(data)
  if (isLoading) return <div>Loading...</div>;

  return (
    <Flex gap='md' 
    direction="column" w={'90%'} mx={'auto'}>
      {data?.drinks?.map((elem) => (
        <Link key={elem.idDrink} href={window.location.pathname+`/${elem.idDrink}`}>
          <Flex styles={{
            root: {
              border: '2px solid',
              borderRadius: '8px',
            }
          }}>
            <Image w={120} h={120}  src={elem.strDrinkThumb} alt={elem.strDrink+'_thumbnail'} 
              loading="lazy"
              styles={{
                root: {
                  borderTopLeftRadius:'6px',
                  borderBottomLeftRadius:'6px'
                }
              }}
            />
            <Box p={8}>
              <Title order={4}>{elem.strDrink}</Title>
              <Text lineClamp={3}>{elem.strInstructions}</Text>
            </Box>
          </Flex>
        </Link>
      ))}
    </Flex>
  );
};

export default SearchPageContent;
