# 实施计划: [FEATURE]

**分支**: `[###-feature-name]` | **日期**: [DATE] | **规格**: [link]
**输入**: 来自 `/specs/[###-feature-name]/spec.md` 的功能规范

**说明**: 此模板由 `/speckit.plan` 命令填写。执行流程见 `.specify/templates/commands/plan.md`。

## 摘要

[从功能规范提取：主要需求 + 技术方案（来自研究）]

## 技术背景

<!--
  需要行动：用项目实际技术信息替换此处内容。
  下述结构仅用于指导迭代过程。
-->

**语言/版本**: [例如：Python 3.11, Swift 5.9, Rust 1.75 或 需要澄清]  
**核心依赖**: [例如：FastAPI, UIKit, LLVM 或 需要澄清]  
**存储**: [如适用，例如：PostgreSQL, CoreData, files 或 N/A]  
**测试**: [例如：pytest, XCTest, cargo test 或 需要澄清]  
**目标平台**: [例如：Linux server, iOS 15+, WASM 或 需要澄清]
**项目类型**: [single/web/mobile（单体/前后端/移动） - 决定源码结构]  
**性能目标**: [领域指标，例如：1000 req/s, 10k lines/sec, 60 fps 或 需要澄清]  
**约束**: [领域约束，例如：<200ms p95, <100MB 内存, 可离线 或 需要澄清]  
**规模/范围**: [领域规模，例如：10k 用户, 1M LOC, 50 屏 或 需要澄清]

## 宪章检查

*闸门：必须在 Phase 0 研究前通过，并在 Phase 1 设计后复查。*

- 文档必须中文化\n+- 代码变更必须记录 `changelog.md` 且提交对应 commit\n+- 方案必须满足本地优先与离线可用\n+- 结构化数据与稳定 ID 约束已满足\n+- 所有列表具备明确排序规则\n+- 需求可测试且可独立验证

## 项目结构

### 文档（本功能）

```text
specs/[###-feature]/
├── plan.md              # 本文件（/speckit.plan 输出）
├── research.md          # Phase 0 输出（/speckit.plan）
├── data-model.md        # Phase 1 输出（/speckit.plan）
├── quickstart.md        # Phase 1 输出（/speckit.plan）
├── contracts/           # Phase 1 输出（/speckit.plan）
└── tasks.md             # Phase 2 输出（/speckit.tasks - 非 /speckit.plan 创建）
```

### 源码（仓库根目录）
<!--
  需要行动：用本功能的实际结构替换下方占位结构。
  删除未使用的选项并补充真实路径（如 apps/admin, packages/something）。
  交付的计划中不得保留“Option”标记。
-->

```text
# [如未使用请删除] 选项 1：单体项目（默认）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [如未使用请删除] 选项 2：Web 应用（检测到“frontend”+“backend”时）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [如未使用请删除] 选项 3：移动端 + API（检测到“iOS/Android”时）
api/
└── [同上 backend 结构]

ios/ 或 android/
└── [平台结构：功能模块、UI 流程、平台测试]
```

**结构决策**: [说明最终采用的结构，并引用上方真实目录]

## 复杂度追踪

> **仅当“宪章检查”存在违背且必须保留时填写**

| 违背项 | 需要原因 | 被拒绝的更简单替代方案 |
|-----------|------------|-------------------------------------|
| [例如：第 4 个项目] | [当前需要] | [为什么 3 个项目不够] |
| [例如：Repository 模式] | [具体问题] | [为何直接访问数据库不够] |
