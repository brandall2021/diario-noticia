'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
}

export default function FileUpload({ onUpload, accept = 'image/*' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setPreview(data.url);
      onUpload(data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-32 rounded-lg object-cover" />
          <button
            onClick={() => {
              setPreview(null);
              onUpload('');
            }}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {isUploading ? (
            <p className="text-sm text-gray-500">Subiendo...</p>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Arrastra un archivo o haz clic para subir
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
