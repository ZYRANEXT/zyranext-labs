export type Plan = 'free' | 'pro' | 'creator' | 'team';
export const PLAN_LIMITS = {
  free: { generations: 20, clipAI: false, overlay: false, overlayDays: 0, analytics: false, team: false },
  pro: { generations: -1, clipAI: true, overlay: true, overlayDays: 30, analytics: false, team: false },
  creator: { generations: -1, clipAI: true, overlay: true, overlayDays: 90, analytics: true, team: false },
  team: { generations: -1, clipAI: true, overlay: true, overlayDays: 3650, analytics: true, team: true }
} as const;
export function canUse(plan: Plan, feature: 'clipAI'|'overlay'|'analytics'|'team') { return PLAN_LIMITS[plan][feature]; }
export function overlayExpiry(plan: Plan) { return PLAN_LIMITS[plan].overlayDays; }
