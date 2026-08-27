import React from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop, ZoomIn, ZoomOut, Check, X } from "lucide-react";

interface ImageCropModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    crop: Point;
    zoom: number;
    onCropChange: (crop: Point) => void;
    onZoomChange: (zoom: number) => void;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    isOpen,
    imageSrc,
    crop,
    zoom,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onConfirm,
    onCancel,
}) => {
    if (!imageSrc) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="max-w-lg p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-xl gap-0">
                <DialogHeader className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Crop className="w-5 h-5 text-brand-primary" />
                        Atur Foto Produk
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Geser dan zoom untuk memotong gambar menjadi rasio 1:1 (persegi). Gambar akan otomatis dikompres.
                    </DialogDescription>
                </DialogHeader>

                {/* Crop Area */}
                <div className="relative w-full aspect-square bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropComplete}
                        cropShape="rect"
                        showGrid={true}
                        style={{
                            containerStyle: {
                                width: "100%",
                                height: "100%",
                                position: "relative",
                            },
                        }}
                    />
                </div>

                {/* Zoom Controls */}
                <div className="px-5 py-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.05}
                            onValueChange={(value) => onZoomChange(value[0])}
                            className="flex-1"
                        />
                        <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 font-mono w-10 text-right shrink-0">
                            {zoom.toFixed(1)}x
                        </span>
                    </div>
                </div>

                <DialogFooter className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-5 shadow-xs bg-white gap-1.5"
                        onClick={onCancel}
                    >
                        <X className="w-3.5 h-3.5" />
                        Batal
                    </Button>
                    <Button
                        type="button"
                        className="h-10 px-5 shadow-md shadow-brand-primary/20 gap-1.5"
                        onClick={onConfirm}
                    >
                        <Check className="w-3.5 h-3.5" />
                        Terapkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
