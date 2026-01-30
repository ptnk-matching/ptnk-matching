# Hướng dẫn Whitelist IP trong MongoDB Atlas

## ⚠️ Vấn đề hiện tại

Bạn đang thấy warning banner trong MongoDB Atlas:
> **"Current IP Address not added. You will not be able to connect to databases from this address."**

Đây chính là nguyên nhân gây lỗi SSL handshake!

## ✅ Giải pháp nhanh nhất

### Cách 1: Click vào button trong warning banner (Dễ nhất!)

1. Trong MongoDB Atlas dashboard, bạn sẽ thấy **yellow warning banner** ở trên cùng
2. Click vào button **"Add Current IP Address"** 
3. Đợi vài giây để MongoDB Atlas tự động thêm IP của bạn
4. Restart backend server

### Cách 2: Thêm IP thủ công

1. Vào **Network Access** (bên trái sidebar, dưới SECURITY)
2. Click **"Add IP Address"** button (màu xanh)
3. Chọn một trong hai options:
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - Cho development
   - **"Add Current IP Address"** - Chỉ cho IP hiện tại
4. Click **"Confirm"**
5. Đợi 1-2 phút để apply
6. Restart backend server

## 🧪 Test sau khi whitelist

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
        print('✅ IP address is whitelisted!')
    except Exception as e:
        print(f'❌ Error: {e}')
        print('IP may not be whitelisted yet. Wait 1-2 minutes and try again.')

asyncio.run(test())
"
```

## 📝 Lưu ý

- **Development**: Nên dùng "Allow Access from Anywhere" (0.0.0.0/0) để dễ test
- **Production**: Nên whitelist IP cụ thể để bảo mật hơn
- Sau khi whitelist, đợi 1-2 phút để MongoDB apply changes
- Nếu vẫn lỗi sau khi whitelist, kiểm tra lại connection string trong `.env`

## 🔍 Kiểm tra IP đã được whitelist chưa

1. Vào **Network Access**
2. Xem danh sách IP addresses
3. Nếu thấy IP của bạn hoặc 0.0.0.0/0 → Đã whitelist ✅
4. Nếu không thấy → Chưa whitelist ❌

## 🚀 Sau khi whitelist thành công

Backend sẽ có thể:
- ✅ Lưu users vào MongoDB
- ✅ Lưu documents vào MongoDB  
- ✅ Lưu registrations vào MongoDB
- ✅ Nút đăng ký sẽ hoạt động bình thường

