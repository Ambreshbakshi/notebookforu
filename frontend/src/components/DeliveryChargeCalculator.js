import pincodeData from '@/data/pincodeData.json'; // Adjust path as needed

export const calculateShippingCost = (pincode, totalWeight, senderDistrict = "GORAKHPUR", senderState = "UTTAR PRADESH") => {
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
    otherStates: "6-7 Days",
    ncr: "3-4 Days"
  };

  // Neighbouring states of Uttar Pradesh
  const neighbouringStates = [
    "BIHAR", "JHARKHAND", "CHHATTISGARH", "MADHYA PRADESH", 
    "RAJASTHAN", "HARYANA", "DELHI", "UTTARAKHAND", "HIMACHAL PRADESH"
  ];

  // NCR regions (first 3 digits)
  const ncrPincodes = ["110", "201", "122"];
  
  // Metro cities (first 3 digits)
  const metroPincodes = ["400", "700", "560", "600", "500", "380"];

  // Validate inputs
  if (!pincode || String(pincode).length !== 6) {
    throw new Error("Invalid pincode - must be 6 digits");
  }

  if (isNaN(totalWeight) || totalWeight <= 0) {
    throw new Error("Invalid weight - must be positive number");
  }

  // Find destination in pincode data
  const destination = pincodeData.find(entry => 
    String(entry.pincode) === String(pincode)
  );

  if (!destination) {
    throw new Error("Pincode not found in our database");
  }

  const destDistrict = destination.Districtname.trim().toUpperCase();
  const destState = destination.statename.trim().toUpperCase();
  const first3 = String(pincode).substring(0, 3);

  // Determine zone
  let zone = "otherStates";
  
  // 1. Check for local (same district and state)
  if (destDistrict === senderDistrict.toUpperCase() && destState === senderState.toUpperCase()) {
    zone = "local";
  }
  // 2. Check for NCR
  else if (ncrPincodes.includes(first3)) {
    zone = "ncr";
  }
  // 3. Check for metro cities
  else if (metroPincodes.includes(first3)) {
    zone = "metroToCapital";
  }
  // 4. Check for same state
  else if (destState === senderState.toUpperCase()) {
    zone = "withinState";
  }
  // 5. Check for neighbouring states
  else if (neighbouringStates.includes(destState)) {
    zone = "neighbouringState";
  }

  // Get rate structure
  const { base, perKg3to5, perKgAbove5 } = shippingRates[zone];
  
  // Calculate base charge
  let charge = base;

  // Calculate additional weight charges
  if (totalWeight > 2 && totalWeight <= 5) {
    const extraWeight = Math.ceil(totalWeight - 2);
    charge += extraWeight * perKg3to5;
  } else if (totalWeight > 5) {
    const extraBetween3to5 = 3; // from 2kg to 5kg is always 3kg range
    const extraAbove5 = Math.ceil(totalWeight - 5);
    charge += extraBetween3to5 * perKg3to5 + extraAbove5 * perKgAbove5;
  }

  // Adjust delivery time for branch offices
  let deliveryEstimate = deliveryTimes[zone] || "5-7 Days";
  if (destination.officeType === "B.O") {
    const daysMatch = deliveryEstimate.match(/\d+/);
    if (daysMatch) {
      const extraDay = parseInt(daysMatch[0]) + 1;
      deliveryEstimate = deliveryEstimate.replace(daysMatch[0], extraDay);
    }
  }

  // Format zone name for display
  const formattedZone = zone.replace(/([A-Z])/g, ' $1').trim();

  return {
    shippingCost: charge,
    deliveryEstimate,
    zone: formattedZone,
    isLocal: zone === "local",
    isNCR: zone === "ncr",
    isMetro: zone === "metroToCapital",
    destinationDetails: {
      district: destDistrict,
      state: destState,
      officeType: destination.officeType,
      deliveryStatus: destination.Deliverystatus
    }
  };
};

export const calculateTotalWeight = (items) => {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array");
  }

  return items.reduce((sum, item) => {
    const weight = Number(item.weight) || 0.5;
    const quantity = Number(item.quantity) || 1;
    return sum + (weight * quantity);
  }, 0);
};