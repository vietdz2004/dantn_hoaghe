# 🗄️ Hướng dẫn Import Database

## 📋 **YÊU CẦU**
- MySQL Server đã cài đặt và đang chạy
- phpMyAdmin hoặc MySQL Workbench

## 🛠️ **CÁCH 1: Sử dụng phpMyAdmin**

1. **Mở phpMyAdmin**: `http://localhost/phpmyadmin`
2. **Tạo database mới**:
   - Click "New" bên trái
   - Tên database: `hoanghe`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. **Import file SQL**:
   - Vào database `hoanghe` vừa tạo
   - Click tab "Import"
   - Choose file: `backend/data/hoanghe.sql`
   - Click "Go"

## 🛠️ **CÁCH 2: Sử dụng Command Line**

Mở Command Prompt/Terminal và chạy:

```bash
# Tạo database
mysql -u root -p -e "CREATE DATABASE hoanghe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import file SQL
mysql -u root -p hoanghe < backend/data/hoanghe.sql
```

## 🛠️ **CÁCH 3: Sử dụng MySQL Workbench**

1. Mở MySQL Workbench
2. Connect tới MySQL Server
3. **Tạo database**: `CREATE DATABASE hoanghe;`
4. **Import file**: 
   - Server → Data Import
   - Import from Self-Contained File
   - Chọn file: `backend/data/hoanghe.sql`
   - Default Target Schema: `hoanghe`
   - Start Import

## ✅ **KIỂM TRA**

Sau khi import xong, kiểm tra:

```sql
USE hoanghe;
SHOW TABLES;
SELECT COUNT(*) FROM danhmuc;
SELECT COUNT(*) FROM sanpham;
```

Kết quả mong đợi:
- ✅ 10+ tables được tạo
- ✅ 7 danh mục
- ✅ 9 sản phẩm mẫu

## 🔧 **TROUBLESHOOTING**

### Lỗi Access Denied:
```bash
# Cập nhật password trong backend/config.env
DB_PASSWORD=your_mysql_password
```

### Lỗi Connection:
```bash
# Kiểm tra MySQL đang chạy
services.msc → MySQL → Start
```

### Lỗi Import:
- Đảm bảo file encoding là UTF-8
- Tăng `max_allowed_packet` trong MySQL config 