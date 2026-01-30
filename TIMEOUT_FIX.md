# Fix Timeout Issues

## Vấn đề
Khi upload file lớn hoặc xử lý AI matching phức tạp, request có thể timeout sau 60 giây.

## Giải pháp đã áp dụng

### 1. Frontend (Client-side)
- **Tăng timeout**: Từ 60s → 300s (5 phút)
- **Thêm progress bar**: Hiển thị tiến trình upload
- **Error handling**: Hiển thị thông báo rõ ràng khi timeout

### 2. Backend
- **Uvicorn timeout**: Mặc định không giới hạn, nhưng có thể set trong config
- **FastAPI**: Không có timeout mặc định, nhưng reverse proxy (nginx, etc.) có thể có

## Cách chạy với timeout tăng

### Development
```bash
cd backend
uvicorn main:app --reload --timeout-keep-alive 300
```

### Production (Vercel)
Vercel serverless functions có timeout:
- Hobby: 10s
- Pro: 60s
- Enterprise: 300s

Nếu cần xử lý lâu hơn, nên:
1. Chia nhỏ process: Upload → Process → Match (3 endpoints riêng)
2. Dùng background jobs (Celery, etc.)
3. Upgrade Vercel plan

## Tối ưu hóa

### 1. Chia nhỏ process
Thay vì 1 endpoint `/api/upload-and-match`, chia thành:
- `/api/upload` - Upload file, trả về document_id
- `/api/match/{document_id}` - Match professors (có thể gọi sau)

### 2. Async processing
- Upload file → Lưu vào S3
- Return document_id ngay
- Process matching trong background
- Client poll hoặc dùng WebSocket để nhận kết quả

### 3. File size limits
- Giới hạn file size: 10MB cho PDF, 5MB cho DOCX
- Validate trước khi upload

## Test timeout

```bash
# Test với file lớn
curl -X POST http://localhost:8000/api/upload-and-match \
  -F "file=@large_file.pdf" \
  --max-time 300
```

## Monitoring

Theo dõi:
- Request duration trong logs
- File sizes
- Matching time
- S3 upload time

