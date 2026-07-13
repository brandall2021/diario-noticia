# Task 5 Fix: Replace Tags CRUD with Users & Comments Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the erroneously-created Tags pages and create the required Users DataTable and Comments moderation pages.

**Architecture:** Keep existing Categories pages untouched. Delete 3 Tags page files. Create 2 new pages (usuarios, comentarios) following existing patterns (DataTable, api client, types). Minor type extensions needed for `User.isActive` and `Comment.article`.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, lucide-react icons

## Global Constraints

- Follow existing code patterns (see `categorias/page.tsx`, `DataTable.tsx`, `api.ts`)
- Use `api.request()` for custom endpoints, existing typed methods where available
- Spanish UI labels throughout
- No new dependencies

## File Structure

- Delete: `apps/admin/src/app/(admin)/etiquetas/page.tsx`
- Delete: `apps/admin/src/app/(admin)/etiquetas/nueva/page.tsx`
- Delete: `apps/admin/src/app/(admin)/etiquetas/[id]/editar/page.tsx`
- Modify: `apps/admin/src/lib/types.ts` — add `isActive` to User, add `article` to Comment
- Create: `apps/admin/src/app/(admin)/usuarios/page.tsx`
- Create: `apps/admin/src/app/(admin)/comentarios/page.tsx`
- No sidebar changes needed — `/usuarios` and `/comentarios` links already exist

---

### Task 1: Extend Types

**Files:**
- Modify: `apps/admin/src/lib/types.ts:1-8, 66-78`

**Steps:**

- [ ] **Step 1: Add `isActive` to User interface**

```ts
// Add after line 7 (after avatar?: string;)
isActive: boolean;
```

- [ ] **Step 2: Add `article` reference to Comment interface**

```ts
// Add after line 73 (after guestEmail?: string;)
article?: { id: string; title: string; slug: string };
```

---

### Task 2: Create Users Page

**Files:**
- Create: `apps/admin/src/app/(admin)/usuarios/page.tsx`

**Steps:**

- [ ] **Step 1: Create usuarios/page.tsx**

DataTable with columns: Name (avatar + firstName + lastName), Email, Role badge, Status (Activo/Inactivo), Actions (toggle active/inactive). Uses `api.getUsers()` and `api.request()` for PATCH toggle.

---

### Task 3: Create Comments Moderation Page

**Files:**
- Create: `apps/admin/src/app/(admin)/comentarios/page.tsx`

**Steps:**

- [ ] **Step 1: Create comentarios/page.tsx**

Status filter tabs (Todos, Pendiente, Aprobado, Rechazado, Spam). Card-based layout showing author, content, date, article title, status badge. Moderate actions: approve, reject, spam buttons. Uses `api.getComments()` and `api.updateCommentStatus()`.

---

### Task 4: Remove Tags Pages

**Files:**
- Delete: `apps/admin/src/app/(admin)/etiquetas/page.tsx`
- Delete: `apps/admin/src/app/(admin)/etiquetas/nueva/page.tsx`
- Delete: `apps/admin/src/app/(admin)/etiquetas/[id]/editar/page.tsx`

**Steps:**

- [ ] **Step 1: Remove etiquetas directory tree**

```bash
rm -rf apps/admin/src/app/(admin)/etiquetas
```

---

### Task 5: Verify & Commit

**Steps:**

- [ ] **Step 1: Run typecheck**

```bash
cd apps/admin && npx tsc --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/app/\(admin\)/usuarios apps/admin/src/app/\(admin\)/comentarios apps/admin/src/app/\(admin\)/etiquetas apps/admin/src/lib/types.ts
git commit -m "feat(admin): replace tags CRUD with users and comments management"
```
