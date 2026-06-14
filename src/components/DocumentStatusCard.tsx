import { CheckCircle2, FileText, Loader2, XCircle } from "lucide-react";
import type { RuleDocument } from "@/types/chat";

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

const STATUS_CONFIG: Record<
  RuleDocument["status"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  ready: { label: "학습 완료", icon: CheckCircle2, className: "text-mint-600 bg-mint-50" },
  processing: { label: "학습 중", icon: Loader2, className: "text-amber-tag bg-amber-tag-bg" },
  error: { label: "학습 실패", icon: XCircle, className: "text-red-500 bg-red-50" },
};

export function DocumentStatusCard({ document }: { document: RuleDocument }) {
  const status = STATUS_CONFIG[document.status];
  const Icon = status.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-bg-app flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-ink-700" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900 truncate">{document.fileName}</p>
        <p className="text-xs text-ink-400 mt-0.5">
          {formatDate(document.uploadedAt)} 업로드 · {document.fileSizeLabel}
        </p>
      </div>

      <span
        className={`
          shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
          ${status.className}
        `}
      >
        <Icon
          className={`w-3.5 h-3.5 ${document.status === "processing" ? "animate-spin" : ""}`}
          strokeWidth={2.4}
        />
        {status.label}
      </span>
    </div>
  );
}
