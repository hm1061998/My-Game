# T41 — Thực thi M2 theo wireframe mới

- **Trạng thái:** Task 0 đã có baseline và phản biện premise; chờ chủ dự án chọn các quyết định còn mở; chưa sửa code sản phẩm
- **Chủ trì:** Codex/điều phối; dùng tác tử AI cho nội dung và review độc lập
- **Phụ thuộc:** T40, T39
- **Kế hoạch đã duyệt:** [M2 v1.1](../superpowers/plans/2026-09-27-m2-product-redesign-implementation.md)
- **Hợp đồng HUD:** [Bố cục wireframe đã duyệt](../design/M2-hud-layout-contract.md)
- **Giai đoạn sản phẩm:** khám phá/định nghĩa Task 0; đầu vào là kế hoạch M2 đã duyệt; cổng ra là baseline, đề xuất và lựa chọn của chủ dự án trước nội dung/coding

## Phê duyệt và phạm vi

Ngày 2026-09-27, chủ dự án nói “tôi sẽ duyệt kế hoạch này” đồng thời yêu cầu bảo đảm game làm đúng wireframe đã duyệt. Ghi nhận đây là phê duyệt triển khai kế hoạch M2, với neo và thứ bậc HUD wireframe là yêu cầu nghiệm thu cứng. Kế hoạch v1.1 chỉ làm rõ yêu cầu này, không đổi bố cục đã chọn.

Trong phạm vi: Task 0, các lát cắt trong kế hoạch, AI tác giả/phản biện/mô phỏng người chơi, và browser có hiển thị. Không liên hệ người học thật, không thu phí, mua asset, deploy hoặc phát hành. Không bắt đầu viết case JSON vụ hai trước khi chủ dự án chọn premise.

## Task 0 — baseline và quyết định đầu vào

- Tạo ba logline so sánh được cho vụ án thứ hai và nhờ tác tử khác phản biện độc lập.
- Đề xuất khảo sát tự đánh giá A2/B1, quy tắc gợi ý, ma trận Dễ/Trung bình/Khó/Chuyên gia và lựa chọn cách tạo khác biệt ngôn ngữ A2/B1.
- Đo FPS/p95 và payload ở hành trình headed hiện tại; ghi revision, viewport, browser, trạng thái máy và giới hạn đo. Người dùng đã cho biết giật trước đây trùng lúc máy chạy nhiều tác vụ; không quy nguyên nhân cho game nếu không tái hiện có kiểm soát.
- Trình chủ dự án các lựa chọn premise/thời lượng vụ hai, survey/độ khó/biến thể A2–B1 và target device/profile. Dừng trước nhánh nội dung/coding phụ thuộc các quyết định đó.

## Ràng buộc wireframe bắt buộc

- Header mảnh ở trên; thế giới Phaser là bề mặt chính.
- Mục tiêu ở trái-trên; tiến độ ở phải-trên với minimap ngay dưới thành một cụm.
- Prompt tương tác nằm gần giữa phía dưới, phía trên action bar ngang sát đáy.
- Action bar theo thứ tự E, J, M, Space, Esc; sổ tay/bản đồ/tạm dừng là overlay giữa màn chơi và pause Phaser.
- Không có right bar/drawer cố định. Responsive co cụm nhưng không đổi neo/thứ bậc; chỉ số pixel trong hình không đóng băng.
- Minimap không thể hiện clue khóa/chưa phát hiện hay bất kỳ đáp án riêng nào.
- QA bao gồm 1280×800, 1100×720, 800×600, 390×800, 360×800, zoom 200%, pause/focus, cảnh báo tắt âm, screenshot và bounds assertions.

## Bằng chứng và trạng thái hiện thời

- Baseline Git: commit `55db372` (`docs(m2): plan product redesign implementation`) trên `codex/m1-version-two`; trước khởi động Task 0 nhánh sạch.
- Visible headed Chromium baseline trên đúng revision `55db3724a8f8328359d5bca634f1f17476027079`, viewport 1280×800: 8/8 qua; critical journey đo 1.614 giây/97 frame, xấp xỉ 60 FPS, p95 17 ms, longest 17 ms; asset transfer 991,549 byte không gồm ambience MP3. Ghi chi tiết/giới hạn tại `docs/quality/M2-task0-performance-baseline.md`.
- Report của lượt headed baseline được lưu ngoài repo ở `C:\Users\Minh\.codex\visualizations\2026\09\27\01a0e04b-4e41-75c0-8708-efb747b7c318\m2-t0-headed-run`; test-results/playwright-report local đã khôi phục từ bản sao trước khi chạy.
- Workspace SDD và progress ledger đang được thiết lập. Lệnh upstream `sdd-workspace` gặp lỗi tương thích Windows: Git for Windows trả `git rev-parse --show-toplevel` dưới dạng `C:/...`, trong khi script ghép đường dẫn Unix và thử tạo thư mục ngoài root. Chưa có sản phẩm/code nào bị sửa do lỗi này; dùng đường dẫn Windows/workspace cục bộ an toàn làm fallback.
- Tác tử biên kịch đã đề xuất ba premise; phản biện logic độc lập xếp *The Missing Demo Device* trước, với yêu cầu ID thiết bị + dấu thời gian + phiếu nhận hoặc nhân chứng độc lập. Tổng hợp/rủi ro tại `docs/research/M2-case-two-options.md`; chưa có lựa chọn của chủ dự án.
- Tác tử học tập đề xuất khảo sát tự đánh giá, ngưỡng gợi ý A2/B1 và các tham số độ khó. Đây là giả thuyết chưa duyệt; cần trình rõ rủi ro và không được tự mã hóa như quyết định.
- Tác tử UI độc lập xác nhận các neo wireframe và phát hiện CSS preview sẽ chồng lấn nếu sao pixel nguyên xi trên 360–560 px. Vì vậy triển khai phải giữ quan hệ vị trí nhưng co kích thước/spacing và kiểm tra bằng screenshot/bounds.

## Kết quả Task 0 và câu hỏi cần chủ dự án chọn

- [x] Ba premise được review logic độc lập; không thêm nội dung cuối vào JSON.
- [x] Đề xuất survey, ma trận độ khó, biến thể A2/B1 và target profile được đưa ra với giả định/rủi ro; đang chờ chủ dự án chọn.
- [x] Performance baseline headed trên đúng revision được ghi ở `docs/quality/`.
- [ ] Chủ dự án chọn premise và duyệt các tham số thiết kế còn mở; cập nhật T39/spec trước Task 1/5/6.

## Kiểm tra và bàn giao

- Browser: hoàn tất Playwright headed hiển thị tại cổng 5174; 8/8 qua. Mẫu hiệu năng và viewport tại `docs/quality/M2-task0-performance-baseline.md`.
- Script: E2E 8/8 đạt; cần chạy agent-docs và `git diff --check` trước handoff.
- Improvement review: `candidate`; công cụ upstream `sdd-workspace` không xử lý đúng Windows worktree path; dùng fallback đường dẫn cục bộ an toàn, chưa quảng bá thành quy tắc trước khi tái hiện/xác minh.
- Bước tiếp theo: chủ dự án chọn premise/thời lượng case hai; duyệt survey và quy tắc gợi ý; duyệt ma trận khó; chọn mức khác biệt A2/B1; xác nhận target browser/device. Sau đó cập nhật T39/spec và mở các lát cắt phụ thuộc.

## Improvement review

- Kết quả: `candidate` (L016).
- Quan sát/bằng chứng: upstream `sdd-workspace` ghép sai đường dẫn khi Git for Windows trả root `C:/...`, rồi phát sinh lỗi tạo thư mục; task tree không bị sửa bởi lần chạy lỗi.
- Cơ chế: ghi candidate; không sửa script hoặc quy tắc upstream sau một sự cố. Tiếp tục dùng đường dẫn Windows đã xác nhận nằm trong worktree và kiểm tra đích trước khi ghi.
- Kiểm chứng: baseline chạy xong bằng runner headed dự án; thư mục E2E cũ được khôi phục chính xác, report mới lưu ngoài repo. Candidate được ghi ở `docs/agent/lessons.md`.
- Chủ trì/kích hoạt tiếp: Codex xác minh nếu script upstream cập nhật hoặc lỗi lặp ở worktree Windows khác.
