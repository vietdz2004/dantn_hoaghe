# Git Workflow - Hoashop

## 🎯 Tổng Quan

Tài liệu này mô tả quy trình làm việc với Git cho dự án Hoashop, bao gồm chiến lược nhánh, quy ước commit, và các lệnh Git cơ bản.

## 🌳 Branch Strategy (Chiến lược nhánh)

### **Git Flow Model**
Chúng ta sử dụng **Git Flow** - một mô hình quản lý nhánh phổ biến cho các dự án phát triển phần mềm.

### **Các Nhánh Chính**

#### **1. main (Production)**
- **Mục đích**: Chứa code production, ổn định
- **Nguồn**: Từ `develop` hoặc `hotfix/*`
- **Quy tắc**: 
  - Chỉ merge từ `develop` hoặc `hotfix/*`
  - Mỗi merge phải tạo tag version
  - Không commit trực tiếp

#### **2. develop (Development)**
- **Mục đích**: Tích hợp các tính năng mới
- **Nguồn**: Từ `feature/*` branches
- **Quy tắc**:
  - Luôn sẵn sàng để deploy staging
  - Tích hợp code từ feature branches
  - Merge vào `main` khi release

#### **3. feature/* (Feature Branches)**
- **Mục đích**: Phát triển tính năng mới
- **Nguồn**: Từ `develop`
- **Quy tắc**:
  - Tên: `feature/tên-tính-năng`
  - Merge vào `develop` khi hoàn thành
  - Xóa sau khi merge

#### **4. bugfix/* (Bug Fix Branches)**
- **Mục đích**: Sửa lỗi trong develop
- **Nguồn**: Từ `develop`
- **Quy tắc**:
  - Tên: `bugfix/mô-tả-lỗi`
  - Merge vào `develop` khi sửa xong
  - Xóa sau khi merge

#### **5. hotfix/* (Hotfix Branches)**
- **Mục đích**: Sửa lỗi khẩn cấp trong production
- **Nguồn**: Từ `main`
- **Quy tắc**:
  - Tên: `hotfix/mô-tả-lỗi`
  - Merge vào cả `main` và `develop`
  - Tạo tag version mới

## 📝 Commit Message Convention

### **Format**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types (Loại commit)**
- **feat**: Tính năng mới
- **fix**: Sửa lỗi
- **docs**: Cập nhật tài liệu
- **style**: Thay đổi format code (không ảnh hưởng logic)
- **refactor**: Refactor code
- **test**: Thêm hoặc sửa test
- **chore**: Công việc bảo trì

### **Scope (Phạm vi)**
- **frontend**: Thay đổi frontend
- **backend**: Thay đổi backend
- **database**: Thay đổi database
- **api**: Thay đổi API
- **ui**: Thay đổi giao diện
- **auth**: Thay đổi authentication
- **cart**: Thay đổi shopping cart

### **Ví dụ**
```bash
feat(frontend): add shopping cart component
fix(backend): resolve database connection issue
docs(api): update API documentation
style(ui): improve button styling
refactor(auth): simplify authentication logic
test(cart): add unit tests for cart functionality
chore(deps): update dependencies
```

## 🔄 Workflow Steps (Các bước workflow)

### **1. Bắt Đầu Tính Năng Mới**

```bash
# Chuyển về develop và cập nhật
git checkout develop
git pull origin develop

# Tạo feature branch
git checkout -b feature/shopping-cart

# Bắt đầu phát triển...
```

### **2. Phát Triển Tính Năng**

```bash
# Commit thường xuyên
git add .
git commit -m "feat(cart): add add-to-cart functionality"

# Push branch lên remote
git push origin feature/shopping-cart
```

### **3. Hoàn Thành Tính Năng**

```bash
# Cập nhật develop
git checkout develop
git pull origin develop

# Merge develop vào feature branch
git checkout feature/shopping-cart
git merge develop

# Giải quyết conflicts nếu có
# Test tính năng

# Push lên remote
git push origin feature/shopping-cart
```

### **4. Tạo Pull Request**

1. Vào GitHub/GitLab
2. Tạo Pull Request từ `feature/shopping-cart` vào `develop`
3. Mô tả tính năng trong PR
4. Assign reviewers
5. Chờ review và approval

### **5. Merge và Cleanup**

```bash
# Sau khi PR được approved và merge
git checkout develop
git pull origin develop

# Xóa feature branch
git branch -d feature/shopping-cart
git push origin --delete feature/shopping-cart
```

### **6. Release**

```bash
# Khi sẵn sàng release
git checkout main
git merge develop
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main
git push origin --tags
```

## 🛠️ Git Commands Cơ Bản

### **Khởi Tạo và Cấu Hình**
```bash
# Khởi tạo repository
git init

# Cấu hình user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Thêm remote
git remote add origin <repository-url>
```

### **Kiểm Tra Trạng Thái**
```bash
# Trạng thái hiện tại
git status

# Lịch sử commit
git log --oneline
git log --graph --oneline --all

# Xem các branch
git branch -a
git branch -v
```

### **Quản Lý Branch**
```bash
# Tạo branch mới
git checkout -b new-branch

# Chuyển branch
git checkout branch-name

# Xóa branch
git branch -d branch-name

# Merge branch
git merge branch-name
```

### **Commit và Push**
```bash
# Thêm file vào staging
git add filename
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin branch-name

# Pull
git pull origin branch-name
```

### **Stash (Lưu tạm thời)**
```bash
# Lưu changes tạm thời
git stash

# Xem danh sách stash
git stash list

# Áp dụng stash
git stash pop
git stash apply stash@{0}

# Xóa stash
git stash drop stash@{0}
```

### **Reset và Revert**
```bash
# Reset về commit trước
git reset --soft HEAD~1
git reset --hard HEAD~1

# Revert commit
git revert commit-hash

# Reset file về trạng thái trước
git checkout -- filename
```

### **Merge và Rebase**
```bash
# Merge branch
git merge feature-branch

# Rebase branch
git rebase develop

# Giải quyết conflicts
# Sau khi resolve conflicts
git add .
git rebase --continue
```

## 🔧 Git Configuration

### **Global Configuration**
```bash
# Cấu hình user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Cấu hình editor
git config --global core.editor "code --wait"

# Cấu hình default branch
git config --global init.defaultBranch main

# Cấu hình line endings
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # Linux/Mac
```

### **Repository Configuration**
```bash
# Cấu hình cho repository cụ thể
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## 🚨 Best Practices (Thực hành tốt nhất)

### **Commit Practices**
- **Commit thường xuyên**: Mỗi commit nên là một thay đổi logic hoàn chỉnh
- **Commit message rõ ràng**: Mô tả chính xác những gì đã thay đổi
- **Không commit broken code**: Đảm bảo code hoạt động trước khi commit
- **Sử dụng conventional commits**: Tuân thủ quy ước commit message

### **Branch Practices**
- **Tạo branch cho mỗi tính năng**: Không làm việc trực tiếp trên main/develop
- **Đặt tên branch có ý nghĩa**: Dễ hiểu mục đích của branch
- **Xóa branch sau khi merge**: Giữ repository sạch sẽ
- **Không force push**: Tránh mất code của người khác

### **Merge Practices**
- **Squash commits**: Gộp nhiều commit thành một khi merge
- **Review code**: Luôn review trước khi merge
- **Test sau merge**: Đảm bảo code hoạt động sau khi merge
- **Resolve conflicts cẩn thận**: Kiểm tra kỹ khi giải quyết conflicts

### **Security Practices**
- **Không commit sensitive data**: Mật khẩu, API keys, etc.
- **Sử dụng .gitignore**: Loại trừ file không cần thiết
- **Review code**: Kiểm tra code trước khi merge
- **Backup repository**: Sao lưu repository thường xuyên

## 📋 Checklist cho Feature Development

### **Trước khi bắt đầu**
- [ ] Cập nhật develop branch
- [ ] Tạo feature branch từ develop
- [ ] Đặt tên branch theo convention

### **Trong quá trình phát triển**
- [ ] Commit thường xuyên với message rõ ràng
- [ ] Push branch lên remote
- [ ] Test tính năng thường xuyên
- [ ] Cập nhật develop nếu cần

### **Trước khi tạo PR**
- [ ] Test toàn bộ tính năng
- [ ] Code review tự
- [ ] Cập nhật documentation nếu cần
- [ ] Đảm bảo không có conflicts

### **Sau khi merge**
- [ ] Xóa feature branch
- [ ] Test trên develop
- [ ] Cập nhật documentation
- [ ] Deploy staging nếu cần

## 🚀 Advanced Git Features

### **Git Hooks**
```bash
# Pre-commit hook để check code
# .git/hooks/pre-commit
#!/bin/sh
npm run lint
npm run test
```

### **Git Aliases**
```bash
# Thêm vào .gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --all
    unstage = reset HEAD --
    last = log -1 HEAD
```

### **Git Submodules**
```bash
# Thêm submodule
git submodule add <repository-url> <path>

# Cập nhật submodule
git submodule update --remote
```

## 📚 Tài Liệu Tham Khảo

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)

---

**Ngày cập nhật:** $(date)  
**Phiên bản:** 1.0.0  
**Tác giả:** Development Team 