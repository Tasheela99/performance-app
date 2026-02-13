import { getPerformanceClassification, PERFORMANCE_SECTIONS, SECTION_WEIGHTAGES } from '@/constants/appraisal';
import { prisma } from './db';

export async function migrateGoalSections() {
  try {
    console.log('Starting goal section migration...');
    
    const competencyCategories = [
      'Soft Skills',
      'Leadership', 
      'Communication',
      'Teamwork',
      'Customer Focus'
    ];

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

export async function migrateReviewScores() {
  try {
    console.log('Starting review scores migration...');
    
    const reviewsToUpdate = await prisma.appraisalReview.findMany({
      where: {
        AND: [
          { taskScore: 0 },
          { competencyScore: 0 },
          { overallScore: { gt: 0 } }
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

      taskGoals.forEach(goal => {
        const goalReview = review.goalReviews.find(gr => gr.goalId === goal.id);
        if (goalReview) {
          taskScore += (goalReview.score * goal.weightage);
          totalTaskWeightage += goal.weightage;
        }
      });
      
      competencyGoals.forEach(goal => {
        const goalReview = review.goalReviews.find(gr => gr.goalId === goal.id);
        if (goalReview) {
          competencyScore += (goalReview.score * goal.weightage);
          totalCompetencyWeightage += goal.weightage;
        }
      });

      taskScore = totalTaskWeightage > 0 ? taskScore / totalTaskWeightage : 0;
      competencyScore = totalCompetencyWeightage > 0 ? competencyScore / totalCompetencyWeightage : 0;

      const overallScore = Math.round(
        (taskScore * SECTION_WEIGHTAGES.tasks) / 100 +
        (competencyScore * SECTION_WEIGHTAGES.competencies) / 100
      );

      const classification = getPerformanceClassification(overallScore);


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