const semesterYearMap = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8]
};

const clampSemester = (semester) => Math.min(Math.max(Number(semester) || 1, 1), 8);

const yearFromSemester = (semester) => Math.ceil(clampSemester(semester) / 2);

const allowedSemestersForYear = (year) => semesterYearMap[Number(year)] || [];

const normalizeYearSemester = (yearOfStudy, semester) => {
  const numericYear = Number(yearOfStudy);
  const numericSemester = Number(semester);

  if (!Number.isInteger(numericYear) || numericYear < 1 || numericYear > 4) {
    return { error: 'Please select a valid year of study' };
  }

  if (!Number.isInteger(numericSemester) || numericSemester < 1 || numericSemester > 8) {
    return { error: 'Please select a valid semester' };
  }

  const allowedSemesters = allowedSemestersForYear(numericYear);
  if (!allowedSemesters.includes(numericSemester)) {
    return { error: `Year ${numericYear} students can only select Semester ${allowedSemesters.join(' or ')}` };
  }

  return {
    yearOfStudy: numericYear,
    semester: numericSemester
  };
};

const progressionCycleStart = (cycleKey) => {
  if (!cycleKey) return null;
  const [year, month] = cycleKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
};

const academicCyclesBetween = (start, end) => {
  if (!start || !end || start >= end) return [];

  const cycles = [];
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  for (let year = startYear; year <= endYear; year += 1) {
    [0, 6].forEach((monthIndex) => {
      const cycleStart = new Date(Date.UTC(year, monthIndex, 1));
      if (cycleStart > start && cycleStart <= end) {
        cycles.push({
          key: `${year}-${monthIndex === 0 ? '01' : '07'}`,
          start: cycleStart
        });
      }
    });
  }

  return cycles.sort((a, b) => a.start - b.start);
};

const getSubjectYear = (semester) => yearFromSemester(semester);

const applyAcademicProgression = async (user, now = new Date()) => {
  if (!user || !user.onboarded || !user.semester) return user;

  const currentSemester = clampSemester(user.semester);
  if (currentSemester >= 8) {
    const correctYear = yearFromSemester(currentSemester);
    if (user.yearOfStudy !== correctYear || user.semester !== currentSemester) {
      user.yearOfStudy = correctYear;
      user.semester = currentSemester;
      await user.save();
    }
    return user;
  }

  const lastCycleStart = progressionCycleStart(user.lastAcademicProgressionCycle);
  const anchorCandidates = [user.lastAcademicProgressionAt, lastCycleStart, user.updatedAt, user.createdAt].filter(Boolean);
  const anchorDate = anchorCandidates.length ? new Date(Math.max(...anchorCandidates.map((date) => date.getTime()))) : user.createdAt;
  const cycles = academicCyclesBetween(anchorDate, now);

  if (!cycles.length) {
    const correctYear = yearFromSemester(currentSemester);
    if (user.yearOfStudy !== correctYear || user.semester !== currentSemester) {
      user.yearOfStudy = correctYear;
      user.semester = currentSemester;
      await user.save();
    }
    return user;
  }

  const nextSemester = Math.min(currentSemester + cycles.length, 8);
  user.semester = nextSemester;
  user.yearOfStudy = yearFromSemester(nextSemester);
  user.lastAcademicProgressionAt = now;
  user.lastAcademicProgressionCycle = cycles[cycles.length - 1].key;
  await user.save();
  return user;
};

module.exports = {
  allowedSemestersForYear,
  applyAcademicProgression,
  getSubjectYear,
  normalizeYearSemester,
  yearFromSemester
};
