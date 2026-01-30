# Hướng dẫn Deploy lên Vercel

## Tổng quan

Dự án này bao gồm 2 phần:
1. **Frontend**: Next.js 14 (deploy trên Vercel)
2. **Backend**: FastAPI (deploy trên Vercel Serverless Functions)

## Bước 1: Chuẩn bị

### 1.1. Tạo 2 projects trên Vercel

1. **Frontend Project**: 
   - Root Directory: `frontend`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Backend Project**:
   - Root Directory: `backend` (hoặc root nếu dùng vercel.json)
   - Framework Preset: Other
   - Build Command: (để trống hoặc `pip install -r requirements.txt`)
   - Output Directory: (để trống)

## Bước 2: Cấu hình Environment Variables

### 2.1. Frontend Environment Variables

Trong Vercel Dashboard → Settings → Environment Variables, thêm:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
NEXTAUTH_URL=https://your-frontend-domain.vercel.app
NEXTAUTH_SECRET=<generate-random-secret-32-chars>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Lưu ý**: 
- `NEXTAUTH_URL` phải là URL production của frontend
- `NEXTAUTH_SECRET`: Chạy `openssl rand -base64 32` để generate
- Google OAuth: Cần thêm Authorized redirect URIs trong Google Cloud Console:
  - `https://your-frontend-domain.vercel.app/api/auth/callback/google`

### 2.2. Backend Environment Variables

```
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
MONGODB_URI=<your-mongodb-connection-string>
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=<your-aws-region>
AWS_S3_BUCKET_NAME=<your-s3-bucket-name>
```

## Bước 3: Cấu hình Google OAuth

### 3.1. Google Cloud Console

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo OAuth 2.0 Client ID (nếu chưa có)
3. Thêm **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-frontend-domain.vercel.app/api/auth/callback/google`

### 3.2. Kiểm tra NextAuth Configuration

File `frontend/app/api/auth/[...nextauth]/route.ts` đã được cấu hình đúng:
- Sử dụng `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`
- Sử dụng `NEXTAUTH_SECRET` và `NEXTAUTH_URL`

## Bước 4: Deploy Backend

### 4.1. Cấu hình Vercel cho Backend

File `vercel.json` đã được tạo ở root để handle backend API routes.

### 4.2. Deploy Backend

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy backend:
   ```bash
   cd backend
   vercel --prod
   ```
   
   Hoặc deploy từ root:
   ```bash
   vercel --prod
   ```

4. Lưu lại URL backend (ví dụ: `https://hanh-matching-backend.vercel.app`)

## Bước 5: Deploy Frontend

### 5.1. Cập nhật API URL

Đảm bảo `NEXT_PUBLIC_API_URL` trong Vercel Environment Variables trỏ đến backend URL.

### 5.2. Deploy Frontend

1. Deploy frontend:
   ```bash
   cd frontend
   vercel --prod
   ```

2. Hoặc push code lên GitHub và connect với Vercel:
   - Vercel Dashboard → Add New Project
   - Import từ GitHub
   - Set Root Directory: `frontend`
   - Add Environment Variables
   - Deploy

## Bước 6: Kiểm tra sau khi deploy

### 6.1. Frontend
- ✅ Truy cập `https://your-frontend-domain.vercel.app`
- ✅ Kiểm tra Google OAuth login
- ✅ Kiểm tra kết nối với backend

### 6.2. Backend
- ✅ Truy cập `https://your-backend-domain.vercel.app/api/health`
- ✅ Kiểm tra CORS settings
- ✅ Kiểm tra MongoDB connection
- ✅ Kiểm tra S3 connection

## Troubleshooting

### Lỗi Google OAuth
- Kiểm tra `NEXTAUTH_URL` đúng với domain production
- Kiểm tra Authorized redirect URIs trong Google Cloud Console
- Kiểm tra `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`

### Lỗi CORS
- Backend đã cấu hình `allow_origins=["*"]` trong `main.py`
- Nếu cần, thay đổi thành domain cụ thể của frontend

### Lỗi MongoDB Connection
- Kiểm tra `MONGODB_URI` đúng format
- Kiểm tra IP whitelist trong MongoDB Atlas (thêm `0.0.0.0/0` để allow all)

### Lỗi S3 Access
- Kiểm tra AWS credentials
- Kiểm tra S3 bucket permissions
- Kiểm tra CORS configuration trên S3 bucket

## Cấu trúc Deploy

```
Vercel Projects:
├── Frontend Project (Next.js)
│   ├── Root: frontend/
│   ├── Build: npm run build
│   └── Output: .next
│
└── Backend Project (FastAPI)
    ├── Root: ./
    ├── API Routes: api/*.py
    └── Serverless Functions: vercel.json
```

## Notes

- Backend chạy trên Vercel Serverless Functions (có timeout limit)
- File upload lớn có thể cần tăng timeout hoặc dùng streaming
- MongoDB connection pooling có thể cần điều chỉnh cho serverless
- S3 presigned URLs có expiration time (mặc định 1 giờ)

