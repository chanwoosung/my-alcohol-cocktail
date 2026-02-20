'use client';

import { convertToOzWithMl } from "@/lib/convertUtils";
import { CocktailSearchResponse } from "@/types/cocktailTypes";
import { Badge, Card, Grid, Group, Image, Text, Title } from "@mantine/core";
import { HydrationBoundary, useQuery } from "@tanstack/react-query";

type Props = {
  dehydratedState: unknown;
  slug: string;
};

const SearchDetailContent = ({ dehydratedState, slug }: Props) => {

  return (
      <HydrationBoundary state={dehydratedState}>
        <CocktailDetail slug={slug} />
      </HydrationBoundary>
  );
};

const CocktailDetail = ({ slug }: { slug: string }) => {
  const { data, isLoading } = useQuery<CocktailSearchResponse>({
    queryKey: ["search", "cocktailRecipe", slug],
    enabled: !!slug, // slug가 있을 때만 실행
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!data?.drinks?.length) {
    return <Text size="lg"  mt="xl">
      칵테일 정보를 찾을 수 없습니다.
    </Text>;
  }

  const cocktail = data.drinks[0];

  return (
    <Card shadow="sm" padding="lg" radius="md" my={'md'} withBorder>
      <Grid>
        <Grid.Col span={12} >
          <Image
            src={cocktail.strDrinkThumb}
            alt={cocktail.strDrink}
            radius="md"
          />
        </Grid.Col>
        <Grid.Col span={12} >
          <Title order={2} mt="md">
            {cocktail.strDrink}
          </Title>
          <Badge color="pink" mt="xs">
            {cocktail.strCategory}
          </Badge>
          <Text size="sm" mt="xs">
            Glass: {cocktail.strGlass}
          </Text>
          <Text size="sm" mt="xs">
            Alcoholic: {cocktail.strAlcoholic}
          </Text>
          <Text size="sm" mt="xs">
            IBA: {cocktail.strIBA || "N/A"}
          </Text>
          <Text size="sm" mt="md">
            {cocktail.strInstructions}
          </Text>
        </Grid.Col>
      </Grid>

      <Title order={3} mt="lg">
        Ingredients
      </Title>
      <Group mt="md">
        {Array.from({ length: 15 }, (_, i) => i + 1)
          .map((index) => ({
            ingredient: cocktail[`strIngredient${index}` as keyof typeof cocktail],
            measure: cocktail[`strMeasure${index}` as keyof typeof cocktail],
          }))
          .filter(({ ingredient }) => ingredient)
          .map(({ ingredient, measure }, idx) => (
            <Text size="sm" key={idx}>
              {measure ? `${convertToOzWithMl(measure)} ` : ""} {ingredient}
            </Text>
          ))}
      </Group>
    </Card>
  );
};

export default SearchDetailContent;
