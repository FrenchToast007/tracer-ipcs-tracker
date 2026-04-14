import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Photo } from '@/data/types';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  photos: Photo[];
  onAdd: (photo: Omit<Photo, 'id'>) => void;
  onRemove: (photoId: string) => void;
  canEdit: boolean;
}

export function PhotoUpload({
  photos,
  onAdd,
  onRemove,
  canEdit,
}: PhotoUploadProps) {
  const [caption, setCaption] = useState('');
  const [zone, setZone] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;

      onAdd({
        url: base64String,
        caption: caption || file.name,
        zone: zone || undefined,
        takenAt: new Date().toISOString(),
        tags: [],
      });

      setCaption('');
      setZone('');
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Photo Documentation</h3>

      {canEdit && (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter photo description"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Zone (Optional)
            </label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((z) => (
                  <SelectItem key={z} value={z}>
                    Zone {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Gallery</h4>
          <span className="text-sm text-gray-600">{photos.length} photos</span>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => setSelectedPhoto(photo.id)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center text-white text-xs px-2 py-1">
                    {photo.caption}
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onRemove(photo.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
            No photos uploaded yet
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full p-2 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            {photos.find((p) => p.id === selectedPhoto) && (
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={photos.find((p) => p.id === selectedPhoto)!.url}
                  alt="expanded view"
                  className="w-full"
                />
                <div className="p-4 space-y-2">
                  <p className="font-medium text-gray-900">
                    {photos.find((p) => p.id === selectedPhoto)?.caption}
                  </p>
                  <p className="text-sm text-gray-600">
                    {photos.find((p) => p.id === selectedPhoto)?.zone && (
                      <span>Zone {photos.find((p) => p.id === selectedPhoto)?.zone} • </span>
                    )}
                    {formatDate(photos.find((p) => p.id === selectedPhoto)?.takenAt || '')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
