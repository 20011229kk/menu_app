import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Category, Dish, Menu } from '../models'

export class AppDB extends Dexie {
  categories!: Table<Category, string>
  dishes!: Table<Dish, string>
  menus!: Table<Menu, string>

  constructor() {
    super('menu_app')

    this.version(1).stores({
      categories: 'id, name, order, updatedAt, deletedAt',
      dishes: 'id, name, categoryId, updatedAt, deletedAt',
      menus: 'id, name, updatedAt, deletedAt'
    })
  }
}

export const db = new AppDB()
