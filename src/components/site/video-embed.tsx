function toEmbedUrl(url: string): { kind: "iframe" | "video"; src: string } {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  return { kind: "video", src: url };
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const embed = toEmbedUrl(url);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      {embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video src={embed.src} title={title} controls className="h-full w-full" />
      )}
    </div>
  );
}
