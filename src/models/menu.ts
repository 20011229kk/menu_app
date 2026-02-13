import type { BaseEntity, MenuItem } from './common'

export interface Menu extends BaseEntity {
  name: string
  items: MenuItem[]
}
