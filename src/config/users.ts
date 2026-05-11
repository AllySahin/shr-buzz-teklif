export interface UserConfig {
  contact: string;
}

export const USER_CONFIGS: Record<string, UserConfig> = {
  ahmet: {
    contact: "+90 552 617 07 06",
  },
};

export const DEFAULT_CONTACT = "+90 533 084 09 48";

export function getUserContact(username?: string): string {
  if (username && username in USER_CONFIGS) {
    return USER_CONFIGS[username].contact;
  }
  return DEFAULT_CONTACT;
}
