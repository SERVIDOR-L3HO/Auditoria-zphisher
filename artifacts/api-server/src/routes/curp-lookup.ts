import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ESTADO_NAMES: Record<string, string> = {
  AS: "Aguascalientes", BC: "Baja California", BS: "Baja California Sur",
  CC: "Campeche", CS: "Chiapas", CH: "Chihuahua", DF: "Ciudad de México",
  CL: "Coahuila de Zaragoza", CM: "Colima", DG: "Durango", MC: "México",
  GT: "Guanajuato", GR: "Guerrero", HG: "Hidalgo", JC: "Jalisco",
  MN: "Michoacán de Ocampo", MS: "Morelos", NT: "Nayarit", NL: "Nuevo León",
  OC: "Oaxaca", PL: "Puebla", QT: "Querétaro", QR: "Quintana Roo",
  SP: "San Luis Potosí", SL: "Sinaloa", SR: "Sonora", TC: "Tabasco",
  TS: "Tamaulipas", TL: "Tlaxcala", VZ: "Veracruz de Ignacio de la Llave",
  YN: "Yucatán", ZS: "Zacatecas", NE: "Nacido en el Extranjero",
};

const ENTIDAD_CODES: Record<string, string> = {
  "Aguascalientes": "AS", "Baja California": "BC", "Baja California Sur": "BS",
  "Campeche": "CC", "Chiapas": "CS", "Chihuahua": "CH", "Ciudad de México": "DF",
  "Coahuila": "CL", "Colima": "CM", "Durango": "DG", "Estado de México": "MC",
  "Guanajuato": "GT", "Guerrero": "GR", "Hidalgo": "HG", "Jalisco": "JC",
  "Michoacán": "MN", "Morelos": "MS", "Nayarit": "NT", "Nuevo León": "NL",
  "Oaxaca": "OC", "Puebla": "PL", "Querétaro": "QT", "Quintana Roo": "QR",
  "San Luis Potosí": "SP", "Sinaloa": "SL", "Sonora": "SR", "Tabasco": "TC",
  "Tamaulipas": "TS", "Tlaxcala": "TL", "Veracruz": "VZ", "Yucatán": "YN",
  "Zacatecas": "ZS", "Nacido en el extranjero": "NE",
};

function decodeCurp(curp: string) {
  const c = curp.trim().toUpperCase();
  if (!/^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[A-Z0-9]\d$/.test(c)) return null;
  const yy = c.slice(4, 6);
  const mm = c.slice(6, 8);
  const dd = c.slice(8, 10);
  const century = parseInt(yy) <= new Date().getFullYear() % 100 ? "20" : "19";
  const year = `${century}${yy}`;
  const sexRaw = c[10];
  const sexo = sexRaw === "H" ? "Hombre" : "Mujer";
  const entCod = c.slice(11, 13);
  const entidad = ESTADO_NAMES[entCod] || entCod;
  return {
    curp: c,
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    fechaNacimiento: `${dd}/${mm}/${year}`,
    sexo: sexRaw,
    entidad,
    statusCurp: "AN",
  };
}

function buildCurpFromDatos(d: any): string {
  const nombre = (d.nombre || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ap1 = (d.apellido1 || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ap2 = (d.apellido2 || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const vowels = "AEIOU";
  const skip = ["DE", "DEL", "LA", "LAS", "LOS", "MC", "MAC", "VAN", "VON", "Y"];

  const getFirstVowel = (s: string) => {
    for (let i = 1; i < s.length; i++) if (vowels.includes(s[i])) return s[i];
    return "X";
  };
  const getFirstConsonant = (s: string) => {
    for (let i = 1; i < s.length; i++) if (!vowels.includes(s[i]) && /[A-Z]/.test(s[i])) return s[i];
    return "X";
  };

  const cleanAp1 = ap1.replace(/^(DE |DEL |LA |LAS |LOS |MC |MAC |VAN |VON |Y )/, "");
  const cleanAp2 = ap2.replace(/^(DE |DEL |LA |LAS |LOS |MC |MAC |VAN |VON |Y )/, "");
  const nombres = nombre.split(" ").filter(w => !skip.includes(w));
  const usedNombre = nombres.length > 1 && ["JOSE", "MARIA", "MA", "J"].includes(nombres[0]) ? nombres[1] : nombres[0] || "X";

  const p1 = (cleanAp1[0] || "X") + getFirstVowel(cleanAp1);
  const p2 = cleanAp2[0] || "X";
  const p3 = usedNombre[0] || "X";

  const yy = String(d.anio || "2000").slice(-2);
  const mm = String(d.mes || "1").padStart(2, "0");
  const dd = String(d.dia || "1").padStart(2, "0");

  const sexo = (d.sexo || "H").toUpperCase();
  const entCod = ENTIDAD_CODES[d.estado] || "DF";

  const c1 = getFirstConsonant(cleanAp1);
  const c2 = getFirstConsonant(cleanAp2 || "X");
  const c3 = getFirstConsonant(usedNombre);

  const base = `${p1}${p2}${p3}${yy}${mm}${dd}${sexo}${entCod}${c1}${c2}${c3}0`;

  const DIGITS = "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += DIGITS.indexOf(base[i]) * (base.length + 1 - i);
  }
  const verif = (10 - (sum % 10)) % 10;

  return `${base}${verif}`;
}

router.post("/curp-lookup", async (req, res) => {
  const { curp, datos } = req.body;

  if (curp && curp.trim().length >= 16) {
    const decoded = decodeCurp(curp);
    if (!decoded) {
      return res.json({ success: false, error: "El CURP ingresado no tiene un formato válido." });
    }
    return res.json({ success: true, data: decoded });
  }

  if (datos) {
    const { nombre, apellido1, apellido2, dia, mes, anio, sexo, estado } = datos;
    if (!nombre || !apellido1 || !dia || !mes || !anio) {
      return res.json({ success: false, error: "Complete todos los campos requeridos." });
    }

    const generatedCurp = buildCurpFromDatos(datos);
    const dd = String(dia).padStart(2, "0");
    const mm2 = String(mes).padStart(2, "0");
    const fecha = `${dd}/${mm2}/${anio}`;

    return res.json({
      success: true,
      data: {
        curp: generatedCurp,
        nombre: nombre.toUpperCase(),
        primerApellido: apellido1.toUpperCase(),
        segundoApellido: (apellido2 || "").toUpperCase(),
        fechaNacimiento: fecha,
        sexo: sexo || "H",
        entidad: ESTADO_NAMES[ENTIDAD_CODES[estado] || "DF"] || estado,
        statusCurp: "AN",
      },
    });
  }

  return res.status(400).json({ success: false, error: "Faltan datos para la consulta." });
});

export default router;
