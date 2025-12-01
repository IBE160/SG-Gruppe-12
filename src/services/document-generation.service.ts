import htmlPdf from 'html-pdf-node';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { CVData } from '../types/cv.types'; // Assuming this type exists

export const documentGenerationService = {
  async generateCVPDF(cvData: CVData, templateName: string = 'modern') {
    // Load HTML template
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    // Placeholder content if template doesn't exist yet
    let templateContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CV</title>
        <style>
          body { font-family: sans-serif; margin: 1cm; }
          h1 { color: #2563EB; }
          .section { margin-bottom: 0.5cm; }
          .section-title { font-weight: bold; margin-bottom: 0.2cm; border-bottom: 1px solid #eee; padding-bottom: 0.1cm;}
          .experience-item, .education-item { margin-bottom: 0.2cm; }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
        </style>
      </head>
      <body>
        <h1>{{personal_info.name}}</h1>
        <p>{{personal_info.email}} | {{personal_info.phone}} | {{personal_info.address}}</p>

        <div class="section">
          <div class="section-title">Experience</div>
          {{#each experience}}
            <div class="experience-item">
              <div class="bold">{{this.title}} at {{this.company}}</div>
              <div class="italic">{{this.dates}}</div>
              <div>{{this.description}}</div>
            </div>
          {{/each}}
        </div>

        <div class="section">
          <div class="section-title">Education</div>
          {{#each education}}
            <div class="education-item">
              <div class="bold">{{this.degree}} - {{this.institution}}</div>
              <div class="italic">{{this.dates}}</div>
            </div>
          {{/each}}
        </div>

        <div class="section">
          <div class="section-title">Skills</div>
          <div>{{skills}}</div>
        </div>
      </body>
      </html>
    `;

    try {
      // Attempt to read the actual template file
      templateContent = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.warn(`Template file ${templatePath} not found, using placeholder content.`);
      // Proceed with placeholder content
    }


    // Compile Handlebars template
    const template = Handlebars.compile(templateContent);
    const html = template(cvData);

    const options = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    };
    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    return pdfBuffer;
  },

  async generateCVDOCX(cvData: CVData) {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header: Name
            new Paragraph({
              text: cvData.personal_info.name,
              heading: HeadingLevel.HEADING_1,
              alignment: 'center'
            }),

            // Contact info
            new Paragraph({
              children: [
                new TextRun(cvData.personal_info.email || ''),
                new TextRun(' | '),
                new TextRun(cvData.personal_info.phone || '')
              ],
              alignment: 'center'
            }),

            // Work Experience section
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

            // Education section
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

            // Skills section
            new Paragraph({
              text: 'Skills',
              heading: HeadingLevel.HEADING_2
            }),

            new Paragraph({
              text: cvData.skills ? cvData.skills.join(', ') : ''
            })
          ]
        }
      ]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
};
