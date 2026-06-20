# 魔境獵人 (Magic Realm Hunter)

日系像素風放置遊戲，靈感來自魔物獵人系列（玩法參考，原創內容）。

## 版本
- **V_0601** — 2026-06-20 核心引擎 MVP

## 規格
- 7 種武器：劍、槍、弓、雙刀、太刀、重錘、火槍刀
- 30 隻一般魔物（6 個棲息地）+ 10 隻 Boss
- 中英雙語
- AI 生圖（MiniMax 像素風）
- 純前端 HTML+CSS+JS，localStorage 存檔
- GitHub Pages 部署

## 技術棧
- 純前端 vanilla JS（無框架、無建置工具）
- 單一 index.html 入口
- 模組化：core / combat / monsters / skills / ui / i18n
- 美術：AI 生成（MiniMax）後手動像素化處理

## 目錄結構
```
magic-realm-hunter/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── core.js       # 遊戲核心 loop、狀態管理
│   ├── combat.js     # 戰鬥、傷害、技能計算
│   ├── monsters.js   # 魔物資料、圖鑑
│   ├── skills.js     # 技能樹邏輯
│   ├── weapons.js    # 武器資料
│   ├── ui.js         # 介面渲染
│   └── i18n.js       # 多語言
├── locales/
│   ├── zh-TW.json
│   └── en.json
└── assets/
    ├── monsters/     # 魔物圖
    └── weapons/      # 武器圖
```

## 待 Alex 提供
- GitHub 帳號名（最後 deploy 階段需要）
