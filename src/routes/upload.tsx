import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { DocumentStatusCard } from "@/components/DocumentStatusCard";
import { FileDropzone } from "@/components/FileDropzone";
import { PasswordGate } from "@/components/PasswordGate";
import { extractPdfText } from "@/lib/pdf";
import {
  ingestDocument,
  listDocuments,
  verifyTeacherPassword,
} from "@/lib/rag.functions";
import type { AuthStatus, RuleDocument } from "@/types/chat";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "규칙 업로드 · 우리 반 규칙 도우미" },
      {
        name: "description",
        content: "선생님이 학급 규칙 PDF를 업로드하면 챗봇이 학습합니다.",
      },
    ],
  }),
  component: UploadPage,
});

const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadPage() {
  const verify = useServerFn(verifyTeacherPassword);
  const ingest = useServerFn(ingestDocument);
  const fetchDocs = useServerFn(listDocuments);

  const [auth, setAuth] = useState<AuthStatus>("locked");
  const [password, setPassword] = useState("");
  const [documents, setDocuments] = useState<RuleDocument[]>([]);
  const [working, setWorking] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth !== "unlocked") return;
    fetchDocs({}).then(setDocuments).catch(() => undefined);
  }, [auth, fetchDocs]);

  async function handleUnlock(pw: string) {
    const { ok } = await verify({ data: { password: pw } });
    if (ok) {
      setPassword(pw);
      setAuth("unlocked");
    }
    return ok;
  }

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("PDF 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("파일이 너무 커요. 10MB 이하의 PDF를 올려주세요.");
      return;
    }

    setWorking(true);
    try {
      setStatusText("PDF에서 글자를 읽는 중...");
      const text = await extractPdfText(file);

      setStatusText("규칙을 학습하는 중... (조금 걸릴 수 있어요)");
      const doc = await ingest({
        data: {
          password,
          fileName: file.name,
          fileSizeLabel: formatSize(file.size),
          text,
        },
      });

      setDocuments((prev) => [doc, ...prev]);
      setStatusText(null);
    } catch (err) {
      setStatusText(null);
      setError(
        err instanceof Error
          ? err.message
          : "업로드 중 문제가 생겼어요. 다시 시도해주세요.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <AppLayout>
      <header className="shrink-0 px-5 py-4 border-b border-slate-200/70 bg-white">
        <h1 className="text-base font-bold text-ink-900">규칙 업로드</h1>
        <p className="text-xs text-ink-400 mt-0.5">
          학급 규칙 PDF를 올리면 챗봇이 그 내용으로 답해요
        </p>
      </header>

      {auth === "locked" ? (
        <div className="flex-1 min-h-0">
          <PasswordGate onUnlock={handleUnlock} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 flex flex-col gap-5">
          <FileDropzone onFileSelect={handleFile} disabled={working} />

          {statusText && (
            <div className="rounded-2xl bg-mint-50 text-mint-700 text-sm px-4 py-3 font-medium">
              {statusText}
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3 font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-ink-900">
              업로드된 규칙 ({documents.length})
            </h2>
            {documents.length === 0 ? (
              <p className="text-xs text-ink-400">
                아직 업로드한 규칙이 없어요. 첫 규칙 PDF를 올려보세요.
              </p>
            ) : (
              documents.map((doc) => (
                <DocumentStatusCard key={doc.id} document={doc} />
              ))
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
