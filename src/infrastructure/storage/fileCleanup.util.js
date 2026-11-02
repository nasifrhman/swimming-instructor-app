const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

function unlinkFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return;
  let targetPath;
  const cleanPath = filePath.replace(/^[\\\/]+/, '');
  if (cleanPath.startsWith('public')) {
    targetPath = cleanPath;
  } else {
    targetPath = path.join('public', cleanPath);
  }

  try {
    if (!fs.existsSync(targetPath)) {
      return;
    }
    const stat = fs.statSync(targetPath);
    if (!stat.isFile()) {
      return;
    }
  } catch (err) {
    return;
  }

  fs.unlink(targetPath, (err) => {
    if (err) {
      logger.error(`Error deleting file ${targetPath}: ${err.message}`);
    } else {
      logger.info(`File ${targetPath} deleted successfully`);
    }
  });
}

module.exports = unlinkFile;

