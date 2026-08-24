import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, FileVideo, Image as ImageIcon, Loader2, FileText, Headphones } from "lucide-react";

export default function FileUploader({ 
  type = "image", 
  onUploadComplete, 
  value = "",
  label = "Upload de Arquivo"
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const processImage = (file) => {
    setIsUploading(true);
    setProgress(30);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        setProgress(60);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Resize if too large to save localStorage space (Max 800px width/height)
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP for best compression (quality 0.7)
        const compressedBase64 = canvas.toDataURL("image/webp", 0.7);
        
        setProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          onUploadComplete(compressedBase64, "00:00");
        }, 500);
      };
    };
  };

  const processMockUpload = (file, fileType) => {
    setIsUploading(true);
    setProgress(0);

    // Fake upload progress
    const duration = 2000; // 2 seconds fake upload
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.round((currentStep / steps) * 100);
      setProgress(currentProgress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          
          let mockUrl = "https://example.com/mock-file";
          let mockDuration = "00:00";

          if (fileType === "video") {
            const fakeMinutes = Math.max(1, Math.floor((file.size / (1024 * 1024)) * 0.5));
            const fakeSeconds = Math.floor(Math.random() * 60).toString().padStart(2, '0');
            mockDuration = `${fakeMinutes}:${fakeSeconds}`;
            mockUrl = URL.createObjectURL(file);
          } else if (fileType === "audio") {
            mockUrl = URL.createObjectURL(file);
          } else if (fileType === "document") {
            mockUrl = URL.createObjectURL(file);
          }

          onUploadComplete(mockUrl, mockDuration);
        }, 500);
      }
    }, intervalTime);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (type === "image" && file.type.startsWith("image/")) {
      processImage(file);
    } else if (type === "video" && file.type.startsWith("video/")) {
      processMockUpload(file, "video");
    } else if (type === "audio" && file.type.startsWith("audio/")) {
      processMockUpload(file, "audio");
    } else if (type === "document") {
      processMockUpload(file, "document");
    } else {
      alert(`Por favor, selecione um arquivo válido para este campo.`);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-widest text-nomad-muted block mb-2">{label}</label>
      
      {!value && !isUploading && (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
            ${isDragging ? 'border-[#C05746] bg-[#C05746]/5' : 'border-[#E6D7C3] bg-nomad-sand/10 hover:bg-nomad-sand/30 hover:border-[#C05746]/50'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input 
            ref={fileInputRef} 
            type="file" 
            accept={type === "image" ? "image/*" : type === "video" ? "video/*" : type === "audio" ? "audio/*" : ".pdf"} 
            className="hidden" 
            onChange={handleChange} 
          />
          
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-nomad-muted">
            {type === "image" ? <ImageIcon size={20} /> : type === "video" ? <FileVideo size={20} /> : type === "audio" ? <Headphones size={20} /> : <FileText size={20} />}
          </div>
          <p className="text-sm font-bold text-nomad-ink mb-1">
            Arraste seu arquivo aqui
          </p>
          <p className="text-xs text-nomad-muted mb-4">
            ou clique para fazer upload do computador
          </p>
          <button type="button" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg shadow-md hover:bg-[#C05746] transition">
            Procurar Arquivo
          </button>
        </div>
      )}

      {isUploading && (
        <div className="border border-[#E6D7C3] rounded-xl p-6 bg-white shadow-sm flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[#C05746] mb-3" size={24} />
          <p className="text-sm font-bold text-nomad-ink mb-3">Enviando e Processando...</p>
          
          <div className="w-full h-2 bg-nomad-sand/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#C05746] to-[#E67E6A] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-nomad-muted font-bold mt-2">{progress}% concluído</p>
        </div>
      )}

      {value && !isUploading && (
        <div className="relative border border-[#E6D7C3] rounded-xl overflow-hidden bg-white shadow-sm group">
          {type === "image" ? (
            <div className="flex items-center gap-4 p-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black/5">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-nomad-ink flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Imagem Processada
                </p>
                <p className="text-[10px] text-nomad-muted">A capa foi otimizada com sucesso.</p>
              </div>
              <button 
                type="button"
                onClick={() => onUploadComplete("", "")}
                className="px-3 py-2 text-xs font-bold text-nomad-muted hover:text-red-500 transition"
              >
                Trocar Imagem
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-nomad-ink">
                  {type === "audio" ? "Áudio Enviado com Sucesso!" : type === "document" ? "Material Enviado com Sucesso!" : "Vídeo Enviado com Sucesso!"}
                </p>
                <p className="text-[10px] text-nomad-muted truncate max-w-[200px]">{value}</p>
              </div>
              <button 
                type="button"
                onClick={() => onUploadComplete("", "")}
                className="px-3 py-2 text-xs font-bold text-nomad-muted hover:text-red-500 transition"
              >
                Trocar Arquivo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
