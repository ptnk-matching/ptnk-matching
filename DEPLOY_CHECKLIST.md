# Deployment Checklist - Vercel Production

## ✅ Pre-Deployment Checklist

### Frontend (Next.js)

- [ ] **Environment Variables trong Vercel Dashboard**:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
  NEXTAUTH_URL=https://your-frontend-domain.vercel.app
  NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
  GOOGLE_CLIENT_ID=<your-google-client-id>
  GOOGLE_CLIENT_SECRET=<your-google-client-secret>
  ```

- [ ] **Google OAuth Configuration**:
  - [ ] Thêm Authorized redirect URI trong Google Cloud Console:
    - `https://your-frontend-domain.vercel.app/api/auth/callback/google`
  - [ ] Kiểm tra `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` đúng

- [ ] **NextAuth Configuration**:
  - [ ] `NEXTAUTH_URL` phải match với domain production
  - [ ] `NEXTAUTH_SECRET` phải được set (32+ characters)

### Backend (FastAPI)

- [ ] **Environment Variables trong Vercel Dashboard**:
  ```
  OPENAI_API_KEY=<your-openai-api-key>
  OPENAI_EMBEDDING_MODEL=text-embedding-3-small
  OPENAI_CHAT_MODEL=gpt-4o-mini
  MONGODB_URI=<your-mongodb-connection-string>
  AWS_ACCESS_KEY_ID=<your-aws-access-key>
  AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
  AWS_REGION=<your-aws-region>
  AWS_S3_BUCKET_NAME=<your-s3-bucket-name>
  CORS_ORIGINS=https://your-frontend-domain.vercel.app
  ```

- [ ] **MongoDB Atlas**:
  - [ ] IP whitelist: Thêm `0.0.0.0/0` để allow Vercel IPs
  - [ ] Connection string đúng format với `retryWrites=true&w=majority`

- [ ] **AWS S3**:
  - [ ] Bucket permissions đúng
  - [ ] CORS configuration cho bucket
  - [ ] IAM user có quyền read/write

## 🚀 Deployment Steps

### Option 1: Deploy riêng biệt (Recommended)

#### Deploy Backend trước:

1. **Tạo Backend Project trên Vercel**:
   ```bash
   cd /Users/longzim/Documents/ZIMAcademy/hanh-matching
   vercel --prod
   ```
   - Root Directory: `.` (root của project)
   - Framework: Other
   - Build Command: (để trống)
   - Output Directory: (để trống)

2. **Lưu lại Backend URL**: `https://your-backend-name.vercel.app`

#### Deploy Frontend:

1. **Tạo Frontend Project trên Vercel**:
   ```bash
   cd frontend
   vercel --prod
   ```
   - Root Directory: `frontend`
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Set Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = Backend URL từ bước trên
   - Các biến khác như đã liệt kê ở trên

### Option 2: Deploy cùng một project (Monorepo)

1. **Deploy từ root**:
   ```bash
   cd /Users/longzim/Documents/ZIMAcademy/hanh-matching
   vercel --prod
   ```

2. **Cấu hình trong Vercel Dashboard**:
   - Root Directory: `.`
   - Framework: Next.js
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/.next`

## 🔍 Post-Deployment Testing

### Frontend Tests:

- [ ] ✅ Truy cập `https://your-frontend-domain.vercel.app`
- [ ] ✅ Kiểm tra Google OAuth login
- [ ] ✅ Kiểm tra redirect sau login
- [ ] ✅ Kiểm tra kết nối với backend API
- [ ] ✅ Kiểm tra upload file
- [ ] ✅ Kiểm tra matching professors
- [ ] ✅ Kiểm tra notifications

### Backend Tests:

- [ ] ✅ Health check: `https://your-backend-domain.vercel.app/api/health`
- [ ] ✅ Test API endpoints
- [ ] ✅ Kiểm tra MongoDB connection
- [ ] ✅ Kiểm tra S3 upload/download
- [ ] ✅ Kiểm tra OpenAI API calls
- [ ] ✅ Kiểm tra CORS headers

## 🐛 Common Issues & Solutions

### Issue 1: Google OAuth không hoạt động

**Symptoms**: Redirect loop hoặc "Invalid redirect URI"

**Solutions**:
1. Kiểm tra `NEXTAUTH_URL` đúng với domain production
2. Thêm redirect URI trong Google Cloud Console
3. Kiểm tra `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`

### Issue 2: Backend API không kết nối được

**Symptoms**: "Network Error" hoặc CORS errors

**Solutions**:
1. Kiểm tra `NEXT_PUBLIC_API_URL` trong frontend env vars
2. Kiểm tra CORS settings trong backend (`CORS_ORIGINS`)
3. Kiểm tra backend URL có đúng không

### Issue 3: MongoDB Connection Failed

**Symptoms**: "SSL handshake failed" hoặc timeout

**Solutions**:
1. Whitelist IP `0.0.0.0/0` trong MongoDB Atlas
2. Kiểm tra connection string format
3. Đảm bảo `retryWrites=true&w=majority` trong URI

### Issue 4: S3 Access Denied

**Symptoms**: "Access Denied" khi upload/download

**Solutions**:
1. Kiểm tra AWS credentials
2. Kiểm tra bucket permissions
3. Kiểm tra IAM user policies

## 📝 Notes

- Vercel Serverless Functions có timeout limit (300s cho Pro plan)
- File upload lớn có thể cần streaming hoặc direct S3 upload
- MongoDB connection pooling cần điều chỉnh cho serverless
- S3 presigned URLs có expiration (mặc định 1 giờ)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [FastAPI on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/python)

