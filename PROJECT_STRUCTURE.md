# Project Structure Documentation

## Overview
This document describes the folder structure and organization of the Hafiz Vue.js application, following best practices for maintainability and scalability.

## Root Structure

```
src/
├── assets/           # Static assets (images, styles)
├── components/       # Reusable Vue components
├── composables/      # Vue composition functions
├── config/           # Configuration files and constants
├── layouts/          # Layout components
├── router/           # Vue Router configuration
├── services/         # API services and business logic
├── stores/           # Pinia state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── views/            # Page-level components
```

---

## 📁 Detailed Structure

### `/src/assets/`
Static assets and global styles.

```
assets/
├── img/              # Image files
│   ├── logo.png
│   ├── bgVedio.png
│   └── ...
└── styles/           # Global SCSS files
    ├── _variables.scss    # Design system variables
    ├── _mixins.scss       # SCSS mixins
    └── main.scss          # Main stylesheet entry
```

**Purpose**: Centralized asset management and design system variables.

---

### `/src/components/`
Reusable Vue components organized by purpose.

```
components/
├── common/           # Shared/common components (used across multiple features)
│   ├── AppLogo.vue
│   ├── RegistrationTypeDialog.vue
│   ├── BaseTable.vue          # ✅ Shared base table component
│   ├── BaseFilter.vue          # ✅ Shared filter component
│   ├── DataTable.vue           # ✅ Generic data table (reusable)
│   ├── AttendanceReportTable.vue # ✅ Generic attendance report table (reusable)
│   └── index.ts               # Barrel export
│
├── icons/            # Icon components
│   ├── IconArrowLeft.vue
│   ├── IconArrowRight.vue
│   ├── IconCalendar.vue
│   └── index.ts
│
│
└── ui/               # Base UI components (foundational)
    ├── BaseButton.vue
    ├── BaseInput.vue
    ├── BaseSelect.vue
    ├── BaseDatePicker.vue
    ├── BasePhoneInput.vue
    ├── BaseCheckbox.vue
    ├── NotificationBell.vue
    ├── StatCard.vue
    └── index.ts
```

**Organization Rules**:
- **`common/`**: Components used by multiple features/roles (e.g., BaseTable, BaseFilter, DataTable, AttendanceReportTable, AppLogo)
- **`ui/`**: Foundational UI primitives (buttons, inputs, form controls)
- **`icons/`**: Icon components
- Each folder has an `index.ts` for barrel exports

---

### `/src/composables/`
Vue composition functions (reusable logic).

```
composables/
└── useValidation.ts  # Form validation composable
```

**Purpose**: Extract reusable logic from components.

---

### `/src/config/`
Configuration files and constants.

```
config/
├── api.ts                    # API base URL and version
├── menu.config.ts            # Menu configuration
├── student.constants.ts      # Student-related constants
├── teacher.constants.ts      # Teacher-related constants
└── admin.constants.ts       # Admin-related constants
```

**Purpose**: Centralized configuration and constants management.

---

### `/src/layouts/`
Layout wrapper components.

```
layouts/
├── AuthLayout.vue        # Layout for authentication pages
├── DefaultLayout.vue     # Default public layout
└── TeacherLayout.vue     # Layout for teacher dashboard (with sidebar)
```

**Purpose**: Define page structure and common UI elements (headers, footers, sidebars).

---

### `/src/router/`
Vue Router configuration.

```
router/
└── index.ts             # Route definitions and navigation guards
```

---

### `/src/services/`
API services and business logic.

```
services/
├── api.ts                    # Core API request utility
├── auth.service.ts           # Authentication API calls
├── lookups.service.ts        # Lookup data API calls
├── registration.service.ts   # Registration configuration API
├── teacher.service.ts        # Teacher-specific API calls
├── student.service.ts        # Student-specific API calls
└── admin.service.ts         # Admin-specific API calls
```

**Purpose**: Encapsulate API communication and business logic.

---

### `/src/stores/`
Pinia state management stores.

```
stores/
└── auth.ts              # Authentication state store
```

**Purpose**: Global state management.

---

### `/src/types/`
TypeScript type definitions.

```
types/
└── index.ts            # Shared type definitions
```

---

### `/src/utils/`
Utility functions.

```
utils/
└── errorTranslations.ts    # Error message translations
```

---

### `/src/views/`
Page-level components (routes).

```
views/
├── auth/                    # Authentication pages
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   └── ForgotPasswordView.vue
│
├── teacher/                 # Teacher pages
│   ├── TeacherDashboardView.vue
│   └── TeacherWeeklyReportView.vue
│
├── HomeView.vue             # Landing page
└── DashboardView.vue        # General dashboard
```

**Purpose**: Top-level page components that correspond to routes.

---

## 🎯 Component Organization Principles

### 1. **Separation of Concerns**
- **UI Components** (`ui/`): Pure presentational components with no business logic
- **Common Components** (`common/`): Shared components used across features
- **Feature Components** (`teacher/`, `student/`, etc.): Feature-specific components with business logic

### 2. **Reusability**
- ✅ **BaseTable** and **BaseFilter** are in `common/` because they can be used by any feature
- ✅ **DataTable** and **AttendanceReportTable** are generic reusable components in `common/` that accept data as props
- ✅ UI primitives (`BaseButton`, `BaseInput`) are in `ui/` for maximum reusability

### 3. **Barrel Exports**
Each component folder has an `index.ts` for clean imports:
```typescript
// ✅ Good
import { BaseTable, BaseFilter, DataTable, AttendanceReportTable } from '@/components/common'

// ❌ Avoid
import BaseTable from '@/components/common/BaseTable.vue'
```

### 4. **Naming Conventions**
- **Base components**: Prefix with `Base` (e.g., `BaseTable`, `BaseInput`)
- **Feature components**: Descriptive names (e.g., `StudentsTable`, `WeeklyReportTable`)
- **Icons**: Prefix with `Icon` (e.g., `IconCalendar`, `IconUser`)

---

## 📋 File Naming Conventions

- **Components**: PascalCase (e.g., `BaseTable.vue`, `StudentsTable.vue`)
- **Services**: camelCase with `.service.ts` suffix (e.g., `auth.service.ts`)
- **Stores**: camelCase with `.ts` suffix (e.g., `auth.ts`)
- **Utils**: camelCase with `.ts` suffix (e.g., `errorTranslations.ts`)
- **Config**: camelCase with `.ts` suffix (e.g., `api.ts`, `teacher.constants.ts`)

---

## 🔄 Component Hierarchy Example

```
TeacherDashboardView (view)
  └── DataTable (common component)
      └── BaseTable (common component)
          └── Uses BaseButton, BaseInput (ui components)
```

---

## ✅ Best Practices Checklist

- [x] Shared components (BaseTable, BaseFilter, DataTable, AttendanceReportTable) are in `common/`
- [x] Generic reusable components accept data as props (not tightly coupled to services)
- [x] UI primitives are in `ui/`
- [x] Each folder has an `index.ts` barrel export
- [x] Consistent naming conventions
- [x] Clear separation between shared and feature-specific code
- [x] Services are organized by domain
- [x] Views correspond to routes

---

## 📝 Notes

- **BaseTable** and **BaseFilter** are reusable components that can be used by any feature (teacher, student, admin)
- **DataTable** and **AttendanceReportTable** are generic components that accept data as props, making them reusable across all features
- Views fetch data from services and pass it to generic components, keeping components decoupled from business logic
- This structure allows for easy scaling when adding new features (e.g., `components/student/`, `components/admin/`)
