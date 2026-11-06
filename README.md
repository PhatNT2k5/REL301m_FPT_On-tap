# REL301m web ôn tập

React 18 + Vite + TypeScript + Tailwind + KaTeX.

```bash
npm install
npm run dev     # http://localhost:5173 (tự chép content/questions/questions.json vào src/data)
npm run test    # Vitest: quiz engine
npm run build   # typecheck + build ra dist/
```

## Cấu trúc

- `src/features/learn/` – danh sách chương, trang chương (video, phụ đề VI, mục lục từ `chNN.chapters.vtt`, ý chính).
- `src/features/practice/` – `engine.ts` (hàm thuần: câu sai xuống cuối hàng đợi, xong khi đúng hết), `decks.ts` (tất cả / chương / đề / ★ / hay sai), `SessionGrid` (bản đồ grid world các session), `SessionView`.
- `src/features/progress/store.ts` – tiến độ, ★, cài đặt trong `localStorage` (có fallback bộ nhớ khi bị chặn).
- `src/data/` – `chapters.ts`, `questions.json` (được sinh ra), `questions.sample.json` (dự phòng).
- `public/videos/` – video do `pipeline/render_video.py` sinh ra.

Hash routes: `#/learn`, `#/learn/3`, `#/practice?deck=ch-3`, `#/practice/ch-3/10/0`.
