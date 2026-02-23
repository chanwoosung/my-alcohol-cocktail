'use client';

import { Grid, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

interface CustomRecipe {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  glass: string;
  instructions: string;
  image: string;
  ingredients: { name: string; measure: string }[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingRecipe, setEditingRecipe] = useState<CustomRecipe | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    category: 'Ordinary Drink',
    glass: 'Cocktail glass',
    instructions: '',
    image: 'https://www.thecocktaildb.com/images/media/drink/vxycca1454511367.jpg',
    ingredients: [{ name: '', measure: '' }],
  });

  useEffect(() => {
    const saved = localStorage.getItem('customRecipes');
    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  }, []);

  const saveRecipes = (newRecipes: CustomRecipe[]) => {
    localStorage.setItem('customRecipes', JSON.stringify(newRecipes));
    setRecipes(newRecipes);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.instructions) return;

    const newRecipe: CustomRecipe = {
      id: editingRecipe?.id || `custom-${Date.now()}`,
      ...formData,
    };

    let newRecipes: CustomRecipe[];
    if (editingRecipe) {
      newRecipes = recipes.map(r => r.id === editingRecipe.id ? newRecipe : r);
    } else {
      newRecipes = [...recipes, newRecipe];
    }

    saveRecipes(newRecipes);
    resetForm();
    close();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      category: 'Ordinary Drink',
      glass: 'Cocktail glass',
      instructions: '',
      image: 'https://www.thecocktaildb.com/images/media/drink/vxycca1454511367.jpg',
      ingredients: [{ name: '', measure: '' }],
    });
    setEditingRecipe(null);
  };

  const handleEdit = (recipe: CustomRecipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      nameEn: recipe.nameEn,
      category: recipe.category,
      glass: recipe.glass,
      instructions: recipe.instructions,
      image: recipe.image,
      ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', measure: '' }],
    });
    open();
  };

  const handleDelete = (id: string) => {
    const newRecipes = recipes.filter(r => r.id !== id);
    saveRecipes(newRecipes);
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', measure: '' }],
    });
  };

  const updateIngredient = (index: number, field: 'name' | 'measure', value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients.length > 0 ? newIngredients : [{ name: '', measure: '' }] });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '1.5rem 1rem',
        background: 'var(--card)',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            레시피 관리
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            내 커스텀 칵테일 레시피를 추가하고 관리하세요
          </p>
        </div>
      </header>

      <main className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div />
          <button onClick={() => { resetForm(); open(); }} className="btn btn-primary">
            + 레시피 추가
          </button>
        </div>

        {recipes.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>레시피가 없습니다</div>
            <p className="text-muted">나만의 칵테일 레시피를 추가해보세요</p>
            <button onClick={open} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              첫 레시피 추가하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {recipes.map(recipe => (
              <div key={recipe.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                />
                <div style={{ padding: '1rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{recipe.name}</div>
                      {recipe.nameEn && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{recipe.nameEn}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleEdit(recipe)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <span className="badge badge-secondary">{recipe.category}</span>
                  <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.75rem', lineClamp: 2 }}>
                    {recipe.instructions}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    재료: {recipe.ingredients.map(i => i.name).filter(n => n).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal opened={opened} onClose={close} title={editingRecipe ? '레시피 수정' : '레시피 추가'} size="lg">
          <Grid>
            <Grid.Col span={6}>
              <input
                type="text"
                placeholder="레시피 이름 (한국어)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <input
                type="text"
                placeholder="레시피 이름 (영어)"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="input"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <input
                type="text"
                placeholder="카테고리"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <input
                type="text"
                placeholder="글래스"
                value={formData.glass}
                onChange={(e) => setFormData({ ...formData, glass: e.target.value })}
                className="input"
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <input
                type="text"
                placeholder="이미지 URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="input"
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <textarea
                placeholder="레시피 설명"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="input"
                style={{ height: '100px', padding: '0.75rem', resize: 'vertical' }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>재료</div>
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="재료명"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    className="input"
                    style={{ flex: 2 }}
                  />
                  <input
                    type="text"
                    placeholder="양"
                    value={ing.measure}
                    onChange={(e) => updateIngredient(idx, 'measure', e.target.value)}
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => removeIngredient(idx)}
                    disabled={formData.ingredients.length === 1}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 0.5rem', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button onClick={addIngredient} className="btn btn-outline" style={{ height: 'auto', padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
                + 재료 추가
              </button>
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="xl">
            <button onClick={close} className="btn btn-outline">취소</button>
            <button onClick={handleSubmit} className="btn btn-primary">{editingRecipe ? '수정' : '추가'}</button>
          </Group>
        </Modal>
      </main>
    </div>
  );
}
