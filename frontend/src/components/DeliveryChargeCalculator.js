export const calculateShippingCost = (pincode, totalWeight) => {
  // Shipping rates
  const shippingRates = {
    local: { base: 45, perKg3to5: 12, perKgAbove5: 14 },
    withinState: { base: 80, perKg3to5: 20, perKgAbove5: 22 },
    neighbouringState: { base: 100, perKg3to5: 25, perKgAbove5: 28 },
    otherStates: { base: 115, perKg3to5: 30, perKgAbove5: 32 },
    metroToCapital: { base: 105, perKg3to5: 25, perKgAbove5: 28 },
    ncr: { base: 70, perKg3to5: 15, perKgAbove5: 18 },
  };

  // Delivery time estimates
  const deliveryTimes = {
    local: "3 Days",
    metroToCapital: "4-5 Days",
    withinState: "3-6 Days",
    neighbouringState: "4-6 Days",
    otherStates: "6-7 Days"
  };

  // Determine the zone based on pincode
  const getZoneFromPIN = (pin) => {
    const first3 = pin.substring(0, 3);
    
    const localPINs = [
      "273001", "273002", "273003", "273004", "273005", "273006", "273007",
      "273008", "273009", "273010", "273012", "273013", "273014", "273015",
      "273016", "273017", "273158", "273165", "273202", "273203", "273209",
      "273212", "273213", "273306", "273307"
    ];

    const UP3s = [
  "201", // Ghaziabad, Noida, Hapur, Dadri, Bulandshahr
  "202", // Aligarh, Etah, Hathras, Kasganj
  "203", // Bulandshahr (Some areas)
  "204", // Mainpuri
  "205", // Etawah, Auraiya
  "206", // Auraiya
  "207", // Farrukhabad
  "208", // Kanpur city & surrounding
  "209", // Unnao, parts of Kanpur rural
  "210", // Banda, Hamirpur
  "211", // Allahabad (Prayagraj), Kaushambi
  "212", // Fatehpur
  "213", // Some areas of nearby regions (not very commonly used)
  "221", // Varanasi, Chandauli, Jaunpur, Mirzapur
  "222", // Jaunpur
  "223", // Azamgarh, Mau
  "224", // Ambedkar Nagar
  "225", // Barabanki
  "226", // Lucknow
  "227", // Amethi, Raebareli, Sultanpur
  "228", // Pratapgarh
  "229", // Raebareli (some areas)
  "230", // Pratapgarh
  "231", // Mirzapur
  "232", // Sonbhadra
  "233", // Ghazipur
  "241", // Hardoi
  "242", // Shahjahanpur
  "243", // Bareilly, Budaun, Pilibhit
  "244", // Moradabad, Rampur, Amroha, Sambhal
  "245", // Bijnor
  "246", // Pauri Garhwal (some parts fall under UP postal jurisdiction)
  "247", // Saharanpur, Muzaffarnagar
  "248", // Dehradun (technically Uttarakhand, but border confusion sometimes occurs)
  "249", // Haridwar (technically Uttarakhand, often considered)
  "250", // Meerut, Baghpat, Ghaziabad rural
  "251", // Muzaffarnagar rural
  "252", // Shamli
  "261", // Sitapur
  "262", // Lakhimpur Kheri
  "263", // Some border areas (mostly Uttarakhand)
  "271", // Bahraich, Balrampur, Gonda
  "272", // Basti, Sant Kabir Nagar
  "274", // Deoria, Kushinagar
  "275", // Ballia
  "276", // Mau
  "277", // Ballia (some areas)
  "281", // Mathura
  "282", // Agra
  "283", // Firozabad, Mainpuri
  "284", // Jhansi, Lalitpur
  "285", // Jhansi (some areas)
  "286", // Lalitpur (some areas)
]; // UP regions
    const ncr = ["110", "201", "122"]; // Delhi NCR
    const metro = ["400", "700", "560", "600"]; // Metro cities

    if (localPINs.includes(pin)) return "local";
    if (ncr.includes(first3)) return "ncr";
    if (metro.includes(first3)) return "metroToCapital";
    if (UP3s.includes(first3)) return "withinState";
    return "otherStates";
  };

  if (!pincode || pincode.length !== 6) {
    throw new Error("Invalid pincode");
  }

  if (totalWeight <= 0) {
    throw new Error("Invalid weight");
  }

  const zone = getZoneFromPIN(pincode);
  const { base, perKg3to5, perKgAbove5 } = shippingRates[zone];
  let charge = base;

  // Calculate additional weight charges using ceil logic
  if (totalWeight > 2 && totalWeight <= 5) {
    const extraWeight = Math.ceil(totalWeight - 2);
    charge += extraWeight * perKg3to5;
  } else if (totalWeight > 5) {
    const extraBetween3to5 = 3; // from 2kg to 5kg, always 3kg range
    const extraAbove5 = Math.ceil(totalWeight - 5);
    charge += extraBetween3to5 * perKg3to5 + extraAbove5 * perKgAbove5;
  }

  return {
    shippingCost: charge,
    deliveryEstimate: deliveryTimes[zone] || "5-7 Days",
    zone: zone.replace(/([A-Z])/g, ' $1').trim()
  };
};

// Helper function to calculate total weight of items
export const calculateTotalWeight = (items) => {
  return items.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0);
};