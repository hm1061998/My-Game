# Office Case Files: đề xuất định hướng thương mại

Trạng thái: **định hướng sản phẩm đã được chủ dự án duyệt ngày 27-09-2026**. Các lựa chọn ở mục 1 và thứ tự M0/M1 được xác nhận; kế hoạch thực thi M0/M1 được soạn riêng để duyệt trước khi làm. Tài liệu này thay thế giả định lập kế hoạch prototype một người làm trong một tuần; chưa cho phép triển khai hay bán hàng.

Kế hoạch thực thi để duyệt: [M0/M1 commercial validation](../superpowers/plans/2026-09-27-m0-m1-commercial-validation.md).

## 1. Điểm xuất phát

Người mua và người chơi đầu tiên là **người học 18–35 tuổi, đang đi làm hoặc chuẩn bị đi làm, tự trả tiền**. Họ chơi trực tiếp trên **trình duyệt web**. Nội dung tiếng Anh mục tiêu vẫn ở A2–B1; điều hướng tiếng Việt giúp vào game dễ. Hội thoại, manh mối và hồ sơ vụ án giữ tiếng Anh làm nội dung học chính, kèm **phụ đề/bản dịch tiếng Việt tùy chọn, có thể bật hoặc ẩn ngay khi chơi**. Nguồn hình ảnh, hoạt họa và âm thanh kết hợp asset có license, AI và chỉnh tay, với hồ sơ nguồn gốc cho từng asset.

Các lựa chọn chủ dự án đã xác nhận trong vòng duyệt này:

| Quyết định | Lựa chọn đã chốt |
|---|---|
| Nhịp chơi | Điều tra và suy luận là chính; xen các đoạn né tránh ngắn |
| Sắc thái | Bí ẩn nhưng tươi sáng, nhân vật biểu cảm, có chút dí dỏm |
| Nhân sự | Một người phát triển chính; thuê art, animation và audio theo từng mốc |
| Bán nội dung | Vụ mở đầu miễn phí hoàn chỉnh; mua gói vụ án tiếp theo, chưa làm thuê bao |
| Phụ đề | Tiếng Anh hiển thị ban đầu; bản dịch Việt ẩn ban đầu và có nút hiện ngay cạnh câu, ghi nhớ lựa chọn |
| Đồ họa | Làm mẫu Phaser 2.5D chất lượng cao trước; chỉ thử 3D nếu mẫu chưa đạt cổng chất lượng |
| Thứ tự | M0/M1 và pipeline nội dung tối thiểu trước; hoãn bộ quản trị T15–T26 đầy đủ |

Bản hiện có chứng minh luồng kỹ thuật của một vụ “Swapped Report”: React xử lý UI, Phaser xử lý gameplay, ASP.NET Core xử lý tiến trình và điểm tin cậy, SQLite lưu phiên, nội dung vụ án nằm ở server. Người chơi có thể khám phá văn phòng, lấy manh mối, né nguy hiểm, ghép chứng cứ và kết luận. Đây là nền có thể tái sử dụng, chưa phải bằng chứng sản phẩm thương mại. Kiểm tra trình duyệt và hiệu năng trước đây chứng minh tính chạy được; ba bối cảnh quan sát tự động không thay cho playtest với người học thật.

Khoảng trống lớn nhất là cảm giác chơi: nhân vật SVG còn cứng, môi trường và camera ít chất điện ảnh, tác động của hành động yếu, âm thanh dựa nhiều vào âm tạo bằng code và Web Speech, câu hỏi trắc nghiệm chen vào nhịp điều tra. Chưa có bằng chứng người học muốn chơi tiếp vụ thứ hai, trả tiền, hoặc giới thiệu game. Chưa có tài khoản, quyền truy cập nội dung đã mua, thanh toán, hỗ trợ khách hàng và vận hành nội dung ở mức thương mại.

## 2. Luận điểm sản phẩm

Đề xuất định vị: **game trinh thám hành động vừa chơi vừa học tiếng Anh, có thể chơi ngay trên web**. Hiểu lời khai và manh mối tiếng Anh giúp người chơi phá án; phụ đề tiếng Việt tùy chọn giúp họ học theo khả năng của mình. Hành động, suy luận, nhân vật và phần thưởng kể chuyện phải hấp dẫn, còn mục tiêu học A2–B1 phải hiện diện trong chính vòng chơi thay vì chỉ ở phần ôn tập.

Vòng chơi đề xuất: mở đầu bằng một biến cố rõ ràng → khám phá và quan sát → nghe/đọc lời khai tiếng Anh có ý nghĩa đối với vụ án → chọn cách hỏi hoặc hành động → nối chứng cứ và kiểm tra giả thuyết → vượt đoạn hành động ngắn có báo hiệu công bằng → trình bày lời giải → nhận cú lật và mở vụ kế tiếp. Người chơi có thể bật bản dịch tiếng Việt cho lời thoại hoặc manh mối ngay tại chỗ, xem lại câu tiếng Anh và nghe lại âm thanh. Đáp án tiếng Anh sai nên dẫn tới gợi ý, hậu quả kể chuyện hoặc đường vòng; hạn chế khóa tiến trình bằng quiz. Ôn tập từ vựng có thể xuất hiện sau vụ án hoặc theo lựa chọn của người chơi.

Ba hướng cần so sánh trước khi đầu tư lớn:

| Hướng | Lợi ích | Rủi ro | Quyết định đề xuất |
|---|---|---|---|
| Nâng Phaser 2.5D bằng sprite/atlas vẽ hoặc render sẵn, hoạt họa biểu cảm, ánh sáng và hiệu ứng chọn lọc | Tận dụng hệ thống gameplay hiện có; dễ đạt tải web nhanh | Pipeline asset thủ công lớn; hiệu ứng không cứu được diễn xuất cứng | Làm mẫu chất lượng cao đầu tiên |
| Nhân vật và cảnh 3D trực giao trong một phòng mẫu | Camera, diễn xuất và ánh sáng linh hoạt hơn | Tăng chi phí kỹ thuật, asset, tải trang và QA thiết bị | Chỉ làm phép đối chứng nếu mẫu Phaser chưa đạt cổng chất lượng; chỉ chuyển engine nếu thắng rõ |
| Giữ đồ họa SVG và chỉ thêm hiệu ứng | Rẻ và nhanh | Không giải quyết phàn nàn cốt lõi về hình ảnh, nhân vật | Không chọn làm hướng thương mại |

Phaser 4 đã có hệ thống ánh sáng và bộ lọc, nhưng ánh sáng động dùng WebGL và có chi phí batching; phải thử trên thiết bị mục tiêu thay vì mặc định bật khắp cảnh. Three.js hỗ trợ camera trực giao và glTF cho mẫu đối chứng. Tham khảo: [Phaser LightsManager](https://docs.phaser.io/api-documentation/4.0.0/class/gameobjects-lightsmanager), [Phaser filter system](https://phaser.io/news/2026/05/phaser-4-filter-system), [Three.js OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html), [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html).

## 3. Tiêu chuẩn cảm giác chơi

- **Hình ảnh:** một bộ art direction nhất quán cho “văn phòng bí ẩn nhưng tươi sáng, nhân vật biểu cảm, có chút dí dỏm”: silhouette đọc rõ, phân lớp chiều sâu, màu theo vùng, bố cục camera dẫn mắt, đạo cụ kể chuyện. So sánh 2–3 moodboard cùng sắc thái này với người chơi mục tiêu trước khi khóa style.
- **Nhân vật:** mỗi nhân vật chính cần pose nhận diện và bộ diễn xuất tối thiểu: idle có nhịp thở, nhìn/đổi hướng, đi/chạy, né, phản ứng va chạm, cử chỉ khi nói, 2–3 sắc thái chân dung. Chuyển động phải có chuẩn bị, phản hồi và kết thúc, không chỉ tween vị trí.
- **Âm thanh:** âm nền theo vùng, bước chân theo bề mặt, âm tương tác/manh mối, báo hiệu nguy hiểm có thể nghe được, nhạc theo trạng thái, stinger khi suy luận. Lời thoại tiếng Anh quan trọng cần thu hoặc tạo với chất lượng được duyệt, có transcript tiếng Anh đồng bộ và bản dịch tiếng Việt tùy chọn, với quyền sử dụng thương mại rõ ràng; không phụ thuộc duy nhất vào Web Speech của máy.
- **Phụ đề học tập:** mặc định hiển thị câu tiếng Anh và ẩn dòng tiếng Việt; nút hiện bản dịch nằm ngay cạnh câu hội thoại hoặc manh mối. Người chơi có thể bật/ẩn trong lúc chơi mà không mất tiến trình. Ghi nhớ lựa chọn giữa các phiên, cho phép xem/nghe lại từ nhật ký vụ án. Bản dịch phải đúng ngữ cảnh và không tự ý thêm suy luận hay đáp án vắng mặt trong bản gốc. Playtest kiểm tra khả năng tìm thấy nút dịch và mức hỗ trợ học; không phạt điểm hoặc chặn tiến trình vì dùng bản dịch.
- **Khả năng truy cập:** transcript/phụ đề tiếng Anh, bản dịch tiếng Việt tùy chọn, âm lượng riêng, mute, giảm chuyển động, chỉ báo nguy hiểm bằng hình lẫn âm, tương phản/chữ dễ đọc, focus/keyboard UI rõ. Âm trên web phải khởi động sau thao tác người chơi.
- **Tương tác:** manh mối có phản hồi ngay, hành động né có cửa sổ công bằng, sai lầm có thể hồi phục, bảng suy luận cho phép thử giả thuyết, kết thúc vụ án tạo payoff đáng nhớ.

## 4. Phạm vi bản thương mại đầu

Chủ dự án chọn **một vụ mở đầu miễn phí hoàn chỉnh khoảng 10–15 phút**, sau đó **mua gói vụ án tiếp theo**. Không dùng thuê bao cho bản đầu. Chưa chọn số vụ trong gói hoặc mức giá; cần kiểm chứng lượng nội dung, giá trị cảm nhận và chi phí sản xuất vụ thứ hai trước khi định giá. Không đưa thanh toán vào trước khi thử nghiệm sự thích thú và ý định mua.

Kênh thanh toán cần khảo sát theo pháp nhân và nơi bán thực tế. Danh sách quốc gia merchant của Stripe hiện không nêu Việt Nam; không nên thiết kế hệ thống mặc định dựa trên Stripe. Tài liệu itch.io cho biết game HTML5 nhúng trên trang chỉ nhận donation, nên không xem đây là paywall trực tiếp cho bản browser. Tham khảo: [Stripe global availability](https://stripe.com/global), [itch.io HTML5 games](https://itch.io/docs/creators/html5.amp), [itch.io payments](https://itch.io/docs/creators/payments).

## 5. Lộ trình theo cổng quyết định

Với một người phát triển chính và cộng tác viên hình/âm theo mốc, **M0–M1 dự kiến 6–9 tuần**. Đây là khoảng lập kế hoạch, không phải cam kết. Chưa ấn định ngày phát hành hoặc tổng thời gian thương mại: thời gian M2–M4 phải được tính lại sau khi biết chi phí, lịch cộng tác viên, chất lượng mẫu và tốc độ sản xuất vụ án thứ hai. Mỗi mốc kết thúc bằng bằng chứng và quyết định tiếp tục/đổi hướng.

| Mốc | Việc làm | Cổng ra |
|---|---|---|
| M0 · 2–3 tuần: định nghĩa | Phỏng vấn người học mục tiêu, kiểm thử bản hiện tại với 5–8 người thật, moodboard, đối thủ và giả thuyết trả tiền, kiểm kê license/chi phí | Xác nhận người chơi hiểu lời hứa sản phẩm và chỉ ra 3 vấn đề làm họ bỏ cuộc; chọn art direction để thử |
| M1 · 4–6 tuần: mẫu “wow + fun” | Làm lại một đoạn 3–5 phút bằng Phaser 2.5D với nhân vật diễn xuất, bối cảnh, ánh sáng, camera, âm thanh, suy luận và phụ đề Việt bật/ẩn cho đoạn mẫu. Chỉ làm mẫu 3D đối chứng nếu Phaser không đạt cổng và nguyên nhân thuộc giới hạn công nghệ thay vì chất lượng asset/diễn xuất | Playtest mù với người mới: họ tự hiểu mục tiêu, muốn chơi tiếp, nhận diện manh mối, tìm được bản dịch khi cần, thấy hành động công bằng; đạt mục tiêu tải và khung hình đã định trên thiết bị mục tiêu |
| M2 · 4–6 tuần: vertical slice bán được | Hoàn thiện vụ mở đầu 10–15 phút; công cụ/pipeline làm nội dung, asset provenance, lồng tiếng Anh, transcript tiếng Anh và bản dịch tiếng Việt bật/ẩn được cho hội thoại/manh mối, lưu tiến trình, QA đa trình duyệt | Người chơi thật hoàn thành và muốn bắt đầu vụ tiếp; phụ đề không cản trở chơi/học; nhóm chứng minh có thể sản xuất một vụ mới với chi phí dự đoán được |
| M3 · thời lượng chốt sau M2: gói nội dung trả tiền | Sản xuất đủ vụ mới để gói mua một lần có giá trị rõ, kiểm tra chất lượng tiếng Anh A2–B1, hậu kỳ hình/âm, phân tích retention theo đồng ý riêng tư | Có bằng chứng chơi tiếp và tín hiệu sẵn sàng mua; đo được chi phí mỗi vụ; nội dung đạt QA và quyền thương mại rõ |
| M4 · 2–5 tuần: beta thương mại | Chọn cổng thanh toán hợp pháp theo nơi kinh doanh, entitlement, khôi phục mua hàng, hỗ trợ/hoàn tiền, bảo mật, quyền riêng tư, load và recovery | Beta kín mua/khôi phục/quyền truy cập thành công; kiểm tra pháp lý và vận hành được duyệt |
| M5: phát hành | Chuẩn bị marketing/demo, theo dõi crash và phễu, lịch cập nhật vụ án | Chỉ phát hành hoặc triển khai khi chủ dự án phê duyệt pha deployment riêng |

Các con số playtest trên là mẫu định hướng, không phải bằng chứng thống kê. Cần ghi nguyên văn hành vi và lời người chơi, phân biệt quan sát với suy luận. Đề xuất theo dõi: tỷ lệ vào gameplay, thời gian tới manh mối đầu, tỷ lệ hoàn thành vụ miễn phí, lúc nào người chơi bật/ẩn bản dịch và có nghe/đọc lại không, số người tự nguyện chọn chơi tiếp, ý định mua có điều kiện, tỷ lệ mua thật sau beta, lý do rời game, lỗi và hiệu năng. Chốt ngưỡng cụ thể sau M0 thay vì đặt mục tiêu tùy tiện; chỉ thu thập dữ liệu người chơi khi có cơ sở và thông báo quyền riêng tư phù hợp.

## 6. Tái sử dụng và việc hoãn

Giữ các ranh giới React/Phaser/API/domain/storage, cơ chế chấm điểm và chống lộ lời giải trên server, cấu trúc case JSON, tiến trình và các bài kiểm tra hữu ích. Cân nhắc viết lại các phần hình ảnh, hoạt họa, camera, âm thanh, UI/HUD, nhịp vụ án và các đoạn quiz. Quyết định đổi engine là cổng riêng có ADR và phép đo.

Các tài liệu và quyết định cho admin epic T15–T26 vẫn là tài sản đã được duyệt. Chủ dự án đã chọn **đổi thứ tự thực hiện**: tập trung M0/M1, pipeline nội dung tối thiểu và game hấp dẫn trước; bộ admin đầy đủ tiếp tục hoãn. Không hủy backlog cũ. Phạm vi cụ thể của pipeline tối thiểu sẽ được thiết kế sau khi M0 xác nhận cách sản xuất vụ án.

## 7. Rủi ro cần giải quyết sớm

1. Người chơi có thể cảm thấy bài học ngắt nhịp game: thử hai cách đưa tiếng Anh vào cùng đoạn vụ án.
2. Chất lượng asset từ nhiều nguồn có thể lệch style và thiếu quyền thương mại: dùng art bible, review nguồn/license và hồ sơ chỉnh sửa.
3. Sản xuất case/voice có thể đắt hơn thu nhập: đo giờ làm và chi phí cho vụ thứ hai trước khi cam kết season.
4. Web tải lâu hoặc máy phổ thông yếu: đặt ngân sách tải, texture, âm thanh, draw call và kiểm tra desktop mục tiêu ở M1.
5. Pháp nhân, thanh toán, dữ liệu người học và analytics chưa xác định: nghiên cứu trước M4, không thu thập hay tích hợp dịch vụ thật khi chưa có quyết định.

## 8. Nội dung còn cần duyệt trong kế hoạch tổng thể

- Cổng M0/M1: cách tuyển người chơi thử, tiêu chí để xác định đoạn game đủ hấp dẫn và điều kiện dừng/đổi hướng.
- Sau M0: chọn moodboard cụ thể, ngân sách thuê ngoài và lịch cộng tác viên cho đoạn mẫu.
- Sau M1/M2: số vụ trong gói trả tiền, mức giá, lịch sản xuất dựa trên giờ làm/chi phí thực tế.
- Trước beta thương mại: pháp nhân/khu vực bán, nhà cung cấp thanh toán, điều khoản và chính sách dữ liệu.

Chỉ sau khi các quyết định này được ghi nhận mới tách kế hoạch triển khai chi tiết và thay đổi code/gameplay.
