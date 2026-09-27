# T40 — Lập kế hoạch triển khai M2 theo thiết kế mới

- **Trạng thái:** kế hoạch v1.1 được chủ dự án duyệt ngày 2026-09-27; T41 đang thực hiện Task 0, chưa code
- **Chủ trì:** Codex/điều phối tích hợp
- **Phụ thuộc:** T39
- **Kế hoạch:** [Kế hoạch triển khai M2](../superpowers/plans/2026-09-27-m2-product-redesign-implementation.md)
- **Phiên bản:** 1.1 · 2026-09-27
- **Giai đoạn sản phẩm:** lập kế hoạch đã duyệt; thực thi Task 0 đang tiến hành ở T41
- **Bằng chứng đầu vào:** chủ dự án nói “tôi sẽ duyệt kế hoạch này” và yêu cầu bảo đảm thiết kế game đúng wireframe đã duyệt ngày 2026-09-27. Phê duyệt bao trùm triển khai M2 theo kế hoạch, với neo/thứ bậc HUD wireframe là điều kiện nghiệm thu. T41 ghi phần thực thi; nội dung vụ hai và đề xuất survey/độ khó vẫn là các cổng lựa chọn trước nhánh nội dung.

## Kết quả cần đạt

Tạo một kế hoạch tiếng Việt đủ cụ thể để đội AI chia lát cắt React/API/Phaser/nội dung, rồi triển khai M2 theo hướng hai vụ án, tùy chọn người chơi và HUD mới mà không làm rò đáp án, mất phiên cũ hoặc bỏ quên hành trình/tiến độ.

## Phạm vi và quyết định

- Bao gồm: rà kiến trúc hiện trạng, file-level tasks, interfaces, migration, content pipeline, survey/độ khó, character presets, world/encounter/minimap, art/audio, QA người chơi AI và cổng browser/scripts.
- Loại trừ: sửa code game ở task này, liên hệ người học thật, thu phí/thanh toán, mua asset, deploy hoặc phát hành.
- Chủ dự án đã duyệt: The Swapped Report dài hơn và có mục tiêu 25–35 phút/3 hồi/3 vùng/8–10 hồ sơ/2 đoạn né/≥16 cụm tiếng Anh; hai case hoàn chỉnh; mẫu ngoại hình nam/nữ dùng chung gameplay; bốn độ khó tách A2/B1; survey gợi ý nhưng cho tự chọn; giấy ngà–mực/than có màu nhấn; bỏ right bar và có minimap.
- Còn mở: premise/thời lượng cụ thể của case hai; độ chi tiết của biến thể ngôn ngữ A2/B1; câu hỏi/quy tắc survey; giá trị từng mức difficulty; thiết bị mục tiêu cho performance acceptance. Kế hoạch có Task 0 đề xuất cụ thể và cổng lựa chọn trước khi tạo nội dung case hai.
- Kỹ thuật: catalog endpoint và case catalog đã hỗ trợ nhiều case/version; API `POST /sessions` nhận `caseId` và pin `(caseId, caseVersion)`. Web vẫn khởi tạo `swapped-report`; world/checkpoint/encounter state còn theo một bản đồ/đoạn né. Case JSON validator giữ giới hạn 25–60 từ/hồ sơ và đúng 5 review items. Chi tiết kiểm tra nằm trong spec và kế hoạch.

## Handoff và kiểm chứng kế hoạch

- Baseline: `codex/m1-version-two` tại commit `4593069`; branch tracking `origin/codex/m1-version-two` sạch trước khi soạn kế hoạch.
- Ba agent rà React, API và Phaser ở chế độ chỉ đọc; đều không sửa file hoặc chạy app. Các phát hiện được tích hợp vào kế hoạch, trong đó sửa mô tả API nhiều case cho đúng hiện trạng.
- `scripts/check-agent-docs.ps1` đạt sau khi thêm T40 (41 task files); `git diff --check` đạt trên toàn bộ diff tài liệu hiện tại.
- Browser/app scripts: không chạy vì đây là kế hoạch/tài liệu, không đổi hành vi game. Không có thay đổi code sản phẩm.
- Push: repo yêu cầu commit/push scoped work khi bàn giao; quyền push đã được chủ dự án cho phép trước đó. Chỉ đẩy kế hoạch/task/memory sau khi kiểm tra cuối.

## Handoff thực thi

Chủ dự án đã duyệt kế hoạch. Task 0 đang được ghi nhận ở T41; sau khi chốt quyết định còn mở, dùng `subagent-driven-development` với quyền sở hữu tệp rõ và không để nhiều agent sửa cùng tệp. Nhánh nội dung case hai chờ chủ dự án chọn premise.

## Improvement review

- **Kết quả:** `none`.
- **Quan sát/bằng chứng:** ba audit độc lập xác nhận các ranh giới React, API và Phaser; không có lỗi lặp lại mới ngoài candidate L015 đã ghi tại T39.
- **Cơ chế:** không đổi rule/skill/script; kế hoạch phân quyền theo lát cắt/tệp và yêu cầu agent chỉ đọc khi khảo sát.
- **Kiểm chứng:** kế hoạch tự rà theo đặc tả, checklist của `writing-plans`, agent docs check và `git diff --check`; N/A browser vì tài liệu-only.
- **Kích hoạt tiếp:** T41 đang thực thi Task 0 theo phê duyệt của chủ dự án ngày 2026-09-27.
