import { useState, useEffect } from "react";
import { Playlist, Channel } from "@/types/m3u";

const STORAGE_KEY = "iptv-playlists";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPlaylists(parsed.map((p: Playlist) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })));
      } catch (e) {
        console.error("Error parsing playlists:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const savePlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists(newPlaylists);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaylists));
  };

  const addPlaylist = (name: string, channels: Channel[] = []) => {
    const newPlaylist: Playlist = {
      id: generateId(),
      name,
      channels,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    savePlaylists([...playlists, newPlaylist]);
    return newPlaylist;
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    const newPlaylists = playlists.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    savePlaylists(newPlaylists);
  };

  const deletePlaylist = (id: string) => {
    savePlaylists(playlists.filter((p) => p.id !== id));
  };

  const addChannelToPlaylist = (playlistId: string, channel: Omit<Channel, "id">) => {
    const newChannel: Channel = { ...channel, id: generateId() };
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      updatePlaylist(playlistId, {
        channels: [...playlist.channels, newChannel],
      });
    }
    return newChannel;
  };

  const updateChannel = (playlistId: string, channelId: string, updates: Partial<Channel>) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      updatePlaylist(playlistId, {
        channels: playlist.channels.map((c) =>
          c.id === channelId ? { ...c, ...updates } : c
        ),
      });
    }
  };

  const deleteChannel = (playlistId: string, channelId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      updatePlaylist(playlistId, {
        channels: playlist.channels.filter((c) => c.id !== channelId),
      });
    }
  };

  return {
    playlists,
    isLoading,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    addChannelToPlaylist,
    updateChannel,
    deleteChannel,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
