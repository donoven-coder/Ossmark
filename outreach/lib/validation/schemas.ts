import { z } from "zod";
import {
  LEAD_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  NICHE_OPTIONS,
  SOURCE_SUBAGENT_OPTIONS_SCOUT,
  SOURCE_SUBAGENT_OPTIONS_CLOSER,
  DEAL_OUTCOME_OPTIONS,
  PACKAGE_PITCHED_OPTIONS,
  AGENT_STATUS_OPTIONS,
} from "../notion/schema.js";

export const leadPatchSchema = z
  .object({
    leadStatus: z.enum(LEAD_STATUS_OPTIONS).nullable().optional(),
    leadSource: z.enum(LEAD_SOURCE_OPTIONS).nullable().optional(),
    niche: z.enum(NICHE_OPTIONS).nullable().optional(),
    sourceSubAgent: z.enum(SOURCE_SUBAGENT_OPTIONS_SCOUT).nullable().optional(),
    qualified: z.boolean().optional(),
    booked: z.boolean().optional(),
    runningMetaAdsPoorly: z.boolean().optional(),
    score: z.number().min(0).max(10).nullable().optional(),
    notes: z.string().max(4000).optional(),
    instagram: z.string().max(200).optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    website: z.string().url().nullable().optional(),
    followUpDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  })
  .strict();

export const touchpointSchema = z
  .object({
    channel: z.enum(["text", "call", "email"]),
  })
  .strict();

export const dealCreateSchema = z
  .object({
    leadId: z.string().min(1, "leadId is required — a Deal cannot exist without a linked Lead"),
    businessName: z.string().min(1),
    callDate: z.string().date(),
    outcome: z.enum(DEAL_OUTCOME_OPTIONS).optional(),
    sourceSubAgent: z.enum(SOURCE_SUBAGENT_OPTIONS_CLOSER).optional(),
    packagePitched: z.enum(PACKAGE_PITCHED_OPTIONS).nullable().optional(),
    objectionsLogged: z.string().max(4000).optional(),
  })
  .strict();

export const dealPatchSchema = z
  .object({
    outcome: z.enum(DEAL_OUTCOME_OPTIONS).optional(),
    packagePitched: z.enum(PACKAGE_PITCHED_OPTIONS).nullable().optional(),
    objectionsLogged: z.string().max(4000).optional(),
    siteLink: z.string().url().nullable().optional(),
    callDate: z.string().date().optional(),
  })
  .strict();

export const agentStatusPatchSchema = z
  .object({
    status: z.enum(AGENT_STATUS_OPTIONS),
  })
  .strict();

export const fbAdCheckJobSchema = z
  .object({
    limit: z.number().int().min(1).max(20).default(5),
    confirm: z.boolean().default(false),
  })
  .strict();
