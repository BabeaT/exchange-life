# AI 模拟服务契约

## 1. 适用范围

本契约供前端 Demo 的本地模拟适配器使用。它定义接口形状，不调用外部 AI，也不改变业务状态机和权限规则。未来真实 API 必须保持同等输入输出语义，替换服务实现而不是重写页面状态。

## 2. 通用约定

建议前端只依赖 `AiService` 接口，Demo 注入 `MockAiService`，未来在服务端注入 `ServerAiService`。

### 通用请求

```json
{
  "requestId": "req_001",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "v3",
  "locale": "zh-CN"
}
```

`actorId` 只用于 Demo 隔离；真实 API 必须从服务端会话取得用户身份，不能信任客户端字段。

### 通用任务状态

| 状态 | 前端含义 | 可用操作 |
|---|---|---|
| `idle` | 尚未调用 | 开始 |
| `loading` | 模拟延迟或真实任务处理中 | 取消页面等待；不丢当前输入 |
| `success` | Schema 合法的候选结果已返回 | 预览、人工编辑、本人确认 |
| `error` | 可识别失败 | 查看错误、重试、返回人工编辑 |
| `timeout` | 超过能力时限 | 重试或跳过非必需能力 |

### 通用响应外壳

```json
{
  "schemaVersion": "1.0",
  "requestId": "req_001",
  "taskId": "task_001",
  "status": "success",
  "data": {},
  "warnings": [],
  "sourceRefs": ["draft:v3"],
  "error": null,
  "retry": { "allowed": true, "retryToken": "retry_task_001", "attempt": 1 }
}
```

错误对象使用 `{ "code", "message", "recoverable", "field" }`。重试必须带原 `requestId` 或 `retryToken`，产生新 `taskId`，保持同一 `inputVersion`；输入改变则创建新请求。Mock 可通过请求中的 `mockScenario` 选择 `success`、`error` 或 `timeout`，不要在 UI 中硬编码结果。

## 3. `summarize-context`

- **调用**：`AiService.summarizeContext(input)`；未来 `POST /api/ai/summarize-context`。
- **输入字段**：通用字段；`draftRef`、`selectedTextRefs[]`、`pausePosition`、`requestedAction`（`review|organize|gentle_prompt`）、可选 `mockScenario`。
- **输出字段**：`themes[]`、`storyNodes[]`、`resumeHint`、可选 `gentleQuestion`、`uncertainties[]`。
- **loading**：表达页 AI 入口显示“正在回顾”，编辑器保持可用。
- **success**：在本人侧栏展示，只作为私人工作摘要。
- **error/timeout**：不改变草稿；显示重试和“继续自己写”。
- **retry**：复用同一草稿版本；草稿已更新时重新请求。
- **页面使用**：P14 独立表达工作区。

```json
{
  "requestId": "req_sum_01",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "draft-v3",
  "draftRef": "draft_a",
  "selectedTextRefs": ["paragraph:1", "paragraph:2"],
  "pausePosition": 428,
  "requestedAction": "review",
  "mockScenario": "success",
  "result": {
    "themes": ["离开前的犹豫"],
    "storyNodes": [{"label": "车站告别", "sourceRefs": ["paragraph:2"]}],
    "resumeHint": "你停在了上车前的那一刻。",
    "gentleQuestion": null,
    "uncertainties": ["具体日期记不清"]
  }
}
```

## 4. `transcribe-audio`

- **调用**：`AiService.transcribeAudio(input)`；未来 `POST /api/ai/transcribe-audio`。
- **输入字段**：`audioAssetRef`、`languageHint`、`dialectHint`、`outputModes[]`（`verbatim|readable`）、通用字段。
- **输出字段**：`detectedLanguage`、`segments[]`（时间码、原话、置信度）、`verbatimText`、`readableText`、`lowConfidenceRanges[]`。
- **loading**：录音卡显示转写进度，原音仍可播放和删除。
- **success**：本人校正后才能用于整理；书面版不覆盖原话版。
- **error/timeout**：保留原音，提供重试或手动输入。
- **retry**：同一音频引用可重试；允许修改语言提示后新建任务。
- **页面使用**：P14 的录音素材卡。

```json
{
  "requestId": "req_asr_01",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "audio-v1",
  "audioAssetRef": "media_audio_01",
  "languageHint": "zh-CN",
  "dialectHint": "auto",
  "outputModes": ["verbatim", "readable"],
  "result": {
    "detectedLanguage": "yue",
    "segments": [{"startMs": 0, "endMs": 3200, "text": "我记得嗰日落雨", "confidence": 0.94}],
    "verbatimText": "我记得嗰日落雨。",
    "readableText": "我记得那天下雨。",
    "lowConfidenceRanges": []
  }
}
```

## 5. `understand-image`

- **调用**：`AiService.understandImage(input)`；未来 `POST /api/ai/understand-image`。
- **输入字段**：`imageAssetRef`、`userCaption`、`requestedTasks[]`（`ocr|objects|scene|time_clues`）、通用字段。
- **输出字段**：`ocrBlocks[]`、`objects[]`、`sceneDescription`、`explicitTimeClues[]`、`lowConfidenceRegions[]`、`prohibitedInferencesOmitted`。
- **loading**：图片保持可见，分析骨架屏不阻塞文字表达。
- **success**：结果仅本人可见，可编辑图片说明和公开选择。
- **error/timeout**：保留原图，允许手动说明或重试。
- **retry**：复用原图版本；更换裁剪区域时创建新请求。
- **页面使用**：P14 图片素材卡和 P16 附件选择。

```json
{
  "requestId": "req_img_01",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "image-v1",
  "imageAssetRef": "media_image_01",
  "userCaption": "旧车票",
  "requestedTasks": ["ocr", "objects", "time_clues"],
  "result": {
    "ocrBlocks": [{"text": "广州至北京", "confidence": 0.98}],
    "objects": ["纸质车票"],
    "sceneDescription": "一张放在桌面上的旧车票",
    "explicitTimeClues": [],
    "lowConfidenceRegions": [],
    "prohibitedInferencesOmitted": true
  }
}
```

## 6. `organize-narrative`

- **调用**：`AiService.organizeNarrative(input)`；未来 `POST /api/ai/organize-narrative`。
- **输入字段**：`contextCardRef`、`sourceRefs[]`、`sourceSnapshotVersion`、`toneConstraint`（默认 `preserve`）、`preserveUncertainty=true`、通用字段。
- **输出字段**：`titleSuggestion`、`organizedText`、`sections[]`、`diffOperations[]`、`uncertainties[]`、`claims[]` 及来源。
- **loading**：P15 显示整理中，允许返回原始表达但不可寄出。
- **success**：保存为私人候选稿，展示原文/整理稿/差异；本人编辑确认。
- **error/timeout**：原材料不变；可重试或继续人工整理。
- **retry**：输入版本不变可重试；任何源内容修改必须创建新版本。
- **页面使用**：P15 AI 整理确认。

```json
{
  "requestId": "req_org_01",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "sources-v4",
  "contextCardRef": "card_01",
  "sourceRefs": ["draft:v3", "transcript:t1"],
  "sourceSnapshotVersion": "snapshot-v4",
  "toneConstraint": "preserve",
  "preserveUncertainty": true,
  "result": {
    "titleSuggestion": "那天的车站",
    "organizedText": "我记得那天下着雨……",
    "sections": [{"heading": null, "text": "我记得那天下着雨……", "sourceRefs": ["draft:v3"]}],
    "diffOperations": [{"type": "punctuation", "sourceRef": "draft:v3"}],
    "uncertainties": ["日期大概在秋天"],
    "claims": [{"text": "当天下雨", "sourceRefs": ["draft:v3"]}]
  }
}
```

## 7. `generate-letter`

- **调用**：`AiService.generateLetter(input)`；未来 `POST /api/ai/generate-letter`。
- **输入字段**：`confirmedNarrativeRef`、`confirmedTextVersion`、`layoutPreference`、`imageRatio`、`publicAttachmentRefs[]`、通用字段。
- **输出字段**：`letterDraft`（标题、段落、署名）、`layoutBlocks[]`、`keySceneCandidates[]`、`attachmentPlacements[]`。
- **loading**：信件编辑页显示生成版式，不允许把旧版误标为最新。
- **success**：产生未寄出的信件候选，仍需本人最终预览确认。
- **error/timeout**：保留已确认正文，可切换纯文字信件。
- **retry**：同一正文版本可换布局；正文改变必须重新确认后请求。
- **页面使用**：P16 图文信件编辑、P17 预览。

```json
{
  "requestId": "req_letter_01",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "narrative-confirmed-v1",
  "confirmedNarrativeRef": "narrative_01",
  "confirmedTextVersion": "v1",
  "layoutPreference": "text_first",
  "imageRatio": "balanced",
  "publicAttachmentRefs": [],
  "result": {
    "letterDraft": {"title": "那天的车站", "paragraphs": ["我记得那天下着雨……"], "signature": "甲"},
    "layoutBlocks": [{"type": "text", "ref": "paragraph:1"}],
    "keySceneCandidates": [{"id": "scene_1", "description": "雨中的旧车站", "sourceRefs": ["paragraph:1"]}],
    "attachmentPlacements": []
  }
}
```

## 8. `generate-illustration`

- **调用**：`AiService.generateIllustration(input)`；未来 `POST /api/ai/generate-illustration`。
- **输入字段**：`confirmedSceneRef`、`sceneDescription`、`style`、`aspectRatio`、`personPolicy`、通用字段。
- **输出字段**：`assetRef`、`previewUrl`（Mock 本地资源）、`altText`、`disclosureLabel`、`sourceRefs[]`。
- **loading**：单个画面占位，不阻塞文字编辑。
- **success**：候选插图需本人选择后进入信件；标明“叙事插图”。
- **error/timeout**：可删除画面、重试或使用原图/纯文字。
- **retry**：保留场景来源，可修改风格后新建任务。
- **页面使用**：P16 图文信件编辑。

```json
{
  "requestId": "req_art_01",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "scene-v1",
  "confirmedSceneRef": "scene_1",
  "sceneDescription": "雨中的旧车站，不出现可识别真人面孔",
  "style": "picture_book",
  "aspectRatio": "4:3",
  "personPolicy": "no_identifiable_face",
  "result": {
    "assetRef": "mock_illustration_01",
    "previewUrl": "/mock-assets/illustration-station.svg",
    "altText": "雨中的旧车站叙事插图",
    "disclosureLabel": "AI叙事插图",
    "sourceRefs": ["scene_1"]
  }
}
```

## 9. `read-letter`

- **调用**：`AiService.readLetter(input)`；未来 `POST /api/ai/read-letter`。
- **输入字段**：`deliveredLetterRef`、`voiceKey`、`speed`、`includeImageDescriptions`、通用字段。
- **输出字段**：`audioRef`、`audioUrl`、`durationMs`、`wordTimings[]`、可选 `imageDescriptionTrackRef`。
- **loading**：阅读页显示音频准备中，正文仍可阅读且不自动播放。
- **success**：用户主动点击播放；只朗读最终正文。
- **error/timeout**：正文不受影响；可重试、换声音或继续阅读。
- **retry**：同一信件版本和设置复用；设置改变为新任务。
- **页面使用**：P20 阅读信件。

```json
{
  "requestId": "req_tts_01",
  "actorId": "user_b",
  "exchangeId": "ex_001",
  "inputVersion": "letter-delivered-v1",
  "deliveredLetterRef": "letter_a_01",
  "voiceKey": "neutral_warm",
  "speed": 1.0,
  "includeImageDescriptions": false,
  "result": {
    "audioRef": "mock_audio_letter_01",
    "audioUrl": "/mock-assets/letter-audio.mp3",
    "durationMs": 42000,
    "wordTimings": [{"textRef": "paragraph:1", "startMs": 0, "endMs": 12000}],
    "imageDescriptionTrackRef": null
  }
}
```

## 10. `generate-intersection`

- **调用**：`AiService.generateIntersection(input)`；未来 `POST /api/ai/generate-intersection`。
- **输入字段**：`exchangeType`、`publicLetterRefs[2]`、`publicAttachmentRefs[]`、`sourceSnapshotVersion`、`bothReadConfirmed`、通用字段。真实接口由服务端读取引用，客户端正文无效。
- **输出字段**：`title`、`intersectionType`、`sharedElements[]`、`perspectives[]`、`unseenByEachOther[]` 或 `thematicEchoes[]`、`quotes[]`、`sourceSnapshot`。
- **loading**：P22 显示交汇生成中，原信可继续查看。
- **success**：双方看到同一版本，可反馈；状态机随后创建碎片。
- **error/timeout**：保留原信，不创建碎片；允许重试。
- **retry**：必须复用或重新固定相同公开来源；公开版本改变时重新校验资格。
- **页面使用**：P22 AI 视角交汇、P23 记忆碎片。

```json
{
  "requestId": "req_inter_01",
  "actorId": "user_a",
  "exchangeId": "ex_001",
  "inputVersion": "public-snapshot-v1",
  "exchangeType": "shared_event",
  "publicLetterRefs": ["letter_a:v1", "letter_b:v1"],
  "publicAttachmentRefs": [],
  "sourceSnapshotVersion": "snapshot-v1",
  "bothReadConfirmed": true,
  "result": {
    "title": "同一场雨里的两个视角",
    "intersectionType": "shared_event",
    "sharedElements": [{"text": "双方都记得车站下雨", "sourceRefs": ["letter_a:v1", "letter_b:v1"]}],
    "perspectives": [{"owner": "user_a", "text": "注意到离开的犹豫", "sourceRefs": ["letter_a:v1"]}],
    "unseenByEachOther": [],
    "quotes": [],
    "sourceSnapshot": ["letter_a:v1", "letter_b:v1"]
  }
}
```

## 11. `retrieve-memory`

- **调用**：`AiService.retrieveMemory(input)`；未来 `POST /api/ai/retrieve-memory`，并在服务端接权限过滤后的检索层。
- **输入字段**：`query`、`scope`（Demo 为 `private_self|shared_space`）、`spaceId`、`purpose`、`limit`、通用字段。
- **输出字段**：`matches[]`（摘要、来源、版本、归属、可见性、分数）、`scopeApplied`、`hasMore`。
- **loading**：仅在用户主动打开未来记忆检索入口后显示。
- **success**：返回可供本人选择的引用候选，不自动写入草稿或 Prompt。
- **error/timeout**：不影响当前编辑；可重试或关闭检索。
- **retry**：同一查询和权限快照可重试；身份或范围变化必须重新授权。
- **页面使用**：当前 Demo 可在开发调试面板模拟，不作为最短主流程页面。

```json
{
  "requestId": "req_rag_01",
  "actorId": "user_a",
  "exchangeId": "ex_002",
  "inputVersion": "permission-snapshot-v1",
  "query": "以前关于车站的共同记忆",
  "scope": "shared_space",
  "spaceId": "space_01",
  "purpose": "user_selected_reference",
  "limit": 3,
  "result": {
    "matches": [{"memoryRef": "fragment_01", "summary": "一次关于离别车站的交汇记忆", "sourceVersion": "v1", "ownerScope": "shared", "visibility": "both", "score": 0.91}],
    "scopeApplied": "shared_space",
    "hasMore": false
  }
}
```

## 12. Mock 实现与真实 API 替换边界

- 页面组件只调用 `AiService`，不直接读取 Mock JSON 文件。
- `MockAiService` 负责延迟、成功、错误、超时和固定数据；业务 Store 负责权限与状态机，Mock AI 不得直接寄信或创建记忆。
- `ServerAiService` 未来只存在于服务端，负责会话身份、权限校验、Prompt、供应商调用和 Schema 校验。
- 替换时保持方法名、输入 DTO、响应外壳、错误码和确认状态；将本地 `previewUrl` 换为受控签名资源。
- 自动化测试对两种实现运行同一组契约测试，特别验证私人输入不进入交汇和检索结果。
