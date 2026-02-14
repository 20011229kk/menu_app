# menu_app

一个本地优先、可选云同步的菜单/菜谱管理微信小程序。

## 项目重点

1. 本地优先：所有数据默认保存在本地，离线可用。
2. 结构化菜谱：用料与步骤结构化存储，便于复用与扩展。
3. 情侣共享：通过邀请码加入共享空间，支持两人协作编辑。
4. 轻量易用：新增/编辑流程尽量短、少点击。
5. 图片支持：菜品与菜单支持封面图，设置页支持“我们的菜单”展示图。

## 运行方式（微信小程序）

1. 安装依赖（小程序端）
   - 进入 `miniprogram/` 目录执行 `npm install`
   - 在微信开发者工具中点击“构建 npm”
2. 打开项目
   - 使用微信开发者工具打开项目根目录 `/Users/project/menu_app`
   - 或直接打开 `miniprogram/` 目录（需配合 `project.config.json`）
3. 运行
   - 选择基础库版本 >= 3.7.0
   - 直接点击“编译/预览”

## 云开发配置（可选）

1. 在微信开发者工具中启用“云开发”
2. 选择云环境（当前默认：`cloud1-0gq8eadpe4785d9c`）
3. 右键 `cloudfunctions/` 下的函数：
   - `coupleCreate`、`coupleJoin`、`sync` 依次“上传并部署”
4. 数据库需有集合：
   - `couples`、`categories`、`dishes`、`menus`

## 目录结构（节选）

1. `miniprogram/` 小程序源码
2. `cloudfunctions/` 云函数
3. `specs/` 需求与任务文档
4. `changelog.md` 变更记录

