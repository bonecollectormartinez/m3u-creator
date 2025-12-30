export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedM3UEntry {
  extinf: string;
  url: string;
  attributes: Record<string, string>;
}
