import type { Topic } from "./types";

export const phase6Topics: Topic[] = [
  {
    id: "ecs-fargate",
    number: 21,
    phase: 6,
    title: "ECS / Fargate / ECR / Copilot",
    domain: "Development",
    blurb:
      "Managed container orchestration. ECS is the control plane. Two launch types: EC2 (you manage hosts) or Fargate (serverless). ECR stores images. Copilot is the developer CLI. Know task vs execution roles cold.",
    sections: [
      {
        heading: "Core concepts",
        bullets: [
          "**Cluster** — logical group of capacity (EC2 instances or Fargate).",
          "**Task definition** — blueprint: containers, CPU/memory, env vars, IAM, networking, volumes.",
          "**Task** — running instance of a task definition (typically 1 container, can be multi).",
          "**Service** — long-running task; ensures N tasks running; integrates with ALB target group.",
          "**Launch types**: EC2 (cheaper at scale, you patch) or Fargate (serverless, pay per task).",
        ],
      },
      {
        heading: "Task role vs Task execution role — CRITICAL distinction",
        table: {
          headers: ["Role", "What it does", "Examples"],
          rows: [
            ["Task role", "What your APP CODE can call at runtime", "DynamoDB, S3, Secrets Manager"],
            ["Task execution role", "What ECS NEEDS to start the task", "ECR pull, CloudWatch Logs, Secrets Manager value injection"],
          ],
        },
      },
      {
        heading: "Networking modes",
        bullets: [
          "**awsvpc** (required for Fargate; recommended for EC2): each task gets its own ENI + security group.",
          "**bridge** (EC2 only): Docker bridge; uses host port mappings.",
          "**host**: container shares host network. No dynamic ports.",
          "**none**: no networking.",
        ],
      },
      {
        heading: "Service auto scaling",
        bullets: [
          "Application Auto Scaling on `ECSServiceAverageCPUUtilization`, memory, or custom CloudWatch metric.",
          "Target tracking / step scaling / scheduled.",
          "Capacity providers (FARGATE, FARGATE_SPOT, EC2) blend cost/capacity.",
        ],
      },
      {
        heading: "ECR — Elastic Container Registry",
        bullets: [
          "Private (and public) container registry; integrates with IAM.",
          "Image scanning (basic or enhanced via Inspector) for vulnerabilities.",
          "Lifecycle policies to delete old images.",
          "Cross-region replication for DR.",
          "Authentication: `aws ecr get-login-password | docker login`.",
        ],
      },
      {
        heading: "Copilot CLI",
        bullets: [
          "`copilot init` scaffolds an app + service + environment + CFN templates.",
          "Optimized for ECS Fargate workflows.",
          "Generates CodePipeline `copilot pipeline init`.",
          "Useful when you don't want to write CFN by hand.",
        ],
      },
      {
        heading: "Common patterns",
        bullets: [
          "**App → S3**: app code in container uses Task Role with s3:* on bucket.",
          "**App → Secrets Manager**: either app reads via Task Role at runtime, OR Task Execution Role pulls secret into env var at start.",
          "**Service → ALB**: target group registers per-task IP (awsvpc).",
          "**Scheduled tasks**: EventBridge rule → ECS RunTask target.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Fargate CPU", v: "0.25 – 16 vCPU" },
      { k: "Fargate memory", v: "0.5 – 120 GB (limited combos)" },
      { k: "Tasks per service", v: "5,000 (soft)" },
      { k: "Container env var size", v: "Limited by task def size" },
    ],
    howAsked: [
      "“Run containers without managing servers” → Fargate.",
      "“Cheapest for steady, high-utilization containers” → EC2 launch + Spot.",
      "“App can't pull from ECR” → Task EXECUTION role missing.",
      "“App can't write to DynamoDB” → Task role missing perms.",
      "“Scheduled batch container job” → EventBridge → ECS RunTask.",
    ],
    cases: [
      {
        title: "ECR pull fails",
        scenario: "Task launches but containers fail to start with 'CannotPullContainerError'.",
        answer: "Add `AmazonECSTaskExecutionRolePolicy` (or equivalent ecr:GetAuthorizationToken, ecr:BatchCheckLayerAvailability, ecr:GetDownloadUrlForLayer, ecr:BatchGetImage) to the task EXECUTION role.",
        why: "Pulling images is plumbing — execution role, not task role.",
      },
      {
        title: "App AccessDenied on DynamoDB",
        scenario: "Container code calls DynamoDB and gets AccessDenied.",
        answer: "Add `dynamodb:GetItem/PutItem/...` to the TASK ROLE (not execution role).",
        why: "Task role = runtime app permissions. Execution role = ECS plumbing.",
      },
    ],
    questions: [
      {
        q: "An ECS task in awsvpc mode behind an ALB cannot be reached. The MOST common cause is:",
        options: [
          "ALB security group doesn't allow ingress from the task SG (and vice versa).",
          "Task role missing s3:GetObject.",
          "ECR scan failing.",
          "Wrong launch type.",
        ],
        correct: 0,
        explanation: "awsvpc gives the task its own SG; you must allow ALB→Task on the container port.",
      },
      {
        q: "Which role injects a Secrets Manager value into a container as an env var at startup?",
        options: ["Task role", "Task execution role", "ECS service role", "ECR role"],
        correct: 1,
        explanation: "Execution role pulls the secret BEFORE the container starts. Task role is what the running app uses.",
      },
    ],
    gotchas: [
      "Task role vs execution role — exam goldmine.",
      "awsvpc is the default for Fargate; you can't change it.",
      "Service auto scaling is via Application Auto Scaling, not EC2 ASG.",
    ],
  },
  {
    id: "caching",
    number: 22,
    phase: 6,
    title: "ElastiCache / DAX / Caching Patterns",
    domain: "Development",
    blurb:
      "ElastiCache: managed Redis (now Redis OSS / Valkey) and Memcached. DAX: DynamoDB-only microsecond cache. Plus the canonical patterns: lazy-loading, write-through, TTL, write-back, cache-aside.",
    sections: [
      {
        heading: "Redis vs Memcached",
        table: {
          headers: ["", "Redis", "Memcached"],
          rows: [
            ["Data structures", "Strings, lists, sets, sorted sets, hashes, streams, geo, hyperloglog", "Strings only"],
            ["Persistence", "Optional (RDB / AOF)", "None"],
            ["Replication", "Multi-AZ with auto-failover", "No"],
            ["Sharding", "Cluster mode (16,384 slots)", "Native partitioning (clients shard)"],
            ["Pub/Sub", "Yes", "No"],
            ["Multithreaded", "Single-thread per node", "Multithread per node"],
            ["Use", "Sessions, leaderboards, complex caches", "Simple object cache, scratch space"],
          ],
        },
      },
      {
        heading: "Caching patterns",
        bullets: [
          "**Lazy loading (cache-aside)**: app checks cache; on miss → DB → write cache. Pros: only requested data is cached. Cons: cache miss latency penalty; stale data possible.",
          "**Write-through**: every DB write also updates cache. Pros: fresh data. Cons: writes are slower; unused data fills cache.",
          "**TTL**: every cached item has an expiry. Bounds staleness; combine with lazy or write-through.",
          "**Write-back**: writes go to cache, async-flushed to DB. Risky (data loss).",
          "**Refresh-ahead**: pro-actively refresh near-expiry hot keys.",
        ],
      },
      {
        heading: "DAX",
        bullets: [
          "Lives in your VPC; cluster of nodes.",
          "Item cache (per-key) + Query cache (per query+args).",
          "Writes pass THROUGH DAX to the table; reads are served from cache.",
          "Same SDK, different endpoint.",
          "TTL: item cache 5 min default; query cache 5 min default.",
          "Microsecond reads vs ms for DynamoDB direct.",
        ],
      },
      {
        heading: "ElastiCache common scenarios",
        bullets: [
          "**Session store** for stateless web tier behind ALB.",
          "**Leaderboards** with Redis sorted sets.",
          "**Rate limiting** with Redis INCR + TTL.",
          "**API response cache** in front of slow backends.",
        ],
      },
      {
        heading: "Other caches in AWS",
        bullets: [
          "**CloudFront** — edge cache (HTTP).",
          "**API Gateway cache** — per-stage in-API cache.",
          "**S3 + CloudFront** — static assets.",
          "**AWS Global Accelerator** — not a cache; static IP + latency-based routing.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Redis cluster mode slots", v: "16,384" },
      { k: "DAX item TTL default", v: "5 minutes" },
      { k: "ElastiCache backup retention", v: "0 – 35 days" },
    ],
    howAsked: [
      "“Single-digit ms session cache for stateless web fleet” → ElastiCache (Redis).",
      "“Microsecond DynamoDB reads” → DAX.",
      "“Cache that fits all data types and supports failover” → Redis.",
      "“Simple key-value, multi-threaded, no persistence” → Memcached.",
      "“Cache pattern that won't store unused data” → Lazy loading.",
    ],
    cases: [
      {
        title: "Hot product page",
        scenario: "Product detail page loads same 10K items 50K times/sec.",
        answer: "Cache-aside (lazy load) into ElastiCache Redis with 5-min TTL; on miss, fetch DB. For DynamoDB-backed, use DAX (less code).",
        why: "Cache hits avoid the DB round-trip; TTL bounds staleness.",
      },
      {
        title: "Session affinity removal",
        scenario: "ALB sticky sessions are causing uneven load on EC2.",
        answer: "Externalize session to Redis (ElastiCache). Disable stickiness; any EC2 can serve any user.",
        why: "Stateless server pattern; canonical exam answer.",
      },
    ],
    questions: [
      {
        q: "Which is BEST for storing user shopping cart state across stateless EC2 instances?",
        options: [
          "EC2 instance memory.",
          "ElastiCache Redis.",
          "S3 with hashed key per user.",
          "DynamoDB stream.",
        ],
        correct: 1,
        explanation: "ElastiCache Redis is the classic session store; sub-ms, multi-AZ, supports TTL.",
      },
      {
        q: "Which DAX cache stores results from a specific Query API call?",
        options: ["Item cache", "Query cache", "Write-through cache", "TTL cache"],
        correct: 1,
        explanation: "DAX has TWO caches: item (GetItem) and query (Query/Scan results).",
      },
    ],
    gotchas: [
      "Redis is single-threaded per shard — vertical scale gives you more memory, not more CPU per shard.",
      "DAX writes-through; cache stays consistent with table for those operations.",
      "Memcached doesn't replicate or persist; data lost on node loss.",
    ],
  },
  {
    id: "cloudfront",
    number: 23,
    phase: 6,
    title: "CloudFront — Edge Distribution",
    domain: "Development",
    blurb:
      "Global CDN: caches static + dynamic content at edge locations. Signed URLs/cookies for private content; OAC for S3 origin lockdown; behaviors for path-based routing; functions/Lambda@Edge for request manipulation.",
    sections: [
      {
        heading: "Distribution model",
        bullets: [
          "**Origins**: S3, ALB, EC2, MediaPackage, custom HTTP.",
          "**Behaviors**: ordered path-pattern → origin + cache settings.",
          "**Edge locations**: 600+ globally; clients hit nearest.",
          "**Regional Edge Caches**: between edge and origin; larger TTL.",
        ],
      },
      {
        heading: "Caching",
        bullets: [
          "**Cache key**: by default, URI; can include headers, query strings, cookies via Cache Policy.",
          "**TTL**: min/max/default per behavior; honor or override origin Cache-Control.",
          "**Invalidation**: explicit purge (`/path/*`) — costs after the first 1000 paths/month.",
          "Versioned object keys (e.g., `app.abc123.js`) are cheaper than invalidations.",
        ],
      },
      {
        heading: "Private content",
        bullets: [
          "**Signed URLs**: one URL, one resource — like S3 presigned but for CF distribution.",
          "**Signed cookies**: many resources, one cookie — best for streaming sites.",
          "**Trusted key groups**: public keys uploaded to CF; you sign with the private key.",
          "**Origin Access Control (OAC)**: replaces OAI; signs requests to S3 origin so the bucket can be private.",
        ],
      },
      {
        heading: "Lambda@Edge vs CloudFront Functions",
        table: {
          headers: ["", "CloudFront Functions", "Lambda@Edge"],
          rows: [
            ["Runtime", "Lightweight JS", "Node, Python"],
            ["Latency", "< 1 ms", "< 5 ms"],
            ["Memory", "2 MB", "128 MB+"],
            ["Use", "URL rewrites, header manipulation, JWT validation (simple)", "Heavy: A/B, auth, dynamic origin selection"],
            ["Triggers", "Viewer Request, Viewer Response", "All 4: Viewer/Origin Request/Response"],
          ],
        },
      },
      {
        heading: "Security",
        bullets: [
          "**HTTPS only**: redirect HTTP → HTTPS; minimum TLS versions configurable.",
          "**WAF** integration.",
          "**Field-level encryption**: encrypt sensitive fields before they hit origin.",
          "**Geo restriction**: allow/deny by country (compliance use).",
        ],
      },
      {
        heading: "Real-time logs & analytics",
        bullets: [
          "Standard logs → S3 (every 5 min batches).",
          "Real-time logs → Kinesis Data Streams (sub-sec).",
          "Cache statistics in console.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Edge locations", v: "600+ (varies)" },
      { k: "Free SSL cert", v: "ACM in us-east-1" },
      { k: "Default TTL", v: "86,400 s (1 day) — depends on cache policy" },
    ],
    howAsked: [
      "“Speed up global users” → CloudFront in front of origin.",
      "“Protect S3 origin from public access” → OAC.",
      "“Sign URLs for paid video downloads” → signed URLs.",
      "“Manipulate request headers at edge cheaply” → CloudFront Functions.",
      "“Origin selection at runtime based on cookie” → Lambda@Edge.",
    ],
    cases: [
      {
        title: "Locking down S3 origin",
        scenario: "S3 bucket should be private; only CloudFront can read.",
        answer: "Enable OAC on the distribution behavior; update bucket policy to allow the CF service principal with the correct distribution ARN.",
        why: "OAC replaces the older OAI mechanism with SigV4 + correct service principal.",
      },
      {
        title: "Free signed video URLs",
        scenario: "Paid users get 1-hour links to watch videos hosted on S3.",
        answer: "S3 private + CF distribution. Backend signs URL with CF key pair / trusted key group; URL expires in 1 hour.",
        why: "Signed URLs include policy (path, IP, expires) signed with your private key; CF verifies with the public key.",
      },
    ],
    questions: [
      {
        q: "Which option signs every request from CloudFront to a private S3 bucket using SigV4?",
        options: ["Origin Access Identity (OAI)", "Origin Access Control (OAC)", "Field-level encryption", "OAI + Lambda@Edge"],
        correct: 1,
        explanation: "OAC is the modern replacement for OAI; supports SSE-KMS, dynamic requests, all regions.",
      },
      {
        q: "Which is BEST for sub-millisecond URL rewriting at the edge?",
        options: ["Lambda@Edge", "CloudFront Functions", "API Gateway", "WAF"],
        correct: 1,
        explanation: "CloudFront Functions are sub-ms and designed for header/URL tweaks. Lambda@Edge is heavier.",
      },
    ],
    gotchas: [
      "ACM cert MUST be in us-east-1.",
      "OAC > OAI; default for new distros.",
      "Cache & Origin Request Policies replaced the legacy 'Forwarded Headers/Query Strings' settings.",
      "Invalidations cost money beyond the free tier (1000 paths/month).",
    ],
  },
];
