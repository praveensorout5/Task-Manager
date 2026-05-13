import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import AppShell from '@/components/AppShell';
import './globals.css';

export const metadata = {
  title: 'TaskFlow — Team Task Manager',
  description: 'A premium team task management application with role-based access control, project tracking, and Kanban boards.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
