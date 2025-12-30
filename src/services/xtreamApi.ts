import {
  XtreamCredentials,
  XtreamAuthResponse,
  XtreamCategory,
  XtreamLiveStream,
  XtreamVodStream,
  XtreamSeriesInfo,
  ContentType,
} from "@/types/xtream";

class XtreamApi {
  private credentials: XtreamCredentials | null = null;

  setCredentials(credentials: XtreamCredentials) {
    this.credentials = credentials;
  }

  private getBaseUrl(): string {
    if (!this.credentials) throw new Error("No credentials set");
    const url = this.credentials.serverUrl.replace(/\/$/, "");
    return url;
  }

  private getAuthParams(): string {
    if (!this.credentials) throw new Error("No credentials set");
    return `username=${encodeURIComponent(this.credentials.username)}&password=${encodeURIComponent(this.credentials.password)}`;
  }

  async authenticate(serverUrl: string, username: string, password: string): Promise<XtreamAuthResponse> {
    const cleanUrl = serverUrl.replace(/\/$/, "");
    const response = await fetch(
      `${cleanUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    );

    if (!response.ok) {
      throw new Error("Error de conexión al servidor");
    }

    const data = await response.json();

    if (!data.user_info || data.user_info.auth === 0) {
      throw new Error("Credenciales inválidas");
    }

    return data as XtreamAuthResponse;
  }

  async getLiveCategories(): Promise<XtreamCategory[]> {
    const response = await fetch(
      `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_live_categories`
    );
    if (!response.ok) throw new Error("Error al obtener categorías");
    return response.json();
  }

  async getVodCategories(): Promise<XtreamCategory[]> {
    const response = await fetch(
      `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_vod_categories`
    );
    if (!response.ok) throw new Error("Error al obtener categorías");
    return response.json();
  }

  async getSeriesCategories(): Promise<XtreamCategory[]> {
    const response = await fetch(
      `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_series_categories`
    );
    if (!response.ok) throw new Error("Error al obtener categorías");
    return response.json();
  }

  async getLiveStreams(categoryId?: string): Promise<XtreamLiveStream[]> {
    let url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_live_streams`;
    if (categoryId) url += `&category_id=${categoryId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener canales");
    return response.json();
  }

  async getVodStreams(categoryId?: string): Promise<XtreamVodStream[]> {
    let url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_vod_streams`;
    if (categoryId) url += `&category_id=${categoryId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener películas");
    return response.json();
  }

  async getSeries(categoryId?: string): Promise<XtreamSeriesInfo[]> {
    let url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_series`;
    if (categoryId) url += `&category_id=${categoryId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener series");
    return response.json();
  }

  getStreamUrl(streamId: number, type: ContentType, extension: string = "ts"): string {
    if (!this.credentials) throw new Error("No credentials set");
    const base = this.getBaseUrl();
    const { username, password } = this.credentials;

    switch (type) {
      case "live":
        return `${base}/live/${username}/${password}/${streamId}.${extension}`;
      case "vod":
        return `${base}/movie/${username}/${password}/${streamId}.${extension}`;
      case "series":
        return `${base}/series/${username}/${password}/${streamId}.${extension}`;
      default:
        return "";
    }
  }
}

export const xtreamApi = new XtreamApi();
