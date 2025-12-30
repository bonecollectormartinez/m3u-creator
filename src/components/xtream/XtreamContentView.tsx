import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Tv,
  Film,
  MonitorPlay,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { xtreamApi } from "@/services/xtreamApi";
import { XtreamCredentials, XtreamCategory, XtreamLiveStream, XtreamVodStream, XtreamSeriesInfo, ContentType } from "@/types/xtream";
import { XtreamChannelCard } from "./XtreamChannelCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { toast } from "sonner";
import { Channel } from "@/types/m3u";

interface XtreamContentViewProps {
  account: XtreamCredentials;
  onBack: () => void;
}

export function XtreamContentView({ account, onBack }: XtreamContentViewProps) {
  const [contentType, setContentType] = useState<ContentType>("live");
  const [categories, setCategories] = useState<XtreamCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [streams, setStreams] = useState<(XtreamLiveStream | XtreamVodStream | XtreamSeriesInfo)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);

  // Initialize API with credentials
  useEffect(() => {
    xtreamApi.setCredentials(account);
  }, [account]);

  // Load categories when content type changes
  useEffect(() => {
    loadCategories();
    setSelectedCategory("all");
  }, [contentType]);

  // Load streams when category changes
  useEffect(() => {
    loadStreams();
  }, [selectedCategory, contentType]);

  const loadCategories = async () => {
    try {
      let cats: XtreamCategory[] = [];
      switch (contentType) {
        case "live":
          cats = await xtreamApi.getLiveCategories();
          break;
        case "vod":
          cats = await xtreamApi.getVodCategories();
          break;
        case "series":
          cats = await xtreamApi.getSeriesCategories();
          break;
      }
      setCategories(cats || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    }
  };

  const loadStreams = async () => {
    setIsLoading(true);
    try {
      const categoryId = selectedCategory === "all" ? undefined : selectedCategory;
      let data: (XtreamLiveStream | XtreamVodStream | XtreamSeriesInfo)[] = [];

      switch (contentType) {
        case "live":
          data = await xtreamApi.getLiveStreams(categoryId);
          break;
        case "vod":
          data = await xtreamApi.getVodStreams(categoryId);
          break;
        case "series":
          data = await xtreamApi.getSeries(categoryId);
          break;
      }
      setStreams(data || []);
    } catch (error) {
      console.error("Error loading streams:", error);
      toast.error("Error al cargar contenido");
      setStreams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStreams = useMemo(() => {
    if (!searchQuery.trim()) return streams;
    const query = searchQuery.toLowerCase();
    return streams.filter((s) => s.name.toLowerCase().includes(query));
  }, [streams, searchQuery]);

  const handlePlay = (stream: XtreamLiveStream | XtreamVodStream | XtreamSeriesInfo) => {
    const streamId = 'stream_id' in stream ? stream.stream_id : (stream as XtreamSeriesInfo).series_id;
    const extension = contentType === "vod" && 'container_extension' in stream 
      ? (stream as XtreamVodStream).container_extension 
      : "ts";

    const url = xtreamApi.getStreamUrl(streamId, contentType, extension);
    
    setPlayingChannel({
      id: streamId.toString(),
      name: stream.name,
      url,
      logo: 'stream_icon' in stream ? stream.stream_icon : (stream as XtreamSeriesInfo).cover,
    });
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "live":
        return "canales en vivo";
      case "vod":
        return "películas";
      case "series":
        return "series";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-foreground truncate">
                {account.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredStreams.length} {getContentTypeLabel()}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={loadStreams}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Content Type Tabs */}
          <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
            <TabsList className="grid grid-cols-3 w-full bg-secondary">
              <TabsTrigger value="live" className="gap-2">
                <Tv className="w-4 h-4" />
                <span className="hidden sm:inline">En Vivo</span>
              </TabsTrigger>
              <TabsTrigger value="vod" className="gap-2">
                <Film className="w-4 h-4" />
                <span className="hidden sm:inline">Películas</span>
              </TabsTrigger>
              <TabsTrigger value="series" className="gap-2">
                <MonitorPlay className="w-4 h-4" />
                <span className="hidden sm:inline">Series</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Filter */}
          <div className="flex gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] bg-secondary border-border">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-[300px]">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              {contentType === "live" ? (
                <Tv className="w-8 h-8 text-muted-foreground" />
              ) : contentType === "vod" ? (
                <Film className="w-8 h-8 text-muted-foreground" />
              ) : (
                <MonitorPlay className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground">
              No se encontró contenido
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredStreams.map((stream) => (
              <XtreamChannelCard
                key={'stream_id' in stream ? stream.stream_id : (stream as XtreamSeriesInfo).series_id}
                stream={stream}
                contentType={contentType}
                onPlay={() => handlePlay(stream)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Video Player */}
      {playingChannel && (
        <VideoPlayer
          channel={playingChannel}
          onClose={() => setPlayingChannel(null)}
        />
      )}
    </div>
  );
}
