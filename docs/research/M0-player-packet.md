# M0 first-session public player packet

Use this packet only for independent AI learner-role reviews. It contains information a player could see near the opening; it contains no later clue, suspect resolution, private answer, or score rule. Baseline source revision: `40d649a`; local visible preview: `http://127.0.0.1:5173/`.

## Opening screen

Title: **Office Case Files — The Swapped Report**.

Premise: “Một bản báo cáo quan trọng đã bị tráo. Hãy khám phá văn phòng, đọc manh mối tiếng Anh và tìm ra chuyện gì đã xảy ra.”

Mission drawer heading: **Explore the office**. Start button: **Bắt đầu lượt điều tra**.

Briefing: “VỤ ÁN · 8–12 PHÚT. Một bản báo cáo quan trọng đã bị tráo. Dùng bàn phím để khám phá; manh mối đầu tiên là email trên bàn có vòng sáng. Âm thanh tùy chọn: hiệu ứng trong game và nút nghe câu tiếng Anh trong hồ sơ.”

Controls shown: WASD or arrows to move, Shift to run, E to interact, Space to dodge, Esc to pause.

After starting, the tutorial says: “Di chuyển tới nhãn HỒ SƠ · EMAIL trên bàn bằng WASD hoặc phím mũi tên.” The objective is to collect the file and move toward the meeting-area checkpoint.

Visual description from a visible browser: bright top-down office, a small player near a WELCOME rug on the left, an EMAIL marker by a desk toward the upper middle, a CHAT marker and Leo farther right, and a narrow mission drawer on the right. The scene currently uses simple SVG-style art; a static screenshot cannot establish acting or sound quality.

## First public clue: E01

Title: **Maya's email**.

“At 8:40, Maya sent a short email to the team. She asked everyone to use the approved report, version three, for the client meeting. She also wrote, ‘Do not use the previous version.’ The attachment name ended in v3.”

Glossary: approved = đã được phê duyệt; previous = trước đó; attachment = tệp đính kèm; version = phiên bản.

The approved future design is English first, with an adjacent Vietnamese reveal hidden initially and a persistent preference. This toggle is **not implemented in the current baseline**.
