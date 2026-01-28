import {AI, LocalShell} from './tools.js'
// import simpleGit from 'simple-git';
import ora from 'ora';

async function analyzeGitChanges(startHash) {
    const MAX_DIFF_LENGTH = 15000;
    const spinner = ora('正在初始化 Agent...').start();

    try {
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            spinner.fail('错误: 当前目录不是一个 Git 仓库。');
            return;
        }

        spinner.text = `正在提取从 ${startHash} 到 HEAD 的变更...`;
        const log = await git.log({ from: startHash, to: 'HEAD' });
        const diffStat = await git.diff([startHash, 'HEAD', '--stat']);
        let rawDiff = await git.diff([startHash, 'HEAD']);
        let diffContent = rawDiff;
        let truncated = false;
        if (rawDiff.length > MAX_DIFF_LENGTH) {
            diffContent = rawDiff.substring(0, MAX_DIFF_LENGTH) + "\n...[Diff content truncated due to length]...";
            truncated = true;
        }

        const totalCommits = log.total;
        if (totalCommits === 0) {
            spinner.succeed('没有检测到任何变更。');
            return;
        }
        spinner.text = '正在通过 AI 分析代码变更逻辑...';
        
        const prompt = `
你是一个高级技术负责人 (Tech Lead)。请根据以下 Git 变更数据，生成一份项目改动分析报告。

**变更范围**: Commit ${startHash} -> HEAD
**包含 Commit 数**: ${totalCommits}

**提交日志 (Commit Logs)**:
${log.all.map(l => `- [${l.hash.substring(0,7)}] ${l.message} (${l.author_name})`).join('\n')}

**文件变更统计 (Diff Stat)**:
${diffStat}

**代码具体变更 (Git Diff - ${truncated ? '已截断' : '完整'})**:
\`\`\`diff
${diffContent}
\`\`\`

---
**请输出以下 Markdown 格式的报告**:
1.  **摘要**: 一句话概括这期间的主要工作。
2.  **功能更新**: 列出新增或修改的核心功能点。
3.  **技术债务与重构**: 是否有依赖升级、代码清理或架构调整？
4.  **潜在风险**: 基于代码变更，指出可能引入的 Bug、性能问题或安全隐患。
5.  **受影响模块**: 哪些核心文件或模块改动最大？
`;
        const completion = await AI.chat.completions.create({
            model: "gpt-4o", // 或者 gpt-3.5-turbo / 其他支持的模型
            messages: [
                { role: "system", content: "你是一个专业的代码审计助手，擅长分析 Git 提交历史并用简洁的中文总结。" },
                { role: "user", content: prompt }
            ],
            temperature: 0.2, // 保持分析的客观性
        });

        spinner.succeed('分析完成！');
        
        console.log('\n' + '='.repeat(50));
        console.log('📢 项目变更分析报告');
        console.log('='.repeat(50) + '\n');
        console.log(completion.choices[0].message.content);

    } catch (error) {
        spinner.fail(`分析过程中出错: ${error.message}`);
        if (error.message.includes('unknown revision')) {
            console.error('提示: 请检查输入的 Commit Hash 是否正确。');
        }
    }
}
// const targetHash = process.argv[2];
// if (!targetHash) {
//     console.error('用法: node agent.js <commit-hash>');
//     process.exit(1);
// }
// analyzeGitChanges(targetHash);

LocalShell.run(['cd ui-ux-pro-max-skill','git log --format="%H"'])
    // .then(()=>console.log('\n'))