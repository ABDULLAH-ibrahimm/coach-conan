const fs = require('fs');
const logFile = '/tmp/coach-crash.log';

process.on('uncaughtException', (err) => {
  const msg = `[${new Date().toISOString()}] UNCAUGHT: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
  console.error(msg);
});

process.on('unhandledRejection', (reason, promise) => {
  const msg = `[${new Date().toISOString()}] UNHANDLED: ${reason}\n`;
  fs.appendFileSync(logFile, msg);
  console.error(msg);
});

process.on('exit', (code) => {
  const msg = `[${new Date().toISOString()}] EXIT: code=${code}\n`;
  fs.appendFileSync(logFile, msg);
});

process.on('SIGTERM', () => {
  const msg = `[${new Date().toISOString()}] SIGTERM received\n`;
  fs.appendFileSync(logFile, msg);
});

process.on('SIGINT', () => {
  const msg = `[${new Date().toISOString()}] SIGINT received\n`;
  fs.appendFileSync(logFile, msg);
});
