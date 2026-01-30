# Debug Guide - Đăng ký giảng viên không hiển thị

## Vấn đề
Nút đăng ký không hiển thị hoặc hiển thị "Cần đăng nhập để đăng ký" dù đã đăng nhập.

## Các bước debug

### 1. Kiểm tra Console (F12)
Mở Console và kiểm tra:
- `DEBUG: Sending X-User-Id: ...` - Xem user_id có được gửi không
- `Document ID from upload: ...` - Xem document_id có được trả về không
- `DEBUG: Stored mongoUserId: ...` - Xem MongoDB user ID có được lưu không

### 2. Kiểm tra Backend Logs
Xem terminal chạy backend:
- `DEBUG: Received X-User-Id header: ...` - Backend có nhận được user_id không
- `DEBUG: Created document in MongoDB: ...` - Document có được tạo không
- `ERROR: Failed to save document to database: ...` - Có lỗi gì không

### 3. Kiểm tra MongoDB
```bash
# Kiểm tra collections
# Vào MongoDB Atlas hoặc MongoDB Compass
# Xem có collections: users, documents, registrations không
```

### 4. Kiểm tra localStorage
Mở Console và chạy:
```javascript
console.log('userId:', localStorage.getItem('userId'))
console.log('mongoUserId:', localStorage.getItem('mongoUserId'))
console.log('selectedRole:', localStorage.getItem('selectedRole'))
```

### 5. Kiểm tra API Response
Trong Network tab (F12), xem response của `/api/upload-and-match`:
- Có field `document_id` không?
- Giá trị là gì?

## Giải pháp

### Nếu không có user_id:
1. Đảm bảo đã đăng nhập với Google
2. Kiểm tra `localStorage.getItem('userId')` có giá trị không
3. Kiểm tra API interceptor có gửi header `X-User-Id` không

### Nếu không có document_id:
1. Kiểm tra MongoDB connection string trong `.env`
2. Kiểm tra user_id có được gửi từ frontend không
3. Xem backend logs để biết lỗi cụ thể

### Nếu MongoDB chưa có collections:
- Collections sẽ tự động được tạo khi insert document đầu tiên
- Không cần tạo trước

## Test thủ công

1. **Test user creation:**
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "google_id": "test123",
    "email": "test@test.com",
    "name": "Test User",
    "role": "student"
  }'
```

2. **Test với user_id:**
```bash
curl -X POST http://localhost:8000/api/upload-and-match \
  -H "X-User-Id: YOUR_USER_ID" \
  -F "file=@test.pdf"
```

## Checklist

- [ ] Đã đăng nhập với Google
- [ ] `localStorage` có `userId` hoặc `mongoUserId`
- [ ] Backend nhận được `X-User-Id` header
- [ ] MongoDB connection string đúng
- [ ] Backend trả về `document_id` trong response
- [ ] Frontend nhận được `document_id` và set vào state

