import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="admin-root" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--adm-bg)',
      color: 'var(--adm-text)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects matching admin panel */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'var(--adm-accent-muted)', filter: 'blur(100px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'var(--adm-accent-muted)', filter: 'blur(120px)', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--adm-text-muted)' }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
