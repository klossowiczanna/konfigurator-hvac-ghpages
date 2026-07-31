var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/ai-summarize-quote", async (req, res) => {
  try {
    const { deviceName, brand, capacityKw, roomName, areaM2, clientName, marginPercent, totalGross } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        summary: `Profesjonalna oferta HVAC dla klienta ${clientName || "Szanowny Kliencie"}. Zestaw oparty na cichym i wydajnym klimatyzatorze ${brand || "Daikin"} ${deviceName || ""} o mocy ${capacityKw || 3.5} kW. Urz\u0105dzenie idealnie dobrane do pomieszczenia ${roomName || "docelowego"} (${areaM2 || 30} m\xB2). Wycena obejmuje kompletny monta\u017C, pr\xF3\u017Cniowanie oraz uruchomienie z gwarancj\u0105 producenta.`
      });
    }
    const prompt = `Jeste\u015B do\u015Bwiadczonym in\u017Cynierem HVAC i doradc\u0105 technicznym. Wygeneruj zwi\u0119z\u0142y, niezwykle profesjonalny i przekonuj\u0105cy opis techniczny dla klienta ko\u0144cowego (2-3 akapity), kt\xF3ry zostanie do\u0142\u0105czony do oficjalnej oferty cenowej.
Parametry oferty:
- Klient: ${clientName || "Klient Indywidualny/Firma"}
- Pomieszczenie: ${roomName || "Pomieszczenie g\u0142\xF3wne"}, powierzchnia: ${areaM2 || 30} m\xB2
- Urz\u0105dzenie: ${brand} ${deviceName} (Moc ch\u0142odnicza: ${capacityKw} kW)
- Kwota oferty brutto: ${totalGross} PLN

Napisz w j\u0119zyku polskim. Skup si\u0119 na korzy\u015Bciach dla klienta: cicha praca, oszcz\u0119dno\u015B\u0107 energii, wysoka jako\u015B\u0107 monta\u017Cu i gwarancja. Pisz profesjonalnie, bez zb\u0119dnego lania wody.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    const summaryText = response.text || "Oferta dostosowana do najwy\u017Cszych standard\xF3w HVAC.";
    return res.json({ summary: summaryText });
  } catch (error) {
    console.error("AI Quote Summary Error:", error);
    return res.status(500).json({ error: "Nie uda\u0142o si\u0119 wygenerowa\u0107 opisu AI", details: error.message });
  }
});
app.post("/api/ai-technical-advice", async (req, res) => {
  try {
    const { query, deviceModel } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        advice: `Standardowe zalecenia monta\u017Cowe dla ${deviceModel || "klimatyzatora Split"}: Zachowaj min. 15 cm odst\u0119pu od sufitu, u\u017Cyj miedzi ch\u0142odniczej w otulinie kauczukowej, wykonaj pr\xF3b\u0119 szczelno\u015Bci azotem (30-40 bar) oraz pr\xF3\u017Cniowanie do min. 270 Pa.`
      });
    }
    const prompt = `Jeste\u015B ekspertem technicznym ds. klimatyzacji i pomp ciep\u0142a. Odpowiedz zwi\u0119\u017Ale i konkretnie instalatorowi HVAC na pytanie dotycz\u0105ce monta\u017Cu/serwisu/doboru.
Model urz\u0105dzenia: ${deviceModel || "Og\xF3lny uk\u0142ad Split"}
Pytanie instalatora: ${query}

Odpowiedz po polsku w punktach. Podaj konkretne warto\u015Bci techniczne (\u015Brednice rur, ci\u015Bnienia, odleg\u0142o\u015Bci, zasilanie, kody b\u0142\u0119d\xF3w) je\u015Bli dotyczy.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return res.json({ advice: response.text });
  } catch (error) {
    console.error("AI Technical Advice Error:", error);
    return res.status(500).json({ error: "B\u0142\u0105d doradcy technicznego AI" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server KlimatPro B2B listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
