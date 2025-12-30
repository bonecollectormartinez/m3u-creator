import { Play, Edit2, Trash2, Tv } from "lucide-react";
import { Channel } from "@/types/m3u";
import { Button } from "@/components/ui/button";

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
}

export function ChannelCard({ channel, onPlay, onEdit, onDelete }: ChannelCardProps) {
  return (
    <div className="group relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="relative w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Tv className={`w-8 h-8 text-muted-foreground ${channel.logo ? 'hidden' : ''}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{channel.name}</h3>
          {channel.group && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
              {channel.group}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(channel)}
            className="hover:bg-secondary"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(channel)}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="gradient"
            size="icon"
            onClick={() => onPlay(channel)}
            className="rounded-full"
          >
            <Play className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
