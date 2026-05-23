import type { Topic } from "./types";

export const phase2Topics: Topic[] = [
  {
    id: "dynamodb-2",
    number: 4,
    phase: 2,
    title: "DynamoDB Part 2 — Indexes, Streams, DAX, Transactions",
    domain: "Development",
    blurb:
      "Once you have keys and capacity down, the advanced features decide your real-world performance: LSIs vs GSIs, Streams + Lambda, DAX caching, and transactional all-or-nothing writes.",
    sections: [
      {
        heading: "Local Secondary Index (LSI)",
        bullets: [
          "**Same partition key as the base table, different sort key.**",
          "Must be defined at table creation time — cannot be added later.",
          "Up to 5 LSIs per table.",
          "Shares the table's provisioned capacity (no separate RCU/WCU).",
          "Supports strongly consistent reads.",
        ],
      },
      {
        heading: "Global Secondary Index (GSI)",
        bullets: [
          "**Different partition key (and optional sort key).**",
          "Can be created or deleted at any time.",
          "Up to 20 GSIs per table.",
          "Has its own RCU/WCU (provisioned mode) or scales automatically (on-demand).",
          "**Only eventually consistent reads.**",
          "Writes to the base table cost extra WCU to update each GSI.",
        ],
      },
      {
        heading: "Index projections",
        bullets: [
          "**KEYS_ONLY** — index stores only keys; smallest, cheapest.",
          "**INCLUDE** — keys + listed attributes.",
          "**ALL** — copy of every attribute; biggest, most flexible.",
        ],
      },
      {
        heading: "DynamoDB Streams",
        bullets: [
          "Time-ordered change log of item modifications. Each record = before/after image (configurable).",
          "Retention: 24 hours.",
          "View types: KEYS_ONLY, NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES.",
          "Consumers: Lambda (event source mapping), Kinesis Client Library.",
          "Use cases: cross-region replication, derived tables, audit, fan-out to OpenSearch/Redshift.",
        ],
      },
      {
        heading: "Kinesis Data Streams for DynamoDB",
        bullets: [
          "Same change events but written to a Kinesis Data Stream (24h–365d retention).",
          "Longer retention + multiple consumers via Kinesis fan-out.",
          "Use this when 24h is not enough OR you need multiple downstream pipelines.",
        ],
      },
      {
        heading: "DynamoDB Accelerator (DAX)",
        bullets: [
          "Fully managed, in-memory, write-through cache for DynamoDB.",
          "**Microsecond** read latency for cached items (millisecond for table).",
          "Same DynamoDB API — no code changes beyond client.",
          "Two caches: item cache (GetItem/BatchGetItem) and query cache (Query/Scan).",
          "Cache invalidation: writes go through DAX → DynamoDB, so the cache stays fresh.",
          "Runs in a VPC; multi-AZ cluster of nodes (write to primary, read from replicas).",
          "NOT a replacement for ElastiCache when you need general-purpose caching.",
        ],
      },
      {
        heading: "Transactions",
        bullets: [
          "TransactWriteItems / TransactGetItems = ACID across up to 100 items / 4 MB.",
          "All-or-nothing: any item check fails → entire transaction aborts.",
          "2× capacity cost.",
          "Supports cross-table transactions in the same region & account.",
        ],
      },
      {
        heading: "Global Tables",
        bullets: [
          "Multi-region, multi-active replication.",
          "Last-writer-wins conflict resolution (uses replication timestamps).",
          "Requires Streams enabled with NEW_AND_OLD_IMAGES.",
          "Used for global apps requiring low-latency local reads/writes.",
        ],
      },
      {
        heading: "Backups & PITR",
        bullets: [
          "**On-demand backup**: manual snapshot, retained until deleted, no perf impact.",
          "**Point-In-Time Recovery (PITR)**: continuous backup, restore to any second in the last 35 days.",
        ],
      },
    ],
    keyNumbers: [
      { k: "LSIs per table", v: "5 (only at creation)" },
      { k: "GSIs per table", v: "20 (anytime)" },
      { k: "Streams retention", v: "24 hours" },
      { k: "Kinesis stream for DDB", v: "24h – 365d" },
      { k: "PITR window", v: "35 days" },
      { k: "Transaction items", v: "100 items / 4 MB" },
    ],
    howAsked: [
      "“Cannot add an index without recreating the table” → LSI hint (LSI requires re-create; GSI is anytime).",
      "“Must be strongly consistent on a secondary index” → must be LSI (GSI = eventual only).",
      "“Sub-millisecond / microsecond reads” → DAX.",
      "“React to changes in DynamoDB” → Streams + Lambda.",
      "“ACID across items / tables” → TransactWriteItems.",
      "“Active-active multi-region database” → Global Tables.",
    ],
    cases: [
      {
        title: "Order processing with audit trail",
        scenario: "Every order change must trigger a Lambda that writes to OpenSearch for searching, and also notifies the warehouse.",
        answer: "Enable DynamoDB Streams (NEW_AND_OLD_IMAGES) → Lambda as event source. Lambda writes to OpenSearch and posts to SNS for warehouse fanout.",
        why: "Streams + Lambda is the canonical change-data-capture pattern. Multiple downstream consumers? Switch to the Kinesis stream option.",
      },
      {
        title: "Read-heavy product catalog",
        scenario: "Product details are fetched ~50,000 times per second by the storefront; data changes rarely.",
        answer: "Add DAX cluster in front of the products table. SDK now hits DAX endpoint; reads are microsecond.",
        why: "DAX is purpose-built for DynamoDB read amplification — same API, no rewrite.",
      },
      {
        title: "Multi-region active-active",
        scenario: "App serves users in US, EU, AP. Latency must be local everywhere.",
        answer: "Convert to Global Table replicated to 3 regions. Local reads/writes in each region; last-writer-wins.",
        why: "Aurora Global = read-only replicas. DynamoDB Global Tables = active-active. For 'write locally in all regions' the answer is Global Tables.",
      },
    ],
    questions: [
      {
        q: "Which is TRUE about a GSI?",
        options: [
          "Must be defined at table creation.",
          "Supports strongly consistent reads.",
          "Has its own separate capacity.",
          "Shares the table's partition key.",
        ],
        correct: 2,
        explanation: "GSIs are added anytime, eventual-only reads, separate capacity, can have any partition key. LSIs are the ones with creation-time and same-PK rules.",
      },
      {
        q: "A team needs the last 7 days of item changes for replay and analytics. Which option is required?",
        options: [
          "DynamoDB Streams.",
          "Kinesis Data Streams for DynamoDB.",
          "DynamoDB on-demand backups.",
          "DAX.",
        ],
        correct: 1,
        explanation: "Streams retain 24h. The Kinesis Data Streams integration retains up to 365 days.",
      },
      {
        q: "A developer needs to update two items atomically — debit account A, credit account B. Which API?",
        options: ["BatchWriteItem", "TransactWriteItems", "UpdateItem with a ConditionExpression", "PutItem twice"],
        correct: 1,
        explanation: "BatchWriteItem is NOT atomic; partial failure is normal. TransactWriteItems is all-or-nothing — the right answer for debits/credits.",
      },
    ],
    gotchas: [
      "GSI = eventual-only reads. LSI supports strong reads.",
      "DAX is *only* a DynamoDB cache. For arbitrary caching, use ElastiCache.",
      "Streams keep records 24h. Need longer? Use the Kinesis Data Streams option.",
      "Transactions double capacity cost.",
      "Global Tables = active-active; Aurora Global = read-replica.",
    ],
  },
  {
    id: "lambda-1",
    number: 5,
    phase: 2,
    title: "Lambda Part 1 — Execution Model & Configuration",
    domain: "Development",
    blurb:
      "The single most-tested service. Lambda runs your code in response to events; AWS manages the infrastructure. Master the execution model, memory↔CPU coupling, env vars, timeouts, logs, and the execution role.",
    sections: [
      {
        heading: "Execution model",
        bullets: [
          "**Cold start**: first invocation (or after scaling out) downloads code, starts a microVM, initializes runtime + your init code outside the handler, then runs handler.",
          "**Warm invocations**: reuse the existing execution environment until idle timeout (~5–15 min, undocumented).",
          "**Handler**: function entry point, e.g., `index.handler`. Called per event.",
          "**`/tmp`**: writable, ephemeral, persists across warm invocations of the same env. Default 512 MB, up to 10,240 MB.",
          "**Environment variables**: KMS-encrypted at rest; can use customer-managed keys for cross-account.",
        ],
      },
      {
        heading: "Configuration knobs",
        table: {
          headers: ["Setting", "Range", "Tip"],
          rows: [
            ["Memory", "128 MB – 10,240 MB", "Doubling memory ≈ doubles CPU and network throughput"],
            ["Timeout", "1 – 900 s", "Default 3s — almost always too low"],
            ["Ephemeral storage (/tmp)", "512 MB – 10,240 MB", "Pay per GB-second"],
            ["Architecture", "x86_64 or arm64 (Graviton)", "arm64 is ~20% cheaper, ~19% faster on supported workloads"],
            ["Concurrency", "Account default 1,000 (region)", "Reserved/Provisioned per-function"],
            ["Runtime", "Node, Python, Java, .NET, Go, Ruby, custom", "Use latest LTS"],
          ],
        },
      },
      {
        heading: "Memory ↔ CPU coupling",
        bullets: [
          "Lambda allocates vCPU proportional to memory: 1,769 MB = 1 full vCPU.",
          "Lift memory to make CPU-bound functions faster (often net-cheaper).",
          "Use **AWS Lambda Power Tuning** state machine to find the sweet spot.",
        ],
      },
      {
        heading: "Execution role",
        bullets: [
          "IAM role Lambda assumes to run. ALL permissions go here — never on the function.",
          "Must allow `lambda.amazonaws.com` in trust policy.",
          "Common managed policy: `AWSLambdaBasicExecutionRole` (writes logs to CloudWatch).",
          "VPC access requires `AWSLambdaVPCAccessExecutionRole`.",
          "Add custom statements for whatever the function calls (DynamoDB, S3, SNS).",
        ],
      },
      {
        heading: "Environment variables",
        bullets: [
          "4 KB total per function for all key/value pairs combined.",
          "Encrypted at rest with a Lambda-default key, or your own KMS key for cross-account access.",
          "**Never store secrets here as plaintext** for sensitive data — use Secrets Manager or SSM Parameter Store SecureString.",
        ],
      },
      {
        heading: "Logging & monitoring",
        bullets: [
          "stdout/stderr → CloudWatch Logs group `/aws/lambda/<function>`.",
          "Built-in CloudWatch metrics: Invocations, Errors, Duration, Throttles, ConcurrentExecutions, IteratorAge (for stream sources).",
          "X-Ray tracing: enable Active Tracing in function config; SDK auto-instruments AWS calls.",
        ],
      },
      {
        heading: "Deployment artifact options",
        bullets: [
          "**.zip**: 50 MB direct upload / 250 MB unzipped (max). > 50 MB requires S3.",
          "**Container image**: up to 10 GB, pulled from ECR. Better for big ML models, custom OS deps.",
          "**Layers**: shared zipped dependencies; up to 5 layers per function; max 250 MB unzipped combined.",
        ],
      },
      {
        heading: "Invocation models",
        table: {
          headers: ["Mode", "Triggered by", "Behavior"],
          rows: [
            ["Synchronous", "API GW, ALB, Cognito, direct invoke", "Caller waits; up to 6 MB payload; client handles retries"],
            ["Asynchronous", "S3, SNS, EventBridge, CodeCommit", "Event placed on internal queue; AWS retries 2× automatically; 256 KB payload"],
            ["Stream / Poll", "Kinesis, DynamoDB Streams, SQS, MSK", "Lambda polls source via event source mapping"],
          ],
        },
      },
      {
        heading: "Error handling — retries",
        bullets: [
          "**Sync**: client retries (your code).",
          "**Async**: Lambda retries twice (delays 1 and 2 min). After that → DLQ or Destination.",
          "**Stream (Kinesis/DDB)**: retries until success or record expires. Configure MaximumRetryAttempts, BisectBatchOnFunctionError, OnFailure destination.",
          "**SQS**: failed messages return to queue after visibility timeout; after maxReceiveCount → DLQ.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Max memory", v: "10,240 MB" },
      { k: "Max timeout", v: "900 s (15 min)" },
      { k: "1 vCPU at", v: "1,769 MB memory" },
      { k: "Sync payload", v: "6 MB" },
      { k: "Async payload", v: "256 KB" },
      { k: "Container image", v: "10 GB" },
      { k: "Layers", v: "5 per function, 250 MB unzipped total" },
    ],
    howAsked: [
      "“Function is slow / CPU-bound” → increase memory (and CPU).",
      "“Store config / secret without code change” → env var (config) or Secrets Manager (secret).",
      "“Function needs access to S3 / Dynamo” → modify execution role.",
      "“Reduce cost” → check memory/timeout, use arm64.",
      "“Code grows above 250 MB” → container image deployment.",
    ],
    rootCauses: [
      { symptom: "Function times out at exactly the configured limit", cause: "Default timeout 3s or downstream call (HTTP/DB/SDK) hangs without its own timeout — set client timeouts inside the handler too." },
      { symptom: "Slow but never times out; CPU-bound", cause: "Under-provisioned memory; Lambda allocates CPU proportionally — raise memory to raise CPU." },
      { symptom: "Cold-start latency spikes on bursty traffic", cause: "No provisioned concurrency; or heavy init outside handler (large imports, secret fetching). Move imports lazily / use SnapStart / enable PC." },
      { symptom: "AccessDenied calling AWS service", cause: "Execution role missing the action — permissions are on the role, NOT the function." },
      { symptom: "Lambda runs but caller gets 502 from API Gateway", cause: "Proxy-integration response shape wrong (must be `{ statusCode, headers, body, isBase64Encoded }`) or handler threw uncaught." },
      { symptom: "ENOMEM / 'JavaScript heap out of memory'", cause: "Memory setting too low for runtime + working set. Raise memory or stream data instead of buffering." },
    ],
    cases: [
      {
        title: "Function timing out",
        scenario: "A Python Lambda processing a 5 MB CSV times out at 3s. Memory is 128 MB.",
        answer: "Increase memory (gives more CPU); set timeout to a realistic value, e.g., 60s; if still slow, switch to streaming the file from S3 rather than loading it entirely.",
        why: "Default 3s timeout is the silent killer. Memory governs CPU.",
      },
      {
        title: "Forbidden access from Lambda",
        scenario: "A Lambda gets AccessDenied when calling DynamoDB.",
        answer: "Add `dynamodb:GetItem/PutItem/...` on the specific table ARN to the function's execution role.",
        why: "Distractor: 'attach the policy to the function' — wrong. The function inherits permissions from its execution role.",
      },
      {
        title: "Big ML model",
        scenario: "Deploying a 1.2 GB scikit-learn pipeline; zip exceeds 250 MB unzipped.",
        answer: "Package as a container image, push to ECR, point Lambda function image URI at it.",
        why: "Containers support up to 10 GB; zip mode tops out at 250 MB unzipped.",
      },
    ],
    questions: [
      {
        q: "A developer needs a Lambda function to read messages from an SQS queue. Which permission must exist?",
        options: [
          "sqs:SendMessage on the queue, attached to the Lambda function.",
          "sqs:ReceiveMessage, sqs:DeleteMessage, sqs:GetQueueAttributes on the queue, attached to the execution role.",
          "lambda:InvokeFunction on the SQS queue.",
          "An SQS resource policy allowing Lambda to send.",
        ],
        correct: 1,
        explanation: "Polling needs Receive+Delete+GetQueueAttributes. The execution role holds it — not the function.",
      },
      {
        q: "Which is the FASTEST way to find a function's optimal memory/cost setting?",
        options: [
          "Manually test 5 sizes and read CloudWatch.",
          "Use the AWS Lambda Power Tuning Step Functions state machine.",
          "Always set memory to 10,240 MB.",
          "Use AWS Compute Optimizer alone.",
        ],
        correct: 1,
        explanation: "Power Tuning automates the sweep and shows cost-vs-duration curves. Always-max is wasteful.",
      },
      {
        q: "A function uses a 3.4 GB binary dependency. What is the BEST deployment option?",
        options: [".zip from S3", "Lambda layer", "Container image", "Lambda extension"],
        correct: 2,
        explanation: "Layers and zip cap at 250 MB unzipped. Container images go up to 10 GB.",
      },
    ],
    gotchas: [
      "Default timeout is 3 seconds. Always set explicitly.",
      "Permissions go on the execution role, not the function.",
      "Memory governs CPU. More memory often means lower total cost.",
      "Env vars cap at 4 KB total; don't store big payloads or secrets there.",
    ],
  },
  {
    id: "lambda-2",
    number: 6,
    phase: 2,
    title: "Lambda Part 2 — Versions, Aliases, Concurrency, VPC, Layers",
    domain: "Development",
    blurb:
      "Lambda's release-management and performance tuning surface area. Versions are immutable snapshots; aliases route traffic; concurrency controls cold starts and throttling; VPC config gives access to private resources; layers share code.",
    sections: [
      {
        heading: "Versions & aliases",
        bullets: [
          "**$LATEST** = mutable working copy.",
          "**Publish version** = immutable snapshot of code + config, numbered (1, 2, 3...). ARN suffix `:1`.",
          "**Alias** = movable named pointer to a version (e.g., `prod`, `staging`). ARN suffix `:prod`.",
          "Aliases can split traffic between two versions (weighted alias) — basis of canary deploys.",
          "Permissions: an alias has its own ARN; events trigger an alias, not a version.",
        ],
      },
      {
        heading: "Concurrency",
        bullets: [
          "**Account concurrency limit**: default 1,000 per region (soft, can request raise).",
          "**Unreserved concurrency**: the account pool, shared across all functions.",
          "**Reserved concurrency** (per function): GUARANTEES this many slots AND CAPS the function at that number.",
          "**Provisioned concurrency** (per version/alias): PRE-INITIALIZES N execution environments — eliminates cold starts. You pay even when idle.",
        ],
      },
      {
        heading: "Cold start mitigation",
        bullets: [
          "Provisioned concurrency for production endpoints with strict latency SLAs.",
          "Snap-start (Java/Python — newer): pre-snapshot the JVM/runtime; near-instant cold starts.",
          "Reduce package size; lazy-import heavy modules outside critical path; use arm64.",
          "Reuse SDK clients across invocations (declare outside handler).",
        ],
      },
      {
        heading: "VPC access",
        bullets: [
          "Required when Lambda must reach private RDS, ElastiCache, on-prem via VPN/DX.",
          "AWS creates Hyperplane ENIs in your subnets — fast, shared, no longer cold-start penalty (post-2019 fix).",
          "Lambda in a VPC has NO internet by default. Add a NAT Gateway (private subnet) or use VPC endpoints for AWS services.",
          "Required permissions in execution role: `ec2:CreateNetworkInterface`, `DescribeNetworkInterfaces`, `DeleteNetworkInterface`.",
          "Pick at least 2 subnets in different AZs.",
        ],
      },
      {
        heading: "Lambda Layers",
        bullets: [
          "Shareable zip of common code/dependencies, mounted at `/opt`.",
          "Up to 5 layers per function; combined 250 MB unzipped (including code).",
          "Layers are versioned (immutable); share cross-account via permissions.",
          "Use cases: shared SDK builds, monitoring agents, language runtimes.",
        ],
      },
      {
        heading: "Lambda Extensions",
        bullets: [
          "Long-running processes inside the Lambda execution environment.",
          "Used for observability (Datadog, NewRelic), secret retrieval (AWS Parameters & Secrets Lambda Extension — caches Secrets Manager values).",
          "Two types: internal (in-runtime thread) or external (separate process).",
        ],
      },
      {
        heading: "Lambda function URL",
        bullets: [
          "Built-in HTTPS endpoint for a function — no API Gateway needed.",
          "Auth: AWS_IAM or NONE (public).",
          "Single-region only; no custom domain (use CloudFront for that).",
          "Great for webhooks, internal tools, simple OAuth callbacks.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Default concurrency", v: "1,000 per region" },
      { k: "Reserved+Provisioned headroom", v: "Account must always leave ≥100 unreserved" },
      { k: "Min subnets for VPC", v: "2 across AZs" },
      { k: "Layers per function", v: "5" },
    ],
    howAsked: [
      "“Eliminate cold starts for a low-latency endpoint” → Provisioned Concurrency.",
      "“Prevent one Lambda from starving others” → Reserved Concurrency.",
      "“Lambda needs to query private RDS” → put Lambda in the VPC.",
      "“Lambda in VPC cannot reach the internet” → NAT Gateway or VPC endpoints.",
      "“Roll back without code change” → move alias to a previous version.",
      "“Shift 10% of traffic to new version” → weighted alias / CodeDeploy canary.",
    ],
    cases: [
      {
        title: "Cold start spikes ruining p99 latency",
        scenario: "An API GW → Lambda endpoint has p50 = 40ms but p99 = 1.6s due to cold starts on traffic bursts.",
        answer: "Enable provisioned concurrency on the prod alias (use auto-scaling target tracking on the ProvisionedConcurrencyUtilization metric).",
        why: "PC keeps execution environments hot. Reserved concurrency just caps, doesn't prewarm.",
      },
      {
        title: "Canary deploy",
        scenario: "Want to send 10% of traffic to the new version for 10 minutes, then 100% if metrics pass.",
        answer: "Use CodeDeploy with Canary10Percent10Minutes (or weighted alias 10/90 manually).",
        why: "CodeDeploy + Lambda manages the shift, monitors alarms, and can auto-rollback.",
      },
      {
        title: "Lambda calling private RDS",
        scenario: "A Lambda needs to query an Aurora cluster in private subnets.",
        answer: "Configure Lambda VPC = the Aurora's VPC, 2+ private subnets, security group that allows egress to Aurora SG; Aurora SG allows ingress from Lambda SG on 3306/5432.",
        why: "Lambda needs ENIs in the VPC. Security groups, not NACLs, are the typical control.",
      },
    ],
    questions: [
      {
        q: "A developer wants to keep traffic on version 1 while testing version 2 with 5% of users. The MOST native approach is:",
        options: [
          "Two separate functions and an API Gateway weighted target.",
          "An alias 'live' with routing config 95% to v1, 5% to v2.",
          "Provisioned concurrency on v2.",
          "Reserved concurrency split 95/5.",
        ],
        correct: 1,
        explanation: "Weighted aliases are Lambda's native canary primitive.",
      },
      {
        q: "Why might you set reserved concurrency on a low-priority batch function?",
        options: [
          "To make it cold-start faster.",
          "To cap its concurrency so it cannot consume the entire account pool.",
          "To enable VPC access.",
          "To make it ARM-compatible.",
        ],
        correct: 1,
        explanation: "Reserved concurrency caps. It also guarantees, but the exam most often asks about the cap to protect other functions.",
      },
      {
        q: "A function in a VPC suddenly cannot reach api.example.com. What is the MOST likely cause?",
        options: [
          "Lambda functions cannot make outbound HTTPS calls.",
          "Missing NAT Gateway (or VPC endpoint) for internet access.",
          "Execution role missing lambda:InvokeFunction.",
          "Function size exceeds 250 MB.",
        ],
        correct: 1,
        explanation: "Lambdas in private subnets have no internet route by default. NAT GW or VPC endpoint required.",
      },
    ],
    gotchas: [
      "Reserved concurrency CAPS. Provisioned concurrency PREWARMS.",
      "An alias can split traffic between exactly two versions.",
      "Lambda in VPC = no internet without NAT or VPC endpoint.",
      "Versions are immutable; $LATEST is mutable.",
    ],
  },
  {
    id: "lambda-3",
    number: 7,
    phase: 2,
    title: "Lambda Part 3 — Event Sources, Destinations, DLQs, Error Handling",
    domain: "Development",
    blurb:
      "Pick the right invocation pattern and you get reliability for free. Misconfigure retries or destinations and you'll silently lose data. Know event source mappings, DLQs vs Destinations, and per-source retry semantics.",
    sections: [
      {
        heading: "Event sources at a glance",
        table: {
          headers: ["Source", "Invocation", "Retry behavior"],
          rows: [
            ["API Gateway, ALB, Function URL", "Sync", "Client handles retries"],
            ["S3, SNS, EventBridge, CodeCommit", "Async", "2 retries by Lambda; configurable to DLQ/Destination"],
            ["Kinesis Data Streams, DynamoDB Streams", "Poll-based (ESM)", "Retries until success or record expires"],
            ["SQS Standard/FIFO", "Poll-based (ESM)", "Failed batch returns to queue; DLQ via SQS"],
            ["MSK, self-managed Kafka", "Poll-based (ESM)", "Configurable"],
            ["Cognito triggers", "Sync", "User pool retries"],
          ],
        },
      },
      {
        heading: "Async invocation — DLQ vs Destinations",
        bullets: [
          "**DLQ (older)**: only on FAILURE; target SQS or SNS; failed event body delivered.",
          "**Destinations (newer, preferred)**: on SUCCESS and/or FAILURE; target SQS, SNS, Lambda, or EventBridge; includes rich context (request ID, response, error).",
          "Both apply only to async invocations.",
          "If both DLQ and Destinations are configured, Destinations wins.",
        ],
      },
      {
        heading: "Event source mapping (ESM) for streams & queues",
        bullets: [
          "Lambda service polls the source on your behalf.",
          "Configurable: batch size, batching window, max retry attempts, on-failure destination, parallelization factor (Kinesis/DDB).",
          "**BisectBatchOnFunctionError** = on error, split batch in half to isolate the poison pill.",
          "**Tumbling windows** (Kinesis/DDB only) = state aggregation across micro-batches.",
        ],
      },
      {
        heading: "SQS specifics",
        bullets: [
          "Lambda automatically polls; you do NOT write a polling loop.",
          "Batch size up to 10,000 (Standard) / 10 (FIFO) records.",
          "On error, the whole batch is NOT acked → returned to queue; after maxReceiveCount → SQS DLQ.",
          "Use ReportBatchItemFailures to ack the good half of a batch and retry only the failed messages (partial batch response).",
          "FIFO message group ID controls ordering; one Lambda invocation per message group at a time.",
        ],
      },
      {
        heading: "Kinesis / DynamoDB Streams specifics",
        bullets: [
          "Lambda invokes one consumer per shard by default (parallelization factor 1).",
          "Increase parallelization factor (up to 10) for more concurrent processing per shard.",
          "Maintain order WITHIN a shard.",
          "Configure OnFailure destination so unprocessable batches go to SQS / SNS.",
          "**IteratorAge** = how far behind real-time you are; alarm > acceptable lag.",
        ],
      },
      {
        heading: "Idempotency",
        bullets: [
          "All Lambda sources can deliver at-least-once. Handlers MUST be idempotent.",
          "Use a 'processed IDs' table (DynamoDB with TTL) or AWS Lambda Powertools idempotency.",
          "Source-provided IDs: SQS message ID, S3 event ETag, Kinesis sequence number, EventBridge event ID.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Async retries", v: "2 (1 min, 2 min delays)" },
      { k: "Max event age (async)", v: "Up to 6 hours" },
      { k: "SQS batch size", v: "10,000 standard / 10 FIFO" },
      { k: "Kinesis parallelization", v: "1 – 10 per shard" },
    ],
    howAsked: [
      "“Failed async invocations must go somewhere for debugging” → Destinations (or DLQ).",
      "“Decouple producer from Lambda / buffer spikes” → SQS in front of Lambda.",
      "“Process one S3 object on upload” → S3 event → Lambda (async).",
      "“Lambda processes only the failed messages in a batch” → ReportBatchItemFailures (partial batch).",
      "“One poison pill blocks the shard / queue” → BisectBatchOnFunctionError, MaximumRetryAttempts, OnFailure destination.",
    ],
    rootCauses: [
      { symptom: "SQS-triggered Lambda processes duplicates", cause: "SQS is at-least-once by design. Make the handler idempotent (dedupe by messageId in a DynamoDB table with TTL)." },
      { symptom: "Kinesis IteratorAge climbing forever", cause: "A poison record keeps failing and the shard retries forever — enable BisectBatchOnFunctionError + MaximumRetryAttempts + OnFailure destination." },
      { symptom: "Async invocation 'just disappears'", cause: "No DLQ or Destination configured — after 2 retries Lambda drops the event silently." },
      { symptom: "Whole SQS batch reprocessed after one bad message", cause: "Handler returns error for the batch; switch to `ReportBatchItemFailures` and return only the failed messageIds." },
      { symptom: "SQS messages re-appear before processing finishes", cause: "Visibility timeout too short — should be ≥ 6× the Lambda timeout." },
      { symptom: "FIFO queue throughput stuck at 300 msg/s", cause: "Ordering is per MessageGroupId; single group serializes — spread across more groups for parallelism." },
    ],
    cases: [
      {
        title: "Poison pill on Kinesis",
        scenario: "A single malformed record causes the Lambda to throw, and the shard stops progressing.",
        answer: "Enable BisectBatchOnFunctionError, set MaximumRetryAttempts, configure OnFailure destination (SQS) for unrecoverable records.",
        why: "Otherwise Lambda retries forever until the record expires — IteratorAge climbs.",
      },
      {
        title: "Async failures lost",
        scenario: "An S3-trigger Lambda occasionally fails; the team has no visibility into which events failed.",
        answer: "Configure Failure Destination = SQS queue. Optionally Success Destination → EventBridge for downstream.",
        why: "Without DLQ/Destinations, failed async invocations are dropped after 2 retries.",
      },
      {
        title: "SQS partial batch failure",
        scenario: "Lambda processes a batch of 10 SQS messages; one fails. Currently the whole batch is retried, double-processing the 9 successes.",
        answer: "Return ReportBatchItemFailures with the failed messageIds. Lambda re-queues only those.",
        why: "Avoids re-processing succeeded items; requires the function to track per-item outcomes.",
      },
    ],
    questions: [
      {
        q: "An SQS-triggered Lambda is processing duplicate messages. The team is sure SQS is at-least-once. The CORRECT mitigation is:",
        options: [
          "Switch to FIFO with exactly-once delivery.",
          "Make the handler idempotent (e.g., dedupe by messageId in DynamoDB).",
          "Enable Lambda Destinations.",
          "Reduce visibility timeout.",
        ],
        correct: 1,
        explanation: "Idempotency is the durable solution. FIFO with deduplication helps but only within a 5-minute window and limits throughput.",
      },
      {
        q: "Which option captures the body of an async event that failed all retries?",
        options: ["Provisioned concurrency", "DLQ or Failure Destination", "X-Ray", "CloudWatch Alarms"],
        correct: 1,
        explanation: "Both DLQ and Failure Destinations capture failed async events. Destinations is newer and provides richer context.",
      },
    ],
    gotchas: [
      "DLQ + Destinations apply only to ASYNC invocations.",
      "SQS visibility timeout should be ≥ 6× the Lambda timeout.",
      "Async retries: 2× by default. Configurable MaximumRetryAttempts 0–2.",
      "Use ReportBatchItemFailures so one bad message doesn't reprocess the batch.",
    ],
  },
];
