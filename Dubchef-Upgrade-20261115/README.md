# Bản vá hoàn thiện Dubchef — 15/11/2026

Đây là gói bàn giao cho dự án YiTang-159/CNPM, nền commit 6ec1b51.
Nhánh này chỉ chứa thêm gói bàn giao; không tự sửa hoặc triển khai dự án CNPM.

## Tải bản vá

[Tải ZIP trực tiếp](https://github.com/Ngan2610/test/raw/refs/heads/dubchef-upgrade-20261115/Dubchef-Upgrade-20261115/Dubchef_BanVa_HoanThien_20261115.zip)

SHA-256: `3d78619721de1fa0282495035c8ea4fdee4492d30e8ec713246e285cbf6d8abb`

## Áp dụng trên Windows

1. Giải nén ZIP vào một thư mục riêng.
2. Mở PowerShell tại thư mục vừa giải nén và chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\Apply-Upgrade.ps1 -RepositoryPath "C:\Users\Ngan\Documents\GitHub\CNPM"
cd C:\Users\Ngan\Documents\GitHub\CNPM
npm ci --prefix server
npm ci --prefix web
npm ci --prefix mobile
```

Script kiểm tra xung đột từng file, hỗ trợ CRLF Windows và sao lưu nguồn trước khi chép. Nếu có xung đột, dừng để đối chiếu; không ép ghi đè.
Gói không chứa hoặc thay thế .env, mật khẩu, backup SQL, video riêng, node_modules hay .git. Không xóa Docker volume.

Đọc `docs/HOAN_THIEN_VA_CAI_DAT_WINDOWS.md` và `docs/BAO_CAO_NGHIEM_THU_20261115.md` trong repo CNPM sau khi áp dụng.

## Có gì trong bản vá

- Backend chia controller/service/repository; tài khoản và xử lý video qua service.
- Server Whisper STT: tách audio, tự nhận ngôn ngữ VI/EN/ZH, timestamp.
- Hàng đợi SQL, worker, retry/heartbeat, lưu bản dịch theo hạn mức.
- MP3/MP4/SRT/VTT; MP4 chứa nhiều audio track; tải/phát kết quả trên Web/Mobile.
- Thuật ngữ, quy đổi đơn vị, trích nguyên liệu/bước nấu có chứng cứ nguồn.
- CD Services publish image và cập nhật Docker Desktop qua runner Windows; cấu hình EAS Mobile.

## Kết quả và giới hạn

Đã chạy: 124 test Web, 17 test Mobile, 93 test backend không cần SQL; build Web và bundle Android; Whisper tiny và xuất media thật.
Chưa nghiệm thu toàn bộ SQL + Ollama thật + Docker trên máy nhóm, APK/điện thoại và CD Windows. Workflow mới cần CI chạy lại.
Bản vá là mã nguồn đã kiểm tra ở phạm vi trên, không phải chứng nhận mọi dịch vụ đã triển khai.
