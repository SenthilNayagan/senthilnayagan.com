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

If terms like **LLM, context window, tool use, agent, MCP** or **Claude Projects** already feel familiar, there's no reason to be here — [Domain 1: Agentic Architecture & Orchestration](/blog/ccar-f-domain-1-agentic-architecture-orchestration/) is where the actual CCAR-F preparation starts.

But if a few of those words made us pause, even briefly, this post is for us.

The goal here isn't a three-month history of artificial intelligence. It's just enough of a mental model — in plain English, with diagrams where a picture beats a paragraph — that the CCAR-F domains stop reading like a wall of unfamiliar terminology and start reading like things we can reason about.

We've grouped the terms into four sets:

1. **The basics** — how Claude actually works under the hood.
2. **How Claude gets things done** — tools, agents, and the protocol connecting them.
3. **Claude's workspace features** — Code, Cowork, Projects, Artifacts, Skills, and more.
4. **Working with Claude well** — the habits and framing that make it actually useful.

---

# The Basics: How Claude Actually Works

## Claude, in One Paragraph

Claude is the family of AI models built by Anthropic. We talk to it, it talks back, and somewhere underneath that conversation is a **large language model** doing the actual work. That's really the whole picture we need for now — everything else in this section is about unpacking what that sentence means.

## LLMs — Large Language Models

An LLM is, at its core, a very large statistical model trained to predict **the next word** (technically, the next *token* — more on that below) given everything that came before it.

That's it. That's the trick.

Trained on enormous amounts of text, the model learns patterns — grammar, facts, reasoning steps, code, tone — well enough that "predict the next word, over and over again" starts to look a lot like writing, explaining, and reasoning.

A **token** is just a chunk of text — sometimes a whole word, sometimes a piece of one. When we hear about "context window size in tokens," this is what's being counted.

## Context Window

The **context window** is the model's **working memory** — the maximum amount of text it can hold and actively "see" at once while generating a response.

Everything inside it gets read together, every time:

1. **System instructions** — how the model should behave.
2. **Our prompt** — the actual question or task.
3. **Any files or data** we've handed it.
4. **The chat history so far** — every earlier message in this conversation.

{% include "postImage.html" src: "./images/context-window.png", alt: "The context window as the model's working memory", description: "<b>Figure 1: </b>The context window — what it holds, and what falls off once it's full." %}

If everything we've given the model fits inside the window, it remembers all of it perfectly. If it doesn't fit, the **oldest** parts get cut to make room for new text — and once something falls out, it's gone. We can't ask about message 5 if messages 6 through 80 have since pushed it out of the window.

**The trade-off:** a bigger window is better for long tasks — reading whole documents, hours-long conversations — but it's also slower and more expensive to process, since the model re-reads the entire window for every single response.

A rough sense of scale, in tokens:

| Model | Approx. window | Roughly equivalent to |
|---|---|---:|
| An older, small model | ~4,000 tokens | A short story |
| A mid-sized model | ~32,000 tokens | A 50-page novella |
| Claude (larger models) | ~200,000 tokens | The entire *Lord of the Rings* trilogy |

**The rule worth remembering:** if we paste a 500-page document into a model whose window only holds 300 pages' worth of tokens, it will have already forgotten the first 200 pages by the time it answers a question about the ending.

## Constitutional AI

**Constitutional AI** is Anthropic's technique for training Claude to be helpful and harmless — instead of a human reviewing every single response for safety, Claude is given a written set of principles (its "constitution") and taught to check its own answers against them.

{% include "postImage.html" src: "./images/constitutional-ai.png", alt: "Constitutional AI's self-critique loop", description: "<b>Figure 2: </b>Claude checks its own draft against a written set of principles before we ever see it." %}

This flips the usual approach. Instead of humans manually labeling thousands of "bad" responses (slow, exhausting, and inconsistent between reviewers), Claude does most of that filtering itself, using its own rulebook. Humans mainly step in at the end, choosing between outputs that are already reasonably safe — rather than having to catch every problem from scratch.

## Extended Thinking

**Extended Thinking** lets Claude take extra time and computation to reason through a problem step by step before answering, instead of responding immediately.

With it on, Claude effectively pauses to break the problem into parts, try different approaches, and check its own logic — then uses that groundwork to write a better final answer.

**Worth turning on for:** advanced math, debugging tricky code, multi-step technical problems where one early mistake ruins the whole result, or planning something with a lot of moving parts.

**Not worth it for:** quick factual questions, casual conversation, or anything where a fast, simple answer is genuinely all we need — extended thinking costs more time and tokens, so it should be reached for on purpose, not by default.

---

# How Claude Gets Things Done

## Tool Use

By default, a model can only generate text. **Tool use** (sometimes called *function calling*) is what lets it go further — Claude can say "I'd like to call this function, with these arguments," a system executes that function, and the result gets fed back in.

{% include "postImage.html" src: "./images/tool-use.png", alt: "The tool use flow", description: "<b>Figure 3: </b>Without tools, Claude can only guess. With a real tool to call, it gets a real answer." %}

A simple example: we ask "what's the weather in Chennai right now?" The model has no live data — it can't know this on its own. But with access to a `get_weather(city)` tool, it can call that tool, receive the real result, and answer accurately instead of guessing.

Tool use is what turns a model from "a very good text generator" into something that can actually *do* things.

## Agents

An **agent**, in this context, isn't a person or a mysterious black box — it's a loop:

{% include "postImage.html" src: "./images/agents-the-agentic-loop.png", alt: "The agentic loop: observe, decide, act, repeat", description: "<b>Figure 4: </b>Decide isn't always followed by Act — the model can also decide it's finished and skip straight to a final answer." %}

1. The model looks at the current situation (our request, any tool results so far).
2. It decides what to do next — answer, or call a tool.
3. If it calls a tool, the result comes back in.
4. Repeat, until the model decides the task is done.

That loop — observe, decide, act, repeat — is the **agentic loop**, and it's the foundation of **Domain 1: Agentic Architecture & Orchestration**, the single biggest chunk of the CCAR-F exam. We'll go much deeper into it in the [Domain 1 post](/blog/ccar-f-domain-1-agentic-architecture-orchestration/).

## MCP — Model Context Protocol

**MCP (Model Context Protocol)** is an open standard for connecting models to external tools and data — a common plug shape, so any MCP-compatible tool can talk to any MCP-compatible model without custom, one-off integration code for each pair.

{% include "postImage.html" src: "./images/mcp.png", alt: "MCP client-server architecture", description: "<b>Figure 5: </b>Same MCP server, any MCP-compatible model — no integration code to rewrite per model." %}

Before MCP, connecting a model to, say, a company's internal ticketing system meant writing bespoke integration code for that specific model and that specific system. MCP standardizes the connection: an MCP **server** exposes tools and data, and an MCP **client** (built into the model-facing application) discovers and uses them.

**So how is this different from just using an API?** Say 3 AI apps — a chatbot, a coding assistant, an email agent — all need to check the weather and manage a calendar. Without a shared protocol, each app needs its own integration for each service: its own auth, its own response parsing, its own hardcoded "call this when the user asks about weather" logic. That's 3 apps × 2 services = 6 integrations to maintain — and it scales badly: 10 apps and 20 tools is 200 integrations. With MCP, someone builds one server per service; any MCP-compatible app plugs in with no custom code. Same scenario becomes 3 + 2 = 5. *N × M* becomes *N + M*, and fixing the weather server once fixes it for every app using it.

The other shift: with a plain API, a developer decides in advance exactly which endpoint gets called and hardcodes that logic. With MCP, the model reads a tool's description at runtime and decides whether and how to use it — **discovery** instead of a pre-wired call.

**Should MCP replace APIs, then? No.** An MCP server is usually a thin wrapper *around* an existing API — someone still has to build and run the actual service underneath. Most API traffic isn't AI-driven at all (a mobile app calling a backend, one microservice talking to another), so wrapping it in a discovery layer adds pure overhead for no benefit there. MCP also has real costs a direct API call doesn't: extra latency from the discovery round-trip, less control over each call, and a live security concern — **prompt injection**, where malicious instructions hidden in a tool's description or output trick the model, something a hardcoded API call simply isn't exposed to.

The mental model: the **API is the underlying capability**; **MCP is the model-facing interface**, added specifically where a model needs to discover and call that capability dynamically. For a direct, known integration between two pieces of software we control, a plain API call is usually still simpler and more predictable.

This is what **Domain 2: Tool Design & MCP Integration** is about — designing good tools and wiring them up cleanly.

## Structured Output

Left to its own devices, a model replies in free-flowing prose. Great for a chat, painful for a system that needs to parse the response programmatically.

**Structured output** constrains the model's response to a specific shape — usually JSON matching a schema we define — so downstream code can rely on it. Instead of parsing "the weather is sunny with a high of 31°C" out of a sentence, we get back `{"condition": "sunny", "high_celsius": 31}` directly.

This matters the moment an agent's output feeds into another system rather than a human reader — which, in most production architectures, is most of the time.

---

# Claude's Workspace Features

## Claude Code

**Claude Code** is Anthropic's agentic coding tool — it can read a codebase, make edits, run commands, and iterate, all through the same agentic loop described above, applied specifically to software engineering tasks.

We don't need to be Claude Code experts for CCAR-F, but we do need to understand how it's configured and used in real workflows — that's **Domain 3: Claude Code Configuration & Workflows**.

## Claude Cowork

**Claude Cowork** turns Claude from a conversational chatbot into an active agent that can work directly with the files and folders on our computer — no more copy-pasting text back and forth.

{% include "postImage.html" src: "./images/claude-cowork.png", alt: "Claude Cowork working directly with local files and folders", description: "<b>Figure 6: </b>Claude Cowork reads, edits, and creates files in a folder we've authorized, while we step away." %}

We authorize Claude to access a specific folder, describe the outcome we want, and step away while it reads, edits, and creates files there. A few things it's genuinely useful for:

- **Sorting a messy Downloads folder** by date or file type.
- **Turning a folder of receipt screenshots** into a spreadsheet with formulas.
- **Drafting a report** from a folder of scattered notes.

Currently a research preview on the Claude desktop app (macOS and Windows) for Pro, Max, Team, and Enterprise plans.

## Projects in Claude

**Projects** are self-contained workspaces that give Claude specialized context for a specific piece of work, so we're not re-explaining the same background in every new chat.

{% include "postImage.html" src: "./images/projects-in-claude.png", alt: "Projects in Claude — a self-contained workspace with its own knowledge base and instructions", description: "<b>Figure 7: </b>A project carries its own knowledge base and standing instructions, shared across every chat inside it." %}

A project carries:

- **A knowledge base** — documents, code, or files Claude treats as background for every chat inside that project.
- **Project instructions** — standing rules, like "use a formal tone" or "answer as a product manager would."

There are two distinct kinds worth telling apart:

| | Chat Projects | Cowork Projects |
|---|---|---|
| Where | claude.ai/projects (cloud) | Claude Desktop (local) |
| Works with | Documents, chat history | Local folders on our computer |
| Extra features | — | Scheduled tasks, persistent memory |

We can even import an existing Chat Project into a Cowork Project.

## Artifacts

**Artifacts** give substantial content — code, a document, a webpage, an interactive tool — its own dedicated window, separate from the back-and-forth of the chat itself. Instead of scrolling back through a long conversation to find a code snippet, it's sitting right there in its own panel to view, edit, or download.

{% include "postImage.html" src: "./images/artifacts.png", alt: "An artifact shown in its own panel, separate from the chat", description: "<b>Figure 8: </b>Substantial content gets its own panel instead of getting buried in the chat history." %}

Claude creates one automatically for anything substantial (roughly 15+ lines). If it doesn't and we wanted one, asking directly — "show me this as an artifact" — works fine.

## Skills

**Skills** are folders of instructions, scripts, and resources Claude loads on demand for a specific kind of task — expertise packages that teach it how to do something in a repeatable way.

{% include "postImage.html" src: "./images/skills.png", alt: "Skills as folders of instructions Claude loads on demand", description: "<b>Figure 9: </b>A skill is expertise packaged as a folder — loaded on demand for the task at hand." %}

- **Anthropic Skills** — built-in, covering things like Excel, Word, PowerPoint, and PDF creation. Claude invokes these automatically; we don't need to do anything.
- **Custom Skills** — ones we (or our org) build for a specific workflow, like applying brand guidelines to a deck or running a particular data analysis process the same way every time.

Available on Pro, Max, Team, and Enterprise plans, under **Settings → Capabilities**, once code execution is enabled.

## Enterprise Search

**Enterprise Search** is a pre-configured project that searches across a company's connected tools in one place — Microsoft 365, Slack, Google Workspace, wikis, CRM — instead of us hunting through each app individually.

We ask a question, Claude searches every connected source in parallel, and synthesizes one answer with citations back to where it found each piece.

## Research

Claude's **Research** mode is built for the questions that need more than one search — it plans out a research approach, searches the web (and any connected sources) across multiple steps, and comes back with a structured, cited report rather than a single quick reply.

Worth reaching for on genuinely open-ended questions — market analysis, competitive landscapes, "what do we currently know about X" — not on questions with one clear factual answer.

## Claude Design

**Claude Design** is a collaborative design and prototyping tool — it lets us create interactive designs, prototypes, and presentations just by describing them in conversation, combining a frontier model with the functionality of a traditional design tool.

---

# Working With Claude Well

## Writing Effective Prompts

Every interaction starts with a prompt, so it's worth spending a moment on what makes one good. The best mental model: talk to Claude the way we'd talk to a capable coworker — naturally, concisely, conversationally.

Three things worth including:

1. **Setting the stage** — our role, and any context Claude should know about the work.
2. **Defining the task** — the specific action we want (write, analyze, build, something else).
3. **Specifying rules** — tone, format, or examples of what "good" looks like.

**Example**, using all three:

> "I'm the marketing lead at an indie streaming startup, and we're preparing an investor pitch deck for Series A investors. Can you research the current state of the independent film streaming market and identify key trends, competitor positioning, and growth opportunities? Use current web research with citations and structure it as a professional report of up to 5 pages, with an executive summary, market analysis, competitive landscape, and growth opportunities."

Stage: the pitch deck and the startup context. Task: research the market, with specific angles (trends, competitors, opportunities). Rules: cited web research, a 5-page professional report with named sections.

## Learning Mode

**Learning Mode** changes how Claude responds — instead of handing us the answer directly, it acts more like a tutor, using questions and prompts to guide us toward finding the answer ourselves.

It started as part of Claude for Education, then rolled out to all users in August 2025. Under the hood, it's not a different model — it's the same Claude, working from a system prompt that nudges it toward a guided, teaching style instead of a direct one.

## You Bring the Expertise

Claude knows *how* to do things. It doesn't automatically know *what* matters to us, specifically.

Without our own judgment in the loop, Claude is a brilliant intern with no context — it can produce flawless-looking text with no way to know whether it's actually accurate, useful, or right for our situation. That judgment call is still ours to make.

## Continued and Frequent Communication

The first response to a genuinely complex ask is usually generic. That's not a prompt-wording problem to solve with one longer message — it's fixed by **iterating**: giving feedback, asking follow-ups, correcting course as we go.

Because Claude's context window holds the whole conversation, each correction compounds — by the tenth exchange in a session, it's working from a much sharper picture of what we actually want than it had after the first message. A single one-shot prompt, however carefully worded, can't reach that same depth.

## The AI Fluency Framework

**AI Fluency** is the skill of using AI effectively, efficiently, and ethically — not just knowing how to type a question into a chat box, but knowing *when* to use AI, *how* to guide it, and *how* to judge what it hands back.

{% include "postImage.html" src: "./images/the-ai-fluency-framework.png", alt: "The four legs of AI fluency: Delegation, Description, Discernment, Diligence", description: "<b>Figure 10: </b>Four legs of the same table — weak in any one of them, and the whole thing wobbles." %}

| Competency | In plain terms | The question it answers |
|---|---|---|
| **Delegation** | Deciding who does the task — us, a plain tool, or AI. | *"Should I do this myself, or hand it to Claude?"* |
| **Description** | Writing clear, specific instructions. | *"How do I ask for exactly what I need?"* |
| **Discernment** | Checking the output for mistakes, bias, or hallucinations before trusting it. | *"Is this answer actually correct and usable?"* |
| **Diligence** | Using AI responsibly — credit, privacy, wider impact. | *"Am I using this fairly and safely?"* |

---

# Where We Go From Here

That's the full vocabulary set: from the basics (LLM, context window, Constitutional AI, extended thinking) through how Claude gets things done (tool use, agents, MCP, structured output), Claude's workspace features (Code, Cowork, Projects, Artifacts, Skills, Enterprise Search, Research, Design), and the habits that make working with it actually effective.

None of these ideas are complicated in isolation — they just tend to get thrown around together, which makes them feel more intimidating than they are.

From here, both paths converge on the same place:

> **Continue the CCAR-F preparation → [Domain 1: Agentic Architecture & Orchestration](/blog/ccar-f-domain-1-agentic-architecture-orchestration/)**
