import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Heart, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const POPULAR_MODELS = [
  { id: "microsoft/phi-3-mini", name: "Phi-3 Mini", type: "model", params: "3.8B" },
  { id: "google/gemma-7b", name: "Gemma 7B", type: "model", params: "7B" },
  { id: "meta-llama/Llama-2-7b", name: "Llama 2 7B", type: "model", params: "7B" },
  { id: "mistralai/Mistral-7B", name: "Mistral 7B", type: "model", params: "7B" },
  { id: "meta-llama/CodeLlama-7b", name: "CodeLlama 7B", type: "model", params: "7B" },
];

const POPULAR_DATASETS = [
  { id: "wikitext", name: "WikiText", type: "dataset", samples: "1.5M" },
  { id: "openwebtext", name: "OpenWebText", type: "dataset", samples: "39M" },
  { id: "wikipedia", name: "Wikipedia", type: "dataset", samples: "6M" },
  { id: "books", name: "Books3", type: "dataset", samples: "1.7B" },
];

export default function HFModelsPanel({ onSelect }) {
  const [searchText, setSearchText] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("hf-favorites") || "[]");
    setFavorites(saved);
  }, []);

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("hf-favorites", JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    setIsSearching(true);
    try {
      const results = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 5 popular HuggingFace models or datasets matching "${searchText}". Return JSON with array of {id, name, type: "model"|"dataset", description}`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
      });
      setSearchResults(results.results || []);
    } catch (error) {
      toast.error("Search failed: " + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const ItemCard = ({ item, isFav = false }) => (
    <div className="bg-black border border-slate-700 rounded p-3 flex items-between gap-2 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-cyan-400 truncate">{item.name}</p>
        <p className="text-xs text-gray-500 truncate">{item.id}</p>
        {item.params && <p className="text-xs text-gray-600 mt-1">Params: {item.params}</p>}
        {item.samples && <p className="text-xs text-gray-600 mt-1">Samples: {item.samples}</p>}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => copyToClipboard(item.id)}
          className="h-7 w-7 border border-slate-700 text-gray-400 hover:text-cyan-400"
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => toggleFavorite(item.id)}
          className={`h-7 w-7 border border-slate-700 ${
            isFav || favorites.includes(item.id)
              ? "text-red-400 bg-red-900/20"
              : "text-gray-400 hover:text-red-400"
          }`}
        >
          <Heart className="w-3 h-3" fill={isFav || favorites.includes(item.id) ? "currentColor" : "none"} />
        </Button>
        <Button
          size="sm"
          onClick={() => onSelect?.(item.id)}
          className="h-7 px-2 bg-cyan-600 hover:bg-cyan-700 text-black text-xs font-bold"
        >
          Use
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-4 space-y-4">
      <h3 className="text-sm font-bold text-cyan-400">HuggingFace Hub</h3>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search models or datasets..."
          className="bg-black border-slate-700 text-cyan-400 text-sm placeholder:text-gray-600"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="models" className="data-[state=active]:bg-cyan-900/30 text-xs">
            Models
          </TabsTrigger>
          <TabsTrigger value="datasets" className="data-[state=active]:bg-cyan-900/30 text-xs">
            Datasets
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-cyan-900/30 text-xs">
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-2 mt-3 max-h-48 overflow-y-auto">
          {searchResults.length > 0 && searchResults[0].type === "model"
            ? searchResults.map((item) => <ItemCard key={item.id} item={item} />)
            : POPULAR_MODELS.map((item) => <ItemCard key={item.id} item={item} />)}
        </TabsContent>

        <TabsContent value="datasets" className="space-y-2 mt-3 max-h-48 overflow-y-auto">
          {searchResults.length > 0 && searchResults[0].type === "dataset"
            ? searchResults.map((item) => <ItemCard key={item.id} item={item} />)
            : POPULAR_DATASETS.map((item) => <ItemCard key={item.id} item={item} />)}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-2 mt-3 max-h-48 overflow-y-auto">
          {favorites.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No favorites yet</p>
          ) : (
            [...POPULAR_MODELS, ...POPULAR_DATASETS]
              .filter((item) => favorites.includes(item.id))
              .map((item) => <ItemCard key={item.id} item={item} isFav />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}