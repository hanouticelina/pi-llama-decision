import { builtinProviders } from "@earendil-works/pi-ai/providers/all";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// llama.cpp's /v1/systemone endpoint speaks the same format as TypeSafe's Jev,
// so the built-in TypeSafe client does the work.
const typesafe = builtinProviders().find((provider) => provider.id === "typesafe");

const free = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

// `id` is the name in pi, `llama` is the model name llama.cpp knows.
const MODELS = [
	{ id: "julia-1", llama: "ggml-org/Julia-1-GGUF:Q8_0", name: "Julia-1 (144M)", contextWindow: 8192 },
	{ id: "laya", llama: "ggml-org/Laya-GGUF:Q8_0", name: "Laya (421M)", contextWindow: 512 },
	{ id: "kev-4b", llama: "ggml-org/Kev-4B-GGUF:Q4_K_M", name: "Kev 4B", contextWindow: 8192 },
	{ id: "lev", llama: "ggml-org/lev-GGUF:Q4_K_M", name: "lev 4B", contextWindow: 8192 },
	{ id: "openjev", llama: "ggml-org/OpenJev-GGUF:Q4_K_M", name: "OpenJev 27B", contextWindow: 16384, input: ["text", "image"] },
];

const LLAMA_NAMES = new Map(MODELS.map((model) => [model.id, model.llama]));

export default function (pi: ExtensionAPI) {
	if (!typesafe?.classify) throw new Error("pi-llama-decision needs pi 1.0 or later");
	const classify = typesafe.classify.bind(typesafe);

	pi.registerProvider("llama-decision", {
		baseUrl: `${(process.env.LLAMA_DECISION_URL ?? "http://127.0.0.1:8080").replace(/\/+$/, "")}/v1`,
		apiKey: "local",
		classifiers: {
			"typesafe-system-one": {
				classify: async (model, context, options) => ({
					...(await classify({ ...model, id: LLAMA_NAMES.get(model.id) ?? model.id }, context, options)),
					model: model.id,
				}),
			},
		},
		models: MODELS.map(({ llama, ...model }) => ({
			type: "classifier" as const,
			api: "typesafe-system-one" as const,
			input: ["text"],
			cost: free,
			...model,
		})),
	});
}
