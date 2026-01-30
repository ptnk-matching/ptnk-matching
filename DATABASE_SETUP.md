# Database Setup Guide

## MongoDB Atlas Setup

### 1. Tạo MongoDB Atlas Account
1. Vào https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Tạo free cluster (M0 - Free tier)

### 2. Tạo Database User
1. Vào "Database Access"
2. Click "Add New Database User"
3. Chọn "Password" authentication
4. Set username và password
5. Set privileges: "Atlas admin" hoặc custom
6. Save

### 3. Whitelist IP Address
1. Vào "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) cho development
4. Hoặc thêm IP cụ thể cho production

### 4. Get Connection String
1. Vào "Database" > "Connect"
2. Chọn "Connect your application"
3. Copy connection string
4. Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 5. Setup Environment Variables
Thêm vào `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=hanh_matching
```

## AWS S3 Setup

### 1. Tạo AWS Account
1. Vào https://aws.amazon.com/
2. Sign up/Login
3. Vào S3 Console

### 2. Tạo S3 Bucket
1. Vào S3 Console
2. Click "Create bucket"
3. Bucket name: `hanh-matching-documents` (hoặc tên khác)
4. Region: Chọn gần nhất (ví dụ: `ap-southeast-1` cho Singapore)
5. Block Public Access: Uncheck (hoặc setup bucket policy riêng)
6. Create bucket

### 3. Tạo IAM User
1. Vào IAM Console
2. Users > Add users
3. Username: `hanh-matching-s3-user`
4. Access type: Programmatic access
5. Permissions: Attach policies directly
6. Policy: `AmazonS3FullAccess` (hoặc custom policy chỉ cho bucket cụ thể)
7. Create user
8. **Lưu Access Key ID và Secret Access Key**

### 4. Setup Environment Variables
Thêm vào `backend/.env`:
```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=hanh-matching-documents
```

### 5. Bucket Policy (Optional - for public access)
Nếu muốn files public:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hanh-matching-documents/*"
    }
  ]
}
```

## Database Schema

### Collections

1. **users**
   - `_id`: ObjectId
   - `google_id`: string (unique)
   - `email`: string
   - `name`: string
   - `role`: string ('student' | 'professor')
   - `avatar_url`: string (optional)
   - `uploads`: array of document IDs (students only)
   - `registrations`: array of registration IDs (students only)
   - `created_at`: datetime
   - `updated_at`: datetime

2. **documents**
   - `_id`: ObjectId
   - `user_id`: string (reference to users)
   - `filename`: string
   - `original_filename`: string
   - `file_type`: string
   - `file_size`: int
   - `s3_url`: string
   - `s3_key`: string
   - `extracted_text`: string
   - `created_at`: datetime

3. **registrations**
   - `_id`: ObjectId
   - `student_id`: string (reference to users)
   - `professor_id`: string (reference to users)
   - `document_id`: string (reference to documents)
   - `priority`: int (1 = first choice, 2 = second, etc.)
   - `status`: string ('pending' | 'accepted' | 'rejected')
   - `notes`: string (optional)
   - `created_at`: datetime
   - `updated_at`: datetime

## Indexes

Tạo indexes để tối ưu queries:

```javascript
// In MongoDB shell or Atlas UI
db.users.createIndex({ "google_id": 1 }, { unique: true })
db.users.createIndex({ "email": 1 })
db.documents.createIndex({ "user_id": 1 })
db.documents.createIndex({ "created_at": -1 })
db.registrations.createIndex({ "student_id": 1 })
db.registrations.createIndex({ "professor_id": 1 })
db.registrations.createIndex({ "status": 1 })
```

## Testing

```bash
# Test MongoDB connection
cd backend
python -c "from database.mongodb import MongoDB; db = MongoDB.get_database(); print('MongoDB OK')"

# Test S3 connection
python -c "from services.s3_service import S3Service; s3 = S3Service(); print('S3 OK')"
```

## Production Considerations

1. **Security**:
   - Use environment variables, never commit credentials
   - Use IAM roles instead of access keys when possible
   - Enable S3 bucket encryption
   - Use presigned URLs for file access

2. **Performance**:
   - Add indexes as shown above
   - Use connection pooling
   - Cache frequently accessed data

3. **Cost**:
   - MongoDB Atlas free tier: 512MB storage
   - AWS S3: ~$0.023 per GB storage, ~$0.005 per 1000 requests
   - Monitor usage regularly

