# Ha Long Booking - Quản lý Căn hộ Du lịch

Dự án Web App quản lý booking căn hộ du lịch tại Hạ Long, hỗ trợ nhiều cộng tác viên, quản lý realtime bằng Next.js 15, Supabase, và TailwindCSS.

## Các tính năng chính

* **Quản lý lịch phòng Realtime:** Lịch xem dạng tháng/tuần/ngày, hiển thị trạng thái Trống/Đang Giữ/Đã Đặt.
* **Tự động phòng chống double-booking:** Kiểm tra xung đột ở cấp độ cơ sở dữ liệu (PostgreSQL constraints).
* **Phân quyền người dùng:** Admin và Cộng tác viên (Collaborator).
* **UI/UX hiện đại:** Sử dụng `shadcn/ui`, Dark Mode, Reponsive Mobile.
* **Form Validation:** Sử dụng `zod` và `react-hook-form` để validate dữ liệu chính xác.
* **API/Database:** Dùng Supabase (Auth, PostgreSQL DB, Realtime).

## Stack công nghệ

* **Framework:** Next.js 16 (App Router)
* **Ngôn ngữ:** TypeScript
* **UI Library:** Tailwind CSS v4, shadcn/ui
* **Calendar:** react-big-calendar
* **State Management:** Zustand
* **Database & Auth:** Supabase (@supabase/ssr)

---

## Hướng dẫn cài đặt (Local)

1. **Clone repository và cài đặt dependencies**

   ```bash
   npm install
   ```

2. **Cấu hình Supabase**
   - Đăng nhập vào [Supabase](https://supabase.com) và tạo một Project mới.
   - Truy cập vào Project Settings > API để lấy URL và ANON KEY.
   - Đổi tên file `.env.example` thành `.env.local` và điền thông tin:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

3. **Cài đặt Database Schema**
   - Mở Supabase SQL Editor.
   - Copy toàn bộ nội dung trong file `supabase/schema.sql`.
   - Dán vào SQL Editor và nhấn Run để tạo các bảng, policies (RLS), và trigger.

4. **Tạo tài khoản Admin đầu tiên**
   - Truy cập trang Supabase Authentication > Users > Add User.
   - Tạo một tài khoản bằng email và mật khẩu của bạn.
   - Quay lại Supabase Table Editor, mở bảng `profiles`.
   - Tìm tài khoản bạn vừa tạo, chuyển cột `role` từ `collaborator` thành `admin`.

5. **Chạy ứng dụng**

   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:3000`.

---

## Hướng dẫn Deploy lên Vercel

1. **Push code lên GitHub**
2. Đăng nhập [Vercel](https://vercel.com), chọn Add New Project.
3. Import repository GitHub.
4. Trong mục **Environment Variables**, thêm 2 biến từ Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Nhấn **Deploy**.

*Lưu ý: Nếu không thêm environment variables, bước build sẽ bị lỗi vì ứng dụng cần connect tới Supabase để prerender.*
