---
title: "AWS IAM Roles Demystified: The Trust Policy Everyone Ignores Until Nothing Works"
description: >-
  You attached the policy. You clicked Save. You were so proud. And yet AWS still said no.
  Turns out there are two halves to an IAM Role — and most of us only read one of them.
  Meet the trust policy: the bouncer at the door that nobody notices until it starts
  turning everyone away.
keywords:
  - aws-iam
  - iam-role
  - trust-policy
  - iam-trust-relationship
  - sts-assumerole
  - cross-account-iam
  - iam-principal
  - aws-security
  - iam-permission-policy
  - aws-sts
tags:
  - aws
  - iam
  - iam-roles
  - trust-policy
  - aws-security
  - cloud
# coverImage: ./images/cover-image.png
# imageCredits: AI-generated image.
featured: false
draft: true
---

{% include "toc.md" %}

If you've worked with AWS for a while, there's a good chance you've created an IAM Role. IAM Role is about attaching **permissions** — attaching AWS managed policies or writing your own customer managed policies or both to say "this role can read from S3" or "this role can launch EC2 instances."

But if you've ever opened an IAM Role in the AWS Console and clicked the **"Trust relationships"** tab, you've probably seen a strange-looking JSON block and thought — *"okay, but what is this actually for?"*

That's exactly what this post is about. By the end, we'll understand:

- What a trust policy is, in plain English
- Why it's **mandatory**, not optional
- How it works *alongside* the permission policy — not instead of it
- Real examples so the concept sticks

Let's build this up one step at a time.

---

# Step 1: Quick Recap — What Is an IAM Role?

Before we dive into trust policies, let's first make sure we understand what an IAM Role actually is.

An IAM Role is an **identity in AWS with a set of permissions**. In that sense, it is similar to an IAM User. The important difference is that a role is **not meant to be permanently used by one person or application**.

Instead, a role is designed to be **temporarily assumed** by someone or something that needs to perform certain actions in AWS.

That "someone or something" could be:

- A person
- An AWS service such as EC2 or Lambda
- An application
- A user or role from another AWS account
- A federated identity, such as a user coming through an identity provider

For example, imagine we create a role called:

```text
S3ReadOnlyRole
```

We can attach permissions to this role that say:

```text
This role can:
    ├── List objects in S3
    └── Read objects from S3
```

But simply creating the role and giving it permissions doesn't mean everyone can automatically use it.

Someone first needs to be **allowed to assume the role**.

And this is where things start getting interesting.

## Understanding "Assuming a Role"

So, what does **"assume a role"** actually mean?

Think of it like **borrowing a visitor badge at a company's security desk**.

Imagine you arrive at an office building.

You don't normally have access to certain restricted areas, but your host has arranged a temporary visitor badge for you.

You go to the security desk and say:

> "I'm here to visit the engineering team."

The security desk checks whether you're actually allowed to receive that badge.

If everything checks out, they hand you a temporary badge.

You don't own the badge.

You're simply **using it for a limited period of time**.

After the badge expires or is returned, you no longer have access to those areas.

An IAM Role works in a very similar way:

```text
              You / Application / AWS Service
                          │
                          │
                   "Can I use this role?"
                          │
                          ▼
                    ┌───────────┐
                    │ IAM Role  │
                    └─────┬─────┘
                          │
                  If you're allowed
                          │
                          ▼
              Temporary credentials
                          │
                          ▼
                  Access AWS resources
```

When a principal successfully assumes an IAM Role, AWS Security Token Service (STS) provides **temporary security credentials** that can be used to make AWS API calls with the role's permissions.

So, when we say:

> **"EC2 assumes an IAM Role"**

we essentially mean:

> **"EC2 is allowed to use this role and receives temporary credentials that let it perform the actions permitted by that role."**

The role itself continues to exist. What's temporary is the **session that is using the role**.

## And This Is Exactly Why We Need a Trust Policy

Now we have reached the important part.

If a role is meant to be **assumed by someone or something**, AWS needs to answer one very important question:

> **"Who do I trust to assume this role?"**

That's where the **Trust Policy** comes in.

Think back to our visitor badge.

Before the security desk hands over the badge, it needs to check:

```text
"Is this person actually allowed
 to receive this badge?"
```

Similarly, before AWS allows someone to assume a role, it checks the role's **trust policy**.

The trust policy essentially tells AWS:

> **"These are the principals I trust to assume this role."**

For example:

```text
                    IAM Role
                       │
                       │
                Trust Policy
                       │
                       ▼
              "I trust EC2"
                       │
                       ▼
              EC2 can assume role
                       │
                       ▼
             Temporary credentials
```

And this is the key idea we'll carry throughout the rest of this article:

> **An IAM Role has two important sides:**
>
> **Trust Policy → Who can assume the role?**
>
> **Permission Policy → What can the role do?**

We'll now focus on the first question — **the Trust Policy** — and understand why it is such an important part of every IAM Role.

---

# Step 2: The One Analogy That Makes Everything Click

Think of an IAM Role as a **keycard** that unlocks specific doors in a hotel.

```
            ┌─────────────────────────────────────┐
            │       HOTEL KEYCARD (Role)          │
            │  "This card grants access to:"      │
            │     - 3rd floor meeting rooms       │
            │     - The business center printer   │
            │     - The rooftop lounge            │
            └─────────────────────────────────────┘
              ▲                        ▲
              │                        │
    ┌─────────┴─────────┐   ┌──────────┴───────────┐
    │   FRONT DESK      │   │   THE DOORS          │
    │  "Who can borrow  │   │  "What does this     │
    │   this keycard?"  │   │   card actually      │
    │                   │   │   unlock?"           │
    │   = TRUST POLICY  │   │   = PERMISSION POLICY│
    └───────────────────┘   └──────────────────────┘
```

- **Trust Policy** = the front desk's guest list. It decides **who is allowed to borrow this keycard** (i.e., who can assume this role).
- **Permission Policy** = the **doors** this keycard can unlock (i.e., which AWS actions/resources this role allows).

**Critical distinction:** We don't become the keycard. We don't *live inside* it. We just **borrow it for a while**, use it to unlock what we need, and then it expires (we return it).

The keycard doesn't tell us which doors it opens. And knowing which doors it opens is useless if we can't get the card!

Simply put:

- **Trust** = we get the card.
- **Permissions** = what the card opens.

They're separate. But we need both.

**Another Anology:**

- An **IAM Role** is like a **VIP wristband** at a music festival. 
- The **trust policy** is the ticket booth that decides **who gets a wristband**. 
- The **permission policy** is the list of **stages/backstage areas** that wristband can access. 

We don't become the wristband—we just wear it temporarily and it expires at midnight.

---

# Step 3: What Does a Trust Policy Actually Look Like?

Here's a real trust policy — the kind we'd see on a role meant for EC2:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Let's break this into three plain-English pieces:

| JSON Field | Plain English Meaning |
|---|---|
| `"Effect": "Allow"` | Yes, allow this — (could also be `"Deny"`) |
| `"Principal": {"Service": "ec2.amazonaws.com"}` | **Who** is allowed to knock on the door — in this case, the EC2 service itself |
| `"Action": "sts:AssumeRole"` | **What they're allowed to do** — specifically, **borrow this role's identity** via AWS's Security Token Service (STS) |

> **Note:** In trust policies, "Action" is almost always "sts:AssumeRole". It's the only action that matters here — because the trust policy's only job is to decide who can assume the role, not what they can do afterward.

Notice something important: **there is no `Resource` field about S3 buckets or EC2 instances here.** That's because a trust policy has nothing to do with AWS resources like buckets or databases — it's purely about **identity**: who gets to borrow this role.

Compare that to a permission policy attached to the same role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-app-bucket/*"
    }
  ]
}
```

Here there's **no `Principal` field at all** — because by the time this policy is checked, AWS already knows who we are (we've already borrowed the keycard). This policy only answers **"what we can do now?"**.

**Side-by-side, the difference becomes obvious:**

| | Trust Policy | Permission Policy |
|---|---|---|
| Lives in | "Trust relationships" tab | "Permissions" tab |
| Answers | Who can assume this role? | What can this role do? |
| Key field | `Principal` + `Action: sts:AssumeRole` | `Action` + `Resource` |
| Involves | `sts:AssumeRole` only | Service actions like `s3:GetObject`, `ec2:RunInstances`, etc. |
| Checked | Before the role is assumed | After the role is assumed, on every action |

---

# Step 4: Why Is Trust Policy Mandatory?

TODO