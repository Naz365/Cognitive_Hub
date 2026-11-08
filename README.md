# Cognitive Hub (3-Desk Micro-Studio Platform)

An exclusive 3-workstation micro-studio learning platform for:
- **Cambridge IGCSE Computer Science (0478)**
- **Cambridge International AS & A Level Computer Science (9618)**
- **Pearson Edexcel International GCSE Computer Science (4CP0)**
- **Pearson Edexcel International GCSE ICT (4IT1)**

---

## Non-Negotiable Core Invariants

1. **Strict 3-Desk Limit**: Every batch contains exactly 3 workstations (`Desk 01`, `Desk 02`, `Desk 03`). Double-booking and overbooking are strictly prevented via concurrency locking.
2. **24-Hour Hold Lease**: Prospective students reserve an available desk with a 24-hour temporary hold. Unverified holds automatically expire and return to `Available` or promote the waitlist.
3. **< 60s Fast-Track Mobile QR Route**: Dedicated mobile route (`/qr`) allowing instant reservation from flyer/poster scans in under 60 seconds.
4. **Dual-Mode Payments & Receipts**: Automated MFS / manual bKash & Nagad TrxID submission with teacher 1-tap ledger verification, issuing tamper-evident PDF receipts with scannable QR verification.
5. **Mark-Scheme AI Keyword Scanner**: Real-time evaluation of written answers against board rubric keywords, highlighting matches in **Green** and missed points in **Amber**.
6. **Watermarked In-Browser Reader**: Digital library stamping student name and Admission ID (`CH-2026-XXXX`) on every document page with anti-copy protection.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **State & DB**: In-Memory Concurrency Singleton + JSON Storage Persistence + Atomic RPCs
- **Document & QR Generation**: `jspdf`, `qrcode`, `canvas-confetti`
- **Testing**: Built-in test runner (`node --test`) covering seat concurrency and capacity invariants

---

## Application Routes

- `/` — High-converting studio landing page with live 3-desk telemetry
- `/qr` — Flyer/poster fast-track reservation route (< 60s)
- `/admissions` — 4-Step admission wizard with interactive SVG 3-desk map & 3-minute diagnostic
- `/portal` — Student dashboard, workstation status, unit-by-unit syllabus mastery tracker, lab file dropzone
- `/library` — Digital book corner with 4 board shelves (0478, 9618, 4CP0, 4IT1) & watermarked reader
- `/quiz` — Timed quiz engine with board mark-scheme keyword scanner & printable mistake logbook
- `/admin` — Teacher command center: 3-desk live grid, 1-tap TrxID verification, priority waitlist
- `/verify/[receiptId]` — Public cryptographic scan verification for issued receipts

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Invariant Tests
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Production Build
```bash
npm run build
```

---

## License & Studio Policy
Copyright &copy; 2026 Cognitive Hub Micro-Studio. All rights reserved.
