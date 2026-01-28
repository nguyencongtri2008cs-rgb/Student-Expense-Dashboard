# 🎓 Dashboard Theo Dõi Chi Tiêu Học Sinh

Ứng dụng web giúp học sinh theo dõi chi tiêu cá nhân với tính năng bình chọn và biểu đồ thời gian thực.

![Demo Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0-blue)

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 📝 Quản lý chi tiêu | Thêm, sửa, xóa khoản chi với 8 danh mục |
| 🗳️ Bình chọn | Upvote/Downvote đánh giá khoản chi cần thiết |
| 📊 Biểu đồ real-time | Pie, Bar, Line charts tự động cập nhật |
| 💾 Lưu trữ local | Dữ liệu được lưu trên browser (LocalStorage) |
| 🎨 Dark mode | Giao diện hiện đại với glassmorphism |
| 📱 Responsive | Tương thích Mobile/Tablet/Desktop |

## 🚀 Cách chạy

### Cách 1: Mở trực tiếp
1. Mở thư mục `student-expense-dashboard`
2. Double-click file `index.html`
3. Ứng dụng sẽ mở trong trình duyệt

### Cách 2: Dùng Live Server
```bash
cd student-expense-dashboard
npx live-server
```

## 📁 Cấu trúc

```
student-expense-dashboard/
├── index.html      # Cấu trúc HTML chính
├── styles.css      # Thiết kế CSS (dark mode, responsive)
├── app.js          # Logic JavaScript (CRUD, charts, voting)
└── README.md       # Tài liệu hướng dẫn
```

## 🎯 Danh mục chi tiêu

| Icon | Danh mục | Icon | Danh mục |
|------|----------|------|----------|
| 📚 | Học tập | 👕 | Quần áo |
| 🍔 | Ăn uống | 💊 | Y tế |
| 🚌 | Di chuyển | 📱 | Công nghệ |
| 🎮 | Giải trí | 🎁 | Khác |

## 🛠️ Công nghệ

- **HTML5** - Cấu trúc
- **CSS3** - Thiết kế (Variables, Flexbox, Grid)
- **JavaScript ES6+** - Logic
- **Chart.js** - Biểu đồ
- **LocalStorage** - Lưu trữ dữ liệu

## 📸 Screenshots

### Dashboard chính
- Thẻ thống kê tổng quan
- Biểu đồ theo danh mục và theo tháng
- Danh sách chi tiêu gần đây

### Tính năng bình chọn
- Cards bình chọn với nút Upvote/Downvote
- Bảng xếp hạng Top khoản chi được bình chọn

## 👨‍💻 Tác giả

Được tạo bởi AI Assistant - 2026

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa
