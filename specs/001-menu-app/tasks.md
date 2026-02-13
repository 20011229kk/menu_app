---

description: "任务列表：轻量离线优先菜单/菜谱管理"
---

# 任务: 轻量离线优先菜单/菜谱管理

**输入**: 来自 `/specs/001-menu-app/` 的设计文档
**前置条件**: plan.md（必需）、spec.md（用户故事必需）

**测试**: 本功能未明确要求测试，暂不包含测试任务。

**组织方式**: 任务按用户故事分组，确保每个故事可独立实现与验证。

## 格式: `[ID] [P?] [Story] 描述`

- **[P]**: 可并行（不同文件，无依赖）
- **[Story]**: 任务归属的用户故事（例如 US1, US2, US3）
- 描述中包含准确文件路径

## 阶段 1：初始化（共享基础）

- [ ] T001 创建基础目录结构 `src/app`, `src/pages`, `src/components`, `src/models`, `src/services`, `src/stores`, `src/utils`
- [ ] T002 初始化前端工程（Vite + React + TypeScript）
- [ ] T003 [P] 初始化样式与基础布局框架（移动端优先）
- [ ] T004 [P] 建立全局路由与导航框架（首页/分类/菜品/菜单）
- [ ] T005 [P] 引入本地存储封装（Dexie）与基础数据库初始化

---

## 阶段 2：基础设施（阻塞前置）

- [ ] T006 定义数据模型类型在 `src/models/`（Category, Dish, Menu, 以及嵌套结构）
- [ ] T007 实现数据库表结构与索引在 `src/services/db.ts`
- [ ] T008 实现基础 CRUD 服务在 `src/services/`（categoryService, dishService, menuService）
- [ ] T009 实现软删除策略或硬删除二次确认策略（在服务层明确）
- [ ] T010 实现通用排序与搜索工具在 `src/utils/sort.ts` 与 `src/utils/search.ts`

**检查点**: 数据层与工具层稳定，可进入 UI 功能开发

---

## 阶段 3：用户故事 1 - 管理菜品与分类（优先级: P1）MVP（最小可行产品）

### 分类功能

- [ ] T011 [P] 分类列表页 `src/pages/categories/CategoryList.tsx`（展示、排序入口）
- [ ] T012 [P] 分类编辑表单 `src/components/categories/CategoryForm.tsx`
- [ ] T013 分类排序交互（上移/下移或拖拽）在 `src/pages/categories/CategoryList.tsx`
- [ ] T014 删除分类逻辑：菜品转为未分类（`categoryId = null`）

### 菜品功能

- [ ] T015 [P] 菜品列表页 `src/pages/dishes/DishList.tsx`（分组显示 + 排序切换）
- [ ] T016 [P] 菜品详情页 `src/pages/dishes/DishDetail.tsx`
- [ ] T017 [P] 菜品编辑页 `src/pages/dishes/DishEdit.tsx`
- [ ] T018 菜品编辑表单组件 `src/components/dishes/DishForm.tsx`
- [ ] T019 用料编辑组件 `src/components/dishes/IngredientList.tsx`（动态增删/排序）
- [ ] T020 步骤编辑组件 `src/components/dishes/StepList.tsx`（动态增删/排序）
- [ ] T021 菜品列表按分类分组 + 分类内排序切换
- [ ] T022 新增菜谱进入编辑态的点击路径控制（≤3 次点击）

**检查点**: 分类与菜品离线可用，MVP 交付

---

## 阶段 4：用户故事 2 - 管理菜单（优先级: P2）

- [ ] T023 [P] 菜单列表页 `src/pages/menus/MenuList.tsx`
- [ ] T024 [P] 菜单详情页 `src/pages/menus/MenuDetail.tsx`
- [ ] T025 [P] 菜单编辑页 `src/pages/menus/MenuEdit.tsx`
- [ ] T026 菜单项选择与排序组件 `src/components/menus/MenuItemPicker.tsx`
- [ ] T027 菜单项备注与份数编辑
- [ ] T028 菜单详情跳转到菜品详情

**检查点**: 菜单可创建、编辑、排序，并可查看菜品做法

---

## 阶段 5：用户故事 3 - 检索与备份（优先级: P3）

- [ ] T029 全局搜索栏与结果列表 `src/components/search/GlobalSearch.tsx`
- [ ] T030 搜索覆盖菜名/描述/用料关键字
- [ ] T031 JSON 导出功能 `src/services/exportService.ts`
- [ ] T032 导出入口与下载提示在设置页 `src/pages/settings/Settings.tsx`

**检查点**: 搜索与导出可独立使用

---

## 阶段 6：打磨与一致性

- [ ] T033 所有列表空态与无结果状态优化
- [ ] T034 全局排序规则一致性检查与修正
- [ ] T035 数据迁移兼容性检查（结构化字段保持）
- [ ] T036 更新 `changelog.md`

