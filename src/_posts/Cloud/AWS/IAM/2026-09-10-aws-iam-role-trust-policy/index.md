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
coverImage: ./images/cover-image.png
# imageCredits: AI-generated image.
featured: false
draft: false
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

Here's a real **trust policy** — the kind we'd see on a role meant for EC2:

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

Compare that to a **permission policy** attached to the same role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::my-app-bucket",
        "arn:aws:s3:::my-app-bucket/*"
      ]
    }
  ]
}
```

Here, the two permissions allow the role to:

- `s3:ListBucket` → List the contents/files in the bucket (requires the bucket ARN without `/*` because `s3:ListBucket` operates at the bucket level)
- `s3:GetObject` → Read any file from the bucket (requires the object ARN with `/*` because `s3:GetObject` operates at the object level)

Together, these permissions mean the role can both browse the bucket's contents AND read the actual data from any file.

Here there's **no `Principal` field at all** — because by the time this policy is checked, AWS already knows who we are (we've already borrowed the keycard). This policy only answers **"what we can do now?"**.

**Side-by-side, the difference becomes obvious:**

| | Trust Policy | Permission Policy |
|---|---|---|
| Lives in | "Trust relationships" tab | "Permissions" tab |
| Answers | Who can assume this role? | What can this role do? |
| Key field | `Principal` + `Action: sts:AssumeRole` | `Action` + `Resource` |
| Involves | `sts:AssumeRole` only | Service actions like `s3:ListBucket`, `s3:GetObject`, etc. |
| Checked | Before the role is assumed | After the role is assumed, on every action |

---

# Step 4: Why Is Trust Policy Mandatory?

Here's the part most people miss: **we cannot create an IAM Role without a trust policy.** AWS forces us to define one the moment we create a role — there's no skipping it.

**However, there's a catch:** In many workflows, we don't have to write it ourselves. When we create a role through the AWS console, CLI, or a managed service like Lambda or EC2, AWS **automatically** creates the trust policy for us behind the scenes. That's why we might have created dozens of roles without ever opening the "Trust relationships" tab — the policy was already there, we just didn't see it.

## Why does AWS require it at all?

Go back to the hotel analogy. A hotel room without a guest list would mean **anyone off the street could walk in, sleep in the bed, and use the minibar.** AWS can't allow that. Since a role has no fixed owner (unlike an IAM User, which is a permanent identity tied to one person), AWS *must* have a gatekeeping mechanism to control who's allowed to borrow that identity.

## Wait, Why Don't IAM Users Need a Trust Policy?

**IAM Users don't need trust policies** because an IAM User is a primary identity authenticated directly with its own permanent credentials. We don't "assume" a user — We log into it. 

An IAM Role, however, is an unattached identity designed to be borrowed. Because anyone could potentially try to use a role, AWS needs a gatekeeping mechanism to control who is allowed to borrow it. Trust policies exist solely to define those rules for temporary identity assumption.

For example:

- **IAM User:** We log into the AWS Console using our own username `alice` and password. We don't ask permission to "be" Alice — we authenticate directly as Alice.

- **IAM Role:** An EC2 server needs to read from an S3 bucket. The server isn't a human with a password, so it asks AWS: *"Can I borrow the `S3-Reader-Role`?"* AWS checks the role's trust policy to verify EC2 is on the guest list before issuing temporary keys.

---

# Step 5: How the Two Policies Work Together — Step by Step

Let's trace a real request end-to-end. Suppose an application running on an EC2 instance named `TestEC2Instance` needs to read a file from an S3 bucket.

Before launching the instance, we attach a specific role to it — `AppS3ReaderRole` (ARN: `arn:aws:iam::123456789012:role/AppS3ReaderRole`).

## Step 1: Borrowing the Identity (Trust Policy Check)

*Handled by AWS Security Token Service (STS)*

- **The Request:** The application (or AWS SDK) running on `TestEC2Instance` sends an `sts:AssumeRole` request to AWS STS, specifying the target role: `arn:aws:iam::123456789012:role/AppS3ReaderRole`.

- **The Evaluation:** AWS STS opens **AppS3ReaderRole's Trust Policy** and asks: *"Is the requesting service (`ec2.amazonaws.com`) listed on the guest list (Principal)?"*

- **The Result:** If **YES**, AWS STS issues short-lived temporary security credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`) to `TestEC2Instance` via its local Instance Metadata Service (IMDS).

## Step 2: Accessing the Target Resource (Permission Policy Check)

*Handled by Amazon S3*

- **The Request:** The application makes an `s3:GetObject` API request to S3, signing the HTTP request using the temporary credentials acquired in Step 1.

- **The Evaluation:** Amazon S3 inspects the request signature, identifies that `TestEC2Instance` is acting as `AppS3ReaderRole`, and checks **AppS3ReaderRole's Permission Policy**: *"Does this role have `s3:GetObject` permission on this S3 bucket?"*

- **The Result:** If **YES**, S3 authorizes the request and streams the requested file back to `TestEC2Instance`.

{% include "postImage.html" src: "./images/aws-iam-role-assumption-and-s3-access-flow.png", alt: "Two-step flow: EC2 assumes AppS3ReaderRole via STS (trust policy check), then reads from S3 (permission policy check)", description: "<b>Figure 1:</b> Using an IAM role from an EC2 instance: Step 1 — EC2 requests the role via STS, which checks the trust policy and issues temporary keys. Step 2 — the app uses those keys to call S3, which checks the permission policy before returning the file." %}

## Key Summary of Differences

Two completely separate checks, driven by two distinct JSON documents attached to the target role, evaluated at two different moments:

1. **Trust policy is checked once** — at the moment of assuming the role (`sts:AssumeRole`).
2. **Permission policy is checked every single time** an action is attempted, for as long as the temporary credentials are valid.

If either check fails, the whole thing fails.

Here's a side-by-side comparison of the two checks:

| Feature | Trust Policy Check (Step 1) | Permission Policy Check (Step 2) |
| :--- | :--- | :--- |
| **Question Answered** | *"Who is allowed to borrow this role's identity?"* | *"What is this role allowed to do once borrowed?"* |
| **AWS Service Responsible** | **AWS STS** (Security Token Service) | **Target Service** (Amazon S3, DynamoDB, etc.) |
| **Key JSON Block Checked** | `"Principal": { "Service": "ec2.amazonaws.com" }` | `"Action": ["s3:GetObject"]`, `"Resource": [...]` |
| **Evaluation Frequency** | Evaluated **once** when acquiring/refreshing temporary keys. | Evaluated **on every single API call** made using those keys. |
| **Failure Result** | `AccessDenied` on `sts:AssumeRole` (Credentials not issued). | `AccessDenied` on `s3:GetObject` (Operation blocked). |

---

# Step 6: The Debugging Shortcut

Once we internalize this split, debugging IAM issues becomes much faster:

- **Error mentions `sts:AssumeRole` / "not authorized to assume role"** → Our **trust policy** is the problem. Wrong principal, wrong account ID, missing condition, etc.
- **Error mentions a specific service action** like `s3:GetObject`, `dynamodb:Query`, `lambda:InvokeFunction` *after* the role was successfully assumed → Our **permission policy** is the problem. The role got the key to the room, but that item isn't in the room.

This one distinction resolves the vast majority of "why isn't this working" IAM tickets.

---

# Step 7: Real-World Examples Where Trust Policy Actually Matters

### Example A — Service Roles (most common)
Every time a service like Lambda, ECS, or Glue needs to act on our behalf, its trust policy must explicitly name that service:

```json
"Principal": { "Service": "lambda.amazonaws.com" }
```

Without this, Lambda literally cannot assume the role — even if the permission policy is perfectly written.

### Example B — Cross-Account Access
Say Account A (111111111111) wants to let a role in Account B (222222222222) access its resources:

```json
"Principal": { "AWS": "arn:aws:iam::222222222222:root" }
```

This is the backbone of how AWS Organizations, cross-account CI/CD pipelines, and third-party SaaS integrations (like monitoring tools) securely access our account without sharing long-term credentials.

### Example C — GitHub Actions via OIDC (increasingly common)
Modern CI/CD pipelines avoid storing AWS access keys as GitHub secrets entirely. Instead, the trust policy trusts GitHub's OIDC identity provider, often scoped to a specific repo and branch:

```json
"Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:sub": "repo:my-org/my-repo:ref:refs/heads/main"
  }
}
```

This is trust policy doing something permission policy simply *cannot* do — restricting **who** gets in based on identity federation, not just what actions are allowed.

---

# Step 8: Cheat Sheet — Keep This in Your Back Pocket

| Question | Answer |
|---|---|
| Is trust policy optional? | **No — mandatory** for every IAM Role |
| What does it control? | **Who** can assume the role |
| What does permission policy control? | **What** the role can do once assumed |
| Which is checked first? | Trust policy (at `AssumeRole` time) |
| Which is checked more often? | Permission policy (on every action) |
| Does trust policy mention S3/EC2/etc.? | No — only identities (`Principal`) |
| Does permission policy mention `Principal`? | No — only actions and resources |
| Do IAM Users have trust policies? | No — only roles do, since only roles are "assumed" |

---

# Wrapping Up

The reason trust policy feels confusing at first is that AWS's console groups it separately from "Permissions" — as if it's a lesser, optional detail. In reality, it's the **front door** to the role, while the permission policy is everything **inside**.

Once we see an IAM Role as *two questions* — "who's allowed in?" and "what can they do once they're in?" — instead of one big block of "permissions," the entire access model across EC2, Lambda, cross-account setups, and OIDC-based CI/CD suddenly makes a lot more sense.

Next time we open the "Trust relationships" tab, we'll know exactly what we're looking at — and exactly why it has to be there.