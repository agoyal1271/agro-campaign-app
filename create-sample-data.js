const xlsx = require('xlsx');

const workbook = xlsx.utils.book_new();

// Sheet 1: Buyers - Sample data (user just updates phone numbers)
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
  },
  {
    name: 'Rajesh Kumar',
    phone: 919876543211,
    country: 'India',
    product: 'Organic Fertilizer',
    price_usd: 52,
    moq: 8,
    region_hook: 'Certified organic, improves soil health.'
  },
  {
    name: 'Fatima Al-Wahab',
    phone: 971501234567,
    country: 'United Arab Emirates',
    product: 'Drip Irrigation Kit',
    price_usd: 120,
    moq: 2,
    region_hook: 'Water-efficient technology for desert farming.'
  }
];

const buyersSheet = xlsx.utils.json_to_sheet(buyersData);
xlsx.utils.book_append_sheet(workbook, buyersSheet, 'Buyers');

// Sheet 2: Message Templates - Realistic sales messages
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
    content: '{{name}}, heard great things about your agricultural operation. We have {{product}} that other {{country}} farmers are raving about. €{{price_usd}}/unit, MOQ {{moq}}. Interested in samples?'
  },
  {
    template_id: 4,
    content: 'Exclusive offer: {{product}} for {{country}} - {{region_hook}} Limited stock available at ${{price_usd}}/unit (MOQ: {{moq}}). This won\'t last long. When can we connect?'
  },
  {
    template_id: 5,
    content: '{{name}}, {{product}} quality check: ✓ High germination rates ✓ Disease resistant ✓ {{country}} tested. ${{price_usd}}/unit, MOQ {{moq}} units. Shall we arrange a trial?'
  },
  {
    template_id: 6,
    content: 'New arrival alert for {{country}}: {{product}} - Higher yields guaranteed. {{region_hook}} Starting at just ${{price_usd}}/unit (minimum {{moq}} units). Your competitors are already buying. Don\'t fall behind.'
  },
  {
    template_id: 7,
    content: '{{name}}, we\'ve been helping {{country}} farmers for years. Latest batch of {{product}}: premium quality, competitive price (${{price_usd}}/unit, MOQ {{moq}}). Want to be our next success story?'
  },
  {
    template_id: 8,
    content: 'Quick question for you {{name}}: Are you looking for reliable {{product}} supplier for {{country}}? We have stock ready (MOQ {{moq}}, ${{price_usd}}/unit). No middlemen, direct from us. Interested?'
  }
];

const templatesSheet = xlsx.utils.json_to_sheet(templatesData);
xlsx.utils.book_append_sheet(workbook, templatesSheet, 'MessageTemplates');

// Sheet 3: Instructions
const instructionsData = [
  {
    Step: '1. Edit Buyers',
    Instructions: 'Replace phone numbers with your actual buyer phone numbers (international format, no + or spaces)'
  },
  {
    Step: '2. Update Names',
    Instructions: 'Update buyer names if different. Keep country, product, price, MOQ same or update as needed'
  },
  {
    Step: '3. Use Templates',
    Instructions: 'Message templates are ready. System will randomly pick one for each buyer and personalize it'
  },
  {
    Step: '4. Upload',
    Instructions: 'Save file and upload in the Ganesh Agro app. Max 1000 buyers per upload'
  },
  {
    Step: '5. Start',
    Instructions: 'Click START CAMPAIGN. Messages send 90-180 seconds apart, 10 at a time, with 4-hour breaks'
  },
  {
    Step: 'Placeholders',
    Instructions: '{{name}}, {{product}}, {{country}}, {{price_usd}}, {{moq}}, {{region_hook}} - all auto-filled'
  }
];

const instructionsSheet = xlsx.utils.json_to_sheet(instructionsData);
xlsx.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

xlsx.writeFile(workbook, 'sample_buyers_with_messages.xlsx');

console.log('✅ Sample data file created: sample_buyers_with_messages.xlsx');
console.log('📋 Sheet 1: "Buyers" - 10 sample buyers');
console.log('💬 Sheet 2: "MessageTemplates" - 8 realistic sales messages');
console.log('📖 Sheet 3: "Instructions" - How to use');
console.log('\n✏️  Next steps:');
console.log('1. Open the file in Excel/Google Sheets');
console.log('2. Replace phone numbers with your actual buyer numbers');
console.log('3. Update any other details as needed');
console.log('4. Save and upload in the app\n');
