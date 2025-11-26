import htmlPdf from 'html-pdf-node';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import fs from 'fs/promises';
import path from 'path';
import { CvData } from '../types/cv.types';

export const documentGenerationService = {
  async generateCVPDF(cvData: CvData, templateIdentifier: string = 'default'): Promise<Buffer> {
    // For MVP, we'll use a very basic hardcoded HTML template.
    // In a full implementation, templateIdentifier would load different
    // HTML templates or partials from a 'templates' directory.
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>CV - ${cvData.personal_info.name}</title>
          <style>
              body { font-family: sans-serif; margin: 2cm; }
              h1 { color: #333; text-align: center; }
              h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; }
              p { margin-bottom: 5px; }
              .section { margin-bottom: 15px; }
              .experience-item, .education-item { margin-bottom: 10px; }
              .experience-item strong, .education-item strong { display: block; }
              ul { list-style-type: none; padding: 0; }
              ul li { display: inline-block; background: #eee; padding: 3px 8px; margin: 0 5px 5px 0; border-radius: 3px; }
          </style>
      </head>
      <body>
          <h1>${cvData.personal_info.name}</h1>
          <p style="text-align: center;">${cvData.personal_info.email} | ${cvData.personal_info.phone}</p>

          <div class="section">
              <h2>Work Experience</h2>
              ${cvData.experience.map(exp => `
                  <div class="experience-item">
                      <strong>${exp.title} at ${exp.company}</strong>
                      <p>${exp.dates}</p>
                      <p>${exp.description}</p>
                  </div>
              `).join('')}
          </div>

          <div class="section">
              <h2>Education</h2>
              ${cvData.education.map(edu => `
                  <div class="education-item">
                      <strong>${edu.degree} - ${edu.institution}</strong>
                      <p>${edu.dates}</p>
                  </div>
              `).join('')}
          </div>

          <div class="section">
              <h2>Skills</h2>
              <ul>
                  ${cvData.skills.map(skill => `<li>${skill}</li>`).join('')}
              </ul>
          </div>
      </body>
      </html>
    `;

    const file = { content: htmlContent };
    const options = { format: 'A4', printBackground: true }; // Use printBackground to ensure colors/images are printed

    // html-pdf-node expects options as a second argument, not part of file
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    return pdfBuffer;
  },

  async generateCVDOCX(cvData: CvData): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: cvData.personal_info.name,
              heading: HeadingLevel.HEADING_1,
              alignment: 'center'
            }),
            new Paragraph({
              children: [
                new TextRun(cvData.personal_info.email),
                new TextRun(' | '),
                new TextRun(cvData.personal_info.phone)
              ],
              alignment: 'center'
            }),
            new Paragraph({
              text: 'Work Experience',
              heading: HeadingLevel.HEADING_2
            }),
            ...cvData.experience.map(exp =>
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title, bold: true }),
                  new TextRun(` at ${exp.company}`),
                  new TextRun({ text: `\n${exp.dates}`, italics: true }),
                  new TextRun(`\n${exp.description}`)
                ]
              })
            ),
            new Paragraph({
              text: 'Education',
              heading: HeadingLevel.HEADING_2
            }),
            ...cvData.education.map(edu =>
              new Paragraph({
                children: [
                  new TextRun({ text: edu.degree, bold: true }),
                  new TextRun(` - ${edu.institution}`),
                  new TextRun({ text: `\n${edu.dates}`, italics: true })
                ]
              })
            ),
            new Paragraph({
              text: 'Skills',
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: cvData.skills.join(', ')
            })
          ]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
};
