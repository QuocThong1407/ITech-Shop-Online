# 🛒 ITech Shop Online

> **Web app** — chạy trên **Chrome / Firefox**, deploy trên **Vercel**

Nền tảng thương mại điện tử full-stack xây dựng với Node.js/Express (backend) + Supabase (database & auth), hỗ trợ 3 vai trò: Customer, Seller, Admin.

🔗 **Repository:** [https://github.com/QuocThong1407/ITech-Shop-Online](https://github.com/QuocThong1407/ITech-Shop-Online)

---

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt & Chạy local](#-cài-đặt--chạy-local)
- [Biến môi trường](#-biến-môi-trường)
- [API Endpoints](#-api-endpoints)
- [Deploy lên Vercel](#-deploy-lên-vercel)

---

## ✨ Tính năng

**Customer**
- Đăng ký / đăng nhập (email + OAuth)
- Duyệt sản phẩm, thêm vào giỏ hàng
- Đặt hàng, theo dõi trạng thái đơn hàng
- Đánh giá sản phẩm sau khi mua
- Membership tự động nâng hạng (Bronze → Silver → Gold)

**Seller**
- Quản lý sản phẩm & biến thể (màu sắc, size, v.v.)
- Xem đơn hàng liên quan đến sản phẩm của mình

**Admin**
- Quản lý toàn bộ users (CRUD)
- Quản lý danh mục, khuyến mãi, coupon
- Xem báo cáo & thống kê
- Duyệt yêu cầu huỷ đơn / trả hàng

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|---|---|
| Backend | Node.js, Express.js |
| Database | PostgreSQL (qua Supabase) |
| Auth | Supabase Auth (JWT + OAuth) |
| ORM / Query | Supabase JS Client |
| Security | Helmet, CORS, bcrypt |
| Deploy | Vercel (serverless) |

---

## 📁 Cấu trúc dự án

```
backend/
├── src/
│   ├── app.js                  # Express app setup
│   ├── index.js                # Entry point
│   ├── configs/
│   │   └── supabase.js         # Supabase client (anon + admin)
│   ├── features/
│   │   ├── auth/               # authRoutes, authController, authService
│   │   └── user/               # userRoutes, userController, userService
│   ├── middleware/
│   │   ├── authenticate.js     # Xác thực JWT qua Supabase
│   │   ├── checkRole.js        # Phân quyền theo role
│   │   ├── errorHandler.js     # Global error handler
│   │   └── index.js
│   └── utils/
│       └── responseHelpers.js  # successResponse / errorResponse
├── .env                        # Biến môi trường (không commit)
├── .env.example                # Template biến môi trường
└── package.json
```

---

## 🚀 Cài đặt & Chạy local

### Yêu cầu

- **Node.js** >= 18.x
- **npm** >= 9.x
- Tài khoản [Supabase](https://supabase.com) (miễn phí)

### Bước 1 — Clone repository

```bash
git clone https://github.com/QuocThong1407/ITech-Shop-Online.git
cd ITech-Shop-Online/backend
```

### Bước 2 — Cài dependencies

```bash
npm install
```

### Bước 3 — Tạo file `.env`

```bash
cp .env.example .env
```

Điền các giá trị vào `.env` (xem phần [Biến môi trường](#-biến-môi-trường) bên dưới).

### Bước 4 — Chạy development server

```bash
npm run dev
```

Server khởi động tại: `http://localhost:5000`

Kiểm tra health check:
```bash
curl http://localhost:5000/health
# → { "status": "OK", "message": "Server is running" }
```

### Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy với nodemon (auto-reload) |
| `npm start` | Chạy production |

---

## 🚀 Cài đặt Frontend

- cd ITech-Shop-Online/frontend
- npm install
- cp .env.example .env   # điền VITE_API_URL=http://localhost:5000
- npm run dev
# → http://localhost:5173

---

## 🔑 Biến môi trường

Tạo file `.env` ở thư mục `backend/` với nội dung sau:

```env
# ==============================
# SERVER
# ==============================
PORT=5000
NODE_ENV=development

# ==============================
# FRONTEND (CORS)
# ==============================
FRONTEND_URL=http://localhost:3000

# ==============================
# SUPABASE
# ==============================
# Lấy từ: Supabase Dashboard → Project Settings → API

# Project URL
SUPABASE_URL=https://your-project-id.supabase.co

# anon/public key (dùng cho client thông thường)
SUPABASE_ANON_KEY=your-anon-key-here

# service_role key (dùng cho admin operations — KHÔNG public)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Lấy Supabase keys

1. Đăng nhập [supabase.com](https://supabase.com) → chọn project của bạn
2. Vào **Project Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Lưu ý bảo mật:** `SUPABASE_SERVICE_ROLE_KEY` có quyền bypass RLS (Row Level Security). Không bao giờ expose key này ra frontend hoặc commit lên Git.

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/refresh` | Làm mới access token |

### Users — `/api/users`

> Các route `/:id` yêu cầu role **ADMIN**

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/users/me` | ✅ User | Lấy thông tin bản thân |
| PATCH | `/api/users/me` | ✅ User | Cập nhật profile |
| GET | `/api/users` | 🔒 Admin | Danh sách users (phân trang, lọc) |
| GET | `/api/users/stats` | 🔒 Admin | Thống kê users |
| GET | `/api/users/:id` | 🔒 Admin | Chi tiết một user |
| POST | `/api/users` | 🔒 Admin | Tạo user mới |
| PUT | `/api/users/:id` | 🔒 Admin | Cập nhật user |
| DELETE | `/api/users/:id` | 🔒 Admin | Xoá user |

### Query Parameters — GET `/api/users`

```
?page=1&limit=10&role=CUSTOMER&search=john
```

---

## ☁️ Deploy lên Vercel

### Bước 1 — Tạo `vercel.json` ở thư mục backend

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

### Bước 2 — Push code lên GitHub

```bash
git add .
git commit -m "chore: add vercel config"
git push origin main
```

### Bước 3 — Import project trên Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New Project**
2. Import từ GitHub repository `ITech-Shop-Online`
3. Chọn **Root Directory** là `backend/`
4. Trong **Environment Variables**, thêm tất cả các biến từ file `.env`:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL frontend đã deploy |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |

5. Nhấn **Deploy** ✅

### Bước 4 — Cập nhật FRONTEND_URL sau khi deploy

Sau khi deploy xong, lấy URL backend từ Vercel và cập nhật `FRONTEND_URL` trong Environment Variables để CORS hoạt động đúng.

---

## 🗄 Database Schema (tóm tắt)

Dự án sử dụng PostgreSQL trên Supabase với các bảng chính:

```
User ──┬── Customer ── Cart, Membership, Address
       ├── Seller ── Product ── ProductVariant
       └── Admin ── Promotion (Coupon, ClearanceEvent)

Order ── OrderItem ── Review
      └── Payment, Cancellation, Return
```

File schema đầy đủ: [`web.txt`](./web.txt)

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m "feat: mô tả thay đổi"`
4. Push: `git push origin feature/ten-tinh-nang`
5. Mở Pull Request

---

## 📄 License

MIT © [QuocThong1407](https://github.com/QuocThong1407)
