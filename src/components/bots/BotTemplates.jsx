import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Database, Cpu, Zap, Network, Bot } from "lucide-react";

const templates = [
  {
    name: "Web Scraper Bot",
    bot_type: "scraper",
    icon: Globe,
    description: "Scrape websites, extract data, handle pagination",
    config: {
      urls: [
        "https://huggingface.co/datasets/bigcode/the-stack",
        "https://huggingface.co/datasets/codeparrot/github-code",
        "https://huggingface.co/datasets/HuggingFaceH4/CodeAlpaca-20k",
        "https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca",
        "https://huggingface.co/datasets/m-a-p/Code-Feedback"
      ],
      selectors: {
        title: "h1.title",
        content: "div.content",
        code: "pre code",
        language: "span.language",
        metadata: "div.dataset-info"
      },
      interval: 3600,
      follow_links: true,
      max_depth: 2
    },
    script: `// Web scraper bot
async function execute(config) {
  const results = [];
  for (const url of config.urls) {
    const response = await fetch(url);
    const html = await response.text();
    // Parse HTML and extract data using selectors
    results.push({ url, data: extractData(html, config.selectors) });
  }
  return results;
}

function extractData(html, selectors) {
  // Use DOM parser or regex to extract data
  return { extracted: "data" };
}`
  },
  {
    name: "Data Builder Bot",
    bot_type: "data-builder",
    icon: Database,
    description: "Process and transform data from multiple sources",
    config: {
      sources: [
        "https://huggingface.co/datasets/bigcode/the-stack-dedup",
        "https://huggingface.co/datasets/Vezora/Tested-22k-Python-Alpaca",
        "https://huggingface.co/datasets/tokenبان/code_instructions_122k_alpaca_style"
      ],
      transformations: ["normalize", "tokenize", "deduplicate"],
      output_format: "xjson",
      batch_size: 1000,
      target_tensor: "svg3d-ngram-core.v2"
    },
    script: `// Data builder bot - feeds HuggingFace datasets into XJSON tensors
async function execute(config) {
  const rawData = await fetchFromSources(config.sources);
  const tokens = tokenizeCodeData(rawData);
  const xjsonDeltas = buildXJSONDeltas(tokens, config.target_tensor);
  return emitToCluster(xjsonDeltas, config.output_format);
}

async function fetchFromSources(sources) {
  // Fetch HuggingFace datasets
  const datasets = [];
  for (const url of sources) {
    const response = await fetch(url);
    datasets.push(await response.json());
  }
  return datasets;
}

function tokenizeCodeData(data) {
  // Extract code tokens for n-gram building
  return data.flatMap(d => d.code.split(/\s+/));
}

function buildXJSONDeltas(tokens, tensor) {
  // Create SCXQ2-compressed deltas
  return { tensor, tokens, format: "scxq2" };
}`
  },
  {
    name: "N-gram Builder Bot",
    bot_type: "ngram-builder",
    icon: Zap,
    description: "Build n-gram models from code datasets → SVG-3D tensors",
    config: {
      n: 3,
      min_frequency: 5,
      corpus_sources: [
        "https://huggingface.co/datasets/bigcode/the-stack",
        "https://huggingface.co/datasets/codeparrot/github-code-clean"
      ],
      output_format: "svg3d-tensor",
      tensor_schema: "NGT-SVG-3D v1",
      compression: "scxq2",
      use_cluster: true,
      domain: "code-intelligence"
    },
    script: `// N-gram builder bot - HuggingFace → SVG-3D tensors
async function execute(config) {
  const corpus = await loadHuggingFaceDatasets(config.corpus_sources);
  const ngrams = buildNgramsFromCode(corpus, config.n, config.min_frequency);
  
  // Convert to SVG-3D tensor format
  const svg3dTensor = encodeAsSVG3DTensor(ngrams, config.tensor_schema);
  
  if (config.use_cluster) {
    const deltas = compressSCXQ2(svg3dTensor);
    return distributeToCluster(deltas);
  }
  
  return { tensor: svg3dTensor, format: config.output_format };
}

async function loadHuggingFaceDatasets(sources) {
  // Load code datasets from HuggingFace
  const datasets = await Promise.all(
    sources.map(url => fetch(url).then(r => r.json()))
  );
  return datasets.flatMap(d => d.code || d.content);
}

function buildNgramsFromCode(corpus, n, minFreq) {
  const ngrams = new Map();
  for (const code of corpus) {
    const tokens = code.split(/\s+/);
    for (let i = 0; i < tokens.length - n + 1; i++) {
      const ngram = tokens.slice(i, i + n).join(' ');
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
    }
  }
  return [...ngrams].filter(([_, count]) => count >= minFreq);
}

function encodeAsSVG3DTensor(ngrams, schema) {
  // Encode as SVG-3D tensor with geometric weights
  return \`<svg data-tensor="ngram" data-version="1.0" data-rank="2">
    <g data-space="adjacency">
      \${ngrams.map(([tokens, count]) => {
        const [src, dst] = tokens.split(' ');
        const weight = count / ngrams.reduce((sum, [_, c]) => sum + c, 0);
        return \`<path data-src="\${src}" data-dst="\${dst}" 
                      data-weight="\${weight}" data-count="\${count}"/>\`;
      }).join('\\n')}
    </g>
  </svg>\`;
}

function compressSCXQ2(tensor) {
  // SCXQ2 delta compression
  return { type: "scxq2", tensor, compressed: true };
}`
  },
  {
    name: "Tensor Processor Bot",
    bot_type: "tensor-processor",
    icon: Cpu,
    description: "Process SVG-3D tensors with three.js geometry math",
    config: {
      input_tensors: ["svg3d-ngram-core.v2"],
      operations: ["normalize", "collapse", "verify_invariants"],
      output_format: "svg3d",
      precision: "float32",
      use_gpu: false,
      runtime: "three.js-headless",
      dataset_sources: [
        "https://huggingface.co/datasets/HuggingFaceH4/CodeAlpaca-20k",
        "https://huggingface.co/datasets/sahil2801/code_instructions_120k"
      ]
    },
    script: `// Tensor processor bot - three.js tensor worker
// Processes SVG-3D tensors as lawful geometry
import * as THREE from 'three';

async function execute(config) {
  const svgTensors = await loadSVG3DTensors(config.input_tensors);
  const deltas = await collectDeltasFromDatasets(config.dataset_sources);
  const collapsed = await collapseWithInvariants(svgTensors, deltas);
  return { tensor: collapsed, format: config.output_format };
}

async function loadSVG3DTensors(tensorIds) {
  // Load geometric weight tensors
  return tensorIds.map(id => ({
    id,
    geometry: new THREE.BufferGeometry(),
    weights: new Map()
  }));
}

async function collectDeltasFromDatasets(sources) {
  // Stream HuggingFace datasets, emit SCXQ2 deltas
  const deltas = [];
  for (const url of sources) {
    const data = await fetch(url).then(r => r.json());
    const tokens = extractTokens(data);
    deltas.push(...computeWeightDeltas(tokens));
  }
  return deltas;
}

function computeWeightDeltas(tokens) {
  // Generate SCXQ2-compressed deltas
  const deltas = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    deltas.push({
      edge: \`\${tokens[i]}→\${tokens[i+1]}\`,
      Δcount: 1,
      Δweight: 0.0003
    });
  }
  return deltas;
}

async function collapseWithInvariants(tensors, deltas) {
  // Apply deltas, verify invariants, commit or reject
  const shadow = cloneTensor(tensors[0]);
  
  for (const delta of deltas) {
    applyDelta(shadow, delta);
  }
  
  normalize(shadow);
  
  if (!verifyInvariants(shadow)) {
    throw new Error("Invariant violation - collapse rejected");
  }
  
  return shadow;
}

function verifyInvariants(tensor) {
  // Σ_outgoing(weight[src,*]) ≤ 1.0
  for (const [src, edges] of tensor.weights) {
    const sum = edges.reduce((s, e) => s + e.weight, 0);
    if (sum > 1.0) return false;
  }
  return true;
}`
  },
  {
    name: "XJSON Runtime Cluster Orchestrator",
    bot_type: "orchestrator",
    icon: Network,
    description: "Coordinate tensor bots via lawful collapse pipeline",
    config: {
      worker_bots: [],
      distribution_strategy: "phase-ordered",
      max_workers: 10,
      retry_policy: {
        max_retries: 3,
        backoff: "exponential"
      },
      aggregation: "collapse-verify",
      phases: ["@Pop", "@Wo", "@Sek", "@Collapse"],
      huggingface_datasets: [
        "https://huggingface.co/datasets/bigcode/the-stack-dedup",
        "https://huggingface.co/datasets/codeparrot/github-code",
        "https://huggingface.co/datasets/m-a-p/Code-Feedback",
        "https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca"
      ],
      tensor_format: "svg3d-ngram",
      compression: "scxq2"
    },
    script: `// XJSON Runtime Cluster orchestrator
// Enforces one reality across many machines
async function execute(config) {
  // Phase-ordered execution pipeline
  const xjsonEnvelopes = await phase_Pop(config.huggingface_datasets);
  const stateFragments = await phase_Wo(xjsonEnvelopes);
  const orderedDeltas = await phase_Sek(stateFragments);
  const collapsed = await phase_Collapse(orderedDeltas, config.worker_bots);
  
  return { 
    reality: collapsed,
    format: config.tensor_format,
    compression: config.compression
  };
}

async function phase_Pop(datasets) {
  // Intent arrives - load HuggingFace datasets
  const envelopes = [];
  for (const url of datasets) {
    const data = await fetch(url).then(r => r.json());
    envelopes.push({
      "@phase": "@Pop",
      "@source": url,
      "@data": data,
      "@timestamp": Date.now()
    });
  }
  return envelopes;
}

async function phase_Wo(envelopes) {
  // State exists - extract tokens and n-grams
  return envelopes.map(env => ({
    "@phase": "@Wo",
    "@tokens": extractTokens(env["@data"]),
    "@ngrams": buildNgrams(extractTokens(env["@data"]), 3)
  }));
}

async function phase_Sek(fragments) {
  // Order enforced - create SCXQ2 deltas
  return fragments.flatMap(frag => 
    frag["@ngrams"].map(ng => ({
      "@phase": "@Sek",
      "@delta": {
        edge: \`\${ng.src}→\${ng.dst}\`,
        Δcount: ng.count,
        Δweight: ng.weight
      },
      "@proof": hashDelta(ng)
    }))
  );
}

async function phase_Collapse(deltas, workers) {
  // Outcome committed - distribute to tensor bots
  const results = await distributeTasks(deltas, workers, "phase-ordered");
  
  // Verify invariants
  const collapsed = aggregateWithInvariants(results);
  
  if (!verifyCollapse(collapsed)) {
    throw new Error("Collapse rejected - invariant violation");
  }
  
  return collapsed;
}

function aggregateWithInvariants(results) {
  // Σ_outgoing(weight[src,*]) ≤ 1.0
  const tensor = new Map();
  for (const result of results) {
    const src = result.delta.edge.split('→')[0];
    if (!tensor.has(src)) tensor.set(src, []);
    tensor.get(src).push(result.delta);
  }
  return tensor;
}

function verifyCollapse(tensor) {
  // Check geometric invariants
  for (const [src, deltas] of tensor) {
    const totalWeight = deltas.reduce((s, d) => s + d.Δweight, 0);
    if (totalWeight > 1.0) return false;
  }
  return true;
}`
  },
  {
    name: "Custom Bot",
    bot_type: "custom",
    icon: Bot,
    description: "Create your own bot with custom logic",
    config: {
      custom_param1: "value1",
      custom_param2: "value2"
    },
    script: `// Custom bot - write your own logic
async function execute(config) {
  // Your custom bot logic here
  console.log("Bot started with config:", config);
  
  // Implement your bot's functionality
  const result = await performCustomTask(config);
  
  return result;
}

async function performCustomTask(config) {
  // Implement your task
  return { success: true };
}`
  }
];

export default function BotTemplates({ onSelectTemplate }) {
  return (
    <div className="mb-6">
      <div className="border-2 border-yellow-400 bg-black mb-4">
        <div className="bg-yellow-400 text-black px-4 py-1 font-bold">
          [ BOT TEMPLATES ]
        </div>
        <div className="p-4">
          <div className="text-green-400 text-sm">
            Start with a pre-configured bot template or create a custom bot from scratch
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, idx) => {
          const Icon = template.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectTemplate(template)}
              className="border-2 border-green-400 bg-black hover:border-cyan-400 transition text-left group"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-cyan-400" />
                  <div className="text-green-400 font-bold group-hover:text-cyan-400 transition">
                    {template.name}
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {template.description}
                </div>
                <div className="text-xs text-yellow-400">
                  TYPE: {template.bot_type}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}