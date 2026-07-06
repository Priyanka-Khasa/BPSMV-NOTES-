export const semestersByYear = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

export const getSemestersForYear = (year) => semestersByYear[Number(year)] || [];

export const getYearFromSemester = (semester) => Math.ceil(Math.min(Math.max(Number(semester) || 1, 1), 8) / 2);

export const normalizeAcademicSelection = (yearOfStudy, semester) => {
  const year = Number(yearOfStudy);
  const sem = Number(semester);
  const allowedSemesters = getSemestersForYear(year);

  if (!allowedSemesters.length) return { yearOfStudy: '', semester: '' };
  if (allowedSemesters.includes(sem)) return { yearOfStudy: String(year), semester: String(sem) };

  return { yearOfStudy: String(year), semester: String(allowedSemesters[0]) };
};
