const sanitizeMongoValue = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeMongoValue);
  if (!value || typeof value !== 'object') return value;

  return Object.entries(value).reduce((safe, [key, nestedValue]) => {
    if (key.startsWith('$') || key.includes('.')) return safe;
    safe[key] = sanitizeMongoValue(nestedValue);
    return safe;
  }, {});
};

const mongoSanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeMongoValue(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeMongoValue(req.params);
  }
  next();
};

const asString = (value, maxLength = 200) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
};

const asInteger = (value, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
};

const asBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

module.exports = { sanitizeMongoValue, mongoSanitize, asString, asInteger, asBoolean };
