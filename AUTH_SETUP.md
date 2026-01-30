# Hướng dẫn Setup Google OAuth Authentication

## Bước 1: Tạo Google OAuth Credentials

1. **Truy cập Google Cloud Console:**
   - Vào: https://console.cloud.google.com/
   - Tạo project mới hoặc chọn project hiện có

2. **Enable Google+ API:**
   - Vào "APIs & Services" > "Library"
   - Tìm "Google+ API" và enable

3. **Tạo OAuth 2.0 Credentials:**
   - Vào "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Nếu chưa có OAuth consent screen, setup trước:
     - Application name: "Hạnh Matching"
     - User support email: email của bạn
     - Developer contact: email của bạn
     - Save and continue
   - Application type: "Web application"
   - Name: "Hạnh Matching Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (cho development)
     - `https://your-domain.vercel.app` (cho production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (cho development)
     - `https://your-domain.vercel.app/api/auth/callback/google` (cho production)
   - Click "Create"
   - Copy **Client ID** và **Client Secret**

## Bước 2: Setup Local Environment

1. **Tạo file `.env.local` trong `frontend/`:**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. **Cập nhật `.env.local`:**
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_here
   ```

3. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy kết quả vào `NEXTAUTH_SECRET`

## Bước 3: Install Dependencies

```bash
cd frontend
npm install
```

## Bước 4: Test Local

1. **Start frontend:**
   ```bash
   npm run dev
   ```

2. **Test đăng nhập:**
   - Mở http://localhost:3000
   - Click "Đăng nhập với Google"
   - Chọn Google account
   - Xác nhận permissions
   - Sẽ redirect về trang chủ và hiển thị thông tin user

## Bước 5: Deploy lên Vercel

1. **Push code lên GitHub**

2. **Trong Vercel Dashboard:**
   - Vào project settings
   - Vào "Environment Variables"
   - Thêm các biến sau:
     - `GOOGLE_CLIENT_ID`: Client ID từ Google Cloud Console
     - `GOOGLE_CLIENT_SECRET`: Client Secret từ Google Cloud Console
     - `NEXTAUTH_URL`: URL của Vercel deployment (ví dụ: `https://hanh-matching.vercel.app`)
     - `NEXTAUTH_SECRET`: Random secret (dùng cùng secret như local hoặc generate mới)

3. **Update Google OAuth Credentials:**
   - Vào Google Cloud Console
   - Vào OAuth 2.0 Client ID đã tạo
   - Thêm vào "Authorized JavaScript origins":
     - `https://your-domain.vercel.app`
   - Thêm vào "Authorized redirect URIs":
     - `https://your-domain.vercel.app/api/auth/callback/google`
   - Save

4. **Redeploy trên Vercel:**
   - Vercel sẽ tự động redeploy khi có thay đổi
   - Hoặc manual trigger trong dashboard

## Troubleshooting

### Lỗi "Configuration"
- Kiểm tra `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` có đúng không
- Kiểm tra `NEXTAUTH_URL` có match với domain không
- Kiểm tra redirect URI có đúng trong Google Console không

### Lỗi "AccessDenied"
- User đã hủy đăng nhập
- Hoặc OAuth consent screen chưa được approve (nếu app ở chế độ testing)

### Redirect URI mismatch
- Đảm bảo redirect URI trong Google Console match chính xác với `NEXTAUTH_URL/api/auth/callback/google`
- Không có trailing slash
- Protocol phải đúng (http vs https)

### Session không persist
- Kiểm tra `NEXTAUTH_SECRET` có được set không
- Trên Vercel, đảm bảo secret được set trong environment variables

## Security Notes

1. **Never commit `.env.local`** - đã có trong `.gitignore`
2. **Use different secrets** cho development và production (hoặc cùng secret cũng được)
3. **Restrict OAuth consent screen** nếu chỉ muốn specific users
4. **Regularly rotate secrets** trong production

## Features

- ✅ Google OAuth login
- ✅ Session management
- ✅ Protected routes (upload chỉ khi đã login)
- ✅ User profile display
- ✅ Logout functionality
- ✅ Auto redirect after login
- ✅ Error handling

