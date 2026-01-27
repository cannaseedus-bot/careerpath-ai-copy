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
      sources: ["api", "database", "files"],
      transformations: ["normalize", "aggregate", "enrich"],
      output_format: "json",
      batch_size: 1000
    },
    script: `// Data builder bot
async function execute(config) {
  const data = await fetchFromSources(config.sources);
  const transformed = applyTransformations(data, config.transformations);
  return saveOutput(transformed, config.output_format);
}

async function fetchFromSources(sources) {
  // Fetch data from multiple sources
  return [];
}

function applyTransformations(data, transformations) {
  // Apply data transformations
  return data;
}`
  },
  {
    name: "N-gram Builder Bot",
    bot_type: "ngram-builder",
    icon: Zap,
    description: "Build n-gram models from text corpora",
    config: {
      n: 3,
      min_frequency: 5,
      corpus_sources: ["files", "api"],
      output_format: "binary",
      use_cluster: true
    },
    script: `// N-gram builder bot
async function execute(config) {
  const corpus = await loadCorpus(config.corpus_sources);
  const ngrams = buildNgrams(corpus, config.n, config.min_frequency);
  
  if (config.use_cluster) {
    return distributeToCluster(ngrams);
  }
  
  return saveNgrams(ngrams, config.output_format);
}

function buildNgrams(corpus, n, minFreq) {
  const ngrams = {};
  // Build n-grams from corpus
  return ngrams;
}`
  },
  {
    name: "Tensor Processor Bot",
    bot_type: "tensor-processor",
    icon: Cpu,
    description: "Process tensors, embeddings, and neural network data",
    config: {
      input_tensors: [],
      operations: ["normalize", "reshape", "compute"],
      output_format: "binary",
      precision: "float32",
      use_gpu: true
    },
    script: `// Tensor processor bot
async function execute(config) {
  const tensors = await loadTensors(config.input_tensors);
  const processed = processTensors(tensors, config.operations, config.precision);
  return saveTensors(processed, config.output_format);
}

function processTensors(tensors, operations, precision) {
  // Process tensors with specified operations
  return tensors;
}`
  },
  {
    name: "Cluster Orchestrator",
    bot_type: "orchestrator",
    icon: Network,
    description: "Coordinate multiple bots across cluster nodes",
    config: {
      worker_bots: [],
      distribution_strategy: "round-robin",
      max_workers: 10,
      retry_policy: {
        max_retries: 3,
        backoff: "exponential"
      },
      aggregation: "merge"
    },
    script: `// Cluster orchestrator bot
async function execute(config) {
  const tasks = await getTasks();
  const workers = await getAvailableWorkers(config.worker_bots);
  
  const results = await distributeTasks(
    tasks,
    workers,
    config.distribution_strategy
  );
  
  return aggregateResults(results, config.aggregation);
}

async function distributeTasks(tasks, workers, strategy) {
  // Distribute tasks to workers based on strategy
  return [];
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