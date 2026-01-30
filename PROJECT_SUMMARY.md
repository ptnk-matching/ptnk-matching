# Tóm tắt Dự án Hạnh Matching

## Mục tiêu
Xây dựng hệ thống cho phép học sinh lớp 11 liên chuyên ngành upload bài báo cáo và tự động đề xuất giảng viên phù hợp nhất dựa trên AI matching.

## Kiến trúc

### Frontend (Next.js 14)
- **Framework**: Next.js 14 với App Router
- **UI**: React + TypeScript + Tailwind CSS
- **Features**:
  - Drag & drop file upload
  - Hiển thị kết quả matching với điểm số
  - Responsive design
  - Loading states và error handling

### Backend (Python FastAPI)
- **Framework**: FastAPI
- **AI/ML**: 
  - Sentence Transformers cho embeddings
  - Cosine similarity cho matching
- **Features**:
  - Upload và extract text từ PDF/DOCX/TXT
  - AI matching với semantic search
  - RESTful API

### Data
- **Storage**: JSON file (`data/professors.json`)
- **Format**: Structured professor profiles với:
  - Thông tin cơ bản (tên, chức danh, khoa)
  - Chuyên môn và lĩnh vực nghiên cứu
  - Keywords và mô tả

## Workflow

1. **Upload**: Học sinh upload file báo cáo (PDF/DOCX/TXT)
2. **Extract**: Backend trích xuất text từ file
3. **Embed**: Convert text thành vector embeddings
4. **Match**: So sánh với embeddings của các giảng viên
5. **Rank**: Sắp xếp theo similarity score
6. **Display**: Hiển thị top K giảng viên phù hợp nhất

## Công nghệ chính

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend Framework | FastAPI |
| AI/ML | OpenAI Embeddings API (text-embedding-3-small) |
| Similarity | Cosine Similarity (scikit-learn) |
| File Processing | PyPDF2, python-docx |
| Deployment | Vercel |

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Health check |
| GET | `/api/professors` | Lấy danh sách giảng viên |
| POST | `/api/upload` | Upload và extract text |
| POST | `/api/match` | Match từ text |
| POST | `/api/upload-and-match` | Upload và match trong 1 request |

## File Structure

```
hanh-matching/
├── api/                    # Vercel serverless functions
│   └── index.py
├── backend/                # Python backend
│   ├── main.py            # FastAPI app
│   ├── services/          # Business logic
│   │   ├── matching.py    # AI matching
│   │   └── document_processor.py
│   ├── database/          # Data layer
│   │   └── professors.py
│   └── requirements.txt
├── frontend/              # Next.js frontend
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── services/         # API client
│   └── package.json
├── data/                 # Data files
│   └── professors.json
├── vercel.json          # Vercel config
├── README.md
├── DEPLOYMENT.md
└── QUICKSTART.md
```

## Tính năng đã implement

✅ Upload file (PDF, DOCX, DOC, TXT)
✅ Extract text tự động
✅ AI matching với semantic search
✅ Hiển thị top K giảng viên
✅ Điểm khớp (similarity score)
✅ UI đẹp và responsive
✅ Error handling
✅ Loading states
✅ CORS configuration
✅ Vercel deployment ready

## Tính năng có thể mở rộng

- [ ] Authentication & Authorization
- [ ] Database (PostgreSQL/MongoDB)
- [ ] User management
- [ ] History tracking
- [ ] Advanced filtering
- [ ] Email notifications
- [ ] Admin panel để quản lý giảng viên
- [ ] Analytics và reporting
- [ ] Multi-language support
- [ ] File preview
- [ ] Batch upload

## Performance Considerations

1. **OpenAI API**:
   - Gọi API mỗi lần cần embeddings
   - Latency: ~100-500ms per request
   - Cost: ~$0.02 per 1M tokens (rất rẻ)
   - Pre-compute embeddings cho giảng viên khi service start
   - Chỉ compute embedding cho report text mới mỗi request

2. **Caching**:
   - Có thể cache embeddings của giảng viên trong memory
   - Với Vercel serverless, có thể cache trong `/tmp` hoặc external cache (Redis)

3. **File Size**:
   - Giới hạn file size (recommend < 10MB)
   - Có thể compress hoặc chunk processing cho file lớn

## Security Considerations

1. **File Upload**:
   - Validate file type
   - Scan for malware (có thể thêm)
   - Limit file size

2. **API**:
   - Rate limiting (có thể thêm)
   - Input validation
   - Error message sanitization

3. **CORS**:
   - Hiện tại allow all origins (dev)
   - Production nên restrict domain cụ thể

## Deployment Notes

- **Vercel**: Frontend + Backend serverless functions
- **OpenAI API**: External service, không cần download model
- **Cold Start**: Nhanh hơn vì không cần load model (~1-2s)
- **Timeout**: 30s max (có thể tăng với Pro plan)
- **Cost**: ~$0.02 per 1M tokens (rất rẻ, ~$0.0001 per matching request)

## Next Steps

1. Test local development
2. Deploy lên Vercel
3. Test với dữ liệu thực
4. Tune matching algorithm
5. Add more professors
6. Optimize performance
7. Add monitoring/logging

