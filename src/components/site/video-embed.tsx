"use client";

function toEmbedUrl(url: string): { kind: "iframe" | "video"; src: string } {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  return { kind: "video", src: url };
}

export function VideoEmbed({
  url,
  title,
  watermark,
}: {
  url: string;
  title: string;
  watermark?: { name: string; email: string };
}) {
  const embed = toEmbedUrl(url);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      {embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={embed.src}
          title={title}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="h-full w-full"
        />
      )}
      {embed.kind === "video" && watermark ? (
        <div className="pointer-events-none absolute right-2 bottom-14 rounded bg-black/50 px-2 py-1 text-[0.65rem] leading-tight text-white/80">
          {watermark.name} · {watermark.email}
        </div>
      ) : null}
    </div>
  );
}
