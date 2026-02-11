import { PERFORMANCE_SECTIONS } from '@/constants/appraisal';
import { prisma } from './db';

/**
 * Migrates existing goals to have sections assigned if they don't already have them.
 * This should be run once after the schema update to ensure backward compatibility.
 */
export async function migrateGoalSections() {
  try {
    console.log('Starting goal section migration...');
    
    // Get all goals without sections assigned
    const goalsToUpdate = await prisma.goal.findMany({
      where: {
        section: null,
      }
    });

    if (goalsToUpdate.length === 0) {
      console.log('No goals need migration.');
      return;
    }

    console.log(`Found ${goalsToUpdate.length} goals to migrate.`);

    // Update goals in batches
    for (const goal of goalsToUpdate) {
      // Default assignment based on category (you can customize this logic)
      let section = PERFORMANCE_SECTIONS.TASKS;
      
      // Assign competency-related categories to competencies section
      const competencyCategories = [
        'Soft Skills',
        'Leadership', 
        'Communication',
        'Teamwork',
        'Customer Focus'
      ];
      
      if (competencyCategories.includes(goal.category)) {
        section = PERFORMANCE_SECTIONS.COMPETENCIES;
      }
      
      await prisma.goal.update({
        where: { id: goal.id },
        data: { section }
      });
    }

    console.log(`Successfully migrated ${goalsToUpdate.length} goals.`);
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
    
    // Get all reviews that need migration (those without section scores)
    const reviewsToUpdate = await prisma.appraisalReview.findMany({
      where: {
        AND: [
          { taskScore: 0 },
          { competencyScore: 0 }
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

      // Update the review with calculated scores
      await prisma.appraisalReview.update({
        where: { id: review.id },
        data: {
          taskScore: Math.round(taskScore),
          competencyScore: Math.round(competencyScore)
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