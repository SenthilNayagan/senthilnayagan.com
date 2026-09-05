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

# Before We Go Any Further

Before I could understand agents, I realised I had to go one level deeper.

Everyone was talking about agents, tools, context and orchestration. But underneath all of those things was one component I couldn't afford to treat as a black box: **the LLM itself**.

So before building anything agentic, I decided to step back and answer a much simpler question:

> **What actually happens when we ask an LLM to do something?**

That's what this article is about. No agents yet. No tools yet. Just the thing everything else is built on top of.

---

# What Is an LLM, Really?

An **LLM (large language model)** is a model trained on enormous amounts of text, whose one job is deceptively simple:

> **Given some text, predict what text is most likely to come next.**

That's it. That's the whole trick.

It isn't a database we're querying. It doesn't "look things up" in some internal filing cabinet. It doesn't have a separate memory it consults between requests. There's no hidden reasoning engine sitting behind the model quietly checking facts.

Every single thing an LLM produces — an answer, a summary, a piece of code, a joke — comes from the same repeated operation:

> **Look at everything so far. Predict the next small piece of text. Add it. Repeat.**

That single idea explains a surprising amount of what makes LLMs powerful, and a surprising amount of what makes them frustrating.

We'll come back to both.

---

# Tokens: The Actual Unit an LLM Works With

We don't send Claude "words." We send Claude **tokens**.

A token is a chunk of text — sometimes a whole word, sometimes part of a word, sometimes just punctuation. The model doesn't see our sentence the way we do. It sees a sequence of these chunks.

For example, a sentence like:

```text
Redshift Serverless separates compute from storage.
```

might be broken into tokens roughly like:

```text
Redshift | Server | less | separates | compute | from | storage | .
```

Notice `Serverless` didn't survive as one piece. Longer or less common words are often split into smaller, more common sub-word chunks, because the model was trained on a fixed vocabulary of token pieces, not a dictionary of every possible word.

Why does this matter for us practically?

- **Cost is measured in tokens**, not characters or words. Both what we send (input) and what the model generates (output) count.
- **Limits are measured in tokens** — including the context window we'll get to shortly.
- **The same sentence in different languages can tokenize very differently.** English is usually token-efficient; some other languages and most code use noticeably more tokens for the same idea.

A rough rule of thumb for English text: **1 token ≈ ¾ of a word**, so 100 words is usually somewhere around 130–150 tokens. It's a rough guide, not a formula — the real count depends on the exact text.

---

# Input and Output: What Actually Goes In and Comes Out

At the simplest level, using an LLM looks like this:

```text
Our input (tokens) → the model → its output (tokens)
```

The **input** is everything we hand the model for this particular request: our instructions, our question, any earlier turns of the conversation, any documents or tool results we've included — all of it, turned into tokens.

The **output** is what the model generates in response — also tokens, produced one at a time, which get turned back into readable text for us.

Here's the detail that trips people up the most:

> **The model has no idea anything existed before this exact input, unless we put it in the input ourselves.**

There's no separate "the model remembers our last conversation" happening behind the scenes. If we want Claude to know what we discussed five minutes ago, *we* (our application) are responsible for including that earlier conversation in the new input. The model isn't secretly storing it anywhere.

That single fact is the reason "context" becomes such an important concept — which is exactly where we're going next.

---

# Context: Everything the Model Can "See" Right Now

**Context** is everything included in the input for a given request — combined into one thing the model reads before generating a response.

That typically includes:

- The **system prompt** (instructions about how the model should behave)
- The **conversation so far** (previous user and assistant turns, if we chose to include them)
- Any **documents, retrieved data, or tool results** we've added
- The **current question or instruction**

From the model's point of view, all of this is just... text. One long sequence of tokens. It doesn't distinguish "this part is really important" from "this part is just filler" unless the content itself, or our instructions, make that clear.

This has a very practical consequence:

> **More context isn't automatically better context.**

Stuffing in irrelevant documents, redundant conversation history, or unrelated tool output doesn't just cost more tokens — it can genuinely make the model's response worse, because the useful signal gets diluted among things that don't matter.

We'll spend a lot more time on this later in the learning path, once we start building agentic systems that accumulate context over many steps. For now, the mental model we need is simple:

> **Context = everything the model gets to work with for this one request. Nothing more, nothing less.**

---

# Context Windows: The Size Limit on What It Can See

If context is *what* the model can see, the **context window** is *how much* of it the model can see at once.

It's a hard capacity limit, measured in tokens, and it covers **both** our input and the model's output combined. If a model has a 200,000-token context window, our system prompt, conversation history, documents, and the response the model generates all have to fit inside that same 200,000-token budget.

<div class="diagram">
  <svg viewBox="0 0 560 160" role="img" aria-labelledby="llm1-title llm1-desc">
    <title id="llm1-title">A context window split between system instructions, conversation, and room for the response</title>
    <desc id="llm1-desc">A single horizontal bar representing the context window, divided into three sections: system instructions, conversation so far, and remaining room for the model's response.</desc>
    <rect x="20" y="30" width="520" height="70" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <line x1="150" y1="30" x2="150" y2="100" stroke="var(--color-border)" stroke-width="1.5"></line>
    <line x1="380" y1="30" x2="380" y2="100" stroke="var(--color-border)" stroke-width="1.5" stroke-dasharray="4 3"></line>
    <text x="85" y="58" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">System</text>
    <text x="85" y="76" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">instructions</text>
    <text x="265" y="58" text-anchor="middle" fill="var(--color-text)" font-size="12" font-weight="700">Conversation</text>
    <text x="265" y="76" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">so far</text>
    <text x="460" y="58" text-anchor="middle" fill="var(--color-text-secondary)" font-size="12" font-weight="700">Room left</text>
    <text x="460" y="76" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">for the response</text>
    <line x1="20" y1="115" x2="540" y2="115" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="280" y="135" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">The context window — e.g. 200,000 tokens, all counted together</text>
  </svg>
  <figcaption>Figure 1: Everything the model can "see" for this request lives inside one shared context window.</figcaption>
</div>

A few consequences fall directly out of this:

- **A long conversation eventually crowds out room for a long answer.** The more tokens spent on history, the fewer are left for the response.
- **A huge document dropped into context leaves less room for everything else.** Sometimes retrieving just the relevant section matters more than dumping the whole file in.
- **"Running out of context" is a real failure mode**, not a hypothetical one — and it's a big part of why context management becomes its own topic later in this learning path.

For now, the mental model we need is simple:

> **The context window is a shared, finite budget — input and output both draw from the same pool.**

---

# How an LLM Actually Generates a Response

Here's the part that surprises people the most the first time they hear it clearly stated:

> **An LLM doesn't write the whole response at once. It generates one token at a time.**

The process looks like this:

1. The model looks at all the tokens in the context so far.
2. It predicts the single most likely next token.
3. That token gets appended to the sequence.
4. The model looks at the *new*, slightly longer sequence and predicts the next token after that.
5. Repeat, one token at a time, until the model produces a stop signal or hits a length limit.

There's no planning stage where the model decides the whole answer up front and then writes it down. Each token is predicted based on everything that came before it — including the tokens the model itself has already generated in this same response.

This is also why **the model can't reliably "take back" something it already said**. Once a token has been generated, it becomes part of the context for every token that follows. If the model heads down a wrong path early in its answer, it tends to keep building on that path rather than course-correcting — because from its perspective, "what came before" already includes the mistake.

That one detail explains a lot of behavior we'll run into later: why clear, well-structured prompts help so much, and why breaking a big task into smaller steps often produces better results than asking for everything in one giant response.

---

# The Limitations of LLMs

Once we understand *how* an LLM generates a response, several well-known limitations stop being mysterious and start being predictable:

**It can be confidently wrong (hallucination).**
Because the model is predicting plausible-sounding text, not looking facts up in a verified source, it can generate something that reads fluently and confidently while being entirely incorrect. Nothing internally distinguishes "I know this" from "this sounds like the kind of thing that would come next."

**It has a knowledge cutoff.**
The model's understanding of the world comes from its training data, which has a cutoff date. It won't inherently know about anything that happened after that point, unless we supply that information ourselves through context.

**It has no memory between separate requests.**
As we covered earlier, if we don't include the previous conversation in the new input, the model has no idea it ever happened. There's no background memory quietly persisting on its own.

**It's sensitive to how we phrase things.**
Because everything the model does is conditioned on the exact tokens in its context, small differences in wording, structure, or ordering can meaningfully change the output. This is a big part of why prompt engineering exists as a discipline of its own — it's coming up soon in this learning path.

**It doesn't "know" what it doesn't know.**
Unless it's explicitly given the ability to check — via a tool, a retrieval step, or an instruction to say "I'm not sure" — the model has no built-in mechanism for flagging its own uncertainty. Confidence in tone is not the same thing as confidence in correctness.

None of this makes LLMs unreliable in a way that rules them out for real applications. It just means the model, on its own, is not the whole system. The rest of this learning path — tools, structured output, agentic loops, reliability — exists largely *because* of these limitations, not despite them.

---

# Why LLM Applications Behave Differently From Traditional Software

If we've built traditional software before, a few things about LLM-based applications will feel unfamiliar at first:

**The same input can produce different output.**
Traditional software is (mostly) deterministic — the same input reliably produces the same output. LLMs are probabilistic by nature. Asking the same question twice can produce two different, both individually reasonable, answers.

**There's no stack trace when something goes "wrong."**
A traditional bug throws an exception we can trace back to a line of code. A "wrong" LLM response doesn't throw anything — it just quietly returns confident, fluent, incorrect text, and we're the ones who have to notice.

**Cost and performance scale with tokens, not just computation.**
A longer conversation, a bigger document, a more verbose response — all of these cost more, in both money and latency, in a way that's much more directly visible than most traditional backend operations.

**Correctness becomes a spectrum, not a boolean.**
"Did the function return the right value?" has a clear yes/no answer. "Was this a good response?" often doesn't. Evaluating LLM applications well is a genuinely different skill from evaluating traditional software.

We're not covering all of that in depth here — that's what later parts of this learning path, especially reliability and evaluation, are for. For now, the important shift is just recognising that **an LLM-based system needs to be designed with these properties in mind from the start**, not bolted on as an afterthought once something goes wrong in production.

---

# The Short Version

An LLM predicts the next token, one token at a time, based on everything in its context. **Tokens** are the unit it actually works with. **Context** is everything included in a given request. The **context window** is the shared, finite token budget that input and output both draw from. And because the model has no memory of its own, is sensitive to phrasing, and can be confidently wrong, LLM applications need a different mindset than traditional software — one built around managing context, structuring output, and designing for a system that behaves probabilistically rather than deterministically.

That mental model is the foundation for everything else in this learning path. Next, we'll look at how an application actually talks to Claude — the Messages API, requests, responses, and the basic shape of a Claude-powered application.

{% include "components/learning-path-nav.liquid" %}
