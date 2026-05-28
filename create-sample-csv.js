const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

// Buyers data
const buyersData = [
  {
    name: 'Amara Okafor',
    phone: 2348012345678,
    country: 'Nigeria',
    product: 'Hybrid Maize Seeds',
    price_usd: 45,
    moq: 10,
    region_hook: 'Built for West African soil. Proven across 3 seasons.'
  },
  {
    name: 'Kwame Mensah',
    phone: 233244567890,
    country: 'Ghana',
    product: 'Sorghum Seeds',
    price_usd: 38,
    moq: 15,
    region_hook: 'Trusted by Ghana top distributors since 2022.'
  },
  {
    name: 'Priya Sharma',
    phone: 919876543210,
    country: 'India',
    product: 'Wheat Seeds',
    price_usd: 32,
    moq: 20,
    region_hook: 'Monsoon-ready stock. Ships before planting window.'
  },
  {
    name: 'Mohammed Al-Rashid',
    phone: 966512345678,
    country: 'Saudi Arabia',
    product: 'Premium Fertilizer',
    price_usd: 75,
    moq: 5,
    region_hook: 'High-yield formula for arid conditions.'
  },
  {
    name: 'Grace Wanjiru',
    phone: 254712345678,
    country: 'Kenya',
    product: 'Maize Seeds',
    price_usd: 42,
    moq: 10,
    region_hook: 'Trusted by East Africa top distributors.'
  },
  {
    name: 'Ahmed Hassan',
    phone: 201012345678,
    country: 'Egypt',
    product: 'Cotton Seeds',
    price_usd: 55,
    moq: 12,
    region_hook: 'Premium variety for Nile delta farming.'
  },
  {
    name: 'Maria Santos',
    phone: 558512345678,
    country: 'Brazil',
    product: 'Soybean Seeds',
    price_usd: 48,
    moq: 25,
    region_hook: 'High protein content for South American climate.'
  },
  {
    name: 'Chen Wei',
    phone: 8613812345678,
    country: 'China',
    product: 'Rice Seeds',
    price_usd: 28,
    moq: 30,
    region_hook: 'Disease resistant, high yield variety.'
  }
];

// Message templates data
const templatesData = [
  {
    template_id: 1,
    content: 'Hi {{name}}, we have premium {{product}} in stock for {{country}}. Our customers love the quality - MOQ just {{moq}} units at ${{price_usd}}/unit. Ready to ship this week. Can we send you a quote?'
  },
  {
    template_id: 2,
    content: '{{country}}\'s farming season is here! {{product}} - proven performer in your region. {{region_hook}} Looking for a reliable supplier? Let\'s talk.'
  },
  {
    template_id: 3,
    content: '{{name}}, heard great things about your agricultural operation. We have {{product}} that other {{country}} farmers are raving about. ${{price_usd}}/unit, MOQ {{moq}}. Interested in samples?'
  },
  {
    template_id: 4,
    content: 'Exclusive offer: {{product}} for {{country}} - {{region_hook}} Limited stock available at ${{price_usd}}/unit (MOQ: {{moq}}). This won\'t last long. When can we connect?'
  },
  {
    template_id: 5,
    content: '{{name}}, {{product}} quality check: High germination rates, Disease resistant, {{country}} tested. ${{price_usd}}/unit, MOQ {{moq}} units. Shall we arrange a trial?'
  },
  {
    template_id: 6,
    content: 'New arrival alert for {{country}}: {{product}} - Higher yields guaranteed. {{region_hook}} Starting at just ${{price_usd}}/unit (minimum {{moq}} units). Your competitors are buying. Don\'t fall behind.'
  },
  {
    template_id: 7,
    content: '{{name}}, we\'ve been helping {{country}} farmers for years. Latest batch of {{product}}: premium quality, competitive price (${{price_usd}}/unit, MOQ {{moq}}). Want to be our next success story?'
  },
  {
    template_id: 8,
    content: 'Quick question for you {{name}}: Are you looking for reliable {{product}} supplier for {{country}}? We have stock ready (MOQ {{moq}}, ${{price_usd}}/unit). Direct from us. Interested?'
  }
];

// Create buyers CSV
const buyersCSV = stringify(buyersData, { header: true });
fs.writeFileSync('sample_buyers.csv', buyersCSV);

// Create templates CSV
const templatesCSV = stringify(templatesData, { header: true });
fs.writeFileSync('sample_templates.csv', templatesCSV);

// Create combined CSV with instructions comment
const combined = `# BUYERS DATA - Replace phone numbers with your actual buyer phone numbers
# Format: name, phone (international, no + or spaces), country, product, price_usd, moq, region_hook
${buyersCSV}`;

fs.writeFileSync('sample_buyers_combined.csv', combined);

console.log('✅ CSV files created:');
console.log('  1. sample_buyers.csv - Buyer list');
console.log('  2. sample_templates.csv - Message templates');
console.log('  3. sample_buyers_combined.csv - Alternative format');
console.log('\n📝 How to use:');
console.log('  1. Open sample_buyers.csv in Excel/Google Sheets');
console.log('  2. Replace phone numbers with your actual buyers');
console.log('  3. Save and upload in the app');
console.log('\n💬 Message templates in sample_templates.csv');
console.log('  - 8 realistic sales messages');
console.log('  - Uses placeholders: {{name}}, {{product}}, {{country}}, {{price_usd}}, {{moq}}, {{region_hook}}');
console.log('\n✨ App now supports: .csv, .xlsx files\n');
