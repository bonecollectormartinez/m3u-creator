import { Play, Tv, Film, MonitorPlay } from "lucide-react";
import { XtreamLiveStream, XtreamVodStream, XtreamSeriesInfo, ContentType } from "@/types/xtream";

interface XtreamChannelCardProps {
  stream: XtreamLiveStream | XtreamVodStream | XtreamSeriesInfo;
  contentType: ContentType;
  onPlay: () => void;
}

export function XtreamChannelCard({ stream, contentType, onPlay }: XtreamChannelCardProps) {
  const getIcon = () => {
    const iconClass = "w-8 h-8 text-muted-foreground";
    switch (contentType) {
      case "live":
        return <Tv className={iconClass} />;
      case "vod":
        return <Film className={iconClass} />;
      case "series":
        return <MonitorPlay className={iconClass} />;
    }
  };

  const getImage = () => {
    if ('stream_icon' in stream && stream.stream_icon) {
      return stream.stream_icon;
    }
    if ('cover' in stream && stream.cover) {
      return stream.cover;
    }
    return null;
  };

  const getRating = () => {
    if ('rating_5based' in stream && stream.rating_5based > 0) {
      return stream.rating_5based.toFixed(1);
    }
    return null;
  };

  const image = getImage();
  const rating = getRating();

  return (
    <div
      className="group relative bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:bg-card hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={onPlay}
    >
      {/* Image / Icon Container */}
      <div className="relative aspect-[2/3] bg-secondary flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={stream.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={`flex items-center justify-center ${image ? "hidden" : ""}`}>
          {getIcon()}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
            ★ {rating}
          </div>
        )}

        {/* Live badge */}
        {contentType === "live" && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Title */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {stream.name}
        </h3>
      </div>
    </div>
  );
}
