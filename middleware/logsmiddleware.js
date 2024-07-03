// logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the logs directory exists
const logDirectory = path.join(__dirname,'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logFile = path.join(logDirectory, 'app.log');

const logger = (req, res, next) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} - ${req.url}\n`;

  // Append log entry to the log file
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });

  next();
};

export {logger};
