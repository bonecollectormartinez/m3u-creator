import { MoreVertical, Pencil, Trash2, Server, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { XtreamCredentials } from "@/types/xtream";

interface XtreamAccountCardProps {
  account: XtreamCredentials;
  onSelect: (account: XtreamCredentials) => void;
  onEdit: (account: XtreamCredentials) => void;
  onDelete: (account: XtreamCredentials) => void;
}

export function XtreamAccountCard({
  account,
  onSelect,
  onEdit,
  onDelete,
}: XtreamAccountCardProps) {
  return (
    <div
      className="group relative bg-card/50 border border-border/50 rounded-xl p-5 hover:bg-card hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
      onClick={() => onSelect(account)}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
            <Server className="w-6 h-6 text-primary-foreground" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(account);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(account);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <h3 className="font-display font-semibold text-foreground mb-2 truncate">
          {account.name}
        </h3>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <Server className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{account.serverUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 flex-shrink-0" />
            <span>{account.username}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
