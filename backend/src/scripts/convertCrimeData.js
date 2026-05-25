const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const workbook = xlsx.readFile(
  path.join(__dirname, "../../South Crime Details.xlsx")
);

const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rows = xlsx.utils.sheet_to_json(sheet);

const records = rows.map((row, index) => ({
  externalId: `crime-${index + 1}`,

  policeStation: row["Police Station"] || "Unknown",

  year: Number(row["Year"]) || 2024,

  crimeType: row["Type"] || "Unknown",

  date: String(row["Date"] || ""),

  time: String(row["Time"] || ""),

  place: row["Place"] || "",

  latitude: Number(row["Latitude"]),

  longitude: Number(row["Longitude"]),

  severity:
    row["Type"] === "Murder"
      ? 5
      : row["Type"] === "Robbery"
      ? 4
      : row["Type"] === "Theft"
      ? 3
      : 2,

  area: row["Police Station"] || "South Bengaluru"
})).filter(
  (record) =>
    Number.isFinite(record.latitude)
    && Number.isFinite(record.longitude)
);

const output = {
  records
};

const outputPath = path.join(
  __dirname,
  "../data/crime/south-bengaluru-crimes.json"
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(output, null, 2)
);

console.log(`Converted ${records.length} crime records`);