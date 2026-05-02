"use client";

import { useMemo } from "react";
import { Play } from "lucide-react";

interface VideoEmbedProps {
    url: string;
    className?: string;
}

/**
 * Parses YouTube and Vimeo URLs and renders a responsive iframe embed.
 */
export default function VideoEmbed({ url, className = "" }: VideoEmbedProps) {
    const embedUrl = useMemo(() => parseVideoUrl(url), [url]);

    if (!embedUrl) {
        return (
            <div
                className={`flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-8 ${className}`}
            >
                <div className="text-center">
                    <Play className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Invalid video URL</p>
                    <p className="text-xs text-neutral-600 mt-1">
                        Supports YouTube and Vimeo links
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative w-full overflow-hidden rounded-2xl border border-white/10 ${className}`}
            style={{ paddingBottom: "56.25%" /* 16:9 */ }}
        >
            <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Campaign video"
            />
        </div>
    );
}

/**
 * Preview component for the create form — shows the parsed URL result.
 */
export function VideoUrlInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (url: string) => void;
}) {
    const embedUrl = useMemo(() => parseVideoUrl(value), [value]);
    const isValid = value.length > 0 && embedUrl !== null;
    const isEmpty = value.length === 0;

    return (
        <div className="space-y-4">
            <input
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className={`w-full bg-white/5 border rounded-2xl px-6 py-4 outline-none transition-all ${
                    isEmpty
                        ? "border-white/10 focus:border-[#14F195]"
                        : isValid
                        ? "border-[#14F195]/40 focus:border-[#14F195]"
                        : "border-red-500/40 focus:border-red-500"
                }`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            {isValid && (
                <div className="space-y-2">
                    <p className="text-xs text-[#14F195] font-medium">✓ Valid video URL detected</p>
                    <VideoEmbed url={value} />
                </div>
            )}

            {!isEmpty && !isValid && (
                <p className="text-xs text-red-400">
                    Please paste a valid YouTube or Vimeo URL
                </p>
            )}
        </div>
    );
}

/**
 * Parse a YouTube or Vimeo URL into an embed URL.
 */
function parseVideoUrl(url: string): string | null {
    if (!url) return null;

    try {
        // YouTube patterns
        // https://www.youtube.com/watch?v=VIDEO_ID
        // https://youtu.be/VIDEO_ID
        // https://www.youtube.com/embed/VIDEO_ID
        const youtubePatterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        ];

        for (const pattern of youtubePatterns) {
            const match = url.match(pattern);
            if (match) {
                return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
            }
        }

        // Vimeo patterns
        // https://vimeo.com/VIDEO_ID
        // https://player.vimeo.com/video/VIDEO_ID
        const vimeoPatterns = [
            /vimeo\.com\/(\d+)/,
            /player\.vimeo\.com\/video\/(\d+)/,
        ];

        for (const pattern of vimeoPatterns) {
            const match = url.match(pattern);
            if (match) {
                return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
            }
        }

        return null;
    } catch {
        return null;
    }
}
