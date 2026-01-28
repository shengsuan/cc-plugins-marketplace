#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import trans from './agent_translation.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

function getRepoUrl() {
  const args = process.argv.slice(2);
  const repoIndex = args.indexOf('--repo');
  if (repoIndex !== -1 && args[repoIndex + 1]) {
    return args[repoIndex + 1];
  }

  if (process.env.npm_config_repo) {
    return process.env.npm_config_repo;
  }

  if (args[0] && args[0].includes('github.com')) {
    return args[0];
  }
  return null;
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options
    });
  } catch (err) {
    if (!options.ignoreError) {
      throw err;
    }
    return null;
  }
}

function validatePluginStructure(pluginPath) {
  const configPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('未找到 .claude-plugin/plugin.json 文件');
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (!config.name) {
      throw new Error('plugin.json 缺少 name 字段');
    }

    if (!config.description) {
      throw new Error('plugin.json 缺少 description 字段');
    }

    return config;
  } catch (err) {
    throw new Error(`plugin.json 格式错误: ${err.message}`);
  }
}

function parseGitignore(gitignorePath) {
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }

  const content = fs.readFileSync(gitignorePath, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')) // 过滤空行和注释
    .map(pattern => {
      return pattern.startsWith('/') ? pattern.slice(1) : pattern;
    });
}

function isIgnored(relativePath, patterns) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  for (const pattern of patterns) {
    if (pattern.endsWith('/')) {
      const dirPattern = pattern.slice(0, -1);
      if (normalizedPath === dirPattern || normalizedPath.startsWith(dirPattern + '/')) {
        return true;
      }
    }
    else if (pattern.includes('*')) {
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.');
      
      const regex = new RegExp(`^${regexPattern}$|/${regexPattern}$|^${regexPattern}/|/${regexPattern}/`);
      if (regex.test(normalizedPath)) {
        return true;
      }
    }
    else {
      if (normalizedPath === pattern || 
          normalizedPath.endsWith('/' + pattern) ||
          normalizedPath.startsWith(pattern + '/')) {
        return true;
      }
    }
  }
  return false;
}

function copyDirectory(src, dest, options = {}) {
  const { 
    gitignorePath = path.join(src, '.gitignore'),
    baseDir = src,
    patterns = null,
    blacklist = ['marketplace.json']
  } = options;
  const ignorePatterns = patterns || parseGitignore(gitignorePath);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relativePath = path.relative(baseDir, srcPath);

    if (entry.name === '.git') {
      continue;
    }
    if (blacklist.includes(entry.name)) {
      console.log(`黑名单拦截: ${entry.name}`);
      continue;
    }
    if (isIgnored(relativePath, ignorePatterns)) {
      console.log(`忽略: ${relativePath}`);
      continue;
    }

    const stats = fs.lstatSync(srcPath);

    if (stats.isDirectory()) {
      copyDirectory(srcPath, destPath, {
        gitignorePath,
        baseDir,
        patterns: ignorePatterns
      });
    } else if (stats.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`复制: ${relativePath}`);
    }
  }
}

// 使用示例
// copyDirectory('./source', './destination');
// module.exports = { copyDirectory, parseGitignore, isIgnored };

async function updateMarketplaceJson(pluginConfig, pluginName, repoUrl) {
  const marketplacePath = path.join(process.cwd(), '.claude-plugin', 'marketplace.json');

  if (!fs.existsSync(marketplacePath)) {
    warn('未找到 marketplace.json 文件，跳过更新');
    return false;
  }

  try {
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf-8'));
    const existingIndex = marketplace.plugins.findIndex(p => p.name === pluginName);
    const {author, version, tags, description} = pluginConfig
    const [desp, error] = await trans(description)
    if(error){
      warn('翻译 Bot 出错，请手动完成翻译！');
    }
    const newPlugin = {
      name: pluginName,
      description: desp,
      category: pluginConfig.category || 'development',
      source: `./external_plugins/${pluginName}`,
      homepage: repoUrl,
      ...(author?{author}:{}),
      ...(version?{version}:{}),
      ...(tags?{tags}:{}),
    };

    if (existingIndex !== -1) {
      marketplace.plugins[existingIndex] = newPlugin;
      info('更新 marketplace.json 中的插件条目');
    } else {
      marketplace.plugins.push(newPlugin);
      info('添加新插件到 marketplace.json');
    }
    fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n', 'utf-8');
    success('marketplace.json 更新成功');
    return true;
  } catch (err) {
    error(`更新 marketplace.json 失败: ${err.message}`);
    return false;
  }
}

async function main() {
  info('Claude Code 插件自动收录工具\n');
  const repoUrl = getRepoUrl();

  if (!repoUrl) {
    error('请提供 GitHub 仓库 URL\n');
    console.log('使用方式:');
    console.log('  npm run add-plugin -- --repo <github-url>');
    console.log('  npm run add-plugin --repo=<github-url>');
    console.log('\n示例:');
    console.log('  npm run add-plugin -- --repo https://github.com/nextlevelbuilder/ui-ux-pro-max-skill');
    process.exit(1);
  }

  info(`仓库 URL: ${repoUrl}`);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-plugin-'));
  info(`临时目录: ${tempDir}`);

  try {
    info('\n正在克隆仓库...');
    exec(`git clone --depth 1 ${repoUrl} ${tempDir}`, { silent: true });
    success('仓库克隆成功');
    // console.log(exec(`ls ${tempDir}`, { silent: true }))
    info('\n验证插件结构...');
    const pluginConfig = validatePluginStructure(tempDir);
    success('插件结构验证通过');

    const pluginName = pluginConfig.name;
    info(`\n插件名称: ${pluginName}`);
    info(`插件描述: ${pluginConfig.description}`);

    if (pluginConfig.author) {
      info(`插件作者: ${pluginConfig.author.name || 'N/A'}`);
    }

    const targetDir = path.join(process.cwd(), 'external_plugins', pluginName);

    if (fs.existsSync(targetDir)) {
      warn(`\n插件 "${pluginName}" 已存在`);
      const forceUpdate = process.argv.includes('--force') || process.env.npm_config_force;
      if (!forceUpdate) {
        error('使用 --force 标志覆盖现有插件');
        process.exit(1);
      }
      info('正在覆盖现有插件...');
      fs.rmSync(targetDir, { recursive: true });
    }

    info('\n正在复制插件文件...');
    copyDirectory(tempDir, targetDir);
    success('插件文件复制成功');

    info('\n插件内容:');
    const contents = fs.readdirSync(targetDir);
    contents.forEach(item => {
      console.log(`  - ${item}`);
    });

    info('\n正在更新 marketplace.json...');
    await updateMarketplaceJson(pluginConfig, pluginName, repoUrl);

    info('\n正在清理临时文件...');
    fs.rmSync(tempDir, { recursive: true });
    success('临时文件清理完成');

    success(`\n插件 "${pluginName}" 已成功添加到 external_plugins/`);
    info(`\n位置: external_plugins/${pluginName}`);
    info('\n下一步:');
    console.log('  1. 查看插件文件确保内容正确');
    console.log('  2. 测试插件是否正常工作');
    console.log('  3. 提交更改到 Git 仓库');
    console.log(`\n安装命令:`);
    console.log(`  /plugin install ${pluginName}@claude-plugin-directory`);

  } catch (err) {
    error(`\n错误: ${err.message}`);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    process.exit(1);
  }
}

main().catch(err => {
  error(`未预期的错误: ${err.message}`);
  process.exit(1);
});
