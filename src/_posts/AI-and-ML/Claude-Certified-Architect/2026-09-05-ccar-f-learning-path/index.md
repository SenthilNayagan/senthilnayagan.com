---
title: "CCAR-F Learning Path: From LLM Fundamentals to Architecture"
description: >-
  A dependency-based learning path for preparing for the Claude Certified Architect – Foundations
  (CCAR-F) exam. I'll work through the concepts step by step, starting with LLM fundamentals and
  Claude API basics, then moving through prompting, tool use, structured output, MCP, agentic
  systems, task decomposition, multi-agent architecture, Claude Agent SDK, Claude Code, context
  management, reliability, and architecture. Each topic will have its own focused article, with
  examples, hands-on experiments, and links to the relevant CCAR-F domains and scenarios.
keywords:
  - claude-certified-architect
  - ccar-f
  - ccar-f-learning-path
  - llm-fundamentals
  - agentic-architecture
  - claude-api
  - tool-use
  - mcp
  - claude-code
  - agent-sdk
tags:
  - claude-certified-architect
  - ccar-f
  - ccar-f-learning-path
  - llm-fundamentals
  - agentic-architecture
  - claude-api
  - tool-use
  - mcp
  - claude-code
  - agent-sdk
# coverImage: ./images/cover-image.png — add once the AI-generated cover art is ready, then create
# the images/ folder next to this file (matches the master post's convention).
# imageCredits: AI-generated image.
featured: false
draft: true
---

{% include "toc.md" %}

# Intro

I initially thought the obvious way to prepare for CCAR-F was to study the exam domains one by one.

Start with Domain 1.

Finish it.

Move to Domain 2.

Repeat until all five domains were covered.

Simple, right?

Well... not quite. 😄

The more I looked at the concepts involved, the less convinced I became that the **exam structure should also be our learning structure**.

How do we really understand multi-agent architecture if we haven't understood agents yet?

How do we understand agents if we don't understand tool use?

And how do we understand tool use if we don't have a basic mental model of how an LLM, context and an API actually work?

That's when I started thinking about the preparation differently.

> **The exam has a map. Learning has dependencies.**

So instead of simply following the exam domains from beginning to end, I'm going to build my understanding progressively — starting with the fundamentals and gradually moving towards agentic systems, architecture and scenario-based reasoning.

This page is the map of that journey.

---

## The Exam Has a Map. Learning Has a Path.

The CCAR-F exam gives us a useful map of the knowledge areas we need to understand.

But when we're actually learning those concepts, we don't necessarily want to follow that map from top to bottom.

Some concepts naturally depend on others.

For example, it makes sense to understand:

**LLM fundamentals → before → agents**

and:

**tool use → before → agentic loops**

and:

**agents → before → multi-agent architecture**

Trying to learn those topics in the opposite order would be possible, but we'd spend a lot of time filling in missing pieces along the way.

So I'm separating two things:

> **The domains tell us WHAT we need to know.**  
> **The learning path tells us HOW I'm going to build that knowledge.**

And there's a third piece:

> **The scenarios tell us WHERE we apply that knowledge.**

Think of the exam domains as our **toolbox**.

The learning path is the order in which we're learning to use those tools.

The hands-on projects let us use the tools ourselves.

And the scenarios are the projects where we have to decide which tools to use — and why.

---

## What This Learning Path Is

This page is the **map of my learning journey**.

It isn't intended to teach every concept itself.

Instead, I'll break the journey into focused articles, with each article covering one major concept or a closely related group of concepts.

As I work through each topic, I'll link the corresponding article from this page.

That means this page will gradually become the central place to navigate the entire CCAR-F learning journey.

### What this page isn't

It isn't another exam syllabus.

It isn't a replacement for Anthropic's official documentation or courses.

And it isn't a claim that this is the only correct way to prepare for CCAR-F.

It's simply the learning sequence that makes sense to me as I build my understanding from the ground up.

If a concept turns out to need more explanation, I'll split it into additional articles.

If two concepts make more sense together, I'll combine them.

The goal is simple:

> **Build understanding first. Then use that understanding to reason about architecture.**

---

# The Journey

So, where are we actually going?

We're going to start with something deceptively simple:

> **What actually happens when we ask an LLM to do something?**

From there, we'll gradually add capabilities.

First, we'll build a mental model of LLMs, tokens and context.

Then we'll look at Claude and the API — how an application actually communicates with a model.

Then we'll learn how to give Claude better instructions.

After that, we'll give Claude the ability to interact with the outside world through tools.

We'll make those interactions more predictable with structured output.

Then we'll look at MCP and how it can provide a standardized way for AI applications to connect with tools and external context.

And then things get interesting.

We'll move from individual model interactions into **agentic systems**.

From there we'll explore task decomposition, multi-agent architecture, the Claude Agent SDK and Claude Code.

Finally, we'll deal with the problems that appear as these systems become more capable:

**context, reliability, architecture and trade-offs.**

And then we'll take everything we've learned and put it into scenarios.

The journey looks roughly like this:

```text
LLM Fundamentals
       ↓
Claude & API Fundamentals
       ↓
Prompt Engineering
       ↓
Tool Use
       ↓
Structured Output
       ↓
MCP
       ↓
Agentic Systems
       ↓
Task Decomposition
       ↓
Multi-Agent Architecture
       ↓
Claude Agent SDK
       ↓
Claude Code
       ↓
Context Management
       ↓
Reliability
       ↓
Architecture & Trade-offs
       ↓
Scenario Practice
```

Let's break that journey down.

---

# Stage 1 — Build the Mental Model

## 1. LLM Fundamentals

Before we start talking about agents, tools and orchestration, I want to make sure we understand the thing at the centre of all of it:

**the LLM.**

We'll start with concepts such as:

- What is an LLM?
- Tokens
- Input and output
- Context
- Context windows
- How an LLM generates responses
- The limitations of LLMs
- Why LLM applications behave differently from traditional software

The goal isn't to become an expert in machine learning.

It's to build a mental model strong enough that later concepts don't feel like magic.

> **Goal:** Understand the basic building blocks behind Claude-powered applications.

**Learning article:**  
→ *LLM Fundamentals for CCAR-F* — coming soon

---

# Stage 2 — Meet Claude

## 2. Claude & API Fundamentals

Now that we have a basic understanding of LLMs, we'll look at how we actually interact with Claude from an application.

We'll explore concepts such as:

- Claude models
- The Messages API
- Requests and responses
- System prompts
- Model selection
- Token counting
- Basic Claude application structure

This gives us the bridge between:

> **“I understand what an LLM is.”**

and:

> **“I understand how an application actually uses Claude.”**

> **Goal:** Understand how our application communicates with Claude.

**Learning article:**  
→ *Claude & API Fundamentals* — coming soon

---

# Stage 3 — Learn to Communicate

## 3. Prompt Engineering

We can call Claude successfully and still get poor results.

Why?

Because telling a model what we want isn't always as straightforward as it sounds.

We'll explore:

- Instructions
- Context
- Examples
- Prompt structure
- Clear requirements
- Structured prompting
- Common prompting mistakes
- Techniques for improving consistency

The goal isn't to collect a bag of clever prompting tricks.

It's to understand how to communicate requirements clearly enough for Claude to produce useful results.

> **Goal:** Learn how to turn a vague requirement into a clear instruction.

**Learning article:**  
→ *Prompt Engineering for Claude* — coming soon

---

# Stage 4 — Give Claude Hands

## 4. Tool Use

Up to this point, Claude can receive information and generate a response.

But what if we want Claude to **do something**?

Check an order.

Query a database.

Call an API.

Run a function.

Search for information.

Now we need tools.

We'll explore:

- What tools are
- Tool definitions
- Tool calls
- Tool results
- The application/tool execution loop
- Tool selection
- Handling tool errors
- Designing useful tools

This is an important transition because tools are one of the building blocks that allow us to move from simple model interactions towards agentic systems.

> **Goal:** Understand how Claude can interact with external capabilities.

**Learning article:**  
→ *Tool Use in Claude* — coming soon

---

# Stage 5 — Make the Output Usable

## 5. Structured Output

There's a difference between:

> “Claude gave me a useful answer.”

and:

> “My application can reliably consume Claude's answer.”

Once Claude starts interacting with software, predictable output becomes increasingly important.

We'll look at:

- JSON output
- Schemas
- Structured responses
- Validation
- Structured tool use
- Making model output easier for applications to consume

The goal is to understand how we can make the boundary between Claude and our application more predictable.

> **Goal:** Make Claude's output structured and usable by software.

**Learning article:**  
→ *Structured Output with Claude* — coming soon

---

# Stage 6 — Connect Claude to the Outside World

## 6. Model Context Protocol (MCP)

We now have a model.

We know how to communicate with it.

We can give it instructions.

We can give it tools.

We can make its output structured.

Now we need to think about connecting AI applications to external tools, systems and context in a more standardized way.

That's where **MCP** comes in.

We'll explore:

- What MCP is
- Why it exists
- MCP servers and clients
- Tools
- Resources
- Prompts
- How MCP fits into Claude applications
- When MCP makes sense
- Where MCP fits into a larger architecture

The important thing here isn't simply memorizing what MCP stands for.

It's understanding the architectural problem it is trying to solve.

> **Goal:** Understand how Claude applications can connect to external tools and context through MCP.

**Learning article:**  
→ *Model Context Protocol (MCP)* — coming soon

---

# Stage 7 — From Model Calls to Agents

## 7. Agentic Systems

This is where the journey starts to become more architectural.

So far, we've mostly been thinking about:

```text
Request → Claude → Response
```

But real applications often need more.

What if Claude needs to decide what to do next?

What if it needs to:

1. Understand a goal
2. Decide on an action
3. Call a tool
4. Inspect the result
5. Decide what to do next
6. Continue until the task is complete

Now we're no longer talking about a single model call.

We're talking about an **agentic loop**.

We'll explore:

- What makes a system agentic
- The agent loop
- Reasoning and action
- Tool interaction
- Planning
- State
- Feedback
- Agent boundaries
- When an agent is useful
- When a simple workflow is better

This is one of the points where the concepts we've learned earlier start coming together.

> **Goal:** Understand how individual model capabilities become an agentic system.

**Learning article:**  
→ *Agentic Systems and the Agent Loop* — coming soon

---

# Stage 8 — Break the Problem Apart

## 8. Task Decomposition

A complex problem doesn't always need to be solved as one giant task.

Sometimes the better approach is to break it into smaller pieces.

We'll explore:

- Task decomposition
- Subtasks
- Planning
- Sequencing
- Delegation
- Dependencies between tasks
- Parallel vs sequential work
- When decomposition helps
- When decomposition adds unnecessary complexity

This is where we'll start thinking less about:

> “What can Claude do?”

and more about:

> “How should we structure the work?”

> **Goal:** Learn how to break complex problems into manageable pieces.

**Learning article:**  
→ *Task Decomposition for Agentic Systems* — coming soon

---

# Stage 9 — Introduce Multiple Agents

## 9. Multi-Agent Architecture

Once we know how to build an agent, the next question naturally appears:

> **What happens when one agent isn't the best architecture?**

Perhaps different tasks require different capabilities.

Perhaps we want specialized agents.

Perhaps one agent should coordinate the work while others handle individual tasks.

We'll explore:

- Specialized agents
- Coordinators
- Delegation
- Agent-to-agent communication
- Shared vs isolated context
- Parallel agents
- Multi-agent trade-offs
- When multi-agent architecture is useful
- When it is unnecessary complexity

The important question won't simply be:

> “How do we build multiple agents?”

It will be:

> **“Why would we choose multiple agents in the first place?”**

> **Goal:** Understand the architectural trade-offs behind multi-agent systems.

**Learning article:**  
→ *Multi-Agent Architecture* — coming soon

---

# Stage 10 — Build Agentic Applications

## 10. Claude Agent SDK

We've now built the conceptual foundation for agentic systems.

The next step is to look at the tooling that helps us build them.

We'll explore the Claude Agent SDK and the concepts involved in building agentic applications with it.

We'll focus on understanding:

- What the SDK provides
- How agents are structured
- Tool integration
- Agent execution
- Context
- Permissions
- Extensibility
- Where an SDK fits into the architecture

The goal here isn't simply to learn an API.

It's to understand **what problems the SDK helps us solve**.

> **Goal:** Connect our agentic architecture concepts to practical agent development.

**Learning article:**  
→ *Claude Agent SDK* — coming soon

---

# Stage 11 — Claude Code

## 11. Understanding Claude Code

Claude Code gives us another practical environment in which many of these concepts come together.

We'll explore the parts that are relevant to our architectural understanding, including:

- How Claude Code works
- Project context
- `CLAUDE.md`
- Skills
- Subagents
- MCP
- Hooks
- Permissions
- Configuration
- Extending Claude Code

The goal isn't to become a Claude Code power user simply for the sake of it.

It's to understand the architectural ideas behind the environment and how its different capabilities fit together.

> **Goal:** Understand Claude Code as a practical example of a Claude-powered agentic environment.

**Learning article:**  
→ *Claude Code Architecture and Concepts* — coming soon

---

# Stage 12 — Context Management

## 12. Managing Context

As our systems become more capable, another problem becomes increasingly important:

> **What information should the model actually see?**

More context isn't automatically better.

Long-running workflows, multiple tools, previous results and accumulated information can make context management increasingly important.

We'll explore:

- Context windows
- Context composition
- Relevant vs irrelevant information
- Context growth
- Context isolation
- Summarization and compaction
- Managing long-running workflows
- The relationship between context and system reliability

This is where the earlier LLM fundamentals start becoming very practical.

> **Goal:** Learn how to manage information effectively as agentic systems become more complex.

**Learning article:**  
→ *Context Management for Claude Applications* — coming soon

---

# Stage 13 — Reliability

## 13. Making Systems Reliable

So far, we've been making our systems more capable.

But capability creates new problems.

More tools mean more possible failures.

More agents mean more coordination points.

Longer workflows mean more opportunities for something to go wrong.

And once an AI system becomes part of a real application, “it worked once” isn't a particularly impressive reliability strategy. 😄

We'll explore:

- Failure modes
- Tool failures
- Model variability
- Retries
- Validation
- Guardrails
- Human-in-the-loop decisions
- Fallback strategies
- Designing for graceful failure

The goal is to move from:

> **“The system works.”**

to:

> **“The system behaves reasonably when things don't go according to plan.”**

> **Goal:** Understand how to design AI systems that remain useful when individual components fail.

**Learning article:**  
→ *Reliability in Agentic Systems* — coming soon

---

# Stage 14 — Architecture & Trade-offs

## 14. From Components to Architecture

This is where everything starts coming together.

By this point, we should have learned about:

- LLMs
- Claude
- APIs
- Prompting
- Tools
- Structured output
- MCP
- Agents
- Task decomposition
- Multi-agent systems
- Agent development
- Claude Code
- Context
- Reliability

But knowing all those things individually isn't the same as being able to design a system.

Architecture is about making choices.

For a given problem, we might have several possible approaches.

Should we use:

- A simple Claude call?
- A workflow?
- An agent?
- Multiple agents?
- Tools?
- MCP?
- Human approval?
- A more constrained design?

And perhaps the most important question:

> **Why?**

We'll focus on architectural reasoning and trade-offs:

- Simplicity vs capability
- Control vs autonomy
- Cost vs performance
- Latency vs quality
- Single-agent vs multi-agent
- Deterministic workflows vs agentic systems
- Context isolation
- Reliability
- Security
- Maintainability
- Operational complexity

The goal isn't to find a single architecture that works for everything.

It's to learn how to choose an architecture **for the problem in front of us**.

> **Goal:** Develop the architectural judgement needed to make and explain design decisions.

**Learning article:**  
→ *Architecture & Trade-offs for Claude Applications* — coming soon

---

# Stage 15 — Put It All Together

## 15. Scenario Practice

We've now accumulated a toolbox.

We've learned what the tools do.

We've built small things with them.

We've explored what happens when systems become more complex.

Now we need to stop looking at each concept independently.

**It's time to solve problems.**

A scenario might require us to think about agents, tools, context, orchestration, reliability and architecture at the same time.

That's the point.

We're no longer asking:

> **“What is MCP?”**

We're asking:

> **“Given this architecture problem, would MCP be a good choice here — and why?”**

We're no longer asking:

> **“What is a multi-agent system?”**

We're asking:

> **“Does this problem actually need multiple agents, or would a simpler architecture be better?”**

This is where the learning path connects back to the certification domains and the scenario-based nature of the exam.

> **Goal:** Apply everything we've learned to architectural problems and practise explaining our decisions.

**Scenario practice:**  
→ *CCAR-F Scenario Practice* — coming soon

---

# How the Learning Path Connects to the Exam Domains

One final thing is important.

This learning path **doesn't replace the five CCAR-F exam domains**.

I'll keep coming back to those domains throughout the journey.

As each concept is completed, I'll map it back to the relevant domain or domains so we can see not only:

> **What are we learning?**

but also:

> **Why does it matter for the certification?**

This gives us two different views of the same knowledge.

### The Learning View

```text
LLM Fundamentals
      ↓
Claude & API
      ↓
Prompting
      ↓
Tool Use
      ↓
MCP
      ↓
Agents
      ↓
Architecture
```

### The Exam View

```text
             CCAR-F Domains
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   Concepts     Architecture   Scenarios
       │            │            │
       └────────────┴────────────┘
                    ↓
              Exam Reasoning
```

We learn the concepts in **dependency order**.

We organise our exam knowledge by **domain**.

And we practise by solving **scenarios**.

---

# The Goal

The goal isn't simply to finish courses.

It isn't to publish a certain number of articles.

And it certainly isn't to memorize every page of Anthropic's documentation.

The goal is to gradually build enough understanding that we can look at an architectural problem, identify the important constraints, consider the available approaches, understand the trade-offs and make a reasoned decision.

Eventually, when we're given a scenario and several possible architectural approaches, we want to be able to say:

> **“Here's what I'd choose — and here's why.”**

That's the skill we're ultimately preparing for.

So this is the path I'll be following:

> **Learn → Understand → Build → Apply → Practise → Revisit the weak spots**

And I'll document the journey one concept at a time.

Let's start with the thing everything else is built on:

> **LLM Fundamentals.**