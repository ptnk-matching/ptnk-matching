# Hướng dẫn Deploy lên Vercel

## Chuẩn bị

1. **Cài đặt Vercel CLI** (nếu chưa có):
```bash
npm i -g vercel
```

2. **Đăng nhập Vercel**:
```bash
vercel login
```

## Deploy Frontend và Backend

### Option 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. **Push code lên GitHub/GitLab/Bitbucket**

2. **Kết nối repository với Vercel**:
   - Vào [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import repository của bạn
   - Vercel sẽ tự động detect Next.js project

3. **Cấu hình Environment Variables**:
   - Trong Vercel Dashboard, vào Settings > Environment Variables
   - Thêm các biến sau:
     - `OPENAI_API_KEY`: **Bắt buộc** - API key từ OpenAI (lấy tại https://platform.openai.com/api-keys)
     - `OPENAI_EMBEDDING_MODEL`: (Optional) Model embedding, mặc định: `text-embedding-3-small`
     - `NEXT_PUBLIC_API_URL`: URL của API (sẽ tự động set khi deploy)

4. **Deploy**:
   - Vercel sẽ tự động build và deploy
   - Frontend sẽ được deploy tại domain của Vercel
   - Backend API sẽ chạy như serverless functions tại `/api/*`

### Option 2: Deploy qua CLI

```bash
# Từ thư mục root của project
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (chọn account của bạn)
# - Link to existing project? No
# - Project name? hanh-matching
# - Directory? ./
# - Override settings? No
```

## Cấu trúc Deployment

- **Frontend**: Deploy như Next.js app thông thường
- **Backend**: Chạy như Python serverless functions trong `/api/`
- **Static files**: `data/professors.json` được include trong build

## Lưu ý quan trọng

### 1. OpenAI API
- Sử dụng OpenAI Embeddings API (`text-embedding-3-small`)
- Cần có OpenAI API key hợp lệ
- Chi phí: ~$0.02 per 1M tokens (rất rẻ)
- Không cần download model, gọi API trực tiếp
- Latency: ~100-500ms per request (tùy vào số lượng texts)

### 2. File Upload Limits
- Vercel serverless functions có giới hạn:
  - Request body: 4.5MB (Hobby plan) hoặc 50MB (Pro plan)
  - Function timeout: 10s (Hobby) hoặc 60s (Pro)
- Nếu cần xử lý file lớn, cân nhắc:
  - Upload lên S3/Cloud Storage trước
  - Hoặc sử dụng Vercel Pro plan

### 3. Database
- Hiện tại sử dụng JSON file (`data/professors.json`)
- Để scale, nên migrate sang:
  - PostgreSQL (Vercel Postgres)
  - MongoDB Atlas
  - Supabase
  - Hoặc database service khác

## Testing sau khi Deploy

1. **Health check**:
```bash
curl https://your-domain.vercel.app/api/health
```

2. **Test upload và matching**:
```bash
curl -X POST https://your-domain.vercel.app/api/upload-and-match \
  -F "file=@test_report.pdf" \
  -F "top_k=5"
```

## Troubleshooting

### Lỗi "Module not found"
- Đảm bảo `requirements.txt` có đầy đủ dependencies
- Check Python version (nên dùng 3.11)

### Lỗi timeout
- Tăng `maxDuration` trong `vercel.json`
- Hoặc optimize model loading

### Lỗi CORS
- Backend đã có CORS middleware
- Nếu vẫn lỗi, check `NEXT_PUBLIC_API_URL` environment variable

## Alternative: Deploy Backend riêng

Nếu backend quá phức tạp cho serverless, có thể deploy riêng:

1. **Deploy backend lên**:
   - Railway
   - Render
   - Fly.io
   - Hoặc VPS

2. **Update `NEXT_PUBLIC_API_URL`** trong Vercel environment variables

3. **Frontend vẫn deploy trên Vercel**

