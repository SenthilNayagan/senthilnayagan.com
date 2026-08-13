---
title: Hello, World
description: The first post on this blog — what to expect and how this site is built.
tags:
  - meta
---

Welcome! This is the first post on my blog, where I'll be writing about software engineering, web development, and whatever else I'm learning at the moment.

## What to expect

I plan to write about topics like:

- Web development and front-end engineering
- Tools, workflows, and things I learn on the job
- Notes on programming languages, frameworks, and best practices

## How this site is built

This site is a static site built with [Eleventy (11ty)](https://www.11ty.dev/), styled with Sass, and deployed via GitHub Actions to GitHub Pages. Code blocks are syntax-highlighted at build time, so there's no client-side JavaScript required to read a post:

```js
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

More posts coming soon.
