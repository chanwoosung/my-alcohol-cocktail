'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Group, Image, Loader, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { fetchCocktailsByMultipleIngredients } from '@/apis/cocktailDB';
import { searchLocalRecipes } from '@/data/localRecipes';
import { CocktailFilterItem, CocktailRecipe } from '@/types/cocktailTypes';

interface CombinedCocktail {
  id: string;
  name: string;
  image: string;
  source: 'local' | 'api';
}

export default function HomeContent() {
  const { items, isLoaded } = useInventory();
  const [recipes, setRecipes] = useState<CombinedCocktail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const loadRecipes = async () => {
      setLoading(true);
      
      const ingredientNames = items.map(item => item.nameEn);
      
      const localRecipes = searchLocalRecipes(ingredientNames).map(recipe => ({
        id: recipe.idDrink,
        name: recipe.strDrink,
        image: recipe.strDrinkThumb,
        source: 'local' as const,
      }));

      let apiRecipes: CombinedCocktail[] = [];
      if (ingredientNames.length > 0) {
        const apiResults = await fetchCocktailsByMultipleIngredients(ingredientNames);
        apiRecipes = apiResults.map(cocktail => ({
          id: cocktail.idDrink,
          name: cocktail.strDrink,
          image: cocktail.strDrinkThumb,
          source: 'api' as const,
        }));
      }

      const combined = [...localRecipes, ...apiRecipes];
      const unique = Array.from(new Map(combined.map(c => [c.id, c])).values());
      
      setRecipes(unique.slice(0, 8));
      setLoading(false);
    };

    loadRecipes();
  }, [items, isLoaded]);

  if (!isLoaded) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <Box p="xl">
      <Flex justify="center" direction="column" align="center" mb="xl">
        <Image
          width={80}
          height={80}
          src="/icon.webp"
          alt="main_logo"
          mb="md"
        />
        <Title order={2} mb="lg">
          My Cocktail Book
        </Title>
        <Group gap="md" mb="xl">
          <Button component={Link} href="/inventory" variant="filled" size="md">
            내 술库存 관리
          </Button>
          <Button component={Link} href="/search" variant="light" size="md">
            칵테일 검색
          </Button>
        </Group>
      </Flex>

      {items.length > 0 && (
        <Box mb="xl">
          <Group justify="space-between" align="center" mb="md">
            <Title order={4}>내 술로 만들 수 있는 칵테일</Title>
            <Text size="sm" c="dimmed">{items.length}개 재료</Text>
          </Group>
          
          {loading ? (
            <Flex justify="center" py="xl">
              <Loader />
            </Flex>
          ) : recipes.length > 0 ? (
            <Grid>
              {recipes.map((recipe) => (
                <Grid.Col key={recipe.id} span={{ base: 6, sm: 4, md: 3 }}>
                  <Card
                    component={Link}
                    href={`/search/${recipe.id}`}
                    shadow="sm"
                    padding="sm"
                    radius="md"
                    withBorder
                    style={{ textDecoration: 'none' }}
                  >
                    <Card.Section>
                      <Image
                        src={recipe.image}
                        height={120}
                        alt={recipe.name}
                        fallbackSrc="https://placehold.co/200x120?text=No+Image"
                      />
                    </Card.Section>
                    <Text fw={500} size="sm" mt="xs" lineClamp={1}>
                      {recipe.name}
                    </Text>
                    <Text size="xs" c={recipe.source === 'local' ? 'green' : 'blue'}>
                      {recipe.source === 'local' ? '로컬 레시피' : 'API'}
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              만들 수 있는 칵테일이 없습니다. 재료를 더 추가해보세요.
            </Text>
          )}
        </Box>
      )}

      {items.length === 0 && (
        <Box ta="center" py="xl">
          <Text size="lg" mb="md">술을 추가해서 나만의 칵테일을 찾아보세요!</Text>
          <Button component={Link} href="/inventory" size="lg">
            지금 시작하기
          </Button>
        </Box>
      )}
    </Box>
  );
}
