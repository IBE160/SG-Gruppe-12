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
        user_id: data.userId,
        cv_id: data.cvId,
        job_posting_id: data.jobPostingId,
        generated_cv_content: data.generatedCvContent,
        generated_application_content: data.generatedApplicationContent,
        ats_feedback: data.atsFeedback,
        quality_feedback: data.qualityFeedback,
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
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        cv: true,
        job_posting: true,
      },
    });
  },

  async findByUserAndJob(userId: string, cvId: number, jobPostingId: number): Promise<ApplicationAnalysis | null> {
    return prisma.applicationAnalysis.findFirst({
      where: {
        user_id: userId,
        cv_id: cvId,
        job_posting_id: jobPostingId,
      },
    });
  },

  async update(id: number, data: UpdateApplicationData): Promise<ApplicationAnalysis> {
    return prisma.applicationAnalysis.update({
      where: { id },
      data: {
        generated_cv_content: data.generatedCvContent,
        generated_application_content: data.generatedApplicationContent,
        ats_feedback: data.atsFeedback,
        quality_feedback: data.qualityFeedback,
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
      where: { user_id: userId },
    });
  },
};
