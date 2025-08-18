import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  currentImage?: string | null;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageChange, 
  currentImage, 
  className = '' 
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${className}`}
    >
      <div className="mb-2">
        <label className="block text-sm font-medium text-qc-text">
          Profile Picture
        </label>
      </div>
      
      <div
        className={`
          relative w-32 h-32 mx-auto border-2 border-dashed rounded-full
          flex items-center justify-center cursor-pointer transition-all duration-300
          ${isDragOver 
            ? 'border-qc-accent bg-qc-accent/10' 
            : 'border-gray-300 hover:border-qc-primary'
          }
          ${preview ? 'border-solid' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full rounded-full object-cover"
            />
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-3 h-3" />
            </motion.button>
          </>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Click or drag to upload
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG up to 5MB
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {!preview && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Optional: Add a profile picture to personalize your account
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ImageUpload;
