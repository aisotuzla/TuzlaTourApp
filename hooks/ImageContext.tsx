import React, { createContext, useContext, useState, useCallback } from 'react';

interface ImageContextType {
    images: string[];
    currentIndex: number;
    isOpen: boolean;
    openGallery: (images: string[], index?: number) => void;
    closeGallery: () => void;
    nextImage: () => void;
    prevImage: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const openGallery = useCallback((newImages: string[], index: number = 0) => {
        setImages(newImages);
        setCurrentIndex(index);
        setIsOpen(true);
    }, []);

    const closeGallery = useCallback(() => {
        setIsOpen(false);
        setImages([]);
        setCurrentIndex(0);
    }, []);

    const nextImage = useCallback(() => {
        if (images.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        if (images.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    return (
        <ImageContext.Provider value={{ 
            images, 
            currentIndex, 
            isOpen, 
            openGallery, 
            closeGallery, 
            nextImage, 
            prevImage 
        }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImage = () => {
    const context = useContext(ImageContext);
    if (context === undefined) {
        throw new Error('useImage must be used within an ImageProvider');
    }
    return context;
};
