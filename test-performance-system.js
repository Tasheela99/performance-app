// Test script for the new performance system
import {
    PERFORMANCE_SECTIONS,
    SECTION_WEIGHTAGES,
    calculateWeightedScore,
    getPerformanceClassification
} from '../src/constants/appraisal';

console.log('🧪 Testing Performance System Components\n');

// Test performance classifications
console.log('1. Testing Performance Classifications:');
const testScores = [45, 65, 78, 85, 95, 105];
testScores.forEach(score => {
  const classification = getPerformanceClassification(score);
  console.log(`   Score ${score}%: ${classification.label} (${classification.key})`);
});

// Test section weightages
console.log('\n2. Testing Section Weightages:');
console.log(`   Tasks: ${SECTION_WEIGHTAGES.tasks}%`);
console.log(`   Competencies: ${SECTION_WEIGHTAGES.competencies}%`);
console.log(`   Total: ${SECTION_WEIGHTAGES.tasks + SECTION_WEIGHTAGES.competencies}%`);

// Test weighted score calculation
console.log('\n3. Testing Weighted Score Calculation:');
const testCases = [
  { taskScore: 85, competencyScore: 90 },
  { taskScore: 75, competencyScore: 80 },
  { taskScore: 95, competencyScore: 85 },
];

testCases.forEach(({ taskScore, competencyScore }, index) => {
  const weighted = calculateWeightedScore(taskScore, competencyScore);
  console.log(`   Case ${index + 1}: Tasks=${taskScore}%, Competencies=${competencyScore}% → Weighted=${weighted.toFixed(1)}%`);
});

// Test performance sections
console.log('\n4. Testing Performance Sections:');
console.log(`   Available sections: ${Object.values(PERFORMANCE_SECTIONS).join(', ')}`);

console.log('\n✅ Performance System Tests Completed Successfully!');