export type Id = string

export type Timestamp = string

export interface BaseEntity {
  id: Id
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt?: Timestamp | null
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface IngredientItem {
  id: Id
  name: string
  amount?: number
  unit?: string
  note?: string
}

export interface StepItem {
  id: Id
  order: number
  content: string
  timerMinutes?: number
  imagePlaceholder?: string
}

export interface MenuItem {
  id: Id
  dishId: Id
  servings?: number
  note?: string
  order: number
}
