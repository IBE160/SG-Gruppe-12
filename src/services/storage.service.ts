import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in environment variables');
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export const storageService = {
  /**
   * Uploads a file stream to Supabase Storage.
   * @param userId The ID of the user uploading the file.
   * @param fileStream The readable stream of the file content.
   * @param fileName The desired file name in storage.
   * @param mimeType The MIME type of the file.
   * @returns The path of the uploaded file in Supabase Storage.
   */
  async uploadFileStream(userId: string, fileStream: Readable, fileName: string, mimeType: string): Promise<string> {
    const filePath = `${userId}/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from('cvs') // 'cvs' bucket as per Deployment Guide
      .upload(filePath, fileStream, {
        contentType: mimeType,
        upsert: false // Do not overwrite existing files by default
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file to storage: ${error.message}`);
    }

    return data.path;
  },

  /**
   * Uploads a file buffer to Supabase Storage.
   * @param userId The ID of the user uploading the file.
   * @param fileBuffer The buffer of the file content.
   * @param fileName The desired file name in storage.
   * @param mimeType The MIME type of the file.
   * @returns The path of the uploaded file in Supabase Storage.
   */
  async uploadFileBuffer(userId: string, fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const filePath = `${userId}/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from('cvs') // 'cvs' bucket as per Deployment Guide
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false // Do not overwrite existing files by default
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file to storage: ${error.message}`);
    }

    return data.path;
  },


  /**
   * Downloads a file from Supabase Storage.
   * @param filePath The path of the file in Supabase Storage.
   * @returns A Promise that resolves with the file's Buffer.
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    const { data, error } = await supabase.storage
      .from('cvs')
      .download(filePath);

    if (error) {
      console.error('Supabase download error:', error);
      throw new Error(`Failed to download file from storage: ${error.message}`);
    }

    if (!data) {
        throw new Error('No data received when downloading file.');
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  },

  /**
   * Deletes a file from Supabase Storage.
   * @param filePath The path of the file in Supabase Storage.
   */
  async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('cvs')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
  }
};
