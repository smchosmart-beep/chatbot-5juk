import { UploadCloud } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileSelect, disabled }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        rounded-2xl border-2 border-dashed p-8 flex flex-col items-center text-center gap-3
        transition-all duration-200
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        ${
          isDragging
            ? "border-mint-400 bg-mint-50"
            : "border-slate-200 bg-white hover:border-mint-200 hover:bg-mint-50/40"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="w-12 h-12 rounded-2xl bg-mint-50 text-mint-600 flex items-center justify-center">
        <UploadCloud className="w-5.5 h-5.5" strokeWidth={2.2} />
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-900">학급 규칙 PDF를 업로드하세요</p>
        <p className="text-xs text-ink-400 mt-1">
          파일을 끌어다 놓거나 클릭해서 선택하세요 (PDF, 최대 10MB)
        </p>
      </div>
    </div>
  );
}
