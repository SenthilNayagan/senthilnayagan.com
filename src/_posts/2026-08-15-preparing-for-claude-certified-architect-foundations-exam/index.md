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

We'll encounter both codes in Anthropic-related material for the same **Claude Certified Architect – Foundations** certification.

So if we find a great CCA-F resource while preparing for CCAR-F, **let's not throw it away**. We've found the "right" rabbit hole. 🐇

For this blog, I'll use **CCAR-F** consistently.

---

# Where Does CCAR-F Fit?

Before we jump into the exam, there's one thing worth clearing up: Claude certifications aren't all aimed at the same kind of role.

Think of the three role tracks like this:

## Associate — Understanding Claude

The Associate track is for people who need to understand Claude and how it can be used, without necessarily being the person designing or building the underlying systems.

Think:

> "We need to understand what Claude can do and how to work with it effectively."

## Developer — Building with Claude

The Developer track is for people who actually build applications and features using Claude.

Think:

> "Give us the requirements and we'll build the thing."

This is where knowledge of APIs, SDKs, integrations and implementation becomes important.

## Architect — Designing with Claude

The Architect track is about the bigger picture: designing production solutions, choosing the right architecture, and making trade-offs between different approaches.

Think:

> "Before we build this, let's figure out how we should build it."

And this is where my certification lives.

I'm preparing specifically for:

> **Claude Certified Architect – Foundations (CCAR-F)**

Anthropic describes this certification as being aimed at solution architects with hands-on experience building production applications with Claude and the Anthropic API.

So, very roughly:

- **Associate → Understand it**
- **Developer → Build it**
- **Architect → Design it**

And I'm currently volunteering for the **"Design it"** part.

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

> **Domains = WHAT we need to know.**  
> **Scenarios = WHERE we need to apply it.**

The five exam domains are:

| # | Domain | Weight |
|---|---|---:|
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
- How it manages information and behaves reliably (**Context Management & Reliability**)

So we shouldn't think:

> **Scenario 1 = Domain 1**

That would make preparation unnecessarily complicated.

Instead, think of it this way:

> **Domains are our toolbox. Scenarios are the projects where we use the toolbox.**

And this is where things get interesting.

A single scenario can touch multiple domains because real-world architecture problems rarely arrive neatly labelled:

> "Hello architect, today's challenge belongs only to Domain 3." 😄

They usually look more like:

> "We need an AI assistant that can help developers, call tools, remember context, produce reliable output, and work inside our delivery pipeline."

Suddenly, we're dealing with multiple domains at the same time.

Here's how I think about the relationship between the six scenarios and the five domains:

| Scenario | Related Domains |
|---|---|
| **Customer Support Resolution Agent** | Agentic Architecture, Tool Design & MCP, Context Management & Reliability |
| **Code Generation with Claude Code** | Claude Code Configuration & Workflows, Context Management & Reliability |
| **Multi-Agent Research System** | Agentic Architecture, Tool Design & MCP, Context Management & Reliability |
| **Developer Productivity with Claude** | Agentic Architecture, Tool Design & MCP, Claude Code Configuration & Workflows |
| **Claude Code for CI/CD** | Claude Code Configuration & Workflows, Prompt Engineering & Structured Output |
| **Structured Data Extraction** | Prompt Engineering & Structured Output, Context Management & Reliability |

One interesting thing stands out from this mapping:

**Context Management & Reliability appears in four of the six scenarios despite having the lowest exam weight (15%).**

That's a good reminder not to underestimate it.

A powerful agent with great tools and well-written prompts can still fail if it cannot manage context properly or behave reliably.

So while the domain weights help us understand the exam distribution, the scenarios help us understand how these skills work together in real systems.

And that distinction is important because it changes how we should prepare.

## It's Testing Our Judgement, Not Our Memory

One thing becomes clear while going through the Exam Guide:

**CCAR-F is not a vocabulary quiz.**

Knowing what MCP stands for, what an agent is, or what structured output means is useful. But simply remembering definitions won't get us very far.

The exam is more interested in questions like:

> "Given this situation, what would be the right architectural approach?"

For example:

- Our agent keeps selecting the wrong tool. How should we improve the design?
- Our multi-agent workflow is losing important information between steps. What should we change?
- Our Claude Code workflow needs to run reliably inside a CI/CD pipeline. What approach makes sense?

These are not questions where we can simply recall a definition from documentation.

They require us to think like an architect.

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

{% include "postImage.html" src: "./images/ccar-f-at-a-glance.png", alt: "CCAR-F certification at a glance — role tracks, domains, scenarios, and how they connect", description: "<b>Figure 1: </b>Everything covered so far, in one glance — the three role tracks, the 5 weighted domains, the 6 scenarios, and how a scenario maps to multiple domains." %}

---

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
| **Question Format** | Scenario-based questions; the current Exam Guide describes one correct answer with three distractors |
| **Number of Questions** | 60 |
| **Scenario Coverage** | 4 scenarios selected from a pool of 6 |
| **Exam Duration** | 120 minutes |
| **Delivery** | Proctored exam — online or Pearson test center |
| **Passing Score** | 720 / 1,000 |
| **Exam Fee** | $125 USD (as of August 2026, when this post was written) |
| **Certification Validity** | 1 year |
| **Retakes** | Waiting period of 14 / 30 / 90 days after the 1st / 2nd / 3rd failed attempt; maximum 4 attempts within a rolling 12-month period |

> **A note on question format:** Anthropic's certification materials have not always described the question format consistently. For this table, I'm following the current **Exam Guide** as the primary source.

At first glance, **60 questions in 120 minutes** sounds quite comfortable.

Two minutes per question.

Plenty of time, right?

Well... not exactly. 😄

These are not the kind of questions where we simply recall a definition:

> "What does MCP stand for?"

Instead, we're placed inside a realistic scenario and asked to think through the problem:

- What is the actual challenge?
- Which approach makes the most sense?
- What trade-offs should we consider?
- Which option would create the most reliable architecture?

The exam is not testing how many Claude-related terms we can memorise.

It's testing whether **we can think like an architect when faced with real-world decisions**.

And that brings us to the next question:

> **How are we actually going to prepare for this?**

---

# How I'm Going to Prepare

Now we know what CCAR-F is, what it tests, and what the actual exam looks like.

So the obvious question is:

> **How are we actually going to prepare for all this?**

I'm going to keep the approach simple.

I don't want to treat **five domains + seven courses + six scenarios** as twelve different things to study.

That would make the certification look like a small PhD with a registration fee. 😄

Instead, I'm thinking about the preparation as a few connected pieces:

## The Five Domains — What We Need to Know

The **five exam domains** are going to be our main study roadmap.

I'll take each domain separately in its own article and break it down into simple language:

- What does this domain actually mean?
- What should we understand?
- Why does it matter in a real system?
- What kind of architectural decisions might we need to make?
- Can we build a small example to make the idea stick?

I'll use Anthropic's official learning material and documentation as the foundation, then add my own explanations, examples, illustrations and hands-on experiments.

And when something sounds like it was written specifically to confuse perfectly innocent engineers, we'll translate that too. 😄

I'll document each domain as a separate article, so we can go as deep as needed without turning this post into a 30,000-word study guide.

## The Seven Free Courses — Where We Learn It

Anthropic also provides **seven free courses** as recommended preparation resources.

I'm going to work through them as part of my preparation, but I don't want to treat them as a second syllabus.

Think of it this way:

> **The domains tell us what we need to know.**  
> **The courses give us places to learn it.**

I'll have a separate article covering all seven courses, including what each course covers, which domains it helps with, and my experience as I work through them.

## The Six Scenarios — Where We Put It Together

Knowing individual concepts isn't enough.

The exam puts those concepts into realistic scenarios, so I'll use the six scenarios to bring multiple domains together.

For example, instead of learning agent orchestration in isolation, we'll ask:

> **How would we use it in a multi-agent research system?**

Or instead of learning MCP as a standalone technology:

> **How would we use tools and MCP in a customer-support agent?**

This is where the individual pieces start becoming architecture.

## Hands-On Practice — Where We Find Out If We Actually Understand It

And finally, I'll build small examples along the way.

Not giant production systems. Just enough to turn:

> "I think I understand this..."

into:

> "Okay, now I understand why this works."

I'll also use scenario-based practice questions to test the most important part of the exam: **our ability to make the right architectural decision when several answers look reasonable.**

---

## So What's the Plan?

In simple terms:

> **Learn → Understand → Build → Apply → Practise → Revisit the weak spots**

But there's one thing I don't want to assume.

Not everyone starting CCAR-F will have the same level of experience with Claude, agents, MCP, APIs or Claude Code.

Some of us may already be comfortable with these concepts.

Others may be looking at terms like *agentic loop*, *context window*, *tool use* or *MCP* and thinking:

> "Right... I suppose I should understand what those words mean first." 😄

That's completely fine.

So I'm keeping **two entry points** into the preparation.

---

## Path 1: We Need the Basics First

If concepts such as **LLMs, context windows, tool use, agents, MCP, structured output or Claude Code** are still new to us, it's worth building those foundations first.

I've created a separate **CCAR-F Foundations / 101** path for exactly that.

The goal isn't to turn this into a three-month course on the history of artificial intelligence.

We'll cover only the foundations that help us understand the CCAR-F material comfortably.

We'll start with the basics, build the mental models, and then come back to the certification domains.

> **Start here → [CCAR-F Foundations: The Basics We Need to Know](/blog/ccar-f-foundations/)**

This path is **optional**.

It's there to remove the terminology barrier, not to add another syllabus to our preparation.

---

## Path 2: We Already Know the Basics

If we're already comfortable with Claude, LLMs, agents, tool use, MCP and the surrounding concepts, there's no reason to take the scenic route.

We can skip the foundations and go straight into the certification preparation.

We'll start with the biggest exam domain:

> **Agentic Architecture & Orchestration — 27%**

This is where we'll take the official material apart, translate it into plain English, build examples, explore architectural trade-offs and document what we learn along the way.

> **Continue the CCAR-F preparation → [Domain 1: Agentic Architecture & Orchestration](/blog/ccar-f-domain-1-agentic-architecture-orchestration/)**

---

## Where Do Both Paths Lead?

Whichever path we choose, the destination is the same.

We'll work through the **five exam domains**, use Anthropic's recommended courses and documentation to fill the gaps, build small hands-on examples, and then bring everything together through the **six exam scenarios**.

The goal isn't simply to finish courses or tick boxes.

It's to reach the point where, when we're given a scenario and several possible architectural approaches, we can look at the problem and say:

> **"Here's what I'd choose — and here's why."**

That's the skill we're ultimately preparing for.

And that's where the real journey begins.