import { useState } from "react";
import { Plus, Upload, Tv, Radio, List, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistCard } from "@/components/PlaylistCard";
import { ImportM3UDialog } from "@/components/ImportM3UDialog";
import { PlaylistView } from "@/components/PlaylistView";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useXtreamAccounts } from "@/hooks/useXtreamAccounts";
import { Playlist, Channel } from "@/types/m3u";
import { XtreamCredentials } from "@/types/xtream";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XtreamAccountCard } from "@/components/xtream/XtreamAccountCard";
import { AddXtreamAccountDialog } from "@/components/xtream/AddXtreamAccountDialog";
import { XtreamContentView } from "@/components/xtream/XtreamContentView";

type ViewMode = "playlists" | "xtream";

const Index = () => {
  const {
    playlists,
    isLoading,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    addChannelToPlaylist,
    updateChannel,
    deleteChannel,
  } = usePlaylists();

  const {
    accounts,
    isLoading: isLoadingAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useXtreamAccounts();

  const [viewMode, setViewMode] = useState<ViewMode>("playlists");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showNewPlaylistDialog, setShowNewPlaylistDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  // Xtream states
  const [showAddXtreamDialog, setShowAddXtreamDialog] = useState(false);
  const [editingXtreamAccount, setEditingXtreamAccount] = useState<XtreamCredentials | null>(null);
  const [selectedXtreamAccount, setSelectedXtreamAccount] = useState<XtreamCredentials | null>(null);

  const handleImport = (name: string, channels: Channel[]) => {
    addPlaylist(name, channels);
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      if (editingPlaylist) {
        updatePlaylist(editingPlaylist.id, { name: newPlaylistName.trim() });
        toast.success("Lista renombrada");
      } else {
        addPlaylist(newPlaylistName.trim());
        toast.success("Lista creada");
      }
      setNewPlaylistName("");
      setEditingPlaylist(null);
      setShowNewPlaylistDialog(false);
    }
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setShowNewPlaylistDialog(true);
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    deletePlaylist(playlist.id);
    toast.success("Lista eliminada");
  };

  // Xtream handlers
  const handleAddXtreamAccount = (name: string, serverUrl: string, username: string, password: string) => {
    addAccount(name, serverUrl, username, password);
  };

  const handleEditXtreamAccount = (account: XtreamCredentials) => {
    setEditingXtreamAccount(account);
    setShowAddXtreamDialog(true);
  };

  const handleDeleteXtreamAccount = (account: XtreamCredentials) => {
    deleteAccount(account.id);
    toast.success("Cuenta eliminada");
  };

  // Get current playlist data
  const currentPlaylist = selectedPlaylist
    ? playlists.find((p) => p.id === selectedPlaylist.id)
    : null;

  // Show Xtream content view
  if (selectedXtreamAccount) {
    const account = accounts.find((a) => a.id === selectedXtreamAccount.id);
    if (account) {
      return (
        <XtreamContentView
          account={account}
          onBack={() => setSelectedXtreamAccount(null)}
        />
      );
    }
  }

  // Show playlist view
  if (currentPlaylist) {
    return (
      <PlaylistView
        playlist={currentPlaylist}
        onBack={() => setSelectedPlaylist(null)}
        onAddChannel={(channel) => addChannelToPlaylist(currentPlaylist.id, channel)}
        onUpdateChannel={(channelId, updates) =>
          updateChannel(currentPlaylist.id, channelId, updates)
        }
        onDeleteChannel={(channelId) => deleteChannel(currentPlaylist.id, channelId)}
      />
    );
  }

  const loading = viewMode === "playlists" ? isLoading : isLoadingAccounts;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Radio className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold gradient-text">
                  IPTV Manager
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gestiona tus listas M3U y cuentas Xtream
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {viewMode === "playlists" ? (
                <>
                  <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar M3U
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={() => {
                      setEditingPlaylist(null);
                      setNewPlaylistName("");
                      setShowNewPlaylistDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Lista
                  </Button>
                </>
              ) : (
                <Button
                  variant="gradient"
                  onClick={() => {
                    setEditingXtreamAccount(null);
                    setShowAddXtreamDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Cuenta
                </Button>
              )}
            </div>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mt-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-secondary">
              <TabsTrigger value="playlists" className="gap-2">
                <List className="w-4 h-4" />
                Listas M3U
              </TabsTrigger>
              <TabsTrigger value="xtream" className="gap-2">
                <Server className="w-4 h-4" />
                Xtream / Smarters
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === "playlists" ? (
          // Playlists View
          playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                <Tv className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
                Sin listas de reproducción
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Importa un archivo M3U o crea una nueva lista para comenzar a
                gestionar tus canales IPTV
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={() => setShowImportDialog(true)}>
                  <Upload className="w-5 h-5 mr-2" />
                  Importar M3U
                </Button>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => setShowNewPlaylistDialog(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Lista
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onSelect={setSelectedPlaylist}
                  onEdit={handleEditPlaylist}
                  onDelete={handleDeletePlaylist}
                />
              ))}
            </div>
          )
        ) : (
          // Xtream View
          accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-6">
                <Server className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
                Sin cuentas Xtream
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Agrega una cuenta Xtream Codes / Smarters con tu usuario y contraseña
                para acceder a canales en vivo, películas y series
              </p>
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setShowAddXtreamDialog(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Cuenta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <XtreamAccountCard
                  key={account.id}
                  account={account}
                  onSelect={setSelectedXtreamAccount}
                  onEdit={handleEditXtreamAccount}
                  onDelete={handleDeleteXtreamAccount}
                />
              ))}
            </div>
          )
        )}
      </main>

      {/* Import Dialog */}
      <ImportM3UDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />

      {/* New/Edit Playlist Dialog */}
      <Dialog open={showNewPlaylistDialog} onOpenChange={setShowNewPlaylistDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingPlaylist ? "Renombrar Lista" : "Nueva Lista"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nombre de la lista"
              className="bg-secondary border-border"
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlaylistDialog(false)}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleCreatePlaylist}>
              {editingPlaylist ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Xtream Account Dialog */}
      <AddXtreamAccountDialog
        isOpen={showAddXtreamDialog}
        onClose={() => {
          setShowAddXtreamDialog(false);
          setEditingXtreamAccount(null);
        }}
        onAdd={handleAddXtreamAccount}
        editingAccount={editingXtreamAccount}
        onUpdate={updateAccount}
      />
    </div>
  );
};

export default Index;
