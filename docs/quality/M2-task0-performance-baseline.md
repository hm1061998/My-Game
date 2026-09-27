# Baseline hiệu năng M2 — Task 0

- Ngày: 2026-09-27
- Git revision: `55db3724a8f8328359d5bca634f1f17476027079`
- Kiểm thử: Playwright headed Chromium, cửa sổ hiển thị; 8/8 bài qua trong 2.1 phút.
- Kích thước viewport: 1280×800.
- Hành trình: đo RAF khoảng 1.614 giây trong critical journey; 97 frame; xấp xỉ 60 FPS; p95 frame time 17 ms; frame dài nhất 17 ms.
- Tài nguyên `/assets/`: 991,549 byte; MP3 ambience không nằm trong phép đo này.
- Kết quả: các bài audio, onboarding mới, critical journey, M1, texture fallback, reduced motion, offline API và trạng thái grayscale/accessibility đều qua.

## Giới hạn phép đo

Đây là mẫu ngắn trên môi trường headed hiện tại, không phải kiểm tra tải dài, benchmark thiết bị đích hoặc xác nhận trên máy của chủ dự án. Hiện chưa ghi model máy/GPU và phiên bản trình duyệt chính xác. Chủ dự án từng cho biết độ giật trước đây xảy ra khi máy chạy nhiều tác vụ; phép đo này không tái hiện hay phủ nhận điều kiện đó. Dùng đúng viewport và hành trình này để so sánh trước/sau M2; ghi máy/browser và điều kiện tải khi có thể.

