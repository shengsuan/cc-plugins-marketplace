[![English README](https://img.shields.io/badge/Language-EN-blue.svg?longCache=true&style=for-the-badge)](./README.en.md)

# Claude Code 插件市场

一个精选的 Claude Code 高质量插件目录。包含 claude-code 官方插件市场中的所有插件，另外精选收录了第三方插件市场的优秀插件。

> **⚠️ 注意:** 在安装、更新或使用插件之前，请务必确认您信任该插件。Anthropic 无法控制插件中包含的 MCP 服务器、文件或其他软件，也无法保证它们能够按预期运行或不会发生更改。更多信息，请访问各插件的主页。

## 结构

- **`/plugins`** - 由 Anthropic 开发和维护的内部插件
- **`/external_plugins`** - 来自合作伙伴和社区的第三方插件

## 安装

用户可以通过 Claude Code 的插件系统直接从该市场安装插件。

运行 `/plugin install {plugin-name}@claude-plugin-directory`

完成安装，或运行 `/plugin > Discover` 命令浏览插件目录

## 贡献

### 内部插件

内部插件由 Anthropic 团队成员开发。请参阅 `/plugins/example-plugin` 获取参考实现。

### 外部插件

第三方合作伙伴可以提交插件以供上架应用商店。外部插件必须符合质量和安全标准才能获得批准。

#### 自动收录插件

我们提供了一个自动化脚本来收录第三方插件:

```bash
npm run add-plugin -- --repo https://github.com/username/plugin-repo
```

该脚本将自动:
- 克隆插件仓库
- 验证插件结构
- 复制到 `external_plugins` 目录

详细使用说明请查看 [scripts/README.md](./scripts/README.md)。

## 插件目录结构

每个插件都遵循标准结构：

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # 插件元数据（必填）
├── .mcp.json            # MCP 服务器配置（可选）
├── commands/            # 斜杠命令（可选）
├── agents/              # 代理定义（可选）
├── skills/              # Skill 定义 (可选)
└── README.md            # 文档
```

## 文档

有关开发 Claude Code 插件的更多信息，请参阅[官方文档](https://code.claude.com/docs/en/plugins)。
