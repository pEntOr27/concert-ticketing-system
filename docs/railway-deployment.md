# คู่มือการ Deploy โปรเจกต์ขึ้น Railway.app (Railway Deployment Guide - Dockerfile Builder)

เอกสารนี้อธิบายขั้นตอนการอัปโหลดและเปิดใช้งานระบบ **Concert Ticketing System (Next.js 14 + Full-Stack REST API + SQLite + Socket.IO)** ขึ้นบน **Railway.app** โดยใช้ **Dockerfile Builder** มาตรฐานของ Railway (เนื่องจาก Nixpacks ถูก Deprecated เลิกใช้งานแล้ว)

---

## 📋 ภาพรวมระบบบน Railway (System Architecture)

- **Dockerfile Builder**: บน Railway จะเลือกใช้ `Dockerfile` ในการบิลด์แอปพลิเคชันโดยอัตโนมัติ
- **Unified Single Service**: ทั้ง Frontend UI, Backend API Routes และ WebSocket จะรันรวมกันอยู่ใน Next.js Service เดียวกันผ่าน Port `${PORT}`
- **Persistent SQLite Volume**: ข้อมูลฐานข้อมูล SQLite (`dev.db`) จะถูกบันทึกไว้บน **Railway Persistent Volume** ป้องกันข้อมูลสูญหายเมื่อมีการสั่ง Redeploy หรือ Restart
- **Auto DB Migration & Seed**: เมื่อระบบรันครั้งแรก `Dockerfile` จะสั่ง `prisma db push` และสั่ง `db:seed` ข้อมูลเริ่มต้น 6 คอนเสิร์ต, 600 ที่นั่งให้อัตโนมัติ

---

## ⚙️ ขั้นตอนการ Deploy ขึ้น Railway (Step-by-Step Guide)

### ขั้นตอนที่ 1: เตรียมโปรเจกต์และดันโค้ดขึ้น GitHub
1. อัปโหลดซอร์สโค้ดโปรเจกต์นี้ขึ้น GitHub Repository ของคุณ (เช่น `https://github.com/username/concert-ticketing`)

---

### ขั้นตอนที่ 2: สร้างโปรเจกต์ใหม่บน Railway.app
1. ลงชื่อเข้าใช้ที่ [https://railway.app](https://railway.app)
2. กดปุ่ม **"+ New Project"** ➔ เลือก **"Deploy from GitHub repo"**
3. เลือก Repository `concert-ticketing` ที่คุณอัปโหลดไว้
4. ในหน้าต่าง **Builder** ระบบจะเลือกใช้ **Dockerfile** โดยอัตโนมัติตามไฟล์ `railway.json`

---

### ขั้นตอนที่ 3: ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
ไปที่แท็บ **Variables** ใน Railway Service ของคุณ แล้วเพิ่มตัวแปรต่อไปนี้:

| Variable Name | Value (ค่าที่แนะนำ) | คำอธิบาย |
|---|---|---|
| `DATABASE_URL` | `file:/app/prisma/dev.db` | ตำแหน่งจัดเก็บไฟล์ SQLite DB บน Persistent Volume |
| `JWT_SECRET` | `super-secret-jwt-key-production-change-this` | รหัส Secret สำหรับเข้ารหัส JWT Token |
| `SESSION_SECRET` | `super-secret-session-key-production-change-this` | รหัส Secret สำหรับ Session |
| `DEMO_OTP_CODE` | `123456` | รหัสทดสอบ OTP |
| `ENABLE_DEMO_LOGIN` | `true` | เปิดใช้งานปุ่ม Autofill Demo |
| `NODE_ENV` | `production` | โหมดการทำงาน Production |

---

### ขั้นตอนที่ 4: เพิ่ม Persistent Volume สำหรับรักษาข้อมูล SQLite (สำคัญมาก!)
เพื่อไม่ให้ข้อมูลคอนเสิร์ต สมาชิก และการจองหายไปเมื่อโปรเจกต์ถูกรีสตาร์ท:
1. ในหน้า Railway Service ให้กดปุ่ม **"+ New"** ➔ เลือก **"Volume"**
2. ตั้งชื่อ Volume และกำหนด **Mount Path** เป็น:
   ```text
   /app/prisma
   ```
3. ผูก Volume นี้เข้ากับ Next.js Service ของคุณ

---

### ขั้นตอนที่ 5: ตรวจสอบและเปิดใช้งานโดเมน (Generate Domain)
1. ไปที่แท็บ **Settings** ➔ หมวด **Networking / Public Networking**
2. กดปุ่ม **"Generate Domain"** (ระบบจะสร้าง URL สาธารณะให้ เช่น `https://concert-ticketing-production.up.railway.app`)
3. เพิ่มตัวแปรบน Railway Variables:
   - `NEXT_PUBLIC_APP_URL` = `https://<YOUR-RAILWAY-DOMAIN>.up.railway.app`
   - `NEXT_PUBLIC_WS_URL` = `https://<YOUR-RAILWAY-DOMAIN>.up.railway.app`

---

## 🎉 เสร็จสิ้นการ Deploy!

เมื่อ Railway ทำการบิลด์ด้วย Dockerfile เสร็จสมบูรณ์ คุณสามารถเปิดเข้าใช้งานเว็บไซต์ได้ผ่าน URL ของ Railway ทันที
