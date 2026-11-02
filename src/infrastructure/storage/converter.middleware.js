const fs = require('fs').promises;
const path = require('path');
const convert = require('heic-convert');
const logger = require('../../utils/logger');

const convertHeicFileToPng = async (file, UPLOADS_FOLDER) => {
  try {
    const heicBuffer = await fs.readFile(file.path);
    const pngBuffer = await convert({
      buffer: heicBuffer,
      format: 'PNG'
    });

    const originalFileName = path.basename(file.originalname, path.extname(file.originalname));
    const currentDateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const pngFileName = `${originalFileName}_${currentDateTime}.png`;
    const pngFilePath = path.join(UPLOADS_FOLDER, pngFileName);

    await fs.writeFile(pngFilePath, pngBuffer);
    await fs.unlink(file.path).catch(() => {});

    file.filename = pngFileName;
    file.path = pngFilePath;
    file.mimetype = 'image/png';
  } catch (error) {
    logger.warn(`HEIC conversion skipped for ${file.originalname || file.filename}: ${error.message}`);
  }
};

const convertHeicToPng = (UPLOADS_FOLDER) => {
  return async (req, res, next) => {
    try {
      const isHeic = (file) =>
        file &&
        (file.mimetype === 'image/heic' ||
          file.mimetype === 'image/heif' ||
          /\.heic$/i.test(file.originalname || '') ||
          /\.heif$/i.test(file.originalname || ''));

      if (req.file && isHeic(req.file)) {
        await convertHeicFileToPng(req.file, UPLOADS_FOLDER);
      }

      if (req.files) {
        if (Array.isArray(req.files)) {
          for (const file of req.files) {
            if (isHeic(file)) {
              await convertHeicFileToPng(file, UPLOADS_FOLDER);
            }
          }
        } else {
          for (const field in req.files) {
            const fieldVal = req.files[field];
            if (Array.isArray(fieldVal)) {
              for (const file of fieldVal) {
                if (isHeic(file)) {
                  await convertHeicFileToPng(file, UPLOADS_FOLDER);
                }
              }
            } else if (isHeic(fieldVal)) {
              await convertHeicFileToPng(fieldVal, UPLOADS_FOLDER);
            }
          }
        }
      }
    } catch (err) {
      logger.warn(`HEIC converter middleware warning: ${err.message}`);
    }

    next();
  };
};

module.exports = convertHeicToPng;

