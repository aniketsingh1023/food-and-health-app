'use client';

// Auth removed — passthrough wrapper kept for build compatibility
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
