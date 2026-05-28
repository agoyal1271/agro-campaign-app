const xlsx = require('xlsx');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const processFile = async (filePath, originalFilename = '') => {
  try {
    const fileExtension = (originalFilename || filePath).split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      return await processCSV(filePath);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return await processExcel(filePath);
    } else {
      throw new Error(`Unsupported file format: .${fileExtension}. Use .csv or .xlsx`);
    }
  } catch (error) {
    throw new Error(`File processing error: ${error.message}`);
  }
};

const processCSV = async (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Try to split by blank line to separate buyers and templates
    const sections = fileContent.split(/\n\s*\n+/);

    let buyersCSV = '';
    let templatesCSV = '';

    if (sections.length >= 2) {
      // Both buyers and templates (separated by blank line)
      buyersCSV = sections[0].trim();
      templatesCSV = sections[1].trim();
    } else {
      // Only one section - could be just buyers or just templates
      const lines = fileContent.trim().split('\n');
      const headerLine = lines[0];

      if (headerLine.includes('template') || headerLine.includes('content')) {
        // This is templates, not buyers
        throw new Error('CSV contains only templates. Need buyers data (columns: name, phone, country, product, price_usd, moq, region_hook)');
      } else {
        // Assume it's buyers, but we need templates
        throw new Error('CSV has buyers but no message templates. Add templates section separated by blank line with columns: template_id, content');
      }
    }

    // Parse buyers CSV
    let buyers = [];
    try {
      buyers = parse(buyersCSV, { columns: true, skip_empty_lines: true });
    } catch (error) {
      throw new Error(`Buyers CSV parsing failed: ${error.message}. Check column names: name, phone, country, product, price_usd, moq, region_hook`);
    }

    if (!buyers.length) {
      throw new Error('No buyers found in CSV');
    }

    // Parse templates
    let templates = [];
    try {
      templates = parse(templatesCSV, { columns: true, skip_empty_lines: true });
    } catch (error) {
      throw new Error(`Templates CSV parsing failed: ${error.message}. Check column names: template_id, content`);
    }

    if (!templates.length) {
      throw new Error('No message templates found in CSV. Add templates section with columns: template_id, content');
    }

    const validatedBuyers = buyers.map(buyer => ({
      name: buyer.name || '',
      phone: String(buyer.phone || '').replace(/\D/g, ''),
      country: buyer.country || '',
      product: buyer.product || '',
      price_usd: buyer.price_usd || '',
      moq: buyer.moq || '',
      region_hook: buyer.region_hook || '',
      status: 'pending',
      sent_at: null,
      replied: null,
      reply_message: null
    }));

    const validatedTemplates = templates.map((t, idx) => ({
      template_id: t.template_id || idx + 1,
      content: t.content || ''
    }));

    return {
      buyers: validatedBuyers,
      templates: validatedTemplates
    };
  } catch (error) {
    throw new Error(`CSV processing error: ${error.message}`);
  }
};

const processExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);

    const buyersSheet = workbook.Sheets['Buyers'];
    const templatesSheet = workbook.Sheets['MessageTemplates'];

    if (!buyersSheet) {
      throw new Error('Excel must have a "Buyers" sheet');
    }
    if (!templatesSheet) {
      throw new Error('Excel must have a "MessageTemplates" sheet');
    }

    const buyers = xlsx.utils.sheet_to_json(buyersSheet);
    const templates = xlsx.utils.sheet_to_json(templatesSheet);

    if (!buyers.length) {
      throw new Error('No buyers found in Buyers sheet');
    }
    if (!templates.length) {
      throw new Error('No message templates found in MessageTemplates sheet');
    }

    const validatedBuyers = buyers.map(buyer => ({
      name: buyer.name || '',
      phone: String(buyer.phone).replace(/\D/g, ''),
      country: buyer.country || '',
      product: buyer.product || '',
      price_usd: buyer.price_usd || '',
      moq: buyer.moq || '',
      region_hook: buyer.region_hook || '',
      status: 'pending',
      sent_at: null,
      replied: null,
      reply_message: null
    }));

    const validatedTemplates = templates.map((t, idx) => ({
      template_id: t.template_id || idx + 1,
      content: t.content || ''
    }));

    return {
      buyers: validatedBuyers,
      templates: validatedTemplates
    };
  } catch (error) {
    throw new Error(`Excel processing error: ${error.message}`);
  }
};

module.exports = {
  processFile,
  processExcel,
  processCSV
};
