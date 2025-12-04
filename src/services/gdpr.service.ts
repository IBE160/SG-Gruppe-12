// src/services/gdpr.service.ts
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';

export interface UserDataExport {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    emailVerified: boolean;
    createdAt: Date;
    consents: {
      essential: boolean;
      aiTraining: boolean;
      marketing: boolean;
    };
  };
  cvs: Array<{
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    versions: Array<{
      versionNumber: number;
      createdAt: Date;
    }>;
  }>;
  jobPostings: Array<{
    id: number;
    title: string;
    company: string | null;
    description: string;
    createdAt: Date;
  }>;
  applications: Array<{
    id: number;
    cvId: number;
    jobPostingId: number;
    generatedCvContent: string | null;
    generatedApplicationContent: string | null;
    atsFeedback: unknown | null;
    qualityFeedback: unknown | null;
    createdAt: Date;
  }>;
}

export const gdprService = {
  /**
   * Exports all user data for GDPR compliance (Right to Access).
   * @param userId The ID of the user requesting data export.
   * @returns Complete user data export in JSON format.
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cvs: {
          include: {
            versions: {
              select: {
                versionNumber: true,
                createdAt: true,
              },
            },
          },
        },
        jobPostings: true,
        applicationAnalyses: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`GDPR: Data export requested for user ${userId}`);

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        consents: {
          essential: user.consentEssential,
          aiTraining: user.consentAiTraining,
          marketing: user.consentMarketing,
        },
      },
      cvs: user.cvs.map((cv) => ({
        id: cv.id,
        title: cv.title || 'Untitled CV',
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        versions: cv.versions.map((v) => ({
          versionNumber: v.versionNumber,
          createdAt: v.createdAt,
        })),
      })),
      jobPostings: user.jobPostings.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        createdAt: job.createdAt,
      })),
      applications: user.applicationAnalyses.map((app) => ({
        id: app.id,
        cvId: app.cvId,
        jobPostingId: app.jobPostingId,
        generatedCvContent: app.generatedCvContent,
        generatedApplicationContent: app.generatedApplicationContent,
        atsFeedback: app.atsFeedback,
        qualityFeedback: app.qualityFeedback,
        createdAt: app.createdAt,
      })),
    };
  },

  /**
   * Gets a summary of what data is stored for the user.
   * @param userId The ID of the user.
   * @returns Summary counts of stored data.
   */
  async getDataSummary(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        _count: {
          select: {
            cvs: true,
            jobPostings: true,
            applicationAnalyses: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || null,
      memberSince: user.createdAt,
      dataCounts: {
        cvs: user._count.cvs,
        jobPostings: user._count.jobPostings,
        applications: user._count.applicationAnalyses,
      },
    };
  },

  /**
   * Permanently deletes all user data for GDPR compliance (Right to be Forgotten).
   * This action is irreversible.
   * @param userId The ID of the user requesting deletion.
   * @returns Confirmation of deletion.
   */
  async deleteUserAccount(userId: string): Promise<{ deleted: boolean; deletedAt: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`GDPR: Account deletion requested for user ${userId}`);

    // Delete in order respecting foreign key constraints
    // Note: Most relations have onDelete: Cascade, but we do it explicitly for clarity and logging

    // 1. Delete application analyses
    const deletedApplications = await prisma.applicationAnalysis.deleteMany({
      where: { userId: userId },
    });
    logger.info(`GDPR: Deleted ${deletedApplications.count} applications for user ${userId}`);

    // 2. Delete CV versions (cascade from CVs, but let's be explicit)
    const userCvIds = await prisma.cv.findMany({
      where: { userId: userId },
      select: { id: true },
    });

    if (userCvIds.length > 0) {
      const deletedVersions = await prisma.cvVersion.deleteMany({
        where: { cvId: { in: userCvIds.map(cv => cv.id) } },
      });
      logger.info(`GDPR: Deleted ${deletedVersions.count} CV versions for user ${userId}`);
    }

    // 3. Delete CVs (cascade will delete versions)
    const deletedCvs = await prisma.cv.deleteMany({
      where: { userId: userId },
    });
    logger.info(`GDPR: Deleted ${deletedCvs.count} CVs for user ${userId}`);

    // 4. Anonymize job postings (set user_id to null per schema design)
    const anonymizedJobs = await prisma.jobPosting.updateMany({
      where: { userId: userId },
      data: { userId: null },
    });
    logger.info(`GDPR: Anonymized ${anonymizedJobs.count} job postings for user ${userId}`);

    // 6. Finally, delete the user
    await prisma.user.delete({
      where: { id: userId },
    });
    logger.info(`GDPR: Deleted user account ${userId}`);

    return {
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
  },

  /**
   * Updates user consent preferences.
   * @param userId The ID of the user.
   * @param consents The consent preferences to update.
   * @returns Updated consent status.
   */
  async updateConsents(
    userId: string,
    consents: {
      aiTraining?: boolean;
      marketing?: boolean;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        consentAiTraining: consents.aiTraining ?? user.consentAiTraining,
        consentMarketing: consents.marketing ?? user.consentMarketing,
      },
      select: {
        consentEssential: true,
        consentAiTraining: true,
        consentMarketing: true,
      },
    });

    logger.info(`GDPR: Consent preferences updated for user ${userId}`);

    return {
      essential: updatedUser.consentEssential,
      aiTraining: updatedUser.consentAiTraining,
      marketing: updatedUser.consentMarketing,
    };
  },

  /**
   * Gets current consent preferences for a user.
   * @param userId The ID of the user.
   * @returns Current consent status.
   */
  async getConsents(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        consentEssential: true,
        consentAiTraining: true,
        consentMarketing: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      essential: user.consentEssential,
      aiTraining: user.consentAiTraining,
      marketing: user.consentMarketing,
    };
  },
};
