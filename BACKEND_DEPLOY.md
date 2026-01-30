# Hướng dẫn Deploy Backend riêng trên Vercel

## Bước 1: Tạo Project Vercel mới cho Backend

1. **Vào Vercel Dashboard:**
   - Truy cập: https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository:**
   - Chọn repository: `ptnk-matching/ptnk-matching`
   - Click "Import"

3. **Cấu hình Project:**
   - **Project Name**: `hanh-matching-backend` (hoặc tên bạn muốn)
   - **Root Directory**: `.` (root của repo, không phải `backend/`)
   - **Framework Preset**: Other
   - **Build Command**: Để trống
   - **Output Directory**: Để trống
   - **Install Command**: Để trống

4. **Click "Deploy"**

## Bước 2: Cấu hình Vercel để deploy Python Functions

1. **Tạo file `vercel.json` ở root của repo:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/api/index.py"
       }
     ]
   }
   ```

2. **Hoặc sử dụng file `vercel.json` hiện có** (nếu đã có)

## Bước 3: Thêm Environment Variables cho Backend

Vào **Settings** → **Environment Variables**, thêm các biến sau:

### Bắt buộc:
```
OPENAI_API_KEY=sk-your-openai-api-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
NEXTAUTH_SECRET=same_secret_as_frontend
```

### Optional:
```
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
MONGODB_DB_NAME=hanh_matching
AWS_REGION=us-east-1
CORS_ORIGINS=https://ptnk-matching-ten.vercel.app
```

**Lưu ý:**
- `NEXTAUTH_SECRET` phải giống với frontend project
- `CORS_ORIGINS` nên set thành URL của frontend để tránh CORS issues

## Bước 4: Deploy và lấy URL

1. **Deploy project:**
   - Push code lên GitHub hoặc trigger deployment trong Vercel Dashboard
   - Đợi build hoàn thành

2. **Lấy URL:**
   - Sau khi deploy xong, bạn sẽ có URL như: `https://hanh-matching-backend.vercel.app`
   - Copy URL này

## Bước 5: Cấu hình Frontend để kết nối với Backend

1. **Vào Frontend Project trong Vercel Dashboard:**
   - Project: `ptnk-matching-ten` (hoặc tên frontend project của bạn)

2. **Thêm Environment Variable:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://hanh-matching-backend.vercel.app` (URL backend vừa deploy)
   - Environment: Production, Preview, Development
   - Click "Save"

3. **Redeploy Frontend:**
   - Trigger một deployment mới để áp dụng env variable

## Bước 6: Kiểm tra

1. **Test Backend:**
   ```bash
   curl https://hanh-matching-backend.vercel.app/api/health
   ```
   Kết quả mong đợi: `{"status": "ok", ...}`

2. **Test Frontend:**
   - Truy cập: `https://ptnk-matching-ten.vercel.app`
   - Kiểm tra xem có còn cảnh báo "Backend không kết nối được" không
   - Thử upload file và test matching

## Troubleshooting

### Backend không deploy được
- Kiểm tra `api/index.py` có đúng path không
- Kiểm tra `api/requirements.txt` có đầy đủ dependencies không
- Xem build logs trong Vercel Dashboard

### Frontend không kết nối được Backend
- Kiểm tra `NEXT_PUBLIC_API_URL` đã được set chưa
- Kiểm tra CORS settings trong backend
- Kiểm tra backend URL có đúng không

### CORS Error
- Thêm frontend URL vào `CORS_ORIGINS` trong backend env variables
- Hoặc set `CORS_ORIGINS=*` để allow all (chỉ dùng cho development)

## Cấu trúc sau khi deploy

```
Vercel Projects:
├── Frontend Project (ptnk-matching-ten)
│   ├── Root: frontend/
│   ├── Framework: Next.js
│   └── Env: NEXT_PUBLIC_API_URL=https://hanh-matching-backend.vercel.app
│
└── Backend Project (hanh-matching-backend)
    ├── Root: ./
    ├── Framework: Other
    ├── API Routes: api/index.py → /api/*
    └── Env: OPENAI_API_KEY, MONGODB_URI, AWS_*, NEXTAUTH_SECRET
```

