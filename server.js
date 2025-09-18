const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------------------ Load Dataset ------------------
let dataset = [];

fs.createReadStream("../dataset/dataset.csv") // file path relative to backend folder
  .pipe(csv())
  .on("data", (row) => {
    dataset.push({
      temperature: parseFloat(row.temperature),
      pH: parseFloat(row.pH),
      turbidity: parseFloat(row.turbidity),
      pathogen_present: parseInt(row.pathogen_present),
    });
  })
  .on("end", () => {
    console.log("✅ Dataset loaded:", dataset.length, "records");
  });

// ------------------ Dummy Detection Function ------------------
function detectPathogen({ temperature, pH, turbidity }) {
  if (turbidity > 5 || pH < 6.5 || pH > 8.5) {
    return { pathogen_present: 1, status: "Unsafe Water" };
  }
  return { pathogen_present: 0, status: "Safe Water" };
}

// ------------------ API Endpoints ------------------

// 1. Check new water sample
app.post("/check-water", (req, res) => {
  const result = detectPathogen(req.body);
  res.json(result);
});

// 2. Get full dataset
app.get("/dataset", (req, res) => {
  res.json(dataset);
});

// ------------------ Start Server ------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
