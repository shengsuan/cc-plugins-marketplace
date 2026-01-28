import AI from "./tools"

export default async function trans (text, model='openai/gpt-5-nano') {
    try {
        const res = await AI.chat.completions.create({
            model: model,
            messages: [
                { role: 'developer', content: '请将以下问题句子或问题翻译成简体中文, 只说翻译结果不要添加说明或其它' },
                { role: 'user', content: text },
            ]
        });

        const content = res.choices[0]?.message?.content;
        if (content) {
            return [content, null];
        }
        return [text, "error: empty content"];
    } catch (e) {
        return [text, `error: ${e.message}`];
    }
}

// trans("A comprehensive example plugin demonstrating all Claude Code extension options...")
//     .then(([result, err]) => {
//         if (err) {
//             console.error(err);
//         } else {
//             console.log("", result);
//         }
//     });
