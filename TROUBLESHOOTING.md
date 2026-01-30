# Troubleshooting Guide

## Lỗi "Network Error"

### Nguyên nhân thường gặp:

1. **Backend không chạy**
   - Kiểm tra: `curl http://localhost:8000/health`
   - Nếu không có response, chạy backend:
     ```bash
     cd backend
     source venv/bin/activate  # hoặc venv\Scripts\activate trên Windows
     uvicorn main:app --reload
     ```

2. **Thiếu OPENAI_API_KEY**
   - Tạo file `backend/.env`:
     ```bash
     OPENAI_API_KEY=sk-your-key-here
     ```
   - Restart backend sau khi thêm key

3. **CORS Issues**
   - Backend đã config CORS allow all origins
   - Nếu vẫn lỗi, kiểm tra browser console

4. **Port conflict**
   - Backend mặc định chạy tại port 8000
   - Frontend mặc định connect đến `http://localhost:8000`
   - Nếu đổi port, update `NEXT_PUBLIC_API_URL` trong frontend

### Cách kiểm tra:

1. **Test backend trực tiếp:**
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Test upload (cần file test)
   curl -X POST http://localhost:8000/api/upload-and-match \
     -F "file=@test.pdf" \
     -F "top_k=5"
   ```

2. **Kiểm tra browser console:**
   - Mở DevTools (F12)
   - Xem tab Console và Network
   - Tìm request failed và xem error message

3. **Kiểm tra environment variables:**
   ```bash
   # Backend
   cd backend
   cat .env  # Kiểm tra OPENAI_API_KEY
   
   # Frontend
   cd frontend
   cat .env.local  # Kiểm tra NEXT_PUBLIC_API_URL (nếu có)
   ```

## Lỗi "OPENAI_API_KEY is required"

- Tạo file `backend/.env` với nội dung:
  ```
  OPENAI_API_KEY=sk-your-key-here
  OPENAI_EMBEDDING_MODEL=text-embedding-3-small
  OPENAI_CHAT_MODEL=gpt-4o-mini
  ```
- Restart backend

## Lỗi khi upload file

1. **File quá lớn:**
   - Giới hạn: 10MB
   - Nén file hoặc chia nhỏ

2. **File type không hỗ trợ:**
   - Hỗ trợ: PDF, DOCX, DOC, TXT
   - Convert file sang format hỗ trợ

3. **File bị corrupt:**
   - Thử file khác
   - Kiểm tra file có mở được không

## Performance Issues

1. **Matching chậm:**
   - Lần đầu sẽ mất thời gian để load embeddings
   - Có thể mất 10-30 giây cho request đầu tiên
   - Các request sau sẽ nhanh hơn

2. **Analysis generation chậm:**
   - GPT-4o-mini có thể mất 5-10 giây để generate analysis
   - Có thể tắt analysis bằng cách set `include_analysis=false`

## Debug Mode

Thêm vào `frontend/.env.local`:
```
NEXT_PUBLIC_DEBUG=true
```

Sẽ log chi tiết các API requests trong console.

