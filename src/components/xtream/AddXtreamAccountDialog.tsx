import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { xtreamApi } from "@/services/xtreamApi";
import { toast } from "sonner";
import { XtreamCredentials } from "@/types/xtream";

interface AddXtreamAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, serverUrl: string, username: string, password: string) => void;
  editingAccount?: XtreamCredentials | null;
  onUpdate?: (id: string, updates: Partial<XtreamCredentials>) => void;
}

export function AddXtreamAccountDialog({
  isOpen,
  onClose,
  onAdd,
  editingAccount,
  onUpdate,
}: AddXtreamAccountDialogProps) {
  const [name, setName] = useState(editingAccount?.name || "");
  const [serverUrl, setServerUrl] = useState(editingAccount?.serverUrl || "");
  const [username, setUsername] = useState(editingAccount?.username || "");
  const [password, setPassword] = useState(editingAccount?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const resetForm = () => {
    setName("");
    setServerUrl("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !serverUrl.trim() || !username.trim() || !password.trim()) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    setIsValidating(true);

    try {
      // Validate credentials
      await xtreamApi.authenticate(serverUrl, username, password);

      if (editingAccount && onUpdate) {
        onUpdate(editingAccount.id, {
          name: name.trim(),
          serverUrl: serverUrl.trim(),
          username: username.trim(),
          password: password.trim(),
        });
        toast.success("Cuenta actualizada correctamente");
      } else {
        onAdd(name.trim(), serverUrl.trim(), username.trim(), password.trim());
        toast.success("Cuenta agregada correctamente");
      }
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al validar credenciales");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingAccount ? "Editar Cuenta Xtream" : "Agregar Cuenta Xtream"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la cuenta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi cuenta IPTV"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serverUrl">URL del servidor</Label>
            <Input
              id="serverUrl"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://servidor.com:8080"
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">
              Incluye el puerto si es necesario (ej: :8080)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isValidating}>
            Cancelar
          </Button>
          <Button variant="gradient" onClick={handleSubmit} disabled={isValidating}>
            {isValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingAccount ? "Guardar" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
