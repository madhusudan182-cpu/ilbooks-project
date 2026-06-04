'use client';

import { useState } from 'react';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'forgot-password';
type ResetStep = 'email' | 'otp' | 'new-password';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email.", variant: "destructive" });
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResetStep('otp');
    toast({
      title: "Code Sent!",
      description: `Your 6-digit code is ${code}. (Simulated email)`,
      duration: 10000,
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      setResetStep('new-password');
    } else {
      toast({ title: "Invalid code.", description: "Please check the code and try again.", variant: "destructive" });
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short.", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match.", variant: "destructive" });
      return;
    }
    toast({ title: "Password reset successful!", description: "You can now sign in with your new password." });
    setMode('login');
    setResetStep('email');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (mode === 'forgot-password') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-2" 
                onClick={() => { setMode('login'); setResetStep('email'); }}
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-3xl font-headline">Reset Password</CardTitle>
            <CardDescription>
              {resetStep === 'email' && "Enter your email to receive a reset code."}
              {resetStep === 'otp' && "Enter the 6-digit code sent to your email."}
              {resetStep === 'new-password' && "Enter your new password below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetStep === 'email' && (
              <form onSubmit={handleSendCode} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="youremail@email.com"
                      required
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full font-headline bg-accent text-accent-foreground hover:bg-accent/90">
                  Send Code
                </Button>
              </form>
            )}

            {resetStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="grid gap-4">
                <div className="grid gap-2 text-center">
                  <Label htmlFor="otp">6-Digit Code</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="XXXXXX"
                      required
                      maxLength={6}
                      className="pl-10 text-center tracking-widest font-bold text-xl h-12"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full font-headline bg-accent text-accent-foreground hover:bg-accent/90">
                  Verify Code
                </Button>
                <Button variant="link" size="sm" onClick={handleSendCode}>
                  Resend code
                </Button>
              </form>
            )}

            {resetStep === 'new-password' && (
              <form onSubmit={handleResetPassword} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="new-password" 
                      type={showNewPassword ? 'text' : 'password'} 
                      required 
                      className="pl-10 pr-10 placeholder:text-black placeholder:opacity-100" 
                      placeholder="o o o o o o"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type={showNewPassword ? 'text' : 'password'} 
                    required 
                    className="placeholder:text-black placeholder:opacity-100"
                    placeholder="o o o o o o"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full font-headline bg-accent text-accent-foreground hover:bg-accent/90">
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Sign In</CardTitle>
          <CardDescription>
            Welcome back to ILBooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="ml-auto inline-block text-sm underline hover:text-primary transition-colors"
                  onClick={() => setMode('forgot-password')}
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative">
                <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    className="pr-10 placeholder:text-black placeholder:opacity-100" 
                    placeholder="o o o o o o"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full font-headline bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link href="/dashboard">Sign In</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
