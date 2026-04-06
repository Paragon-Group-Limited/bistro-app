import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, ChefHat, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { toast } from 'sonner';

export function StaffLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginStaff } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      toast.error('Fill in all fields');
      return;
    }
    setLoading(true);
    const result = await loginStaff(phone, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome! Logged in as ${result.role}`);
      // Route based on role
      if (result.role === 'kitchen') {
        navigate('/kitchen');
      } else {
        navigate('/staff');
      }
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <ChefHat className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Bistro Central</span>
            <span className="text-xs text-muted-foreground ml-1.5 font-mono">staff</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Staff & Kitchen Access</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff Login</CardTitle>
            <CardDescription>Use your staff credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="staff-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880 17XX XXX XXX"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="staff-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            {/* Demo credentials hint */}
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Demo Credentials:</p>
              <p>Admin: <span className="font-mono">01711824478</span></p>
              <p>Kitchen: <span className="font-mono">01712000003</span></p>
              <p>Password: <span className="font-mono">bistro123</span></p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => navigate('/login')}
            className="text-xs text-muted-foreground"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Customer Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
