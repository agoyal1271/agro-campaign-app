const xlsx = require('xlsx');

const workbook = xlsx.utils.book_new();

// Sheet 1: Buyers template
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
  }
];

const buyersSheet = xlsx.utils.json_to_sheet(buyersData);
xlsx.utils.book_append_sheet(workbook, buyersSheet, 'Buyers');

// Sheet 2: Message Templates
const templatesData = [
  {
    template_id: 1,
    content: 'Hi {{name}}, we have {{product}} available for {{country}}. MOQ is {{moq}} units at ${{price_usd}}/unit. Interested?'
  },
  {
    template_id: 2,
    content: '{{country}} market is booming! New {{product}} stock just landed. Price: ${{price_usd}}/unit. Can ship immediately.'
  },
  {
    template_id: 3,
    content: '{{name}}, saw you handle agricultural inputs. We have premium {{product}} with proven results. MOQ {{moq}} units.'
  },
  {
    template_id: 4,
    content: 'Fresh {{product}} stock available! ${{price_usd}}/unit for {{country}} buyers. Minimum order {{moq}} units. Let\'s discuss?'
  },
  {
    template_id: 5,
    content: '{{name}}, we\'re expanding into {{country}}. Exclusive {{product}} offer: {{moq}} units minimum, special pricing available.'
  }
];

const templatesSheet = xlsx.utils.json_to_sheet(templatesData);
xlsx.utils.book_append_sheet(workbook, templatesSheet, 'MessageTemplates');

xlsx.writeFile(workbook, 'agro_buyer_template.xlsx');

console.log('✅ Excel template created: agro_buyer_template.xlsx');
console.log('📋 Sheet 1: "Buyers" with 3 sample buyers');
console.log('💬 Sheet 2: "MessageTemplates" with 5 message templates');
console.log('\nYou can now edit this file and upload it in the app.');
