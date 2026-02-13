import Dexie, { Table } from 'dexie'

type AnyRecord = Record<string, unknown>

export class AppDB extends Dexie {
  categories!: Table<AnyRecord, string>
  dishes!: Table<AnyRecord, string>
  menus!: Table<AnyRecord, string>

  constructor() {
    super('menu_app')

    this.version(1).stores({
      categories: 'id, name, order, updatedAt',
      dishes: 'id, name, categoryId, updatedAt',
      menus: 'id, name, updatedAt'
    })
  }
}

export const db = new AppDB()
