# Quick Start Guide

## Chạy Local Development

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Tạo file .env và thêm OpenAI API key
cp .env.example .env
# Mở .env và thêm: OPENAI_API_KEY=sk-your-key-here

uvicorn main:app --reload --port 8000
```

Backend sẽ chạy tại: http://localhost:8000

**Quan trọng**: Cần có OpenAI API key. Lấy tại: https://platform.openai.com/api-keys

### 2. Frontend (Terminal mới)

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

### 3. Test API

```bash
# Health check
curl http://localhost:8000/api/health

# Get professors
curl http://localhost:8000/api/professors

# Upload and match (cần file test)
curl -X POST http://localhost:8000/api/upload-and-match \
  -F "file=@test_report.pdf" \
  -F "top_k=5"
```

## Deploy lên Vercel

### Bước 1: Chuẩn bị
- Đảm bảo code đã được push lên GitHub/GitLab/Bitbucket
- Có tài khoản Vercel (miễn phí)

### Bước 2: Deploy
1. Vào https://vercel.com
2. Click "New Project"
3. Import repository
4. Vercel tự động detect Next.js
5. Click "Deploy"

### Bước 3: Cấu hình (nếu cần)
- Environment Variables:
  - `NEXT_PUBLIC_API_URL`: Sẽ tự động set
  - `EMBEDDING_MODEL`: (Optional) Model embedding

### Bước 4: Test
Sau khi deploy xong, test các endpoint:
- `https://your-project.vercel.app/api/health`
- `https://your-project.vercel.app/api/professors`

## Troubleshooting

### Backend không start
- Check Python version: `python --version` (cần 3.11+)
- Check dependencies: `pip install -r requirements.txt`
- Check port 8000 có đang được dùng không
- **Check OpenAI API key**: Đảm bảo đã set `OPENAI_API_KEY` trong `.env` file
- Nếu thiếu API key, sẽ có lỗi: "OPENAI_API_KEY environment variable is required"

### Frontend không connect được backend
- Check `NEXT_PUBLIC_API_URL` trong `.env.local`
- Đảm bảo backend đang chạy tại port 8000
- Check CORS settings trong backend

### OpenAI API errors
- Check API key có hợp lệ không
- Check có đủ credits trong OpenAI account không
- Check rate limits (free tier có giới hạn)
- Xem logs để biết lỗi cụ thể

### Vercel deployment fail
- Check `vercel.json` syntax
- Check Python version compatibility
- Check file size limits (model files có thể lớn)
- Xem logs trong Vercel dashboard

## Next Steps

1. **Thêm giảng viên**: Edit `data/professors.json`
2. **Customize UI**: Edit components trong `frontend/components/`
3. **Tune matching**: Adjust model hoặc similarity threshold
4. **Add database**: Migrate từ JSON sang PostgreSQL/MongoDB
5. **Add auth**: Thêm authentication nếu cần

