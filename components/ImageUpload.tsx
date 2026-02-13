import React, { useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  image: string | undefined;
  onImageChange: (image: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ image, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (e.g. max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert("File size too large. Please upload an image under 4MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">Фотография (опционально)</label>
      
      {image ? (
        <div className="relative w-full h-48 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group dark:bg-gray-800 dark:border-gray-700">
            <img src={image} alt="Preview" className="w-full h-full object-contain" />
            <button 
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full shadow-sm transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ring-1 ring-gray-200 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:text-red-400 dark:ring-gray-600"
                title="Удалить фото"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
      ) : (
        <div 
            onClick={handleClick}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50/50 hover:border-primary-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-primary-900/10 dark:hover:border-primary-500"
        >
            <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ring-1 ring-gray-100 dark:bg-gray-700 dark:ring-gray-600">
               <UploadCloud className="w-6 h-6 text-primary-500 dark:text-primary-400" />
            </div>
            <div className="text-center">
                <span className="block text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors dark:text-gray-300 dark:group-hover:text-primary-400">
                    Нажмите для загрузки
                </span>
                <span className="block text-xs text-gray-400 mt-1 dark:text-gray-500">
                    JPG, PNG до 4MB
                </span>
            </div>
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
            />
        </div>
      )}
    </div>
  );
};