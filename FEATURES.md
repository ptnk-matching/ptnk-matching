# Tính năng Phân tích AI

## Tổng quan

Hệ thống hiện tại đã được nâng cấp với tính năng **phân tích AI** để giải thích tại sao mỗi giảng viên phù hợp với bài báo cáo của học sinh.

## Cách hoạt động

1. **Matching**: Sử dụng OpenAI Embeddings để tìm top-k giảng viên phù hợp nhất
2. **Analysis**: Sử dụng GPT-4o-mini để generate phân tích chi tiết cho mỗi giảng viên
3. **Display**: Hiển thị phân tích trong UI với design đẹp mắt

## API Endpoints

### POST `/api/match`
```json
{
  "text": "Nội dung bài báo cáo...",
  "top_k": 5,
  "include_analysis": true  // Optional, default: true
}
```

Response:
```json
{
  "matches": [
    {
      "id": "prof_1",
      "name": "TS. Nguyễn Văn A",
      "match_percentage": 85.5,
      "analysis": "Giảng viên này phù hợp vì...",  // Phân tích AI
      ...
    }
  ]
}
```

### POST `/api/upload-and-match`
Query parameters:
- `top_k`: Số lượng giảng viên (default: 5)
- `include_analysis`: Có generate phân tích không (default: true)

## Frontend

Phân tích được hiển thị trong một card đặc biệt với:
- Icon lightbulb
- Background màu xanh nhạt
- Border màu xanh
- Text dễ đọc

## Chi phí

- **Embeddings**: ~$0.02 per 1M tokens
- **Analysis (GPT-4o-mini)**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Ước tính**: ~$0.001-0.002 per matching request với analysis

## Tùy chỉnh

### Thay đổi model phân tích
Set environment variable `OPENAI_CHAT_MODEL`:
- `gpt-4o-mini` (mặc định, rẻ và nhanh)
- `gpt-4o` (tốt hơn nhưng đắt hơn)
- `gpt-3.5-turbo` (legacy)

### Tắt phân tích
Để tiết kiệm chi phí, có thể tắt phân tích:
- Set `include_analysis=false` trong API request
- Hoặc modify frontend để không request analysis

## Ví dụ phân tích

```
"Giảng viên này phù hợp với bài báo cáo của bạn vì chuyên môn về 
Trí tuệ nhân tạo và Machine Learning trùng khớp với nội dung nghiên 
cứu của bạn về NLP và Computer Vision. Với hơn 15 năm kinh nghiệm 
trong lĩnh vực này, giảng viên có thể hỗ trợ bạn phát triển sâu hơn 
về các mô hình deep learning và ứng dụng thực tế."
```

