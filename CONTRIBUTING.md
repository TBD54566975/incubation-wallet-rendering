# Contribution Guide

There are many ways to be an open source contributor, and we're here to help you on your way! You may:

- Propose ideas in our
  [discussion forums](https://forums.tbd.website)
- Raise an issue or feature request in our [issue tracker](https://github.com/TBD54566975/incubation-wallet-rendering/issues)
- Help another contributor with one of their questions, or a code review
- Suggest improvements to our Getting Started documentation by supplying a Pull Request
- Evangelize our work together in conferences, podcasts, and social media spaces.

This guide is for you.

## Development Prerequisites

TODO: This section will be expanded later.

## Communications

### Issues

Anyone from the community is welcome (and encouraged!) to raise issues via
[GitHub Issues](https://github.com/TBD54566975/incubation-wallet-rendering/issues)

### Discussions

Design discussions and proposals take place on our [discussion forums](https://forums.tbd.website).

We advocate an asynchronous, written debate model - so write up your thoughts and invite the community to join in!

### Continuous Integration

TODO: This will be improved added later

## Contribution

We review contributions to the codebase via GitHub's Pull Request mechanism. We have
the following guidelines to ease your experience and help our leads respond quickly
to your valuable work:

- Start by proposing a change either in Issues (most appropriate for small
  change requests or bug fixes) or in Discussions (most appropriate for design
  and architecture considerations, proposing a new feature, or where you'd
  like insight and feedback)
- Cultivate consensus around your ideas; the project leads will help you
  pre-flight how beneficial the proposal might be to the project. Developing early
  buy-in will help others understand what you're looking to do, and give you a
  greater chance of your contributions making it into the codebase! No one wants to
  see work done in an area that's unlikely to be incorporated into the codebase.
- Fork the repo into your own namespace/remote
- Work in a dedicated feature branch. Atlassian wrote a great
  [description of this workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- When you're ready to offer your work to the project, first:
- Squash your commits into a single one (or an appropriate small number of commits), and
  rebase atop the upstream `main` branch. This will limit the potential for merge
  conflicts during review, and helps keep the audit trail clean. A good writeup for
  how this is done is
  [here](https://medium.com/@slamflipstrom/a-beginners-guide-to-squashing-commits-with-git-rebase-8185cf6e62ec), and if you're
  having trouble - feel free to ask a member or the community for help or leave the commits as-is, and flag that you'd like
  rebasing assistance in your PR! We're here to support you.
- Open a PR in the project to bring in the code from your feature branch.
- The maintainers noted in the `CODEOWNERS` file will review your PR and optionally
  open a discussion about its contents before moving forward.
- Remain responsive to follow-up questions, be open to making requested changes, and...
  You're a contributor!
- And remember to respect everyone in our global development community. Guidelines
  are established in our `CODE_OF_CONDUCT.md`.

### PR and Branch Strategy

- **Naming:** In general, we prefer the following branch names:
  `<type>/<initials>-<desc>`. i.e `feat/ask-add-button` The following types are
  available:
  - bug : this PR is related to a bug fix
  - feat : this is a feature related PR
  - doc : this is a documentation related PR
  - ref : this is a reference update
- **Pushes directly to main are not allowed:** We do not allow pushes directly
  to main.
- **Forking:** We'd prefer you fork the repo to make adjustments. As the repo
  matures, expect we will disallow branches directly on the repo.
- **Limit Scope of PR:** PR's should generally be small and constrained to a
  very limited scope
- **History:** Try to maintain a clean history if possible. It makes it easier
  to review.
- **Rebase vs. Merge:** We generally prefer rebasing to merging, as long as the
  history is clean.

### Raising Issues

To raise an issue, you may use Github to do so. Please in doing so, answer the
following questions:

- Features
  - what -- what feature do you want
  - why -- why do you want the feature
  - stakeholders? -- aside from you, who else wants the feature
  - considerations/constraints -- any specific constraints with a solution that you need
- Bugs
  - what -- what is the bug
  - why -- why do you need this fixed
  - replication -- how do you replicate the bug
  - environment -- please give details on what system you found the bug on
  - logs/metrics -- please provide logs and/or metrics of the bug as best as possible

### Style Guides

- Files generally should have a descriptor for them as a set of comments. It
  should outline the intent of the file, scope, and some useful information for
  someone to understand why the file exists. Feel free to add some character
  here.
- Methods generally should have less comments and generally be used to clarify
  decisions about implementation. I.e we did this vs. that b/c it was faster to
  implement.
