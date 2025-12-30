import { Channel, ParsedM3UEntry } from "@/types/m3u";

export function parseM3U(content: string): Channel[] {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const channels: Channel[] = [];
  
  let currentEntry: Partial<ParsedM3UEntry> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#EXTM3U')) {
      continue;
    }
    
    if (line.startsWith('#EXTINF:')) {
      const extinfContent = line.substring(8);
      const attributes = parseAttributes(extinfContent);
      const nameMatch = extinfContent.match(/,(.+)$/);
      
      currentEntry = {
        extinf: extinfContent,
        attributes: {
          ...attributes,
          name: nameMatch ? nameMatch[1].trim() : 'Sin nombre',
        },
      };
    } else if (!line.startsWith('#') && currentEntry) {
      channels.push({
        id: generateId(),
        name: currentEntry.attributes?.name || 'Sin nombre',
        url: line,
        logo: currentEntry.attributes?.['tvg-logo'] || currentEntry.attributes?.logo,
        group: currentEntry.attributes?.['group-title'] || 'General',
        tvgId: currentEntry.attributes?.['tvg-id'],
        tvgName: currentEntry.attributes?.['tvg-name'],
      });
      currentEntry = null;
    }
  }
  
  return channels;
}

function parseAttributes(extinf: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /([a-zA-Z-]+)="([^"]*)"/g;
  let match;
  
  while ((match = regex.exec(extinf)) !== null) {
    attributes[match[1]] = match[2];
  }
  
  return attributes;
}

export function generateM3U(channels: Channel[]): string {
  let content = '#EXTM3U\n';
  
  for (const channel of channels) {
    const attrs: string[] = [];
    
    if (channel.tvgId) attrs.push(`tvg-id="${channel.tvgId}"`);
    if (channel.tvgName) attrs.push(`tvg-name="${channel.tvgName}"`);
    if (channel.logo) attrs.push(`tvg-logo="${channel.logo}"`);
    if (channel.group) attrs.push(`group-title="${channel.group}"`);
    
    const attrsString = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
    content += `#EXTINF:-1${attrsString},${channel.name}\n`;
    content += `${channel.url}\n`;
  }
  
  return content;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
