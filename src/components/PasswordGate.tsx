import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PasswordGateProps {
  onUnlock: (password: string) => Promise<boolean>;
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading || !password) return;
    setLoading(true);
    try {
      const success = await onUnlock(password);
      if (!success) {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-mint-50 text-mint-600 flex items-center justify-center">
          <KeyRound className="w-5.5 h-5.5" strokeWidth={2.2} />
        </div>

        <div>
          <h2 className="text-base font-bold text-ink-900">선생님 인증</h2>
          <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">
            학급 규칙 파일을 업로드하려면<br />비밀번호를 입력해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="비밀번호"
            autoFocus
            className={`
              w-full rounded-2xl bg-bg-app px-4 py-3 text-sm text-ink-900 text-center
              placeholder:text-ink-400 outline-none
              focus:ring-2 focus:ring-mint-200
              ${error ? "ring-2 ring-red-200" : ""}
            `}
          />
          {error && (
            <p className="text-xs text-red-500">비밀번호가 올바르지 않아요. 다시 입력해주세요.</p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            className="
              w-full rounded-2xl bg-mint-500 text-white text-sm font-semibold
              py-3 mt-1
              transition-all duration-200 active:scale-95
              hover:bg-mint-600 hover:-translate-y-0.5
              disabled:opacity-40 disabled:hover:translate-y-0
            "
          >
            {loading ? "확인 중..." : "확인"}
          </button>
        </form>
      </div>
    </div>
  );
}
