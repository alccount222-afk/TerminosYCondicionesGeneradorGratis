// @ts-nocheck
import React, { useState } from "react";
import { jsPDF } from "jspdf";

export default function App() {
  const [paso, setPaso] = useState(1);
  const [enviado, setEnviado] = useState(false);

  const [datos, setDatos] = useState({
    razonSocial: "",
    ruc: "",
    web: "",
    datosRecopilados: [],
    herramientasExternas: [],
    pagariaGenerador: "",
    precioGenerador: "",
    pagariaSuscripcion: "",
    emailUsuario: "",
  });

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e, categoria) => {
    const { value, checked } = e.target;
    let nuevaLista = [...datos[categoria]];
    if (checked) {
      nuevaLista.push(value);
    } else {
      nuevaLista = nuevaLista.filter((item) => item !== value);
    }
    setDatos({ ...datos, [categoria]: nuevaLista });
  };

  // Validación para que no avancen sin responder las opciones múltiples
  const validarYContinuar = (e) => {
    e.preventDefault();
    if (paso === 2 && datos.datosRecopilados.length === 0) {
      alert("Por favor, selecciona al menos un tipo de dato recopilado.");
      return;
    }
    if (paso === 3 && datos.herramientasExternas.length === 0) {
      alert(
        "Por favor, selecciona al menos una herramienta (o elige 'Ninguna')."
      );
      return;
    }
    setPaso(paso + 1);
  };

  const pasoAnterior = () => setPaso(paso - 1);

  // ==========================================
  // GENERACIÓN DEL PDF (CON BASTANTE "FLORO" LEGAL PERUANO)
  // ==========================================
  const generarDocumentoPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      "POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES",
      105,
      20,
      { align: "center" }
    );
    doc.setFontSize(10);
    doc.text(
      "En estricto cumplimiento de la Ley N° 29733 y el D.S. N° 003-2013-JUS",
      105,
      27,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9); // Letra más pequeña para que entre todo el marco legal

    const textoLegal = `
    1. MARCO NORMATIVO Y DECLARACIÓN DE CUMPLIMIENTO
    El presente documento establece las Políticas de Privacidad y lineamientos de protección de datos personales aplicables a los servicios y plataformas operadas por la Razón Social: ${datos.razonSocial.toUpperCase()}, identificada con RUC N° ${
      datos.ruc
    } (en adelante, "EL TITULAR"). Conforme a lo dispuesto en la Ley N° 29733, Ley de Protección de Datos Personales, y su respectivo Reglamento aprobado mediante Decreto Supremo N° 003-2013-JUS, EL TITULAR garantiza el respeto absoluto de los derechos fundamentales a la privacidad, la intimidad y la protección de datos de los usuarios de su plataforma/sitio web (${
      datos.web
    }).

    2. CONSENTIMIENTO PREVIO, INFORMADO, EXPRESO E INEQUÍVOCO
    Al acceder, registrarse o interactuar con nuestros canales, el usuario otorga su consentimiento libre, previo, expreso, inequívoco e informado para que EL TITULAR someta a tratamiento los datos personales proporcionados. Este tratamiento se realizará bajo los principios rectores de legalidad, consentimiento, finalidad, proporcionalidad, calidad, seguridad y nivel de protección adecuado, exigidos por la Autoridad Nacional de Protección de Datos Personales (ANPD).

    3. BANCO DE DATOS Y NATURALEZA DE LA INFORMACIÓN RECOPILADA
    Se deja expresa constancia de que los datos suministrados conformarán un Banco de Datos Personales de titularidad de ${datos.razonSocial.toUpperCase()}. Los datos estrictamente recabados son: ${datos.datosRecopilados.join(
      ", "
    )}. Estos serán utilizados de manera excluyente para la adecuada prestación de los servicios, gestión comercial, facturación, soporte técnico y, de ser autorizado, envío de material promocional.

    4. FLUJO TRANSFRONTERIZO Y ENCARGADOS DEL TRATAMIENTO
    Para garantizar la operatividad y eficiencia de la plataforma tecnológica, EL TITULAR declara que puede valerse de prestadores de servicios de terceros, implicando un tratamiento por encargo o flujo transfronterizo de datos. El usuario consiente expresamente el uso de las siguientes infraestructuras o herramientas tecnológicas: ${datos.herramientasExternas.join(
      ", "
    )}. Dichos terceros se encuentran obligados a mantener niveles de seguridad y confidencialidad simétricos a los establecidos en la legislación peruana.

    5. MEDIDAS TÉCNICAS Y ORGANIZATIVAS DE SEGURIDAD
    EL TITULAR ha implementado estrictas medidas de seguridad lógicas, físicas y organizativas, adoptando protocolos de encriptación, firewalls y controles de acceso, destinados a evitar cualquier escenario de alteración, pérdida, sustracción, tratamiento o acceso no autorizado a los datos personales, mitigando así los riesgos derivados de la acción humana o del entorno físico/natural.

    6. EJERCICIO INDECLINABLE DE LOS DERECHOS ARCO
    El usuario, en su calidad de titular de los datos, conserva inalterables sus derechos de Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO). Para la ejecución material de los mismos, deberá cursar una solicitud formal, acompañando copia de su Documento Nacional de Identidad (DNI) o Carné de Extranjería, a la siguiente dirección electrónica habilitada para requerimientos legales: ${
      datos.emailUsuario
    }. EL TITULAR responderá dentro de los plazos perentorios establecidos en el artículo 55 del Reglamento de la Ley.
    
    Fecha de emisión automatizada: ${new Date().toLocaleDateString("es-PE")}
    `;

    const textoFormateado = doc.splitTextToSize(textoLegal, 170);
    doc.text(textoFormateado, 20, 42);

    doc.save(
      `Politica_Privacidad_${datos.razonSocial.replace(/\s+/g, "_")}.pdf`
    );
  };

  // ==========================================
  // ENVÍO DE DATOS AL GMAIL Y DISPARO DE PDF
  // ==========================================
  const enviarFormulario = async (e) => {
    e.preventDefault();

    // Validar condicional de precio (si dijo que SÍ y no eligió precio)
    if (datos.pagariaGenerador === "SI" && !datos.precioGenerador) {
      alert("Por favor, selecciona un rango de precio.");
      return;
    }

    try {
      await fetch("https://formspree.io/f/meelprba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Razon_Social: datos.razonSocial,
          RUC: datos.ruc,
          Sitio_o_App: datos.web,
          Datos_Recopilados: datos.datosRecopilados.join(", "),
          Herramientas: datos.herramientasExternas.join(", "),
          Pagaria_Plataforma: datos.pagariaGenerador,
          Precio_Elegido: datos.precioGenerador || "No aplica (dijo que NO)",
          Pagaria_Suscripcion: datos.pagariaSuscripcion,
          Email_Cliente: datos.emailUsuario,
        }),
      });
    } catch (error) {
      console.error("Error al enviar", error);
    }

    setEnviado(true);
    generarDocumentoPDF();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center py-12 px-4 selection:bg-blue-500/40">
      {/* HEADER STARTUP */}
      <div className="text-center max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-block border border-gray-800 bg-gray-900/50 text-gray-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase shadow-sm">
          Cumplimiento Legal PE
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500">
          Políticas impecables <br /> para tu negocio.
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
          Completa este formulario y se generará una política de privacidad con validez legal (Ley N° 29733) en
          menos de 2 minutos, un PDF. Rápido, seguro y listo para implementar en tu sitio web.
        </p>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-[#0f0f11] border border-gray-800/80 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-600/10 blur-[100px] pointer-events-none"></div>

        {!enviado ? (
          <form
            onSubmit={paso === 4 ? enviarFormulario : validarYContinuar}
            className="relative z-10"
          >
            {/* INDICADOR DE PASOS */}
            <div className="flex items-center mb-10">
              {[1, 2, 3, 4].map((num) => (
                <React.Fragment key={num}>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      paso >= num
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                        paso > num ? "bg-blue-600" : "bg-gray-800"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* SECCIÓN 1 */}
            {paso === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Datos del Titular
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Razón Social *
                  </label>
                  <input
                    required
                    name="razonSocial"
                    value={datos.razonSocial}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ej: Innovación Digital S.A.C."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Número de RUC
                  </label>
                  <input
                    name="ruc"
                    value={datos.ruc}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ej: 20123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sitio Web, App o Plataforma *
                  </label>
                  <input
                    required
                    type="text"
                    name="web"
                    value={datos.web}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ej: mipagina.com / Aplicación Móvil 'MiApp' / En desarrollo"
                  />
                </div>
              </div>
            )}

            {/* SECCIÓN 2 */}
            {paso === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Datos Recopilados
                </h2>
                <p className="text-gray-400 text-sm">
                  ¿Qué información le solicitas a tus usuarios? (Obligatorio)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Nombres y Apellidos",
                    "DNI / CE",
                    "Correo Electrónico",
                    "Número de Celular",
                    "Dirección física",
                    "Datos Bancarios",
                  ].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        datos.datosRecopilados.includes(item)
                          ? "bg-blue-600/10 border-blue-500"
                          : "bg-black/30 border-gray-800 hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={item}
                        checked={datos.datosRecopilados.includes(item)}
                        onChange={(e) => handleCheckbox(e, "datosRecopilados")}
                        className="w-5 h-5 accent-blue-600"
                      />
                      <span className="ml-3 text-sm text-gray-200">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 3 */}
            {paso === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Herramientas de Terceros
                </h2>
                <p className="text-gray-400 text-sm">
                  Selecciona las integraciones que utilizas (Obligatorio):
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Google Analytics / Firebase",
                    "Píxel de Facebook / TikTok Ads",
                    "Pasarelas de Pago (Niubiz, Culqi, Stripe, MercadoPago)",
                    "Ninguna integración de terceros",
                  ].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        datos.herramientasExternas.includes(item)
                          ? "bg-blue-600/10 border-blue-500"
                          : "bg-black/30 border-gray-800 hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={item}
                        checked={datos.herramientasExternas.includes(item)}
                        onChange={(e) =>
                          handleCheckbox(e, "herramientasExternas")
                        }
                        className="w-5 h-5 accent-blue-600"
                      />
                      <span className="ml-3 text-sm text-gray-200">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 4 */}
            {paso === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Finalizar Generación
                </h2>
                {/* PREGUNTA 1 (MERCADO) */}
                <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
                  <label className="block text-sm font-medium text-gray-300 mb-4 leading-relaxed">
                    ¿Estarías dispuesto a pagar un monto único por utilizar una
                    plataforma web que genere políticas de privacidad y términos
                    y condiciones mucho más específicos, con múltiples opciones
                    y adaptados al milímetro a tu modelo de negocio? *
                  </label>
                  <select
                    required
                    name="pagariaGenerador"
                    value={datos.pagariaGenerador}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="">Selecciona tu respuesta...</option>
                    <option value="SI">
                      Sí, pagaría por usar esa plataforma web
                    </option>
                    <option value="NO">
                      No, me bastaría con opciones gratuitas genéricas
                    </option>
                  </select>
                </div>
                {/* PRECIOS (Solo aparece si dicen que SÍ arriba) */}
                {datos.pagariaGenerador === "SI" && (
                  <div className="bg-blue-900/10 border border-blue-500/30 p-6 rounded-2xl animate-in slide-in-from-top-4">
                    <label className="block text-sm font-medium text-blue-200 mb-4">
                      ¿Qué rango de precio considerarías justo pagar en esta
                      plataforma web por dicho documento? *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["S/5 - S/9", "S/10 - S/15", "S/16 - S/20"].map(
                        (precio) => (
                          <label
                            key={precio}
                            className={`text-center py-4 border rounded-xl cursor-pointer transition-all ${
                              datos.precioGenerador === precio
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                : "bg-black/50 border-gray-700 text-gray-400 hover:border-gray-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="precioGenerador"
                              value={precio}
                              checked={datos.precioGenerador === precio}
                              onChange={handleChange}
                              className="hidden"
                            />
                            <span className="text-sm font-bold">{precio}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}
                {/* PREGUNTA 2 (SUSCRIPCIÓN) - Siempre aparece */}
                <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
                  <label className="block text-sm font-medium text-gray-300 mb-4 leading-relaxed">
                    ¿Pagarías una suscripción mensual a nuestra plataforma web
                    para que tus políticas se actualicen de forma automática en
                    tu sitio cada vez que el gobierno peruano modifique las
                    leyes de protección de datos? *
                  </label>
                  <select
                    required
                    name="pagariaSuscripcion"
                    value={datos.pagariaSuscripcion}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="">Selecciona tu respuesta...</option>
                    <option value="SI">
                      Sí, pagaría una suscripción mensual
                    </option>
                    <option value="NO">
                      No, prefiero actualizarlo manualmente
                    </option>
                  </select>
                </div>
                {/* EMAIL REQUERIDO */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Correo de Contacto *
                  </label>
                  <input
                    required
                    type="email"
                    name="emailUsuario"
                    value={datos.emailUsuario}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="legal@miempresa.com"
                  />
                </div>{" "}
                El texto del documento PDF lo copias en la sección: Politica y
                Privacidad, de tu sitio web.
              </div>
            )}

            {/* CONTROLES INFERIORES */}
            <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-800/80">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={pasoAnterior}
                  className="px-6 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  ← Volver
                </button>
              ) : (
                <div></div>
              )}

              {paso < 4 ? (
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  Siguiente Sección
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  Generar PDF Ahora
                </button>
              )}
            </div>
          </form>
        ) : (
          /* PANTALLA FINAL */
          <div className="text-center py-16 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              ¡Documento Listo!
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              El PDF con tu Razón Social ha sido generado y descargado en tu
              dispositivo. Respuestas guardadas exitosamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              Crear nuevo documento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
