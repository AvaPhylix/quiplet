export function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (now.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  if (years === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  }
  if (months === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }
  return `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"}`;
}

export function calculateAgeAtDate(dob: string, date: string): string {
  const birth = new Date(dob);
  const target = new Date(date);
  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (target.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  if (years < 0) return "";
  if (years === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  }
  if (months === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }
  return `${years}y ${months}m`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const CHILD_COLORS = [
  { name: "Lavender", value: "#C4B5E0" },
  { name: "Peach", value: "#F5C3A8" },
  { name: "Sky", value: "#A8D8EA" },
  { name: "Mint", value: "#B5E5CF" },
  { name: "Coral", value: "#F0A8A8" },
  { name: "Butter", value: "#F5E6A3" },
];
