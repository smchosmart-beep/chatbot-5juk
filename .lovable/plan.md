# 학급 규칙 RAG 챗봇 — 백엔드 연동 계획

업로드한 `class-rule-bot` UI를 현재 TanStack Start 프로젝트로 이식하고, Lovable Cloud(DB) + Lovable AI Gateway(임베딩·채팅)를 연결해 **교사가 올린 PDF 내용 안에서만 답하는 RAG 챗봇**으로 완성합니다.

## 확정된 요구사항
- 교사 인증: 공용 비밀번호(서버 검증, 코드에 노출 안 함)
- 규칙 문서: 여러 개 누적 (올린 모든 PDF를 합쳐서 답변에 활용)
- 파일 형식: PDF만
- 대화 저장: 안 함 (새로고침 시 초기화)

## 동작 방식

```text
[교사] PDF 업로드 → 브라우저에서 텍스트 추출 → 비밀번호+텍스트 서버 전송
        → 서버: 문서 저장 → 문단 단위 분할 → 임베딩 → DB 저장(상태: 학습완료)

[학생] 질문 입력 → 서버: 질문 임베딩 → 유사 규칙 조각 검색(전체 문서 대상)
        → AI가 "검색된 규칙 내용만" 근거로 답변 + 출처 조항 표시
        → 규칙에 없으면 "찾지 못했어요" 안내
```

## 구현 단계

### 1) UI 이식 (mockData 제거)
- 업로드 소스의 컴포넌트(`NavBar`, `MessageBubble`, `ChatInput`, `FileDropzone`, `DocumentStatusCard`, `PasswordGate`, `RuleTag`, `TypingIndicator`)와 디자인 토큰(`index.css`의 mint/ink 팔레트, Pretendard 폰트)을 프로젝트로 이식
- 탭 전환 대신 라우트로 구성: `/`(채팅), `/upload`(규칙 업로드)
- `src/lib/mockData.ts`의 목 응답·목 문서 로직 삭제, 실제 서버 호출로 대체 (환영 메시지·추천 질문 상수는 유지)

### 2) Lovable Cloud(DB) 구성
- `pgvector` 확장 활성화
- `rule_documents` 테이블: 파일명, 용량, 상태(processing/ready/error), 생성일
- `rule_chunks` 테이블: 문서 참조, 조각 텍스트, 순번, 임베딩 벡터(1536차원), 생성일 — 유사도 검색용 인덱스 포함
- 유사도 검색 함수 `match_rule_chunks(query_embedding, match_count)`
- 두 테이블 모두 RLS 잠금 유지. 앱은 공용 비밀번호 모델이라 모든 읽기/쓰기를 **서버 함수(service role)**로 처리 (브라우저 직접 접근 없음)

### 3) AI Gateway 연동 (서버 전용)
- 임베딩: `google/gemini-embedding-001` (1536차원), Lovable AI Gateway `/v1/embeddings` 호출
- 채팅: `google/gemini-3-flash-preview`, 검색된 규칙 조각만 컨텍스트로 전달
- 엄격한 RAG 시스템 프롬프트: "제공된 학급 규칙 내용 안에서만 답하라. 없으면 모른다고 답하라." + 초등학생 친근한 말투

### 4) 서버 함수 (`createServerFn`)
- `verifyTeacherPassword`: 공용 비밀번호 검증
- `ingestDocument`: 비밀번호 검증 → 문서 저장 → 텍스트 분할·임베딩 → 조각 저장 → 상태 ready
- `listDocuments`: 업로드된 규칙 목록 반환 (업로드 페이지 상태 표시)
- `askQuestion`: 질문 임베딩 → 유사 조각 검색 → AI 답변·출처 조항 반환 (문서가 없으면 안내 메시지)

### 5) 검증
- 업로드 → 학습완료 표시 확인
- 규칙에 있는 질문 → 정확한 답변 + 출처 칩 표시
- 규칙에 없는 질문 → "찾지 못했어요" 안내
- 잘못된 비밀번호 차단 확인

## 기술 메모
- PDF 텍스트 추출은 **브라우저에서** `pdfjs-dist`로 처리 (서버 Worker 런타임은 PDF 파서 미지원). 추출한 텍스트만 서버로 전송하며 PDF 원본은 저장하지 않음
- 공용 비밀번호는 `TEACHER_PASSWORD` 시크릿으로 저장 (빌드 단계에서 보안 입력 폼으로 설정 요청)
- 임베딩 차원을 1536으로 맞춰 벡터 인덱스 사용 가능하게 함
- 채팅 응답은 비스트리밍(기존 UX와 동일하게 입력 중 표시 → 답변 한 번에 표시)
