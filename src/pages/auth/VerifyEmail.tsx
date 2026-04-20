import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, ApiError } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from './AuthLayout';

export function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [state, setState] = useState<'pending' | 'success' | 'invalid' | 'error'>('pending');
  // Guard against React StrictMode's double-invoke firing the verify twice
  const calledForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    if (calledForRef.current === token) return;
    calledForRef.current = token;
    (async () => {
      try {
        await verifyEmail(token);
        setState('success');
      } catch (err) {
        if (err instanceof ApiError && err.status === 410) setState('invalid');
        else setState('error');
      }
    })();
  }, [token, verifyEmail]);

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>
            {state === 'pending' && 'Verifying your email…'}
            {state === 'success' && 'Email verified'}
            {state === 'invalid' && 'Link expired or invalid'}
            {state === 'error' && 'Verification failed'}
          </CardTitle>
          <CardDescription>
            {state === 'pending' && 'One moment.'}
            {state === 'success' && 'You can now log in to your account.'}
            {state === 'invalid' && 'Please request a new verification link from the login page.'}
            {state === 'error' && 'Try again, or contact support if it keeps happening.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state === 'success' && (
            <Button onClick={() => navigate('/login')} className="w-full">Go to login</Button>
          )}
          {(state === 'invalid' || state === 'error') && (
            <Button asChild variant="outline" className="w-full"><Link to="/login">Back to login</Link></Button>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
