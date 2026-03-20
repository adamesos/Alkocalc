import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DRINKY_DATA from "./DrinkData";

export default function CalcPage() {
  const navigate = useNavigate();

  // Základní údaje o uživateliy
  const [formData, setFormData] = useState({
    vaha: "",
    pohlavi: "muz",
    konec: "" // Čas, kdy uživatel přestal pít úplně
  });

  // Seznam aktuálně přidaných drinků
  const [drinky, setDrink] = useState([]);

  // Stavy pro ovládání modálu
  const [showModal, setShowModal] = useState(false);
  const [selectedDrinkIndex, setSelectedDrinkIndex] = useState(null);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pridejDrink = () => {
    setDrink(prev => [...prev, { typ: "", objem: "", procenta: "", cas: "" }]);
  };

  const zmenDrink = (index, field, value) => {
    const noveDrink = [...drinky];
    noveDrink[index][field] = value;
    setDrink(noveDrink);
  };

  const odeberDrink = (index) => {
    setDrink(drinky.filter((_, i) => i !== index));
  };

  // --- LOGIKA VALIDACE A ODESLÁNÍ ---
  const Kalkulacka = (e) => {
    e.preventDefault();

    // Kontrola, zda jsou vůbec nějaké drinky
    if (drinky.length === 0) {
      alert("Musíš přidat alespoň jeden vypitý drink.");
      return;
    }

    // Kontrola časů: Žádný drink nesmí být vypit po nahlášeném "Konci pití"
    const problematickyDrink = drinky.find(d => d.cas > formData.konec);

    if (problematickyDrink) {
      alert(
        `Chyba! Máš u drinku zadaný čas ${problematickyDrink.cas}, ` +
        `ale konec celého pití jsi nastavil na ${formData.konec}. ` +
        `Čas drinku musí být stejný nebo dřívější než čas konce.`
      );
      return; // Zastaví navigaci
    }

    // Pokud je vše v pořádku, navigujeme na výsledek
    navigate("/vysledek", {
      state: {
        ...formData,
        drinky
      }
    });
  };

  return (
    <div className="container">
      <h1>🍺 Alkokalkulačka</h1>

      <form onSubmit={Kalkulacka}>
        <label>Pohlaví:</label>
        <select name="pohlavi" value={formData.pohlavi} onChange={handleChange}>
          <option value="muz">Muž</option>
          <option value="zena">Žena</option>
        </select>

        <label>Hmotnost (kg):</label>
        <input
          type="number"
          name="vaha"
          value={formData.vaha}
          onChange={handleChange}
          placeholder="Např. 80"
          required
        />

        <h3>Vypité drinky</h3>

        {drinky.map((drink, index) => (
          <div key={index} className="drink-card" style={{ border: drink.cas > formData.konec ? "2px solid red" : "1px solid #ccc" }}>
            <h4>Drink č. {index + 1}</h4>

            <button
              type="button"
              onClick={() => {
                setSelectedDrinkIndex(index);
                setShowModal(true);
              }}
            >
              Vybrat drink 🍹
            </button>

            <p>Vybráno: <strong>{drink.typ || "Zatím nic"}</strong></p>

            <div className="drink-grid">
              <div>
                <label>Objem (ml):</label>
                <input
                  type="number"
                  value={drink.objem}
                  onChange={(e) => zmenDrink(index, "objem", e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Alkohol (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={drink.procenta}
                  onChange={(e) => zmenDrink(index, "procenta", e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Čas vypití:</label>
                <input
                  type="time"
                  value={drink.cas}
                  onChange={(e) => zmenDrink(index, "cas", e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="button" className="btn-remove" onClick={() => odeberDrink(index)}>
              ❌ Odebrat
            </button>
            {drink.cas > formData.konec && <p style={{ color: "red", fontSize: "12px" }}>Čas je po konci pití!</p>}
          </div>
        ))}

        <button type="button" className="btn-add" onClick={pridejDrink}>
          ➕ Přidat další drink
        </button>

        <hr />

        <label><strong>Kdy jsi dopil poslední drink?:</strong></label>
        <input
          type="time"
          name="konec"
          value={formData.konec}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn-submit">Vypočítat promile</button>
      </form>

      {/* MODÁL PRO VÝBĚR */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2>Vyber si nápoj</h2>
            <div className="drink-scroll">
              {DRINKY_DATA.map((d) => (
                <div
                  key={d.id}
                  className="drink-item"
                  onClick={() => {
                    zmenDrink(selectedDrinkIndex, "typ", d.label);
                    zmenDrink(selectedDrinkIndex, "objem", d.objem);
                    zmenDrink(selectedDrinkIndex, "procenta", d.procenta);
                    setShowModal(false);
                  }}
                >
                  <img src={d.img} alt={d.label} style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                  <p>{d.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowModal(false)}>Zavřít</button>
          </div>
        </div>
      )}
    </div>
  );
}