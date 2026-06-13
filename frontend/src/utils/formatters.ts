/**
 * Transforms a standard 24-hour time string or full date-time string into a clean 12-hour AM/PM string.
 * @param localTimeStr Example: "2026-06-13 14:35" or just "14:35"
 */
export function formatTo12Hour(localTimeStr: string): string {
  if (!localTimeStr) return '';
  
  // Extract just the time portion if it includes the date (split by space)
  const timePart = localTimeStr.includes(' ') ? localTimeStr.split(' ')[1] : localTimeStr;
  const [hoursRaw, minutes] = timePart.split(':');
  
  let hours = parseInt(hoursRaw, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  
  return `${hours}:${minutes} ${ampm}`;
}