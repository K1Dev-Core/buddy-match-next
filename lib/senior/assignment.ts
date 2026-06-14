import { SeniorProfile } from "@/lib/senior/types";

export type SeniorAssignment = {
  assignedAt: string;
  juniorCode4: string;
  juniorId: string;
  seniorId: string;
};

export type AssignmentResult =
  | {
      assignment: SeniorAssignment;
      profile: SeniorProfile;
      status: "assigned" | "existing";
    }
  | {
      message: string;
      status: "empty" | "exhausted";
    };
