# 已实现 Web Demo 路由表

创建流程支持“共同事件 / 人生片段”与“双方独立表达 / 我先告诉对方”两个独立维度的四种组合。

| 路由 | 页面 | 核心能力 |
|---|---|---|
| `/` | 品牌入口 | 单行品牌标题、固定两行主文案、绘本氛围与单一进入操作；无底部副标题 |
| `/start` | 进入方式 | 创建交换、邀请码、登录状态 |
| `/auth` | 登录注册 | 本地账号模拟与业务回跳 |
| `/profile` | 个人资料 | 头像、昵称和错误/保存状态 |
| `/home` | 产品首页 | 交换、信件、草稿、记忆入口及状态 |
| `/exchanges/new` | 创建交换 | 两个独立维度与四种组合 |
| `/exchanges/new/event` | 共同事件卡 | 中性线索、预览与确认 |
| `/exchanges/new/theme` | 人生主题卡 | 预设与自定义主题 |
| `/exchanges/new/review` | 创建确认 | 组合、前置卡和送达方式 |
| `/exchanges/:id/invite` | 邀请创建 | 邀请码、复制、分享和加入状态 |
| `/join` | 加入交换 | 有效、无效、失效和已加入状态 |
| `/exchanges/:id/context` | 受邀前置卡 | 事件卡只读或主题确认 |
| `/exchanges/:id` | 双人空间 | 双方粗粒度状态和流程入口 |
| `/exchanges/:id/write` | 独立表达 | 文字、模拟语音、图片和 AI 陪伴 |
| `/exchanges/:id/organize` | AI 整理 | 加载、错误、对照、编辑和本人确认 |
| `/exchanges/:id/compose` | 图文信件 | 三种图文比例和插图替换 |
| `/exchanges/:id/preview` | 最终预览 | 收信人视角与隐私提示 |
| `/exchanges/:id/send` | 发送设置 | 立即、定时、失败和确认 |
| `/exchanges/:id/waiting` | 等待交换 | 托管、对方状态、定时与送达推进 |
| `/exchanges/:id/delivery/:letterId` | 视角抵达（信件载体） | 记忆信使动画和静态降级，表达个人视角抵达对方 |
| `/exchanges/:id/letters/:letterId` | 阅读信件 | 封面、分页、进度和朗读模拟 |
| `/exchanges/:id/letters/:letterId/respond` | 情感回应 | 5 种产品专属表情和暂不回应 |
| `/exchanges/:id/reply-choice/:letterId` | 回信选择 | 只回应、回信或稍后决定 |
| `/exchanges/:id/convergence` | 视角交汇 | 资格、加载、失败、时间线、双视角和保存 |
| `/exchanges/:id/memory` | 记忆碎片 | 两封信、交汇和共同保存 |
| `/memory-tree` | 共同记忆树 | 空树、节点、共同浇水和非惩罚规则 |
| `/letters` | 信件列表 | 已寄出、托管、收到和已读 |
| `/space` | 个人空间 | 资料、草稿、原始素材和历史 |
| `/settings` | 设置 | 资料、信使、朗读、动态和隐私 |
| `/messenger` | 记忆信使 | 轻测试、预设选择和更换 |
| `/demo-control` | Demo 控制台 | 双用户切换和全状态快速推进 |
| `/style-lab` | Style Lab | Token、角色、组件与状态样本 |
| `/status/loading` | 加载状态 | 通用加载 |
| `/status/network` | 网络异常 | 保存与重试说明 |
| `/forbidden` | 无权限 | 私人内容权限提示 |
| `/404` | 页面不存在 | 失效链接恢复 |
