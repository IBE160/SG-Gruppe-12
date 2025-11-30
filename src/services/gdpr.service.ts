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
  cvComponents: Array<{
    id: number;
    componentType: string;
    content: unknown;
    createdAt: Date;
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
                version_number: true,
                created_at: true,
              },
            },
          },
        },
        cv_components: true,
        job_postings: true,
        application_analyses: true,
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
        createdAt: user.created_at,
        consents: {
          essential: user.consent_essential,
          aiTraining: user.consent_ai_training,
          marketing: user.consent_marketing,
        },
      },
      cvs: user.cvs.map((cv) => ({
        id: cv.id,
        title: cv.title,
        createdAt: cv.created_at,
        updatedAt: cv.updated_at,
        versions: cv.versions.map((v) => ({
          versionNumber: v.version_number,
          createdAt: v.created_at,
        })),
      })),
      cvComponents: user.cv_components.map((comp) => ({
        id: comp.id,
        componentType: comp.component_type,
        content: comp.content,
        createdAt: comp.created_at,
      })),
      jobPostings: user.job_postings.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        createdAt: job.created_at,
      })),
      applications: user.application_analyses.map((app) => ({
        id: app.id,
        cvId: app.cv_id,
        jobPostingId: app.job_posting_id,
        generatedCvContent: app.generated_cv_content,
        generatedApplicationContent: app.generated_application_content,
        atsFeedback: app.ats_feedback,
        qualityFeedback: app.quality_feedback,
        createdAt: app.created_at,
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
        created_at: true,
        _count: {
          select: {
            cvs: true,
            cv_components: true,
            job_postings: true,
            application_analyses: true,
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
      memberSince: user.created_at,
      dataCounts: {
        cvs: user._count.cvs,
        cvComponents: user._count.cv_components,
        jobPostings: user._count.job_postings,
        applications: user._count.application_analyses,
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
      where: { user_id: userId },
    });
    logger.info(`GDPR: Deleted ${deletedApplications.count} applications for user ${userId}`);

    // 2. Delete CV versions (cascade from CVs, but let's be explicit)
    const userCvIds = await prisma.cV.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    if (userCvIds.length > 0) {
      const deletedVersions = await prisma.cVVersion.deleteMany({
        where: { cv_id: { in: userCvIds.map(cv => cv.id) } },
      });
      logger.info(`GDPR: Deleted ${deletedVersions.count} CV versions for user ${userId}`);
    }

    // 3. Delete CVs
    const deletedCvs = await prisma.cV.deleteMany({
      where: { user_id: userId },
    });
    logger.info(`GDPR: Deleted ${deletedCvs.count} CVs for user ${userId}`);

    // 4. Delete CV components
    const deletedComponents = await prisma.cVComponent.deleteMany({
      where: { user_id: userId },
    });
    logger.info(`GDPR: Deleted ${deletedComponents.count} CV components for user ${userId}`);

    // 5. Anonymize job postings (set user_id to null per schema design)
    const anonymizedJobs = await prisma.jobPosting.updateMany({
      where: { user_id: userId },
      data: { user_id: null },
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
        consent_ai_training: consents.aiTraining ?? user.consent_ai_training,
        consent_marketing: consents.marketing ?? user.consent_marketing,
      },
      select: {
        consent_essential: true,
        consent_ai_training: true,
        consent_marketing: true,
      },
    });

    logger.info(`GDPR: Consent preferences updated for user ${userId}`);

    return {
      essential: updatedUser.consent_essential,
      aiTraining: updatedUser.consent_ai_training,
      marketing: updatedUser.consent_marketing,
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
        consent_essential: true,
        consent_ai_training: true,
        consent_marketing: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      essential: user.consent_essential,
      aiTraining: user.consent_ai_training,
      marketing: user.consent_marketing,
    };
  },
};
