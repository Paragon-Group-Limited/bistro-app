import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, User, KeyRound, ChefHat, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { toast } from 'sonner';

type Mode = 'login' | 'register' | 'otp';

export function CustomerAuth() {
  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOtp, verifyAndLogin, registerCustomer, isFirebaseMode } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }
    setLoading(true);
    const success = await sendOtp(phone);
    setLoading(false);

    if (success) {
      setMode('otp');
      if (isFirebaseMode) {
        toast.success('OTP sent to your phone!');
      } else {
        toast.info('Demo mode — use any 4-digit code');
      }
    } else {
      toast.error('Failed to send OTP. Check the number and try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      toast.error(isFirebaseMode ? 'Enter the 6-digit code' : 'Enter a 4-digit code');
      return;
    }
    setLoading(true);
    const success = await verifyAndLogin(otp);
    setLoading(false);

    if (success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error('Account not found. Please register first.');
      setMode('register');
      setOtp('');
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Enter your name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }
    setLoading(true);
    const success = await registerCustomer(name, phone);
    setLoading(false);

    if (success) {
      toast.success('Account created! Welcome to Bistro Central.');
      navigate('/');
    } else {
      toast.error('Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Badge variant={isFirebaseMode ? 'default' : 'secondary'} className="text-[10px] gap-1">
          {isFirebaseMode ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isFirebaseMode ? 'Live OTP' : 'Demo Mode'}
        </Badge>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-primary">Bistro Central</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Order delicious food, effortlessly</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Login */}
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Welcome back</CardTitle>
                  <CardDescription>Enter your phone number to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+880 1XX XXXX XXX"
                        className="pl-9"
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendOtp} disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send OTP'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Separator />

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">New here?</p>
                    <Button variant="outline" onClick={() => setMode('register')} className="w-full">
                      Create Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* OTP Verification */}
          {mode === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verify OTP</CardTitle>
                  <CardDescription>
                    Enter the code sent to {phone}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        maxLength={isFirebaseMode ? 6 : 4}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder={isFirebaseMode ? '123456' : '1234'}
                        className="pl-9 text-center text-lg tracking-[0.5em] font-mono"
                        onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                      />
                    </div>
                  </div>
                  <Button onClick={handleVerifyOtp} disabled={loading} className="w-full">
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setMode('login'); setOtp(''); }} className="flex-1 text-sm">
                      Change number
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="flex-1 text-sm"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Register */}
          {mode === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Account</CardTitle>
                  <CardDescription>Join Bistro Central to start ordering</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+880 1XX XXXX XXX"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Button onClick={handleRegister} disabled={loading} className="w-full">
                    {loading ? 'Creating...' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Separator />

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
                    <Button variant="outline" onClick={() => setMode('login')} className="w-full">
                      Login Instead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Staff login link */}
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => navigate('/staff/login')}
            className="text-xs text-muted-foreground"
          >
            <ChefHat className="w-3 h-3 mr-1" />
            Staff Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
