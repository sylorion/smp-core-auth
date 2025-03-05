// interfaces/UserProfile.interface.ts

import { z } from 'zod';

/**
 * Represents the structure of a user profile within the authentication system.
 * This interface standardizes the user data exchanged between services.
 */
export interface UserProfile {
  /**
   * Unique identifier for the user.
   */
  id: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The username of the user (optional).
   */
  username?: string;

  /**
   * The user's phone number in E.164 format (optional).
   */
  phone?: string;

  /**
   * Roles assigned to the user for authorization purposes.
   */
  roles?: string[];

  /**
   * Additional metadata associated with the user.
   */
  [key: string]: any;
}

/**
 * Zod schema for runtime validation of a UserProfile object.
 * Use this schema to validate data received from external sources.
 */
export const userProfileSchema = z.object({
  id: z.string().nonempty({ message: "User id is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters long." }).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Phone number must be in E.164 format (e.g., +1234567890)." }).optional(),
  roles: z.array(z.string()).optional(),
}).strict();

/**
 * Inferred TypeScript type from the userProfileSchema.
 * Useful when you need a validated instance of UserProfile.
 */
export type UserProfileType = z.infer<typeof userProfileSchema>;
