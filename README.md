# Luận Văn Tốt Nghiệp - Hệ Thống Microservices Gia Đình Việt

## 📝 Giới Thiệu Đề Tài
### Đề Tài: Xây Dựng Nền Tảng Kết Nối Dịch Vụ Giúp Việc Gia Đình Theo Mô Hình Booking Và Job Board

Hệ thống được thiết kế và xây dựng nhằm giải quyết nhu cầu kết nối giữa khách hàng và người giúp việc một cách linh hoạt, hiệu quả và tối ưu hóa thời gian thông qua hai mô hình hoạt động cốt lõi:
1. **Mô hình Booking (Đặt lịch trực tiếp):** Người giúp việc (nhân viên) có thể cập nhật chi tiết hồ sơ năng lực, liệt kê cụ thể các kỹ năng chuyên môn (như nấu ăn, dọn dẹp, chăm sóc trẻ em/người già, làm vườn...) cùng lịch biểu rảnh rỗi. Khách hàng dễ dàng tìm kiếm, lọc theo các tiêu chí kỹ năng và đặt lịch trực tiếp người phù hợp nhất.
2. **Mô hình Job Board (Bảng tin tuyển dụng):** Khi khách hàng tìm kiếm mà không có nhân sự đáp ứng đúng nhu cầu đặc thù, hoặc có yêu cầu riêng biệt về thời gian và công việc, họ có thể đăng tin tuyển dụng (job post). Người giúp việc có thể chủ động duyệt bảng tin để tìm kiếm công việc phù hợp và gửi yêu cầu ứng tuyển.

Dự án áp dụng kiến trúc **Microservices** hiện đại chạy trên nền tảng **Docker**, bao gồm ứng dụng **Frontend (React)** và các dịch vụ **Backend (Laravel PHP)** giao tiếp thông qua **API Gateway**.

---

## 🛠️ Công Nghệ Sử Dụng

### 1. Backend (Laravel Microservices)
* **PHP:** `^8.3`
* **Laravel Framework:** `^13.8`
* **Authentication & Security:** JWT Auth (`tymon/jwt-auth: ^2.3`) để xác thực và phân quyền người dùng giữa các microservices.
* **OAuth 2.0:** Laravel Socialite (`laravel/socialite: ^5.27`) hỗ trợ đăng nhập nhanh bằng tài khoản Google.
* **Google API Integration:** `google/apiclient` để kết nối và sử dụng các dịch vụ của Google.

### 2. Frontend (React Web Application)
* **React & React DOM:** `^19.2.6` (TypeScript `~6.0.2`)
* **Build Tool & Bundler:** Vite `^8.0.12` giúp tối ưu tốc độ phát triển và biên dịch.
* **State Management:** Redux Toolkit (`@reduxjs/toolkit: ^2.11.2` & `react-redux: ^9.2.0`) để quản lý trạng thái toàn cục của ứng dụng.
* **Routing:** React Router DOM `^7.15.0` cho trải nghiệm ứng dụng trang đơn (SPA) mượt mà.
* **Styling & UI:** Tailwind CSS `^4.3.0` & `@tailwindcss/vite` giúp xây dựng giao diện responsive đẹp mắt, linh hoạt.
* **HTTP Client:** Axios `^1.17.0` dùng để gọi API thông qua API Gateway.
* **Form & Validation:** Formik `^2.4.9` kết hợp với Yup `^1.7.1` để quản lý form và kiểm định dữ liệu người dùng nhập vào.
* **UI/UX & Animations:**
  * Swiper `^12.2.0` (Hỗ trợ trình diễn slide/carousel mượt mà)
  * GSAP `^3.15.0` (Thư viện tạo hiệu ứng chuyển động chuyên nghiệp)
  * Iconify React `^6.0.2` (Tích hợp bộ icon phong phú)
* **Google OAuth:** `@react-oauth/google` `^0.13.5` cho đăng nhập Google một chạm.
* **Internationalization:** `i18next` `^26.2.0` & `react-i18next` `^17.0.8` để hỗ trợ đa ngôn ngữ.

### 3. Containerization & DevOps
* **Docker & Docker Compose:** Đóng gói toàn bộ các dịch vụ độc lập giúp môi trường phát triển và triển khai đồng bộ.
* **API Gateway:** Điều hướng yêu cầu (proxy routing) tập trung từ Frontend đến các dịch vụ Backend tương ứng.

---
## Kiến Trúc Hệ Thống

| Tên Dịch Vụ | Vai Trò | Cổng Ngoài (Host) | Cổng Trong (Docker Network) |
| :--- | :--- | :--- | :--- |
| **api-gateway** | Cổng giao tiếp tập trung của hệ thống (Proxy định tuyến) | `8000` | `8000` |
| **identity-service** | Xác thực JWT, quản lý User, sinh OTP quên mật khẩu | `8001` | `8000` |
| **order-service** | Dịch vụ quản lý đơn đặt dịch vụ (Orders) | `8002` | `8000` |
| **payment-service** | Dịch vụ quản lý giao dịch và thanh toán | `8003` | `8000` |
| **provider-service** | Dịch vụ quản lý thợ và nhà cung cấp | `8004` | `8000` |
| **project1_FrontEnd** | Ứng dụng Frontend giao diện người dùng (React + Vite) | `5173` | `5173` |
| **phpmyadmin** | Giao diện quản lý các Cơ sở dữ liệu MySQL | `8080` | `80` |

---

## 🛠️ Yêu Cầu Cài Đặt Ban Đầu

Trước khi chạy dự án, hãy tải và cài đặt các công cụ sau:
1. **Docker Desktop** (Bắt buộc): [Tải tại đây](https://www.docker.com/products/docker-desktop/).
2. **Git** / **GitHub Desktop** (Bắt buộc): [Tải tại đây](https://desktop.github.com/download/).

---
## 📥 Hướng Dẫn Clone & Pull Dự Án Từ GitHub

Nếu bạn muốn tải dự án về máy mới hoặc cập nhật code mới nhất từ GitHub, hãy chạy các lệnh sau trong terminal (windown + tìm kiếm terminal):
### 1. Tải dự án lần đầu tiên (Clone):
```bash
git clone https://github.com/lehungvuong2004/LuanVanTotNghiep.git
cd LuanVanTotNghiep
```
### 2. Cập nhật mã nguồn mới nhất từ GitHub (Pull):
```bash
git pull origin main
```
> **Lưu ý:** Khi chạy `git pull`, nếu có thay đổi trong cấu hình Docker hoặc code của các Service, bạn cần chạy lại lệnh build Docker ở bước dưới.
---
## ⚙️ Thiết Lập Môi Trường (.env) Cho Các Service
Trước khi khởi chạy Docker lần đầu tiên, bạn cần đảm bảo các file cấu hình môi trường `.env` đã được tạo cho từng microservice. 
*(Nếu chưa có, hãy copy từ file `.env.example` có sẵn trong mỗi thư mục).*

Hãy tạo hoặc kiểm tra các file `.env` sau:
1. Thư mục gốc Frontend: `project1_FrontEnd/.env.local`
2. Thư mục `api-gateway/.env`
3. Thư mục `identity-service/.env`
4. Thư mục `order-service/.env`
5. Thư mục `payment-service/.env`
6. Thư mục `provider-service/.env`

---

## 🐋 Hướng Dẫn Chạy & Quản Trị Hệ Thống Bằng Docker

### 1. Tải các Container Image mới nhất từ Docker Hub (nếu có cập nhật image mẫu):
Mở terminal tại thư mục gốc của dự án (thư mục chứa file `docker-compose.yml`) và chạy:
```bash
docker compose pull
```

### 2. Khởi động hệ thống (Tự động build và chạy dịch vụ):
```bash
docker compose up -d --build
```
* **`-d`**: Chạy ngầm các container (không chiếm dụng cửa sổ terminal).
* **`--build`**: Buộc Docker build lại các container từ mã nguồn cục bộ mới nhất.

### 3. Dừng và tắt toàn bộ hệ thống:
```bash
docker compose down
```

### 4. Khởi chạy lại hệ thống sau khi đã tắt (không cần build lại):
```bash
docker compose start
```

### 5. Tạm dừng hệ thống:
```bash
docker compose stop
```

---

## ⚡ Lệnh Rebuild và Đồng Bộ Khi Code Thay Đổi

Khi bạn thay đổi code ở máy cục bộ, các volume trong Docker đã đồng bộ trực tiếp. Tuy nhiên, nếu bạn cập nhật file `.env` hoặc cài đặt thêm thư viện, hãy chạy lệnh rebuild riêng cho service đó để áp dụng:

```bash
# Rebuild riêng API Gateway
docker compose up -d --build api-gateway

# Rebuild riêng Identity Service
docker compose up -d --build identity-service

# Rebuild riêng Frontend
docker compose up -d --build frontend
```

---

## 🔑 Thiết Lập Key & Xóa Cache Cho Các Service Laravel

Khi chạy hệ thống lần đầu tiên trên máy mới, bạn cần khởi tạo App Key cho các service Laravel để đảm bảo bảo mật JWT và mã hóa:

```bash
# Khởi tạo App Key cho Gateway
docker exec lv-gateway php artisan key:generate

# Khởi tạo App Key cho Identity Service
docker exec lv-identity php artisan key:generate
```

Mỗi khi thay đổi cấu hình `.env`, hãy chạy các lệnh sau để xóa bộ nhớ đệm (cache) trong container:
```bash
# Xóa cache cho API Gateway
docker exec lv-gateway php artisan config:clear
docker exec lv-gateway php artisan route:clear

# Xóa cache cho Identity Service
docker exec lv-identity php artisan config:clear
docker exec lv-identity php artisan cache:clear
```

---
## 📧 Hướng Dẫn Cấu Hình Gửi Mail Thật (Gmail SMTP)

Để chức năng **Quên mật khẩu** gửi mã OTP thật về hộp thư Gmail của người dùng:

1. **Tạo Mật khẩu ứng dụng (App Password) trên Google:**
   - Vào tài khoản Google của bạn $\rightarrow$ Bảo mật $\rightarrow$ Xác minh 2 bước (Bật nếu chưa có).
   - Chọn **Mật khẩu ứng dụng**. Tạo mật khẩu mới và copy chuỗi **16 ký tự** được cấp.

2. **Cập nhật file `identity-service/.env`:**
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=email_cua_ban@gmail.com
   MAIL_PASSWORD=chuoi_16_ky_tu_mat_khau_ung_dung_khong_dau_cach
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS="email_cua_ban@gmail.com"
   MAIL_FROM_NAME="Gia Đình Việt"
   ```

3. **Cập nhật cấu hình vào Container:**
   ```bash
   docker exec lv-identity php artisan config:clear
   docker exec lv-identity php artisan cache:clear
   ```

---

## 🌐 Các Đường Dẫn Truy Cập Địa Chỉ Dịch Vụ
* **Giao diện Website:** [http://localhost:5173](http://localhost:5173)
* **Quản trị Database (phpMyAdmin):** [http://localhost:8080](http://localhost:8080)
  * *Tài khoản:* `root` / *Mật khẩu:* Để trống.
* **Cổng API Gateway:** [http://localhost:8000](http://localhost:8000)
