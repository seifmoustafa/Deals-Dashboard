# Role-Based Access Control (RBAC)

This application implements role-based access control to restrict certain pages and features based on admin user roles.

## User Roles

- **`super`** - Super Administrator: Full access to all features including admin management
- **`regular`** - Regular Administrator: Limited access to most features, cannot manage other admins

## Implementation

### 1. RoleGuard Components

The application provides several guard components for protecting routes and features:

#### `RoleGuard`
Generic role guard that accepts an array of allowed roles:
```tsx
<RoleGuard allowedRoles={["super"]}>
  <ProtectedContent />
</RoleGuard>
```

#### `SuperAdminGuard`
Convenience component specifically for super admin access:
```tsx
<SuperAdminGuard>
  <SuperAdminOnlyContent />
</SuperAdminGuard>
```

#### `RegularAdminGuard`
Convenience component for regular admin access (includes super admins):
```tsx
<RegularAdminGuard>
  <RegularAdminContent />
</RegularAdminGuard>
```

### 2. useAdminRole Hook

A custom hook that provides admin role information and utilities:

```tsx
const { admin, isLoading, isSuperAdmin, isRegularAdmin, hasRole, hasAnyRole } = useAdminRole()
```

### 3. Protected Pages

#### Admins Page (`/dashboard/admins`)
- **Access**: Super Admin only
- **Protection**: Uses `SuperAdminGuard` with custom fallback component
- **Fallback**: Shows access denied message for unauthorized users

### 4. Navigation

The sidebar automatically shows/hides navigation items based on user role:
- Admins link only appears for Super Administrators
- Uses `useAdminRole` hook for efficient role checking

### 5. Middleware

The middleware handles basic authentication but delegates role-based access control to client-side components for better user experience.

## Usage Examples

### Protecting a Page Component
```tsx
export default function AdminManagementPage() {
  return (
    <SuperAdminGuard
      fallbackComponent={
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      }
    >
      <AdminManagementContent />
    </SuperAdminGuard>
  )
}
```

### Conditional Rendering in Components
```tsx
function UserActions() {
  const { isSuperAdmin } = useAdminRole()
  
  return (
    <div>
      <button>Edit User</button>
      {isSuperAdmin && <button>Delete User</button>}
    </div>
  )
}
```

### Checking Specific Roles
```tsx
function AdminPanel() {
  const { hasRole } = useAdminRole()
  
  return (
    <div>
      {hasRole("super") && <SuperAdminPanel />}
      {hasRole("regular") && <RegularAdminPanel />}
    </div>
  )
}
```

## Security Notes

- Role checking is performed client-side for better UX
- Server-side validation should be implemented for sensitive operations
- Admin data is stored in localStorage and should be validated on each request
- The middleware provides basic authentication but role validation happens in components

## File Structure

```
core/
├── components/
│   └── auth/
│       └── role-guard.tsx          # Role guard components
├── hooks/
│   └── use-admin-role.ts           # Admin role hook
app/
└── dashboard/
    └── admins/
        └── page.tsx                # Protected admins page
middleware.ts                       # Authentication middleware
```
