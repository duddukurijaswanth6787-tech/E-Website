
/**
 * Simple ANSI-based logger to provide the "Perfect Terminal Structure"
 * without adding new external dependencies.
 */

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

const symbols = {
  success: '✅',
  warning: '⚠️ ',
  error: '❌',
  info: 'ℹ️ ',
  rocket: '🚀',
  globe: '🌐',
  bolt: '⚡',
  brain: '🧠',
  package: '📦',
  dot: ' • ',
};

export const prettyLog = {
  banner: (title: string) => {
    const line = '═'.repeat(title.length + 40);
    console.log(`${colors.magenta}${colors.bold}╔${line}╗${colors.reset}`);
    console.log(`${colors.magenta}${colors.bold}║${' '.repeat(20)}${title}${' '.repeat(20)}║${colors.reset}`);
    console.log(`${colors.magenta}${colors.bold}╚${line}╝${colors.reset}\n`);
  },

  section: (title: string) => {
    const line = '━'.repeat(80);
    console.log(`${colors.dim}${line}${colors.reset}`);
    console.log(`${colors.bold}${colors.white}${title}${colors.reset}`);
    console.log(`${colors.dim}${line}${colors.reset}\n`);
  },

  item: (label: string, value: string, color = colors.white) => {
    const paddedLabel = label.padEnd(20);
    console.log(`[${colors.cyan}BOOT${colors.reset}] ${colors.bold}${paddedLabel}${colors.reset} → ${color}${value}${colors.reset}`);
  },

  dbItem: (label: string, value: string, color = colors.white) => {
    const paddedLabel = label.padEnd(20);
    console.log(`[${colors.green}DB${colors.reset}] ${colors.bold}${paddedLabel}${colors.reset} → ${color}${value}${colors.reset}`);
  },

  httpItem: (label: string, value: string, color = colors.white) => {
    const paddedLabel = label.padEnd(20);
    console.log(`[${colors.blue}HTTP${colors.reset}] ${colors.bold}${paddedLabel}${colors.reset} → ${color}${value}${colors.reset}`);
  },

  rtItem: (label: string, value: string, color = colors.white) => {
    const paddedLabel = label.padEnd(20);
    console.log(`[${colors.magenta}RT${colors.reset}] ${colors.bold}${paddedLabel}${colors.reset} → ${color}${value}${colors.reset}`);
  },

  redisItem: (label: string, value: string, color = colors.white) => {
    const paddedLabel = label.padEnd(20);
    console.log(`[${colors.cyan}REDIS${colors.reset}] ${colors.bold}${paddedLabel}${colors.reset} → ${color}${value}${colors.reset}`);
  },

  erpItem: (name: string, status: boolean) => {
    const paddedName = name.padEnd(30);
    console.log(`[${colors.magenta}ERP${colors.reset}] ${paddedName} → ${status ? colors.green + '✅' : colors.red + '❌'}${colors.reset}`);
  },

  status: (label: string, value: string, color = colors.green) => {
    const icon = label === 'SERVER STATUS' ? symbols.rocket : symbols.dot;
    console.log(`${icon} ${colors.bold}${label.padEnd(20)}${colors.reset} → ${color}${value}${colors.reset}`);
  },

  footer: (text: string) => {
    const line = '═'.repeat(text.length + 40);
    console.log(`\n${colors.green}${colors.bold}╔${line}╗${colors.reset}`);
    console.log(`${colors.green}${colors.bold}║${' '.repeat(20)}${text}${' '.repeat(20)}║${colors.reset}`);
    console.log(`${colors.green}${colors.bold}╚${line}╝${colors.reset}`);
  },
  
  colors,
  symbols,
};
