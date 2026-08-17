---
title: "CCAR-F Foundations: The Basics We Need to Know Before We Dive In"
description: >-
  New to Claude, LLMs, agents, MCP, or the concepts behind CCAR-F? This
  foundations path covers the essential building blocks we need before diving
  into the five CCAR-F exam domains. Simple explanations, practical examples,
  illustrations, and hopefully without turning a few basic questions into
  another 27 browser tabs.
keywords:
  - claude-certified-architect
  - ccar-f
  - claude-foundations
  - claude-101
  - ai-agents
  - mcp
  - llm
tags:
  - claude-certified-architect
  - ccar-f
  - claude-foundations
  - claude-101
  - ai-agents
  - mcp
# coverImage: ./images/cover-image.png — add once the AI-generated cover art is ready, then create
# the images/ folder next to this file (matches the master post's convention).
# imageCredits: AI-generated image.
featured: false
draft: true
---

{% include "toc.md" %}

# Why This Foundations Path Exists

This is **Path 1** from [How I'm Preparing for the Claude Certified Architect – Foundations Exam (CCAR-F)](/blog/preparing-for-claude-certified-architect-foundations-exam/#path-1-we-need-the-basics-first).

If terms like **LLM, context window, tool use, agent, MCP, structured output** or **Claude Code** already feel familiar, there's no reason to be here — [Domain 1: Agentic Architecture & Orchestration](/blog/ccar-f-domain-1-agentic-architecture-orchestration/) is where the actual CCAR-F preparation starts.

But if a few of those words made us pause, even briefly, this post is for us.

The goal here isn't a three-month history of artificial intelligence. It's just enough of a mental model — in plain English, with examples — that the CCAR-F domains stop reading like a wall of unfamiliar terminology and start reading like things we can reason about.

---

# Claude, in One Paragraph

Claude is the family of AI models built by Anthropic. We talk to it, it talks back, and somewhere underneath that conversation is a **large language model** doing the actual work. That's really the whole picture we need for now — everything else in this post is about unpacking what that sentence actually means.

---

# LLMs — Large Language Models

An LLM is, at its core, a very large statistical model trained to predict **the next word** (technically, the next *token* — more on that in a moment) given everything that came before it.

That's it. That's the trick.

Trained on enormous amounts of text, the model learns patterns — grammar, facts, reasoning steps, code, tone — well enough that "predict the next word, over and over again" starts to look a lot like writing, explaining, and reasoning.

A **token** is just a chunk of text — sometimes a whole word, sometimes a piece of one. When we hear about "context window size in tokens," this is what's being counted.

---

# Context Windows

The **context window** is how much text the model can "see" at once — our messages, its previous replies, any documents or tool results we've handed it. Think of it as the model's short-term memory for this conversation, not a permanent one.

Once we go past that limit, older content has to drop off (or get summarized) to make room for new content. This matters a lot for CCAR-F: agents that call tools repeatedly, read files, or juggle long conversations can burn through a context window surprisingly fast — which is exactly why **Context Management & Reliability** is its own exam domain.

---

# Tool Use

By default, a model can only generate text. **Tool use** (sometimes called *function calling*) is what lets it go further — the model can say "I'd like to call this function, with these arguments," a system executes that function, and the result gets fed back in.

A simple example: we ask "what's the weather in Chennai right now?" The model doesn't know — it has no live data. But if it has access to a `get_weather(city)` tool, it can call that tool, receive the actual result, and answer accurately instead of guessing.

Tool use is what turns a model from "a very good text generator" into something that can actually *do* things.

---

# Agents

An **agent**, in this context, isn't a person or a mysterious black box — it's a loop:

1. The model looks at the current situation (our request, any tool results so far).
2. It decides what to do next — answer, or call a tool.
3. If it calls a tool, the result comes back into the conversation.
4. Repeat, until the model decides the task is done.

That loop — decide, act, observe, repeat — is the **agentic loop**, and it's the foundation of **Domain 1: Agentic Architecture & Orchestration**, the single biggest chunk of the CCAR-F exam. We'll go much deeper into it in the [Domain 1 post](/blog/ccar-f-domain-1-agentic-architecture-orchestration/).

---

# MCP — Model Context Protocol

**MCP (Model Context Protocol)** is an open standard for connecting models to external tools and data sources — think of it as a common plug shape, so any MCP-compatible tool can talk to any MCP-compatible model without custom, one-off integration code for each pair.

Before MCP, connecting a model to, say, a company's internal ticketing system meant writing bespoke integration code for that specific model and that specific system. MCP standardizes that connection: an MCP *server* exposes tools/data, and an MCP *client* (built into the model-facing application) can discover and use them.

This is what **Domain 2: Tool Design & MCP Integration** is all about — designing good tools and wiring them up cleanly.

---

# Structured Output

Left to its own devices, a model replies in free-flowing prose. That's great for a chat, but painful for a system that needs to parse the response programmatically.

**Structured output** means constraining the model's response to a specific shape — usually JSON matching a schema we define — so downstream code can rely on it. Instead of parsing "the weather is sunny with a high of 31°C" out of a sentence, we get back `{"condition": "sunny", "high_celsius": 31}` directly.

This becomes important the moment an agent's output feeds into another system rather than a human reader — which, in most production architectures, is most of the time.

---

# Claude Code

**Claude Code** is Anthropic's agentic coding tool — it can read a codebase, make edits, run commands, and iterate, all through the same agentic loop described above, applied specifically to software engineering tasks.

We don't need to be Claude Code experts for CCAR-F, but we do need to understand how it's configured and used in real workflows — that's **Domain 3: Claude Code Configuration & Workflows**.

---

# Where We Go From Here

That's the vocabulary we needed: **LLM, context window, tool use, agent, MCP, structured output, Claude Code.**

None of these ideas are complicated in isolation — they just tend to get thrown around together, which makes them feel more intimidating than they are.

From here, both paths converge on the same place:

> **Continue the CCAR-F preparation → [Domain 1: Agentic Architecture & Orchestration](/blog/ccar-f-domain-1-agentic-architecture-orchestration/)**
