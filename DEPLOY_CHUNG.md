# Hướng dẫn Deploy Frontend + Backend chung trên Vercel

## Cấu hình Vercel Dashboard

### Bước 1: Cấu hình Project Settings

1. **Vào Vercel Dashboard** → Chọn project `ptnk-matching-ten`

2. **Vào Settings → General**

3. **Cấu hình Build & Development Settings:**
   - **Root Directory**: `.` (root của repo, KHÔNG phải `frontend/`)
   - **Framework Preset**: Next.js (hoặc để Vercel tự detect)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/.next`
   - **Install Command**: Để trống (hoặc `cd frontend && npm install`)

4. **Save**

### Bước 2: Thêm Environment Variables

Vào **Settings → Environment Variables**, thêm các biến sau:

#### Frontend Variables:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=s+LakqLlpg0DunI/Mavp+rTlLXtZHTnSQDtgDDD/aTM=
NEXTAUTH_URL=https://ptnk-matching-ten.vercel.app
```

#### Backend Variables:
```
OPENAI_API_KEY=sk-your-openai-api-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
```

#### Optional Backend Variables:
```
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
MONGODB_DB_NAME=hanh_matching
AWS_REGION=us-east-1
CORS_ORIGINS=https://ptnk-matching-ten.vercel.app
```

**Lưu ý:**
- `NEXTAUTH_SECRET` phải giống nhau cho cả frontend và backend
- `NEXTAUTH_URL` phải là URL chính xác của production site
- `CORS_ORIGINS` nên set thành URL của frontend

### Bước 3: Deploy

1. **Push code lên GitHub** (nếu chưa push)
2. **Hoặc trigger deployment** trong Vercel Dashboard
3. **Đợi build hoàn thành**

## Cấu trúc sau khi deploy

```
Vercel Project (ptnk-matching-ten)
├── Frontend (Next.js)
│   ├── Build từ: frontend/
│   ├── Output: frontend/.next
│   └── Routes: /, /auth/*, /professor/*, /profile/*
│
└── Backend (Python Serverless Functions)
    ├── Handler: api/index.py
    ├── Routes: /api/*
    └── Dependencies: api/requirements.txt
```

## Kiểm tra sau khi deploy

### 1. Test Frontend:
```bash
curl https://ptnk-matching-ten.vercel.app
```
- Phải trả về HTML của Next.js app

### 2. Test Backend API:
```bash
curl https://ptnk-matching-ten.vercel.app/api/health
```
- Kết quả mong đợi: `{"status": "ok", ...}`

### 3. Test Auth Config:
```bash
curl https://ptnk-matching-ten.vercel.app/api/auth/config
```
- Kết quả mong đợi: `{"configured": true, ...}`

## Troubleshooting

### Lỗi "No Next.js version detected"
- Kiểm tra Root Directory = `.` (không phải `frontend/`)
- Kiểm tra Build Command có đúng không

### Lỗi "Python function not found"
- Kiểm tra `api/index.py` có tồn tại không
- Kiểm tra `api/requirements.txt` có đầy đủ dependencies không
- Xem build logs trong Vercel Dashboard

### Frontend không kết nối được Backend
- Kiểm tra `NEXT_PUBLIC_API_URL` có được set không
- Nếu không set, frontend sẽ dùng relative path `/api/*` (đúng cho deploy chung)
- Kiểm tra CORS settings trong backend

### CORS Error
- Thêm frontend URL vào `CORS_ORIGINS` trong env variables
- Hoặc kiểm tra CORS settings trong `backend/main.py`

## Lưu ý quan trọng

1. **Root Directory phải là `.`** (root của repo), không phải `frontend/`
2. **Build Command** phải build từ `frontend/`
3. **Output Directory** phải là `frontend/.next`
4. **Backend routes** sẽ tự động được deploy từ `api/index.py` → `/api/*`
5. **Frontend không cần `NEXT_PUBLIC_API_URL`** khi deploy chung vì có thể dùng relative path `/api/*`

## Cấu hình file vercel.json

File `vercel.json` ở root đã được cấu hình:
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    }
  ]
}
```

File này sẽ tự động:
- Build Next.js app từ `frontend/`
- Deploy Python functions từ `api/index.py`
- Route `/api/*` requests đến Python handler

