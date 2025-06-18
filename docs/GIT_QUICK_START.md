# Git Quick Start - Hoashop

## 🚀 Bắt Đầu Nhanh

### **1. Thiết Lập Ban Đầu**
```bash
# Chạy script thiết lập (Windows)
.\scripts\setup-git.ps1

# Hoặc chạy script thiết lập (Linux/Mac)
chmod +x scripts/setup-git.sh
./scripts/setup-git.sh
```

### **2. Tạo Tính Năng Mới**
```bash
# Chuyển về develop
git checkout develop
git pull origin develop

# Tạo feature branch
git checkout -b feature/tên-tính-năng

# Phát triển và commit
git add .
git commit -m "feat: mô tả tính năng"

# Push lên remote
git push origin feature/tên-tính-năng
```

### **3. Hoàn Thành Tính Năng**
```bash
# Cập nhật develop
git checkout develop
git pull origin develop

# Merge develop vào feature branch
git checkout feature/tên-tính-năng
git merge develop

# Push và tạo Pull Request
git push origin feature/tên-tính-năng
```

## 📝 Commit Message Examples

```bash
# Tính năng mới
git commit -m "feat(frontend): add shopping cart component"
git commit -m "feat(backend): implement user authentication"

# Sửa lỗi
git commit -m "fix(api): resolve database connection issue"
git commit -m "fix(ui): fix button alignment on mobile"

# Cập nhật tài liệu
git commit -m "docs: update API documentation"
git commit -m "docs: add setup instructions"

# Refactor code
git commit -m "refactor(auth): simplify authentication logic"
git commit -m "refactor(cart): improve cart state management"

# Thêm test
git commit -m "test(cart): add unit tests for cart functionality"
git commit -m "test(api): add integration tests for user endpoints"

# Công việc bảo trì
git commit -m "chore(deps): update dependencies"
git commit -m "chore: update .gitignore"
```

## 🌳 Branch Naming Convention

```bash
# Feature branches
feature/shopping-cart
feature/user-authentication
feature/payment-integration

# Bug fix branches
bugfix/login-error
bugfix/cart-not-updating

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-payment-issue
```

## 🔄 Workflow Commands

### **Kiểm Tra Trạng Thái**
```bash
git status                    # Trạng thái hiện tại
git log --oneline -5         # 5 commit gần nhất
git branch -a                # Tất cả branches
```

### **Quản Lý Branch**
```bash
git checkout develop         # Chuyển về develop
git checkout -b new-branch   # Tạo branch mới
git branch -d old-branch     # Xóa branch
```

### **Commit và Push**
```bash
git add .                    # Thêm tất cả files
git commit -m "message"      # Commit với message
git push origin branch-name  # Push lên remote
```

### **Merge và Rebase**
```bash
git merge feature-branch     # Merge branch
git rebase develop          # Rebase với develop
```

### **Stash (Lưu tạm thời)**
```bash
git stash                   # Lưu changes tạm thời
git stash pop              # Áp dụng stash
git stash list             # Xem danh sách stash
```

## 🚨 Common Issues & Solutions

### **Undo Last Commit**
```bash
git reset --soft HEAD~1     # Giữ changes
git reset --hard HEAD~1     # Xóa changes
```

### **Undo Last Push**
```bash
git revert HEAD             # Tạo commit mới để undo
git reset --hard HEAD~1     # Xóa commit (cẩn thận!)
git push --force            # Force push (cẩn thận!)
```

### **Resolve Merge Conflicts**
```bash
# Khi có conflict
git status                  # Xem files có conflict
# Edit files để resolve conflicts
git add .                   # Thêm files đã resolve
git commit                  # Commit merge
```

### **Recover Deleted Branch**
```bash
git reflog                  # Xem lịch sử
git checkout -b branch-name commit-hash
```

## 📋 Checklist cho Feature Development

### **Trước khi bắt đầu**
- [ ] `git checkout develop`
- [ ] `git pull origin develop`
- [ ] `git checkout -b feature/tên-tính-năng`

### **Trong quá trình phát triển**
- [ ] Commit thường xuyên với message rõ ràng
- [ ] `git push origin feature/tên-tính-năng`
- [ ] Test tính năng thường xuyên

### **Trước khi tạo PR**
- [ ] `git checkout develop && git pull origin develop`
- [ ] `git checkout feature/tên-tính-năng`
- [ ] `git merge develop`
- [ ] Resolve conflicts nếu có
- [ ] Test toàn bộ tính năng
- [ ] `git push origin feature/tên-tính-năng`

### **Sau khi merge**
- [ ] `git checkout develop`
- [ ] `git pull origin develop`
- [ ] `git branch -d feature/tên-tính-năng`
- [ ] `git push origin --delete feature/tên-tính-năng`

## 🎯 Best Practices

### **Commit Messages**
- ✅ `feat(cart): add add-to-cart functionality`
- ❌ `add cart`

### **Branch Names**
- ✅ `feature/shopping-cart`
- ❌ `feature`

### **Frequency**
- ✅ Commit thường xuyên (mỗi 1-2 giờ)
- ❌ Commit một lần khi hoàn thành

### **Testing**
- ✅ Test trước khi commit
- ❌ Commit code broken

## 📚 Tài Liệu Chi Tiết

- [Git Workflow Complete Guide](GIT_WORKFLOW.md)
- [Development Guide](../DEVELOPMENT_GUIDE.md)
- [Feature Suggestions](../FEATURE_SUGGESTIONS.md)

---

**Lưu ý**: Luôn đảm bảo code hoạt động trước khi commit và push! 