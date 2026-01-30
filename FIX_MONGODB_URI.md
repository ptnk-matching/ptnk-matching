# Fix MongoDB URI trong .env

## Vấn đề hiện tại

Connection string của bạn:
```
MONGODB_URI=mongodb+srv://lyphilong7969_db_user:HYmTXcfXtnN0oyLJ@test.cgb5bfm.mongodb.net/?appName=test
```

**Thiếu các tham số quan trọng:** `retryWrites=true&w=majority`

## Giải pháp

### Sửa trong file `backend/.env`:

**Trước:**
```env
MONGODB_URI=mongodb+srv://lyphilong7969_db_user:HYmTXcfXtnN0oyLJ@test.cgb5bfm.mongodb.net/?appName=test
```

**Sau (sửa thành):**
```env
MONGODB_URI=mongodb+srv://lyphilong7969_db_user:HYmTXcfXtnN0oyLJ@test.cgb5bfm.mongodb.net/?retryWrites=true&w=majority
```

Hoặc nếu muốn giữ `appName`:
```env
MONGODB_URI=mongodb+srv://lyphilong7969_db_user:HYmTXcfXtnN0oyLJ@test.cgb5bfm.mongodb.net/?retryWrites=true&w=majority&appName=test
```

## Giải thích

- `retryWrites=true`: Cho phép retry khi write operations fail
- `w=majority`: Đảm bảo write được commit vào majority của replica set
- Đây là các tham số chuẩn cho MongoDB Atlas

## Các bước

1. Mở file `backend/.env`
2. Tìm dòng `MONGODB_URI=`
3. Thay `?appName=test` thành `?retryWrites=true&w=majority`
4. Hoặc thêm vào: `?retryWrites=true&w=majority&appName=test`
5. Save file
6. Restart backend server

## Test connection

Sau khi sửa, test lại:
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

## Lưu ý

- Đảm bảo IP của bạn đã được whitelist trong MongoDB Atlas
- Password không có ký tự đặc biệt (nếu có phải URL encode)
- Connection string phải có format đúng: `mongodb+srv://username:password@cluster.net/?retryWrites=true&w=majority`

