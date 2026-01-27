import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Download, Star, Search, CheckCircle, TrendingUp, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Extensions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const queryClient = useQueryClient();

  const { data: extensions = [] } = useQuery({
    queryKey: ["extensions"],
    queryFn: () => base44.entities.Extension.list()
  });

  const installMutation = useMutation({
    mutationFn: (id) => base44.entities.Extension.update(id, { is_installed: true, downloads: (extensions.find(e => e.id === id)?.downloads || 0) + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extensions"] });
      toast.success("Extension installed");
    }
  });

  const uninstallMutation = useMutation({
    mutationFn: (id) => base44.entities.Extension.update(id, { is_installed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extensions"] });
      toast.success("Extension uninstalled");
    }
  });

  const filteredExtensions = extensions.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ext.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ext.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Extensions", icon: Package },
    { value: "model-optimization", label: "Model Optimization", icon: TrendingUp },
    { value: "deployment", label: "Deployment", icon: Download },
    { value: "monitoring", label: "Monitoring", icon: Shield },
    { value: "integration", label: "Integration", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm extensions --browse</span>
            <span className="text-xs">[ Extensions Marketplace ]</span>
          </div>
          <div className="p-6">
            <div className="text-cyan-400 text-2xl mb-2">╔═══ EXTENSIONS MARKETPLACE ═══╗</div>
            <div className="text-green-400">Extend MX2LM capabilities with community extensions</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search extensions..."
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="bg-slate-800 border-slate-700 flex-wrap h-auto">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-2">
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Extensions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExtensions.map((extension) => (
            <Card key={extension.id} className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      {extension.name}
                      {extension.is_verified && (
                        <Shield className="w-4 h-4 text-blue-400" title="Verified" />
                      )}
                    </CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{extension.author}</p>
                  </div>
                  <Badge className="bg-purple-600">{extension.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm">{extension.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{extension.rating || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{extension.downloads || 0}</span>
                  </div>
                  <Badge variant="outline" className="text-slate-400 border-slate-600">
                    v{extension.version}
                  </Badge>
                </div>

                {extension.commands && extension.commands.length > 0 && (
                  <div className="bg-slate-900 rounded p-2 text-xs font-mono text-slate-300">
                    <div className="text-slate-500 mb-1">Commands:</div>
                    {extension.commands.slice(0, 2).map((cmd, i) => (
                      <div key={i} className="text-green-400">$ {cmd.command || cmd}</div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => extension.is_installed 
                    ? uninstallMutation.mutate(extension.id)
                    : installMutation.mutate(extension.id)
                  }
                  className={extension.is_installed 
                    ? "w-full bg-slate-700 hover:bg-slate-600" 
                    : "w-full bg-purple-600 hover:bg-purple-700"
                  }
                >
                  {extension.is_installed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExtensions.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No extensions found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
}