import { ArrowLeft, LogOut, User, Phone, Calendar, ShoppingBag, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function ProfilePage() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!customer) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Profile</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {customer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <p className="text-sm text-muted-foreground font-mono">{customer.phone}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="pt-4 pb-3 px-3 text-center">
                <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold font-mono">{customer.totalOrders}</p>
                <p className="text-[10px] text-muted-foreground">Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-3 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold font-mono">৳{customer.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total Spent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-3 text-center">
                <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold font-mono">
                  {new Date(customer.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-[10px] text-muted-foreground">Joined</p>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{customer.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium font-mono">{customer.phone}</p>
                </div>
              </div>
              {customer.email && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{customer.email}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Logout */}
          <motion.div whileTap={{ scale: 0.97 }} className="mt-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
