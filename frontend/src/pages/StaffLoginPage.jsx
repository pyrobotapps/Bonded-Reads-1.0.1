import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BookHeart, Eye, EyeOff, Shield, Crown } from 'lucide-react';

function StaffLoginPage() {
  var navigate = useNavigate();
  var auth = useAuth();
  var login = auth.login;
  var staffRegister = auth.staffRegister;
  var ownerRegister = auth.ownerRegister;
  
  var [loginEmail, setLoginEmail] = useState('');
  var [loginPassword, setLoginPassword] = useState('');
  var [username, setUsername] = useState('');
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [staffCode, setStaffCode] = useState('');
  var [registerType, setRegisterType] = useState('staff');
  var [showPassword, setShowPassword] = useState(false);
  var [loading, setLoading] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    login(loginEmail, loginPassword)
      .then(function(user) {
        if (!user.is_staff && !user.is_owner) {
          toast.error('This account does not have staff access');
          return;
        }
        toast.success('Welcome back' + (user.is_owner ? ', Owner!' : ', Staff!'));
        navigate('/admin');
      })
      .catch(function(error) {
        var message = error.response && error.response.data && error.response.data.detail;
        toast.error(message || 'Login failed');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  function handleRegister(e) {
    e.preventDefault();
    if (!username || !email || !password || !staffCode) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    var registerFn = registerType === 'owner' ? ownerRegister : staffRegister;
    registerFn(username, email, password, staffCode)
      .then(function() {
        toast.success(registerType === 'owner' ? 'Owner account created!' : 'Staff account created!');
        navigate('/admin');
      })
      .catch(function(error) {
        var message = error.response && error.response.data && error.response.data.detail;
        toast.error(message || 'Registration failed');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" data-testid="staff-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold font-['Nunito']">
            <BookHeart className="h-8 w-8 text-primary" />
            BL Checklist
          </Link>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Staff Portal</span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl mb-6">
            <TabsTrigger value="login" className="rounded-lg" data-testid="staff-login-tab">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg" data-testid="staff-register-tab">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-5 bg-card border border-border rounded-2xl p-8">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="staff@blchecklist.com"
                  value={loginEmail}
                  onChange={function(e) { setLoginEmail(e.target.value); }}
                  className="rounded-xl"
                  data-testid="staff-login-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={function(e) { setLoginPassword(e.target.value); }}
                    className="rounded-xl pr-10"
                    data-testid="staff-login-password"
                  />
                  <button
                    type="button"
                    onClick={function() { setShowPassword(!showPassword); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={loading}
                data-testid="staff-login-submit"
              >
                {loading ? 'Signing in...' : 'Staff Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 bg-card border border-border rounded-2xl p-8">
              {/* Register Type Selection */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={registerType === 'staff' ? 'default' : 'outline'}
                  className="flex-1 rounded-xl gap-2"
                  onClick={function() { setRegisterType('staff'); setStaffCode(''); }}
                >
                  <Shield className="h-4 w-4" />
                  Staff
                </Button>
                <Button
                  type="button"
                  variant={registerType === 'owner' ? 'default' : 'outline'}
                  className="flex-1 rounded-xl gap-2"
                  onClick={function() { setRegisterType('owner'); setStaffCode(''); }}
                >
                  <Crown className="h-4 w-4" />
                  Owner
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="staffname"
                  value={username}
                  onChange={function(e) { setUsername(e.target.value); }}
                  className="rounded-xl"
                  data-testid="staff-register-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@blchecklist.com"
                  value={email}
                  onChange={function(e) { setEmail(e.target.value); }}
                  className="rounded-xl"
                  data-testid="staff-register-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={function(e) { setPassword(e.target.value); }}
                    className="rounded-xl pr-10"
                    data-testid="staff-register-password"
                  />
                  <button
                    type="button"
                    onClick={function() { setShowPassword(!showPassword); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffCode">{registerType === 'owner' ? 'Owner Code' : 'Staff Code'}</Label>
                <Input
                  id="staffCode"
                  type="text"
                  placeholder={registerType === 'owner' ? 'Enter owner code' : 'Enter staff code'}
                  value={staffCode}
                  onChange={function(e) { setStaffCode(e.target.value); }}
                  className="rounded-xl"
                  data-testid="staff-register-code"
                />
                <p className="text-xs text-muted-foreground">
                  {registerType === 'owner' 
                    ? 'Owner code gives full control over the site' 
                    : 'Staff can add/update/delete books only'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={loading}
                data-testid="staff-register-submit"
              >
                {loading ? 'Creating account...' : (registerType === 'owner' ? 'Create Owner Account' : 'Create Staff Account')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-center mt-6 text-muted-foreground">
          <Link to="/login" className="hover:underline" data-testid="user-login-link">
            Back to User Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default StaffLoginPage;
