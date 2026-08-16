---
title: Newsletter
description: Subscribe to get new posts from Senthil Nayagan by email.
permalink: /newsletter/
---

<p class="page__lede">If you like my posts and want to stay updated, subscribe below and I'll email you whenever I publish something new. No spam, unsubscribe anytime.</p>

{% if site.newsletterUrl != "" %}
<p><a class="button" href="{{ site.newsletterUrl }}" target="_blank" rel="noopener">Subscribe to the newsletter</a></p>
{% else %}
<p>Signup isn't quite wired up yet — check back soon, or <a href="/feed.xml">subscribe via RSS</a> in the meantime.</p>
{% endif %}
