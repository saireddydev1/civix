/**
 * Derives a clean human-readable name from displayName, email, or reporterName.
 * Replaces generic placeholders like 'Civic User' with formatted names derived from email or account details.
 */
export function deriveDisplayName(
  displayName?: string | null,
  email?: string | null,
  reporterName?: string | null
): string {
  // 1. Check if displayName is a real custom name
  if (displayName && typeof displayName === 'string') {
    const trimmed = displayName.trim();
    if (
      trimmed !== '' &&
      trimmed !== 'Civic User' &&
      trimmed !== 'User' &&
      trimmed !== 'Civic Member'
    ) {
      return trimmed;
    }
  }

  // 2. Check reporterName if provided
  if (reporterName && typeof reporterName === 'string') {
    const trimmed = reporterName.trim();
    if (
      trimmed !== '' &&
      trimmed !== 'Civic User' &&
      trimmed !== 'User' &&
      trimmed !== 'Civic Member'
    ) {
      return trimmed;
    }
  }

  // 3. Extract clean name from Email if available
  if (email && typeof email === 'string' && email.includes('@')) {
    const handle = email.split('@')[0];
    // Replace dots, underscores, hyphens, and digits with spaces
    const cleanHandle = handle.replace(/[0-9_.-]+/g, ' ').trim();
    if (cleanHandle.length >= 2) {
      return cleanHandle
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return 'Civic Citizen';
}

/**
 * Gets avatar initials from a user's derived name (e.g. "Sai Reddy" -> "SR")
 */
export function getAvatarInitials(name?: string | null, email?: string | null): string {
  const cleanName = deriveDisplayName(name, email);
  const parts = cleanName.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase() || 'CC';
}
