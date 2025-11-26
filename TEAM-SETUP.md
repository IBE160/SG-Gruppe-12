# 🚨 TEAM: Setup Required After Latest Pull

**Date:** 2025-11-26
**Commit:** `9c7e515` - Critical security and schema fixes
**Time Required:** 10-15 minutes
**Priority:** HIGH - Required before continuing work

---

## ⚠️ ACTION REQUIRED

If you just pulled the latest changes, you **MUST** complete these steps before continuing development:

---

## 📋 **Quick Checklist**

- [ ] **Step 1:** Create your `.env` file (2 min)
- [ ] **Step 2:** Configure environment variables (3 min)
- [ ] **Step 3:** Generate Prisma Client (2 min)
- [ ] **Step 4:** Verify setup works (5 min)

---

## 🔧 **Step-by-Step Instructions**

### **Step 1: Create Your .env File** (2 minutes)

```bash
# Navigate to src directory
cd src

# Copy the example file
cp .env.example .env
```

✅ **Checkpoint:** You should now have a `src/.env` file

---

### **Step 2: Configure Environment Variables** (3 minutes)

Edit `src/.env` with your text editor and set these values:

```bash
# REQUIRED - Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/aicv_db"
# ⚠️ Replace username, password, and database name with YOUR local PostgreSQL credentials

# REQUIRED - Server configuration
PORT=3000
NODE_ENV=development

# REQUIRED - Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3001"

# REQUIRED - JWT Secrets (CHANGE THESE!)
ACCESS_TOKEN_SECRET="your-unique-random-string-at-least-32-chars"
REFRESH_TOKEN_SECRET="another-unique-random-string-at-least-32-chars"

# OPTIONAL - Redis (for token blacklisting)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# OPTIONAL - AI providers (can skip for now, we'll mock AI)
GOOGLE_AI_API_KEY=""
```

#### 🔐 **Generate Random Secrets:**

```bash
# On macOS/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online tool: https://randomkeygen.com/ (Fort Knox Passwords section)
```

✅ **Checkpoint:** Your `.env` file has real values (not placeholders)

---

### **Step 3: Generate Prisma Client** (2 minutes)

```bash
# From project root directory:
cd /path/to/SG-Gruppe-12

# Generate Prisma Client with updated schema (includes CV models)
npx prisma generate --schema=./prisma/schema.prisma
```

**Expected output:**
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

✅ **Checkpoint:** No errors during generation

---

### **Step 4: Verify Setup Works** (5 minutes)

```bash
# Install dependencies (if you haven't already)
cd src
npm install

# Start the development server
npm run dev
```

**Expected output:**
```
Server running on port 3000
Connected to the PostgreSQL database.
```

#### **Test the API:**

```bash
# In a new terminal, test health endpoint:
curl http://localhost:3000/

# Expected response:
# "CV Analyzer API is running..."
```

✅ **Checkpoint:** Server starts without errors

---

## 🆕 **What Changed in This Update?**

### **1. Security Enhancement**
- **Bcrypt salt rounds:** 10 → 12 (OWASP 2024 standard)
- **Impact:** New user passwords are now more secure
- **Action:** None required (backward compatible)

### **2. Database Schema Update**
- **Added models:** `CV` and `CVVersion`
- **Added relations:** `User` → `CV[]` (one-to-many)
- **Impact:** Epic 2 (CV Management) can now be implemented
- **Action:** Run `npx prisma generate` (Step 3 above)

### **3. Environment Documentation**
- **New file:** `src/.env.example`
- **Impact:** Clear documentation of required variables
- **Action:** Create your `src/.env` (Steps 1-2 above)

---

## 🚨 **Troubleshooting**

### Issue: "Error: P1001: Can't reach database server"
**Solution:**
```bash
# Check PostgreSQL is running:
pg_isready

# If not running:
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql
```

### Issue: "Environment variable not found: DATABASE_URL"
**Solution:**
```bash
# Make sure .env file exists:
ls src/.env

# If missing, create it:
cd src && cp .env.example .env
```

### Issue: "Module @prisma/client not found"
**Solution:**
```bash
# Regenerate Prisma Client:
npx prisma generate --schema=./prisma/schema.prisma

# If still failing, reinstall:
cd src && npm install
```

### Issue: "EADDRINUSE: Port 3000 already in use"
**Solution:**
```bash
# Find what's using port 3000:
lsof -i :3000

# Kill that process or change PORT in .env:
PORT=3001
```

---

## 👥 **Team Coordination**

### **Before You Start Working:**

1. ✅ Complete all 4 setup steps above
2. ✅ Verify server starts successfully
3. ✅ Pull latest changes: `git pull origin main`
4. ✅ Check sprint status: `cat docs/sprint-artifacts/sprint-status.yaml`

### **Communication:**

- **Setup issues?** Ask in team chat with error message
- **Database credentials?** Check team shared notes (DO NOT commit to Git!)
- **Working on a story?** Update `sprint-status.yaml` to mark it `in-progress`

---

## 📊 **Current Sprint Status**

**Epic 1 (Platform Foundation):**
- Stories 1.1-1.4: In REVIEW
- **Action needed:** Manual testing today

**Epic 2 (CV Management):**
- Story 2.4: IN PROGRESS
- Stories 2.5-2.8: Ready for development
- **Blocker resolved:** CV models now available in Prisma schema

---

## ⏰ **One-Week Deadline Reminder**

We have **6 days remaining** to complete:
- Epic 1: Finalize and merge
- Epic 2: Complete at least core CV features
- Basic testing
- Demo preparation

**Today's priority:** Get Epic 1 stories tested and merged.

---

## 🆘 **Need Help?**

1. **Check this document first**
2. **Check** `DAY1-PROGRESS.md` for detailed Day 1 plan
3. **Ask in team chat** with specific error messages
4. **Tag the person who made the commit** for urgent issues

---

## ✅ **Setup Complete Confirmation**

Once you've completed all steps, confirm by running:

```bash
# This should work without errors:
cd src && npm run dev

# In another terminal:
curl http://localhost:3000/
```

If both work, you're ready to continue development! 🚀

---

**Last Updated:** 2025-11-26
**Next Team Sync:** End of Day 1
**Document Owner:** Development Team
