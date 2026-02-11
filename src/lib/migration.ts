import { getPerformanceClassification, PERFORMANCE_SECTIONS, SECTION_WEIGHTAGES } from '@/constants/appraisal';
import { prisma } from './db';

/**
 * Migrates existing goals to have proper sections assigned.
 * Goals with default 'tasks' section that match competency categories
 * will be reassigned to the competencies section.
 */
export async function migrateGoalSections() {
  try {
    console.log('Starting goal section migration...');
    
    // Competency-related categories that should be in the competencies section
    const competencyCategories = [
      'Soft Skills',
      'Leadership', 
      'Communication',
      'Teamwork',
      'Customer Focus'
    ];

    // Find goals that are currently in 'tasks' section but should be in 'competencies'
    const goalsToUpdate = await prisma.goal.findMany({
      where: {
        section: PERFORMANCE_SECTIONS.TASKS,
        category: {
          in: competencyCategories,
        },
      },
    });

    if (goalsToUpdate.length === 0) {
      console.log('No goals need migration.');
      return;
    }

    console.log(`Found ${goalsToUpdate.length} goals to migrate to competencies section.`);

    // Update goals in a batch
    const updateResult = await prisma.goal.updateMany({
      where: {
        id: { in: goalsToUpdate.map(g => g.id) },
      },
      data: {
        section: PERFORMANCE_SECTIONS.COMPETENCIES,
      },
    });

    console.log(`Successfully migrated ${updateResult.count} goals to competencies section.`);
  } catch (error) {
    console.error('Error migrating goal sections:', error);
    throw error;
  }
}

/**
 * Migrates existing appraisal reviews to calculate section scores and classifications
 * based on the new performance system.
 */
export async function migrateReviewScores() {
  try {
    console.log('Starting review scores migration...');
    
    // Get all reviews — recalculate scores for any that have taskScore=0 and competencyScore=0
    // (indicating they haven't been properly calculated yet)
    const reviewsToUpdate = await prisma.appraisalReview.findMany({
      where: {
        AND: [
          { taskScore: 0 },
          { competencyScore: 0 },
          { overallScore: { gt: 0 } } // Only reviews that have an overall score but missing section scores
        ]
      },
      include: {
        submission: {
          include: {
            template: {
              include: {
                goals: true
              }
            }
          }
        },
        goalReviews: true
      }
    });

    if (reviewsToUpdate.length === 0) {
      console.log('No reviews need migration.');
      return;
    }

    console.log(`Found ${reviewsToUpdate.length} reviews to migrate.`);

    for (const review of reviewsToUpdate) {
      const goals = review.submission.template.goals;
      const taskGoals = goals.filter(goal => goal.section === PERFORMANCE_SECTIONS.TASKS);
      const competencyGoals = goals.filter(goal => goal.section === PERFORMANCE_SECTIONS.COMPETENCIES);
      
      let taskScore = 0;
      let competencyScore = 0;
      let totalTaskWeightage = 0;
      let totalCompetencyWeightage = 0;

      // Calculate task section score
      taskGoals.forEach(goal => {
        const goalReview = review.goalReviews.find(gr => gr.goalId === goal.id);
        if (goalReview) {
          taskScore += (goalReview.score * goal.weightage);
          totalTaskWeightage += goal.weightage;
        }
      });
      
      // Calculate competency section score
      competencyGoals.forEach(goal => {
        const goalReview = review.goalReviews.find(gr => gr.goalId === goal.id);
        if (goalReview) {
          competencyScore += (goalReview.score * goal.weightage);
          totalCompetencyWeightage += goal.weightage;
        }
      });

      // Normalize section scores to percentages
      taskScore = totalTaskWeightage > 0 ? taskScore / totalTaskWeightage : 0;
      competencyScore = totalCompetencyWeightage > 0 ? competencyScore / totalCompetencyWeightage : 0;

      // Calculate properly weighted overall score
      const overallScore = Math.round(
        (taskScore * SECTION_WEIGHTAGES.tasks) / 100 +
        (competencyScore * SECTION_WEIGHTAGES.competencies) / 100
      );

      // Get performance classification
      const classification = getPerformanceClassification(overallScore);

      // Update the review with calculated scores
      await prisma.appraisalReview.update({
        where: { id: review.id },
        data: {
          taskScore: Math.round(taskScore),
          competencyScore: Math.round(competencyScore),
          overallScore,
          performanceClassification: classification.key,
        }
      });
    }

    console.log(`Successfully migrated ${reviewsToUpdate.length} review scores.`);
  } catch (error) {
    console.error('Error migrating review scores:', error);
    throw error;
  }
}

/**
 * Complete migration function that runs all necessary migrations.
 */
export async function runPerformanceSystemMigration() {
  try {
    console.log('Starting complete performance system migration...');
    
    await migrateGoalSections();
    await migrateReviewScores();
    
    console.log('Performance system migration completed successfully!');
  } catch (error) {
    console.error('Performance system migration failed:', error);
    throw error;
  }
}