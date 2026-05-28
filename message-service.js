const selectRandomTemplate = (templates) => {
  return templates[Math.floor(Math.random() * templates.length)];
};

const personalizeMessage = (template, buyer) => {
  let message = template.content;

  message = message.replace(/{{name}}/g, buyer.name || '');
  message = message.replace(/{{phone}}/g, buyer.phone || '');
  message = message.replace(/{{country}}/g, buyer.country || '');
  message = message.replace(/{{product}}/g, buyer.product || '');
  message = message.replace(/{{price_usd}}/g, buyer.price_usd || '');
  message = message.replace(/{{moq}}/g, buyer.moq || '');
  message = message.replace(/{{region_hook}}/g, buyer.region_hook || '');

  return message.trim();
};

const validateTemplate = (template) => {
  const requiredPlaceholders = ['{{name}}', '{{product}}'];
  for (const placeholder of requiredPlaceholders) {
    if (!template.content.includes(placeholder)) {
      return false;
    }
  }
  return true;
};

module.exports = {
  selectRandomTemplate,
  personalizeMessage,
  validateTemplate
};
