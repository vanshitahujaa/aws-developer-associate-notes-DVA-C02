import type { Topic } from "./types";

export const phase7Topics: Topic[] = [
  {
    id: "cloudwatch",
    number: 24,
    phase: 7,
    title: "CloudWatch — Logs, Metrics, Alarms",
    domain: "Troubleshooting",
    blurb:
      "CloudWatch is the observability backbone of AWS. Logs, metrics, alarms, dashboards, Logs Insights, Embedded Metric Format, Synthetics. Domain 4 leans heavily on this service.",
    sections: [
      {
        heading: "Logs",
        bullets: [
          "**Log Groups** contain **Log Streams** which contain **Log Events**.",
          "Group-level retention (1 day – 10 years, default never expire — set this!).",
          "Encryption with KMS optional.",
          "**Subscription filters**: stream events real-time to Kinesis Data Streams, Firehose, or Lambda.",
          "**Cross-account / cross-region subscription** via destination.",
          "**Metric Filters**: extract numeric values from log events and publish as a CloudWatch metric.",
        ],
      },
      {
        heading: "Log classes — Standard vs Infrequent Access",
        bullets: [
          "**Standard** (default): full-featured — Live Tail, Logs Insights queries, metric filters, subscription filters, alarms, embedded metric format.",
          "**Infrequent Access (IA)**: ~50% cheaper ingestion; designed for compliance/audit archives you rarely query.",
          "IA limitations: NO Live Tail, NO subscription filters, NO metric filters/alarms, NO embedded metric format. Logs Insights queries still work but at a higher per-scan cost.",
          "Pick IA when the prompt mentions 'reduce logging cost', 'compliance retention', 'rarely queried' — but read on for feature loss.",
          "Class is set at log-group creation; cannot be changed later (must create a new group).",
        ],
      },
      {
        heading: "CloudWatch Logs Insights",
        bullets: [
          "SQL-like query language for logs.",
          "Sample query: `fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20`.",
          "Built-in commands: `parse`, `stats`, `display`, `sort`, `limit`, `head`, `tail`, `bin()`.",
          "Run on multiple log groups; results scoped to 7 days history by default.",
        ],
      },
      {
        heading: "Metrics",
        bullets: [
          "Named, with **namespace** (e.g., `AWS/Lambda`, `AWS/EC2`, custom `MyApp/Orders`) + **dimensions** (KV pairs).",
          "Default frequency: 5 min (basic) or 1 min (detailed monitoring — extra cost for EC2).",
          "**High-resolution metrics**: 1 s granularity for custom metrics.",
          "Retention: 15 months (downsampled over time).",
        ],
      },
      {
        heading: "Custom metrics via Embedded Metric Format (EMF)",
        bullets: [
          "Write a JSON log line that includes a special `_aws` block with metric definitions.",
          "CloudWatch auto-extracts metrics from those logs — async, no API call.",
          "Lower cost than PutMetricData; ideal for high-throughput Lambdas.",
        ],
        code: `{
  "_aws": {
    "Timestamp": 1718000000000,
    "CloudWatchMetrics": [{
      "Namespace": "MyApp",
      "Metrics": [{ "Name": "Latency", "Unit": "Milliseconds" }],
      "Dimensions": [["Service"]]
    }]
  },
  "Service": "checkout",
  "Latency": 42
}`,
      },
      {
        heading: "Alarms",
        bullets: [
          "Comparison + Threshold + Evaluation Periods + Datapoints to alarm.",
          "States: OK, ALARM, INSUFFICIENT_DATA.",
          "Direct actions: SNS, EC2 actions (reboot/stop), Auto Scaling, ECS service scaling, SSM OpsItem / Incident Manager.",
          "**Composite alarms**: AND/OR of other alarms; reduce noise.",
          "**Anomaly detection alarms**: ML-based dynamic threshold.",
          "Missing data: `notBreaching` / `breaching` / `ignore` / `missing`.",
        ],
      },
      {
        heading: "Alarm integrations — event-driven ops & auto-remediation",
        bullets: [
          "Every alarm state change is published to EventBridge on the default bus as a `CloudWatch Alarm State Change` event.",
          "EventBridge rules can fan that out to **Lambda** (remediation), **Step Functions** (multi-step runbook), **SSM Automation** (managed remediation docs), **SNS** (PagerDuty / Opsgenie / Slack), **SQS**, or a target in another account.",
          "Pattern: ALARM on `HighErrorRate` → EventBridge rule → SSM Automation `AWS-RestartEC2Instance` (or custom Lambda).",
          "Why this matters: AWS exam questions about 'self-healing', 'automated remediation', or 'event-driven ops' nearly always want this pipeline.",
          "Composite alarms + EventBridge = noise-suppressed incident routing.",
        ],
      },
      {
        heading: "Dashboards & Synthetics",
        bullets: [
          "**Dashboards**: free up to 3; ~$3/month per beyond. JSON-defined.",
          "**Synthetics Canaries**: scheduled scripts (Node Puppeteer / Python Selenium) that ping endpoints & flow-test.",
          "**ServiceLens / Contributor Insights**: cross-link logs / metrics / X-Ray + identify top contributors.",
        ],
      },
      {
        heading: "CloudWatch agents — names are confusing on purpose",
        bullets: [
          "**CloudWatch Unified Agent** (current, recommended): single binary that ships BOTH OS-level metrics (memory, disk, swap, processes — none of which EC2 emits natively) AND log files to CloudWatch. Also collects StatsD/collectd custom metrics.",
          "**Legacy 'CloudWatch Logs Agent'** (`awslogs`): older, log-only; deprecated. If a question shows `awslogs.conf`, it's the legacy agent.",
          "Configuration via JSON; the wizard `amazon-cloudwatch-agent-config-wizard` generates a starter.",
          "Deploy and manage at fleet scale via **Systems Manager Distributor + State Manager**.",
          "Memory/disk metrics on EC2 require the Unified Agent — they're NOT in the default EC2 metric set.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Default metric retention", v: "15 months (downsampled)" },
      { k: "Default log retention", v: "Never expire (set it!)" },
      { k: "High-res custom metrics", v: "1 second" },
      { k: "Logs Insights history", v: "7 days default" },
    ],
    howAsked: [
      "“Query logs with SQL-like syntax” → CloudWatch Logs Insights.",
      "“Cheap custom metrics from Lambda” → EMF.",
      "“Alarm on >5% 5xx for 5 min” → metric filter or CloudFront 5xx metric → alarm.",
      "“Page on multi-alarm condition” → Composite alarm.",
      "“Synthetic monitoring of login flow” → Synthetics canary.",
      "“Auto-remediate when an alarm fires” → alarm → EventBridge rule → Lambda / SSM Automation / Step Functions.",
    ],
    rootCauses: [
      { symptom: "Logs Insights query returns 'no data'", cause: "Log group is in Infrequent Access class (Insights queries cost more there) OR the query time window doesn't overlap retention." },
      { symptom: "Alarm stuck in INSUFFICIENT_DATA", cause: "Metric isn't being published — wrong namespace/dimensions, or the source service hasn't reported in the period; check 'Missing data treatment'." },
      { symptom: "Memory / disk metrics missing on EC2", cause: "Default EC2 metric set doesn't include them — install the CloudWatch Unified Agent." },
      { symptom: "CloudWatch log group fills with $$$ surprise bill", cause: "Default retention is 'Never expire'. Set retention per group; consider IA class for archival logs." },
      { symptom: "Subscription filter not invoking Lambda / Firehose", cause: "Destination resource policy doesn't allow `logs.<region>.amazonaws.com`; or filter pattern matches nothing." },
      { symptom: "Custom metric calls are dominating cost", cause: "Using PutMetricData per-invocation. Switch to EMF — metrics are extracted from log events at ingestion." },
    ],
    cases: [
      {
        title: "Find errors over the weekend",
        scenario: "Need to know how many Python tracebacks happened in the last 24 hours.",
        answer: "Logs Insights query: `fields @message | filter @message like /Traceback/ | stats count() by bin(1h)`.",
        why: "Logs Insights is the fastest path; metric filter would be needed for ongoing alarms.",
      },
      {
        title: "Cheaper Lambda metrics",
        scenario: "Custom PutMetricData is dominating cost.",
        answer: "Switch to EMF: write JSON lines with `_aws` block; metrics extracted from logs at no API charge.",
        why: "PutMetricData has cost per call; EMF charges only the log bytes.",
      },
    ],
    questions: [
      {
        q: "Which feature converts log events into a CloudWatch metric continuously?",
        options: [
          "Logs Insights query.",
          "Metric Filter.",
          "Subscription Filter.",
          "CloudWatch Agent.",
        ],
        correct: 1,
        explanation: "Metric Filter watches a log group and emits a metric per match.",
      },
      {
        q: "A developer wants to alarm only when 5xx error rate spikes above the seasonal norm. The CORRECT alarm type is:",
        options: [
          "Static threshold.",
          "Composite alarm.",
          "Anomaly detection alarm.",
          "Manual alarm.",
        ],
        correct: 2,
        explanation: "Anomaly detection uses ML to build a band; alarm on excursion.",
      },
    ],
    gotchas: [
      "Default log retention = forever. Set it to your retention need.",
      "PutMetricData has cost; EMF is cheaper at scale.",
      "Alarms only fire on state changes — set actions on ALARM / OK / INSUFFICIENT_DATA appropriately.",
    ],
  },
  {
    id: "xray",
    number: 25,
    phase: 7,
    title: "X-Ray — Distributed Tracing",
    domain: "Troubleshooting",
    blurb:
      "End-to-end request tracing across services. SDK + daemon collect segments; X-Ray stitches them into a service map. Annotations are searchable; metadata is not. Sampling controls cost.",
    sections: [
      {
        heading: "Core concepts",
        bullets: [
          "**Trace**: a complete request, identified by a Trace ID.",
          "**Segment**: work done by one service.",
          "**Subsegment**: nested work within a segment (downstream calls, code blocks).",
          "**Service map**: visual graph; nodes are services, edges are dependencies, colors signal health.",
        ],
      },
      {
        heading: "Annotations vs Metadata — exam favorite",
        table: {
          headers: ["", "Annotations", "Metadata"],
          rows: [
            ["Indexed", "Yes", "No"],
            ["Searchable in filter expressions", "Yes", "No"],
            ["Limit", "50 per trace", "—"],
            ["Use", "Key dimensions (userId, region, tenant)", "Arbitrary context (full request payload)"],
          ],
        },
      },
      {
        heading: "Setup",
        bullets: [
          "**Lambda**: enable Active Tracing on the function; import `aws-xray-sdk-core` and `captureAWS(require('aws-sdk'))`.",
          "**EC2/ECS**: install the X-Ray daemon (UDP port 2000). The daemon ships segments to the API.",
          "**API Gateway / ALB / SQS / SNS**: enable tracing on the resource.",
        ],
      },
      {
        heading: "Trace propagation — how a trace survives across services",
        bullets: [
          "Trace context travels in the HTTP header **`X-Amzn-Trace-Id`** (format `Root=1-...;Parent=...;Sampled=1`).",
          "API Gateway, ALB, App Mesh, and the X-Ray SDK auto-INJECT the header on outgoing calls and auto-EXTRACT it on incoming calls — that's how a Lambda → DynamoDB → another Lambda chain shows up as one trace.",
          "If a downstream service strips or doesn't forward the header, the trace breaks: you'll see two disjointed traces instead of one connected service map.",
          "Custom HTTP clients (raw `fetch`, `requests`) must propagate the header manually OR be wrapped with the SDK's `captureHTTPs` / `captureAllHttpClients` helpers.",
          "For async hops (SQS, SNS, EventBridge, Step Functions): the header is carried in message system attributes / event context — make sure your code passes the segment forward.",
          "**Sampled=1** = the request is being recorded; **Sampled=0** = it isn't. Sampling decision is made at the first SDK-instrumented entry and propagated unchanged.",
        ],
      },
      {
        heading: "Sampling",
        bullets: [
          "Default rule: 1 request/sec + 5% of additional requests.",
          "Configure custom sampling rules (priority, fixed rate, reservoir size, match on host/URL/method/service).",
          "Rules are centralized in X-Ray service; SDKs poll updates.",
        ],
      },
      {
        heading: "Filter expressions",
        bullets: [
          "`service(\"orders\") AND fault`",
          "`annotation.tenant = \"acme\" AND responsetime > 1`",
          "`http.status >= 500`",
        ],
      },
      {
        heading: "X-Ray Insights",
        bullets: [
          "Detects anomalies in service map; correlates with related traces.",
          "Auto-generates insights with root cause hints.",
        ],
      },
      {
        heading: "AWS Distro for OpenTelemetry (ADOT)",
        bullets: [
          "Alternative to native X-Ray SDK; vendor-neutral tracing.",
          "Can export to X-Ray AND third-party tools.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Annotations per trace", v: "50 (key/value)" },
      { k: "Default sampling", v: "1 req/sec + 5%" },
      { k: "Trace data retention", v: "30 days" },
    ],
    howAsked: [
      "“End-to-end request tracing / service map” → X-Ray.",
      "“Find slow traces filtered by tenant” → annotation + filter expression.",
      "“Don't bill for every trace” → sampling rules.",
      "“Trace doesn't show downstream service” → enable tracing on that service.",
      "“Trace breaks at a specific hop” → that hop isn't propagating the `X-Amzn-Trace-Id` header.",
    ],
    rootCauses: [
      { symptom: "Service map shows two disjointed traces instead of one", cause: "Downstream service isn't propagating `X-Amzn-Trace-Id` — wrap the HTTP client with `captureHTTPs` or pass the header manually." },
      { symptom: "Lambda chain shown but DynamoDB call missing as subsegment", cause: "SDK isn't instrumented — wrap with `AWSXRay.captureAWS(require('aws-sdk'))` (or v3 `captureAWSv3Client`)." },
      { symptom: "Traces never appear from EC2/ECS", cause: "X-Ray daemon not running (or not reachable on UDP 2000); task role missing `xray:PutTraceSegments`." },
      { symptom: "Some traces missing even though tracing is on", cause: "Sampling rule — only 1 req/sec + 5% by default. Add a custom rule for the specific service/path you care about." },
      { symptom: "annotation.x filter returns nothing", cause: "It was added as metadata, not annotation. Metadata is not indexed/searchable." },
    ],
    cases: [
      {
        title: "Searching by tenant",
        scenario: "Need to find all traces for tenant 'acme' that took > 1s.",
        answer: "Code adds `addAnnotation('tenant', tenantId)`. Filter expression: `annotation.tenant = \"acme\" AND responsetime > 1`.",
        why: "Annotations are indexed and queryable; metadata is not.",
      },
      {
        title: "API GW + Lambda + DDB chain",
        scenario: "Want a service map showing each hop with latency.",
        answer: "Enable X-Ray on API Gateway stage, enable Active Tracing on Lambda, instrument SDK with `captureAWS(require('aws-sdk'))`. DynamoDB calls show as subsegments.",
        why: "Each hop must opt in; otherwise the map shows blanks.",
      },
    ],
    questions: [
      {
        q: "A trace must be searchable by `region` later. The CORRECT code is:",
        options: [
          "segment.addMetadata('region', 'us-east-1');",
          "segment.addAnnotation('region', 'us-east-1');",
          "segment.putSubsegment('region');",
          "segment.setTraceId('region:us-east-1');",
        ],
        correct: 1,
        explanation: "Annotations are indexed and queryable. Metadata is not.",
      },
      {
        q: "Where does the X-Ray daemon run for EC2-based apps?",
        options: [
          "On AWS (managed service).",
          "On the EC2 instance, listening on UDP 2000.",
          "Inside the app's Lambda layer.",
          "In API Gateway.",
        ],
        correct: 1,
        explanation: "EC2/ECS needs the daemon on the host (or sidecar); Lambda runs the daemon inside its environment when Active Tracing is on.",
      },
    ],
    gotchas: [
      "Annotation vs metadata — guaranteed exam question.",
      "Every hop must enable X-Ray; otherwise the map has gaps.",
      "Sampling rules can be edited centrally — no code redeploy.",
    ],
  },
  {
    id: "troubleshooting-patterns",
    number: 26,
    phase: 7,
    title: "Troubleshooting Patterns — HTTP Codes, Retries, Throttling",
    domain: "Troubleshooting",
    blurb:
      "Knowing what each error means is half the battle. Memorize the HTTP status families, common SDK exceptions, and standard retry patterns (exponential backoff + jitter).",
    sections: [
      {
        heading: "HTTP status families",
        table: {
          headers: ["Code", "Meaning", "Typical AWS cause"],
          rows: [
            ["400 Bad Request", "Malformed", "Missing param, JSON parse, validation failed"],
            ["401 Unauthorized", "No auth / bad auth", "Missing/expired token; SigV4 fail"],
            ["403 Forbidden", "Auth OK, not allowed", "IAM deny; bucket policy; CORS denied; account locked"],
            ["404 Not Found", "Resource gone / never was", "Wrong path; bucket not in region"],
            ["409 Conflict", "Duplicate / state mismatch", "S3 bucket name taken; DynamoDB conditional check"],
            ["429 Too Many Requests", "Throttled", "API GW throttle; service-level rate limit"],
            ["500 Internal Server Error", "Server bug", "Lambda crashed; integration error"],
            ["502 Bad Gateway", "Upstream bad response", "Lambda invalid response shape; ALB→target error"],
            ["503 Service Unavailable", "Service maxed / down", "Quota exceeded; AZ outage"],
            ["504 Gateway Timeout", "Upstream took too long", "Lambda 29s API GW; integration timeout"],
          ],
        },
      },
      {
        heading: "Common SDK exceptions",
        bullets: [
          "**ThrottlingException** — slow down. Backoff and retry.",
          "**ProvisionedThroughputExceededException** (DynamoDB) — exceeded capacity. Backoff or scale.",
          "**ConditionalCheckFailedException** — your condition didn't match. Don't retry blindly.",
          "**ResourceNotFoundException** — typo or wrong region.",
          "**AccessDeniedException / UnauthorizedOperation** — IAM issue.",
          "**LimitExceededException** — soft service quota hit; request raise.",
          "**RequestLimitExceeded** (EC2) — API throttle.",
          "**ServiceUnavailableException** — transient; retry.",
        ],
      },
      {
        heading: "Retry strategies",
        bullets: [
          "**Exponential backoff**: 1s, 2s, 4s, 8s, 16s... (capped).",
          "**Jitter**: randomize delay to avoid thundering herd. AWS SDKs include `equal_jitter`/`full_jitter` strategies.",
          "**Maximum retries**: configurable on SDK (default 3 for most).",
          "**Circuit breaker**: stop retrying after sustained failures; resume after cooldown.",
        ],
      },
      {
        heading: "Common diagnostic flows",
        bullets: [
          "**Lambda timeout** → check timeout config + CloudWatch Logs duration + memory.",
          "**API GW 502** → almost always Lambda returned wrong response shape (proxy mode) or threw uncaught.",
          "**API GW 504** → integration > 29s. Move to async / Step Functions.",
          "**DynamoDB throttle** → metric `UserErrors`/`ThrottledRequests`; check hot partitions.",
          "**S3 SlowDown / 503** → bursty / extremely high request rate. S3 now auto-partitions prefixes aggressively, so this is much rarer than it used to be — but still possible on sudden ramps. Pre-warm with a gradual ramp, distribute keys across prefixes for sustained > 5,500 GET/s, or front with CloudFront.",
          "**Lambda 'ENI provisioning' errors** → VPC subnet IP exhaustion.",
        ],
      },
      {
        heading: "IAM troubleshooting — 403 AccessDenied is never just one thing",
        bullets: [
          "**Explicit Deny ALWAYS wins.** Walk the layers in order: SCP → permissions boundary → identity policy → session policy → resource policy → KMS key policy.",
          "**Cross-account access requires BOTH halves**: identity policy in the caller's account AND resource policy on the target. Either side missing = 403.",
          "**KMS is the silent killer.** S3 SSE-KMS / encrypted EBS / encrypted SQS / encrypted Secrets all add a hidden `kms:Decrypt` (and often `kms:GenerateDataKey`) requirement. The S3 GetObject can be allowed yet the request fails because the principal isn't in the key policy.",
          "**Conditions on the policy** can silently exclude you: source IP, source VPC, MFA required, tag mismatch, requested region.",
          "**Confused-deputy guards**: a service-to-service call (S3→Lambda, SNS→SQS) fails if `aws:SourceArn` / `aws:SourceAccount` don't match.",
          "**Tools, in order of leverage**: (1) **IAM Policy Simulator** for the principal+action+resource combo, (2) **IAM Access Analyzer policy validation** to lint, (3) **CloudTrail** event for the exact denied call — `errorCode = AccessDenied` and `errorMessage` usually names the missing permission, (4) **Last Accessed** info on the role to confirm whether the action is even attempted.",
          "**Common gotcha**: assumed-role session has the role's permissions, NOT the assuming user's — and a session policy passed at AssumeRole can further restrict.",
        ],
      },
    ],
    keyNumbers: [
      { k: "API GW integration timeout", v: "29 s" },
      { k: "ALB target timeout", v: "Up to 4000 sec (idle)" },
      { k: "Default SDK retries", v: "3" },
    ],
    howAsked: [
      "“Code 429 / ProvisionedThroughputExceeded” → backoff + jitter, increase capacity, or on-demand.",
      "“502 Bad Gateway from API Gateway → Lambda” → wrong response payload shape.",
      "“504 Gateway Timeout” → backend too slow; offload to async.",
      "“ConditionalCheckFailed” → app logic; don't retry.",
    ],
    rootCauses: [
      { symptom: "API Gateway 502", cause: "Lambda response shape wrong, or Lambda threw an uncaught exception." },
      { symptom: "API Gateway 504", cause: "Integration > 29s; offload to SQS / Step Functions and return 202." },
      { symptom: "Lambda timeout", cause: "Insufficient memory (CPU-bound) or downstream call without its own timeout — set client timeouts inside the handler." },
      { symptom: "DynamoDB ProvisionedThroughputExceeded", cause: "Hot partition. Re-shard the PK or move to on-demand for spiky load." },
      { symptom: "S3 503 SlowDown", cause: "Burst beyond per-prefix scaling. Pre-warm with gradual ramp; distribute keys; CloudFront for reads." },
      { symptom: "ConditionalCheckFailedException", cause: "Logic mismatch (concurrent writer changed state). DO NOT retry blindly — re-read, re-evaluate." },
      { symptom: "AccessDenied with no detail", cause: "Walk: SCP → boundary → identity → resource → KMS key policy. Check CloudTrail for the exact action and resource." },
      { symptom: "Throttling spreading across services", cause: "Synchronous retry storm without jitter; switch to full-jitter backoff and a circuit breaker." },
      { symptom: "Lambda 'ENI provisioning' errors", cause: "VPC subnet IP exhaustion — add bigger subnets or more AZs." },
    ],
    cases: [
      {
        title: "Spiky DynamoDB",
        scenario: "Provisioned table throttles during a 3× spike at noon every day.",
        answer: "Either enable auto scaling, switch to on-demand for that period, or add ElastiCache/DAX for read hot keys.",
        why: "Cap is per-partition + per-table. Hot partitions need either rearchitecting keys or caching.",
      },
      {
        title: "API GW 502 mystery",
        scenario: "Lambda runs fine but API Gateway returns 502.",
        answer: "Lambda proxy mode requires `{ statusCode, headers, body, isBase64Encoded }`. Returning bare strings produces 502.",
        why: "Lambda returns the WRONG shape → API GW can't translate.",
      },
    ],
    questions: [
      {
        q: "Which strategy mitigates thundering-herd retries after a throttling burst?",
        options: [
          "Exponential backoff without jitter.",
          "Exponential backoff with jitter.",
          "Immediate retry loop.",
          "Switch to synchronous calls.",
        ],
        correct: 1,
        explanation: "Jitter randomizes the next retry time, preventing all clients from retrying in lockstep.",
      },
      {
        q: "Which AWS service routinely returns HTTP 504 when integration backend takes too long?",
        options: [
          "API Gateway REST integration.",
          "S3 PUT.",
          "DynamoDB GetItem.",
          "SQS ReceiveMessage.",
        ],
        correct: 0,
        explanation: "API Gateway integration timeout is 29s. Exceeding it → 504.",
      },
    ],
    gotchas: [
      "Don't retry on ConditionalCheckFailed; it's logic, not transient.",
      "Lambda proxy response shape is strict.",
      "Throttling = capacity; AccessDenied = permissions; ResourceNotFound = wrong name/region.",
    ],
  },
];
