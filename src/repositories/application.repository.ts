// src/repositories/application.repository.ts
import { prisma } from '../config/database';
import { ApplicationAnalysis } from '@prisma/client';

export interface CreateApplicationData {
  userId: string;
  cvId: number;
  jobPostingId: number;
  generatedCvContent?: string;
  generatedApplicationContent?: string;
  atsFeedback?: object;
  qualityFeedback?: object;
}

export interface UpdateApplicationData {
  generatedCvContent?: string;
  generatedApplicationContent?: string;
  atsFeedback?: object;
  qualityFeedback?: object;
}

export const applicationRepository = {
  async create(data: CreateApplicationData): Promise<ApplicationAnalysis> {
    return prisma.applicationAnalysis.create({
      data: {
        userId: data.userId,
        cvId: data.cvId,
        jobPostingId: data.jobPostingId,
        generatedCvContent: data.generatedCvContent,
        generatedApplicationContent: data.generatedApplicationContent,
        atsFeedback: data.atsFeedback,
        qualityFeedback: data.qualityFeedback,
      },
    });
  },

  async findById(id: number): Promise<ApplicationAnalysis | null> {
    return prisma.applicationAnalysis.findUnique({
      where: { id },
    });
  },

  async findByUserId(userId: string): Promise<ApplicationAnalysis[]> {
    return prisma.applicationAnalysis.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        cv: true,
        jobPosting: true,
      },
    });
  },

  async findByUserAndJob(userId: string, cvId: number, jobPostingId: number): Promise<ApplicationAnalysis | null> {
    return prisma.applicationAnalysis.findFirst({
      where: {
        userId: userId,
        cvId: cvId,
        jobPostingId: jobPostingId,
      },
    });
  },

  async update(id: number, data: UpdateApplicationData): Promise<ApplicationAnalysis> {
    return prisma.applicationAnalysis.update({
      where: { id },
      data: {
        generatedCvContent: data.generatedCvContent,
        generatedApplicationContent: data.generatedApplicationContent,
        atsFeedback: data.atsFeedback,
        qualityFeedback: data.qualityFeedback,
      },
    });
  },

  async delete(id: number): Promise<ApplicationAnalysis> {
    return prisma.applicationAnalysis.delete({
      where: { id },
    });
  },

  async deleteByUserId(userId: string): Promise<{ count: number }> {
    return prisma.applicationAnalysis.deleteMany({
      where: { userId: userId },
    });
  },
};
