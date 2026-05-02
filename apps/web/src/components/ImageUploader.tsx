"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
    images: Id<"_storage">[];
    imageUrls: string[];
    onImagesChange: (images: Id<"_storage">[], urls: string[]) => void;
    maxImages?: number;
}

export default function ImageUploader({
    images,
    imageUrls,
    onImagesChange,
    maxImages = 5,
}: ImageUploaderProps) {
    const generateUploadUrl = useMutation(api.campaigns.generateUploadUrl);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = useCallback(
        async (file: File) => {
            if (images.length >= maxImages) {
                alert(`Maximum ${maxImages} images allowed`);
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Please upload an image file");
                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                alert("Image must be under 20MB");
                return;
            }

            setUploading(true);
            try {
                const uploadUrl = await generateUploadUrl();

                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                const { storageId } = await result.json();

                // Create a local preview URL
                const previewUrl = URL.createObjectURL(file);

                onImagesChange(
                    [...images, storageId as Id<"_storage">],
                    [...imageUrls, previewUrl]
                );
            } catch (error) {
                console.error("Upload failed:", error);
                alert("Failed to upload image. Please try again.");
            } finally {
                setUploading(false);
            }
        },
        [images, imageUrls, maxImages, generateUploadUrl, onImagesChange]
    );

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files) return;
            for (let i = 0; i < files.length; i++) {
                if (images.length + i >= maxImages) break;
                await uploadFile(files[i]);
            }
        },
        [images.length, maxImages, uploadFile]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    const handleRemove = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        const newUrls = imageUrls.filter((_, i) => i !== index);
        onImagesChange(newImages, newUrls);
    };

    return (
        <div className="space-y-4">
            {/* Upload area */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                    transition-all duration-300 group
                    ${dragOver
                        ? "border-[#14F195] bg-[#14F195]/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }
                    ${images.length >= maxImages ? "opacity-50 pointer-events-none" : ""}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-[#14F195] animate-spin" />
                        <p className="text-sm text-neutral-400">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                            <Upload className="w-6 h-6 text-neutral-400 group-hover:text-[#14F195] transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-300">
                                Drop images here or click to upload
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                PNG, JPG, WEBP up to 20MB • Max {maxImages} images
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image previews */}
            {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {imageUrls.map((url, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden group/img border border-white/10"
                        >
                            <img
                                src={url}
                                alt={`Campaign image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(index);
                                    }}
                                    className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-[#14F195] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                    Cover
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
