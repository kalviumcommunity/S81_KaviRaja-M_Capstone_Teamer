import { register, login, logout, getProfile, googleLogin } from '../controllers/authController';
import { User } from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

jest.mock('../models/userModel', () => {
  const mockUser = jest.fn();
  mockUser.findOne = jest.fn();
  mockUser.create = jest.fn();
  return { User: mockUser };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('google-auth-library', () => {
  const mockVerifyIdToken = jest.fn();
  const mockOAuth2ClientInstance = {
    verifyIdToken: mockVerifyIdToken,
  };
  const mockOAuth2Client = jest.fn(() => mockOAuth2ClientInstance);
  return { OAuth2Client: mockOAuth2Client, mockVerifyIdToken };
});

const mockRequest = (body = {}, user = null) => ({
  body,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller Tests (Selected 5)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      const mockUserInstance = {
        _id: 'someid',
        generateToken: jest.fn().mockReturnValue('mocktoken'),
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUserInstance);

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User registered successfully' }));
    });
  });

  describe('login', () => {
    it('should return 400 for invalid credentials (user not found)', async () => {
      const req = mockRequest({
        email: 'nonexistent@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear the token cookie and return success message', () => {
      const req = mockRequest();
      const res = mockResponse();

      logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
    });
  });

  describe('getProfile', () => {
    it('should return the user profile if authenticated', async () => {
      const mockUser = { _id: 'someid', name: 'Authenticated User' };
      const req = mockRequest(null, mockUser);
      const res = mockResponse();

      await getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(res.status).not.toHaveBeenCalledWith(404);
    });
  });

  describe('googleLogin', () => {
    it('should create a new user if not found by Google ID or email', async () => {
      const mockGoogleToken = 'mockGoogleIdToken';
      const mockGooglePayload = {
        sub: 'googleid123',
        email: 'googleuser@example.com',
        name: 'Google User',
      };
      const req = mockRequest({ token: mockGoogleToken });
      const res = mockResponse();

      const mockTicket = { getPayload: jest.fn().mockReturnValue(mockGooglePayload) };

      const { mockVerifyIdToken } = require('google-auth-library');
      mockVerifyIdToken.mockResolvedValue(mockTicket);

      User.findOne.mockResolvedValueOnce(null);
      User.findOne.mockResolvedValueOnce(null);

      const mockNewUser = {
        _id: 'newuserid',
        generateToken: jest.fn().mockReturnValue('mockauthtoken'),
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockNewUser);

      await googleLogin(req, res);

      expect(mockVerifyIdToken).toHaveBeenCalledWith({ idToken: mockGoogleToken, audience: process.env.GOOGLE_CLIENT_ID });
      expect(User.findOne).toHaveBeenCalledTimes(2);
      expect(User).toHaveBeenCalledWith(expect.objectContaining({
        googleId: 'googleid123',
        email: 'googleuser@example.com',
        name: 'Google User',
      }));
      expect(mockNewUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Google login successful' }));
    });
  });
});
