'use client';

import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Combobox,
  Flex,
  Group,
  Input,
  ScrollArea,
  Text,
  Title,
  useCombobox,
} from '@mantine/core';
import { useInventory } from '@/hooks/useInventory';
import { alcoholCategoryMappedKorean } from '@/constants/ingredient';

interface IngredientOption {
  name: string;
  nameEn: string;
}

const allIngredients: IngredientOption[] = Object.entries(alcoholCategoryMappedKorean).map(([korean, english]) => ({
  name: korean,
  nameEn: english,
}));

export default function InventoryPage() {
  const { items, addItem, removeItem, clearAll, isLoaded } = useInventory();
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setSelectedIngredient('');
    },
  });

  const filteredOptions = allIngredients.filter((option) =>
    option.name.toLowerCase().includes(selectedIngredient.toLowerCase()) ||
    option.nameEn.toLowerCase().includes(selectedIngredient.toLowerCase())
  );

  const handleAdd = () => {
    const ingredient = allIngredients.find(
      (i) => i.name === selectedIngredient || i.nameEn === selectedIngredient
    );
    if (ingredient) {
      addItem({
        id: Date.now().toString(),
        name: ingredient.name,
        nameEn: ingredient.nameEn,
        category: 'base',
      });
      setSelectedIngredient('');
    }
  };

  if (!isLoaded) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Text>로딩 중...</Text>
      </Flex>
    );
  }

  return (
    <Box p="xl">
      <Title order={2} mb="lg">내 술库存 관리</Title>
      
      <Flex gap="md" mb="xl" wrap="wrap">
        <Combobox
          store={combobox}
          onOptionSubmit={(val) => {
            setSelectedIngredient(val);
            combobox.closeDropdown();
          }}
        >
          <Combobox.Target>
            <Input.Wrapper label="술/재료 추가">
              <Input
                placeholder="보드카, 진, 럼..."
                value={selectedIngredient}
                onChange={(e) => {
                  setSelectedIngredient(e.currentTarget.value);
                  combobox.openDropdown();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
              />
            </Input.Wrapper>
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              <ScrollArea.Autosize mah={200}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <Combobox.Option value={option.name} key={option.name}>
                      {option.name} ({option.nameEn})
                    </Combobox.Option>
                  ))
                ) : (
                  <Combobox.Empty>결과 없음</Combobox.Empty>
                )}
              </ScrollArea.Autosize>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
        
        <Button onClick={handleAdd} mt={28} disabled={!selectedIngredient}>
          추가
        </Button>
      </Flex>

      <Box mb="xl">
        <Group justify="space-between" mb="sm">
          <Text fw={500}>내 술 목록 ({items.length}개)</Text>
          {items.length > 0 && (
            <Button variant="subtle" color="red" size="xs" onClick={clearAll}>
              전체 삭제
            </Button>
          )}
        </Group>
        
        {items.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            아직 가지고 있는 술이 없습니다. 위에서 추가해주세요.
          </Text>
        ) : (
          <Flex gap="xs" wrap="wrap">
            {items.map((item) => (
              <Badge
                key={item.id}
                size="lg"
                variant="filled"
                color="blue"
                rightSection={
                  <Text
                    component="span"
                    style={{ cursor: 'pointer', marginLeft: 4 }}
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </Text>
                }
              >
                {item.name}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
