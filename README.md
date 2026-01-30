# Hạnh Matching - Hệ thống đề xuất giảng viên

Hệ thống cho phép học sinh lớp 11 liên chuyên ngành upload bài báo cáo và tự động tìm kiếm giảng viên phù hợp dựa trên AI matching sử dụng semantic search và embeddings.

## Tính năng

- ✅ Upload bài báo cáo (PDF, DOCX, DOC, TXT)
- ✅ Trích xuất text tự động từ file
- ✅ AI Matching sử dụng OpenAI Embeddings API
- ✅ Đề xuất top K giảng viên phù hợp nhất
- ✅ **Phân tích AI giải thích tại sao giảng viên phù hợp** (GPT-4o-mini)
- ✅ Hiển thị điểm khớp và thông tin chi tiết
- ✅ UI đẹp với Tailwind CSS
- ✅ Responsive design
- ✅ Deploy được trên Vercel

## Cấu trúc dự án

```
hanh-matching/
├── backend/              # Python FastAPI backend
│   ├── main.py          # FastAPI app
│   ├── services/        # Business logic
│   │   ├── matching.py  # AI matching service
│   │   └── document_processor.py
│   ├── database/        # Data layer
│   │   └── professors.py
│   └── requirements.txt
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js 14 App Router
│   ├── components/     # React components
│   ├── services/       # API client
│   └── package.json
├── data/               # Data files
│   └── professors.json
├── api/                # Vercel serverless functions
│   └── index.py
├── vercel.json         # Vercel config
└── README.md
```

## Cài đặt Local

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm hoặc yarn
- OpenAI API Key (lấy tại https://platform.openai.com/api-keys)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Tạo file .env và thêm OpenAI API key
cp .env.example .env
# Chỉnh sửa .env và thêm OPENAI_API_KEY của bạn

uvicorn main:app --reload
```

Backend sẽ chạy tại: `http://localhost:8000`

**Lưu ý**: Bạn cần có OpenAI API key để sử dụng tính năng matching. Model sử dụng: `text-embedding-3-small` (có thể đổi qua env variable).

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## API Endpoints

### `GET /api/health`
Health check endpoint

### `GET /api/professors`
Lấy danh sách tất cả giảng viên

### `POST /api/upload`
Upload và trích xuất text từ file
- Body: `multipart/form-data` với field `file`
- Response: `{success, filename, text, length}`

### `POST /api/match`
Tìm giảng viên phù hợp từ text
- Body: `{text: string, top_k?: number}`
- Response: `{matches: [...], processed_text: string}`

### `POST /api/upload-and-match`
Upload và match trong một request
- Body: `multipart/form-data` với `file` và `top_k` (query param)
- Response: `{success, filename, matches: [...], text_preview: string}`

## Deployment trên Vercel

Xem chi tiết trong [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Start:
1. Push code lên GitHub
2. Import vào Vercel
3. Vercel tự động detect và deploy
4. Set environment variables nếu cần

## Công nghệ sử dụng

### Backend
- **FastAPI**: Web framework
- **OpenAI API**: AI embeddings cho semantic search (text-embedding-3-small)
- **PyPDF2**: Extract text từ PDF
- **python-docx**: Extract text từ DOCX
- **scikit-learn**: Cosine similarity

### Frontend
- **Next.js 14**: React framework với App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **react-dropzone**: File upload UI

## Thêm giảng viên mới

Chỉnh sửa file `data/professors.json` hoặc sử dụng API để thêm:

```json
{
  "id": "prof_7",
  "name": "TS. Nguyễn Văn X",
  "title": "Giảng viên",
  "department": "Khoa ...",
  "expertise": "...",
  "research_interests": "...",
  "description": "...",
  "keywords": ["keyword1", "keyword2"],
  "email": "email@university.edu.vn",
  "publications": 0
}
```

Sau đó restart backend để reload embeddings.

## Tùy chỉnh

### Thay đổi model embedding
Set environment variable `OPENAI_EMBEDDING_MODEL`:
- `text-embedding-3-small` (mặc định, rẻ và tốt)
- `text-embedding-3-large` (tốt hơn nhưng đắt hơn)
- `text-embedding-ada-002` (legacy model)

**Lưu ý**: Cần có OpenAI API key hợp lệ. Xem giá tại: https://openai.com/pricing

### Thay đổi số lượng kết quả
- Mặc định: top 5
- Có thể thay đổi qua parameter `top_k` trong API

## License

MIT

