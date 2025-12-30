import { useState, useRef } from "react";
import { X, Upload, FileText, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseM3U } from "@/utils/m3uParser";
import { Channel } from "@/types/m3u";
import { toast } from "sonner";

interface ImportM3UDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (name: string, channels: Channel[]) => void;
}

export function ImportM3UDialog({ isOpen, onClose, onImport }: ImportM3UDialogProps) {
  const [playlistName, setPlaylistName] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!playlistName.trim()) {
      setPlaylistName(file.name.replace(/\.m3u8?$/i, ""));
    }

    try {
      const content = await file.text();
      const channels = parseM3U(content);
      
      if (channels.length === 0) {
        toast.error("No se encontraron canales en el archivo");
        return;
      }

      onImport(playlistName || file.name.replace(/\.m3u8?$/i, ""), channels);
      toast.success(`${channels.length} canales importados`);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Error al leer el archivo M3U");
    }
  };

  const handleUrlImport = async () => {
    if (!url.trim()) {
      toast.error("Ingresa una URL válida");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const content = await response.text();
      const channels = parseM3U(content);

      if (channels.length === 0) {
        toast.error("No se encontraron canales en la URL");
        return;
      }

      onImport(playlistName || "Lista importada", channels);
      toast.success(`${channels.length} canales importados`);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error fetching URL:", error);
      toast.error("Error al obtener la lista. Verifica la URL o usa un archivo.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPlaylistName("");
    setUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Importar Lista M3U
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-4">
          <Label htmlFor="playlistName" className="text-foreground">Nombre de la lista</Label>
          <Input
            id="playlistName"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Mi lista IPTV"
            className="mt-1.5 bg-secondary border-border"
          />
        </div>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="file" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Archivo
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Link className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground font-medium mb-1">
                Arrastra o haz clic para subir
              </p>
              <p className="text-sm text-muted-foreground">
                Archivos .m3u o .m3u8
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".m3u,.m3u8"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="m3uUrl" className="text-foreground">URL de la lista M3U</Label>
              <Input
                id="m3uUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://example.com/playlist.m3u"
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <Button
              variant="gradient"
              className="w-full"
              onClick={handleUrlImport}
              disabled={isLoading}
            >
              {isLoading ? "Importando..." : "Importar desde URL"}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
