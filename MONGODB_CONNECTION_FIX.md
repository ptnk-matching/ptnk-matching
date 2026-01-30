# Fix MongoDB Connection - SSL Handshake Error

## Vấn đề hiện tại
```
SSL handshake failed: [SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
```

## Giải pháp nhanh

### 1. Sửa MongoDB URI trong `.env`

**Hiện tại:**
```env
MONGODB_URI=mongodb+srv://lyphilong7969_db_user:HYmTXcfXtnN0oyLJ@test.cgb5bfm.mongodb.net/?appName=test
```

**Sửa thành:**
```env
MONGODB_URI=mongodb+srv://lyphilong7969_db_user:HYmTXcfXtnN0oyLJ@test.cgb5bfm.mongodb.net/?retryWrites=true&w=majority
```

### 2. Whitelist IP trong MongoDB Atlas

1. Vào https://cloud.mongodb.com/
2. Chọn cluster của bạn
3. Vào **Network Access** (bên trái)
4. Click **Add IP Address**
5. Click **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Confirm**
7. Đợi vài phút để apply

### 3. Kiểm tra Database User

1. Vào **Database Access** (bên trái)
2. Kiểm tra user `lyphilong7969_db_user` có tồn tại không
3. Nếu không, tạo user mới:
   - Username: `lyphilong7969_db_user`
   - Password: `HYmTXcfXtnN0oyLJ`
   - Privileges: **Atlas admin** hoặc **Read and write to any database**

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
        
        # Test insert
        test_collection = db.test_collection
        result = await test_collection.insert_one({'test': 'connection'})
        print(f'✅ Test insert successful: {result.inserted_id}')
        
        # Clean up
        await test_collection.delete_one({'_id': result.inserted_id})
        print('✅ Test completed successfully!')
    except Exception as e:
        print(f'❌ Error: {e}')

asyncio.run(test())
"
```

## Nếu vẫn không work

### Option 1: Tạo MongoDB User mới
1. Vào MongoDB Atlas → Database Access
2. Add New Database User
3. Username: `hanh_matching_user`
4. Password: Tạo password đơn giản (không có ký tự đặc biệt)
5. Privileges: Atlas admin
6. Copy connection string mới
7. Update `.env`

### Option 2: Kiểm tra Password
Password `HYmTXcfXtnN0oyLJ` có thể có vấn đề. Thử:
- Tạo password mới không có ký tự đặc biệt
- Hoặc URL encode password nếu có ký tự đặc biệt

### Option 3: Dùng mongodb:// thay vì mongodb+srv://
Nếu `mongodb+srv://` không work, thử `mongodb://`:
```
mongodb://lyphilong7969_db_user:HYmTXcfXtnN0oyLJ@ac-xaxaijv-shard-00-00.cgb5bfm.mongodb.net:27017,ac-xaxaijv-shard-00-01.cgb5bfm.mongodb.net:27017,ac-xaxaijv-shard-00-02.cgb5bfm.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Temporary Workaround

Code đã được update để:
- Sử dụng Google ID làm fallback nếu MongoDB không available
- Vẫn hoạt động được (nhưng không lưu vào database)
- Log errors để debug

Hệ thống sẽ vẫn chạy được nhưng:
- Users không được lưu vào MongoDB
- Documents không được lưu vào MongoDB
- Registrations không được lưu vào MongoDB

Nhưng matching vẫn hoạt động bình thường!

