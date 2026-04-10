import { redirect } from 'next/navigation';

// Auth removed — redirect to dashboard
export default function AuthPage() {
  redirect('/dashboard');
}
