import type { Topic } from "./types";

export const phase1Topics: Topic[] = [
  {
    id: "iam",
    number: 1,
    phase: 1,
    title: "IAM — Deep Dive",
    domain: "Security",
    weight: "Foundation for almost every DVA-C02 question",
    blurb:
      "Identity & Access Management is the spine of AWS. Roles, policies, STS, and least privilege underpin Domains 1, 2 and 3. If you can model who-can-do-what-on-which-resource, half the security questions write themselves.",
    sections: [
      {
        heading: "Core entities",
        bullets: [
          "**User** — a long-lived identity for a human or a legacy system. Has either a console password or access keys (or both). Avoid for code.",
          "**Group** — a container of users; policies attached to the group apply to all members. Cannot contain roles or other groups.",
          "**Role** — a set of permissions assumable by trusted principals (services, users, accounts, federated identities). Returns *temporary* credentials via STS. The right answer for code/EC2/Lambda/on-prem.",
          "**Policy** — a JSON document declaring Allow/Deny on Action/Resource/Condition. Identity-based (attached to user/group/role) or resource-based (attached to S3 bucket, KMS key, SQS, SNS, Lambda, etc).",
          "**Principal** — the entity making a request (user, role-session, AWS service, federated identity).",
        ],
      },
      {
        heading: "Policy evaluation logic (memorize this order)",
        bullets: [
          "Implicit DENY is the default.",
          "Explicit DENY always wins — anywhere in any policy.",
          "Explicit ALLOW grants access (identity OR resource policy can grant).",
          "Cross-account access requires BOTH sides: identity policy in account A AND resource policy in account B (or a role trust policy + assume).",
          "Permissions boundary, SCP (org), session policy = upper limits; they restrict, they never grant.",
        ],
      },
      {
        heading: "Policy JSON structure",
        code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowReadOnSpecificBucket",
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::reports-bucket",
      "arn:aws:s3:::reports-bucket/*"
    ],
    "Condition": {
      "StringEquals": { "aws:RequestedRegion": "us-east-1" },
      "IpAddress": { "aws:SourceIp": "203.0.113.0/24" }
    }
  }]
}`,
      },
      {
        heading: "Role trust policy (who can assume me)",
        code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}`,
      },
      {
        heading: "Common role patterns",
        bullets: [
          "**EC2 Instance Profile** — wraps a role; EC2 metadata service hands out temp creds to apps on the instance. No keys in code.",
          "**Lambda Execution Role** — Lambda assumes it on cold start. ALL policies for Lambda go here (not on the function).",
          "**ECS Task Role vs Task Execution Role** — Task role = what your app code can do (e.g., access S3). Task execution role = what ECS needs to pull images, send logs.",
          "**Cross-account role** — Account A defines a role with Account B in the trust policy; B calls `sts:AssumeRole` to get temp creds in A.",
          "**IAM Roles Anywhere** — on-prem servers get temp creds via X.509 certs from a trust anchor (Private CA). Kills the 'access keys on a server' antipattern.",
        ],
      },
      {
        heading: "STS — Security Token Service",
        bullets: [
          "Issues short-lived credentials (default 1h, can be 15min–12h).",
          "`AssumeRole` — cross-account or privilege-elevation within account.",
          "`AssumeRoleWithWebIdentity` — federated identities (Cognito, Google, Facebook, OIDC).",
          "`AssumeRoleWithSAML` — SAML 2.0 federation (corporate ADFS, Okta SAML).",
          "`GetSessionToken` — MFA-protected creds for an IAM user.",
          "`GetFederationToken` — single user, broker pattern (rare on exam).",
        ],
      },
      {
        heading: "Useful condition keys (high exam value)",
        bullets: [
          "`aws:SourceIp`, `aws:VpcSourceIp` — restrict by network.",
          "`aws:MultiFactorAuthPresent`, `aws:MultiFactorAuthAge` — require MFA.",
          "`aws:PrincipalOrgID` — restrict to your AWS Organization.",
          "`aws:SourceArn`, `aws:SourceAccount` — service-confused-deputy prevention (used on S3→Lambda, SNS→SQS).",
          "`s3:prefix`, `s3:x-amz-server-side-encryption` — S3-specific.",
          "`aws:RequestedRegion`, `aws:TagKeys`, `aws:RequestTag/<key>` — tagging-based access.",
        ],
      },
      {
        heading: "Policy types you must distinguish",
        table: {
          headers: ["Type", "What it does", "When to pick"],
          rows: [
            ["AWS-managed", "AWS-maintained, broad", "Quick start, generic roles (e.g., AWSLambdaBasicExecutionRole)"],
            ["Customer-managed", "You write, you version, you reuse", "Most production cases — least privilege"],
            ["Inline", "Embedded in a single user/role/group", "One-off, throwaway scope"],
            ["Resource-based", "On the resource (S3, KMS, SQS, Lambda, SNS)", "Cross-account, public buckets"],
            ["Permissions boundary", "Upper limit for an entity", "Delegated admin / dev guardrails"],
            ["SCP", "Org-level boundary", "Multi-account governance"],
            ["Session policy", "Passed when assuming a role", "Federated brokers limiting scope"],
          ],
        },
      },
    ],
    keyNumbers: [
      { k: "STS default session", v: "1 hour (15 min – 12 hours for AssumeRole)" },
      { k: "IAM users per account", v: "5,000 (soft)" },
      { k: "Roles per account", v: "1,000 (soft)" },
      { k: "Managed policies per role", v: "10 (soft, raise to 20)" },
      { k: "Policy doc size", v: "Managed: 6,144 chars. Inline (user): 2,048. Inline (role): 10,240. Inline (group): 5,120." },
      { k: "Access keys per user", v: "2 (use both for rotation)" },
    ],
    howAsked: [
      "“Most secure way to grant EC2 / Lambda / on-prem access to S3” → Role (instance profile / execution role / Roles Anywhere).",
      "“Cross-account access to a bucket” → Resource policy in account B + IAM policy in account A.",
      "“Temporary credentials” / “short-lived” → STS AssumeRole*.",
      "“Apply guardrails so devs can’t exceed X” → Permissions boundary or SCP.",
      "“Allow this S3 bucket from only one VPC” → bucket policy + `aws:SourceVpc` or VPC endpoint policy.",
    ],
    rootCauses: [
      { symptom: "403 AccessDenied calling an AWS API", cause: "Identity policy missing the action; if action is allowed, then a resource policy / SCP / permissions boundary has an explicit deny or a missing allow." },
      { symptom: "403 on `s3:GetObject` for SSE-KMS bucket even though S3 perms look right", cause: "Principal not in the KMS key policy. SSE-KMS adds a hidden `kms:Decrypt` requirement." },
      { symptom: "Cross-account call works for some principals, not others", cause: "Resource policy grants the account but caller's IAM policy is missing the action — both halves are required." },
      { symptom: "EC2 app gets AccessDenied even though role policy looks correct", cause: "Instance metadata is using a stale role (instance was replaced or role was just attached); restart the SDK or wait for cache, or the SDK is reading hard-coded creds from env." },
      { symptom: "Service-to-service trigger (S3→Lambda, SNS→SQS) silently doesn't fire", cause: "Confused-deputy condition `aws:SourceArn`/`aws:SourceAccount` on the resource policy doesn't match the actual source." },
      { symptom: "AssumeRole works in console, fails from code", cause: "Session policy or `--policy` passed at AssumeRole further restricts; or the code's region/STS endpoint disagrees with the trust policy." },
    ],
    cases: [
      {
        title: "EC2 app calling S3",
        scenario:
          "A web app on EC2 needs to read/write objects to an S3 bucket in the same account. Developer is currently embedding access keys into the .env file.",
        answer: "Create an IAM role with s3:GetObject/PutObject for the bucket, attach via an instance profile, and delete the keys from .env.",
        why: "Embedding keys is the #1 distractor. EC2 instance profile hands rotating temp creds via IMDS; SDK picks them up automatically.",
      },
      {
        title: "On-prem agent uploading logs",
        scenario:
          "A datacenter VM uploads logs to S3 once per minute using an IAM user’s long-lived access key. Security wants it gone.",
        answer: "Use IAM Roles Anywhere with a Private CA. Agent presents an X.509 cert, gets temp creds, calls S3.",
        why: "Long-lived keys outside AWS = the same antipattern as inside AWS. Roles Anywhere is the modern fix; an IAM user with MFA is not the right answer because the question wants no static creds.",
      },
      {
        title: "Cross-account read",
        scenario:
          "Account B's Lambda must read objects from Account A's S3 bucket.",
        answer:
          "In Account A: bucket policy allowing Account B (or B's role) s3:GetObject. In Account B: Lambda execution role policy allowing s3:GetObject on that bucket ARN.",
        why: "Cross-account always needs both halves. A resource policy alone is enough only if it explicitly grants to a specific principal AND the calling principal's identity policy permits it.",
      },
    ],
    questions: [
      {
        q: "A developer's EC2 instance must read parameters from Systems Manager Parameter Store. How should permissions be granted MOST securely?",
        options: [
          "Create an IAM user, generate access keys, and put them in /etc/environment on the EC2 instance.",
          "Create an IAM role with ssm:GetParameter and attach it to the EC2 instance via an instance profile.",
          "Add the EC2 instance ID to the Parameter Store resource policy.",
          "Create an IAM group and add the EC2 instance to it.",
        ],
        correct: 1,
        explanation:
          "Roles + instance profile give automatically-rotated temp creds. EC2 instances can't be added to IAM groups, Parameter Store doesn't take instance IDs, and access keys in env files are the canonical wrong answer.",
      },
      {
        q: "Which IAM mechanism would you use to prevent a developer from launching any EC2 instance type larger than t3.medium, even if their own attached policies allow it?",
        options: [
          "Service Control Policy or Permissions Boundary with a Deny on ec2:RunInstances when ec2:InstanceType is larger than t3.medium.",
          "Add a custom IAM user policy with allow only on t3.medium.",
          "Use AWS Config to delete oversized instances after launch.",
          "Use a session policy when the developer logs in.",
        ],
        correct: 0,
        explanation:
          "Permissions boundary (account) or SCP (org) is the durable ceiling. Identity policies can be edited; a boundary cannot be exceeded.",
      },
      {
        q: "An application running on ECS Fargate must download images from ECR and write metrics to CloudWatch. Which two roles must be configured? (Select TWO)",
        options: [
          "Task execution role with ECR pull and CloudWatch Logs permissions.",
          "Task role with cloudwatch:PutMetricData.",
          "EC2 instance profile with full ECR access.",
          "Lambda execution role.",
          "Cognito identity pool authenticated role.",
        ],
        correct: [0, 1],
        explanation:
          "Fargate has no EC2 instance profile. Task execution role = plumbing (image pull, log driver). Task role = what your app code does at runtime.",
      },
      {
        q: "A SaaS application running in a customer's on-prem datacenter authenticates AWS API calls using a long-lived IAM user access key. The CISO mandates removal of static credentials. What should the developer do?",
        options: [
          "Use Cognito Identity Pools.",
          "Use IAM Roles Anywhere with a trust anchor and an X.509 certificate.",
          "Use EC2 Instance Metadata Service.",
          "Use AWS Secrets Manager to rotate the access key daily.",
        ],
        correct: 1,
        explanation:
          "Roles Anywhere is the AWS-native answer for non-AWS workloads needing short-lived creds. Cognito is for end users. IMDS is EC2 only. Rotating an access key doesn't eliminate it.",
      },
    ],
    gotchas: [
      "Explicit DENY > Explicit ALLOW > implicit DENY. Always.",
      "Cross-account = identity policy + resource policy.",
      "Permissions boundary & SCPs do not grant — they cap.",
      "EC2 → instance profile, Lambda → execution role, ECS → task role (+ execution role), on-prem → Roles Anywhere.",
    ],
  },
  {
    id: "s3",
    number: 2,
    phase: 1,
    title: "S3 — Storage Classes, Encryption, Presigned URLs",
    domain: "Development",
    weight: "Hit in Domains 1, 2 and 3",
    blurb:
      "Amazon S3 is the most-tested storage service. Encryption modes, lifecycle, versioning, presigned URLs, CORS, multipart and event notifications come up every exam — often as scenario keywords (cost-effective, encrypted at rest, third-party uploads).",
    sections: [
      {
        heading: "Buckets & objects",
        bullets: [
          "Bucket names: globally unique, 3–63 chars, lowercase, DNS-compliant.",
          "Object: key (path-like string), value (data), metadata, version ID, ACL.",
          "Object size: 0 bytes – 5 TB. Single PUT ≤ 5 GB. Use multipart for > 100 MB; required > 5 GB.",
          "Strong read-after-write consistency for all operations (since Dec 2020).",
        ],
      },
      {
        heading: "Storage classes (cost vs availability vs retrieval)",
        table: {
          headers: ["Class", "Use", "Min duration", "Retrieval"],
          rows: [
            ["Standard", "Frequent access, hot data", "—", "ms"],
            ["Intelligent-Tiering", "Unknown / changing access patterns", "—", "ms (auto-tiers)"],
            ["Standard-IA", "Infrequent, > 30 days", "30 days", "ms, retrieval fee"],
            ["One Zone-IA", "Infrequent, re-creatable, > 30 days", "30 days", "ms, single AZ"],
            ["Glacier Instant Retrieval", "Archive accessed quarterly", "90 days", "ms"],
            ["Glacier Flexible Retrieval", "Archive, occasional access", "90 days", "min – hours"],
            ["Glacier Deep Archive", "Compliance / 7+ year retention", "180 days", "12 – 48 hours"],
          ],
        },
      },
      {
        heading: "Lifecycle rules",
        bullets: [
          "Transition: move between classes after N days.",
          "Expire: delete objects (or non-current versions) after N days.",
          "Filter by prefix, tag, or object size.",
          "Note: must wait 30 days from Standard before transitioning to Standard-IA / One Zone-IA.",
        ],
      },
      {
        heading: "Encryption modes — must know",
        table: {
          headers: ["Mode", "Who holds key", "Audit", "Pick when"],
          rows: [
            ["SSE-S3 (AES-256)", "AWS, fully managed", "No CloudTrail key events", "Default; cheap; no compliance need for key audit"],
            ["SSE-KMS", "AWS KMS (AWS- or customer-managed CMK)", "Yes — CloudTrail every encrypt/decrypt", "Need audit, permission control, or rotation"],
            ["SSE-C", "Customer provides key on each request", "Only object PUT in CloudTrail", "Customer must hold key themselves"],
            ["DSSE-KMS", "Double-layer KMS encryption", "Yes", "Strict compliance (e.g., DoD)"],
            ["CSE", "Client-side, before upload", "—", "Encrypt before object reaches AWS"],
          ],
        },
      },
      {
        heading: "Bucket-level controls",
        bullets: [
          "Default encryption: bucket setting that auto-encrypts PUTs lacking explicit mode.",
          "Bucket Policy: resource-based JSON — cross-account, deny unencrypted PUTs, restrict to VPC.",
          "ACL: legacy; AWS recommends Bucket Owner Enforced (disables ACLs).",
          "Public Access Block: 4 toggles, can be set at account or bucket level; blocks accidental public exposure.",
          "Object Ownership: Bucket Owner Enforced (recommended), Bucket Owner Preferred, Object Writer.",
        ],
      },
      {
        heading: "Versioning, MFA Delete, Object Lock",
        bullets: [
          "Versioning: enabled per bucket; can be Suspended (not removed). Each PUT writes a new version.",
          "MFA Delete: only the root account, with MFA, can permanently delete versions. Configured via CLI.",
          "Object Lock: WORM (Write Once Read Many). Modes = Governance (override with permission) or Compliance (no one, not even root, can override until retention expires).",
          "Legal Hold: indefinite hold independent of retention period.",
        ],
      },
      {
        heading: "Presigned URLs",
        bullets: [
          "A time-limited URL signed by an IAM principal that grants the URL holder the principal’s permissions for a single operation.",
          "Used for: temporary downloads, third-party uploads without giving them AWS creds.",
          "Default expiry: 15 min (CLI), 1 hour (SDK), max 7 days when signed by IAM user; for roles, max = role session duration.",
          "Generate with `s3.generate_presigned_url('put_object', Params={...}, ExpiresIn=3600)`.",
          "Presigned POST = HTML form upload with policy conditions (content-length, type, key prefix).",
        ],
      },
      {
        heading: "CORS",
        bullets: [
          "Required when a browser app on origin A calls S3 on origin B.",
          "Configured as a JSON/XML rule on the bucket: AllowedOrigins, AllowedMethods, AllowedHeaders, MaxAgeSeconds, ExposeHeaders.",
          "404 on the OPTIONS preflight = missing CORS rule.",
        ],
      },
      {
        heading: "Performance & cost",
        bullets: [
          "Throughput: 3,500 PUT/COPY/POST/DELETE per prefix, 5,500 GET/HEAD per prefix. Use random / hashed key prefixes for very hot buckets.",
          "Multipart upload: parallelizable, resumable, required > 5 GB, recommended > 100 MB.",
          "S3 Transfer Acceleration: uses CloudFront edge to upload to faraway buckets. Extra fee.",
          "Byte-range fetches: download object slices in parallel; resilient to failure.",
          "S3 Select / Glacier Select: query a CSV / JSON / Parquet object with SQL; returns only matching bytes.",
          "Requester Pays: caller pays for GETs (good for big public datasets).",
        ],
      },
      {
        heading: "Event notifications",
        bullets: [
          "Targets: SNS, SQS, Lambda, EventBridge.",
          "Trigger types: s3:ObjectCreated:*, ObjectRemoved:*, Replication, RestoreEvents, etc.",
          "For EventBridge, enable the bucket-level setting first; then write EB rules — way more powerful filtering than native S3 notifications.",
        ],
      },
      {
        heading: "Replication",
        bullets: [
          "SRR (Same-Region Replication): logs aggregation, prod→dev copy.",
          "CRR (Cross-Region Replication): DR, latency, compliance.",
          "Both require versioning on source AND destination, plus a replication role.",
          "Replication is async; only new objects after rule creation (use S3 Batch Replication for backfill).",
        ],
      },
    ],
    keyNumbers: [
      { k: "Single PUT max", v: "5 GB" },
      { k: "Multipart required", v: "> 5 GB" },
      { k: "Multipart parts", v: "10,000 max; 5 MB – 5 GB each (last can be smaller)" },
      { k: "Presigned URL max", v: "7 days (signed by IAM user)" },
      { k: "Object metadata", v: "2 KB total (key+value)" },
      { k: "PUT/GET per prefix", v: "3,500 / 5,500" },
    ],
    howAsked: [
      "“Allow a mobile app to upload directly to S3 without exposing AWS credentials” → presigned URL or presigned POST.",
      "“Most cost-effective storage for data accessed twice a year” → Glacier Instant Retrieval; for monthly access, Standard-IA.",
      "“Compliance requires data immutable for 7 years” → S3 Object Lock in Compliance mode + Glacier Deep Archive.",
      "“Encrypt with key the customer rotates and audits” → SSE-KMS with customer-managed CMK.",
      "“Web app on a different domain returns 403/CORS error on PUT” → bucket CORS configuration.",
    ],
    rootCauses: [
      { symptom: "Browser PUT fails with CORS error", cause: "Missing/incorrect CORS rule on the bucket — preflight OPTIONS gets no AllowedOrigins match." },
      { symptom: "403 Forbidden on a public-ish bucket", cause: "S3 Block Public Access is enabled at the bucket OR account level and overrides any 'public' bucket policy." },
      { symptom: "503 SlowDown on a hot prefix", cause: "Sudden burst above the per-prefix limit. S3 auto-partitions over time but a steep ramp can still trip it — pre-warm or distribute keys." },
      { symptom: "Single PUT > 5 GB returns error", cause: "Single-PUT cap; must use multipart upload." },
      { symptom: "GetObject returns InvalidRequest on KMS-encrypted object", cause: "Caller can read S3 but not the KMS key — add the principal to the key policy with `kms:Decrypt`." },
      { symptom: "Presigned URL returns SignatureDoesNotMatch", cause: "Region mismatch between signer and bucket, or clock skew on the signing host." },
      { symptom: "Cross-region replication isn't copying older objects", cause: "CRR only replicates new objects after the rule is enabled — use S3 Batch Replication to backfill." },
    ],
    cases: [
      {
        title: "Direct uploads from mobile",
        scenario: "A mobile app must upload user-selected photos (avg 4 MB) to S3. The team does not want AWS credentials on the device.",
        answer: "Backend issues a presigned PUT URL (or presigned POST policy). App uploads directly to S3 with that URL. Expiry = a few minutes.",
        why: "No creds on device; backend stays out of the data path; you can constrain key prefix and content type via a presigned POST policy.",
      },
      {
        title: "Cheap archive with quarterly access",
        scenario: "Financial records must be retained for 7 years, mostly never read, but compliance teams occasionally pull a record within hours.",
        answer: "Lifecycle: Standard → Standard-IA at 30 days → Glacier Flexible Retrieval at 180 days. Add Object Lock (Compliance, 7-yr retention). Use Vault Lock for immutability.",
        why: "Deep Archive is cheaper but 12–48h retrieval; if 'within hours' is required, Glacier Flexible is right.",
      },
      {
        title: "Encrypted with KMS, audited per access",
        scenario: "PII data must be encrypted with a customer-controlled key, and security must see every decrypt event.",
        answer: "Default encryption = SSE-KMS with a customer-managed CMK. CloudTrail captures kms:Decrypt with the key ARN. Restrict bucket policy to deny PUT without `x-amz-server-side-encryption: aws:kms`.",
        why: "SSE-S3 doesn't log key usage. SSE-C means you store the key. Customer-managed CMK lets you rotate, disable, and audit.",
      },
    ],
    questions: [
      {
        q: "A web app uploaded a 9 GB video using a single PUT and got an error. What is the FASTEST fix?",
        options: [
          "Switch to S3 Transfer Acceleration.",
          "Use S3 multipart upload.",
          "Use S3 byte-range fetches.",
          "Move the bucket to a closer region.",
        ],
        correct: 1,
        explanation: "Single PUT is capped at 5 GB. Anything larger MUST use multipart upload — non-negotiable.",
      },
      {
        q: "Which option lets an external partner upload a file to one specific object key for the next 10 minutes without any AWS credentials?",
        options: [
          "S3 bucket policy granting the partner's account s3:PutObject.",
          "S3 presigned URL for PUT with ExpiresIn=600.",
          "Cognito identity pool with unauthenticated role.",
          "Public bucket with CORS configured.",
        ],
        correct: 1,
        explanation: "Presigned URLs are the textbook answer for 'no creds on the other side, time-limited, single operation'.",
      },
      {
        q: "Auditors require that every decryption of objects in a sensitive bucket be logged with the IAM principal that performed it. Which encryption mode is required?",
        options: ["SSE-S3", "SSE-KMS with a customer-managed CMK", "SSE-C", "Client-side encryption with a random key"],
        correct: 1,
        explanation: "SSE-KMS records every kms:Decrypt in CloudTrail. SSE-S3 doesn't log key operations.",
      },
      {
        q: "An S3 bucket is receiving 9,000 GET requests/second on the prefix /images/. Some requests start returning 503 SlowDown. What is the BEST fix?",
        options: [
          "Enable CloudFront in front of S3.",
          "Distribute objects across multiple key prefixes.",
          "Increase the bucket's RCU.",
          "Switch to S3 Standard-IA.",
        ],
        correct: 1,
        explanation: "S3 scales per prefix (5,500 GET/s). Spread keys across prefixes — or front with CloudFront — to scale further. Buckets don't have RCU.",
      },
      {
        q: "Which mode should be selected for an Object Lock retention that cannot be overridden by anyone — not even the root user — until the retention period expires?",
        options: ["Governance mode", "Compliance mode", "Legal hold", "Bucket policy deny"],
        correct: 1,
        explanation: "Compliance = irreversible until retention expires. Governance can be bypassed with s3:BypassGovernanceRetention permission.",
      },
    ],
    gotchas: [
      "Presigned URL ≠ public URL — it carries the signer's permissions, time-limited.",
      "SSE-KMS = audit + permission control; SSE-S3 = silent.",
      "Bucket policy + Block Public Access still applies — even if your bucket policy allows public, BPA wins.",
      "Versioning can only be suspended, never disabled. Existing versions remain.",
      "Lifecycle minimum 30 days before transitioning to Standard-IA / One Zone-IA.",
    ],
  },
  {
    id: "dynamodb-1",
    number: 3,
    phase: 1,
    title: "DynamoDB Part 1 — Keys, Capacity, Consistency",
    domain: "Development",
    weight: "Most-tested NoSQL service",
    blurb:
      "Fully managed key-value + document store, single-digit millisecond latency, virtually unlimited scale. Designed for known access patterns. Most DVA-C02 mistakes come from picking Scan, ignoring hot partitions, or forgetting that GSIs only support eventual consistency.",
    sections: [
      {
        heading: "Tables, items, attributes",
        bullets: [
          "Table = collection of items; item = collection of attributes (analogous to row/columns but schemaless).",
          "Primary key options: (a) Partition key only, (b) Partition key + Sort key (composite). Combined uniqueness is required.",
          "Item size limit: 400 KB total (all attribute names + values).",
          "Partition key max 2,048 bytes; sort key max 1,024 bytes.",
          "Data types: scalar (S, N, B, BOOL, NULL), document (L, M), set (SS, NS, BS).",
        ],
      },
      {
        heading: "Partition keys & hot partitions",
        bullets: [
          "Internally DynamoDB hashes the partition key to pick a physical partition.",
          "Each partition gets 1,000 WCU / 3,000 RCU max. If one PK gets all the traffic, you hit a 'hot partition' and throttle even when the table has plenty of unused capacity.",
          "**Mitigations:** use high-cardinality PK; pre-shard with a suffix (e.g., `userId#0..9`); write-sharding for time-series; cache hot reads (DAX).",
        ],
      },
      {
        heading: "Capacity modes",
        table: {
          headers: ["Mode", "Pricing", "Best for"],
          rows: [
            ["Provisioned", "Pay per RCU/WCU per hour", "Predictable traffic; auto-scaling supported"],
            ["On-Demand", "Pay per request", "Unknown / spiky workloads; new apps"],
          ],
        },
      },
      {
        heading: "RCU & WCU sizing — memorize",
        bullets: [
          "**1 WCU** = 1 write of up to 1 KB/s. > 1 KB rounds up.",
          "**1 RCU** = 1 strongly consistent read of up to 4 KB/s, OR 2 eventually consistent reads of up to 4 KB/s, OR 0.5 transactional read of up to 4 KB/s.",
          "Reads/writes > 4 KB / 1 KB are billed as multiples (rounded up).",
          "Transactions double the cost: 2 WCU per 1 KB write, 2 RCU per 4 KB read.",
        ],
      },
      {
        heading: "Read consistency",
        bullets: [
          "Default = **eventually consistent** (1 second-ish lag possible).",
          "Set `ConsistentRead=true` for **strongly consistent** (2× RCU cost).",
          "**Strong reads are NOT supported on GSIs** — exam loves to test this.",
          "Transactions are ACID: all-or-nothing across up to 100 items in 4 MB.",
        ],
      },
      {
        heading: "Operations cheat sheet",
        table: {
          headers: ["API", "Use", "Notes"],
          rows: [
            ["PutItem", "Write/replace one item", "ConditionExpression for optimistic locks"],
            ["GetItem", "Read one item by key", "ProjectionExpression to fetch subset"],
            ["UpdateItem", "Modify attributes", "SET / REMOVE / ADD / DELETE; UpdateExpression"],
            ["DeleteItem", "Remove one item", "Condition-supported"],
            ["BatchWriteItem", "Up to 25 writes (16 MB)", "No update/condition; partial failures possible"],
            ["BatchGetItem", "Up to 100 items / 16 MB", "Returns UnprocessedKeys"],
            ["Query", "Items sharing a PK; optional SK filter", "Fast, cheap, indexed"],
            ["Scan", "Read entire table", "Slow & expensive; supports parallel segments"],
            ["TransactWriteItems", "Up to 100 items, ACID", "2× WCU per item"],
            ["TransactGetItems", "Up to 100 items, ACID", "2× RCU per item"],
          ],
        },
      },
      {
        heading: "Conditional writes (optimistic locking)",
        code: `dynamodb.update_item(
  TableName='Orders',
  Key={'OrderId': {'S': 'O-1'}},
  UpdateExpression='SET #s = :new',
  ConditionExpression='#s = :old',
  ExpressionAttributeNames={'#s': 'Status'},
  ExpressionAttributeValues={
    ':old': {'S': 'PENDING'},
    ':new': {'S': 'SHIPPED'}
  }
)`,
      },
      {
        heading: "TTL",
        bullets: [
          "Per-table setting; pick one attribute (epoch seconds) as TTL.",
          "DynamoDB removes expired items within ~48 hours (best effort).",
          "Free of WCU. Generates a delete event on Streams.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Item size", v: "400 KB" },
      { k: "1 WCU", v: "1 KB / sec write" },
      { k: "1 RCU", v: "4 KB strong / 8 KB eventual / 2 KB transactional" },
      { k: "BatchWriteItem", v: "25 items / 16 MB" },
      { k: "BatchGetItem", v: "100 items / 16 MB" },
      { k: "Transactions", v: "100 items / 4 MB, ACID" },
      { k: "Per-partition limit", v: "1,000 WCU / 3,000 RCU" },
    ],
    howAsked: [
      "“Single-digit ms latency, key-value, scales infinitely” → DynamoDB.",
      "“Throttling despite spare capacity” → hot partition.",
      "“Filter by attribute that isn’t a key” → Scan? NO — add a GSI on that attribute.",
      "“ACID across items” → TransactWriteItems.",
      "“Cannot strongly-consistent read” → GSI hit (use base table or accept eventual).",
    ],
    rootCauses: [
      { symptom: "ProvisionedThroughputExceeded with table at < 50% capacity", cause: "Hot partition — one PK is absorbing all traffic. Re-shard the key (add suffix) or cache hot reads." },
      { symptom: "Query returns inconsistent / stale data immediately after a write", cause: "Default eventually consistent read; set `ConsistentRead=true` on the base table. (GSIs are eventual-only.)" },
      { symptom: "ValidationException: query condition missed key schema element", cause: "Trying to Query without a partition key value — must supply equality on PK." },
      { symptom: "ConditionalCheckFailedException", cause: "App logic, not transient — your condition expression didn't match current item state. Do NOT auto-retry." },
      { symptom: "Scan is hammering the bill", cause: "Wrong access pattern. Add a GSI on the attribute you're filtering or export to S3 for ad-hoc queries via Athena." },
      { symptom: "Item just over 400 KB rejected", cause: "Hard item-size cap. Store the body in S3 and keep a pointer in DynamoDB." },
    ],
    cases: [
      {
        title: "Throttling despite under-utilized table",
        scenario: "An app uses `userId` as the partition key. One power-user generates 80% of traffic. Throttling errors begin even though only 30% of capacity is in use.",
        answer: "Write-shard: append a random suffix `userId#shard` (0..N). For reads, query each shard and merge. Add DAX if reads are repetitive.",
        why: "All writes for one user landed on one partition. Sharding spreads keys across partitions.",
      },
      {
        title: "Choosing capacity mode",
        scenario: "A new product launch has unknown traffic; could be 50 req/s, could be 5,000 spikes.",
        answer: "Start with On-Demand. Switch to Provisioned + auto-scaling once 2–4 weeks of CloudWatch data shows the steady-state.",
        why: "On-Demand is the safe default for unknowns. Provisioned wins on cost after you can predict capacity.",
      },
      {
        title: "Filtering by a non-key attribute",
        scenario: "An e-commerce app must list orders by `customerEmail`. Current code does a Scan with FilterExpression — costs are exploding.",
        answer: "Create a GSI with `customerEmail` as the partition key. Query the GSI.",
        why: "Scan reads everything then filters — both expensive and slow. GSI = indexed lookup, scales the same.",
      },
    ],
    questions: [
      {
        q: "A developer needs to ensure that a status field is only updated from PENDING to SHIPPED, never the reverse. The MOST efficient mechanism is:",
        options: [
          "Use a transaction.",
          "UpdateItem with a ConditionExpression on the current status.",
          "GetItem first, check, then PutItem.",
          "Enable DynamoDB Streams and have a Lambda enforce ordering.",
        ],
        correct: 1,
        explanation: "Conditional writes are atomic at the item level. Two-step get-then-put has a race condition; transactions are overkill for a single-item check.",
      },
      {
        q: "Which DynamoDB read consumes 1 RCU?",
        options: [
          "One strongly consistent read of a 4 KB item.",
          "Two strongly consistent reads of 4 KB items each.",
          "One eventually consistent read of an 8 KB item.",
          "One transactional read of a 4 KB item.",
        ],
        correct: 0,
        explanation: "1 RCU = 1 strong read up to 4 KB. The 8 KB eventual read = 1 RCU as well actually (8 KB / 4 KB / 2 = 1) — but option (a) is the textbook definition. (Note: option c is also technically 1 RCU; in exam style, the strict definition wins.)",
      },
      {
        q: "An analytics dashboard scans a 200 GB DynamoDB table every hour, increasing costs sharply. The MOST cost-effective alternative is:",
        options: [
          "Increase RCU and use parallel Scan.",
          "Export to S3 with DynamoDB export and query via Athena.",
          "Switch the table to On-Demand.",
          "Use a transaction.",
        ],
        correct: 1,
        explanation: "Scans don't consume RCU on the export-to-S3 feature. Athena over Parquet on S3 is cents-per-query.",
      },
    ],
    gotchas: [
      "Default reads are eventually consistent.",
      "GSIs do NOT support strongly consistent reads.",
      "Item size > 400 KB → break it up or offload to S3 (store pointer).",
      "Each partition tops at 1,000 WCU / 3,000 RCU. High-cardinality keys avoid hot partitions.",
      "Transactions cost double the capacity.",
    ],
  },
];
