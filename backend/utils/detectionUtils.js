
const PATTERNS = {
  // Standard email pattern - IMPROVED
  EMAIL_STANDARD: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  
  // Email with [at] or (at) or {at} replacements
  EMAIL_AT_REPLACED: /\b[A-Za-z0-9._%+-]+\s*(?:\[at\]|\(at\)|\{at\}|@|at\s+dot)\s*[A-Za-z0-9.-]+\s*(?:\[dot\]|\(dot\)|\{dot\}|\.|dot)\s*[A-Za-z]{2,}\b/gi,
  
  // Email with "at" and "dot" spelled out
  EMAIL_SPELLED: /\b[A-Za-z0-9._%+-]+\s+(?:at|AT)\s+[A-Za-z0-9.-]+\s+(?:dot|DOT)\s+[A-Za-z]{2,}\b/gi,
  
  // Email with spaces between characters
  EMAIL_SPACED: /\b[A-Za-z0-9._%+-]+\s+@\s+[A-Za-z0-9.-]+\s+\.\s+[A-Za-z]{2,}\b/gi,
  
  // Email without dots but with "dot" word
  EMAIL_DOT_WORD: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\s+dot\s+[A-Za-z]{2,}\b/gi,
  
  // Email with common domain patterns
  EMAIL_COMMON: /\b[A-Za-z0-9._%+-]+@(?:gmail|yahoo|hotmail|outlook|aol|icloud|protonmail|mail|email)\.(?:com|net|org|co|uk|in|io)\b/gi,
  
  // Standard phone pattern - various formats
  PHONE_STANDARD: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  
  // Phone with spaces and words (three, four, five etc)
  PHONE_WITH_WORDS: /\b\d{3,4}\s+(?:three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+\d{3,4}\b/gi,
  
  // Phone with country code variations
  PHONE_COUNTRY: /(?:\+|00)\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
  
  // Phone with separators like spaces, dots, dashes
  PHONE_SEPARATED: /\b\d{3,4}[\s.-]\d{3,4}[\s.-]\d{3,4}\b/g,
  
  // Phone without separators but with obvious pattern
  PHONE_CONTINUOUS: /\b\d{10,15}\b/g,
  
  // Phone with "zero" instead of 0
  PHONE_ZERO_WORD: /\b(?:zero|oh|o)\s*\d[\s\d]*\b/gi,
  
  // Standard URL pattern
  URL_STANDARD: /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi,
  
  // URL without protocol but with common TLDs
  URL_DOMAIN_ONLY: /\b(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|edu|gov|io|co|uk|de|jp|fr|au|ru|ch|it|nl|se|no|dk|fi|pl|cz|hu|pt|gr|eu|info|biz|tv|me|asia|xxx)\b/gi,
  
  // URL with spaces removed or added
  URL_SPACED: /(?:https?:\/\/)?\s*(?:www\.)?\s*[a-zA-Z0-9-]+\s*\.\s*(?:com|org|net|edu|gov|io|co|uk|de|jp|fr|au|ru|ch|it|nl|se|no|dk|fi|pl|cz|hu|pt|gr|eu|info|biz|tv|me|asia|xxx)(?:\s*\/\s*[^\s]*)?/gi,
  
  // URL with "dot" instead of .
  URL_DOT_WORD: /\b(?:https?:\/\/)?(?:www\s+dot\s+)?[a-zA-Z0-9-]+\s+dot\s+(?:com|org|net|edu|gov|io|co|uk|de|jp|fr|au|ru|ch|it|nl|se|no|dk|fi|pl|cz|hu|pt|gr|eu|info|biz|tv|me|asia|xxx)(?:\s*\/\s*[^\s]*)?/gi,
  
  // Social media handles with @
  SOCIAL: /@[a-zA-Z0-9_]+/g,
  
  // Social media without @ but obvious
  SOCIAL_WORDS: /\b(?:telegram|whatsapp|wechat|signal|discord|skype|line|viber|kik|snapchat|instagram|fb|facebook|twitter|x\s+com|tiktok|youtube|yt)\s*[:\s]*(?:@)?[a-zA-Z0-9_.]+/gi,
  
  // IP addresses
  IP: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  
  // Common messaging apps and platforms
  MESSAGING_APPS: /\b(?:whatsapp|wa\.me|telegram|t\.me|wechat|signal|discord|skype|kik|viber|line|snapchat|instagram|fb\.me|facebook\.com\/[a-zA-Z0-9_.]+)\b/gi,
  
  // Email keywords with potential data
  EMAIL_KEYWORDS: /\b(?:email|e-?mail|mail|inbox|contact me at|reach me at|drop me a line|shoot me an?)\s*[:\s]*[^\s]+/gi,
  
  // Phone keywords
  PHONE_KEYWORDS: /\b(?:call|text|whatsapp|phone|mobile|cell|number|contact|reach|ping|dm)\s*(?:me|us)?\s*(?:at|on)?\s*[:\s]*[^\s]+/gi,
  
  // Link keywords
  LINK_KEYWORDS: /\b(?:link|url|website|site|page|profile|check out|visit|go to|click)\s*(?:this|here|the)?\s*[:\s]*[^\s]+/gi,
  
  // Payment/platform references
  PAYMENT_PLATFORMS: /\b(?:paypal|venmo|cashapp|zelle|paytm|gpay|googlepay|applepay|amazonpay)\s*(?:link|id|username|handle)?\s*[:\s]*[^\s]+/gi
};

// Warning types enum
const WARNING_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone', 
  LINK: 'link',
  SOCIAL: 'social',
  IP: 'ip',
  PAYMENT: 'payment',
  OTHER: 'other'
};

/**
 * Clean text by removing extra spaces and normalizing
 */
const normalizeText = (text) => {
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Detect if text contains email-like patterns (including obfuscated)
 */
const containsEmail = (content) => {
  if (!content) return false;
  
  const normalized = normalizeText(content);
  
  // Check for standard email - THIS IS THE CRITICAL PATTERN
  if (PATTERNS.EMAIL_STANDARD.test(normalized)) {
    console.log('📧 Email detected (standard pattern):', normalized.match(PATTERNS.EMAIL_STANDARD));
    return true;
  }
  
  // Check for common email domains
  if (PATTERNS.EMAIL_COMMON.test(normalized)) {
    console.log('📧 Email detected (common domain pattern):', normalized.match(PATTERNS.EMAIL_COMMON));
    return true;
  }
  
  // Check for email with [at] and [dot]
  if (PATTERNS.EMAIL_AT_REPLACED.test(normalized)) {
    console.log('📧 Email detected (at/dot replaced)');
    return true;
  }
  
  // Check for spelled out email
  if (PATTERNS.EMAIL_SPELLED.test(normalized)) {
    console.log('📧 Email detected (spelled out)');
    return true;
  }
  
  // Check for spaced email
  if (PATTERNS.EMAIL_SPACED.test(normalized)) {
    console.log('📧 Email detected (spaced)');
    return true;
  }
  
  // Check for email without proper dots
  if (PATTERNS.EMAIL_DOT_WORD.test(normalized)) {
    console.log('📧 Email detected (dot word)');
    return true;
  }
  
  // Check for email keywords followed by potential email
  PATTERNS.EMAIL_KEYWORDS.lastIndex = 0;
  const keywordMatch = PATTERNS.EMAIL_KEYWORDS.exec(normalized);
  if (keywordMatch) {
    // If keyword found, check if there's a plausible email-like string after it
    const afterKeyword = normalized.substring(keywordMatch.index + keywordMatch[0].length);
    // Look for patterns like "name at domain dot com" or just "name" that could be username
    if (/[a-zA-Z0-9._%+-]+/.test(afterKeyword)) {
      console.log('📧 Email detected (keyword context)');
      return true;
    }
  }
  
  return false;
};

/**
 * Detect if text contains phone-like patterns (including obfuscated)
 */
const containsPhone = (content) => {
  if (!content) return false;
  
  const normalized = normalizeText(content);
  
  // Check for standard phone
  if (PATTERNS.PHONE_STANDARD.test(normalized)) {
    console.log('📱 Phone detected (standard)');
    return true;
  }
  
  // Check for phone with country code
  if (PATTERNS.PHONE_COUNTRY.test(normalized)) {
    console.log('📱 Phone detected (with country code)');
    return true;
  }
  
  // Check for phone with separators
  if (PATTERNS.PHONE_SEPARATED.test(normalized)) {
    console.log('📱 Phone detected (separated)');
    return true;
  }
  
  // Check for continuous digits that look like phone
  if (PATTERNS.PHONE_CONTINUOUS.test(normalized)) {
    console.log('📱 Phone detected (continuous digits)');
    return true;
  }
  
  // Check for phone with words (three four five etc)
  if (PATTERNS.PHONE_WITH_WORDS.test(normalized)) {
    console.log('📱 Phone detected (with words)');
    return true;
  }
  
  // Check for phone with "zero" instead of 0
  if (PATTERNS.PHONE_ZERO_WORD.test(normalized)) {
    console.log('📱 Phone detected (zero word)');
    return true;
  }
  
  // Check for phone keywords followed by numbers
  PATTERNS.PHONE_KEYWORDS.lastIndex = 0;
  const keywordMatch = PATTERNS.PHONE_KEYWORDS.exec(normalized);
  if (keywordMatch) {
    const afterKeyword = normalized.substring(keywordMatch.index + keywordMatch[0].length);
    // Look for numbers after the keyword
    if (/\d+/.test(afterKeyword)) {
      console.log('📱 Phone detected (keyword context)');
      return true;
    }
  }
  
  // Check for patterns like "03 04 384 4829" (spaced out digits)
  const spacedDigits = normalized.replace(/\s+/g, '').match(/\d{10,}/);
  if (spacedDigits) {
    console.log('📱 Phone detected (spaced digits)');
    return true;
  }
  
  return false;
};

/**
 * Detect if text contains URL-like patterns (including obfuscated)
 */
const containsLink = (content) => {
  if (!content) return false;
  
  const normalized = normalizeText(content);
  
  // Check for standard URL
  if (PATTERNS.URL_STANDARD.test(normalized)) {
    console.log('🔗 Link detected (standard)');
    return true;
  }
  
  // Check for domain only with common TLDs
  if (PATTERNS.URL_DOMAIN_ONLY.test(normalized)) {
    console.log('🔗 Link detected (domain only)');
    return true;
  }
  
  // Check for URL with spaces
  if (PATTERNS.URL_SPACED.test(normalized)) {
    console.log('🔗 Link detected (spaced)');
    return true;
  }
  
  // Check for URL with "dot" instead of .
  if (PATTERNS.URL_DOT_WORD.test(normalized)) {
    console.log('🔗 Link detected (dot word)');
    return true;
  }
  
  // Check for messaging app links
  if (PATTERNS.MESSAGING_APPS.test(normalized)) {
    console.log('🔗 Link detected (messaging app)');
    return true;
  }
  
  // Check for link keywords followed by potential URL
  PATTERNS.LINK_KEYWORDS.lastIndex = 0;
  const keywordMatch = PATTERNS.LINK_KEYWORDS.exec(normalized);
  if (keywordMatch) {
    const afterKeyword = normalized.substring(keywordMatch.index + keywordMatch[0].length);
    // Look for domain-like patterns after the keyword
    if (/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(afterKeyword)) {
      console.log('🔗 Link detected (keyword context)');
      return true;
    }
  }
  
  return false;
};

/**
 * Detect if text contains payment platform references
 */
const containsPayment = (content) => {
  if (!content) return false;
  
  const normalized = normalizeText(content);
  
  // Check for payment platforms
  if (PATTERNS.PAYMENT_PLATFORMS.test(normalized)) {
    console.log('💰 Payment detected');
    return true;
  }
  
  // Check for payment keywords
  if (/\b(?:pay|send money|transfer|payment|deposit|withdraw)\b/i.test(normalized)) {
    // If payment keyword found, check if there's a platform reference
    if (/(?:paypal|venmo|cashapp|zelle|paytm|gpay|googlepay|applepay|amazonpay)/i.test(normalized)) {
      console.log('💰 Payment detected (keyword + platform)');
      return true;
    }
  }
  
  return false;
};

/**
 * Detect prohibited content in a message
 * @param {string} content - The message content to check
 * @returns {Array} - Array of detected warning types
 */
const detectProhibitedContent = (content) => {
  if (!content || typeof content !== 'string') {
    return [];
  }

  console.log('🔍 Checking content for prohibited content:', content.substring(0, 100));

  const detectedTypes = [];

  // Check for emails
  if (containsEmail(content)) {
    detectedTypes.push(WARNING_TYPES.EMAIL);
    console.log('✅ EMAIL detected');
  }

  // Check for phone numbers
  if (containsPhone(content)) {
    detectedTypes.push(WARNING_TYPES.PHONE);
    console.log('✅ PHONE detected');
  }

  // Check for URLs/links
  if (containsLink(content)) {
    detectedTypes.push(WARNING_TYPES.LINK);
    console.log('✅ LINK detected');
  }

  // Check for social media handles
  if (PATTERNS.SOCIAL.test(content) || PATTERNS.SOCIAL_WORDS.test(content)) {
    detectedTypes.push(WARNING_TYPES.SOCIAL);
    console.log('✅ SOCIAL detected');
  }

  // Check for IP addresses
  if (PATTERNS.IP.test(content)) {
    detectedTypes.push(WARNING_TYPES.IP);
    console.log('✅ IP detected');
  }

  // Check for payment platforms
  if (containsPayment(content)) {
    detectedTypes.push(WARNING_TYPES.PAYMENT);
    console.log('✅ PAYMENT detected');
  }

  // Remove duplicates and return
  const uniqueTypes = [...new Set(detectedTypes)];
  console.log('🎯 Detected types:', uniqueTypes);
  
  return uniqueTypes;
};

/**
 * Generate redacted version of content
 * @param {string} content - Original content
 * @param {Array} detectedTypes - Types of content detected
 * @returns {string} - Redacted content
 */
const generateRedactedContent = (content, detectedTypes) => {
  if (!content) return content;

  let redacted = content;

  // Redact emails and email-like patterns
  if (detectedTypes.includes(WARNING_TYPES.EMAIL)) {
    // Replace various email patterns
    redacted = redacted.replace(PATTERNS.EMAIL_STANDARD, '[EMAIL REDACTED]');
    redacted = redacted.replace(PATTERNS.EMAIL_COMMON, '[EMAIL REDACTED]');
    redacted = redacted.replace(PATTERNS.EMAIL_AT_REPLACED, '[EMAIL REDACTED]');
    redacted = redacted.replace(PATTERNS.EMAIL_SPELLED, '[EMAIL REDACTED]');
    redacted = redacted.replace(PATTERNS.EMAIL_SPACED, '[EMAIL REDACTED]');
    redacted = redacted.replace(PATTERNS.EMAIL_DOT_WORD, '[EMAIL REDACTED]');
    
    // Redact email keywords and following content
    redacted = redacted.replace(PATTERNS.EMAIL_KEYWORDS, (match) => {
      return match.replace(/[^\s]+$/, '[REDACTED]');
    });
  }

  // Redact phone numbers
  if (detectedTypes.includes(WARNING_TYPES.PHONE)) {
    redacted = redacted.replace(PATTERNS.PHONE_STANDARD, '[PHONE REDACTED]');
    redacted = redacted.replace(PATTERNS.PHONE_COUNTRY, '[PHONE REDACTED]');
    redacted = redacted.replace(PATTERNS.PHONE_SEPARATED, '[PHONE REDACTED]');
    redacted = redacted.replace(PATTERNS.PHONE_CONTINUOUS, '[PHONE REDACTED]');
    redacted = redacted.replace(PATTERNS.PHONE_WITH_WORDS, '[PHONE REDACTED]');
    
    // Redact phone keywords and following numbers
    redacted = redacted.replace(PATTERNS.PHONE_KEYWORDS, (match) => {
      return match.replace(/\d+[-\s\d]*$/, '[REDACTED]');
    });
  }

  // Redact URLs
  if (detectedTypes.includes(WARNING_TYPES.LINK)) {
    redacted = redacted.replace(PATTERNS.URL_STANDARD, '[LINK REDACTED]');
    redacted = redacted.replace(PATTERNS.URL_DOMAIN_ONLY, '[LINK REDACTED]');
    redacted = redacted.replace(PATTERNS.URL_SPACED, '[LINK REDACTED]');
    redacted = redacted.replace(PATTERNS.URL_DOT_WORD, '[LINK REDACTED]');
    redacted = redacted.replace(PATTERNS.MESSAGING_APPS, '[LINK REDACTED]');
    
    // Redact link keywords and following URLs
    redacted = redacted.replace(PATTERNS.LINK_KEYWORDS, (match) => {
      return match.replace(/[^\s]+\.[^\s]+$/, '[REDACTED]');
    });
  }

  // Redact social media handles
  if (detectedTypes.includes(WARNING_TYPES.SOCIAL)) {
    redacted = redacted.replace(PATTERNS.SOCIAL, '[SOCIAL REDACTED]');
    redacted = redacted.replace(PATTERNS.SOCIAL_WORDS, (match) => {
      return match.replace(/[@a-zA-Z0-9_.]+$/, '[REDACTED]');
    });
  }

  // Redact IP addresses
  if (detectedTypes.includes(WARNING_TYPES.IP)) {
    redacted = redacted.replace(PATTERNS.IP, '[IP REDACTED]');
  }

  // Redact payment platforms
  if (detectedTypes.includes(WARNING_TYPES.PAYMENT)) {
    redacted = redacted.replace(PATTERNS.PAYMENT_PLATFORMS, (match) => {
      return match.replace(/[^\s]+$/, '[REDACTED]');
    });
  }

  return redacted;
};

/**
 * Determine if message should be blocked entirely
 * @param {Array} detectedTypes - Types of content detected
 * @returns {boolean} - True if message should be blocked
 */
const shouldBlockMessage = (detectedTypes) => {
  // Block messages that contain any prohibited content
  return detectedTypes.length > 0;
};

/**
 * Get warning message based on warning number
 * @param {number} warningNumber - The warning number (1, 2, or 3)
 * @returns {string} - Warning message
 */
const getWarningMessage = (warningNumber) => {
  const messages = {
    1: '⚠️ First Warning: Do not share personal contact information (emails, phone numbers, links). This violates our terms of service.',
    2: '⚠️⚠️ Second Warning: Sharing personal contact information is strictly prohibited. This includes disguised formats like "name at domain dot com" or spaced out numbers. Further violations will result in account deactivation.',
    3: '⚠️⚠️⚠️ Final Warning: Your account has been deactivated for repeatedly violating our terms of service regarding sharing personal contact information.'
  };
  
  return messages[warningNumber] || messages[1];
};

/**
 * Check if content contains specific type of prohibited content
 * @param {string} content - Message content
 * @param {string} type - Type to check for
 * @returns {boolean} - True if contains that type
 */
const containsType = (content, type) => {
  if (!content) return false;
  
  switch(type) {
    case WARNING_TYPES.EMAIL:
      return containsEmail(content);
    case WARNING_TYPES.PHONE:
      return containsPhone(content);
    case WARNING_TYPES.LINK:
      return containsLink(content);
    case WARNING_TYPES.SOCIAL:
      return PATTERNS.SOCIAL.test(content) || PATTERNS.SOCIAL_WORDS.test(content);
    case WARNING_TYPES.IP:
      return PATTERNS.IP.test(content);
    case WARNING_TYPES.PAYMENT:
      return containsPayment(content);
    default:
      return false;
  }
};

/**
 * Extract all prohibited content from message
 * @param {string} content - Message content
 * @returns {Object} - Object with arrays of detected items
 */
const extractProhibitedContent = (content) => {
  if (!content) {
    return {
      emails: [],
      phones: [],
      links: [],
      socials: [],
      ips: [],
      payments: []
    };
  }

  return {
    emails: content.match(PATTERNS.EMAIL_STANDARD) || [],
    phones: content.match(PATTERNS.PHONE_STANDARD) || [],
    links: content.match(PATTERNS.URL_STANDARD) || [],
    socials: content.match(PATTERNS.SOCIAL) || [],
    ips: content.match(PATTERNS.IP) || [],
    payments: content.match(PATTERNS.PAYMENT_PLATFORMS) || []
  };
};

/**
 * Validate if content is clean (no prohibited content)
 * @param {string} content - Message content
 * @returns {boolean} - True if content is clean
 */
const isContentClean = (content) => {
  return detectProhibitedContent(content).length === 0;
};

module.exports = {
  detectProhibitedContent,
  generateRedactedContent,
  shouldBlockMessage,
  getWarningMessage,
  containsType,
  extractProhibitedContent,
  isContentClean,
  WARNING_TYPES,
  PATTERNS
};