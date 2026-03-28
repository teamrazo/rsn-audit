import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { upsertAuditContact } from "@/lib/ghl";

export const dynamic = "force-dynamic";

// ─── Constants matching the frontend QUESTIONS array ───────────────────────
const QUESTION_META: Record<string, { category: string; label: string }> = {
  reactive:  { category: "TIME LEAKS",         label: "Reactive vs. Leading" },
  followup:  { category: "FOLLOW-UP",          label: "Lead Follow-Up Consistency" },
  owner_dep: { category: "OWNER DEPENDENCY",   label: "Owner Dependency" },
  sops:      { category: "SYSTEMS AND SOPS",   label: "Process Documentation" },
  lifecycle: { category: "CUSTOMER LIFECYCLE", label: "Lead-to-Loyal Pipeline" },
  tools:     { category: "TOOL FRAGMENTATION", label: "Tool Integration" },
  automation:{ category: "AI AND AUTOMATION",  label: "Automation Coverage" },
  kpis:      { category: "MEASUREMENT",        label: "KPI Visibility" },
};

const QUESTION_ORDER = [
  "reactive", "followup", "owner_dep", "sops",
  "lifecycle", "tools", "automation", "kpis",
];

const MAX_SCORE_PER_Q = 10;
const TOTAL_QUESTIONS = QUESTION_ORDER.length;
const MAX_TOTAL = TOTAL_QUESTIONS * MAX_SCORE_PER_Q; // 80

// Score tier labels (matching frontend SCORE_RANGES, 0-100 pct)
function scoreTier(pct: number): string {
  if (pct >= 65) return "ENGINEERED";
  if (pct >= 45) return "STRUCTURED";
  if (pct >= 25) return "REACTIVE";
  return "OVERLOADED";
}

// ─── Rate limiter (IP-based, 10/15min) ─────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── Blob helpers ───────────────────────────────────────────────────────────
const BLOB_ENABLED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function safePathSegment(input: string) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function blobPutJson(pathname: string, data: unknown) {
  return await put(pathname, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
  });
}

// ─── GHL note builder ───────────────────────────────────────────────────────
function buildGhlNote(params: {
  name: string;
  email: string;
  business: string;
  answers: Record<string, number>;
  totalScore: number;
  pct: number;
  tier: string;
  weakest: string[];
  strongest: string[];
  submittedAt: string;
  submissionId: string;
  blobPathname?: string | null;
}): string {
  const {
    name, email, business, answers, totalScore, pct, tier,
    weakest, strongest, submittedAt, submissionId, blobPathname,
  } = params;

  const scoreLines = QUESTION_ORDER.map((id) => {
    const meta = QUESTION_META[id];
    const score = answers[id] ?? 0;
    const bar = "█".repeat(score) + "░".repeat(MAX_SCORE_PER_Q - score);
    return `  ${meta.category.padEnd(22)} [${bar}] ${score}/${MAX_SCORE_PER_Q}`;
  }).join("\n");

  const weakestLines = weakest.map((id) => {
    const meta = QUESTION_META[id];
    return `  ⚠️  ${meta.label} (${answers[id] ?? 0}/${MAX_SCORE_PER_Q})`;
  }).join("\n");

  const strongestLines = strongest.map((id) => {
    const meta = QUESTION_META[id];
    return `  ✅  ${meta.label} (${answers[id] ?? 0}/${MAX_SCORE_PER_Q})`;
  }).join("\n");

  return [
    `📊 FREE AI GROWTH AUDIT — SUBMISSION`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Business: ${business || "N/A"}`,
    `Date:     ${new Date(submittedAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`,
    ``,
    `OVERALL SCORE: ${totalScore}/${MAX_TOTAL} (${pct}%) — ${tier}`,
    ``,
    `CATEGORY BREAKDOWN:`,
    scoreLines,
    ``,
    `WEAKEST AREAS (priority focus):`,
    weakestLines,
    ``,
    `STRONGEST AREAS:`,
    strongestLines,
    ``,
    `Submission ID: ${submissionId}`,
    blobPathname ? `Audit Blob: ${blobPathname}` : null,
  ].filter((l) => l !== null).join("\n");
}

// ─── POST handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // ── Validate required fields ──────────────────────────────────────────
    const { name, email, business, answers } = body;

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers are required." }, { status: 400 });
    }

    // ── Compute scores ────────────────────────────────────────────────────
    const answersNorm: Record<string, number> = {};
    for (const id of QUESTION_ORDER) {
      answersNorm[id] = typeof answers[id] === "number" ? answers[id] : 0;
    }

    const totalScore = Object.values(answersNorm).reduce((a, b) => a + b, 0);
    const pct = Math.round((totalScore / MAX_TOTAL) * 100);
    const tier = scoreTier(pct);

    // Sorted weakest → strongest
    const sortedIds = [...QUESTION_ORDER].sort(
      (a, b) => answersNorm[a] - answersNorm[b]
    );
    const weakest = sortedIds.slice(0, 3);
    const strongest = sortedIds.slice(-3).reverse();

    // Rich category breakdown for storage
    const categoryBreakdown = QUESTION_ORDER.map((id) => ({
      id,
      category: QUESTION_META[id].category,
      label: QUESTION_META[id].label,
      score: answersNorm[id],
      maxScore: MAX_SCORE_PER_Q,
      pct: Math.round((answersNorm[id] / MAX_SCORE_PER_Q) * 100),
    }));

    // ── Build full submission record ──────────────────────────────────────
    const submissionId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const submittedAt = new Date().toISOString();

    const submission = {
      submissionId,
      submittedAt,
      ip,
      contact: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        business: (business || "").trim(),
      },
      scores: {
        total: totalScore,
        max: MAX_TOTAL,
        pct,
        tier,
        perQuestion: answersNorm,
        categoryBreakdown,
        weakest: weakest.map((id) => ({ id, ...QUESTION_META[id], score: answersNorm[id] })),
        strongest: strongest.map((id) => ({ id, ...QUESTION_META[id], score: answersNorm[id] })),
      },
    };

    // ── Log always (visible in Vercel function logs even without Blob/Slack) ──
    console.log(
      `[audit-submit] ${submission.contact.name} | ${submission.contact.email} | ` +
      `score=${totalScore}/${MAX_TOTAL} (${pct}%) | tier=${tier} | id=${submissionId}`
    );

    // ── Persist to Vercel Blob ────────────────────────────────────────────
    let blobPathname: string | null = null;

    if (BLOB_ENABLED) {
      try {
        const emailSafe = safePathSegment(submission.contact.email);
        const blobPath = `audits/${emailSafe}/${submissionId}.json`;
        const blob = await blobPutJson(blobPath, submission);
        blobPathname = blob.pathname;
        console.log(`[audit-submit] Blob saved: ${blobPathname}`);
      } catch (blobErr) {
        console.warn("[audit-submit] Blob write failed:", blobErr);
      }
    } else {
      console.log("[audit-submit] Blob skipped (BLOB_READ_WRITE_TOKEN not set)");
    }

    // ── Sync to GHL ───────────────────────────────────────────────────────
    const GHL_ENABLED = Boolean(
      process.env.GHL_PRIVATE_TOKEN && process.env.GHL_LOCATION_ID
    );

    let ghlContactId: string | null = null;
    let ghlCreated = false;

    if (GHL_ENABLED) {
      try {
        const note = buildGhlNote({
          name: submission.contact.name,
          email: submission.contact.email,
          business: submission.contact.business,
          answers: answersNorm,
          totalScore,
          pct,
          tier,
          weakest,
          strongest,
          submittedAt,
          submissionId,
          blobPathname,
        });

        const result = await upsertAuditContact({
          fullName: submission.contact.name,
          email: submission.contact.email,
          companyName: submission.contact.business || undefined,
          tagsToAdd: [
            "Activity - Audit - Free AI Growth Audit Complete",
            "Status - Lead - Audit Completed",
            `Audit - Tier - ${tier}`,
          ],
          note,
        });

        ghlContactId = result.contactId;
        ghlCreated = result.created;
        console.log(
          `[audit-submit] GHL ${ghlCreated ? "created" : "updated"} contact: ${ghlContactId}`
        );
      } catch (ghlErr) {
        console.warn("[audit-submit] GHL sync failed:", ghlErr);
      }
    } else {
      console.log("[audit-submit] GHL skipped (env vars not set)");
    }

    // ── Slack notification ────────────────────────────────────────────────
    const SLACK_WEBHOOK = process.env.SLACK_NOTIFICATION_WEBHOOK;

    const weakestLabels = weakest
      .map((id) => `${QUESTION_META[id].label} (${answersNorm[id]}/10)`)
      .join(", ");

    const notifyText =
      `📊 *New AI Growth Audit Completed*\n` +
      `• *Name:* ${submission.contact.name}\n` +
      `• *Email:* ${submission.contact.email}\n` +
      `• *Business:* ${submission.contact.business || "N/A"}\n` +
      `• *Score:* ${totalScore}/${MAX_TOTAL} (${pct}%) — ${tier}\n` +
      `• *Weakest Areas:* ${weakestLabels}\n` +
      `• *Time:* ${new Date(submittedAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`;

    if (SLACK_WEBHOOK) {
      try {
        await fetch(SLACK_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: notifyText }),
          signal: AbortSignal.timeout(5000),
        });
        console.log("[audit-submit] Slack notification sent");
      } catch (slackErr) {
        console.warn("[audit-submit] Slack notification failed:", slackErr);
      }
    } else {
      // Log to function output so we can verify even without webhook configured
      console.log("[audit-submit] NOTIFY (no webhook):", notifyText);
    }

    // ── Return success ────────────────────────────────────────────────────
    return NextResponse.json(
      {
        ok: true,
        submissionId,
        tier,
        pct,
        blobSaved: Boolean(blobPathname),
        ghlEnabled: GHL_ENABLED,
        ghlContactId,
        ghlCreated,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[audit-submit] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
