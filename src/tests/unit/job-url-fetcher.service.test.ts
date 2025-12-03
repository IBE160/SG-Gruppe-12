// src/tests/unit/job-url-fetcher.service.test.ts

import { jobUrlFetcherService } from '../../services/job-url-fetcher.service';
import axios from 'axios';
import { AppError } from '../../utils/errors.util';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger
jest.mock('../../utils/logger.util', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('jobUrlFetcherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isUrl', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(jobUrlFetcherService.isUrl('http://example.com')).toBe(true);
      expect(jobUrlFetcherService.isUrl('http://example.com/job/123')).toBe(true);
    });

    it('should return true for valid HTTPS URLs', () => {
      expect(jobUrlFetcherService.isUrl('https://example.com')).toBe(true);
      expect(jobUrlFetcherService.isUrl('https://careers.example.com/job-posting')).toBe(true);
    });

    it('should return false for non-URLs', () => {
      expect(jobUrlFetcherService.isUrl('This is a job description')).toBe(false);
      expect(jobUrlFetcherService.isUrl('example.com')).toBe(false);
      expect(jobUrlFetcherService.isUrl('ftp://example.com')).toBe(false);
      expect(jobUrlFetcherService.isUrl('')).toBe(false);
    });

    it('should return false for relative paths', () => {
      expect(jobUrlFetcherService.isUrl('/path/to/page')).toBe(false);
      expect(jobUrlFetcherService.isUrl('../../relative/path')).toBe(false);
    });
  });

  describe('fetchJobPosting', () => {
    it('should successfully fetch and extract job posting content', async () => {
      const mockHtml = `
        <html>
          <body>
            <main>
              <h1>Software Engineer</h1>
              <div class="job-description">
                <p>We are looking for a talented software engineer...</p>
                <ul>
                  <li>5+ years of experience</li>
                  <li>Proficient in JavaScript</li>
                  <li>Experience with React</li>
                </ul>
              </div>
            </main>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtml,
      });

      const result = await jobUrlFetcherService.fetchJobPosting('https://example.com/job/123');

      expect(result).toContain('Software Engineer');
      expect(result).toContain('software engineer');
      expect(result).toContain('JavaScript');
      expect(result.length).toBeGreaterThan(50);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://example.com/job/123',
        expect.objectContaining({
          timeout: 10000,
          maxRedirects: 5,
        })
      );
    });

    it('should throw AppError for invalid URLs', async () => {
      await expect(
        jobUrlFetcherService.fetchJobPosting('not a url')
      ).rejects.toThrow(AppError);

      await expect(
        jobUrlFetcherService.fetchJobPosting('not a url')
      ).rejects.toThrow('Invalid URL provided');
    });

    it('should throw AppError when fetch returns non-200 status', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: '',
      });

      await expect(
        jobUrlFetcherService.fetchJobPosting('https://example.com/job/123')
      ).rejects.toThrow('Failed to fetch URL: HTTP 500');
    });

    it('should handle 404 errors with helpful message', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 },
        message: 'Not found',
      });

      await expect(
        jobUrlFetcherService.fetchJobPosting('https://example.com/job/123')
      ).rejects.toThrow('Job posting not found');
    });

    it('should handle 403 forbidden errors', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 403 },
        message: 'Forbidden',
      });

      await expect(
        jobUrlFetcherService.fetchJobPosting('https://example.com/job/123')
      ).rejects.toThrow('Access denied');
    });

    it('should handle network timeout errors', async () => {
      mockedAxios.get.mockRejectedValue({
        code: 'ETIMEDOUT',
        message: 'Timeout',
      });

      await expect(
        jobUrlFetcherService.fetchJobPosting('https://example.com/job/123')
      ).rejects.toThrow('Request timed out');
    });

    it('should handle DNS resolution errors', async () => {
      mockedAxios.get.mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'Not found',
      });

      await expect(
        jobUrlFetcherService.fetchJobPosting('https://invalid-domain.com/job')
      ).rejects.toThrow('Could not reach the URL');
    });

    it('should remove script and style tags from content', async () => {
      const mockHtml = `
        <html>
          <head>
            <style>body { color: red; }</style>
          </head>
          <body>
            <script>console.log('test');</script>
            <main>
              <h1>Software Engineer Position</h1>
              <p>We are seeking a talented software engineer to join our team...</p>
            </main>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtml,
      });

      const result = await jobUrlFetcherService.fetchJobPosting('https://example.com/job');

      expect(result).toContain('Software Engineer');
      expect(result).not.toContain('console.log');
      expect(result).not.toContain('color: red');
    });

    it('should handle pages with no specific selectors by using body text', async () => {
      const mockHtml = `
        <html>
          <body>
            <div>
              <h1>Job Title</h1>
              <p>This is a job description without specific class names.</p>
            </div>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtml,
      });

      const result = await jobUrlFetcherService.fetchJobPosting('https://example.com/job');

      expect(result).toContain('Job Title');
      expect(result).toContain('job description');
    });

    it('should throw error if extracted content is too short', async () => {
      const mockHtml = `
        <html>
          <body>
            <main>X</main>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtml,
      });

      await expect(
        jobUrlFetcherService.fetchJobPosting('https://example.com/job')
      ).rejects.toThrow('Unable to extract meaningful content from URL');
    });

    it('should clean up excessive whitespace', async () => {
      const mockHtml = `
        <html>
          <body>
            <main>
              Job    Description    With    Extra    Spaces


              And    Multiple    Newlines
            </main>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtml,
      });

      const result = await jobUrlFetcherService.fetchJobPosting('https://example.com/job');

      expect(result).not.toContain('    '); // No multiple spaces
      expect(result.split('\n\n').length).toBeLessThan(5); // Limited newlines
    });
  });

  describe('processInput', () => {
    it('should fetch content when input is a URL', async () => {
      const mockHtml = `
        <html>
          <body>
            <main>
              <h1>Senior Developer</h1>
              <p>Job Description with sufficient content for validation...</p>
            </main>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtml,
      });

      const result = await jobUrlFetcherService.processInput('https://example.com/job');

      expect(result).toContain('Senior Developer');
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should return input as-is when it is plain text', async () => {
      const plainText = 'This is a job description with requirements...';

      const result = await jobUrlFetcherService.processInput(plainText);

      expect(result).toBe(plainText);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should log appropriately for URL vs text input', async () => {
      const { logger } = require('../../utils/logger.util');

      // Test URL input
      const mockHtml = `
        <html>
          <body>
            <main>
              <h1>Software Developer Position</h1>
              <p>We are looking for an experienced software developer to join our growing team. This is a full-time position.</p>
            </main>
          </body>
        </html>
      `;
      mockedAxios.get.mockResolvedValue({ status: 200, data: mockHtml });

      await jobUrlFetcherService.processInput('https://example.com/job');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Input detected as URL')
      );

      jest.clearAllMocks();

      // Test plain text input
      await jobUrlFetcherService.processInput('Plain text job description with sufficient length for testing');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Input detected as plain text')
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle LinkedIn job posting format', async () => {
      const mockLinkedInHtml = `
        <html>
          <body>
            <nav>Navigation</nav>
            <article>
              <h1>Senior Software Engineer</h1>
              <div class="description">
                <p>About the role: We're seeking a talented engineer...</p>
                <h3>Responsibilities:</h3>
                <ul>
                  <li>Design and implement features</li>
                  <li>Collaborate with cross-functional teams</li>
                </ul>
                <h3>Requirements:</h3>
                <ul>
                  <li>5+ years of experience</li>
                  <li>Strong knowledge of JavaScript and React</li>
                </ul>
              </div>
            </article>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockLinkedInHtml,
      });

      const result = await jobUrlFetcherService.fetchJobPosting(
        'https://linkedin.com/jobs/view/12345'
      );

      expect(result).toContain('Senior Software Engineer');
      expect(result).toContain('Responsibilities');
      expect(result).toContain('Requirements');
      expect(result).not.toContain('Navigation'); // Nav should be removed
    });

    it('should handle Indeed job posting format', async () => {
      const mockIndeedHtml = `
        <html>
          <body>
            <div id="job-description">
              <h2>Senior Software Engineer</h2>
              <div>
                <p>Full job description text with requirements and responsibilities...</p>
                <ul>
                  <li>5+ years of experience required</li>
                  <li>Proficiency in JavaScript and TypeScript</li>
                </ul>
              </div>
            </div>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockIndeedHtml,
      });

      const result = await jobUrlFetcherService.fetchJobPosting(
        'https://indeed.com/viewjob?jk=123456'
      );

      expect(result).toContain('Senior Software Engineer');
      expect(result).toContain('job description');
    });
  });
});
