---
title: "One Namespace, One Workgroup: Datashare Is Redshift Serverless's Back Door"
description: >-
  Want a second Redshift Serverless workgroup for isolated compute? We
  can't attach it to the same namespace—the relationship is 1:1. But
  there's a back door: create a new namespace/workgroup and use Datashare
  to access the data from the original namespace. Our new workgroup gets
  its own compute capacity while still being able to query and JOIN the
  shared tables.
keywords:
  - redshift
  - aws
  - data-engineering
  - datashare
  - redshift-serverless
tags:
  - redshift
  - aws
  - data-engineering
  - datashare
  - redshift-serverless
coverImage: ./images/cover-image.png
imageDescription: "One Namespace, One Workgroup: Datashare Is Redshift Serverless's Back Door"
# imageCredits: 'Generated using ChatGPT'
featured: true
draft: true
---

{% include "toc.md" %}

# Before We Start: What This Post Is (and Very Much Isn't)

If you came here expecting a complete **Amazon Redshift A-to-Z tutorial**, I have bad news: your coffee can cool down now. ☕

This post is **not** a Redshift A-to-Z. This post deliberately focuses on **one specific architectural problem**, **not** a Redshift A-to-Z.

This post has exactly one job: to explain a very specific, very common moment of confusion in **Amazon Redshift Serverless**:

> **“We already have a Redshift Serverless workgroup attached to a namespace. We want another isolated workgroup with its own compute capacity, but we still want that new workload to query and JOIN the existing data. Can we attach the new workgroup to the same namespace?”**

The short answer is:

**No. A Redshift Serverless namespace and workgroup have a 1:1 relationship.**

But there is a very useful second question:

> **“If we cannot attach two workgroups to one namespace, how can the second workgroup access the first namespace's data without copying everything?”**

That's where **Amazon Redshift Datashare** enters the story.

That's the whole post. We'll cover:

1. What a **namespace** is.
2. What a **workgroup** is.
3. Why the namespace/workgroup relationship matters.
4. Why we cannot attach a second workgroup to the existing namespace.
5. Why **Datashare** exists, and what problem it's actually solving.
6. How a **producer namespace** and **consumer namespace** work.
7. How the consumer workgroup can query and JOIN shared tables.
8. A practical architecture for isolating compute while reusing existing data.
9. The important caveats and design considerations.

The goal is not to cover every Redshift feature. The goal is to make **this one architectural puzzle** crystal clear.

---

# 1. First, Meet the Two Characters: Namespace and Workgroup

Before discussing Datashare, we need to establish one mental model.

In Redshift Serverless, think of a **namespace** as the place where our data and database resources live, while a **workgroup** is the compute environment used to process queries against that data.

A simplified picture looks like this:

<div class="diagram">
  <svg viewBox="0 0 440 230" role="img" aria-labelledby="ns1-title ns1-desc">
    <title id="ns1-title">A namespace and workgroup as a locked 1:1 pair</title>
    <desc id="ns1-desc">Two boxes side by side. The left box, Namespace, lists Database, Schemas, Tables, Views, Users/Roles/Data, and Persistent storage. The right box, Workgroup, lists Compute, RPU capacity, Endpoint, and Networking configuration. A line labeled 1 to 1 connects them in the middle.</desc>
    <rect x="20" y="30" width="170" height="170" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="105" y="55" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">NAMESPACE</text>
    <text x="35" y="77" fill="var(--color-text-secondary)" font-size="11">Database</text>
    <text x="35" y="95" fill="var(--color-text-secondary)" font-size="11">Schemas</text>
    <text x="35" y="113" fill="var(--color-text-secondary)" font-size="11">Tables</text>
    <text x="35" y="131" fill="var(--color-text-secondary)" font-size="11">Views</text>
    <text x="35" y="149" fill="var(--color-text-secondary)" font-size="11">Users / Roles / Data</text>
    <text x="35" y="167" fill="var(--color-text-secondary)" font-size="11">Persistent storage</text>
    <line x1="190" y1="115" x2="250" y2="115" stroke="var(--color-text-secondary)" stroke-width="2"></line>
    <text x="220" y="105" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">1 : 1</text>
    <rect x="250" y="30" width="170" height="170" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="335" y="55" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">WORKGROUP</text>
    <text x="265" y="82" fill="var(--color-text-secondary)" font-size="11">Compute</text>
    <text x="265" y="102" fill="var(--color-text-secondary)" font-size="11">RPU capacity</text>
    <text x="265" y="122" fill="var(--color-text-secondary)" font-size="11">Endpoint</text>
    <text x="265" y="142" fill="var(--color-text-secondary)" font-size="11">Networking configuration</text>
  </svg>
  <figcaption>Figure 1: One namespace, one workgroup — a locked 1:1 pair.</figcaption>
</div>

This distinction is the foundation for everything that follows.

---

## What Is a Namespace?

A **namespace** is the collection of database objects and users. It owns:

- Our **databases, schemas, and tables** (the actual data)
- **Users and permissions**
- **Encryption keys** (KMS settings)
- **Snapshots and backups**
- Admin credentials

In short: the namespace *is* our data estate. It answers the question **"what data exists, and who's allowed to see it?"**

In other words: We can think of it as:

> **“This is where our Redshift data lives.”**

---

## What Is a Workgroup?

A **workgroup** is where the compute side of Redshift Serverless comes into play. It's the collection of database objects and users. It owns:

- **RPUs (Redshift Processing Units)** — the actual horsepower that runs our queries
- **Network configuration** — VPC, subnets, security groups
- The **query endpoint** our applications and BI tools connect to
- Usage limits and query queue configuration

In short: The workgroup is simply our compute unit. **It defines our processing power and the network path to access it**.

That's it. That's the whole primer. Now let's get to the actual drama.

---

# 2. The Plot Twist: Namespace and Workgroup Are 1:1

Here's the plot twist that catches almost everyone off guard the first time they try to scale out:

> **In Redshift Serverless, a namespace can be attached to exactly one workgroup, and a workgroup can be attached to exactly one namespace. Period.**

It's a strictly monogamous, one-to-one relationship. Not one-to-many. Not many-to-many. **One. To. One.**

So here's the scenario that trips people up:

We already have a namespace — let's call it `analytics-ns` — happily paired with a workgroup called `analytics-wg`. Our analytics team has been querying away for months. Life is good.

Then a new team shows up — say, the **fraud detection** team. They need their own compute so their heavy queries don't compete with (or accidentally throttle) the analytics team's dashboards. Totally reasonable ask. So we think:

> "Easy — we'll just spin up a new workgroup, `fraud-wg`, and point it at the *existing* `analytics-ns` namespace. Same data, dedicated compute. Done!"

And Redshift Serverless says: **absolutely not.**

<div class="diagram">
  <svg viewBox="0 0 560 230" role="img" aria-labelledby="ns3-title ns3-desc">
    <title id="ns3-title">A namespace can only be paired with one workgroup at a time</title>
    <desc id="ns3-desc">Namespace analytics-ns is connected by a solid line to analytics-wg, marked as already married. A second, dashed line from analytics-ns to a hypothetical fraud-wg is marked blocked, since a namespace can only have one partner.</desc>
    <rect x="20" y="65" width="140" height="100" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="90" y="119" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">analytics-ns</text>
    <rect x="370" y="25" width="150" height="55" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="445" y="57" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">analytics-wg</text>
    <rect x="370" y="150" width="150" height="55" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5" stroke-dasharray="4 3"></rect>
    <text x="445" y="182" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">fraud-wg</text>
    <line x1="160" y1="80" x2="370" y2="52" stroke="var(--color-text)" stroke-width="2"></line>
    <line x1="160" y1="150" x2="370" y2="177" stroke="var(--color-text-secondary)" stroke-width="2" stroke-dasharray="5 4"></line>
    <polyline points="216,32 220,37 229,26" fill="none" stroke="var(--color-text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <text x="235" y="36" fill="var(--color-text)" font-size="11" font-weight="700">already married</text>
    <line x1="217" y1="193" x2="227" y2="203" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round"></line>
    <line x1="217" y1="203" x2="227" y2="193" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round"></line>
    <text x="235" y="200" fill="var(--color-text-secondary)" font-size="11" font-weight="700">blocked</text>
    <text x="235" y="213" fill="var(--color-text-secondary)" font-size="11">one namespace, one partner</text>
  </svg>
  <figcaption>Figure 2: One namespace, one partner — analytics-ns is already paired; fraud-wg can't attach to it too.</figcaption>
</div>

We cannot attach a second workgroup to a namespace that already has one. If we want `fraud-wg` to exist as an *isolated* workgroup, it needs its **own** namespace — let's call it `fraud-ns`.

---

## So Why Does AWS Enforce This?

**AWS's own documentation doesn't spell out an explicit reason for why the pairing has to be strictly 1:1** — it simply states that namespaces and workgroups exist to let us isolate workloads and manage storage and compute separately. AWS doesn't publish a "here's exactly why it's one-to-one" explanation anywhere.

That said, the design makes a lot of sense once we think through what a workgroup and namespace together represent.

### A. Compute isolation stays clean

A workgroup represents a compute environment with its own capacity and workload characteristics.

If multiple independent workgroups could freely attach to the same namespace, the relationship **between data ownership and compute consumption** would become considerably more complicated.

With 1:1, the mental model stays wonderfully simple:

<div class="diagram">
  <svg viewBox="0 0 480 234" role="img" aria-labelledby="ns4-title ns4-desc">
    <title id="ns4-title">The 1:1 chain from namespace to workgroup to compute</title>
    <desc id="ns4-desc">Namespace A points down to Workgroup A, which points down to its compute. A single straight line, no branching.</desc>
    <defs>
      <marker id="va-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="140" y="20" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="47" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Namespace A</text>
    <line x1="240" y1="66" x2="240" y2="91" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow)"></line>
    <rect x="140" y="94" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="121" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Workgroup A</text>
    <line x1="240" y1="140" x2="240" y2="165" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow)"></line>
    <rect x="140" y="168" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="195" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Its compute</text>
  </svg>
  <figcaption>Figure 3: The 1:1 relationship flows straight through — one namespace, one workgroup, one compute environment.</figcaption>
</div>

Want another isolated compute environment?

We get another namespace/workgroup pair.

---

### B. Cost and capacity stay easier to reason about

Redshift Serverless compute is expressed in **RPUs**, and usage limits can be configured for a workgroup.

Keeping the workgroup association unambiguous makes it much easier to answer questions like:

> “Which workload is consuming this compute?”

and:

> “Which workgroup should we scale or place a usage limit on?”

Now imagine several independent workgroups hanging off the same namespace.

Suddenly, the architecture starts looking less like a clean apartment building and more like a shared utility cupboard where everyone has plugged in their own extension cord.

<div class="diagram">
  <svg viewBox="0 0 460 230" role="img" aria-labelledby="ns5-title ns5-desc">
    <title id="ns5-title">One namespace cannot cleanly fan out to three workgroups</title>
    <desc id="ns5-desc">A box labeled Same Namespace connects down to three workgroup boxes, WG-A at 24 RPU, WG-B at 32 RPU, and WG-C at 16 RPU, illustrating the ambiguity of one namespace serving multiple workgroups.</desc>
    <rect x="155" y="20" width="150" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="230" y="50" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">Same Namespace</text>
    <line x1="230" y1="70" x2="90" y2="155" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <line x1="230" y1="70" x2="230" y2="155" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <line x1="230" y1="70" x2="370" y2="155" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <rect x="30" y="155" width="120" height="55" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="90" y="182" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">WG-A</text>
    <text x="90" y="199" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">24 RPU</text>
    <rect x="170" y="155" width="120" height="55" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="230" y="182" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">WG-B</text>
    <text x="230" y="199" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">32 RPU</text>
    <rect x="310" y="155" width="120" height="55" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5"></rect>
    <text x="370" y="182" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">WG-C</text>
    <text x="370" y="199" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">16 RPU</text>
  </svg>
  <figcaption>Figure 4: If one namespace fanned out to three workgroups, whose usage limit applies? The model stays ambiguous.</figcaption>
</div>

The 1:1 model avoids that ambiguity.

---

### C. Network configuration belongs to the workgroup

Workgroups carry compute-side configuration such as networking settings.

That separation is useful because the compute environment can have its own connectivity requirements without turning the namespace itself into a container for multiple competing compute/network configurations.

Again, the 1:1 relationship keeps the architecture easier to reason about:

<div class="diagram">
  <svg viewBox="0 0 460 224" role="img" aria-labelledby="ns6-title ns6-desc">
    <title id="ns6-title">A workgroup owns compute, endpoint, and network configuration</title>
    <desc id="ns6-desc">Namespace points down to Workgroup. Workgroup branches into three items it owns: Compute, Endpoint, and Network configuration.</desc>
    <defs>
      <marker id="va-arrow-5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="140" y="15" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="42" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Namespace</text>
    <line x1="240" y1="61" x2="240" y2="86" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-5)"></line>
    <rect x="140" y="89" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="116" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Workgroup</text>
    <line x1="240" y1="135" x2="240" y2="194" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <line x1="240" y1="150" x2="280" y2="150" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="288" y="154" fill="var(--color-text-secondary)" font-size="11">Compute</text>
    <line x1="240" y1="172" x2="280" y2="172" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="288" y="176" fill="var(--color-text-secondary)" font-size="11">Endpoint</text>
    <line x1="240" y1="194" x2="280" y2="194" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="288" y="198" fill="var(--color-text-secondary)" font-size="11">Network configuration</text>
  </svg>
  <figcaption>Figure 5: A workgroup owns its own compute, endpoint, and network configuration — separate from the namespace.</figcaption>
</div>

---

### D. The model gives us a clean ownership boundary

Perhaps the most useful way to think about the design is this:

- **The namespace represents the data/database side**
- **The workgroup represents the compute side**

AWS gives us a 1:1 relationship between them.

That makes the default architecture beautifully predictable:

<div class="diagram">
  <svg viewBox="0 0 480 230" role="img" aria-labelledby="ns7-title ns7-desc">
    <title id="ns7-title">The default, predictable 1:1 shape</title>
    <desc id="ns7-desc">Namespace, holding data and database, connects 1 to 1 down to Workgroup, which holds compute and endpoint.</desc>
    <defs>
      <marker id="va-arrow-6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="140" y="15" width="200" height="70" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="40" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Namespace</text>
    <text x="240" y="60" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">Data / Database</text>
    <line x1="240" y1="85" x2="240" y2="140" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-6)"></line>
    <text x="252" y="115" fill="var(--color-text-secondary)" font-size="11" font-weight="700">1 : 1</text>
    <rect x="140" y="145" width="200" height="70" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="170" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Workgroup</text>
    <text x="240" y="190" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">Compute / Endpoint</text>
  </svg>
  <figcaption>Figure 6: The default, predictable shape — one namespace, one workgroup, connected 1:1.</figcaption>
</div>

But this creates an interesting problem.

What if we want **another isolated compute environment** while still working with the **same data**?

The obvious thing we'd like to do is:

<div class="diagram">
  <svg viewBox="0 0 400 220" role="img" aria-labelledby="ns8-title ns8-desc">
    <title id="ns8-title">The naive attempt to fan a namespace out to two workgroups</title>
    <desc id="ns8-desc">Namespace points down to two workgroups, WG-A at 24 RPU and WG-B at 32 RPU, marked not supported, since Redshift Serverless does not allow this.</desc>
    <rect x="100" y="15" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5" stroke-dasharray="4 3"></rect>
    <text x="200" y="42" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">Namespace</text>
    <line x1="200" y1="61" x2="110" y2="150" stroke="var(--color-text-secondary)" stroke-width="1.5" stroke-dasharray="5 4"></line>
    <line x1="200" y1="61" x2="290" y2="150" stroke="var(--color-text-secondary)" stroke-width="1.5" stroke-dasharray="5 4"></line>
    <line x1="195" y1="113" x2="205" y2="123" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round"></line>
    <line x1="195" y1="123" x2="205" y2="113" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round"></line>
    <text x="200" y="134" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">not supported</text>
    <rect x="40" y="150" width="140" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5" stroke-dasharray="4 3"></rect>
    <text x="110" y="175" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">WG-A</text>
    <text x="110" y="192" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">24 RPU</text>
    <rect x="220" y="150" width="140" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text-secondary)" stroke-width="1.5" stroke-dasharray="4 3"></rect>
    <text x="290" y="175" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">WG-B</text>
    <text x="290" y="192" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">32 RPU</text>
  </svg>
  <figcaption>Figure 7: The naive fix doesn't work — a namespace can't fan out to two workgroups.</figcaption>
</div>

Unfortunately, that's not how Redshift Serverless is designed.

The answer isn't to fight the 1:1 model.

The answer is to work with it:

- **Create another namespace**
- **Create another workgroup**

And then ask the really interesting question:

> **How do we let this new workgroup use the data that already lives in the original namespace — without simply copying the whole dataset?**

That's where **Datashare** walks into the room.

---

# 3. If Namespaces Can't Be Shared, How Does Anyone Query Across Them?

This is where most people start Googling. Or, let's be honest, asking an LLM to save them from reading the docs.

The fraud team's new `fraud-ns` + `fraud-wg` pair is a totally empty house. No tables, no data, nothing. But the fraud team's queries **absolutely need to JOIN against tables that live in `analytics-ns`** — things like the master `customers` table or the `transactions` table.

Duplicating that data into `fraud-ns` is the obvious hacky workaround, and it's a bad one:

- Now we have **two copies of the truth**, which will drift out of sync
- We've doubled our storage costs
- Every schema change now needs to be replicated manually or via some fragile pipeline
- Our security team now has two places to audit permissions on the same sensitive data

This is exactly the gap that **Datashare** was built to close.

---

## Enter Datashare: Finally, a Way Out of This 1:1 Nightmare

**Redshift Datashare** lets one namespace (the **producer**) share live, read-only access to specific databases, schemas, or tables with another namespace (the **consumer**) — **without copying a single byte of data**.

Crucially, here's the part that makes it click:

> When the consumer namespace queries shared data, it does so using **its own workgroup's compute capacity (RPUs)** — not the producer's.

So the fraud team's `fraud-wg` uses its own dedicated RPUs to scan, filter, and JOIN against data that physically still lives in `analytics-ns`. The analytics team's compute is never touched. No contention, no duplication, no drift.

<div class="diagram">
  <svg viewBox="0 0 620 320" role="img" aria-labelledby="ns9-title ns9-desc">
    <title id="ns9-title">The datashare pattern: producer and consumer namespace/workgroup pairs</title>
    <desc id="ns9-desc">On the left, the producer: analytics-ns, holding customers and transactions data, connected up to its own analytics-wg compute. On the right, the consumer: fraud-ns, which sees the shared data but owns nothing itself, connected up to its own fraud-wg compute, which pays for and runs the JOIN. A horizontal arrow labeled Datashare, read-only, no copy, connects the producer namespace to the consumer namespace.</desc>
    <defs>
      <marker id="ds-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <text x="120" y="16" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">PRODUCER</text>
    <text x="500" y="16" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13" font-weight="700">CONSUMER</text>
    <rect x="20" y="28" width="200" height="80" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="120" y="52" text-anchor="middle" fill="var(--color-text)" font-size="15" font-weight="700">analytics-ns</text>
    <text x="120" y="72" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">owns the data</text>
    <text x="120" y="90" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">customers · transactions</text>
    <rect x="400" y="28" width="200" height="80" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="500" y="52" text-anchor="middle" fill="var(--color-text)" font-size="15" font-weight="700">fraud-ns</text>
    <text x="500" y="72" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">sees the data,</text>
    <text x="500" y="90" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">owns nothing</text>
    <line x1="220" y1="68" x2="400" y2="68" stroke="var(--color-text)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ds-arrow)"></line>
    <text x="310" y="50" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">DATASHARE</text>
    <text x="310" y="92" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">(read-only, no copy)</text>
    <rect x="20" y="210" width="200" height="95" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="120" y="234" text-anchor="middle" fill="var(--color-text)" font-size="15" font-weight="700">analytics-wg</text>
    <text x="120" y="252" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">its own RPUs,</text>
    <text x="120" y="267" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">untouched by</text>
    <text x="120" y="282" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">fraud's queries</text>
    <rect x="400" y="210" width="200" height="95" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="500" y="234" text-anchor="middle" fill="var(--color-text)" font-size="15" font-weight="700">fraud-wg</text>
    <text x="500" y="252" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">its own RPUs runs</text>
    <text x="500" y="267" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">the JOIN — pays its</text>
    <text x="500" y="282" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">own compute bill</text>
    <line x1="120" y1="205" x2="120" y2="113" stroke="var(--color-text)" stroke-width="2" marker-end="url(#ds-arrow)"></line>
    <line x1="500" y1="205" x2="500" y2="113" stroke="var(--color-text)" stroke-width="2" marker-end="url(#ds-arrow)"></line>
  </svg>
  <figcaption>Figure 8: The datashare pattern in practice — analytics-ns/analytics-wg (producer) and fraud-ns/fraud-wg (consumer), connected read-only, no copy.</figcaption>
</div>

This is genuinely the elegant part of the design: **Datashare decouples "who owns the data" from "who pays for the compute to query it."** The producer keeps full ownership and governance. The consumer gets to run its own workload, on its own dime, on its own schedule — against live data, not a stale copy.

---

# 4. The Back Door: Sharing Data Without Sharing the Workgroup

Now let's stop talking about architecture diagrams and actually build the thing.

Our scenario is simple.

We already have:

<div class="diagram">
  <svg viewBox="0 0 400 260" role="img" aria-labelledby="ns10-title ns10-desc">
    <title id="ns10-title">What we already have: analytics-ns through analytics-wg to its tables</title>
    <desc id="ns10-desc">analytics-ns points down to analytics-wg, running 24 RPU, which points down to the customers and transactions tables.</desc>
    <defs>
      <marker id="va-arrow-10" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="80" y="20" width="240" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="200" y="48" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">analytics-ns</text>
    <line x1="200" y1="66" x2="200" y2="91" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-10)"></line>
    <rect x="80" y="94" width="240" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="200" y="118" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">analytics-wg</text>
    <text x="200" y="138" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">24 RPU</text>
    <line x1="200" y1="154" x2="200" y2="179" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-10)"></line>
    <rect x="80" y="182" width="240" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="200" y="208" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">customers</text>
    <text x="200" y="226" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">transactions</text>
  </svg>
  <figcaption>Figure 9: What we already have — analytics-ns, its workgroup, and the tables it owns.</figcaption>
</div>

And we want a **completely separate compute environment** for our fraud detection workload:

<div class="diagram">
  <svg viewBox="0 0 400 180" role="img" aria-labelledby="ns11-title ns11-desc">
    <title id="ns11-title">What we want: a new fraud-ns paired with its own fraud-wg</title>
    <desc id="ns11-desc">fraud-ns points down to fraud-wg, running 32 RPU.</desc>
    <defs>
      <marker id="va-arrow-11" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="80" y="20" width="240" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="200" y="48" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">fraud-ns</text>
    <line x1="200" y1="66" x2="200" y2="91" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-11)"></line>
    <rect x="80" y="94" width="240" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="200" y="118" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">fraud-wg</text>
    <text x="200" y="138" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">32 RPU</text>
  </svg>
  <figcaption>Figure 10: What we want — a brand-new fraud-ns / fraud-wg pair, fully isolated.</figcaption>
</div>

The catch?

Our fraud workload still needs to read some of the data owned by `analytics-ns`.

We can't attach `fraud-wg` to `analytics-ns`.

So instead, we create a second namespace/workgroup pair and use **Datashare as the bridge**.

Here's what we're about to build:

<div class="diagram">
  <svg viewBox="0 0 480 390" role="img" aria-labelledby="ns12-title ns12-desc">
    <title id="ns12-title">The full producer/consumer datashare we're about to build</title>
    <desc id="ns12-desc">A producer box containing analytics-ns, its workgroup analytics-wg at 24 RPU, and the shared tables public.customers and public.transactions. A Datashare arrow points down to a consumer box containing fraud-ns, its workgroup fraud-wg at 32 RPU, and its own fraud_detection.suspicious_activity table.</desc>
    <defs>
      <marker id="va-arrow-12" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="40" y="20" width="400" height="150" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="40" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">PRODUCER</text>
    <text x="240" y="64" text-anchor="middle" fill="var(--color-text)" font-size="15" font-weight="700">analytics-ns</text>
    <text x="240" y="84" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">analytics-wg · 24 RPU</text>
    <text x="240" y="112" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">public.customers</text>
    <text x="240" y="130" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">public.transactions</text>
    <line x1="240" y1="175" x2="240" y2="225" stroke="var(--color-text)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#va-arrow-12)"></line>
    <text x="255" y="203" fill="var(--color-text)" font-size="13" font-weight="700">Datashare</text>
    <rect x="40" y="230" width="400" height="140" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="240" y="250" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">CONSUMER</text>
    <text x="240" y="274" text-anchor="middle" fill="var(--color-text)" font-size="15" font-weight="700">fraud-ns</text>
    <text x="240" y="294" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">fraud-wg · 32 RPU</text>
    <text x="240" y="322" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">fraud_detection.suspicious_activity</text>
    <text x="240" y="340" text-anchor="middle" fill="var(--color-text-secondary)" font-size="13">+ shared: customers, transactions</text>
  </svg>
  <figcaption>Figure 11: What we're about to build — a producer/consumer datashare between analytics-ns and fraud-ns.</figcaption>
</div>

Let's open the back door.

## Step 1 — Create the Datashare

First, we connect to the **producer namespace**, `analytics-ns`, through `analytics-wg`.

We create the datashare:

```sql
CREATE DATASHARE fraud_share;
```

Next, we decide exactly what our fraud workload needs to access.

In our example, that's just two tables:

```sql
ALTER DATASHARE fraud_share ADD SCHEMA public;

ALTER DATASHARE fraud_share ADD TABLE public.customers;

ALTER DATASHARE fraud_share ADD TABLE public.transactions;
```

That's an important detail.

We're not throwing open the entire namespace and shouting, *“Come on in, everybody!”*

We're explicitly choosing which objects cross the boundary.

<div class="diagram">
  <svg viewBox="0 0 460 200" role="img" aria-labelledby="ns13-title ns13-desc">
    <title id="ns13-title">Only two tables in analytics-ns are actually shared</title>
    <desc id="ns13-desc">analytics-ns branches into five objects. public.customers and public.transactions are marked shared. internal.audit_log, staging.raw_events, and admin.etl_control are marked not shared.</desc>
    <rect x="140" y="15" width="180" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="230" y="42" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">analytics-ns</text>
    <line x1="230" y1="59" x2="230" y2="170" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="278" y="72" fill="var(--color-text-secondary)" font-size="10" font-weight="700">SHARED</text>
    <line x1="230" y1="82" x2="270" y2="82" stroke="var(--color-text)" stroke-width="1.5"></line>
    <text x="278" y="86" fill="var(--color-text)" font-size="11" font-weight="700">public.customers</text>
    <line x1="230" y1="100" x2="270" y2="100" stroke="var(--color-text)" stroke-width="1.5"></line>
    <text x="278" y="104" fill="var(--color-text)" font-size="11" font-weight="700">public.transactions</text>
    <text x="278" y="122" fill="var(--color-text-secondary)" font-size="10" font-weight="700">NOT SHARED</text>
    <line x1="230" y1="132" x2="270" y2="132" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="278" y="136" fill="var(--color-text-secondary)" font-size="11">internal.audit_log</text>
    <line x1="230" y1="150" x2="270" y2="150" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="278" y="154" fill="var(--color-text-secondary)" font-size="11">staging.raw_events</text>
    <line x1="230" y1="170" x2="270" y2="170" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="278" y="174" fill="var(--color-text-secondary)" font-size="11">admin.etl_control</text>
  </svg>
  <figcaption>Figure 12: The datashare only exposes what's explicitly added — everything else in analytics-ns stays private.</figcaption>
</div>

The producer remains the owner of the original data.

The datashare simply defines what we're willing to expose.

---

## Step 2 — Give the Consumer an Invitation

Creating the datashare isn't enough. We also need to tell Redshift **which namespace is allowed to consume it**.

Still on `analytics-ns`:

```sql
GRANT USAGE ON DATASHARE fraud_share
TO NAMESPACE 'fraud-ns-namespace-id';
```

Think of this as the guest-list check.

<div class="diagram">
  <svg viewBox="0 0 420 270" role="img" aria-labelledby="ns14-title ns14-desc">
    <title id="ns14-title">Granting usage on the datashare to the consumer namespace</title>
    <desc id="ns14-desc">analytics-ns points down to fraud_share, which points down to fraud-ns, labeled fraud-ns is allowed in.</desc>
    <defs>
      <marker id="va-arrow-14" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="110" y="20" width="200" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="210" y="47" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">analytics-ns</text>
    <line x1="210" y1="64" x2="210" y2="89" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-14)"></line>
    <rect x="110" y="92" width="200" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="210" y="119" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">fraud_share</text>
    <line x1="210" y1="136" x2="210" y2="196" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-14)"></line>
    <text x="225" y="169" fill="var(--color-text-secondary)" font-size="11">&quot;fraud-ns is allowed in&quot;</text>
    <rect x="110" y="200" width="200" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="210" y="227" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">fraud-ns</text>
  </svg>
  <figcaption>Figure 13: Granting usage on the datashare is the guest-list check — only fraud-ns gets in.</figcaption>
</div>

We're not giving the entire Redshift universe access to the share. We're explicitly granting our consumer namespace access.

---

## Step 3 — The Consumer Accepts the Share

Now we switch sides.

We connect to the **consumer namespace**, `fraud-ns`, through its own workgroup, `fraud-wg`.

We create a database from the datashare:

```sql
CREATE DATABASE analytics_shared
FROM DATASHARE fraud_share
OF NAMESPACE 'analytics-ns-namespace-id';
```

And just like that, the shared data becomes available from the consumer side.

Conceptually, `fraud-ns` now has something like:

<div class="diagram">
  <svg viewBox="0 0 460 180" role="img" aria-labelledby="ns15-title ns15-desc">
    <title id="ns15-title">fraud-ns after accepting the datashare</title>
    <desc id="ns15-desc">fraud-ns branches into its own native table, suspicious_activity, and a shared group giving access to public.customers and public.transactions via the datashare.</desc>
    <rect x="140" y="15" width="180" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="230" y="42" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">fraud-ns</text>
    <line x1="230" y1="59" x2="230" y2="146" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="278" y="72" fill="var(--color-text-secondary)" font-size="10" font-weight="700">OWN TABLE</text>
    <line x1="230" y1="82" x2="270" y2="82" stroke="var(--color-text)" stroke-width="1.5"></line>
    <text x="278" y="86" fill="var(--color-text)" font-size="11" font-weight="700">suspicious_activity</text>
    <text x="278" y="108" fill="var(--color-text-secondary)" font-size="10" font-weight="700">SHARED VIA DATASHARE</text>
    <line x1="230" y1="118" x2="270" y2="118" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="278" y="122" fill="var(--color-text-secondary)" font-size="11">public.customers</text>
    <line x1="230" y1="146" x2="270" y2="146" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="278" y="150" fill="var(--color-text-secondary)" font-size="11">public.transactions</text>
  </svg>
  <figcaption>Figure 14: From fraud-ns, the native suspicious_activity table sits alongside the shared analytics data.</figcaption>
</div>

Notice what happened.

We didn't create another copy of the `customers` table just so our fraud workload could read it.

We're accessing the data owned by the producer through the share.

---

## Step 4 — Now Let's Do Something Useful With It

This is where the whole architecture starts to pay off.

Suppose our fraud namespace has its own table:

```text
fraud_detection.suspicious_activity
```

It contains:

```text
transaction_id
customer_id
flag_reason
```

Meanwhile, the producer owns:

```text
public.customers
```

with:

```text
customer_id
customer_name
risk_score
```

Our fraud workload can now combine the two:

```sql
SELECT
    f.transaction_id,
    f.flag_reason,
    c.customer_name,
    c.risk_score
FROM fraud_detection.suspicious_activity f
JOIN analytics_shared.public.customers c
    ON f.customer_id = c.customer_id;
```

And this is the moment to pause and appreciate what's happening.

One side of the JOIN is **native data in `fraud-ns`**.

The other side is **shared data owned by `analytics-ns`**.

Yet the query is submitted through:

```text
fraud-wg
```

and uses the consumer workgroup's compute environment.

The producer doesn't need to become the fraud team's compute engine.

The fraud workload doesn't need a second copy of the producer's entire dataset.

We have effectively achieved:

<div class="diagram">
  <svg viewBox="0 0 460 300" role="img" aria-labelledby="ns16-title ns16-desc">
    <title id="ns16-title">Data ownership and compute ownership, joined only by the datashare</title>
    <desc id="ns16-desc">On the left, data ownership: analytics-ns down to the customers and transactions tables. On the right, compute ownership: fraud-ns down to fraud-wg at 32 RPU. Both converge through the datashare into a single query and JOIN.</desc>
    <defs>
      <marker id="va-arrow-16" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <text x="115" y="18" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">DATA OWNERSHIP</text>
    <text x="345" y="18" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">COMPUTE OWNERSHIP</text>
    <rect x="25" y="28" width="180" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="55" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">analytics-ns</text>
    <line x1="115" y1="72" x2="115" y2="97" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-16)"></line>
    <rect x="25" y="100" width="180" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="124" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">customers table</text>
    <text x="115" y="142" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">transactions table</text>
    <rect x="255" y="28" width="180" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="345" y="55" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">fraud-ns</text>
    <line x1="345" y1="72" x2="345" y2="97" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-16)"></line>
    <rect x="255" y="100" width="180" height="60" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="345" y="124" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">fraud-wg</text>
    <text x="345" y="142" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">32 RPU</text>
    <line x1="115" y1="165" x2="230" y2="195" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <line x1="345" y1="165" x2="230" y2="195" stroke="var(--color-text-secondary)" stroke-width="1.5"></line>
    <text x="245" y="210" fill="var(--color-text)" font-size="13" font-weight="700">Datashare</text>
    <line x1="230" y1="197" x2="230" y2="242" stroke="var(--color-text)" stroke-width="2" marker-end="url(#va-arrow-16)"></line>
    <rect x="140" y="245" width="180" height="44" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="230" y="272" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Query + JOIN</text>
  </svg>
  <figcaption>Figure 15: Data ownership stays with analytics-ns; compute ownership stays with fraud-wg — Datashare is the only bridge.</figcaption>
</div>

**That's the back door.**

We're respecting Redshift Serverless's 1:1 namespace/workgroup model instead of trying to work around it.

The second workgroup gets its own compute environment.

The producer keeps ownership of the original data.

And Datashare provides the controlled path between them.

---

# 5. What If We Decide to Move the Workload Later?

So far, we have solved the **runtime isolation** problem:

<div class="diagram">
  <svg viewBox="0 0 480 210" role="img" aria-labelledby="fig16-title fig16-desc">
    <title id="fig16-title">Namespace and workgroup pairs providing isolated compute environments</title>
    <desc id="fig16-desc">Two rows. Top row: existing_namespace box connected by an arrow to existing_workgroup at 24 RPU. Bottom row: new_app_namespace box connected by an arrow to new_app_workgroup at 32 RPU. Left labels read EXISTING and NEW / ISOLATED.</desc>
    <defs>
      <marker id="arrow-16" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <text x="115" y="18" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">EXISTING</text>
    <rect x="25" y="28" width="180" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="58" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">existing_namespace</text>
    <line x1="205" y1="53" x2="255" y2="53" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-16)"></line>
    <rect x="255" y="28" width="200" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="355" y="50" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">existing_workgroup</text>
    <text x="355" y="68" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">24 RPU</text>
    <text x="115" y="118" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">NEW / ISOLATED</text>
    <rect x="25" y="128" width="180" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="158" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">new_app_namespace</text>
    <line x1="205" y1="153" x2="255" y2="153" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-16)"></line>
    <rect x="255" y="128" width="200" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="355" y="150" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">new_app_workgroup</text>
    <text x="355" y="168" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">32 RPU</text>
  </svg>
  <figcaption><strong>Figure 16:</strong> Two isolated namespace/workgroup pairs — each with its own dedicated compute.</figcaption>
</div>


Datashare lets the second environment query data owned by the first.

But there is another very practical scenario worth covering.

What happens if, six months from now, we look at the workload and conclude:

> **“The existing workgroup has enough capacity. We don't need a dedicated workgroup for this application anymore.”**


For example, imagine that the the application application starts like this:


<div class="diagram">
  <svg viewBox="0 0 360 260" role="img" aria-labelledby="fig17-title fig17-desc">
    <title id="fig17-title">The initial dedicated application namespace and workgroup</title>
    <desc id="fig17-desc">new_app namespace points down to new_app workgroup, which points down to 8 RPU. Labelled INITIAL DEDICATED ENVIRONMENT at the top.</desc>
    <defs>
      <marker id="arrow-17" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <text x="180" y="18" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">INITIAL DEDICATED ENVIRONMENT</text>
    <rect x="80" y="30" width="200" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="60" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">new_app namespace</text>
    <line x1="180" y1="80" x2="180" y2="110" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-17)"></line>
    <rect x="80" y="113" width="200" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="143" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">new_app workgroup</text>
    <line x1="180" y1="163" x2="180" y2="193" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-17)"></line>
    <rect x="80" y="196" width="200" height="50" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="226" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">8 RPU</text>
  </svg>
  <figcaption><strong>Figure 17:</strong> The initial dedicated application namespace and workgroup.</figcaption>
</div>

Later, after measuring the workload, we decide that the existing environment can comfortably handle it:

```text
existing_namespace namespace
        │
        ▼
existing_namespace workgroup
        │
        ▼
       32 RPU
```

There is an important catch.

We cannot simply point `existing_namespace`'s workgroup at the `new_app` namespace.

The 1:1 relationship still applies.

So the question changes from:

> “Can we move the workgroup?”

to:

> **“How do we move the data from the `new_app` namespace into the `existing_namespace` namespace?”**

This is where Redshift gives us several options.

---

## Option 1 — Datashare: Access the Data Without Moving It

The first option is **Datashare**.

We have already seen this pattern:


<div class="diagram">
  <svg viewBox="0 0 480 200" role="img" aria-labelledby="fig19-title fig19-desc">
    <title id="fig19-title">Datashare providing controlled access from the existing namespace to data owned by the new application namespace</title>
    <desc id="fig19-desc">On the left, new_app namespace box labelled DATA OWNER. On the right, existing_namespace box labelled CONSUMER. A horizontal Datashare arrow points from left to right.</desc>
    <defs>
      <marker id="arrow-19" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <text x="115" y="18" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">DATA OWNER</text>
    <text x="365" y="18" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11" font-weight="700">CONSUMER</text>
    <rect x="25" y="28" width="180" height="80" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="115" y="58" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">new_app</text>
    <text x="115" y="78" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">namespace</text>
    <text x="115" y="96" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">application data</text>
    <rect x="275" y="28" width="180" height="80" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="365" y="58" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">existing_namespace</text>
    <text x="365" y="78" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">namespace</text>
    <text x="365" y="96" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">existing workloads</text>
    <line x1="205" y1="68" x2="275" y2="68" stroke="var(--color-text)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#arrow-19)"></line>
    <text x="240" y="58" text-anchor="middle" fill="var(--color-text)" font-size="11" font-weight="700">Datashare</text>
  </svg>
  <figcaption><strong>Figure 19:</strong> Datashare providing controlled access from the existing namespace to data owned by the new application namespace.</figcaption>
</div>

This is particularly useful if the immediate goal is to **test the the application workload on the existing workgroup** before physically moving the data.

The `existing_namespace` workgroup can query the shared the application data using its own compute.

That gives us a useful validation path:

<div class="diagram">
  <svg viewBox="0 0 360 260" role="img" aria-labelledby="fig18-title fig18-desc">
    <title id="fig18-title">Datashare as a validation bridge before committing to consolidation</title>
    <desc id="fig18-desc">new_app namespace points down via a Datashare arrow to existing_namespace, which points down to existing_namespace workgroup, which points down to Run the application queries.</desc>
    <defs>
      <marker id="arrow-18" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="80" y="15" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="43" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">new_app</text>
    <line x1="180" y1="61" x2="180" y2="86" stroke="var(--color-text)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#arrow-18)"></line>
    <text x="195" y="77" fill="var(--color-text)" font-size="11" font-weight="700">Datashare</text>
    <rect x="80" y="89" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="117" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">existing_namespace</text>
    <line x1="180" y1="135" x2="180" y2="160" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-18)"></line>
    <rect x="80" y="163" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="180" y="191" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">existing workgroup</text>
    <line x1="180" y1="209" x2="180" y2="234" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-18)"></line>
    <rect x="80" y="237" width="200" height="18" rx="4" fill="none" stroke="none"></rect>
    <text x="180" y="250" text-anchor="middle" fill="var(--color-text-secondary)" font-size="11">Run the application queries</text>
  </svg>
  <figcaption><strong>Figure 18:</strong> Datashare as a validation bridge — test the workload on the existing workgroup before physically moving any data.</figcaption>
</div>

### But Datashare does not migrate the data

This distinction is important.

Datashare means:

> **“Keep the data where it is and let another namespace query it.”**

It does **not** mean:

> **“Move the data into the other namespace.”**

The source `new_app` namespace continues to own the underlying data.

That means Datashare is useful for:

- Workload validation
- Performance testing
- Temporary cross-namespace access
- Avoiding an immediate data copy

But if the final goal is:

```text
new_app namespace
        │
        ▼
      gone
```

then Datashare alone is not enough.

The source namespace still needs to exist while it owns the shared data.

AWS documents Serverless data sharing here:

<a href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-datasharing.html" target="_blank" rel="noopener">Amazon Redshift Serverless data sharing</a>

There is also an important cost distinction: for data sharing, the **consumer pays the compute required to query the shared data**, while the producer continues to bear the underlying storage cost. For same-Region sharing, AWS does not charge cross-Region data-transfer fees because there is no cross-Region transfer. citeturn0search17

So Datashare can be an excellent **bridge**, but it should not be confused with a **migration mechanism**.

---

## Option 2 — UNLOAD → S3 → COPY: Move the Data

If the goal is to actually move the the application data into the existing `existing_namespace` namespace, the most straightforward approach is:

<div class="diagram">
  <svg viewBox="0 0 300 280" role="img" aria-labelledby="fig20-title fig20-desc">
    <title id="fig20-title">UNLOAD to S3 then COPY into the target namespace</title>
    <desc id="fig20-desc">new_app points down via UNLOAD to Amazon S3, which points down via COPY to existing_namespace.</desc>
    <defs>
      <marker id="arrow-20" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text)"></path>
      </marker>
    </defs>
    <rect x="50" y="15" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="150" y="43" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">new_app</text>
    <line x1="150" y1="61" x2="150" y2="96" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-20)"></line>
    <text x="165" y="82" fill="var(--color-text)" font-size="11" font-weight="700">UNLOAD</text>
    <rect x="50" y="99" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="150" y="127" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">Amazon S3</text>
    <line x1="150" y1="145" x2="150" y2="180" stroke="var(--color-text)" stroke-width="2" marker-end="url(#arrow-20)"></line>
    <text x="165" y="166" fill="var(--color-text)" font-size="11" font-weight="700">COPY</text>
    <rect x="50" y="183" width="200" height="46" rx="8" fill="var(--color-bg)" stroke="var(--color-text)" stroke-width="1.5"></rect>
    <text x="150" y="211" text-anchor="middle" fill="var(--color-text)" font-size="13" font-weight="700">existing_namespace</text>
  </svg>
  <figcaption><strong>Figure 20:</strong> The UNLOAD → S3 → COPY migration path — data physically moves from the source namespace to the target.</figcaption>
</div>

This is the approach we would generally recommend for the consolidation scenario.

### Step 1 — UNLOAD from the source namespace

From the `new_app` environment, we export the required data to Amazon S3.

For example:

```sql
UNLOAD ('SELECT * FROM new_app_schema.customers')
TO 's3://<migration-bucket>/rc-rosters/customers/'
FORMAT AS PARQUET;
```

We can control what gets exported using the `SELECT` statement.

That means we can migrate:

- Selected tables
- Selected columns
- Filtered data
- Transformed data, if required

Amazon Redshift writes the query results to one or more files in S3 and is designed to support parallel reloading of those files. citeturn0search5turn0search11

AWS reference:

<a href="https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html" target="_blank" rel="noopener">UNLOAD — Amazon Redshift SQL Reference</a>

---

### Step 2 — Create the target tables

Before loading the data, we create the required schema and table definitions in `existing_namespace`.

For example:

```sql
CREATE SCHEMA new_app_schema;

CREATE TABLE new_app_schema.customers
(
    customer_id   BIGINT,
    customer_name VARCHAR(200),
    risk_score    INTEGER
);
```

The target table can be designed to match the application's requirements rather than blindly reproducing every object from the source namespace.

---

### Step 3 — COPY the data into the target namespace

Once the files are in S3, we load them into `existing_namespace`:

```sql
COPY new_app_schema.customers
FROM 's3://<migration-bucket>/rc-rosters/customers/'
FORMAT AS PARQUET;
```

AWS reference:

<a href="https://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html" target="_blank" rel="noopener">COPY — Amazon Redshift SQL Reference</a>

The resulting architecture becomes:

```text
┌─────────────────────────────────────┐
│        existing_namespace           │
│                                     │
│  Existing tables                    │
│                                     │
│  new_app_schema                     │
│      ├── customers                  │
│      ├── rosters                    │
│      └── transactions               │
└──────────────────┬──────────────────┘
                   │
                   ▼
        existing_namespace workgroup
                 32 RPU
```

Now the the application workload is using the same namespace and workgroup as the existing applications.

### Why this is the recommended option

The biggest advantage is that this is an actual **data migration**, not just data access.

After successful validation:

```text
new_app data
      │
      │ UNLOAD
      ▼
     S3
      │
      │ COPY
      ▼
existing_namespace data
```

The source namespace can eventually be decommissioned.

It also gives us a controlled migration process:

```text
Export
   ↓
Validate files
   ↓
Create target tables
   ↓
Load
   ↓
Validate row counts
   ↓
Validate application queries
   ↓
Cut over application
   ↓
Decommission source
```

### The large-data-volume caveat

This approach is straightforward, but data volume matters.

For example:

```text
500 GB
  │
  ▼
UNLOAD → S3 → COPY
```

is very different operationally from:

```text
20 TB
  │
  ▼
UNLOAD → S3 → COPY
```

Large-volume migrations require planning around:

- UNLOAD duration
- COPY duration
- S3 storage during migration
- S3 request activity
- Source and target compute consumption
- Impact on existing workloads
- Migration window
- Data changing while the migration is in progress
- Validation
- Final cutover
- Whether multiple migration passes are required

The issue is not that Redshift cannot move large datasets using UNLOAD and COPY.

The issue is that **large datasets turn a simple copy into a migration project**.

For very large the application datasets, we should therefore assess whether the migration window, source-change rate, target workload impact, and validation requirements make this approach practical.

Where network isolation is important, Redshift supports VPC endpoints and enhanced VPC routing so COPY and UNLOAD traffic between a workgroup and S3 can remain within the VPC.

AWS reference:

<a href="https://docs.aws.amazon.com/redshift/latest/mgmt/enhanced-vpc-working-with-endpoints.html" target="_blank" rel="noopener">Controlling database traffic with VPC endpoints</a>

---

## Option 3 — Snapshot / Table Restore

The third option is **snapshot/table restore**.

Redshift Serverless supports restoring a specific table from a snapshot or recovery point into a target database, schema, and new table name.

Conceptually:

```text
new_app namespace
        │
        │ Snapshot
        ▼
   Recovery point
        │
        │ Restore table
        ▼
existing_namespace namespace
```

For example, we could restore a source table into the existing namespace rather than restoring an entire database.

AWS documents this capability here:

<a href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-table-restore.html" target="_blank" rel="noopener">Restoring a table — Amazon Redshift</a>

The important detail is that **table restore is not the same thing as restoring the entire namespace**.

AWS states that a specific table can be restored by specifying the source snapshot/recovery point, source database/schema/table, and target database/schema/table. The restored table gets the source table's column and table attributes, but dependencies such as views and permissions are not automatically applied. citeturn0search0

That makes table restore potentially useful for selected tables.

However, there are practical limitations.

For example:

- Only one table can be restored at a time.
- Table dependencies need to be considered separately.
- Views and permissions need to be handled separately.
- The restored table represents the state captured by the snapshot/recovery point.
- It does not automatically solve the application cutover problem.

AWS also supports restoring an entire snapshot to a Serverless namespace, but there is a major difference:

> **Restoring a snapshot to a Serverless namespace replaces the current database with the database in the snapshot.**

That is obviously a very different operation from selectively adding the application tables into an already-active `existing_namespace` namespace. citeturn0search1

For that reason, full namespace snapshot restore is not a good fit for this consolidation scenario.

### Recommendation for this option

Snapshot/table restore is a valid Redshift capability, but for our specific scenario it is **not the preferred migration approach**.

The target namespace already contains existing workloads and data.

For a controlled application-data migration, UNLOAD → S3 → COPY gives us more explicit control over what gets moved, how it gets loaded, and how the cutover is managed.

---

## Comparing the Migration Options

Now the three options can be viewed side by side:

| Option | What it does | Data physically moved? | Source namespace still needed? | Best use |
|:---|:---|:---|:---|:---|
| **Datashare** | Provides live cross-namespace access | No | Yes | Validation, temporary access, workload testing |
| **UNLOAD → S3 → COPY** | Exports and loads selected data | Yes | No, after successful migration | **Recommended for consolidation** |
| **Snapshot / Table Restore** | Restores table data from a snapshot/recovery point | Yes | No, after successful migration | Selected table restoration |

The easiest way to remember the difference:

```text
Datashare
─────────
"Let us query the data where it already lives."


UNLOAD → S3 → COPY
──────────────────
"Move the data to the new home."


Snapshot / Table Restore
───────────────────────
"Restore selected data from a point-in-time backup."
```

---

# Recap: The Two Sentences That Matter

If we remember nothing else from this post, remember these two sentences:

1. **A workgroup and a namespace are locked into a strict 1:1 relationship** — if we want a new, isolated workgroup, we need a new, isolated namespace to go with it.
2. **Datashare exists precisely to undo the pain of that isolation** — it lets a new namespace query another namespace's tables live, using its own compute, without copying any data.

Namespace and workgroup can only ever be exclusive. But thanks to Datashare, "exclusive" doesn't have to mean "isolated from everyone else's data forever." It just means everyone brings their own compute to the table.

And if the workload eventually needs to move into an existing namespace, we have a second path:

```text
Validate with Datashare
          │
          ▼
If consolidation makes sense
          │
          ▼
UNLOAD → S3 → COPY
          │
          ▼
Move the data
          │
          ▼
Run on the existing workgroup
```

That is the important distinction:

> **Datashare is the bridge for accessing data across namespace boundaries. UNLOAD → S3 → COPY is the bridge for actually moving data across those boundaries.**

If we remember nothing else from this post, remember these two sentences:

1.  **A workgroup and a namespace are locked into a strict 1:1 relationship** — if we want a new, isolated workgroup, we need a new, isolated namespace to go with it.
2.  **Datashare exists precisely to undo the pain of that isolation** — it lets a new namespace query another namespace's tables live, using its own compute, without copying any data.

Namespace and workgroup can only ever be exclusive. But thanks to Datashare, "exclusive" doesn't have to mean "isolated from everyone else's data forever." It just means everyone brings their own compute to the table.

---

# References

1. <a href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-workgroup-namespace.html" target="_blank" rel="noopener">Workgroups and namespaces — Amazon Redshift</a>
2. <a href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-datasharing.html" target="_blank" rel="noopener">Data sharing in Amazon Redshift Serverless</a>
3. <a href="https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html" target="_blank" rel="noopener">UNLOAD — Amazon Redshift SQL Reference</a>
4. <a href="https://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html" target="_blank" rel="noopener">COPY — Amazon Redshift SQL Reference</a>
5. <a href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-table-restore.html" target="_blank" rel="noopener">Restoring a table — Amazon Redshift</a>
6. <a href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-snapshot-restore.html" target="_blank" rel="noopener">Restoring a snapshot — Amazon Redshift</a>
7. <a href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-snapshots-recovery-points.html" target="_blank" rel="noopener">Snapshots and recovery points — Amazon Redshift</a>
8. <a href="https://docs.aws.amazon.com/redshift/latest/mgmt/enhanced-vpc-working-with-endpoints.html" target="_blank" rel="noopener">Controlling database traffic with VPC endpoints — Amazon Redshift</a>