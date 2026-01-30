# Giải thích S3 Bucket và Object Key

## S3 Bucket là gì?

**S3 Bucket** = Container chứa tất cả files của bạn trên AWS S3
- Giống như một folder lớn trên cloud
- Ví dụ: `aws-glue-zim-datalake`

## S3 Object Key là gì?

**S3 Key** = Đường dẫn/địa chỉ của file trong bucket
- Giống như đường dẫn file: `folder/subfolder/filename.pdf`
- Dùng để identify và access file cụ thể

## Format Key hiện tại trong code

Trong file `backend/services/s3_service.py`, key được tạo theo format:

```python
s3_key = f"test/{user_id}/{timestamp}_{unique_id}_{filename}"
```

### Ví dụ cụ thể:

**Input:**
- `user_id`: `"507f1f77bcf86cd799439011"`
- `filename`: `"baocao_lop11.pdf"`
- `timestamp`: `"20241215_143022"`
- `unique_id`: `"a1b2c3d4"` (8 ký tự đầu của UUID)

**Output S3 Key:**
```
test/507f1f77bcf86cd799439011/20241215_143022_a1b2c3d4_baocao_lop11.pdf
```

### Cấu trúc:

```
test/                         ← Folder gốc
  └── {user_id}/              ← Folder riêng cho mỗi user
      └── {timestamp}_{unique_id}_{filename}  ← File cụ thể
```

## S3 URL

Sau khi upload, URL được tạo:

```
https://{bucket_name}.s3.{region}.amazonaws.com/{s3_key}
```

**Ví dụ:**
```
https://aws-glue-zim-datalake.s3.ap-southeast-1.amazonaws.com/test/507f1f77bcf86cd799439011/20241215_143022_a1b2c3d4_baocao_lop11.pdf
```

## Lợi ích của format này

1. **Tổ chức theo user**: Mỗi user có folder riêng
2. **Unique**: Timestamp + UUID đảm bảo không trùng tên
3. **Dễ tìm**: Có thể search theo user_id hoặc timestamp
4. **Giữ nguyên tên file**: `{filename}` giúp dễ nhận biết

## Trong MongoDB

S3 Key được lưu trong collection `documents`:

```json
{
  "_id": "...",
  "user_id": "507f1f77bcf86cd799439011",
  "filename": "baocao_lop11.pdf",
  "s3_url": "https://hanh-matching-documents.s3.../documents/.../baocao_lop11.pdf",
  "s3_key": "documents/507f1f77bcf86cd799439011/20241215_143022_a1b2c3d4_baocao_lop11.pdf",
  ...
}
```

## Thay đổi format key (nếu cần)

Nếu muốn thay đổi format, sửa dòng 55 trong `s3_service.py`:

```python
# Format hiện tại
s3_key = f"test/{user_id}/{timestamp}_{unique_id}_{filename}"

# Ví dụ format khác:
# 1. Theo năm/tháng
s3_key = f"test/{year}/{month}/{user_id}/{filename}"

# 2. Theo loại file
s3_key = f"test/{file_type}/{user_id}/{filename}"

# 3. Đơn giản hơn
s3_key = f"test/{user_id}/{filename}"
```

## Xem files trong S3 Console

1. Vào AWS Console → S3
2. Chọn bucket `aws-glue-zim-datalake`
3. Navigate: `test/` → `{user_id}/` → `{file}`
4. Click vào file để xem/download

