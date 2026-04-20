import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ApiError } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from './AuthLayout';

export function Signup() {
  const { signup, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (password.length < 8) { setErrors({ password: 'Must be at least 8 characters' }); return; }
    if (password !== confirm) { setErrors({ confirm: 'Passwords don\'t match' }); return; }

    setSubmitting(true);
    try {
      await signup({ email: email.trim(), password, full_name: fullName.trim(), phone: phone.trim() });
      setSubmittedEmail(email.trim());
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields);
        else if (err.code === 'email_taken') setErrors({ email: err.message });
        else setErrors({ _: err.message });
      } else {
        setErrors({ _: 'Could not create account. Check your connection and try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!submittedEmail) return;
    setResendStatus('idle');
    try { await resendVerification(submittedEmail); setResendStatus('sent'); }
    catch { setResendStatus('error'); }
  };

  if (submittedEmail) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a verification link to <strong>{submittedEmail}</strong>. Click it to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Didn't receive it? It can take a minute.
            </div>
            <Button onClick={onResend} variant="outline" className="w-full">Resend email</Button>
            {resendStatus === 'sent' && <p className="text-sm text-emerald-600">Sent — please check your inbox.</p>}
            {resendStatus === 'error' && <p className="text-sm text-destructive">Could not resend. Try again in a moment.</p>}
            <Button onClick={() => navigate('/login')} variant="default" className="w-full">Go to login</Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>So you can order pickup from Bistro Central</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" required value={fullName} onChange={e => setFullName(e.target.value)} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email}
                onChange={e => setEmail(e.target.value)} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" autoComplete="tel" required value={phone}
                onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" required value={password}
                onChange={e => setPassword(e.target.value)} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" autoComplete="new-password" required value={confirm}
                onChange={e => setConfirm(e.target.value)} />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            </div>

            {errors._ && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
                {errors._}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="underline text-foreground">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
