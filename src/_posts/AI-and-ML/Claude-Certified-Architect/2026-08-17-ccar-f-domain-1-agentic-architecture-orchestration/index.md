---
title: "CCAR-F Domain 1: Agentic Architecture & Orchestration"
description: >-
  I'm preparing for CCAR-F Domain 1: Agentic Architecture & Orchestration,
  the largest domain at 27% of the exam. We'll break down what Anthropic
  expects us to understand about agentic loops, multi-agent orchestration,
  subagents, task decomposition, workflows, Agent SDK hooks, and session
  management — in plain English, with examples, illustrations, hands-on
  experiments, and the architectural trade-offs that actually matter.
keywords:
  - claude-certified-architect
  - ccar-f
  - agentic-architecture
  - agentic-ai
  - ai-agents
  - agent-sdk
  - multi-agent-systems
  - claude-api
tags:
  - claude-certified-architect
  - ccar-f
  - agentic-architecture
  - agentic-ai
  - ai-agents
  - agent-sdk
  - claude-api
# coverImage: ./images/cover-image.png — add once the AI-generated cover art is ready, then create
# the images/ folder next to this file (matches the master post's convention).
# imageCredits: AI-generated image.
featured: false
draft: true
---

{% include "toc.md" %}

# Why Domain 1 Comes First

Of the five CCAR-F exam domains, **Agentic Architecture & Orchestration carries the highest weight, at 27%** — more than any other single domain.

That's not an accident of exam design. Agents sit at the center of most Claude-powered systems: tool design (Domain 2), Claude Code workflows (Domain 3), prompt engineering (Domain 4), and context management (Domain 5) all exist in service of building agents that work reliably. Get the architecture wrong here, and the other domains inherit that problem.

If any of **LLM, context window, tool use, agent, or MCP** feel unfamiliar, [CCAR-F Foundations](/blog/ccar-f-foundations/) is worth a quick detour first — this post builds directly on those terms.

---

# The Agentic Loop

At the center of Domain 1 is one repeating idea, the **agentic loop**:

1. **Observe** — look at the current state: the task, the conversation so far, any tool results.
2. **Decide** — choose the next action: call a tool, ask a clarifying question, or respond with the final answer.
3. **Act** — execute that action.
4. **Repeat** — feed the result back in and go again, until the model decides the task is done.

The important shift here is from a single request/response call to a model that can take **multiple steps toward a goal**, adjusting its plan as new information (tool results, errors, user feedback) comes in. That's the difference between "an LLM call" and "an agent."

---

# Multi-Agent Orchestration

A single agentic loop works well for focused tasks. But some problems are genuinely too broad for one agent to handle cleanly — too many unrelated subtasks, too much context to hold at once, or work that benefits from specialization.

**Multi-agent orchestration** splits that work across multiple agents, typically with an **orchestrator** (or "lead") agent that breaks down the goal and delegates pieces to **worker agents**, each with a narrower job and its own context.

The trade-off is real, though: more agents means more coordination overhead, more places for miscommunication between agents, and more cost (each agent burns its own tokens). Domain 1 is testing whether we know *when* multi-agent orchestration earns its complexity — not whether we can name it.

---

# Subagents

**Subagents** are a specific flavor of multi-agent design available through the Agent SDK: a parent agent can spin up a subagent to handle a self-contained piece of work, in its own context window, and receive back just the result — not the subagent's entire internal reasoning trail.

Why that matters: it keeps the parent agent's own context window from filling up with the noise of exploratory work (searching, reading files, trying things that don't pan out). The parent gets a clean answer; the mess stays contained.

This connects directly back to **Context Management & Reliability** (Domain 5) — subagents are, among other things, a context management technique.

---

# Task Decomposition

Before any orchestration can happen, something has to decide *how* to break a big goal into smaller, actionable steps. That's **task decomposition**.

Done well, each step is concrete enough for an agent (or subagent) to execute and verify independently. Done poorly, we get steps that are too vague to act on, or too tangled to run independently — which defeats the point of splitting the work up at all.

This is often the part that separates a working multi-agent system from a merely impressive-looking one.

---

# Workflows vs. Agents

It's tempting to reach for "an agent" as the default architecture for everything. Anthropic's own guidance draws a useful line between two different patterns:

- **Workflows** — predefined, deterministic sequences of steps (do A, then B, then C). Predictable, easy to test, easy to reason about.
- **Agents** — the model dynamically decides its own steps and tool calls in a loop, based on what it observes along the way. Flexible, but less predictable.

The architectural judgment CCAR-F is testing: **not every problem needs an agent.** A fixed, well-understood process is often better served by a workflow — simpler to build, cheaper to run, and far easier to debug when it fails. Agents earn their complexity when the path to the goal genuinely can't be known in advance.

---

# Agent SDK Hooks

Once we accept that agents behave somewhat unpredictably by design, we need ways to observe and, when necessary, intervene in that behavior. That's what **hooks** are for in the Agent SDK — defined points in the agentic loop where our own code can run.

Common examples:

- **Before a tool call** — validate or block an action before it executes (e.g. refuse a destructive file operation).
- **After a tool call** — inspect or log the result before the agent sees it.
- **On session start/end** — set up or tear down state around a run.

Hooks are how we keep an autonomous loop from being a total black box — they're the architectural seams where governance, safety checks, and observability actually get implemented.

---

# Session Management

An agent rarely operates in a single isolated turn. **Session management** covers how state — conversation history, intermediate results, tool outputs — persists and gets reused across multiple turns or even multiple separate runs.

Get this wrong and we see it immediately: an agent that "forgets" what it just did, repeats work it already completed, or loses track of a multi-step task halfway through. Get it right, and an agent can be paused, resumed, or handed off without losing its place.

---

# Architectural Trade-offs That Actually Matter

A few of the judgment calls Domain 1 keeps circling back to:

| Choice | Favors simplicity | Favors flexibility |
|---|---|---|
| Single agent vs. multi-agent | Single agent | Multi-agent orchestration |
| Workflow vs. agent | Fixed workflow | Autonomous agent |
| One big context vs. subagents | One context | Subagents |

None of these are "always pick the right column" decisions — they're trade-offs, and the exam's scenario-based format (per the [master prep post](/blog/preparing-for-claude-certified-architect-foundations-exam/)) is specifically designed to test whether we can justify the choice for a *given* situation, not recite a rule.

---

# What's Next

Domain 1 sets up the architectural backbone; the next domain is about what those agents actually connect to:

> **Continue the CCAR-F preparation → Domain 2: Tool Design & MCP Integration** *(coming soon)*
