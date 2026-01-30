# Cách Vercel Deploy Frontend + Backend chung

## Cấu hình hiện tại:

- **Root Directory**: `frontend` (trong Vercel Dashboard)
- **Include files outside root**: **ENABLED** ✅
- **vercel.json**: Ở root của repo (không phải trong `frontend/`)

## Cách hoạt động:

### 1. Frontend (Next.js):
- Vercel build từ `frontend/` (vì Root Directory = `frontend`)
- Tìm thấy `frontend/package.json` → detect Next.js
- Chạy Build Command: `npm install && npm run build` trong `frontend/`
- Output: `frontend/.next` → deploy như Next.js app

### 2. Backend (Python Functions):
- Vercel đọc `vercel.json` ở **root của repo** (không phụ thuộc Root Directory)
- Tìm thấy `api/index.py` và `api/requirements.txt` ở root
- Nhờ toggle "Include files outside root directory" ENABLED, Vercel có thể access `api/` ở root
- Tự động install Python dependencies từ `api/requirements.txt`
- Deploy `api/index.py` như serverless function
- Route `/api/*` requests đến Python handler

### 3. Routing:
- Frontend routes (`/`, `/auth/*`, etc.) → Next.js app
- Backend routes (`/api/*`) → Python function (`api/index.py`)

## File structure:

```
repo/
├── vercel.json          ← Vercel đọc file này (ở root)
├── frontend/            ← Root Directory (trong Vercel Dashboard)
│   ├── package.json     ← Next.js được detect từ đây
│   ├── .next/           ← Build output
│   └── ...
├── api/                 ← Python functions (Vercel access được nhờ toggle)
│   ├── index.py         ← Python handler
│   └── requirements.txt ← Python dependencies
└── backend/             ← Backend code (Vercel access được nhờ toggle)
    └── ...
```

## Tại sao cần toggle "Include files outside root directory"?

- Root Directory = `frontend` → Vercel chỉ build từ `frontend/` mặc định
- Nhưng `api/` và `backend/` nằm ở root, ngoài `frontend/`
- Toggle này cho phép Vercel access các files/folders ở root khi build
- → Vercel có thể detect và deploy Python functions từ `api/`

## Kết quả:

✅ Frontend được deploy từ `frontend/`
✅ Backend được deploy từ `api/`
✅ Cả hai chạy trên cùng một domain
✅ Routes được phân chia đúng: `/` → Next.js, `/api/*` → Python

## Lưu ý:

- `vercel.json` **phải ở root** của repo (không phải trong `frontend/`)
- Path trong `rewrites` là **relative từ root** của repo: `/api/index.py`
- Toggle "Include files outside root directory" **phải ENABLED**

