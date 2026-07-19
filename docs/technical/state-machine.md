# 状态机设计

> 2026-07 模型补充：`人生片段`按“一段人生/人生周期”实现；信件状态机继续负责送达包装，最终内容实体区分故事源稿、个人绘本和共同绘本。双方独立表达时先托管双方源稿，等待两边提交后才生成共同绘本。

## 1. 状态域

交换、参与者草稿、信件、阅读、回信、AI 交汇和记忆碎片分别维护状态，避免用一个总状态隐含多个并行事实。

## 2. 交换状态

```mermaid
stateDiagram-v2
  [*] --> configuring
  configuring --> inviting: A 确认两维度与前置卡
  inviting --> connected: 有效 B 绑定
  connected --> expressing: 任一方开始表达
  expressing --> delivery_pending: 已产生待送达信件
  delivery_pending --> delivered: 满足对应送达规则
  delivered --> converging: 双方公开信且双向已读
  converging --> completed: 交汇与记忆碎片完成
  inviting --> cancelled: A 取消
  connected --> cancelled: 允许的取消操作
```

| 状态 | 进入条件 | 退出条件 | 异常处理 |
|---|---|---|---|
| configuring | A 开始创建 | 两维度、前置卡、送达方式均确认 | 校验失败留在当前状态 |
| inviting | 交换和邀请码已创建 | 唯一 B 成功绑定 | 无效/失效/自用邀请码拒绝绑定 |
| connected | A、B 已绑定 | 任一方开始表达 | B 无法识别事件时保持并允许稍后继续 |
| expressing | 有私人草稿或整理任务 | 至少一封信寄出 | 保存失败保留本地恢复信息，不泄露内容 |
| delivery_pending | 有托管或预约信件 | 送达条件满足 | 预约到时但缺信则等待或重约 |
| delivered | 至少一封信已送达 | 双向交汇条件满足或保持单方完成 | 单方无回信时可长期停留 |
| converging | 双方公开信且双向已读 | 交汇成功并生成碎片 | 失败保留原信，允许重试 |
| completed | 共同碎片生成 | 无自动退出 | 共同内容变更需提示双方影响 |

## 3. 草稿与信件状态

```mermaid
stateDiagram-v2
  [*] --> editing
  editing --> organizing: 用户完成表达
  organizing --> confirmation_required: AI 整理成功
  organizing --> organize_failed: AI 整理失败
  organize_failed --> organizing: 用户重试
  confirmation_required --> editing: 用户补充原始内容
  confirmation_required --> composing: 本人确认整理稿
  composing --> final_review: 图文信件可预览
  final_review --> composing: 用户返回修改
  final_review --> sent: 本人确认寄出
  sent --> editing: 送达前取回
  sent --> held: 双方独立表达且条件未满足
  sent --> delivery_pending: 单方送达或条件满足
  held --> delivery_pending: 双方均寄出且预约条件满足
  delivery_pending --> delivered: 配送完成
  delivered --> opened: 收信人主动开启
  opened --> read: 收信人完成阅读确认/表情回应
```

关键异常：自动保存失败不得丢弃已录片段；转写/OCR/插图失败不能覆盖原材料；确认后修改正文必须使相关摘要、插图和预览失效；已送达信件不可走普通取回路径。

## 4. 两种交换方式差异

### 双方独立表达

- A、B 各有独立草稿和信件状态机。
- 任一信先进入 `held`，直至双方均为 `sent/held`；预约模式还需到时。
- 两封信必须作为同一送达批次从 `delivery_pending` 进入 `delivered`。
- 对方只能看到粗粒度交换状态，不能读取对方草稿或托管信件正文。

### 我先告诉对方

- A 的信可从 `sent` 直接进入 `delivery_pending`，不等待 B。
- B 阅读并发表情后，A 的单方流程可稳定停留在已读状态。
- B 主动回信时才创建关联回信草稿；回信走完整确认与寄出状态机。
- 不得由系统自动创建回信任务、倒计时或催促状态。

## 5. 阅读与回信状态

```mermaid
stateDiagram-v2
  [*] --> unopened
  unopened --> reading: 主动打开信封
  reading --> acknowledged: 发送专属表情并确认已读
  acknowledged --> no_reply: 暂不回信
  acknowledged --> reply_drafting: 主动选择回信
  no_reply --> reply_drafting: 日后主动回信
  reply_drafting --> reply_sent: 回信本人确认并寄出
  reply_sent --> reciprocal_read: 原寄信人确认阅读
```

阅读位置保存失败允许重新定位；表情发送失败不应错误标记已读；重复请求必须幂等，避免产生多个主要回应。

## 6. AI 交汇与记忆碎片

```mermaid
stateDiagram-v2
  [*] --> ineligible
  ineligible --> eligible: 双方最终公开信存在且双向已读
  eligible --> generating: 发起生成
  generating --> generated: 生成成功
  generating --> failed: 生成失败
  failed --> generating: 重试
  generated --> flagged: 任一方反馈问题
  flagged --> generating: 请求重生成
  generated --> memory_created: 生成共同记忆碎片
  memory_created --> [*]
```

进入 `eligible` 前必须在服务端重新校验唯一数据源。生成失败、内容被标记或重生成均不得修改两封原信。记忆碎片仅在交汇成功后创建，并与双方空间中的同一实体关联。

## 7. 一段人生记录状态

```mermaid
stateDiagram-v2
  [*] --> recording
  recording --> entry_saved: 完成一条私人记录
  entry_saved --> recording: 继续新增或编辑
  entry_saved --> excluded: 本人排除该记录
  excluded --> recording: 重新纳入
  recording --> summarizing: 周期结束或本人主动结束
  summarizing --> source_review: 个人时间线和故事源稿候选生成
  source_review --> recording: 返回补充
  source_review --> source_submitted: 本人确认整个项目
```

单条记录的 `entry_saved` 不得推进交换公开状态。双人模式下，对方只能获得项目级 `recording/source_submitted` 投影，不能获得记录数量、日期和媒体元数据。

## 8. 个人与共同绘本状态

### 个人绘本

`source_confirmed → generating → review_required → confirmed → delivery_pending → delivered`

仅“我先告诉对方”模式进入个人绘本流水线。失败回到 `review_required/failed`，不影响源稿。

### 共同绘本

```mermaid
stateDiagram-v2
  [*] --> awaiting_sources
  awaiting_sources --> sources_locked: 双方源稿均提交
  sources_locked --> generating: 锁定公开来源快照
  generating --> joint_review: 共同故事与插图生成成功
  generating --> failed: 生成失败
  failed --> generating: 重试
  joint_review --> disputed: 任一方标记问题
  disputed --> generating: 按反馈重生成
  joint_review --> approved: 双方分别确认
  approved --> memory_created: 归档共同记忆
```

共同绘本的审批按用户分别记录，不允许一个用户替另一方确认。未双确认版本可以回看和继续校对，但不能标记为共同记忆。
