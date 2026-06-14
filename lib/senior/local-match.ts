"use client";

import { AssignmentResult, SeniorAssignment } from "@/lib/senior/assignment";
import { SeniorProfile } from "@/lib/senior/types";
import { getOpenSeniorProfiles } from "@/lib/senior/storage";

const assignmentStorageKey = "buddy-match-next-senior-assignments-v1";

function readAssignments() {
  if (typeof window === "undefined") {
    return {} as Record<string, SeniorAssignment>;
  }

  const raw = window.localStorage.getItem(assignmentStorageKey);
  if (!raw) {
    return {} as Record<string, SeniorAssignment>;
  }

  try {
    return JSON.parse(raw) as Record<string, SeniorAssignment>;
  } catch {
    return {} as Record<string, SeniorAssignment>;
  }
}

function writeAssignments(assignments: Record<string, SeniorAssignment>) {
  window.localStorage.setItem(assignmentStorageKey, JSON.stringify(assignments));
}

function pickSenior(juniorId: string, profiles: SeniorProfile[]) {
  const sum = juniorId
    .split("")
    .map(Number)
    .reduce((total, digit) => total + digit, 0);

  return profiles[sum % profiles.length];
}

export function assignLocalSeniorToJunior(
  juniorId: string,
  juniorCode4: string
): AssignmentResult {
  const profiles = getOpenSeniorProfiles();

  if (profiles.length === 0) {
    return {
      message: "ตอนนี้ยังไม่มีรุ่นพี่เปิดรับน้อง",
      status: "empty"
    };
  }

  const assignments = readAssignments();
  const existing = assignments[juniorId];

  if (existing) {
    const profile = profiles.find((item) => item.seniorId === existing.seniorId);
    if (profile) {
      return {
        assignment: existing,
        profile,
        status: "existing"
      };
    }
  }

  const usedSeniorIds = new Set(Object.values(assignments).map((item) => item.seniorId));
  const availableProfiles = profiles.filter((profile) => !usedSeniorIds.has(profile.seniorId));

  if (availableProfiles.length === 0) {
    return {
      message: "ตอนนี้ไม่มีพี่รหัสเหลือแล้ว โปรดรอและสุ่มใหม่อีกครั้งภายหลัง",
      status: "exhausted"
    };
  }

  const profile = pickSenior(juniorId, availableProfiles);
  const assignment: SeniorAssignment = {
    assignedAt: new Date().toISOString(),
    juniorCode4,
    juniorId,
    seniorId: profile.seniorId
  };

  assignments[juniorId] = assignment;
  writeAssignments(assignments);

  return {
    assignment,
    profile,
    status: "assigned"
  };
}

export function getLocalAssignment(juniorId: string) {
  const assignments = readAssignments();
  const profiles = getOpenSeniorProfiles();
  const assignment = assignments[juniorId];

  if (!assignment) {
    return null;
  }

  const profile = profiles.find((item) => item.seniorId === assignment.seniorId);
  if (!profile) {
    return null;
  }

  return {
    assignment,
    profile
  };
}
