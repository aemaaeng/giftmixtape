// iTunes Search API 응답 중 우리가 쓰는 필드만
export type ItunesItem = {
  wrapperType: string;
  kind?: string;
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl: string;
};

export type ItunesResponse = {
  resultCount: number;
  results: ItunesItem[];
};
