import type { Dish } from '../models'

function normalize(input: string): string {
  return input.trim().toLowerCase()
}

export function matchesDish(dish: Dish, query: string): boolean {
  const keyword = normalize(query)
  if (!keyword) {
    return true
  }

  const haystack = [
    dish.name,
    dish.description ?? '',
    dish.ingredients.map((item) => item.name).join(' ')
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(keyword)
}
