import { z } from "zod";

export const sessionSchema = z.object({
  sid: z.uuid(),
  uid: z.uuid().nullable(),
  role: z.enum(["admin", "user"]).nullable(),
  status: z.enum(["pending", "approved", "denied", "expired"]),
});

export type Session = z.infer<typeof sessionSchema>;
