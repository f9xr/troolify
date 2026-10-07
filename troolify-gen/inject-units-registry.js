const fs = require('fs');
const path = require('path');
const gen = require('child_process');

// 1) regenerate unit tool pages + registry entries (idempotent) if missing
const tdPath = 'assets/js/tools-data.js';
let td = fs.readFileSync(tdPath, 'utf8');

// Build the tool entries block and register them if absent.
if (!/href:"tools\/units\//.test(td)) {
  const FAMS = [
    ['length', 'Length Converter', 'fa-solid fa-ruler', 'Length', 'length-converter.html', ['length converter','meters to feet','inches to cm','miles to kilometers','yard to meter','distance converter'], 'Convert meters, feet, inches, yards, miles and more in one place with the exact formulas shown.'],
    ['weight', 'Weight & Mass Converter', 'fa-solid fa-weight-hanging', 'Weight', 'weight-mass-converter.html', ['weight converter','kg to lb','pounds to kilograms','ounces to grams','stone to kg','mass converter'], 'Convert kilograms, pounds, grams, ounces, stone and tonnes with the underlying formulas.'],
    ['area', 'Area Converter', 'fa-solid fa-vector-square', 'Area', 'area-converter.html', ['area converter','sqft to sqm','acre to hectare','sqm to sqft','square meter calculator'], 'Convert square meters, sq ft, acres, hectares and more with clear conversion-factor math.'],
    ['volume', 'Volume Converter', 'fa-solid fa-cube', 'Volume', 'volume-converter.html', ['volume converter','liters to gallons','ml to cups','gallon to liter','cubic meters'], 'Convert liters, gallons, milliliters, cups and cubic meters - exact factors and formulas included.'],
    ['temperature', 'Temperature Converter', 'fa-solid fa-temperature-half', 'Temperature', 'temperature-converter.html', ['temperature converter','celsius to fahrenheit','fahrenheit to kelvin','kelvin to celsius'], 'Convert Celsius, Fahrenheit and Kelvin - with the exact conversion formulas shown below.'],
    ['speed', 'Speed Converter', 'fa-solid fa-gauge-high', 'Speed', 'speed-converter.html', ['speed converter','mph to kmh','knots to mph','ms to kmh','velocity converter'], 'Convert km/h, mph, m/s, knots and ft/s using standard exact conversion factors.'],
    ['data', 'Data Size Converter', 'fa-solid fa-hard-drive', 'Data', 'data-size-converter.html', ['data size converter','gb to mb','mb to kb','tb to gb','bytes converter'], 'Convert bytes, kilobytes, megabytes, gigabytes and terabytes with 1024-based binary factors.'],
    ['time', 'Time Converter', 'fa-solid fa-clock', 'Time', 'time-converter.html', ['time converter','seconds to minutes','hours to days','days to years','minutes to hours'], 'Convert seconds, minutes, hours, days, weeks, months and years using common time constants.'],
  ];
  const entries = FAMS.map(([slug, name, icon, tag, file, keywords, desc]) =>
    `  { name:"${name}", desc:"${desc.replace(/"/g, '\\"')}", icon:"${icon}", tag:"${tag}", category:"Units", href:"tools/units/${file}", keywords:${JSON.stringify(keywords)} },`
  ).join('\r\n');

  // The TOOLS array closes right before window.CATEGORIES.
  const marker = /\]\s*;?\s*\r?\n\s*window\.CATEGORIES/;
  if (!marker.test(td)) throw new Error('TOOLS array close not found');
  td = td.replace(marker, entries + '\r\n' + '];\r\n\r\nwindow.CATEGORIES');
  fs.writeFileSync(tdPath, td, 'utf8');
  console.log('TOOLS registry updated with', FAMS.length, 'unit converters');
} else {
  console.log('TOOLS registry already has unit converters');
}
