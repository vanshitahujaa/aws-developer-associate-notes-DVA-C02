# AWS Certified Developer Associate (DVA-C02) — Study Notes

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvanshitahujaa%2Faws-developer-associate-notes-DVA-C02&root-directory=dva-notes&project-name=dva-c02-notes&repository-name=dva-c02-notes)

A topic-by-topic study app for the **AWS Certified Developer — Associate (DVA-C02)** exam, built as a React + Tailwind site optimized for reading on dark backgrounds.

26 topics across 7 study phases — every page is structured the same way so revision is fast:

1. **Concept block** — what you actually need to know.
2. **Key numbers** — the limits AWS bakes into answer choices.
3. **How it's asked** — the phrasings the exam uses, mapped to the right service.
4. **Most-likely root cause** — symptom → >50% reason (debug by probability).
5. **Case studies** — scenario / answer / why.
6. **Practice questions** — interactive: click → reveal answer → see explanation.
7. **Gotchas recap** — one-line traps to remember.

Plus quick-reference cheat sheets: keyword → service map, confusable pairs, numbers & limits, distractor traps, MOST/LEAST qualifier interpretations.

## Run it

```bash
cd dva-notes
npm install
npm run dev    # → http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Deploy

This is a sub-folder app (`dva-notes/`) inside the repo. On Vercel:

1. Go to [vercel.com/new](https://vercel.com/new) and import this repo.
2. Set **Root Directory** to `dva-notes`.
3. Framework auto-detects as **Vite** — accept the defaults (`npm run build` → `dist`).
4. Click **Deploy**.

The `dva-notes/vercel.json` provides the SPA fallback rewrite and immutable cache headers on `/assets/*`, so subsequent deploys are zero-config.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 3 (dark theme, no `backdrop-blur` — solid panels for crisp text)
- Hash-routed (no router dep): `#iam`, `#ref:keywords`, etc.

## Coverage

| Phase | Topics |
|---|---|
| 1 · Foundations | IAM · S3 · DynamoDB (keys, capacity, consistency) |
| 2 · Compute & Serverless | DynamoDB indexes/streams/DAX · Lambda execution model · Versions/aliases/concurrency/VPC · Event sources/destinations/DLQs |
| 3 · Integration & APIs | API Gateway · SQS/SNS/EventBridge · Step Functions · Kinesis |
| 4 · Security | Cognito · KMS · Secrets Manager vs Parameter Store · ACM/STS/IAM advanced |
| 5 · Deployment & CI/CD | CloudFormation + SAM · CDK + CodeArtifact · CodePipeline suite · Deployment strategies · Elastic Beanstalk |
| 6 · Containers, Caching, Edge | ECS/Fargate/ECR/Copilot · ElastiCache/DAX/caching patterns · CloudFront |
| 7 · Observability | CloudWatch (logs, metrics, alarms, EventBridge integration) · X-Ray (trace propagation) · Troubleshooting patterns |

## Exam meta

| | |
|---|---|
| Code | DVA-C02 |
| Duration | 130 minutes |
| Questions | 65 (50 scored + 15 unscored) |
| Passing score | 720 / 1000 (scaled, compensatory) |
| Cost | $150 USD |
| Validity | 3 years |

## Notes on accuracy

These notes are based on the official AWS Exam Guide (v1.3) plus real-exam reports. AWS services evolve — re-validate anything that sounds outdated before quoting it on the exam. If you spot something stale or wrong, open an issue.
