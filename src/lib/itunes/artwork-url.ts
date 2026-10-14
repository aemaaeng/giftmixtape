// iTunes 커버 URL은 끝의 "100x100bb.jpg"를 바꾸면 그 크기로 내려준다
export default function artworkUrl(url: string, size: number): string {
  return url.replace(/\/\d+x\d+bb\.(\w+)$/, `/${size}x${size}bb.$1`);
}
