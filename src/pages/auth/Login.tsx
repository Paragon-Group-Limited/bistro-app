import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ApiError } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from './AuthLayout';

export function Login() {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNeedsVerify(false);
    try {
      await login(email.trim(), password);
      navigate(fromPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'email_not_verified') {
          setNeedsVerify(true);
          setError(err.message);
        } else if (err.status === 429) {
          setError('Too many attempts. Please try again in a few minutes.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Could not log in. Check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    setResendStatus('idle');
    try {
      await resendVerification(email.trim());
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to order from Bistro Central</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email}
                onChange={e => setEmail(e.target.value)} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" required value={password}
                onChange={e => setPassword(e.target.value)} disabled={submitting} />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
                {error}
                {needsVerify && (
                  <div className="mt-2">
                    <button type="button" onClick={onResend} className="underline text-foreground">
                      Resend verification email
                    </button>
                    {resendStatus === 'sent' && <span className="ml-2 text-xs">✓ Sent — check your inbox.</span>}
                    {resendStatus === 'error' && <span className="ml-2 text-xs">Could not send. Try again.</span>}
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link to="/signup" className="underline text-foreground">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
