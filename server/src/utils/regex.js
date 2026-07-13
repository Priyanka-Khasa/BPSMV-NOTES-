const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const makeSafeContainsRegex = (value, maxLength = 100) => {
  const trimmed = String(value || '').trim().slice(0, maxLength);
  return trimmed ? new RegExp(escapeRegex(trimmed), 'i') : null;
};

module.exports = { escapeRegex, makeSafeContainsRegex };
