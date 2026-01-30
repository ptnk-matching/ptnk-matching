# Environment Variables cho Vercel Deployment

## Frontend Environment Variables (Bắt buộc)

Thêm các biến sau trong **Vercel Dashboard → Settings → Environment Variables**:

### 1. Google OAuth (Bắt buộc cho authentication)
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Cách lấy:**
- Vào https://console.cloud.google.com/
- Tạo OAuth 2.0 Client ID
- Copy Client ID và Client Secret

### 2. NextAuth Configuration (Bắt buộc)
```
NEXTAUTH_SECRET=your_random_secret_32_chars_minimum
NEXTAUTH_URL=https://your-domain.vercel.app
```

**Cách generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Lưu ý:** `NEXTAUTH_URL` phải là URL production của bạn (ví dụ: `https://ptnk-matching-ten.vercel.app`)

### 3. Backend API URL (Nếu backend deploy riêng)
```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

**Nếu backend deploy trên Vercel cùng project:**
- Không cần set, sẽ tự động sử dụng `/api/*` routes
- Hoặc set thành: `https://your-domain.vercel.app/api`

---

## Backend Environment Variables (Nếu deploy backend trên Vercel)

### 1. OpenAI API (Bắt buộc)
```
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Optional, default: text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini  # Optional, default: gpt-4o-mini
```

### 2. MongoDB (Bắt buộc nếu dùng database)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_DB_NAME=hanh_matching  # Optional, default: hanh_matching
```

### 3. AWS S3 (Bắt buộc nếu dùng file upload)
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1  # Optional, default: us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 4. CORS Configuration (Optional)
```
CORS_ORIGINS=https://your-domain.vercel.app,https://another-domain.com
```
Mặc định: `*` (allow all origins)

### 5. NextAuth Secret (Để verify token từ frontend)
```
NEXTAUTH_SECRET=same_secret_as_frontend
```
Phải giống với `NEXTAUTH_SECRET` ở frontend.

---

## Cách thêm Environment Variables trong Vercel

1. Vào **Vercel Dashboard** → Chọn project của bạn
2. Vào **Settings** → **Environment Variables**
3. Click **Add New**
4. Nhập **Name** và **Value**
5. Chọn **Environment** (Production, Preview, Development)
6. Click **Save**

---

## Checklist

### Frontend (Minimum để app chạy được)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL`

### Frontend (Nếu backend deploy riêng)
- [ ] `NEXT_PUBLIC_API_URL`

### Backend (Nếu deploy backend trên Vercel)
- [ ] `OPENAI_API_KEY`
- [ ] `MONGODB_URI` (nếu dùng database)
- [ ] `AWS_ACCESS_KEY_ID` (nếu dùng S3)
- [ ] `AWS_SECRET_ACCESS_KEY` (nếu dùng S3)
- [ ] `AWS_S3_BUCKET_NAME` (nếu dùng S3)
- [ ] `NEXTAUTH_SECRET` (phải giống frontend)

---

## Lưu ý quan trọng

1. **NEXTAUTH_URL**: Phải là URL chính xác của production site (không có trailing slash)
2. **NEXTAUTH_SECRET**: Phải giống nhau giữa frontend và backend (nếu deploy riêng)
3. **Google OAuth Redirect URI**: Phải thêm trong Google Cloud Console:
   - `https://your-domain.vercel.app/api/auth/callback/google`
4. **Environment Variables**: Sau khi thêm, cần **redeploy** để áp dụng thay đổi

---

## Test sau khi setup

1. Kiểm tra auth config:
   ```bash
   curl https://your-domain.vercel.app/api/auth/config
   ```
   Kết quả mong đợi: `{"configured": true, ...}`

2. Kiểm tra frontend:
   - Truy cập `https://your-domain.vercel.app`
   - Click "Đăng nhập" → Phải redirect đến Google OAuth

3. Kiểm tra backend (nếu deploy):
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

