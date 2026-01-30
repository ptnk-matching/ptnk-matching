# Hướng dẫn Setup Git và Deploy lên Vercel

## 🎯 Repository Structure - Monorepo (Recommended)

**Khuyến nghị: Giữ Frontend và Backend trong cùng 1 repository (Monorepo)**

### ✅ Ưu điểm của Monorepo:
- ✅ Dễ quản lý và đồng bộ code
- ✅ Share types/interfaces giữa frontend và backend
- ✅ Deploy cùng lúc, versioning đồng bộ
- ✅ Vercel hỗ trợ tốt monorepo với cấu hình đơn giản
- ✅ Một nơi để quản lý toàn bộ project

### ❌ Nhược điểm:
- Repository lớn hơn (nhưng không đáng kể)
- Cần cấu hình build paths trong Vercel (rất đơn giản)

### 🔄 So sánh với Separate Repos:

**Separate Repos (2 repos riêng)**:
- ❌ Khó đồng bộ version
- ❌ Phải maintain 2 repos
- ❌ Khó share code/types
- ✅ Repo nhỏ hơn (nhưng không quan trọng lắm)

**Kết luận**: Với project này, **Monorepo là lựa chọn tốt nhất**.

## 📁 Cấu trúc Repository hiện tại

```
hanh-matching/
├── frontend/          # Next.js app
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
├── backend/           # FastAPI app
│   ├── routers/
│   ├── services/
│   ├── database/
│   └── requirements.txt
├── api/              # Vercel serverless function
│   └── index.py
├── vercel.json       # Vercel config
├── .gitignore
└── README.md
```

## 🚀 Bước 1: Khởi tạo Git Repository

### 1.1. Tạo repository trên GitHub

1. Vào https://github.com/new
2. Repository name: `hanh-matching` (hoặc tên bạn muốn)
3. Chọn Public hoặc Private
4. **KHÔNG** check "Initialize with README"
5. Click "Create repository"

### 1.2. Khởi tạo Git trong project

```bash
cd /Users/longzim/Documents/ZIMAcademy/hanh-matching

# Khởi tạo git (nếu chưa có)
git init

# Kiểm tra .gitignore đã có chưa
ls -la .gitignore

# Thêm tất cả files (sẽ tự động ignore theo .gitignore)
git add .

# Commit lần đầu
git commit -m "Initial commit: Frontend + Backend monorepo for PTNK Matching System"

# Thêm remote repository (thay YOUR_USERNAME bằng GitHub username của bạn)
git remote add origin https://github.com/YOUR_USERNAME/hanh-matching.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

## 🔧 Bước 2: Deploy lên Vercel (2 Projects riêng biệt)

### 2.1. Deploy Backend trước

1. **Tạo Backend Project trên Vercel**:
   - Vào https://vercel.com/new
   - Click "Import Git Repository"
   - Chọn repository `hanh-matching` của bạn
   - **Configure Project**:
     - **Project Name**: `hanh-matching-backend` (hoặc tên bạn muốn)
     - **Root Directory**: `.` (root của repo)
     - **Framework Preset**: Other
     - **Build Command**: (để trống)
     - **Output Directory**: (để trống)
     - **Install Command**: (để trống - Vercel sẽ tự install)

2. **Environment Variables** (Backend):
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_EMBEDDING_MODEL=text-embedding-3-small
   OPENAI_CHAT_MODEL=gpt-4o-mini
   MONGODB_URI=mongodb+srv://...
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=...
   CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```

3. **Deploy** và lưu lại Backend URL: `https://hanh-matching-backend.vercel.app`

### 2.2. Deploy Frontend

1. **Tạo Frontend Project trên Vercel**:
   - Vào https://vercel.com/new
   - Click "Import Git Repository"
   - Chọn **cùng repository** `hanh-matching`
   - **Configure Project**:
     - **Project Name**: `hanh-matching-frontend` (hoặc tên bạn muốn)
     - **Root Directory**: `frontend` ⚠️ **QUAN TRỌNG**
     - **Framework Preset**: Next.js (auto-detect)
     - **Build Command**: `npm run build` (auto-detect)
     - **Output Directory**: `.next` (auto-detect)
     - **Install Command**: `npm install` (auto-detect)

2. **Environment Variables** (Frontend):
   ```
   NEXT_PUBLIC_API_URL=https://hanh-matching-backend.vercel.app
   NEXTAUTH_URL=https://hanh-matching-frontend.vercel.app
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

3. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy** và lưu lại Frontend URL

### 2.3. Cập nhật Backend CORS

Sau khi có Frontend URL, cập nhật lại `CORS_ORIGINS` trong Backend:
```
CORS_ORIGINS=https://hanh-matching-frontend.vercel.app
```

## 🔐 Bước 3: Cấu hình Google OAuth

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. APIs & Services → Credentials
4. Chọn OAuth 2.0 Client ID
5. Thêm **Authorized redirect URIs**:
   ```
   https://hanh-matching-frontend.vercel.app/api/auth/callback/google
   ```
6. Lưu lại `Client ID` và `Client Secret`

## 📝 Bước 4: Workflow Development

### Daily workflow:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Tạo branch mới cho feature
git checkout -b feature/your-feature-name

# 3. Make changes và commit
git add .
git commit -m "Add feature: description"

# 4. Push branch
git push origin feature/your-feature-name

# 5. Tạo Pull Request trên GitHub
# 6. Sau khi merge vào main, Vercel sẽ auto-deploy
```

## 🔄 Auto-Deploy với Vercel

1. **Connect GitHub với Vercel**:
   - Vercel Dashboard → Settings → Git
   - Connect GitHub account (nếu chưa connect)
   - Chọn repository `hanh-matching`

2. **Auto-deploy settings** (mặc định):
   - ✅ Mỗi push lên `main` branch → Auto deploy production
   - ✅ Mỗi push lên branch khác → Auto deploy preview

## 📋 Checklist trước khi Push lần đầu

- [x] `.gitignore` đã được tạo và đầy đủ
- [ ] Không có file `.env` trong git (kiểm tra: `git status`)
- [ ] Không có `node_modules/` trong git
- [ ] Không có `__pycache__/` trong git
- [ ] Đã test local trước khi push
- [ ] Đã chuẩn bị Environment Variables cho Vercel

## 🆘 Troubleshooting

### Lỗi: "Repository not found"
- Kiểm tra GitHub repository URL đúng chưa
- Kiểm tra quyền truy cập GitHub account
- Thử SSH thay vì HTTPS: `git@github.com:USERNAME/hanh-matching.git`

### Lỗi: "Build failed" trên Vercel
- Kiểm tra **Root Directory** đúng chưa:
  - Backend: `.` (root)
  - Frontend: `frontend`
- Kiểm tra Build Command và Output Directory
- Xem logs chi tiết trong Vercel Dashboard → Deployments

### Lỗi: "Environment variables missing"
- Kiểm tra đã set env vars trong Vercel Dashboard → Settings → Environment Variables
- Đảm bảo tên biến đúng (case-sensitive)
- Đảm bảo đã chọn đúng Environment (Production, Preview, Development)

### Lỗi: "Module not found" trong Backend
- Kiểm tra `requirements.txt` có đầy đủ dependencies
- Vercel sẽ tự động install từ `requirements.txt`

## 📚 Tài liệu tham khảo

- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Git Best Practices](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## 🎯 Quick Start Commands

```bash
# Khởi tạo Git
cd /Users/longzim/Documents/ZIMAcademy/hanh-matching
git init
git add .
git commit -m "Initial commit"

# Thêm remote (thay YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/hanh-matching.git
git branch -M main
git push -u origin main

# Sau đó vào Vercel và import repository 2 lần:
# 1. Backend project với Root Directory = "."
# 2. Frontend project với Root Directory = "frontend"
```
