import type { BaseEntity, Difficulty, IngredientItem, StepItem } from './common'

export interface Dish extends BaseEntity {
  name: string
  categoryId?: string | null
  description?: string
  ingredients: IngredientItem[]
  steps: StepItem[]
  cookTime?: number
  servings?: number
  difficulty?: Difficulty
  tips?: string
}
