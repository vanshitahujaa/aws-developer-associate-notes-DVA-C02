import type { Topic } from "./types";

export const phase3Topics: Topic[] = [
  {
    id: "api-gateway",
    number: 8,
    phase: 3,
    title: "API Gateway — REST, HTTP, WebSocket",
    domain: "Development",
    blurb:
      "Managed front door for APIs. Handles auth, throttling, caching, transformations, validation, mocking, and integration with Lambda, HTTP, AWS service. Exam favorites: REST vs HTTP API, stages, stage variables, authorizers, usage plans, caching, CORS.",
    sections: [
      {
        heading: "Three API types",
        table: {
          headers: ["Type", "Strengths", "Best for"],
          rows: [
            ["REST", "Full feature set: API keys, usage plans, WAF, request validation, caching, SDK gen, X-Ray", "Public/B2B APIs, monetized APIs"],
            ["HTTP", "~70% cheaper, lower latency, JWT auth, OIDC, simpler", "Internal/serverless APIs without heavy features"],
            ["WebSocket", "Bidirectional, $connect / $disconnect / $default routes", "Chat, notifications, real-time apps"],
          ],
        },
      },
      {
        heading: "Endpoint types (REST/HTTP)",
        bullets: [
          "**Edge-optimized** (default): CloudFront-fronted, low latency for globally distributed clients.",
          "**Regional**: in-region clients, e.g., backend-to-backend; can put your own CloudFront if needed.",
          "**Private**: only reachable from VPCs via interface VPC endpoint (`execute-api`). Resource policy required.",
        ],
      },
      {
        heading: "Integration types",
        bullets: [
          "**Lambda proxy (AWS_PROXY)**: raw event passed to Lambda; Lambda returns a specific JSON shape `{ statusCode, headers, body, isBase64Encoded }`.",
          "**Lambda custom**: mapping templates (VTL) transform request/response.",
          "**HTTP proxy / HTTP custom**: backend is any HTTP endpoint.",
          "**AWS service**: direct call to SNS, SQS, DynamoDB, Step Functions — no Lambda glue.",
          "**Mock**: returns canned response, used for testing.",
        ],
      },
      {
        heading: "Stages & stage variables",
        bullets: [
          "Stages = named deployments (dev, test, prod). Each stage gets its own URL.",
          "Stage variables = key-value strings available in mapping templates as `${stageVariables.x}`.",
          "Common pattern: stage variable `lambdaAlias` = `${stageVariables.alias}` to route prod→`prod` alias.",
          "Canary deployments: stage-level canary settings; route N% to a new deployment.",
        ],
      },
      {
        heading: "Authorizers",
        table: {
          headers: ["Authorizer", "Used by", "Notes"],
          rows: [
            ["IAM (Sigv4)", "AWS principals, internal", "Use AWS_IAM authorization; SDK signs requests"],
            ["Cognito User Pools", "End-user apps", "User Pool JWT in Authorization header"],
            ["Lambda authorizer (TOKEN)", "Custom token (JWT, OAuth)", "Lambda returns policy + context"],
            ["Lambda authorizer (REQUEST)", "Use multiple inputs (headers, query, source IP)", "Same Lambda, different event shape"],
            ["JWT (HTTP API only)", "OIDC providers", "No Lambda — built-in JWT validation"],
          ],
        },
      },
      {
        heading: "Caching",
        bullets: [
          "Per-stage cache, 0.5 GB – 237 GB.",
          "Default TTL 300s; override per-method.",
          "Invalidate by: header `Cache-Control: max-age=0` (requires IAM perm `InvalidateCache`), or DELETE the cache via console.",
          "Cache key includes path + selected request params.",
        ],
      },
      {
        heading: "Throttling, usage plans & API keys",
        bullets: [
          "**Account level**: 10,000 RPS, 5,000 burst (default, region).",
          "**Stage / method level**: configurable.",
          "**Usage plan** (REST only): throttle + quota (e.g., 1M calls / month) per API key.",
          "API key in header `x-api-key`. NEVER use as authentication — combine with an authorizer.",
        ],
      },
      {
        heading: "Request / response transformations",
        bullets: [
          "**Mapping templates (VTL)** for non-proxy integrations.",
          "**Request validators**: schema-validate body, required params, headers — reject early.",
          "**Models** (JSON Schema) reusable across endpoints.",
          "**Gateway responses**: customize the default 4xx/5xx responses (e.g., add CORS headers to 4xx).",
        ],
      },
      {
        heading: "CORS",
        bullets: [
          "API Gateway returns the OPTIONS preflight; you configure allowed origins, methods, headers.",
          "For Lambda proxy, ALSO add `Access-Control-Allow-Origin` etc. to your Lambda response.",
          "Most CORS bugs come from the Lambda returning an error before setting CORS headers — use Gateway Responses to add them at the 4xx/5xx level.",
        ],
      },
      {
        heading: "Logging & metrics",
        bullets: [
          "**Access logs** (per-stage): customizable format → CloudWatch Logs.",
          "**Execution logs**: detailed phase logs (auth, validation, integration).",
          "**Metrics**: Count, 4XXError, 5XXError, Latency, IntegrationLatency, CacheHit/MissCount.",
          "Enable X-Ray Active Tracing for end-to-end traces.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Max integration timeout", v: "29 s" },
      { k: "Max payload", v: "10 MB" },
      { k: "Cache size", v: "0.5 GB – 237 GB per stage" },
      { k: "Default throttle", v: "10,000 RPS / 5,000 burst (account)" },
    ],
    howAsked: [
      "“Cheapest API GW for internal serverless app” → HTTP API.",
      "“Requires API keys + quotas + WAF” → REST API.",
      "“Stage-specific Lambda alias” → stage variables.",
      "“CORS errors on preflight” → enable CORS on the resource.",
      "“Reduce backend load for static GET responses” → enable API GW caching.",
      "“Validate request body before invoking Lambda” → request validator with model.",
    ],
    rootCauses: [
      { symptom: "502 Bad Gateway from API Gateway (Lambda proxy)", cause: "Lambda returned the wrong response shape or threw an uncaught exception. Return `{ statusCode, headers, body, isBase64Encoded }`." },
      { symptom: "504 Gateway Timeout", cause: "Integration exceeded 29s. Move long work to async (SQS, Step Functions) and return 202." },
      { symptom: "403 with no explanation in CloudWatch", cause: "Authorizer denied (Cognito/Lambda) OR resource policy / WAF blocked. Enable execution logs to see which." },
      { symptom: "CORS error in browser but Lambda is reachable from curl", cause: "OPTIONS preflight not configured on the resource, or Lambda returned a 4xx/5xx without the `Access-Control-Allow-Origin` header — use Gateway Responses to inject CORS on errors." },
      { symptom: "Custom domain returns 'no matching certificate'", cause: "Cert in wrong region (edge-optimized needs us-east-1; regional needs the API's region)." },
      { symptom: "API key sent but request still 403", cause: "API key alone isn't auth — usage plan must associate the key to the stage/method, AND if a Cognito/Lambda authorizer is configured it must also pass." },
    ],
    cases: [
      {
        title: "Per-environment routing",
        scenario: "One API GW deployment must hit `prod` Lambda alias in production and `dev` alias in dev stage.",
        answer: "Define stage variable `lambdaAlias` per stage. Integration URI uses `arn:...:function:my-fn:${stageVariables.lambdaAlias}`. Add `lambda:InvokeFunction` permission to both aliases.",
        why: "Stage variables decouple stage from artifact; no duplicate APIs.",
      },
      {
        title: "Cost spike from Lambda invocations",
        scenario: "A read-heavy GET /products endpoint backed by Lambda + DynamoDB is hammering Lambda concurrency limits.",
        answer: "Enable API GW caching on /products with a 60s TTL. Lambda invocations drop dramatically; DynamoDB load drops too.",
        why: "Cache at the edge of the API GW; backend is queried only on cache miss.",
      },
      {
        title: "B2B partner consumption tier",
        scenario: "External partners must each be limited to 100k requests / month with optional 1k RPS burst.",
        answer: "REST API with API keys per partner; attach a Usage Plan with throttle + quota.",
        why: "Usage plans are the only AWS-native rate/quota system at the API gateway.",
      },
    ],
    questions: [
      {
        q: "An internal HTTP-based microservice must authenticate users via Okta (OIDC). The simplest API Gateway choice is:",
        options: ["REST + Lambda authorizer", "REST + Cognito authorizer", "HTTP API + JWT authorizer", "WebSocket API"],
        correct: 2,
        explanation: "HTTP API has native JWT auth — no Lambda code, just configure the issuer.",
      },
      {
        q: "Which API Gateway feature lets one deployment point at version 1 in dev and version 5 in prod without code changes?",
        options: ["Stage variables", "Usage plans", "Resource policies", "Lambda aliases only"],
        correct: 0,
        explanation: "Stage variables are passed to integrations and into Lambda as event.stageVariables.",
      },
    ],
    gotchas: [
      "Integration timeout = 29s. Long tasks → SQS/Step Functions.",
      "API key alone ≠ authentication.",
      "CORS preflight needs configuration; errors may need Gateway Responses for headers.",
      "Cache invalidation needs `InvalidateCache` IAM permission to bypass via header.",
    ],
  },
  {
    id: "sqs-sns-eb",
    number: 9,
    phase: 3,
    title: "SQS, SNS, EventBridge — Messaging Trio",
    domain: "Development",
    blurb:
      "Three event-routing services. Pick by shape: SQS = work queue, SNS = pub/sub fanout, EventBridge = filtered event bus with schedules, partners, schema registry. Mix and match for decoupled architectures.",
    sections: [
      {
        heading: "SQS — Simple Queue Service",
        bullets: [
          "Distributed work queue. Producers send, consumers poll.",
          "**Standard**: at-least-once, best-effort ordering, unlimited TPS.",
          "**FIFO**: exactly-once (within dedup window), strict ordering per MessageGroupId, 300 msg/s (3,000 batched).",
          "Message size: 256 KB (use Extended Client Library to stash > 256 KB in S3).",
          "**Visibility timeout**: hidden after receive (default 30s, max 12h).",
          "**Long polling**: ReceiveMessage with WaitTimeSeconds ≤ 20 — reduces empty receives and API cost.",
          "**Retention**: 1 min – 14 days (default 4 days).",
          "**DLQ**: redrive failed messages after maxReceiveCount (configure on source queue).",
        ],
      },
      {
        heading: "SQS message attributes & deduplication",
        bullets: [
          "Up to 10 custom attributes (name, type, value). Useful for filter-then-route patterns.",
          "FIFO dedup: ContentBasedDeduplication or explicit MessageDeduplicationId; 5-minute dedup window.",
          "MessageGroupId in FIFO: ordering is per-group, parallelism across groups.",
        ],
      },
      {
        heading: "SNS — Simple Notification Service",
        bullets: [
          "Pub/sub. Topics + subscriptions.",
          "Targets: SQS, Lambda, HTTP(S), Email, SMS, Mobile push, Kinesis Data Firehose.",
          "**Fanout pattern**: one publish → many subscribers (typical: SNS → multiple SQS queues).",
          "**Filter policies**: subscribers receive only matching messages (JSON match on message attributes).",
          "**FIFO topic**: ordered fanout to SQS FIFO queues.",
          "**Message archive & replay** (FIFO): retain up to 365 days for replay.",
          "**SNS Mobile Push**: APNs, FCM, ADM, Baidu — managed device tokens.",
        ],
      },
      {
        heading: "EventBridge",
        bullets: [
          "Event bus + rule routing. Default bus carries AWS service events; custom buses; partner buses (Datadog, Zendesk, etc).",
          "Rich event-pattern filtering: prefix, anything-but, numeric, exists, multi-value.",
          "**Targets** (up to 5 per rule): Lambda, Step Functions, SQS, SNS, Kinesis, ECS task, API destination, EventBridge bus.",
          "**Scheduler**: cron / rate / one-time triggers — replaces CW Events scheduling, supports timezones.",
          "**Pipes**: point-to-point with optional filter & enrichment — e.g., SQS → Lambda enrich → Step Functions.",
          "**Schema registry**: discover & catalog event schemas, generate code bindings.",
          "**Replay**: replay archived events into a bus for backfill/debug.",
        ],
      },
      {
        heading: "Decision matrix",
        table: {
          headers: ["Need", "Choose"],
          rows: [
            ["Decouple producer/consumer, durable queue", "SQS"],
            ["Send same message to multiple subscribers", "SNS"],
            ["Filter on attributes, route to different consumers", "EventBridge (or SNS filter)"],
            ["Schedule jobs (cron)", "EventBridge Scheduler"],
            ["Connect SaaS partner events", "EventBridge partner event source"],
            ["Strict ordering / exactly-once", "SQS FIFO (+ SNS FIFO for fanout)"],
            ["Point-to-point with transform", "EventBridge Pipes"],
          ],
        },
      },
    ],
    keyNumbers: [
      { k: "SQS max msg size", v: "256 KB (Ext: 2 GB via S3)" },
      { k: "SQS retention", v: "60 sec – 14 days" },
      { k: "SQS visibility timeout", v: "30 s default; max 12 h" },
      { k: "SNS message size", v: "256 KB" },
      { k: "EventBridge target limit", v: "5 per rule" },
      { k: "EB Pipes", v: "1 source → 1 target" },
    ],
    howAsked: [
      "“Decouple application tier” → SQS.",
      "“One event, many subscribers, no filtering needed” → SNS.",
      "“One event, many subscribers, different filters per subscriber” → EventBridge or SNS filter policy.",
      "“Cron schedule replacement” → EventBridge Scheduler.",
      "“Buffer requests so backend can process at its own pace” → SQS in front of Lambda or EC2.",
    ],
    cases: [
      {
        title: "Order placed → send email, charge card, update analytics",
        scenario: "Three independent consumers must run when an order is created.",
        answer: "Order service publishes to SNS (or EventBridge). Three SQS queues subscribed. Email/Charge/Analytics workers consume their queue.",
        why: "SNS-to-SQS fanout durably decouples each consumer; one slow consumer doesn't block others.",
      },
      {
        title: "Filter events by tenant",
        scenario: "10 SaaS tenants share an event bus; each tenant's Lambda should see only its events.",
        answer: "EventBridge rule per tenant with `detail.tenantId = [\"...\"]` pattern → tenant-specific Lambda.",
        why: "EventBridge's filtering language is more expressive than SNS filter policies.",
      },
      {
        title: "Replay yesterday's events",
        scenario: "Bug shipped at 9 AM caused 4 hours of misprocessed events; team wants to replay.",
        answer: "Use EventBridge Archive + Replay (if archive was enabled). Otherwise restore from CloudWatch Logs or S3 sink.",
        why: "Archive is opt-in; only services with archive enabled can replay.",
      },
    ],
    questions: [
      {
        q: "Which combination guarantees strict order across an SNS fanout?",
        options: [
          "SNS Standard topic + SQS FIFO subscriptions.",
          "SNS FIFO topic + SQS FIFO subscriptions.",
          "Single SQS FIFO queue subscribed to SNS Standard.",
          "EventBridge bus with ordered targets.",
        ],
        correct: 1,
        explanation: "Only SNS FIFO → SQS FIFO preserves order through fanout. EventBridge does not guarantee ordering.",
      },
      {
        q: "An API receives spike traffic that overwhelms downstream EC2. The lightest fix is:",
        options: [
          "Insert SQS between the API and EC2.",
          "Switch EC2 to spot.",
          "Add API Gateway caching.",
          "Use SNS instead.",
        ],
        correct: 0,
        explanation: "Classic decoupling. EC2 polls the queue and processes at its sustainable rate.",
      },
    ],
    gotchas: [
      "SQS visibility timeout should be ≥ 6× Lambda timeout (for SQS-Lambda).",
      "FIFO TPS limit (300 / 3000) is per queue.",
      "SNS filter policy is a JSON map on subscription; SNS evaluates it.",
      "EventBridge default bus delivers AWS service events automatically (CloudTrail).",
    ],
  },
  {
    id: "step-functions",
    number: 10,
    phase: 3,
    title: "Step Functions — Workflows",
    domain: "Development",
    blurb:
      "Visual workflow orchestrator that calls AWS services and Lambdas, handles retries, branches, parallelism, and waits. Standard vs Express, sync vs async Express, ASL state types, error handling, and integration patterns are the test surface.",
    sections: [
      {
        heading: "Standard vs Express",
        table: {
          headers: ["", "Standard", "Express"],
          rows: [
            ["Max duration", "1 year", "5 minutes"],
            ["Execution rate", "2,000 / sec", "100,000 / sec"],
            ["History", "90 days, visual debug", "CloudWatch Logs only"],
            ["At-least vs exactly once", "Exactly-once", "At-least-once (async) or at-most-once (sync)"],
            ["Pricing", "Per state transition", "Per duration & request"],
            ["Use case", "Long, low-volume, audit", "Short, high-volume, streaming"],
          ],
        },
      },
      {
        heading: "State types (ASL — Amazon States Language)",
        bullets: [
          "**Task**: do work (Lambda, AWS SDK integration, optimized SDK integration, HTTP target).",
          "**Choice**: branch on input.",
          "**Parallel**: run branches concurrently.",
          "**Map**: iterate over an array — Inline (in-memory, ≤ 40 iterations old, now 40 concurrent default) or Distributed Map (millions of items, S3 input).",
          "**Wait**: pause for time or until timestamp.",
          "**Pass**: identity / transform input.",
          "**Succeed / Fail**: terminal.",
        ],
      },
      {
        heading: "Integration patterns",
        bullets: [
          "**Request-Response** (default): fire and continue.",
          "**Run-a-Job (.sync)**: wait for the AWS service to finish (e.g., ECS task, Glue job, EMR step).",
          "**Wait-for-Callback (.waitForTaskToken)**: pause until external system posts back with a token — perfect for human approvals or external systems.",
        ],
      },
      {
        heading: "Error handling",
        bullets: [
          "Retry: array of catch-and-retry rules with `MaxAttempts`, `IntervalSeconds`, `BackoffRate`, `MaxDelaySeconds`, `JitterStrategy`.",
          "Catch: route exceptions to error-handler state.",
          "Common error names: `States.ALL`, `States.Timeout`, `States.TaskFailed`, `Lambda.ServiceException`, `Lambda.AWSLambdaException`.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Standard max duration", v: "1 year" },
      { k: "Express max duration", v: "5 min" },
      { k: "Standard exec rate", v: "2,000 / sec start" },
      { k: "Express exec rate", v: "100,000 / sec start" },
      { k: "Distributed Map", v: "Up to 10,000 concurrent + millions of items" },
    ],
    howAsked: [
      "“Orchestrate multi-step workflow” → Step Functions.",
      "“Wait for a human to approve” → .waitForTaskToken.",
      "“Process millions of S3 records in parallel” → Distributed Map (Express child).",
      "“Long-running workflow that takes days” → Standard.",
    ],
    cases: [
      {
        title: "Human approval gate",
        scenario: "Loan-approval workflow needs an officer to approve before disbursing.",
        answer: "Task state with `.waitForTaskToken`; send email/SMS containing approval URL → user clicks → API → SendTaskSuccess/Failure with the token.",
        why: "Otherwise the state machine would have to poll, wasting transitions.",
      },
      {
        title: "Massive parallel file processing",
        scenario: "Workflow must process 4M records from an S3 manifest.",
        answer: "Distributed Map: input = S3 object; child workflows (Express) run with 1000 concurrency.",
        why: "Inline Map maxes around 40 concurrent and ASL history. Distributed Map handles millions cleanly.",
      },
    ],
    questions: [
      {
        q: "Which integration pattern lets an external callback resume a workflow?",
        options: [
          "Request-Response.",
          "Run-a-Job (.sync).",
          "Wait-for-Callback (.waitForTaskToken).",
          "Map state.",
        ],
        correct: 2,
        explanation: ".waitForTaskToken pauses the state until SendTaskSuccess/Failure with the token arrives.",
      },
      {
        q: "Which type is BEST for a high-volume, sub-second IoT event handler?",
        options: [
          "Standard workflow.",
          "Express workflow (sync).",
          "Standard with Distributed Map.",
          "Lambda destination chain.",
        ],
        correct: 1,
        explanation: "Express is built for high-throughput, short-duration. Sync mode returns the result to the caller.",
      },
    ],
    gotchas: [
      "Express has no visual history — log to CloudWatch.",
      "Standard counts state transitions; refactor minimize transitions for cost.",
      "Optimize integrations: 'optimized SDK' uses fewer transitions than 'AWS SDK'.",
    ],
  },
  {
    id: "kinesis",
    number: 11,
    phase: 3,
    title: "Kinesis — Streaming Services",
    domain: "Development",
    blurb:
      "Four products under one umbrella. Most-tested: Data Streams (real-time, multi-consumer) and Data Firehose (managed delivery to S3/Redshift/OpenSearch). Know shards, capacity modes, retention, consumer fan-out.",
    sections: [
      {
        heading: "Kinesis Data Streams (KDS)",
        bullets: [
          "Real-time, ordered, replayable stream. Split into shards.",
          "Per shard: 1 MB/s write or 1,000 records/s ; 2 MB/s read.",
          "Retention: 24 hours default, up to 365 days.",
          "**Capacity modes**: Provisioned (manual shards) or On-Demand (auto, up to ~200 MB/s).",
          "**Consumer types**: classic (poll, 2 MB/s shared) or **Enhanced Fan-Out** (push, 2 MB/s per consumer, < 70 ms latency).",
          "Partition key → hash → shard. Choose high-cardinality keys to avoid hot shards.",
        ],
      },
      {
        heading: "Producers & consumers",
        bullets: [
          "**Producers**: SDK, KPL (Kinesis Producer Library), Kinesis Agent (log files), CloudWatch Logs subscription filter.",
          "**Consumers**: SDK (GetRecords), KCL (Kinesis Client Library — handles shard checkpointing in DynamoDB), Lambda ESM, Firehose.",
          "Resharding: split shards (split a hot shard) or merge (combine cold shards).",
        ],
      },
      {
        heading: "Kinesis Data Firehose",
        bullets: [
          "**Near real-time** (buffer 60s+ or 1 MB+).",
          "Fully managed delivery to S3, Redshift (via S3), OpenSearch, Splunk, HTTP endpoints, partners (Datadog, MongoDB, etc).",
          "Built-in transformation via Lambda.",
          "Automatic compression (GZIP, ZIP, Snappy) and KMS encryption.",
          "**No retention**: data passes through; on failure → backup to S3.",
          "**Buffer size & interval** are the levers: tune for cost vs latency.",
        ],
      },
      {
        heading: "Managed Service for Apache Flink (was Kinesis Data Analytics)",
        bullets: [
          "Run Flink (Java/Python) for streaming analytics: window aggregations, joins, anomaly detection.",
          "Consumes from KDS, Firehose, MSK. Outputs to KDS, Firehose, S3.",
          "Use for: real-time dashboards, fraud detection, ETL.",
        ],
      },
      {
        heading: "Kinesis Video Streams",
        bullets: [
          "Ingest video/audio/time-encoded data from cameras/devices.",
          "Integrates with Rekognition Video, SageMaker.",
          "Rarely tested on DVA-C02 — know it exists.",
        ],
      },
      {
        heading: "Decision matrix",
        table: {
          headers: ["Need", "Choose"],
          rows: [
            ["Real-time, multiple custom consumers, replay", "Data Streams"],
            ["Just dump to S3/Redshift/OpenSearch", "Firehose"],
            ["Stream analytics with SQL/Flink", "Managed Apache Flink"],
            ["Reliable queue with order, no analytics", "SQS FIFO (not Kinesis)"],
            ["Event router for AWS service events", "EventBridge (not Kinesis)"],
          ],
        },
      },
    ],
    keyNumbers: [
      { k: "Shard write", v: "1 MB/s or 1,000 rec/s" },
      { k: "Shard read", v: "2 MB/s" },
      { k: "Enhanced fan-out", v: "2 MB/s per consumer" },
      { k: "Retention", v: "24 h – 365 days" },
      { k: "Firehose buffer", v: "60 s – 900 s, 1 MB – 128 MB (typical)" },
    ],
    howAsked: [
      "“Real-time clickstream with multiple downstreams” → Data Streams + Enhanced Fan-Out.",
      "“Deliver to S3 with no code” → Firehose.",
      "“Need to replay last 7 days” → Data Streams retention configured ≥ 7d.",
      "“Throughput exceeded one shard” → split shards or move to on-demand.",
      "“IoT video” → Kinesis Video Streams.",
    ],
    cases: [
      {
        title: "Real-time + batch",
        scenario: "A clickstream needs real-time fraud detection AND landing in S3 for batch ML.",
        answer: "Producers → KDS. Consumer 1: Lambda / Flink for fraud detection. Consumer 2: Firehose → S3.",
        why: "KDS supports multiple independent consumers. Firehose handles managed delivery.",
      },
      {
        title: "Hot shard",
        scenario: "One partition key generates 80% of traffic and the shard is being throttled.",
        answer: "Use a high-cardinality partition key (e.g., `userId#millisecond`), or split the shard.",
        why: "Single shard caps at 1 MB/s ingest; spreading load across shards is the fix.",
      },
    ],
    questions: [
      {
        q: "Which is the LEAST operational overhead way to deliver streaming JSON to OpenSearch?",
        options: [
          "Self-managed consumer using KCL writes to OpenSearch.",
          "Kinesis Data Firehose with OpenSearch destination.",
          "Lambda subscribed to a KDS stream writes to OpenSearch.",
          "SQS → EC2 → OpenSearch.",
        ],
        correct: 1,
        explanation: "Firehose handles batching, retries, compression, and delivery — zero code.",
      },
      {
        q: "An app needs sub-100ms delivery latency to multiple consumers on the same Kinesis stream. The CORRECT mode is:",
        options: [
          "Classic shared throughput.",
          "Enhanced Fan-Out.",
          "On-Demand mode.",
          "Firehose buffer 60s.",
        ],
        correct: 1,
        explanation: "Enhanced Fan-Out gives each consumer its own 2 MB/s pipe and < 70ms latency.",
      },
    ],
    gotchas: [
      "Data Streams has retention; Firehose does not.",
      "On-Demand mode for Data Streams auto-scales but caps around 200 MB/s.",
      "Lambda + Kinesis: parallelization factor 1–10 per shard.",
    ],
  },
];
