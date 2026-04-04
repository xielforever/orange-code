# 技能-Memory 集成指南

## 概述

本指南详细说明每个 Superpowers 技能如何与 Memory MCP 集成，包括记忆数据的读取、写入和自动更新点定义。

## 实体类型定义

### 项目实体（Project）
```typescript
{
  type: "project",
  name: string,
  description: string,
  createdAt: timestamp,
  status: "planning" | "in_progress" | "completed"
}
```

### 决策实体（Decision）
```typescript
{
  type: "decision",
  category: "tech_stack" | "architecture" | "feature" | "constraint",
  content: string,
  madeBy: string,
  madeAt: timestamp,
  rationale: string
}
```

### 约束实体（Constraint）
```typescript
{
  type: "constraint",
  name: string,
  description: string,
  priority: "must" | "should" | "could" | "wont"
}
```

### 成功标准实体（SuccessCriteria）
```typescript
{
  type: "success_criteria",
  name: string,
  description: string,
  measurable: boolean
}
```

### 阶段实体（Phase）
```typescript
{
  type: "phase",
  name: string,
  order: number,
  status: "pending" | "active" | "completed"
}
```

## 关系类型定义

- `HAS_DECISION`: 项目 → 决策
- `HAS_CONSTRAINT`: 项目 → 约束
- `HAS_SUCCESS_CRITERIA`: 项目 → 成功标准
- `HAS_PHASE`: 项目 → 阶段
- `NEXT_PHASE`: 阶段 → 阶段

---

## 技能集成详情

### 1. using-superpowers（使用 Superpowers）

#### 记忆读取内容
- 项目基本信息（名称、描述、状态）
- 已使用的技能历史
- 项目当前阶段

#### 记忆写入内容
- 当前技能使用记录
- 用户对技能的反馈

#### 自动更新点
- 技能启动时：读取项目记忆
- 技能完成时：记录技能使用结果

---

### 2. brainstorming（头脑风暴）

#### 记忆读取内容
- 项目目标和初始需求
- 已做出的架构决策
- 项目约束条件
- 成功标准

#### 记忆写入内容
- 创意和想法实体（Idea）
- 讨论和探索记录
- 关键决策点

#### 自动更新点
- 技能启动时："正在读取项目记忆..."
- 每次用户确认创意时："正在记录决策..."
- 技能完成时："正在保存结果到记忆..."

---

### 3. writing-plans（编写计划）

#### 记忆读取内容
- 头脑风暴阶段产生的创意和决策
- 项目约束和成功标准
- 技术栈选择

#### 记忆写入内容
- 计划实体（Plan）
- 任务分解（Task）
- 时间线（Timeline）

#### 自动更新点
- 技能启动时：读取项目记忆
- 计划关键节点确认时：记录决策
- 计划完成时：保存计划到记忆

---

### 4. test-driven-development（测试驱动开发）

#### 记忆读取内容
- 功能需求和规范
- 技术架构决策
- 测试策略

#### 记忆写入内容
- 测试实体（Test）
- 测试结果（TestResult）
- 代码质量指标

#### 自动更新点
- 技能启动时：读取记忆
- 测试通过/失败时：记录结果
- 技能完成时：保存测试成果

---

### 5. subagent-driven-development（子代理驱动开发）

#### 记忆读取内容
- 项目整体架构
- 已完成的模块
- 技术决策

#### 记忆写入内容
- 子代理任务分配
- 模块实现记录
- 集成状态

#### 自动更新点
- 技能启动时：读取记忆
- 每个子代理任务完成时：记录进度
- 技能完成时：保存完整结果

---

### 6. dispatching-parallel-agents（并行代理调度）

#### 记忆读取内容
- 可并行的任务列表
- 资源约束
- 依赖关系

#### 记忆写入内容
- 并行任务执行状态
- 资源使用情况
- 任务完成记录

#### 自动更新点
- 技能启动时：读取记忆
- 每个任务完成时：更新状态
- 技能完成时：保存完整调度结果

---

### 7. systematic-debugging（系统化调试）

#### 记忆读取内容
- 已知 bug 历史
- 系统架构
- 相关代码模块

#### 记忆写入内容
- Bug 实体（Bug）
- 调试步骤（DebugStep）
- 解决方案（Solution）

#### 自动更新点
- 技能启动时：读取记忆
- 发现关键线索时：记录发现
- 技能完成时：保存调试记录

---

### 8. executing-plans（执行计划）

#### 记忆读取内容
- 完整的项目计划
- 任务优先级
- 依赖关系

#### 记忆写入内容
- 任务执行状态
- 进度更新
- 实际耗时

#### 自动更新点
- 技能启动时：读取计划
- 每个任务完成时：更新进度
- 技能完成时：保存执行记录

---

### 9. verification-before-completion（完成前验证）

#### 记忆读取内容
- 成功标准
- 验收条件
- 质量要求

#### 记忆写入内容
- 验证结果（VerificationResult）
- 发现的问题
- 通过/未通过状态

#### 自动更新点
- 技能启动时：读取验证标准
- 每个检查项完成时：记录结果
- 技能完成时：保存验证报告

---

### 10. requesting-code-review（请求代码审查）

#### 记忆读取内容
- 代码变更范围
- 技术上下文
- 相关决策

#### 记忆写入内容
- 审查请求（ReviewRequest）
- 审查关注点
- 预期反馈

#### 自动更新点
- 技能启动时：读取代码上下文
- 审查要点确定时：记录关注点
- 技能完成时：保存审查请求

---

### 11. receiving-code-review（接收代码审查）

#### 记忆读取内容
- 审查反馈
- 代码修改历史
- 项目规范

#### 记忆写入内容
- 审查回应（ReviewResponse）
- 修改记录
- 学习点

#### 自动更新点
- 技能启动时：读取审查反馈
- 每次问题处理时：记录回应
- 技能完成时：保存审查结果

---

### 12. writing-skills（编写技能）

#### 记忆读取内容
- 现有技能规范
- 项目需求
- 技能使用模式

#### 记忆写入内容
- 新技能定义（Skill）
- 技能文档
- 示例代码

#### 自动更新点
- 技能启动时：读取现有技能
- 技能定义完成时：记录新技能
- 技能完成时：保存完整技能

---

### 13. using-git-worktrees（使用 Git 工作树）

#### 记忆读取内容
- 项目 Git 状态
- 分支策略
- 当前工作流

#### 记忆写入内容
- 工作树创建记录（Worktree）
- 分支操作历史
- 合并状态

#### 自动更新点
- 技能启动时：读取 Git 状态
- 每次工作树操作时：记录变更
- 技能完成时：保存 Git 操作记录

---

### 14. finishing-a-development-branch（完成开发分支）

#### 记忆读取内容
- 分支功能范围
- 测试结果
- 验收状态

#### 记忆写入内容
- 完成报告（CompletionReport）
- 功能清单
- 后续建议

#### 自动更新点
- 技能启动时：读取分支状态
- 完成检查时：记录结果
- 技能完成时：保存完成报告

---

## Memory MCP 工具使用示例

### 读取项目记忆
```javascript
// 调用 read_graph 获取项目上下文
const memory = await mcp.Memory.read_graph();
// 向用户显示："正在读取项目记忆..."
```

### 记录决策
```javascript
// 调用 add_observations 记录关键决策
await mcp.Memory.add_observations({
  observations: [
    {
      entityType: "decision",
      content: "选择 React 作为前端框架",
      category: "tech_stack"
    }
  ]
});
// 向用户显示："正在记录决策..."
```

### 保存结果
```javascript
// 调用 create_entities 创建实体
await mcp.Memory.create_entities({
  entities: [
    {
      type: "phase",
      name: "头脑风暴",
      status: "completed"
    }
  ]
});
// 调用 add_observations 补充观察
await mcp.Memory.add_observations({
  observations: [...]
});
// 向用户显示："正在保存结果到记忆..."
```

---

## 错误处理策略

### 静默降级
当 Memory MCP 不可用时，技能应继续执行，仅在结束时提醒用户。

```javascript
try {
  await mcp.Memory.read_graph();
} catch (error) {
  // 静默失败，不阻止技能执行
  // 仅在技能结束时提醒用户
}
```

### 可用性检测
```javascript
let memoryAvailable = true;

try {
  await mcp.Memory.read_graph();
} catch (error) {
  memoryAvailable = false;
  // 向用户显示：⚠️ Memory MCP 不可用，记忆功能将受限
}
```

---

## 完整工作流示例

### 示例：brainstorming 技能集成

```javascript
// 1. 技能开始时读取记忆
console.log("正在读取项目记忆...");
let projectContext = null;
try {
  projectContext = await mcp.Memory.read_graph();
} catch (error) {
  console.log("⚠️ Memory MCP 不可用，记忆功能将受限");
}

// 2. 执行头脑风暴...
// 用户确认创意选择

// 3. 关键决策点记录
console.log("正在记录决策...");
try {
  await mcp.Memory.add_observations({
    observations: [
      {
        entityType: "decision",
        content: "确定使用微服务架构",
        category: "architecture",
        rationale: "满足可扩展性需求"
      }
    ]
  });
} catch (error) {
  // 静默失败
}

// 4. 技能完成时保存
console.log("正在保存结果到记忆...");
try {
  await mcp.Memory.create_entities({
    entities: [
      {
        type: "phase",
        name: "头脑风暴",
        status: "completed"
      }
    ]
  });
} catch (error) {
  // 静默失败
} finally {
  if (!memoryAvailable) {
    console.log("\n💡 提示：安装 Memory MCP 可以获得以下功能：");
    console.log("  - 自动项目记忆");
    console.log("  - 决策历史追踪");
    console.log("  - 上下文持久化");
    console.log("  - 跨对话连贯性");
  }
}
```
