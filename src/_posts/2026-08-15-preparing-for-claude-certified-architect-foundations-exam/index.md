---
title: "How I'm Preparing for the Claude Certified Architect – Foundations Exam (CCAR-F)"
description: >-
  I'm preparing for the Claude Certified Architect – Foundations (CCAR-F) exam and documenting the journey along the way. I'll break down the 5 exam domains (what we actually need to know), the 6 scenarios (where we'll need to apply it), the exam format and weighting, the free resources I'm using, and my week-by-week preparation plan. All in plain English, with examples, illustrations, and hopefully without making us open 27 browser tabs just to answer one simple question.
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

# Why I'm Writing This

I recently registered for the Claude Certified Architect – Foundations certification and decided to document my preparation as I go — partly to keep myself accountable, and partly because there's already plenty of information floating around about this exam.

The problem?

**Finding information isn't difficult. Finding a clear explanation is.**

We can jump between documentation, courses, videos and blog posts and somehow end up knowing *more things but understanding fewer things.* 😄

So I'm taking a slightly different approach here.

I'll use Anthropic's official **Exam Guide** as the foundation, then translate what I learn into plain English, practical examples and illustrations — including the things that initially confused me.

Think of this blog as:

> **Official documentation → My way of making sense of it → Hopefully we can all understand easily.**

---

# First: Why CCA-F and CCAR-F?

If we've been researching this certification, we've probably noticed two short names:

**CCA-F** and **CCAR-F**.

No, they're not two different exams.

They're two codes we'll encounter for the same **Claude Certified Architect – Foundations** certification. Older material commonly uses **CCA-F**, while newer registration references use **CCAR-F**.

So if we find a great CCA-F resource while preparing for CCAR-F, **let's not throw it away**. We've found the "right" rabbit hole. 🐇

For this blog, I'll use **CCAR-F**.

---

# Where Does CCAR-F Fit?

Before we jump into the exam, there's one thing worth clearing up: Claude certifications aren't all aimed at the same kind of role.

Think of the three role tracks like this:

## Associate — Understanding Claude

The Associate track is for people who need to understand Claude and how it can be used, without necessarily being the person designing or building the underlying systems.

Think:

> “We need to understand what Claude can do and how to work with it effectively.”

## Developer — Building with Claude

The Developer track is for people who actually build applications and features using Claude.

Think:

> “Give us the requirements and we'll build the thing.”

This is where knowledge of APIs, SDKs, integrations and implementation becomes important.

## Architect — Designing with Claude

The Architect track is about the bigger picture: designing production solutions, choosing the right architecture, and making trade-offs between different approaches.

Think:

> “Before we build this, let's figure out how we should build it.”

And this is where my certification lives.

I'm preparing specifically for:

> Claude Certified Architect – Foundations (CCAR-F)

Anthropic describes the certification as being aimed at solution architects with hands-on experience building production applications with Claude and the Anthropic API.

So, very roughly:

- **Associate → Understand it**
- **Developer → Build it**
- **Architect → Design it**

And I'm currently volunteering for the “Design it” part.

---

# What This Certification Actually Tests

CCAR-F isn't a **"watch some videos, memorise a few definitions, and hope for the best"** exam.

It's **scenario-based**.

The official Exam Guide defines **6 real-world scenarios**, and **4 of those 6 are selected for our exam**. Each selected scenario provides the context for roughly **15 questions**, giving us about **60 questions in total**.

The six scenarios are:

1. **Customer Support Resolution Agent**
2. **Code Generation with Claude Code**
3. **Multi-Agent Research System**
4. **Developer Productivity with Claude**
5. **Claude Code for Continuous Integration**
6. **Structured Data Extraction**

So, yes — there are six scenarios in the exam blueprint, but we won't necessarily see all six on our particular exam.

And no, unfortunately, we don't get to pick our favourite four!

## Five Domains. Six Scenarios. What's the Difference?

This is probably the simplest way to make sense of the exam:

> Domains = WHAT we need to know. </br>Scenarios = WHERE we need to apply it.

The five exam domains are:

| # | Domain | Weight |
|---|---|---|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

A quick observation from the weighting:

**Agentic Architecture & Orchestration carries the highest weight at 27%.**

That makes sense because agents are at the centre of many Claude-powered applications. However, the other domains are not optional side quests. Real-world systems usually require a combination of these skills.

The scenarios aren't separate from these domains. They're the **real-world situations in which those skills are tested**.

For example, building a **Customer Support Resolution Agent** is not just about creating an agent. We may also need to think about:

- How the agent decides what actions to take (**Agentic Architecture**)
- How it interacts with external systems (**Tool Design & MCP**)
- How it remembers and manages information (**Context Management & Reliability**)

So we shouldn't think:

> Scenario 1 = Domain 1

That would make preparation unnecessarily complicated.

Instead, think of it this way:

> Domains are our toolbox. Scenarios are the projects where we use the toolbox.

And this is where things get interesting.

A single scenario can touch multiple domains because real-world architecture problems rarely arrive neatly labelled:

> "Hello architect, today's challenge belongs only to Domain 3." 😄

They usually look more like:

> "We need an AI assistant that can help developers, call tools, remember context, produce reliable output, and work inside our delivery pipeline."

Suddenly, we are dealing with multiple domains at the same time.

Here is how the six scenarios connect with the five domains:

| Scenario | Related Domains |
|---|---|
| **Customer Support Resolution Agent** | Agentic Architecture, Tool Design & MCP, Context Management & Reliability |
| **Code Generation with Claude Code** | Claude Code Configuration & Workflows, Context Management & Reliability |
| **Multi-Agent Research System** | Agentic Architecture, Tool Design & MCP, Context Management & Reliability |
| **Developer Productivity with Claude** | Agentic Architecture, Tool Design & MCP, Claude Code Configuration & Workflows |
| **Claude Code for CI/CD** | Claude Code Configuration & Workflows, Prompt Engineering & Structured Output |
| **Structured Data Extraction** | Prompt Engineering & Structured Output, Context Management & Reliability |

One interesting thing stands out from this mapping:

**Context Management & Reliability appears across many scenarios despite having the lowest exam weight (15%).**

That is a good reminder not to underestimate it.

A powerful agent with great tools and well-written prompts can still fail if it cannot manage context properly or behave reliably.

So while the domain weights help us understand the exam distribution, the scenarios help us understand how these skills work together in real systems.

And that distinction is important because it changes how we should prepare.

## It's Testing Our Judgement, Not Our Memory

One thing becomes clear while going through the exam guide:

**CCAR-F is not a vocabulary quiz.**

Knowing what MCP stands for, what an agent is, or what structured output means is useful. But simply remembering definitions won't get us very far.

The exam is more interested in questions like:

> "Given this situation, what would be the right architectural approach?"

For example:

- Our agent keeps selecting the wrong tool. How should we improve the design?
- Our multi-agent workflow is losing important information between steps. What should we change?
- Our Claude Code workflow needs to run reliably inside a CI/CD pipeline. What approach makes sense?

These are not questions where we can simply recall a definition from documentation. They require us to think like an architect.

We need to understand the **trade-offs, limitations, reliability considerations, and practical implications** behind each decision.

A good architect doesn't just ask:

> "Can we use this technology?"

The better question is:

> "Is this the right choice for this problem, considering the constraints?"

And that is the mindset I'm trying to build while preparing for CCAR-F.

I'm not just trying to remember what each concept does.

I'm trying to understand:

- when we should use it,
- when we should avoid it,
- what problems it solves,
- and why one approach is better than another.

Because in real-world architecture, there is rarely one perfect answer.

# Okay, But What Does the Actual Exam Look Like?

Now that we have a better understanding of what CCAR-F tests, let's answer the practical questions that usually come next:

- "How many questions are there?"
- "How much time do we get?"
- "What score do we need to pass?"
- "And yes... how much does this adventure cost?" 


| Detail | Value |
|---|---|
| **Exam Name** | Claude Certified Architect – Foundations |
| **Exam Code** | CCAR-F (also seen as CCA-F in some materials) |
| **Question Format** | Scenario-based multiple-choice and multiple-response questions |
| **Number of Questions** | 60 |
| **Scenario Coverage** | 4 scenarios selected from a pool of 6 |
| **Exam Duration** | 120 minutes |
| **Delivery** | Proctored exam — online or Pearson test center |
| **Passing Score** | 720 / 1,000 |
| **Exam Fee** | $125 USD (as of August 2026, when this post was written) |
| **Certification Validity** | 1 year |
| **Retakes** | Waiting period of 14 / 30 / 90 days after the 1st / 2nd / 3rd failed attempt; maximum 4 attempts within a rolling 12-month period |

At first glance, 60 questions in 120 minutes sounds quite comfortable.

Two minutes per question.

Plenty of time, right?

Well... not exactly. 😄

These are not the kind of questions where we simply recall a definition:

> "What does MCP stand for?"

Instead, we are placed inside a realistic scenario and asked to think through the problem:

- What is the actual challenge?
- Which approach makes the most sense?
- What trade-offs should we consider?
- Which option would create the most reliable architecture?

The exam is not testing how many Claude-related terms we can memorize. It's testing whether **we can think like an architect when faced with real-world decisions**.

And that brings us to the next part of our preparation journey:

**Understanding the five exam domains and what each one expects us to know.**

---

# The Five Domains: Our Roadmap for CCAR-F Preparation

TODO

---

<!-- # Free Resources I'm Using

Before spending money on any paid course, there's a genuinely solid free stack available:

**Official (Anthropic)**
- **Anthropic Partner Academy** (Skilljar) — free, self-paced courses that map directly to the exam blueprint, including Agent Skills, Building with the Claude API, Introduction to MCP, and Claude Code in Action. This is the closest thing to an official syllabus.
- **Anthropic developer docs** (docs.claude.com) — primary source for Messages API mechanics, tool use, `tool_choice`, the Message Batches API, and prompt caching.
- **"Building Effective Agents"** — Anthropic's engineering blog post on workflow vs. agent patterns; several exam task statements (coordinator/subagent design, prompt chaining) map almost directly onto its framing.
- **The MCP specification** (modelcontextprotocol.io) — for tools, resources, prompts, and the trust model.
- **Anthropic's public cookbook repo** on GitHub — worked examples of agentic loops, useful for our hands-on exercises below.
- **The official Exam Guide PDF itself** — download it from the certification page before doing anything else. It includes 12 full sample questions with explanations and a full task-statement breakdown per domain. I'm treating it as the single source of truth over any third-party blog, since I found real inconsistencies out there (some sites quote different fees or validity periods than what's actually in the guide).

**Community (free, unofficial — use as supplements, not primary source)**
- A couple of community GitHub repos host free study guides organized by domain, with topic checklists that mirror the blueprint's task statements — useful as a study index to make sure we haven't skipped a task statement.
- A couple of independent sites host free practice-question banks (several hundred questions) with explanations, styled after the exam's scenario format. Good for self-testing in week 3–4, not for learning concepts cold.

A caution on the community stuff: quality varies a lot, and a few sites have blurred "Anthropic Academy" (official, always free) with paid third-party "exam prep masterclasses." If a resource is charging money to teach us what's in the free official guide, skip it — everything we need to pass is either in the guide itself or in Anthropic's free docs/courses.

---

# My Week-by-Week Prep Plan (4 Weeks)

This assumes roughly **1–1.5 hours per weekday** plus a longer session on weekends, and that we already have *some* hands-on Claude experience (if we're starting from zero, add 2 weeks up front just for building small projects).

## Week 1 — Domain 1 + Domain 3 foundations (biggest combined weight: 47%)
- Read the Exam Guide in full once, cover to cover, so we know what "in scope" and "out of scope" actually mean before studying anything.
- Anthropic Academy: Agent Skills course + Claude Code in Action course.
- Docs deep-dive: agentic loop lifecycle, `stop_reason`, hooks (`PostToolUse`), `Task` tool, `CLAUDE.md` hierarchy, `.claude/rules/`.
- **Hands-on:** Exam Guide Exercise 1 (multi-tool agent with escalation logic) and Exercise 2 (Claude Code team workflow config).
- Weekend: re-read Domain 1 and Domain 3 task statements from the guide and self-check against what was built.

## Week 2 — Domain 2 + Domain 4 (combined weight: 38%)
- Anthropic Academy: Building with the Claude API course + Introduction to MCP course.
- Docs deep-dive: `tool_choice` options, JSON schema design (nullable fields, enum + "other" pattern), Message Batches API tradeoffs, MCP `isError` and structured error responses.
- **Hands-on:** Exercise 3 (structured data extraction pipeline with validation-retry loop and batch processing).
- Start Exercise 4 (multi-agent research pipeline) if time allows — it straddles into Week 3 anyway.

## Week 3 — Domain 5 + full scenario integration
- Finish Exercise 4 (error propagation, provenance/claim-source mapping, parallel subagent execution).
- Docs/blog deep-dive: "lost in the middle" effects, scratchpad files, context trimming, confidence calibration and stratified sampling for human review routing.
- Re-map everything built against all **six exam scenarios** — for each one, write a one-paragraph summary of what could go wrong and how we'd fix it. This forces domain knowledge into scenario-shaped answers, which is literally the exam's format.
- Start working through free community practice questions, but review the *reasoning* for wrong answers, not just the correct letter.

## Week 4 — Practice, gaps, and exam logistics
- Two full 60-question practice run-throughs under a 120-minute timer, using the community question banks.
- Track score by domain (most banks report this) and spend 2–3 focused sessions shoring up whichever domain is weakest — for me this is likely Domain 2, since MCP tool design is the area I've touched least in production.
- Re-read the 12 official sample questions in the Exam Guide one more time — they're the best calibration for actual difficulty and "trap answer" style (the guide's explanations show *why* the tempting-but-wrong options fail, which is the real skill being tested).
- Confirm exam logistics: ID matching registration name exactly, workspace/webcam rules if testing online, and schedule with a buffer day before in case of needing to push it out.
- Light review only in the final 48 hours — no new material.

---

# A Few Things I'd Tell Past-Me

- **Study scenario-first, not just domain-first.** The exam frames every question inside one of six production contexts, so practicing "given this scenario, what's the root cause" is closer to the real test than memorizing domain trivia in isolation.
- **Build, don't just read.** Nearly every sample question in the official guide is really testing *judgment calls we'd only internalize by having built the thing* — e.g., knowing that a programmatic hook beats a prompt instruction for guaranteed compliance isn't something one can memorize convincingly; we have to have hit that failure mode once.
- **Trust the official Exam Guide over blog posts** (including, ironically, parts of this one — always cross-check pricing/policy details against Anthropic's current guide before registering or scheduling, since terms can change between guide versions).

I'll post an update after the exam with what actually showed up versus what I over/under-prepared for. -->