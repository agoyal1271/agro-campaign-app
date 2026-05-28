const fs = require('fs');

// Buyers data
const buyers = [
  { name: 'Amara Okafor', phone: '2348012345678', country: 'Nigeria', product: 'Hybrid Seeds', price_usd: '45', moq: '10', region_hook: 'Built for West African soil' },
  { name: 'Kwame Mensah', phone: '233244567890', country: 'Ghana', product: 'Sorghum Seeds', price_usd: '38', moq: '15', region_hook: 'Trusted by Ghana distributors' },
  { name: 'Priya Sharma', phone: '919876543210', country: 'India', product: 'Wheat Seeds', price_usd: '32', moq: '20', region_hook: 'Monsoon-ready stock' },
  { name: 'Mohammed Al-Rashid', phone: '966512345678', country: 'Saudi Arabia', product: 'Premium Fertilizer', price_usd: '75', moq: '5', region_hook: 'High-yield formula' },
  { name: 'Grace Wanjiru', phone: '254712345678', country: 'Kenya', product: 'Maize Seeds', price_usd: '42', moq: '10', region_hook: 'Trusted by East Africa' }
];

// Templates data
const templates = [
  { template_id: '1', content: 'Hi {{name}}, we have premium {{product}} in stock for {{country}}. MOQ {{moq}} units at ${{price_usd}}/unit. Interested?' },
  { template_id: '2', content: '{{country}} farming season! {{product}} - {{region_hook}}. Stock ready. Let\'s discuss?' },
  { template_id: '3', content: '{{name}}, we have {{product}} that {{country}} farmers love. ${{price_usd}}/unit, MOQ {{moq}}. Interested in samples?' },
  { template_id: '4', content: 'New {{product}} stock for {{country}}: ${{price_usd}}/unit (MOQ {{moq}}). {{region_hook}} When can we connect?' },
  { template_id: '5', content: '{{name}}, {{product}} quality: high germination, disease resistant, {{country}} tested. ${{price_usd}}/unit. Trial order?' }
];

// Create buyers section (header + rows)
let buyersSection = 'name,phone,country,product,price_usd,moq,region_hook\n';
buyers.forEach(buyer => {
  buyersSection += `${buyer.name},${buyer.phone},${buyer.country},${buyer.product},${buyer.price_usd},${buyer.moq},"${buyer.region_hook}"\n`;
});

// Create templates section (header + rows)
let templatesSection = 'template_id,content\n';
templates.forEach(template => {
  templatesSection += `${template.template_id},"${template.content}"\n`;
});

// Combine with blank line separator
const fullContent = buyersSection + '\n' + templatesSection;

// Write to file
fs.writeFileSync('READY_TO_UPLOAD.csv', fullContent);

console.log('✅ CSV file created: READY_TO_UPLOAD.csv');
console.log('📋 Section 1: 5 sample buyers');
console.log('💬 Section 2: 5 message templates');
console.log('\n📝 File format:');
console.log('   - Buyers (name, phone, country, product, price_usd, moq, region_hook)');
console.log('   - [BLANK LINE]');
console.log('   - Templates (template_id, content)');
console.log('\n✏️  How to use:');
console.log('   1. Open READY_TO_UPLOAD.csv in Excel');
console.log('   2. Edit phone numbers in the first section (keep country codes!)');
console.log('   3. Edit template content if needed');
console.log('   4. Save the file');
console.log('   5. Upload in the app at http://localhost:3000\n');
