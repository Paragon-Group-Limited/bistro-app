import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

/**
 * Shared frame for every auth page (Login, Signup, Verify, Forgot, Reset).
 * Branded header + theme toggle so the auth screens visually belong to the same app
 * as the customer menu/orders/profile pages.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-primary">Bistro Central</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Order delicious food, effortlessly</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
