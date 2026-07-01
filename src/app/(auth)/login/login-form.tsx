"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { toast } from "@/hooks/use-toast";

function getRedirectUrl(
  callbackUrl: string,
  session: { user?: { role?: string; tenantSlug?: string | null } } | null
): string {
  if (callbackUrl && callbackUrl !== "/" && !callbackUrl.endsWith("/login")) {
    return callbackUrl;
  }
  const role = session?.user?.role;
  const slug = session?.user?.tenantSlug;
  if (role === "PLATFORM_ADMIN") return "/admin";
  if (slug) return `/t/${slug}/dashboard`;
  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@serviceflow.app", password: "SuperAdminPassword123!" },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Check your credentials and try again.",
          variant: "error",
        });
        return;
      }

      const session = await getSession();
      const redirectTo = getRedirectUrl(callbackUrl, session);
      toast({ title: "Welcome back!", variant: "success" });
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not connect to the server. Is the database running?",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--adm-surface)',
      border: '1px solid var(--adm-border)',
      borderRadius: 'var(--adm-radius-lg)',
      padding: '40px 32px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--adm-accent), var(--adm-accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: 'white',
            margin: '0 auto 16px auto',
            boxShadow: '0 4px 14px var(--adm-accent-glow)'
          }}>
            SF
          </div>
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--adm-text)', margin: '0 0 8px 0' }}>
          Sign in to ServiceFlow
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--adm-text-muted)', margin: 0 }}>
          Manage your platform, bookings, and schedule
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--adm-text-muted)', marginBottom: '8px' }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@business.com"
            {...form.register("email")}
            style={{
              width: '100%', padding: '12px 16px',
              background: 'var(--adm-surface-2)',
              border: `1px solid ${form.formState.errors.email ? 'var(--adm-danger)' : 'var(--adm-border)'}`,
              borderRadius: 'var(--adm-radius-sm)',
              color: 'var(--adm-text)', outline: 'none',
              fontSize: '14px', transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
          />
          {form.formState.errors.email && (
            <p style={{ color: 'var(--adm-danger)', fontSize: '12px', marginTop: '6px' }}>{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--adm-text-muted)', marginBottom: '8px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
              style={{
                width: '100%', padding: '12px 16px', paddingRight: '40px',
                background: 'var(--adm-surface-2)',
                border: `1px solid ${form.formState.errors.password ? 'var(--adm-danger)' : 'var(--adm-border)'}`,
                borderRadius: 'var(--adm-radius-sm)',
                color: 'var(--adm-text)', outline: 'none',
                fontSize: '14px', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--adm-text-muted)',
                cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p style={{ color: 'var(--adm-danger)', fontSize: '12px', marginTop: '6px' }}>{form.formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '14px', marginTop: '8px',
            background: 'linear-gradient(135deg, var(--adm-accent), var(--adm-accent-light))',
            color: 'white', border: 'none', borderRadius: 'var(--adm-radius-sm)',
            fontSize: '14px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 14px var(--adm-accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'opacity 0.2s',
            boxSizing: 'border-box'
          }}
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div style={{
        marginTop: '24px', padding: '16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--adm-border)',
        borderRadius: 'var(--adm-radius-sm)'
      }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--adm-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Test Credentials
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--adm-text)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--adm-text-subtle)' }}>Platform Admin:</span>
            <span style={{ fontFamily: 'monospace' }}>admin@serviceflow.app</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--adm-text-subtle)' }}>Tenant Owner:</span>
            <span style={{ fontFamily: 'monospace' }}>owner@glow-salon.com</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--adm-border)', paddingTop: '8px', marginTop: '4px' }}>
            <span style={{ color: 'var(--adm-text-subtle)' }}>Admin Pass:</span>
            <span style={{ fontFamily: 'monospace' }}>SuperAdminPassword123!</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--adm-text-subtle)' }}>Owner Pass:</span>
            <span style={{ fontFamily: 'monospace' }}>password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
