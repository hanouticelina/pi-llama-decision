# pi-llama-decision

Use [llama.cpp decision models](https://huggingface.co/blog/ggml-org/decision-models-in-llamacpp) as classifiers in [pi](https://pi.dev).

## Setup

1. Start a decision model with llama.cpp on port 8081:

   ```bash
   llama serve -hf ggml-org/Kev-4B-GGUF --port 8081
   ```

   You need a llama.cpp build that includes [#29818](https://github.com/ggml-org/llama.cpp/pull/29818). To switch between several downloaded models, run `llama serve --port 8081` instead: it loads each model when a request names it.

2. Install the extension:

   ```bash
   pi install git:github.com/hanouticelina/pi-llama-decision
   ```

3. Enable codemode in `~/.pi/agent/settings.json`:

   ```json
   { "defaultTools": ["+codemode"] }
   ```

## Use

Ask pi something like:

> Use the llama-decision/ggml-org/Kev-4B-GGUF:Q4_K_M classifier to label my last 20 commits as feature, fix or chore.

From a codemode script or an extension:

```js
const kev = await models.getModelOfType("classifier", "llama-decision", "ggml-org/Kev-4B-GGUF:Q4_K_M");
const result = await models.classify(kev, {
  state: { message: "I was charged twice for my order." },
  questions: {
    team: { type: "choice", instructions: "Which team?", criteria: { billing: "payments", shipping: "delivery" } },
  },
});
```

## Models

| Model | Size |
|---|---|
| `ggml-org/Julia-1-GGUF:Q8_0` | 144M |
| `ggml-org/Laya-GGUF:Q8_0` | 421M |
| `ggml-org/Kev-4B-GGUF:Q4_K_M` | 4B |
| `ggml-org/lev-GGUF:Q4_K_M` | 4B |
| `ggml-org/OpenJev-GGUF:Q4_K_M` | 27B, reads images |

Using another port or host? Set `LLAMA_DECISION_URL`, for example `LLAMA_DECISION_URL=http://127.0.0.1:9000`.
