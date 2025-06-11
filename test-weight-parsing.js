// Test weight parsing functionality
const parseWeight = (weightStr) => {
  if (!weightStr) return 1; // Default to 1kg if no weight specified
  
  const cleanStr = weightStr.toLowerCase().trim();
  const numericPart = parseFloat(cleanStr.replace(/[^\d.]/g, ''));
  
  if (isNaN(numericPart)) return 1; // Default to 1kg if parsing fails
  
  // Check if it's in grams (g, gm, gram, grams but not kg, kilogram)
  if ((cleanStr.includes('g') || cleanStr.includes('gram')) && 
      !cleanStr.includes('kg') && !cleanStr.includes('kilogram')) {
    return numericPart / 1000; // Convert grams to kg
  }
  
  // Otherwise assume it's kg
  return numericPart;
};

// Test cases
const testCases = [
  { input: "100g", expected: 0.1, description: "100 grams" },
  { input: "100gm", expected: 0.1, description: "100 grams (gm)" },
  { input: "500g", expected: 0.5, description: "500 grams" },
  { input: "1kg", expected: 1, description: "1 kilogram" },
  { input: "2.5kg", expected: 2.5, description: "2.5 kilograms" },
  { input: "1.5 kg", expected: 1.5, description: "1.5 kg with space" },
  { input: "250 gm", expected: 0.25, description: "250 gm with space" },
  { input: "2 kilogram", expected: 2, description: "2 kilogram spelled out" },
  { input: "", expected: 1, description: "empty string" },
  { input: undefined, expected: 1, description: "undefined" },
  { input: "abc", expected: 1, description: "invalid text" }
];

console.log("Testing weight parsing function:");
console.log("================================");

testCases.forEach((test, index) => {
  const result = parseWeight(test.input);
  const passed = Math.abs(result - test.expected) < 0.001;
  console.log(`Test ${index + 1}: ${test.description}`);
  console.log(`  Input: "${test.input}"`);
  console.log(`  Expected: ${test.expected}kg`);
  console.log(`  Got: ${result}kg`);
  console.log(`  Status: ${passed ? "PASS" : "FAIL"}`);
  console.log("");
});

// Test shipping calculation
const calculateShipping = (totalWeight, selectedState, totalPrice) => {
  // Free shipping if total > ₹1999
  if (totalPrice > 1999) {
    return 0;
  }

  // Base shipping rates per kg
  let shippingPerKg = selectedState === 'Gujarat' ? 50 : 80;
  
  // Double the rate if weight > 1kg
  if (totalWeight > 1) {
    shippingPerKg *= 2;
  }

  return Math.ceil(totalWeight) * shippingPerKg;
};

console.log("Testing shipping calculation:");
console.log("============================");

const shippingTests = [
  { weight: 0.5, state: "Gujarat", price: 500, expected: 50, description: "500g, Gujarat, ₹500" },
  { weight: 0.5, state: "Maharashtra", price: 500, expected: 80, description: "500g, Maharashtra, ₹500" },
  { weight: 1.5, state: "Gujarat", price: 500, expected: 200, description: "1.5kg, Gujarat, ₹500 (doubled rate)" },
  { weight: 1.5, state: "Maharashtra", price: 500, expected: 320, description: "1.5kg, Maharashtra, ₹500 (doubled rate)" },
  { weight: 2.5, state: "Gujarat", price: 2500, expected: 0, description: "2.5kg, Gujarat, ₹2500 (free shipping)" },
  { weight: 0.8, state: "Gujarat", price: 1500, expected: 50, description: "800g, Gujarat, ₹1500" }
];

shippingTests.forEach((test, index) => {
  const result = calculateShipping(test.weight, test.state, test.price);
  const passed = result === test.expected;
  console.log(`Shipping Test ${index + 1}: ${test.description}`);
  console.log(`  Weight: ${test.weight}kg, State: ${test.state}, Price: ₹${test.price}`);
  console.log(`  Expected: ₹${test.expected}`);
  console.log(`  Got: ₹${result}`);
  console.log(`  Status: ${passed ? "PASS" : "FAIL"}`);
  console.log("");
});