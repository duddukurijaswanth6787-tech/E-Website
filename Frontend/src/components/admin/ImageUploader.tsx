import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, Loader2, RefreshCw } from 'lucide-react';
import { uploadService } from '../../api/services/upload.service';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = 'general',
  className = '',
  label,
  helperText
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
      return false;
    }
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB.');
      return false;
    }
    return true;
  };

  const handleUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setProgress(10); // Fake initial progress

    try {
      // Simulate progress for better UX while waiting for actual response
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const res = await uploadService.uploadSingle(file, folder);
      
      clearInterval(progressInterval);
      setProgress(100);

      const responseBody = res.data || res;
      const imageUrl = responseBody?.data?.url || responseBody?.url || responseBody;

      if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        onChange(imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Invalid URL returned from server');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{label}</label>}
      
      <div 
        className={`relative w-full rounded-xl border-2 overflow-hidden transition-all duration-300 ${
          isDragging 
            ? 'border-primary-500 bg-primary-50/50 scale-[1.02]' 
            : value 
              ? 'border-gray-200 bg-white' 
              : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={!value ? triggerSelect : undefined}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp,image/jpg" 
          onChange={onFileSelect} 
        />

        {/* Uploading State */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
            <span className="text-xs font-bold text-gray-700 tracking-wider uppercase mb-2">Uploading to AWS S3...</span>
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Value Present State */}
        {value && !isUploading ? (
          <div className="relative group min-h-[150px] flex items-center justify-center bg-gray-100">
            <img 
              src={value} 
              alt="Uploaded asset preview" 
              className="w-full h-full object-cover max-h-[300px]"
            />
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-10 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={triggerSelect}
                className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white text-xs font-bold tracking-wider uppercase transition-colors"
              >
                <RefreshCw size={14} className="mr-2" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center px-4 py-2 bg-red-500/80 hover:bg-red-500 border border-red-500/50 rounded-lg text-white text-xs font-bold tracking-wider uppercase transition-colors"
              >
                <X size={14} className="mr-2" />
                Remove
              </button>
            </div>
          </div>
        ) : null}

        {/* Empty State */}
        {!value && !isUploading && (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-primary-600">
              <UploadCloud size={28} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Click or drag image to upload</p>
            <p className="text-xs text-gray-500">Supports JPG, PNG, WebP (Max 5MB)</p>
          </div>
        )}
      </div>
      
      {helperText && <p className="text-[10px] text-gray-400 mt-2 font-medium">{helperText}</p>}
    </div>
  );
};
