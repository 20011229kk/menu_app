import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './Layout'
import { HomePage } from '../pages/home/Home'
import { CategoryListPage } from '../pages/categories/CategoryList'
import { DishListPage } from '../pages/dishes/DishList'
import { DishDetailPage } from '../pages/dishes/DishDetail'
import { DishEditPage } from '../pages/dishes/DishEdit'
import { MenuListPage } from '../pages/menus/MenuList'
import { MenuDetailPage } from '../pages/menus/MenuDetail'
import { MenuEditPage } from '../pages/menus/MenuEdit'
import { SettingsPage } from '../pages/settings/Settings'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="categories" element={<CategoryListPage />} />
          <Route path="dishes" element={<DishListPage />} />
          <Route path="dishes/new" element={<DishEditPage />} />
          <Route path="dishes/:dishId" element={<DishDetailPage />} />
          <Route path="dishes/:dishId/edit" element={<DishEditPage />} />
          <Route path="menus" element={<MenuListPage />} />
          <Route path="menus/:menuId" element={<MenuDetailPage />} />
          <Route path="menus/:menuId/edit" element={<MenuEditPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
