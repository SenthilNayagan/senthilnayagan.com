---
title: "How I'm Preparing for the Claude Certified Architect – Foundations Exam (CCAR-F)"
description: >-
  A breakdown of the Claude Certified Architect – Foundations (CCAR-F) exam —
  its format, domain weighting, and the six scenarios it draws from — plus the
  free resources and week-by-week plan I'm using to prepare for it, grounded
  in Anthropic's official Exam Guide.
keywords:
  - claude-certified-architect
  - ccar-f
  - claude-code
  - agent-sdk
tags:
  - claude-certified-architect
  - ccar-f
  - claude-code
  - agent-sdk
coverImage: ./images/cover-image.png
imageCredits: AI-generated image.
featured: true
draft: true
---

{% include "toc.md" %}

I recently registered for Anthropic's **Claude Certified Architect – Foundations (CCAR-F)** certification, and I wanted to document my prep approach as I go — partly to keep myself accountable, and partly because there's a lot of noise online about this exam (conflicting claims about pricing, validity periods, even course counts). This post is grounded in the **official Exam Guide (v1.0, effective July 2026)** published by Anthropic, plus a roundup of the free resources I'm actually using to study.

---

# What This Certification Actually Tests

CCAR-F isn't a "watch some videos, answer trivia" exam. It's scenario-based: every question is anchored to one of six realistic production scenarios (customer support agents, multi-agent research pipelines, Claude Code in CI/CD, structured data extraction, and more). You're expected to show *judgment* — tradeoffs, architecture decisions, debugging — not just recall definitions.

The ideal candidate, per the guide, is a solution architect with **6+ months of hands-on experience** building with the Claude Agent SDK, Claude Code, MCP, and the Claude API. Worth knowing going in: this is not a beginner-friendly exam even though it's the "Foundations" tier of the Architect track — if you have zero hands-on time with these tools, budget extra weeks for building things, not just reading.

## Exam Format at a Glance

| Detail | Value |
|---|---|
| Exam code | CCAR-F |
| Number of items | 60 (multiple-choice / multiple-response) |
| Structure | 4 scenarios presented, drawn at random from a bank of 6 |
| Time limit | 120 minutes |
| Delivery | Proctored — online or Pearson test center |
| Passing score | 720 on a scaled 100–1,000 range |
| Exam fee | $125 USD (may vary by partner tier discount) |
| Validity | 12 months from award date |
| Retakes | 14 / 30 / 90-day waiting periods after 1st / 2nd / 3rd fail; max 4 attempts per rolling 12 months |

## Domain Weighting (This Is Your Study Budget)

| # | Domain | Weight |
|---|---|---|
| 1 | Agentic Architecture & Orchestration | **27%** |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

Domain 1 alone is more than a quarter of the exam — it covers agentic loop control flow (`stop_reason` handling), coordinator/subagent orchestration via the `Task` tool, hooks for enforcement, session resumption, and task decomposition strategy. If you only have time to go deep on one area, this is it.

## The Six Exam Scenarios

Because 4 of 6 are randomly selected, I found it more useful to prep *scenario-first* rather than purely domain-first — each scenario pulls from 2–3 domains at once:

1. **Customer Support Resolution Agent** — Domains 1, 2, 5
2. **Code Generation with Claude Code** — Domains 3, 5
3. **Multi-Agent Research System** — Domains 1, 2, 5
4. **Developer Productivity with Claude** — Domains 1, 2, 3
5. **Claude Code for CI/CD** — Domains 3, 4
6. **Structured Data Extraction** — Domains 4, 5

Notice Domain 5 (Context Management & Reliability) quietly shows up in four of the six scenarios despite being the lowest-weighted domain on paper — it's the thread that ties the others together, so don't deprioritize it just because it's "only 15%."

---

# Free Resources I'm Using

Before spending money on any paid course, there's a genuinely solid free stack available:

**Official (Anthropic)**
- **Anthropic Partner Academy** (Skilljar) — free, self-paced courses that map directly to the exam blueprint, including Agent Skills, Building with the Claude API, Introduction to MCP, and Claude Code in Action. This is the closest thing to an official syllabus.
- **Anthropic developer docs** (docs.claude.com) — primary source for Messages API mechanics, tool use, `tool_choice`, the Message Batches API, and prompt caching.
- **"Building Effective Agents"** — Anthropic's engineering blog post on workflow vs. agent patterns; several exam task statements (coordinator/subagent design, prompt chaining) map almost directly onto its framing.
- **The MCP specification** (modelcontextprotocol.io) — for tools, resources, prompts, and the trust model.
- **Anthropic's public cookbook repo** on GitHub — worked examples of agentic loops, useful for the hands-on exercises below.
- **The official Exam Guide PDF itself** — download it from the certification page before doing anything else. It includes 12 full sample questions with explanations and a full task-statement breakdown per domain. I'm treating it as the single source of truth over any third-party blog, since I found real inconsistencies out there (some sites quote different fees or validity periods than what's actually in the guide).

**Community (free, unofficial — use as supplements, not primary source)**
- A couple of community GitHub repos host free study guides organized by domain, with topic checklists that mirror the blueprint's task statements — useful as a study index to make sure you haven't skipped a task statement.
- A couple of independent sites host free practice-question banks (several hundred questions) with explanations, styled after the exam's scenario format. Good for self-testing in week 3–4, not for learning concepts cold.

A caution on the community stuff: quality varies a lot, and a few sites have blurred "Anthropic Academy" (official, always free) with paid third-party "exam prep masterclasses." If a resource is charging money to teach you what's in the free official guide, skip it — everything you need to pass is either in the guide itself or in Anthropic's free docs/courses.

---

# My Week-by-Week Prep Plan (4 Weeks)

This assumes roughly **1–1.5 hours per weekday** plus a longer session on weekends, and that you already have *some* hands-on Claude experience (if you're starting from zero, add 2 weeks up front just for building small projects).

## Week 1 — Domain 1 + Domain 3 foundations (biggest combined weight: 47%)
- Read the Exam Guide in full once, cover to cover, so I know what "in scope" and "out of scope" actually mean before I study anything.
- Anthropic Academy: Agent Skills course + Claude Code in Action course.
- Docs deep-dive: agentic loop lifecycle, `stop_reason`, hooks (`PostToolUse`), `Task` tool, `CLAUDE.md` hierarchy, `.claude/rules/`.
- **Hands-on:** Exam Guide Exercise 1 (multi-tool agent with escalation logic) and Exercise 2 (Claude Code team workflow config).
- Weekend: re-read Domain 1 and Domain 3 task statements from the guide and self-check against what I built.

## Week 2 — Domain 2 + Domain 4 (combined weight: 38%)
- Anthropic Academy: Building with the Claude API course + Introduction to MCP course.
- Docs deep-dive: `tool_choice` options, JSON schema design (nullable fields, enum + "other" pattern), Message Batches API tradeoffs, MCP `isError` and structured error responses.
- **Hands-on:** Exercise 3 (structured data extraction pipeline with validation-retry loop and batch processing).
- Start Exercise 4 (multi-agent research pipeline) if time allows — it straddles into Week 3 anyway.

## Week 3 — Domain 5 + full scenario integration
- Finish Exercise 4 (error propagation, provenance/claim-source mapping, parallel subagent execution).
- Docs/blog deep-dive: "lost in the middle" effects, scratchpad files, context trimming, confidence calibration and stratified sampling for human review routing.
- Re-map everything I've built against all **six exam scenarios** — for each one, write a one-paragraph summary of what could go wrong and how I'd fix it. This forces domain knowledge into scenario-shaped answers, which is literally the exam's format.
- Start working through free community practice questions, but review the *reasoning* for wrong answers, not just the correct letter.

## Week 4 — Practice, gaps, and exam logistics
- Two full 60-question practice run-throughs under a 120-minute timer, using the community question banks.
- Track score by domain (most banks report this) and spend 2–3 focused sessions shoring up whichever domain is weakest — for me this is likely Domain 2, since MCP tool design is the area I've touched least in production.
- Re-read the 12 official sample questions in the Exam Guide one more time — they're the best calibration for actual difficulty and "trap answer" style (the guide's explanations show *why* the tempting-but-wrong options fail, which is the real skill being tested).
- Confirm exam logistics: ID matching registration name exactly, workspace/webcam rules if testing online, and schedule with a buffer day before in case I want to push it out.
- Light review only in the final 48 hours — no new material.

---

# A Few Things I'd Tell Past-Me

- **Study scenario-first, not just domain-first.** The exam frames every question inside one of six production contexts, so practicing "given this scenario, what's the root cause" is closer to the real test than memorizing domain trivia in isolation.
- **Build, don't just read.** Nearly every sample question in the official guide is really testing *judgment calls you'd only internalize by having built the thing* — e.g., knowing that a programmatic hook beats a prompt instruction for guaranteed compliance isn't something you can memorize convincingly; you have to have hit that failure mode once.
- **Trust the official Exam Guide over blog posts** (including, ironically, parts of this one — always cross-check pricing/policy details against Anthropic's current guide before you register or schedule, since terms can change between guide versions).

I'll post an update after the exam with what actually showed up versus what I over/under-prepared for.
