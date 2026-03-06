/**
 * Marksheet Utility — SPI/CGPA Calculation, Backlog Detection, Result Status
 * Used by certificate.controller.js when certificateType === 'marksheet'
 */

/**
 * Grade-to-GradePoint mapping (PPSU / GTU 10-point scale)
 */
export const GRADE_POINTS = {
  O:   10, // Outstanding        (90-100)
  'A+': 9, // Excellent          (80-89.99)
  A:    8, // Very Good          (70-79.99)
  'B+': 7, // Good               (60-69.99)
  B:    6, // Above Average      (50-59.99)
  C:    5, // Average            (45-49.99)
  P:    4, // Pass               (40-44.99)
  F:    0, // Fail               (0-39.99)
  // GTU variant grades
  AA:   10,
  AB:   9,
  BB:   8,
  BC:   7,
  CC:   6,
  CD:   5,
  DD:   4,
  FF:   0,
  II:   0, // Incomplete / Absent
  // Common shorthand
  S:    8, // Satisfactory (practical)
  US:   0, // Unsatisfactory
};

/**
 * Get numeric grade point for a grade string
 * Normalises to uppercase before lookup
 */
export function getGradePoint(grade) {
  if (grade === null || grade === undefined || grade === '') return null;
  const normalised = String(grade).trim().toUpperCase();
  const gp = GRADE_POINTS[normalised];
  return gp !== undefined ? gp : null;
}

/**
 * Compute SPI (Semester Performance Index) from subjects array.
 *
 * Each subject in subjects[] may have:
 *   - evaluationComponents: [{ componentType, credits, grade, gradePoint }]
 *   OR (legacy flat format):
 *   - { code, name, evaluation, credits, grade }
 *
 * Formula: SPI = Σ(credits_i × gradePoint_i) / Σ(credits_i)
 *           — only for components where grade != 'FF' / 'II' / 'F'
 *
 * Returns: { spi, earnedCredits, registeredCredits, creditPoints }
 */
export function computeSPI(subjects = []) {
  let totalCredits = 0;
  let earnedCredits = 0;
  let totalCreditPoints = 0;

  for (const subject of subjects) {
    const components = subject.evaluationComponents || [];

    if (components.length > 0) {
      // Rich format with evaluation components
      for (const comp of components) {
        const credits = Number(comp.credits) || 0;
        const grade = (comp.grade || '').toString().trim().toUpperCase();
        const gp = comp.gradePoint !== undefined ? Number(comp.gradePoint) : getGradePoint(grade);
        if (credits <= 0) continue;

        totalCredits += credits;
        if (gp !== null && gp > 0) {
          totalCreditPoints += credits * gp;
          earnedCredits += credits;
        }
        // gp === 0 means Fail — credits registered but not earned
        if (gp === 0) {
          totalCreditPoints += 0; // no credit points for F
        }
      }
    } else {
      // Legacy flat format: { code, name, evaluation, credits, grade }
      const credits = Number(subject.credits) || 0;
      const grade = (subject.grade || '').toString().trim().toUpperCase();
      const gp = getGradePoint(grade);
      if (credits <= 0) continue;

      totalCredits += credits;
      if (gp !== null && gp > 0) {
        totalCreditPoints += credits * gp;
        earnedCredits += credits;
      }
    }
  }

  const spi = totalCredits > 0 ? +(totalCreditPoints / totalCredits).toFixed(2) : 0;
  return {
    spi,
    earnedCredits,
    registeredCredits: totalCredits,
    creditPoints: totalCreditPoints,
  };
}

/**
 * Detect backlogs from subjects array.
 * A backlog is any evaluation component (or legacy subject) with grade FF / F / II (fail / absent).
 *
 * Returns array of:
 *   { courseCode, subjectName, componentType, grade, status: 'active' }
 */
export function detectBacklogs(subjects = []) {
  const backlogs = [];
  const failGrades = new Set(['FF', 'F', 'II', 'US']);

  for (const subject of subjects) {
    const components = subject.evaluationComponents || [];

    if (components.length > 0) {
      for (const comp of components) {
        const grade = (comp.grade || '').toString().trim().toUpperCase();
        if (failGrades.has(grade)) {
          backlogs.push({
            courseCode:    subject.code || subject.courseCode || '',
            subjectName:   subject.name || '',
            componentType: comp.componentType || comp.type || 'Theory',
            grade,
            status: 'active',
          });
        }
      }
    } else {
      const grade = (subject.grade || '').toString().trim().toUpperCase();
      if (failGrades.has(grade)) {
        backlogs.push({
          courseCode:    subject.code || '',
          subjectName:   subject.name || '',
          componentType: subject.evaluation || 'Theory',
          grade,
          status: 'active',
        });
      }
    }
  }

  return backlogs;
}

/**
 * Determine result status from backlogs count and total subjects.
 *
 * Rules:
 *  - 0 backlogs → PASS
 *  - 1–2 backlogs → ATKT (Allowed To Keep Term)
 *  - 3+ backlogs → FAIL
 */
export function determineResultStatus(backlogs = []) {
  const count = backlogs.length;
  if (count === 0) return 'PASS';
  if (count <= 2) return 'ATKT';
  return 'FAIL';
}

/**
 * Enrich a list of subjects by filling in `gradePoint` for each component
 * where it isn't already provided.
 */
export function enrichGradePoints(subjects = []) {
  return subjects.map(subject => {
    if (subject.evaluationComponents && subject.evaluationComponents.length > 0) {
      return {
        ...subject,
        evaluationComponents: subject.evaluationComponents.map(comp => ({
          ...comp,
          gradePoint: comp.gradePoint !== undefined && comp.gradePoint !== null
            ? Number(comp.gradePoint)
            : getGradePoint(comp.grade),
        })),
      };
    }
    // Legacy flat subject — add gradePoint
    return {
      ...subject,
      gradePoint: subject.gradePoint !== undefined && subject.gradePoint !== null
        ? Number(subject.gradePoint)
        : getGradePoint(subject.grade),
    };
  });
}

/**
 * Full marksheet computation pipeline.
 * Takes raw additionalData from the create request and returns enriched additionalData.
 *
 * @param {Object} additionalData - Raw form data from frontend
 * @returns {Object} - Enriched additionalData with SPI, backlogs, resultStatus
 */
export function computeMarksheetData(additionalData = {}) {
  const subjects = additionalData.subjects || [];

  // Step 1: Enrich grade points
  const enrichedSubjects = enrichGradePoints(subjects);

  // Step 2: Compute SPI
  const { spi, earnedCredits, registeredCredits, creditPoints } = computeSPI(enrichedSubjects);

  // Step 3: Detect backlogs
  const backlogs = detectBacklogs(enrichedSubjects);

  // Step 4: Result status
  const resultStatus = determineResultStatus(backlogs);

  // Step 5: Merge with existing cumulative data (if admin provided cgpa from prior semesters)
  const existingCumulative = additionalData.performance?.cumulative || {};

  return {
    ...additionalData,
    subjects: enrichedSubjects,
    backlogs,
    resultStatus,
    performance: {
      currentSemester: {
        registeredCredits,
        earnedCredits,
        spi,
        creditPoints,
      },
      cumulative: {
        earnedCredits:  existingCumulative.earnedCredits  ?? earnedCredits,
        cgpa:           existingCumulative.cgpa           ?? spi,
        backlogs:       backlogs.length,
      },
    },
  };
}
