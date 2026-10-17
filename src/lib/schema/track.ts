export type Track = {
  id: number;
  country: "kr" | "us";
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  previewUrl: string;
  appleMusicUrl: string;
};

// 테이프에 저장하는 곡 정보. 미리듣기·링크는 저장하지 않고 받는 화면에서 다시 받는다
export type TrackRef = Pick<Track, "id" | "country" | "title" | "artist" | "artworkUrl">;
