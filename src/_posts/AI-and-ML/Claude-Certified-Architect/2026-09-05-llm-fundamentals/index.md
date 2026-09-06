---
title: "LLM Fundamentals"
description: >-
  A practical introduction to the LLM concepts I need to understand as part of my Claude Certified
  Architect – Foundations (CCAR-F) preparation. We'll build the mental models behind tokens,
  context, context windows, model input and output, and the capabilities and limitations of large
  language models, using simple explanations, examples, and hands-on exploration.
keywords:
  - llm-fundamentals
  - large-language-models
  - llms
  - context-window
  - tokens
  - claude
  - ccar-f
  - claude-certified-architect
tags:
  - llm-fundamentals
  - llms
  - claude
  - context
  - context-window
  - ccar-f
  - claude-certified-architect
# coverImage: ./images/cover-image.png — add once the AI-generated cover art is ready, then create
# the images/ folder next to this file (matches the series' other posts' convention).
# imageCredits: AI-generated image.
featured: false
draft: true
learningPath:
  step: 1
  total: 15
  previousTitle: ''
  previousUrl: ''
  nextTitle: 'Claude & API Fundamentals'
  nextUrl: ''
---

{% include "toc.md" %}

{% include "components/learning-path-nav.liquid" position: "top" %}

# Before We Talk About Agents...

There are a few words that seem to appear everywhere once we enter the world of modern AI:

**LLM. Generative AI. Tokens. Context window. Memory. Tools. Agents. MCP.**

At first, they can start sounding like members of a very exclusive club that forgot to explain the membership rules.

The good news: we don't need to understand all of it at once. Before agents, orchestration, or architecture, we need to understand the thing sitting underneath all of it — **the Large Language Model itself.**

We'll start with the big picture and progressively zoom in:

<div class="diagram">
  <svg viewBox="0 0 430 560" role="img" aria-labelledby="llm-roadmap-title llm-roadmap-desc">
    <title id="llm-roadmap-title">The roadmap for this article</title>
    <desc id="llm-roadmap-desc">A vertical chain: Generative AI, Large Language Models, Tokens, Context Window, Model Limitations, Probabilistic Behavior, Deterministic Application Logic, Architecture. Context Window also branches sideways to Context vs Memory.</desc>
    <defs>
      <marker id="rm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="10" y="15" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="37" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Generative AI</text>
    <line x1="130" y1="51" x2="130" y2="83" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rm-arrow)"></line>
    <rect x="10" y="85" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="107" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Large Language Models</text>
    <line x1="130" y1="121" x2="130" y2="153" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rm-arrow)"></line>
    <rect x="10" y="155" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="177" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Tokens</text>
    <line x1="130" y1="191" x2="130" y2="223" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rm-arrow)"></line>
    <rect x="10" y="225" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="247" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Context Window</text>
    <line x1="250" y1="242" x2="270" y2="242" stroke="var(--color-text-secondary)" stroke-width="1.5" marker-end="url(#rm-arrow)"></line>
    <rect x="270" y="225" width="150" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="345" y="247" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">Context vs Memory</text>
    <line x1="130" y1="261" x2="130" y2="293" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rm-arrow)"></line>
    <rect x="10" y="295" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="317" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Model Limitations</text>
    <line x1="130" y1="331" x2="130" y2="363" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rm-arrow)"></line>
    <rect x="10" y="365" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="387" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Probabilistic Behavior</text>
    <line x1="130" y1="401" x2="130" y2="433" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rm-arrow)"></line>
    <rect x="10" y="435" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="457" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Deterministic Application Logic</text>
    <line x1="130" y1="471" x2="130" y2="503" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rm-arrow)"></line>
    <rect x="10" y="505" width="240" height="34" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="130" y="527" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Architecture</text>
  </svg>
  <figcaption>Figure 1: The roadmap for this article — from generative AI down to architecture, with context and memory as a side branch.</figcaption>
</div>

Grab a coffee. This one's worth reading slowly — everything later in this cert leans on it. By the end of this article, we should have a mental model that we can carry into everything that follows.

---

# 1. First, What Exactly Is Generative AI?

Let's start with the broadest concept.

**Generative AI** refers to AI systems (or type of AI) that can generate **new content** in response to an input. 

That content might be:

- text
- code
- images
- audio
- video
- structured data

We're focused on text-generating models like Claude.

## Traditional Software vs. Generative AI

Consider a calculator.

We give it:

```text
2 + 2
```

It gives us:

```text
4
```

If we ask it again:

```text
2 + 2
```

we expect:

```text
4
```

There isn't much mystery involved.

We can think of traditional software roughly like this:

<div class="diagram">
  <svg viewBox="0 0 360 250" role="img" aria-labelledby="trad-sw-title trad-sw-desc">
    <title id="trad-sw-title">Traditional software: input through explicit rules to output</title>
    <desc id="trad-sw-desc">Input points down to explicit rules, which points down to output.</desc>
    <defs>
      <marker id="ts-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="80" y="20" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="48" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Input</text>
    <line x1="180" y1="66" x2="180" y2="99" stroke="var(--color-text)" stroke-width="2" marker-end="url(#ts-arrow)"></line>
    <rect x="80" y="102" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="130" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Explicit rules</text>
    <line x1="180" y1="148" x2="180" y2="181" stroke="var(--color-text)" stroke-width="2" marker-end="url(#ts-arrow)"></line>
    <rect x="80" y="184" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="212" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Output</text>
  </svg>
  <figcaption>Figure 2: Traditional software — input flows through explicit, developer-written rules to produce output.</figcaption>
</div>

The developer defines the rules.

Now compare that with a generative model.

We might ask:

> "Explain why the sky is blue."

The system doesn't have a simple rule saying:

```text
IF user asks about sky
THEN return sentence #47291
```

Instead, the LLM generates a response based on patterns it learned during training.

A simplified picture is:

<div class="diagram">
  <svg viewBox="0 0 360 250" role="img" aria-labelledby="genmodel-title genmodel-desc">
    <title id="genmodel-title">A generative model: prompt through the LLM to generated text</title>
    <desc id="genmodel-desc">A prompt points down into the LLM, which points down to generated text.</desc>
    <defs>
      <marker id="gm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="80" y="20" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="48" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Prompt</text>
    <line x1="180" y1="66" x2="180" y2="99" stroke="var(--color-text)" stroke-width="2" marker-end="url(#gm-arrow)"></line>
    <rect x="80" y="102" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="2"></rect>
    <text x="180" y="130" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">LLM</text>
    <line x1="180" y1="148" x2="180" y2="181" stroke="var(--color-text)" stroke-width="2" marker-end="url(#gm-arrow)"></line>
    <rect x="80" y="184" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="212" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Generated text</text>
  </svg>
  <figcaption>Figure 3: A generative model — the prompt goes in, and a response is generated from learned patterns, not a hard-coded rule.</figcaption>
</div>

This difference is incredibly important:

- A calculator is designed around **deterministic computation**.
- An LLM is designed around **probabilistic generation**.

Think of it this way:

- **Deterministic** = Following a cake recipe exactly. We will always get the same cake.
- **Probabilistic** = Describing a delicious cake to a master chef who has baked thousands of cakes. The chef knows the general principles (flour, sugar, heat), but he/she might add a pinch more vanilla or bake it a minute longer based on instinct. We get a slightly different cake each time, but it's always recognizably a cake.

| Traditional software | Generative AI |
|---|---|
| `2 + 2` always returns `4` | Ask twice, get slightly different wording both times |
| Behavior is explicitly coded | Behavior emerges from learned patterns |
| A bug is reproducible | A "wrong answer" might not reproduce the same way twice |
| We can trace exactly *why* | We can only reason about *likely* why |

{% note %}
An LLM is less like a calculator and more like a very well-read colleague answering off the top of their head — usually excellent, occasionally confidently wrong, never twice in *exactly* the same words.
{% endnote %}

We'll come back to that distinction later because it becomes one of the most important architectural ideas in this entire certification.

---

# 2. AI → Machine Learning → Deep Learning → Generative AI → LLM

These terms get used interchangeably in casual conversation, but they aren't the same thing. A simple nesting picture:

<div class="diagram">
  <svg viewBox="0 0 460 280" role="img" aria-labelledby="taxonomy-title taxonomy-desc">
    <title id="taxonomy-title">Large Language Models sit inside Generative AI, inside Deep Learning, inside Machine Learning, inside AI</title>
    <desc id="taxonomy-desc">Five nested boxes, each one contained inside the last: Artificial Intelligence, Machine Learning, Deep Learning, Generative AI, and Large Language Models at the center.</desc>
    <rect x="20" y="20" width="420" height="240" rx="10" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="35" y="42" fill="var(--color-text-secondary)" font-size="12" font-weight="700">Artificial Intelligence</text>
    <rect x="45" y="55" width="370" height="190" rx="9" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="60" y="77" fill="var(--color-text-secondary)" font-size="12" font-weight="700">Machine Learning</text>
    <rect x="70" y="90" width="320" height="140" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="85" y="112" fill="var(--color-text-secondary)" font-size="12" font-weight="700">Deep Learning</text>
    <rect x="95" y="125" width="270" height="90" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="110" y="147" fill="var(--color-text)" font-size="12" font-weight="700">Generative AI</text>
    <rect x="120" y="160" width="220" height="40" rx="6" fill="var(--color-bg)" stroke="var(--color-accent)" stroke-width="2"></rect>
    <text x="230" y="185" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Large Language Models</text>
  </svg>
  <figcaption>Figure 4: Large Language Models are a subset of Generative AI, which sits inside Deep Learning, inside Machine Learning, inside AI.</figcaption>
</div>

- **AI** — the broad field of building systems that do "intelligent" tasks
- **Machine Learning** — systems that learn patterns from data instead of having every rule hand-coded
- **Deep Learning** — ML using neural networks with many layers
- **Generative AI** — systems that generate *new content*, rather than just classify or select
- **Large Language Models** — models trained specifically to process and generate language

Claude is a large language model, accessed through Anthropic's products and APIs. We don't need this taxonomy memorized word-for-word — we need it so that when someone says "well, technically that's deep learning, not an LLM," we're not lost.

---

# 3. So... What Is an LLM?

> **An LLM is a learned system that generates language based on the patterns it has learned and the information available to it at the time of generation.**

Let's make that concrete.

Suppose we ask:

> "Complete this sentence: The sun rises in the..."

We'd expect:

> "...east."

Why?

Because the LLM has learned strong patterns connecting those words and concepts.

Now give it:

> "The customer requested a refund because..."

The LLM can generate a reasonable continuation based on language patterns and the context we provide.

Suppose we ask:

> "Explain why our application is returning a 500 error."

<div class="diagram">
  <svg viewBox="0 0 560 180" role="img" aria-labelledby="roundtrip-title roundtrip-desc">
    <title id="roundtrip-title">A request travels from us to the LLM, and the response travels back</title>
    <desc id="roundtrip-desc">Three boxes: We, Our Application, and LLM. A request flows left to right along the top, from We through Our Application to the LLM. A response flows right to left along the bottom, from the LLM back through Our Application to We.</desc>
    <defs>
      <marker id="rt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <text x="290" y="55" text-anchor="middle" fill="var(--color-text)" font-size="11" font-weight="700">request</text>
    <line x1="140" y1="88" x2="220" y2="88" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rt-arrow)"></line>
    <line x1="360" y1="88" x2="440" y2="88" stroke="var(--color-text)" stroke-width="2" marker-end="url(#rt-arrow)"></line>
    <line x1="440" y1="112" x2="360" y2="112" stroke="var(--color-text-secondary)" stroke-width="2" marker-end="url(#rt-arrow)"></line>
    <line x1="220" y1="112" x2="140" y2="112" stroke="var(--color-text-secondary)" stroke-width="2" marker-end="url(#rt-arrow)"></line>
    <text x="290" y="145" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">response</text>
    <rect x="20" y="70" width="120" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="80" y="105" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">We</text>
    <rect x="220" y="70" width="140" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="290" y="105" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Our Application</text>
    <rect x="440" y="70" width="100" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="2"></rect>
    <text x="490" y="105" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">LLM</text>
  </svg>
  <figcaption>Figure 5: A request travels from us through our application to the LLM; the response travels the same path back.</figcaption>
</div>

Here's the catch: **LLM only has access to what's in that interaction.** If we send just that sentence, LLM does *not* magically know our logs, our database, or our deployment history. It doesn't automatically know:

- our database state
- today's inventory
- our internal business rules
- what happened in a previous conversation
- what our application considers a valid transaction

If instead we send:

```text
"Here is the relevant log:
ERROR: database connection timeout

Explain why our application is returning a 500 error."
```

*Now* LLM has something to reason with. Later, if we give LLM a *tool* that can fetch logs itself, the architecture changes again (much more on that in a later stage).

> **The LLM can only work with the information available to it in the current interaction, plus whatever capabilities the surrounding system provides.**

## The Surrounding System

The surrounding system is everything outside the LLM that helps it be useful—the context we feed it, the memory we give it, the tools we let it use, and the guardrails we place around it.

<div class="diagram">
  <svg viewBox="0 0 560 380" role="img" aria-labelledby="surround-title surround-desc">
    <title id="surround-title">The LLM sits inside a surrounding system of context, memory, and tools</title>
    <desc id="surround-desc">An outer frame labeled Surrounding System contains three boxes side by side — Context Window, Memory, and Tools/APIs — which feed down into an LLM box, which feeds down into a Response/Action box.</desc>
    <defs>
      <marker id="ss-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="20" y="20" width="520" height="340" rx="10" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="280" y="45" text-anchor="middle" fill="var(--color-text-secondary)" font-size="12" font-weight="700">SURROUNDING SYSTEM</text>
    <rect x="40" y="65" width="150" height="75" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="90" text-anchor="middle" fill="var(--color-text)" font-size="11" font-weight="700">Context Window</text>
    <text x="115" y="106" text-anchor="middle" fill="var(--color-text-secondary)" font-size="9">(prompt + retrieved data)</text>
    <rect x="205" y="65" width="150" height="75" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="280" y="90" text-anchor="middle" fill="var(--color-text)" font-size="11" font-weight="700">Memory</text>
    <text x="280" y="106" text-anchor="middle" fill="var(--color-text-secondary)" font-size="9">(short / long-term)</text>
    <rect x="370" y="65" width="150" height="75" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="445" y="90" text-anchor="middle" fill="var(--color-text)" font-size="11" font-weight="700">Tools / APIs</text>
    <text x="445" y="106" text-anchor="middle" fill="var(--color-text-secondary)" font-size="9">(search, DB, calculator...)</text>
    <line x1="280" y1="140" x2="280" y2="170" stroke="var(--color-text)" stroke-width="2" marker-end="url(#ss-arrow)"></line>
    <rect x="140" y="173" width="280" height="70" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="2"></rect>
    <text x="280" y="200" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">LLM</text>
    <text x="280" y="217" text-anchor="middle" fill="var(--color-text-secondary)" font-size="9">generates based on training patterns</text>
    <text x="280" y="230" text-anchor="middle" fill="var(--color-text-secondary)" font-size="9">+ whatever the surrounding system provides</text>
    <line x1="280" y1="243" x2="280" y2="268" stroke="var(--color-text)" stroke-width="2" marker-end="url(#ss-arrow)"></line>
    <rect x="140" y="271" width="280" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="280" y="301" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Response / Action</text>
  </svg>
  <figcaption>Figure 6: The LLM is only one part of the system — context, memory, and tools surround it and shape what it can do.</figcaption>
</div>

### What the LLM alone can't do:

- Know our database state
- Know today's inventory
- Know our internal business rules
- Remember previous conversations (unless we give it memory)
- Take actions in the real world (unless we give it tools)

### What the surrounding system can provide:

- A retrieval system that fetches relevant documents or logs
- A memory store that remembers past conversations
- Tools that query databases, call APIs, or take actions
- Guardrails that enforce safety and business rules
- Structured prompts that guide the LLM effectively

This single sentence is the seed of everything we're about to cover: tokens, context, memory, and eventually tools and agents.

---

# 4. Tokens — The Actual Unit of "Reading" and "Writing"

We think in words. LLMs doesn't. It works with **tokens** — chunks of text, often smaller than a full word.

A token might be:

- part of a word
- a whole word
- punctuation
- whitespace-related text
- or another piece of the input representation

<div class="diagram">
  <svg viewBox="0 0 560 170" role="img" aria-labelledby="tok-example-title tok-example-desc">
    <title id="tok-example-title">Three words split into tokens</title>
    <desc id="tok-example-desc">"unbelievable" splits into un, believ, able — 3 tokens. "cat" stays whole — 1 token. "ChatGPT" splits into Chat, G, PT — 3 tokens, an unusual word.</desc>
    <defs>
      <marker id="tok-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <text x="20" y="36" fill="var(--color-text)" font-size="13" font-weight="700">unbelievable</text>
    <line x1="150" y1="30" x2="178" y2="30" stroke="var(--color-text)" stroke-width="2" marker-end="url(#tok-arrow)"></line>
    <rect x="188" y="15" width="36" height="30" rx="4" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="206" y="35" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)" font-size="11">un</text>
    <rect x="230" y="15" width="66" height="30" rx="4" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="263" y="35" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)" font-size="11">believ</text>
    <rect x="302" y="15" width="50" height="30" rx="4" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="327" y="35" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)" font-size="11">able</text>
    <text x="364" y="35" fill="var(--color-text-secondary)" font-size="11">(3 tokens)</text>
    <text x="20" y="81" fill="var(--color-text)" font-size="13" font-weight="700">cat</text>
    <line x1="150" y1="75" x2="178" y2="75" stroke="var(--color-text)" stroke-width="2" marker-end="url(#tok-arrow)"></line>
    <rect x="188" y="60" width="50" height="30" rx="4" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="213" y="80" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)" font-size="11">cat</text>
    <text x="250" y="80" fill="var(--color-text-secondary)" font-size="11">(1 token)</text>
    <text x="20" y="126" fill="var(--color-text)" font-size="13" font-weight="700">ChatGPT</text>
    <line x1="150" y1="120" x2="178" y2="120" stroke="var(--color-text)" stroke-width="2" marker-end="url(#tok-arrow)"></line>
    <rect x="188" y="105" width="54" height="30" rx="4" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="215" y="125" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)" font-size="11">Chat</text>
    <rect x="248" y="105" width="30" height="30" rx="4" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="263" y="125" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)" font-size="11">G</text>
    <rect x="284" y="105" width="38" height="30" rx="4" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="303" y="125" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)" font-size="11">PT</text>
    <text x="334" y="125" fill="var(--color-text-secondary)" font-size="11">(3 tokens — an unusual word)</text>
  </svg>
  <figcaption>Figure 7: The same idea, three different word lengths — tokens don't map cleanly to words.</figcaption>
</div>

{% note %}
<strong>Rough rule of thumb:</strong> 1 token ≈ ¾ of an English word. 100 words ≈ 130–140 tokens. But don't rely on this as an exact conversion—the actual count varies by model (e.g., Claude vs. GPT-4 vs. Llama all tokenize differently), by language, and by word frequency. So this is just the rough estimate; we don't need to hand-tokenize anything.
{% endnote %}

The important thing to know is:

> **Text goes into the model as tokens, not as human-level words.**

## 4.1 Why Should We Care About Tokens?

Tokens have practical consequences.

<div class="diagram">
  <svg viewBox="0 0 460 200" role="img" aria-labelledby="tok-effects-title tok-effects-desc">
    <title id="tok-effects-title">Tokens affect context, cost, and latency</title>
    <desc id="tok-effects-desc">A box labeled Tokens branches down into three boxes: Context, Cost, and Latency.</desc>
    <rect x="160" y="15" width="140" height="40" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="230" y="41" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">TOKENS</text>
    <line x1="230" y1="55" x2="95" y2="105" stroke="var(--color-text)" stroke-width="1.5"></line>
    <line x1="230" y1="55" x2="230" y2="105" stroke="var(--color-text)" stroke-width="1.5"></line>
    <line x1="230" y1="55" x2="365" y2="105" stroke="var(--color-text)" stroke-width="1.5"></line>
    <rect x="30" y="108" width="130" height="44" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="95" y="135" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Context</text>
    <rect x="165" y="108" width="130" height="44" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="230" y="135" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Cost</text>
    <rect x="300" y="108" width="130" height="44" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="365" y="135" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Latency</text>
  </svg>
  <figcaption>Figure 8: Why tokens matter — they directly affect context, cost, and latency.</figcaption>
</div>

### 4.1.1 Tokens affect context

Every piece of information we put into a model consumes part of the available context.

- More input means more tokens.
- More conversation history means more tokens.
- Large documents mean more tokens.
- Tool results mean more tokens.
- And the model's response also uses tokens.

### 4.1.2 Tokens affect cost

For API-based applications, usage is generally measured in tokens. In other words, API usage is priced by tokens, not words or characters.

So this:

<div class="diagram">
  <svg viewBox="0 0 360 250" role="img" aria-labelledby="small-req-title small-req-desc">
    <title id="small-req-title">A small request keeps token usage low</title>
    <desc id="small-req-desc">Small request points down to fewer tokens, which points down to less input/output usage.</desc>
    <defs>
      <marker id="sr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="80" y="20" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="48" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Small request</text>
    <line x1="180" y1="66" x2="180" y2="99" stroke="var(--color-text)" stroke-width="2" marker-end="url(#sr-arrow)"></line>
    <rect x="80" y="102" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="130" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Fewer tokens</text>
    <line x1="180" y1="148" x2="180" y2="181" stroke="var(--color-text)" stroke-width="2" marker-end="url(#sr-arrow)"></line>
    <rect x="80" y="184" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="212" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Less input/output usage</text>
  </svg>
  <figcaption>Figure 9: A small request stays cheap and fast — fewer tokens all the way down.</figcaption>
</div>

can be very different from:

<div class="diagram">
  <svg viewBox="0 0 320 300" role="img" aria-labelledby="stack-tokens-title stack-tokens-desc">
    <title id="stack-tokens-title">Several inputs add up to lots of tokens</title>
    <desc id="stack-tokens-desc">Huge prompt, plus large documents, plus long history, plus large tool results, all add up to lots of tokens.</desc>
    <defs>
      <marker id="stk-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="40" y="15" width="240" height="32" rx="6" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="160" y="36" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Huge prompt</text>
    <text x="160" y="63" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">+</text>
    <rect x="40" y="69" width="240" height="32" rx="6" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="160" y="90" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Large documents</text>
    <text x="160" y="117" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">+</text>
    <rect x="40" y="123" width="240" height="32" rx="6" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="160" y="144" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Long history</text>
    <text x="160" y="171" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">+</text>
    <rect x="40" y="177" width="240" height="32" rx="6" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="160" y="198" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Large tool results</text>
    <line x1="160" y1="209" x2="160" y2="239" stroke="var(--color-text)" stroke-width="2" marker-end="url(#stk-arrow)"></line>
    <rect x="40" y="242" width="240" height="42" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="2"></rect>
    <text x="160" y="268" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Lots of tokens</text>
  </svg>
  <figcaption>Figure 10: Stack enough inputs together and the token count adds up fast.</figcaption>
</div>

### 4.1.3 Tokens affect latency

More information generally means more work for the system. In other words, larger inputs/outputs generally take longer.

So:

<div class="diagram">
  <svg viewBox="0 0 360 250" role="img" aria-labelledby="latency-title latency-desc">
    <title id="latency-title">More tokens can mean higher latency</title>
    <desc id="latency-desc">More tokens points down to more processing, which points down to potentially higher latency.</desc>
    <defs>
      <marker id="lt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="80" y="20" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="48" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">More tokens</text>
    <line x1="180" y1="66" x2="180" y2="99" stroke="var(--color-text)" stroke-width="2" marker-end="url(#lt-arrow)"></line>
    <rect x="80" y="102" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="130" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">More processing</text>
    <line x1="180" y1="148" x2="180" y2="181" stroke="var(--color-text)" stroke-width="2" marker-end="url(#lt-arrow)"></line>
    <rect x="80" y="184" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="208" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Potentially higher</text>
    <text x="180" y="223" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">latency</text>
  </svg>
  <figcaption>Figure 11: More tokens generally mean more processing — and potentially higher latency.</figcaption>
</div>

This isn't an absolute rule for every system configuration, but it is an important architectural consideration.

So we don't study tokens to manually count them.

We study tokens because they determine:

- **What fits** — context window limits
- **What we pay** — API pricing
- **How fast it runs** — latency

Tokens are the fundamental unit that ties all of these together.

We're not learning tokenization to memorize a definition. We're learning it because **the amount of information we send has real, practical consequences** — and that idea leads straight into the next topic, **Context Window**.

# 5. The Context Window — LLM's Working Desk

If there is one analogy we want to remember from this article, make it this:

> **The context window is LLM's working desk.**

The context window is **everything the LLM can "see" while generating its next response** — nothing more, nothing less. Every word we send, every instruction we give, every document we attach, and every bit of conversation history we include all sit on this desk. If it's not on the desk, the LLM cannot use it.

## The Desk Analogy

Let's imagine we're solving a complex problem at a desk. Spread out in front of us are:

```
- instructions
- notes
- reference documents
- previous discussion
- data
- relevant evidence
- calculations
```

Everything on the desk is immediately available. We can glance at any piece of information in a split second. That's our **working memory** — the information we can access without getting up, without opening a drawer, and without interrupting our flow.

Now let's imagine the desk has a physical limit. We can only fit so much on its surface. Every new document we add means something else has to move.

**What happens when the desk is full?**

If we bring in a new document, we have to push something off the edge. That information is **no longer available to us** while we're working. We've forgotten it, or at least we've lost immediate access to it.

The same is true for an LLM's context window. **When we exceed the limit, the system either:**

| What Happens | Explanation |
|--------------|-------------|
| **Drops older information** | The system truncates the oldest content to make room for new input |
| **Rejects the request entirely** | The API enforces a hard limit and returns an error |

Either way, **not everything can stay on the desk at once.**

This is why token limits matter. Let's remember: **1 token ≈ ¾ of an English word** — and every token takes up space on that desk. It's a rough guide, not a formula — this varies by language and how common the words are

## What Actually Fills the Context Window?

When we say "context," we don't just mean the user's latest question. In a real application, the context window contains a mix of many things:

```
System instructions
        +
Conversation history
        +
Current user request
        +
Relevant documents
        +
Retrieved information
        +
Tool definitions
        +
Tool results
        +
Other application-provided information
```

Here's a concrete example of what a full context might look like for a customer support application:

<div class="diagram">
  <svg viewBox="0 0 500 430" role="img" aria-labelledby="support-context-title support-context-desc">
    <title id="support-context-title">Everything in a real customer-support request's context</title>
    <desc id="support-context-desc">A box listing six items: system instructions, relevant conversation history, customer profile, order information, refund policy, and the current customer request. It points down to the LLM, which points down to the generated response.</desc>
    <defs>
      <marker id="sc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="20" y="20" width="460" height="240" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <line x1="20" y1="60" x2="480" y2="60" stroke="var(--color-border)" stroke-width="1"></line>
    <line x1="20" y1="100" x2="480" y2="100" stroke="var(--color-border)" stroke-width="1"></line>
    <line x1="20" y1="140" x2="480" y2="140" stroke="var(--color-border)" stroke-width="1"></line>
    <line x1="20" y1="180" x2="480" y2="180" stroke="var(--color-border)" stroke-width="1"></line>
    <line x1="20" y1="220" x2="480" y2="220" stroke="var(--color-border)" stroke-width="1"></line>
    <text x="35" y="36" fill="var(--color-text)" font-size="11" font-weight="700">System instructions</text>
    <text x="35" y="51" fill="var(--color-text-secondary)" font-size="9">"You are a helpful support agent..."</text>
    <text x="35" y="76" fill="var(--color-text)" font-size="11" font-weight="700">Relevant conversation history</text>
    <text x="35" y="91" fill="var(--color-text-secondary)" font-size="9">Previous 5 exchanges with the customer</text>
    <text x="35" y="116" fill="var(--color-text)" font-size="11" font-weight="700">Customer profile</text>
    <text x="35" y="131" fill="var(--color-text-secondary)" font-size="9">Name, account tier, region</text>
    <text x="35" y="156" fill="var(--color-text)" font-size="11" font-weight="700">Order information</text>
    <text x="35" y="171" fill="var(--color-text-secondary)" font-size="9">Order ID, date, items, total</text>
    <text x="35" y="196" fill="var(--color-text)" font-size="11" font-weight="700">Refund policy</text>
    <text x="35" y="211" fill="var(--color-text-secondary)" font-size="9">Relevant policy section</text>
    <text x="35" y="236" fill="var(--color-text)" font-size="11" font-weight="700">Current customer request</text>
    <text x="35" y="251" fill="var(--color-text-secondary)" font-size="9">"Where is my order?"</text>
    <line x1="250" y1="260" x2="250" y2="290" stroke="var(--color-text)" stroke-width="2" marker-end="url(#sc-arrow)"></line>
    <rect x="190" y="293" width="120" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="2"></rect>
    <text x="250" y="320" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">LLM</text>
    <line x1="250" y1="337" x2="250" y2="367" stroke="var(--color-text)" stroke-width="2" marker-end="url(#sc-arrow)"></line>
    <rect x="150" y="370" width="200" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="250" y="397" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Generated response</text>
  </svg>
  <figcaption>Figure 12: A real customer-support request — everything the LLM sees before it can respond.</figcaption>
</div>

The LLM can use all of this information to generate a relevant, accurate response.

**But here's the catch:** everything in that diagram consumes tokens. The system instructions, the history, the customer profile, the policy document — they all take up space on the desk. If we add too much, the oldest items start falling off.

## Context vs. Memory — They Are Not the Same Thing

This is probably one of the easiest concepts to confuse, so let's be clear about it from the start.

Let's go back to our desk analogy:

> **Desk = Context**

But where do all our other documents live when they're not on the desk?

In a filing cabinet.

> **Filing cabinet = Memory**

So our mental model looks like this:

<div class="diagram">
  <svg viewBox="0 0 460 250" role="img" aria-labelledby="ctx-mem-title ctx-mem-desc">
    <title id="ctx-mem-title">Context and memory lead to different places</title>
    <desc id="ctx-mem-desc">Application branches into Context, on the desk, which points down to the LLM, and Memory, stored elsewhere, which points down to a database or storage system.</desc>
    <rect x="160" y="15" width="140" height="40" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="230" y="41" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Application</text>
    <line x1="230" y1="55" x2="115" y2="100" stroke="var(--color-text)" stroke-width="1.5"></line>
    <line x1="230" y1="55" x2="345" y2="100" stroke="var(--color-text)" stroke-width="1.5"></line>
    <rect x="45" y="100" width="140" height="55" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="123" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Context</text>
    <text x="115" y="140" text-anchor="middle" fill="var(--color-text-secondary)" font-size="10">"on the desk"</text>
    <rect x="275" y="100" width="140" height="55" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="345" y="123" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Memory</text>
    <text x="345" y="140" text-anchor="middle" fill="var(--color-text-secondary)" font-size="10">"stored elsewhere"</text>
    <line x1="115" y1="155" x2="115" y2="185" stroke="var(--color-text)" stroke-width="2"></line>
    <line x1="345" y1="155" x2="345" y2="185" stroke="var(--color-text)" stroke-width="2"></line>
    <rect x="45" y="188" width="140" height="40" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="213" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">LLM</text>
    <rect x="275" y="188" width="140" height="40" rx="7" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="345" y="207" text-anchor="middle" fill="var(--color-text)" font-size="11" font-weight="700">Database /</text>
    <text x="345" y="221" text-anchor="middle" fill="var(--color-text)" font-size="11" font-weight="700">Storage system</text>
  </svg>
  <figcaption>Figure 13: Context and memory lead to different places — context feeds the LLM directly; memory sits in storage until retrieved.</figcaption>
</div>

### What's the Difference?

| Aspect | Context | Memory |
|--------|---------|--------|
| **What it is** | Information currently on the desk | Information stored in the filing cabinet |
| **When it's available** | Immediately available to the LLM right now | Available only when we retrieve and place it on the desk |
| **How long it lasts** | Only for the current interaction (or until it falls off) | Persists across sessions, days, or even years |
| **Size limit** | Limited by the context window (e.g., 200K tokens) | Effectively unlimited (database, vector store, etc.) |
| **Access speed** | Instant | Slower (requires retrieval) |

### Why This Distinction Matters

Let's walk through a practical example:

**Scenario:** We're building a customer support chatbot.

**Context (on the desk):**
- Current customer question
- Recent conversation history (last 5 exchanges)
- Customer ID
- Order status for their current order

**Memory (in the filing cabinet):**
- Customer's full purchase history (5 years)
- All previous support tickets
- Account creation date
- Shipping preferences
- Any other long-term data

The LLM can only work with what's **on the desk**. It can't magically access the filing cabinet unless we build a system to retrieve information from it and place it onto the desk.

### How We Bridge the Gap

This is where techniques like **Retrieval-Augmented Generation (RAG)** come in. When the customer asks a question, our system:

1. **Looks in the filing cabinet** (memory/database)
2. **Finds relevant information** (past tickets, preferences, etc.)
3. **Places it on the desk** (injects it into the context window)
4. **Now the LLM can use it** to generate a response

We'll dive much deeper into these techniques later in the certification. For now, the key insight is:

> **Context is what the LLM can see right now. Memory is everything else. Our job as architects is to build systems that bring the right information from memory into context at the right time.**


## More Context Does NOT Automatically Mean Better Context

This is one of the most important lessons in our entire certification.

**Scenario:**

We ask the LLM:

> "Where is my order?"

**Useful context:**

```
Customer name
Order ID
Current order status
Shipping status
Relevant policy
```

That's focused. Every piece of information is directly relevant to the question. The LLM can find what it needs quickly and generate an accurate response.

**Now let's imagine we decide:**

> "Let's give the LLM everything. More information must be better!"

So we cram the desk with:

```
Entire company handbook
Entire product catalogue
Five years of customer conversations
All previous API responses
Every shipping policy ever written
Every order ever placed
```

**Question:** Did we give the model **more** information?

{% icon "check", "icon-inline" %} Yes.

**Question:** Did we give it **better** information?

{% icon "xmark", "icon-inline" %} Probably not.

We created noise. The relevant order status is buried somewhere in that pile, but the LLM now has to work through thousands of tokens of irrelevant content to find it. The useful signal is drowned out by the noise.

**This is our core insight:**

> **Relevance matters more than volume.**

Our goal is never to "fill the context window." Our goal is to **put the right information into the context at the right time.**


## Context Rot — When the Desk Gets Too Messy

Here's where the desk analogy becomes especially useful.

Let's compare these two desks:

### Desk A (Focused)

<div class="diagram">
  <svg viewBox="0 0 360 200" role="img" aria-labelledby="desk-a-title desk-a-desc">
    <title id="desk-a-title">Desk A — a focused context</title>
    <desc id="desk-a-desc">A box containing only four relevant items: order status, customer request, refund policy, and customer ID.</desc>
    <rect x="40" y="20" width="280" height="160" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="58" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Order status</text>
    <text x="180" y="88" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Customer request</text>
    <text x="180" y="118" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Refund policy</text>
    <text x="180" y="148" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Customer ID</text>
  </svg>
  <figcaption>Figure 14: Desk A — focused. Everything on it is relevant to the request.</figcaption>
</div>

Everything is relevant and easy to find. The LLM can quickly identify the key facts and generate a response.

### Desk B (Overstuffed)

<div class="diagram">
  <svg viewBox="0 0 400 340" role="img" aria-labelledby="desk-b-title desk-b-desc">
    <title id="desk-b-title">Desk B — an overstuffed context</title>
    <desc id="desk-b-desc">A box crammed with nine items: 500 pages of documentation, 300 old conversations, 1,000 API responses, product catalogue, internal handbook, old shipping policies, current order status (needed), customer request (needed), and more. The two needed items are buried among the rest.</desc>
    <rect x="20" y="15" width="360" height="290" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="35" y="44" fill="var(--color-text-secondary)" font-size="11">500 pages of documentation</text>
    <text x="35" y="75" fill="var(--color-text-secondary)" font-size="11">300 old conversations</text>
    <text x="35" y="106" fill="var(--color-text-secondary)" font-size="11">1,000 API responses</text>
    <text x="35" y="137" fill="var(--color-text-secondary)" font-size="11">Product catalogue</text>
    <text x="35" y="168" fill="var(--color-text-secondary)" font-size="11">Internal handbook</text>
    <text x="35" y="199" fill="var(--color-text-secondary)" font-size="11">Old shipping policies</text>
    <text x="35" y="230" font-size="11"><tspan fill="var(--color-text)" font-weight="700">Current order status</tspan><tspan fill="var(--color-text-secondary)" font-size="9"> — needed</tspan></text>
    <text x="35" y="261" font-size="11"><tspan fill="var(--color-text)" font-weight="700">Customer request</tspan><tspan fill="var(--color-text-secondary)" font-size="9"> — needed</tspan></text>
    <text x="35" y="292" fill="var(--color-text-secondary)" font-size="11" font-style="italic">...</text>
  </svg>
  <figcaption>Figure 15: Desk B — overstuffed. The information we need is still there, just buried.</figcaption>
</div>

The important information is still there — it's just buried. Finding it and correctly using it becomes harder. The model might get distracted by irrelevant policies, outdated information, or conflicting examples.

This is our intuition behind **context rot**:

> **As context grows, irrelevant or poorly organized information can make it harder for the model to use the information that actually matters.**

Context rot manifests in a few ways:

| Symptom | What It Looks Like |
|---------|-------------------|
| **Distraction** | The model pulls from irrelevant sections of a large document |
| **Omission** | The model misses the key fact buried in the noise |
| **Confusion** | The model tries to reconcile conflicting information from old policies |
| **Hallucination** | The model guesses instead of finding the needle in the haystack |


## So What Do We Do About This?

We can't expand the desk indefinitely. Even models with 1M+ token context windows still have limits. And even when we stay within those limits, context rot can degrade performance.

**The solution isn't bigger desks. It's smarter desk management.**

As we progress through this certification, we'll learn practical strategies for managing the context window:

| Strategy | What It Does |
|----------|--------------|
| **Context pruning** | Removing irrelevant or outdated information before it reaches the model |
| **Summarization** | Compressing long content into concise summaries that preserve key facts |
| **Retrieval (RAG)** | Fetching only the most relevant documents instead of dumping everything in |
| **Memory systems** | Storing long-term information outside the context and retrieving it on demand |
| **Tool use** | Letting the model call out to external systems instead of keeping everything in memory |
| **Agentic architectures** | Breaking complex tasks into smaller steps with focused context windows |

These are the architectural patterns that separate toy demos from production-grade systems.


## Key Takeaways

Let's recap what we've learned:

| Concept | Takeaway |
|---------|----------|
| **Context window** | The LLM's working desk — everything it can "see" at generation time |
| **Context limit** | When exceeded, the system either truncates or rejects the request |
| **Token awareness** | Every token consumes space on the desk; 1 token ≈ ¾ of an English word |
| **Context vs. Memory** | Context is what's on the desk; memory is what's in the filing cabinet |
| **Quality over quantity** | More context is not automatically better context |
| **Context rot** | Too much irrelevant information degrades performance |
| **Solution** | Smart context management, not bigger context windows |

Now that we understand the context window — its limits, its challenges, the distinction between context and memory, and the concept of context rot — we're ready to explore practical techniques for managing it.


{% include "components/learning-path-nav.liquid" %}
