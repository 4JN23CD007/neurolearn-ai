const pdfParse = require('pdf-parse');
const { analyzeTextMetrics } = require('./readabilityEngine');

async function extractTextFromPDFBuffer(buffer) {
  try {
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text ? pdfData.text.replace(/\r\n/g, '\n').trim() : '';

    if (!extractedText || extractedText.length < 50) {
      throw new Error('PDF file appears empty or scanned without selectable text.');
    }

    const metrics = analyzeTextMetrics(extractedText);

    return {
      text: extractedText,
      pageCount: pdfData.numpages,
      info: pdfData.info,
      metrics,
    };
  } catch (err) {
    console.error('PDF Parsing Error:', err.message);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
}

module.exports = {
  extractTextFromPDFBuffer,
};
