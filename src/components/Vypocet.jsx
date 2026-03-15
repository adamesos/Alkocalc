import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Vysledek() {
  const location = useLocation();
  const data = location.state;
  const [nahodnyVtip, setNahodnyVtip] = useState("");

  useEffect(() => {
    fetch("/vtipy.json")
      .then((response) => response.json())
      .then((vtipyData) => {
        if (vtipyData && vtipyData.length > 0) {
          const randomIdx = Math.floor(Math.random() * vtipyData.length);
          setNahodnyVtip(vtipyData[randomIdx].text);
        }
      })
      .catch((error) => console.error("Chyba při načítání vtipů:", error));
  }, []);

  if (!data) {
    return (
      <div className="container">
        <p>Žádná data nebyla předána. Vraťte se prosím na kalkulačku.</p>
        <Link to="/">⬅ Zpět</Link>
      </div>
    );
  }

  const { vaha, pohlavi, konec, drinky } = data;

  // --- LOGIKA VÝPOČTU ---
  const r = pohlavi === "muz" ? 0.68 : 0.55;
  let celkemAlkoholGramy = 0;

  drinky.forEach((drink) => {
    const alkohol = (Number(drink.objem) * (Number(drink.procenta) / 100)) * 0.8;
    celkemAlkoholGramy += alkohol;
  });

  let promile = celkemAlkoholGramy / (Number(vaha) * r);

  // Výpočet času (ošetření formátu času)
  const dnes = "2024-01-01T"; 
  const casy = drinky.map((d) => new Date(`${dnes}${d.cas}`));
  const nejdrive = new Date(Math.min(...casy));
  const konecCas = new Date(`${dnes}${konec}`);

  // Výpočet odbourávání (mezi prvním drinkem a koncem pití)
  const rozdilHodin = (konecCas - nejdrive) / (1000 * 60 * 60);
  const odbourano = Math.max(0, rozdilHodin * 0.15); 

  promile -= odbourano;
  if (promile < 0) promile = 0;

  const hodinyDoStrizliva = promile / 0.15;
  const strizlivyCas = new Date(konecCas.getTime() + hodinyDoStrizliva * 60 * 60 * 1000);

  return (
    <div className="container">
      <h1>📊 Výsledek výpočtu</h1>

      {nahodnyVtip && (
        <div className="drink-card" style={{ borderLeft: "4px solid #8f5cff", background: "rgba(143,92,255,0.1)" }}>
          <p style={{ margin: 0, fontStyle: "italic", fontSize: "0.95rem" }}>
            💡 <strong>Vtip na cestu:</strong> "{nahodnyVtip}"
          </p>
        </div>
      )}

      <div className="result-box">
        <p>Aktuální odhad alkoholu: <span className="result-highlight">{promile.toFixed(2)} ‰</span></p>
        <p>Čas do vystřízlivění: <strong>{hodinyDoStrizliva.toFixed(1)} hodin</strong></p>
        <p>Střízlivý stav v cca: <span className="result-highlight">{strizlivyCas.toTimeString().slice(0, 5)}</span></p>
      </div>

      <h2 style={{ marginTop: "40px", fontSize: "1.5rem" }}>Zadané údaje</h2>
      
      <div className="drink-card" style={{ borderLeft: "4px solid #8f5cff" }}>
        <p style={{ margin: "5px 0" }}>
          👤 <strong>{pohlavi === "muz" ? "Muž" : "Žena"}</strong> | ⚖️ <strong>{vaha} kg</strong>
        </p>
        <p style={{ margin: "5px 0" }}>🏁 Konec pití: <strong>{konec}</strong></p>
      </div>

      <h3>Vypité nápoje:</h3>
      <div className="summary-list">
        {drinky.map((drink, index) => {
          // POMOCNÁ FUNKCE: Převede "Piña Colada" na "pinacolada" pro název obrázku
          const imgFileName = (drink.typ || "vlastni")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Odstraní diakritiku
            .replace(/\s+/g, "_"); // Nahradí mezery podtržítkem

          return (
            <div key={index} className="drink-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <img 
                src={`/img/${imgFileName}.png`} 
                alt={drink.typ} 
                style={{ width: "60px", height: "60px", objectFit: "contain" }}
                onError={(e) => { e.target.src = "https://placehold.co/60x60?text=🍹"; }}
              />

              <div style={{ flexGrow: 1 }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#8f5cff", textTransform: "uppercase" }}>
                  {drink.typ || "Vlastní drink"}
                </h4>
                
                <div className="drink-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div><label>Objem</label><span>{drink.objem} ml</span></div>
                  <div><label>Obsah</label><span>{drink.procenta} %</span></div>
                  <div><label>Čas</label><span>{drink.cas}</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link to="/" className="back-link">⬅ Zpět na kalkulačku</Link>
      </div>
    </div>
  );
}