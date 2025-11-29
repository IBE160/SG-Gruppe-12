// src/tests/user.repository.test.ts
import { userRepository } from '../repositories/user.repository';
import { prisma } from '../config/database'; // Import prisma client directly

// Mock the prisma client for repository tests
jest.mock('../config/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('User Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user', async () => {
    const mockUserData = {
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      consent_essential: true,
      consent_ai_training: false,
      consent_marketing: false,
      emailVerificationToken: 'some_token',
      emailVerified: false,
    };
    const mockCreatedUser = { id: '1', ...mockUserData, created_at: new Date(), updated_at: new Date() };

    (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

    const result = await userRepository.create(mockUserData);

    expect(prisma.user.create).toHaveBeenCalledWith({ data: mockUserData });
    expect(result).toEqual(mockCreatedUser);
  });

  it('should find a user by email', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test', passwordHash: 'hashed' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findByEmail('test@example.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(result).toEqual(mockUser);
  });

  it('should find a user by ID', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test', passwordHash: 'hashed' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findById('1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(mockUser);
  });

  it('should update a user', async () => {
    const mockUpdates = { firstName: 'Updated', lastName: 'User' };
    const mockUpdatedUser = { id: 1, email: 'test@example.com', name: 'Updated User', passwordHash: 'hashed', ...mockUpdates };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const result = await userRepository.update('1', mockUpdates);

    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: mockUpdates });
    expect(result).toEqual(mockUpdatedUser);
  });

  it('should update last login', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test', passwordHash: 'hashed' };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.updateLastLogin('1');

    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: {} }); // updatedAt is automatic
    expect(result).toEqual(mockUser);
  });
});
