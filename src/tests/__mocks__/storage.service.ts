// Mock for storage.service
export const storageService = {
  downloadFile: jest.fn(),
  uploadFile: jest.fn(),
  uploadFileStream: jest.fn(),
  deleteFile: jest.fn(),
  getSignedUrl: jest.fn(),
};
