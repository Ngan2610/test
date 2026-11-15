# Dubchef — bản sửa V2

Nền áp dụng: **YiTang-159/CNPM, commit 57a5fad**.

**[Tải bản vá V2](https://github.com/Ngan2610/test/raw/refs/heads/dubchef-upgrade-20261115/Dubchef-Fix-V2/Dubchef_Fix_V2_20261115.zip)**

SHA-256: `75886db220040676969e29eab0146c251d937885443cb8e65a5a47c344e546d2`

## Áp dụng

Giải nén ZIP vào thư mục riêng, mở PowerShell tại đó:

```powershell
powershell -ExecutionPolicy Bypass -File .\Apply-Upgrade.ps1 -RepositoryPath "C:\Users\Ngan\Documents\GitHub\CNPM"
cd C:\Users\Ngan\Documents\GitHub\CNPM
git add .
git commit -m "Complete service layering and acceptance tooling"
git push origin main
```

39 file trong bản vá. Script kiểm tra xung đột và sao lưu nguồn trước khi chép; giữ nguyên .env, .git, SQL và volume Docker. Không thêm dependency npm.

## Các sửa đổi

- Controller đang hoạt động chỉ gọi service; payment/video/admin/community/translation và xác thực đã có tầng nghiệp vụ. SQL repository chính có thư mục riêng.
- Chống upload đồng thời ghi đè đường dẫn SQL; file thừa được dọn. Kiểm soát quyền đọc file và symlink.
- Sửa bộ đếm request dịch đồng thời và giữ slot xuất giọng đến khi download kết thúc.
- Thêm test kiểm soát kiến trúc, role Admin và các tình huống đồng thời.
- CD Web/Services chỉ phát hành commit đã qua CI, cả khi chạy tay.
- CD Mobile kiểm tra cấu hình Expo, thu APK thật sau EAS build, kiểm tra dạng APK, tính hash và đưa vào Artifacts; không phụ thuộc trường details URL có thể thiếu.
- Có check-windows.ps1 và acceptance-e2e.mjs để kiểm tra stack/video thật với 13 file xuất.

## Kiểm tra đã thực hiện

Node 22: 97/97 backend test không gồm hai bộ SQL; 17/17 Mobile test với cache sạch, chạy tuần tự; 36/36 shared/source/configuration/acceptance contracts. Media tests có FFmpeg/eSpeak thật.
Hai bộ SQL, Web build và toàn bộ workflow cần CI xác nhận lại trên V2. Không đánh dấu đã triển khai Windows/Expo khi chưa có runner hoặc tài khoản thật.

Sau khi áp dụng, đọc **docs/SUA_LOI_VA_NGHIEM_THU_V2.md** trong CNPM.
Bật runner Windows và cấu hình Expo cần thao tác bằng tài khoản/máy của nhóm; gói không chứa thông tin đăng nhập.
