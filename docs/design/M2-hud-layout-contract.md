# Hợp đồng bố cục HUD M2 theo wireframe đã duyệt

- **Trạng thái:** bố cục đã được chủ dự án duyệt; là điều kiện nghiệm thu giao diện M2
- **Nguồn:** wireframe `m2-ingame-hud-wireframe.html` được trình bày và duyệt ngày 2026-09-27; các lựa chọn chi tiết ở T39
- **Phạm vi:** HUD trong lúc chơi, minimap, prompt tương tác và các overlay liên quan

## Bố cục bắt buộc

```text
┌──────────────────── header mảnh: tên game ───────── hồ sơ · hồi · khu ┐
│ ┌─ mục tiêu hiện tại ─┐                       ┌─ tiến độ hồ sơ ────┐ │
│ │ mục tiêu + mô tả    │                       ├─ minimap ──────────┤ │
│ └─────────────────────┘                       │ player + clue mở   │ │
│                                                └────────────────────┘ │
│                         THẾ GIỚI PHASER                              │
│            prompt tương tác theo ngữ cảnh, gần giữa phía dưới        │
├──────────────────────── action bar ngang sát đáy ────────────────────┤
│          E Tương tác · J Sổ tay · M Bản đồ · Space Né · Esc Tạm dừng │
└─────────────────────────────────────────────────────────────────────┘
```

Các quan hệ vị trí và thứ bậc dưới đây là bắt buộc:

1. Header mảnh ở phía trên, nhãn game bên trái và metadata vụ án bên phải.
2. Thế giới Phaser là bề mặt chính và chiếm phần lớn màn chơi.
3. Thẻ mục tiêu nổi ở góc trên trái.
4. Tiến độ vụ án ở góc trên phải; minimap nằm ngay phía dưới và cùng cụm.
5. Prompt tương tác xuất hiện theo ngữ cảnh gần giữa phía dưới, nằm phía trên action bar.
6. Action bar chạy ngang sát đáy vùng game, có thứ tự thao tác E, J, M, Space, Esc.
7. Không có right bar, drawer cố định hoặc nhóm chức năng bị dời sang cạnh phải.
8. Sổ tay, bản đồ đầy đủ và tạm dừng là overlay giữa màn chơi; mở overlay tạm dừng Phaser và trả focus hợp lý khi đóng.

## Điều được phép co giãn

Các số pixel, khoảng cách, vị trí nhân vật/đạo cụ, chiều cao header/world/action bar và kích thước minimap trong wireframe chỉ biểu đạt tỷ lệ trên desktop. Responsive có thể co kích thước, khoảng cách và chữ để tránh che nội dung. Không được đổi neo, thứ tự, quan hệ “progress trên minimap”, đặt prompt dưới action bar, bỏ minimap khỏi HUD đang chơi hoặc phục hồi thanh bên phải.

## Hợp đồng minimap và tương tác

- Hiển thị vùng hiện tại, vị trí người chơi và chỉ các mục tiêu/manh mối đã được phép theo tiến độ.
- Không tạo marker, nhãn, tooltip, thuộc tính truy cập hoặc dữ liệu DOM cho manh mối khóa/chưa phát hiện hay đáp án riêng.
- Prompt E chỉ hiện khi một tương tác dùng được ở gần người chơi; action bar luôn phản ánh đúng điều khiển có hiệu lực.
- Progress lấy từ session/case đang chơi, không dùng số minh họa `4 / 8` của wireframe.

## Cổng QA bố cục

- Chụp browser có hiển thị ở 1280×800, 1100×720, 800×600, 390×800 và 360×800; đối chiếu từng neo ở trên.
- Ở cả cỡ hỗ trợ, không có tràn/cuộn ngang hoặc chồng thẻ mục tiêu, progress, minimap, prompt và action bar; nếu chật thì co cụm nhưng giữ vị trí tương đối.
- Kiểm tra zoom 200%, focus bàn phím, tương phản, grayscale/reduced motion, đọc khi tắt âm; HUD không che nhân vật, NPC, clue tương tác hoặc dấu hiệu nguy hiểm quan trọng.
- Sổ tay và các overlay dừng gameplay, đưa focus vào overlay rồi trả focus về canvas; Esc không bị xử lý hai lần.
- Kết hợp screenshot review với test vị trí/bounds và test dữ liệu: minimap không rò manh mối bị khóa.
