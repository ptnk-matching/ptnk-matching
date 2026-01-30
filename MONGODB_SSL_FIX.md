# Fix MongoDB SSL Handshake Error

## Lỗi
```
SSL handshake failed: [SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
```

## Nguyên nhân
1. **Connection string không đúng format**
2. **SSL/TLS configuration không đúng**
3. **IP address chưa được whitelist trong MongoDB Atlas**
4. **Network/firewall blocking connection**

## Giải pháp

### 1. Kiểm tra Connection String
Connection string phải có format:
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**Lưu ý:**
- Phải có `mongodb+srv://` (không phải `mongodb://`)
- Password không được có ký tự đặc biệt (nếu có, phải URL encode)
- Phải có `?retryWrites=true&w=majority` ở cuối

### 2. Whitelist IP Address
1. Vào MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Click "Allow Access from Anywhere" (0.0.0.0/0) cho development
4. Hoặc thêm IP cụ thể của bạn

### 3. Kiểm tra User Password
- Password không được có ký tự đặc biệt như `@`, `#`, `%`
- Nếu có, phải URL encode:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`

### 4. Test Connection
```bash
cd backend
python3.11 -c "
import os
from dotenv import load_dotenv
load_dotenv()
from database.mongodb import MongoDB
import asyncio

async def test():
    try:
        db = MongoDB.get_database()
        result = await db.command('ping')
        print('✅ MongoDB connection successful!')
    except Exception as e:
        print(f'❌ Error: {e}')

asyncio.run(test())
"
```

### 5. Alternative: Use mongodb:// instead of mongodb+srv://
Nếu `mongodb+srv://` không work, thử `mongodb://`:
```
mongodb://username:password@ac-xaxaijv-shard-00-00.cgb5bfm.mongodb.net:27017,ac-xaxaijv-shard-00-01.cgb5bfm.mongodb.net:27017,ac-xaxaijv-shard-00-02.cgb5bfm.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### 6. Update .env file
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=hanh_matching
```

## Common Issues

### Issue 1: Password có ký tự đặc biệt
**Solution:** URL encode password hoặc đổi password không có ký tự đặc biệt

### Issue 2: IP chưa whitelist
**Solution:** Vào MongoDB Atlas → Network Access → Add IP Address

### Issue 3: Connection string sai
**Solution:** Copy connection string từ MongoDB Atlas → Connect → Connect your application

### Issue 4: SSL/TLS version không tương thích
**Solution:** Code đã được update để handle SSL properly

## Debug Steps

1. **Check connection string format:**
   ```bash
   echo $MONGODB_URI
   ```

2. **Test với mongosh (MongoDB Shell):**
   ```bash
   mongosh "your-connection-string"
   ```

3. **Check network:**
   - Ping MongoDB cluster
   - Check firewall settings

4. **Check MongoDB Atlas:**
   - User có đúng permissions không?
   - Database user có tồn tại không?

## Nếu vẫn không work

1. Tạo MongoDB user mới với password đơn giản (không có ký tự đặc biệt)
2. Whitelist IP: 0.0.0.0/0 (cho development)
3. Copy connection string mới từ Atlas
4. Update .env file
5. Restart backend

