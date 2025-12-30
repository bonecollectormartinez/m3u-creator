import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Channel } from "@/types/m3u";

interface AddChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (channel: Omit<Channel, "id">) => void;
  editChannel?: Channel | null;
}

export function AddChannelDialog({ isOpen, onClose, onAdd, editChannel }: AddChannelDialogProps) {
  const [name, setName] = useState(editChannel?.name || "");
  const [url, setUrl] = useState(editChannel?.url || "");
  const [logo, setLogo] = useState(editChannel?.logo || "");
  const [group, setGroup] = useState(editChannel?.group || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && url.trim()) {
      onAdd({
        name: name.trim(),
        url: url.trim(),
        logo: logo.trim() || undefined,
        group: group.trim() || "General",
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setLogo("");
    setGroup("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground">
            {editChannel ? "Editar Canal" : "Añadir Canal"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Nombre del canal *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Canal Nacional"
              className="mt-1.5 bg-secondary border-border"
              required
            />
          </div>

          <div>
            <Label htmlFor="url" className="text-foreground">URL del stream *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://example.com/stream.m3u8"
              className="mt-1.5 bg-secondary border-border"
              required
            />
          </div>

          <div>
            <Label htmlFor="logo" className="text-foreground">URL del logo (opcional)</Label>
            <Input
              id="logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="http://example.com/logo.png"
              className="mt-1.5 bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="group" className="text-foreground">Grupo/Categoría</Label>
            <Input
              id="group"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Ej: Deportes, Noticias, Películas"
              className="mt-1.5 bg-secondary border-border"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              {editChannel ? "Guardar" : "Añadir"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
