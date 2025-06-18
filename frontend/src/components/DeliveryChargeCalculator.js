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

    const UP3s = ["273", "226", "201", "247", "250", "284"]; // UP regions
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