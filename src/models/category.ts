import type { BaseEntity } from './common'

export interface Category extends BaseEntity {
  name: string
  order: number
}
