import { useState, useCallback } from "react";
import type { Area } from "react-easy-crop";

interface ImageEditorResult {
    file: File;
    previewUrl: string;
}

/**
 * Reads a File as a data URL string.
 */
function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Creates an HTMLImageElement from a source URL.
 */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });
}

/**
 * Crops the image to the specified pixel area and compresses it as JPEG.
 * Returns a Blob of the resulting image.
 */
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    quality: number = 0.82
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas context not available");

    // Output is always square (1:1)
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas toBlob failed"));
            },
            "image/jpeg",
            quality
        );
    });
}

export function useImageEditor() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [originalFileName, setOriginalFileName] = useState("");

    const openEditor = useCallback(async (file: File) => {
        const dataUrl = await readFileAsDataURL(file);
        setImageSrc(dataUrl);
        setOriginalFileName(file.name);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setIsModalOpen(true);
    }, []);

    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const confirmCrop = useCallback(async (): Promise<ImageEditorResult | null> => {
        if (!imageSrc || !croppedAreaPixels) return null;

        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels);

            // Derive filename: replace extension with .jpg
            const baseName = originalFileName.replace(/\.[^/.]+$/, "");
            const file = new File([blob], `${baseName}_cropped.jpg`, {
                type: "image/jpeg",
            });

            const previewUrl = URL.createObjectURL(blob);

            setIsModalOpen(false);
            setImageSrc(null);

            return { file, previewUrl };
        } catch (error) {
            console.error("Failed to crop image:", error);
            return null;
        }
    }, [imageSrc, croppedAreaPixels, originalFileName]);

    const closeEditor = useCallback(() => {
        setIsModalOpen(false);
        setImageSrc(null);
        setCroppedAreaPixels(null);
    }, []);

    return {
        // State
        imageSrc,
        crop,
        zoom,
        isModalOpen,

        // Setters (for Cropper component)
        setCrop,
        setZoom,

        // Actions
        openEditor,
        handleCropComplete,
        confirmCrop,
        closeEditor,
    };
}
