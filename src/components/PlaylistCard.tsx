import { Tv, MoreVertical, Trash2, Edit2, List } from "lucide-react";
import { Playlist } from "@/types/m3u";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlaylistCardProps {
  playlist: Playlist;
  onSelect: (playlist: Playlist) => void;
  onEdit: (playlist: Playlist) => void;
  onDelete: (playlist: Playlist) => void;
}

export function PlaylistCard({ playlist, onSelect, onEdit, onDelete }: PlaylistCardProps) {
  const channelCount = playlist.channels.length;
  const groupCount = new Set(playlist.channels.map(c => c.group || 'General')).size;

  return (
    <div
      className="group relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer animate-slide-up"
      onClick={() => onSelect(playlist)}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Tv className="w-7 h-7 text-primary" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(playlist); }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar nombre
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(playlist); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Info */}
        <h3 className="font-display font-semibold text-lg text-foreground mb-2 truncate">
          {playlist.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Tv className="w-4 h-4" />
            {channelCount} canales
          </span>
          <span className="flex items-center gap-1">
            <List className="w-4 h-4" />
            {groupCount} grupos
          </span>
        </div>

        {/* Date */}
        <p className="mt-4 text-xs text-muted-foreground">
          Actualizado: {playlist.updatedAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
