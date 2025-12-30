import { useState, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Download } from "lucide-react";
import { Playlist, Channel } from "@/types/m3u";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChannelCard } from "./ChannelCard";
import { AddChannelDialog } from "./AddChannelDialog";
import { VideoPlayer } from "./VideoPlayer";
import { generateM3U } from "@/utils/m3uParser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PlaylistViewProps {
  playlist: Playlist;
  onBack: () => void;
  onAddChannel: (channel: Omit<Channel, "id">) => void;
  onUpdateChannel: (channelId: string, updates: Partial<Channel>) => void;
  onDeleteChannel: (channelId: string) => void;
}

export function PlaylistView({
  playlist,
  onBack,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
}: PlaylistViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);

  const groups = useMemo(() => {
    const groupSet = new Set(playlist.channels.map((c) => c.group || "General"));
    return Array.from(groupSet).sort();
  }, [playlist.channels]);

  const filteredChannels = useMemo(() => {
    return playlist.channels.filter((channel) => {
      const matchesSearch = channel.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === "all" || channel.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [playlist.channels, searchQuery, selectedGroup]);

  const handleExport = () => {
    const content = generateM3U(playlist.channels);
    const blob = new Blob([content], { type: "audio/x-mpegurl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playlist.name}.m3u`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Lista exportada correctamente");
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setShowAddDialog(true);
  };

  const handleSaveChannel = (channelData: Omit<Channel, "id">) => {
    if (editingChannel) {
      onUpdateChannel(editingChannel.id, channelData);
      toast.success("Canal actualizado");
    } else {
      onAddChannel(channelData);
      toast.success("Canal añadido");
    }
    setEditingChannel(null);
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
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {playlist.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {playlist.channels.length} canales • {groups.length} grupos
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="gradient" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Canal
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar canales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48 bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todos los grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Channel List */}
      <main className="container py-6">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {playlist.channels.length === 0
                ? "No hay canales"
                : "Sin resultados"}
            </h3>
            <p className="text-muted-foreground">
              {playlist.channels.length === 0
                ? "Añade tu primer canal para empezar"
                : "Prueba con otros términos de búsqueda"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onPlay={setPlayingChannel}
                onEdit={handleEditChannel}
                onDelete={(ch) => {
                  onDeleteChannel(ch.id);
                  toast.success("Canal eliminado");
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <AddChannelDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingChannel(null);
        }}
        onAdd={handleSaveChannel}
        editChannel={editingChannel}
      />

      <VideoPlayer
        channel={playingChannel}
        onClose={() => setPlayingChannel(null)}
      />
    </div>
  );
}
