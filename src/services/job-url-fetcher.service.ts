// src/services/job-url-fetcher.service.ts

import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';

const USER_AGENT = 'Mozilla/5.0 (compatible; CVAnalyzerBot/1.0)';
const TIMEOUT_MS = 10000;

/**
 * Service for fetching and extracting job posting content from URLs.
 *
 * Supports most job posting sites by attempting multiple content extraction strategies.
 */
export const jobUrlFetcherService = {
  /**
   * Detects if input string is a valid URL.
   *
   * @param input - String to check
   * @returns true if input is a valid HTTP/HTTPS URL
   *
   * @example
   * isUrl('https://example.com/job') // returns true
   * isUrl('This is a job description') // returns false
   */
  isUrl(input: string): boolean {
    try {
      const url = new URL(input);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },

  /**
   * Fetches job posting content from a URL and extracts the text.
   *
   * Uses multiple extraction strategies to handle different job posting sites:
   * 1. Tries common job posting selectors (main, article, .job-description, etc.)
   * 2. Falls back to body text if specific selectors don't match
   * 3. Cleans up whitespace and removes script/style tags
   *
   * @param url - URL of the job posting to fetch
   * @returns Extracted text content of the job posting
   * @throws {AppError} If URL is invalid, fetch fails, or content extraction fails
   *
   * @example
   * const description = await fetchJobPosting('https://careers.example.com/job/123');
   */
  async fetchJobPosting(url: string): Promise<string> {
    if (!this.isUrl(url)) {
      throw new AppError('Invalid URL provided', 400);
    }

    try {
      logger.info(`Fetching job posting from URL: ${url}`);

      const response = await axios.get(url, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: TIMEOUT_MS,
        maxRedirects: 5,
      });

      if (response.status !== 200) {
        throw new AppError(`Failed to fetch URL: HTTP ${response.status}`, 400);
      }

      const $ = cheerio.load(response.data);

      // Remove script, style, and navigation elements
      $('script, style, nav, header, footer').remove();

      // Try common job posting selectors
      let content = '';
      const selectors = [
        'main',
        'article',
        '[role="main"]',
        '.job-description',
        '.job-details',
        '.posting-description',
        '#job-description',
        '#job-details',
        '#posting-description',
        '.description',
        '#description',
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text();
          break;
        }
      }

      // Fallback: get body text if specific selectors don't match
      if (!content || content.length < 100) {
        content = $('body').text();
      }

      // Clean up whitespace
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim();

      if (content.length < 50) {
        throw new AppError(
          'Unable to extract meaningful content from URL. The page may be behind authentication or use dynamic loading.',
          400
        );
      }

      logger.info(`Successfully fetched job posting (${content.length} characters)`);
      return content;
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      logger.error(`Error fetching job posting URL: ${error.message}`, error);

      // Provide helpful error messages based on error type
      let errorMessage = 'Failed to fetch job posting from URL.';

      if (error.code === 'ENOTFOUND') {
        errorMessage = 'Could not reach the URL. Please check the URL is correct.';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Request timed out. The server may be slow or unavailable.';
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        errorMessage =
          'Access denied. The job posting may require authentication or may block automated access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Job posting not found. The URL may be incorrect or the posting may have been removed.';
      }

      throw new AppError(
        `${errorMessage} Please paste the job description text directly instead.`,
        400
      );
    }
  },

  /**
   * Validates and processes job description input (URL or text).
   *
   * If input is a URL, fetches and extracts content.
   * If input is plain text, returns it as-is.
   *
   * @param input - Job description text or URL
   * @returns Job description text
   *
   * @example
   * // With URL
   * const text = await processInput('https://example.com/job');
   *
   * // With text
   * const text = await processInput('This is a job description...');
   */
  async processInput(input: string): Promise<string> {
    if (this.isUrl(input)) {
      logger.info('Input detected as URL, fetching content...');
      return await this.fetchJobPosting(input);
    }

    logger.info('Input detected as plain text');
    return input;
  },
};
