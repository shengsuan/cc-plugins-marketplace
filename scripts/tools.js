import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import readline from 'node:readline';
import process from 'node:process';
import OpenAI from 'openai';
import os from 'node:os'; 
import { z } from 'zod';

export const AI = new OpenAI({
    baseURL: process.env['SSY_BASE_URL'],
    apiKey: process.env['SSY_API_KEY'],
});


export const LocalShell = {
    execAsync: promisify(exec),
    platform: os.platform(),
    shell: os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash',

    async run(commands) {
        const results = [];
        for (const cmd of commands) {
            try {
                console.log(`\n🚀 Running: ${cmd}`);
                const { stdout, stderr } = await this.execAsync(cmd, {
                    cwd: process.cwd(),
                    env: process.env,
                    shell: this.shell,
                    timeout: 60000 
                });

                if (stdout) console.log(stdout.trim());
                if (stderr) console.warn(`⚠️ Stderr: ${stderr.trim()}`);

                results.push({ cmd, out: stdout, err: stderr, success: true });
            } catch (error) {
                console.error(`❌ Command failed: ${cmd}\nError: ${error.message}`);
                results.push({ 
                    cmd, 
                    out: error.stdout || null, 
                    err: error.stderr || error.message, 
                    success: false 
                });
                break; 
            }
        }
        return results;
    },
    getContext() {
        return {
            os: this.platform,
            cwd: process.cwd(),
            user: os.userInfo().username,
            shell: this.shellPath,
            envKeys: Object.keys(process.env).slice(0, 50),
        };
    }
};

export async function agent_shell() {
    const userGoal = process.argv[2] || "Show my current environment variables and list files in the current folder";
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (query) => new Promise<string>((resolve) => rl.question(query, resolve));
    const ResSchema = z.object({
        commands: z.array(z.string()).describe("要在 shell 中执行的命令列表"),
        needApproval: z.boolean().describe("如果命令具有破坏性或修改系统设置，则为 true"),
        reasoning: z.string().describe("AI 决定是否需要审批的理由"),
    });
    const context = LocalShell.getContext()
    const systemPrompt = `
You are a cross-platform DevOps expert. 
Context:
- Current Operating System: ${context.os} (Shell: ${context.shell})
- Current User: ${context.user}
- Current working directory: ${context.cwd}

Rules:
1. Generate commands for ${context.shell}.
2. **Safety Assessment**: 
- Set "needApproval": true for destructive actions (rm, del, kill, systemctl, etc.) or environment changes.
- Set "needApproval": false for read-only actions (ls, dir, cat, node -v, env).
3. Output ONLY valid JSON: {"commands": ["..."], "needApproval": boolean, "reasoning": "..."}.
    `;
    try {
        const response = await AI.chat.completions.create({
            model: 'openai/gpt-5-nano',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Goal: ${userGoal}` }
            ],
            response_format: { type: "json_object" }
        });
        const rawContent = response.choices[0].message.content
        const parsedData = JSON.parse(rawContent);
        const action = ResSchema.parse(parsedData); // 如果格式不符会抛出错误

        console.log(`\n🤖 AI Reasoning: ${action.reasoning}`);
        if (action.needApproval) {
            console.log("\n⚠️  APPROVAL REQUIRED");
            action.commands.forEach(c => console.log(`   > ${c}`));
            const answer = question("\nAllow execution? (y/n): ");
            if (answer.toLowerCase() !== 'y') {
                console.log("Cancelled.");
                process.exit(0);
            }
        }
        await LocalShell.run(action.commands);
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error("❌ AI Output Validation Failed:", err.errors);
        } else {
            console.error("❌ Failed to parse AI response as JSON.");
        }
        console.error(`Aborting: ${err.message}`);
        throw new Error("Invalid AI response format");
    } finally {
        rl.close();
    }
}

// agent_shell()