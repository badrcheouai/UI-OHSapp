"use client"
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ActivateAccountPage() {
  const [status, setStatus] = useState<'pending'|'success'|'error'>('pending');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get('code');
  const email = params.get('email');

  useEffect(() => {
    if (!code || !email) {
      setStatus('error');
      setMessage('Activation link is invalid.');
      return;
    }
    const verify = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
        const res = await fetch(`${API_URL}/api/v1/account/verify-activation-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        if (res.ok) {
          setStatus('success');
          setMessage('Your account is now active! You can log in.');
        } else {
          const data = await res.text();
          setStatus('error');
          setMessage(data || 'Activation failed. The code may be invalid or expired.');
        }
      } catch (e) {
        setStatus('error');
        setMessage('Activation failed. Please try again later.');
      }
    };
    verify();
  }, [code, email]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <Link href="/login" className="flex items-center gap-3">
            <div className="h-10 w-10 ohse-gradient-burgundy rounded-xl shadow-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold ohse-text-burgundy">OSHapp</span>
          </Link>
        </div>
        <Card className="ohse-card shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 ohse-text-burgundy" />
            </div>
            <CardTitle className="text-2xl font-bold ohse-text-primary">
              Account Activation
            </CardTitle>
            <p className="text-sm ohse-text-secondary mt-2">
              {status === 'pending' && 'Activating your account...'}
              {status === 'success' && message}
              {status === 'error' && message}
            </p>
          </CardHeader>
          <CardContent>
            {status === 'success' && (
              <Button className="w-full mt-4" onClick={() => router.push('/login')}>Go to Login</Button>
            )}
            {status === 'error' && (
              <Button className="w-full mt-4" onClick={() => router.push('/auth/activation')}>Back to Activation</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
