import type { Topic } from "./types";

export const phase5Topics: Topic[] = [
  {
    id: "cfn-sam",
    number: 16,
    phase: 5,
    title: "CloudFormation + SAM",
    domain: "Deployment",
    blurb:
      "Infrastructure as Code. CloudFormation is the engine; SAM is a serverless-focused superset that compiles to CloudFormation. Templates, parameters, intrinsic functions, stacks, change sets, drift, nested stacks, and deletion policies all show up on the exam.",
    sections: [
      {
        heading: "Template anatomy",
        code: `AWSTemplateFormatVersion: "2010-09-09"
Description: ...
Parameters:    # inputs at deploy time
Mappings:      # static lookups (region -> AMI)
Conditions:    # boolean toggles
Resources:     # REQUIRED — what to create
Outputs:       # exports + display values`,
      },
      {
        heading: "Intrinsic functions you must know",
        bullets: [
          "**!Ref** — references a parameter (returns value) or a resource (returns physical ID).",
          "**!GetAtt LogicalId.Attribute** — get an attribute of a resource (e.g., `!GetAtt MyBucket.Arn`).",
          "**!Sub 'Hello ${World}'** — string interpolation; can pull parameters / pseudo-params / resource attrs.",
          "**!Join [delim, list]** — concatenate.",
          "**!ImportValue ExportName** — cross-stack reference.",
          "**!FindInMap [MapName, TopKey, SecondKey]** — lookup.",
          "**!If [Condition, TrueVal, FalseVal]** — conditional.",
          "**Pseudo-parameters**: AWS::Region, AWS::AccountId, AWS::StackName, AWS::Partition, AWS::URLSuffix, AWS::NoValue.",
        ],
      },
      {
        heading: "Stack operations",
        bullets: [
          "**Create / Update / Delete** — basic lifecycle.",
          "**Change Sets** — preview diff before apply. Required for prod safety.",
          "**Drift detection** — find resources changed outside CFN.",
          "**Rollback** — automatic on failure; can disable for debugging.",
          "**Termination protection** — prevents accidental delete.",
        ],
      },
      {
        heading: "Stack composition",
        bullets: [
          "**Nested stacks** — child stack as a resource of parent (`AWS::CloudFormation::Stack`). Good for reusable modules.",
          "**Cross-stack** — `Outputs.Export.Name` then `!ImportValue` in another stack. Exports are immutable until consumers unwire.",
          "**StackSets** — deploy a stack to multiple accounts/regions with one click.",
        ],
      },
      {
        heading: "Deletion / Update behavior",
        bullets: [
          "**DeletionPolicy**: Delete (default), Retain (keep resource even after stack delete), Snapshot (RDS/EBS/Redshift create snapshot then delete).",
          "**UpdateReplacePolicy**: same options for replacement-triggering updates.",
          "**Update behavior** by resource: in-place / replacement / no-interruption — read the CFN resource docs.",
        ],
      },
      {
        heading: "Template best practices",
        bullets: [
          "Use Parameters with NoEcho + AllowedValues + Constraints.",
          "Use SSM Parameter / Secrets Manager dynamic refs: `{{resolve:ssm:/path:1}}` and `{{resolve:secretsmanager:secret:SecretString:user}}`.",
          "Use `cfn-lint` and `cfn-guard` for policy-as-code.",
          "Use Helpers: `cfn-init`, `cfn-signal`, `cfn-hup` on EC2 inside `AWS::CloudFormation::Init`.",
        ],
      },
      {
        heading: "SAM — Serverless Application Model",
        bullets: [
          "Transform header: `Transform: AWS::Serverless-2016-10-31` makes CFN expand the shorthand.",
          "Resources: `AWS::Serverless::Function`, `Api`, `HttpApi`, `StateMachine`, `LayerVersion`, `SimpleTable`.",
          "SAM CLI: `sam build`, `sam local invoke`, `sam local start-api`, `sam deploy`.",
          "`sam local` runs Lambdas in Docker — local debugging without deploy.",
          "SAM Accelerate: incremental fast deploys with `sam sync --watch`.",
        ],
      },
      {
        heading: "SAM Function shorthand",
        code: `MyFn:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: ./src
    Handler: app.handler
    Runtime: python3.12
    Memory: 512
    Timeout: 10
    Policies:
      - DynamoDBCrudPolicy:
          TableName: !Ref OrdersTable
    Events:
      Api:
        Type: Api
        Properties:
          Path: /orders
          Method: post`,
      },
    ],
    keyNumbers: [
      { k: "Template size (S3)", v: "1 MB" },
      { k: "Template inline", v: "460,800 bytes" },
      { k: "Resources per stack", v: "500 (soft limit)" },
      { k: "Outputs per stack", v: "200" },
      { k: "Parameters per stack", v: "200" },
    ],
    howAsked: [
      "“Preserve a database on stack delete” → DeletionPolicy: Retain (or Snapshot).",
      "“Preview infra change without applying” → Change Set.",
      "“Detect manual edits in console” → Drift detection.",
      "“Deploy same stack to many accounts” → StackSets.",
      "“Resolve secret at deploy time” → dynamic ref `{{resolve:secretsmanager:...}}`.",
    ],
    cases: [
      {
        title: "Database deletion accident",
        scenario: "Deleting a stack accidentally deleted a production RDS.",
        answer: "Add `DeletionPolicy: Retain` (or Snapshot) on the RDS resource. Also enable termination protection on the stack.",
        why: "Default is Delete. CFN cleans up everything unless told otherwise.",
      },
      {
        title: "Resolving env-specific config",
        scenario: "One template must use different DB endpoints for dev/prod without committing values.",
        answer: "Parameters defaulted from SSM Parameter Store: `Default: '{{resolve:ssm:/db/host:1}}'`.",
        why: "SSM dynamic references are evaluated at deploy time and keep the template environment-neutral.",
      },
    ],
    questions: [
      {
        q: "Which CFN feature shows the planned diff before an update?",
        options: [
          "Drift detection.",
          "Change Sets.",
          "Stack policies.",
          "Termination protection.",
        ],
        correct: 1,
        explanation: "Change Sets = preview; Drift = post-hoc detection of out-of-band changes.",
      },
      {
        q: "A SAM template needs a Lambda Function with CRUD permissions on a DynamoDB table. The SHORTEST syntax is:",
        options: [
          "Inline IAM policy referencing the table ARN.",
          "Manage policy by adding a Role and attaching ManagedPolicyArns.",
          "Policies: [DynamoDBCrudPolicy: TableName: !Ref Table].",
          "Use a Lambda layer.",
        ],
        correct: 2,
        explanation: "SAM policy templates (`DynamoDBCrudPolicy`, `S3ReadPolicy`, etc.) inject the right permissions in one line.",
      },
    ],
    gotchas: [
      "DeletionPolicy is per-resource; UpdateReplacePolicy handles update replacements.",
      "Exports can't be deleted while imports exist.",
      "Stack updates fail-fast → rollback to last known good (unless disabled).",
      "Transform: AWS::Serverless-2016-10-31 is REQUIRED for SAM.",
    ],
  },
  {
    id: "cdk-codeartifact",
    number: 17,
    phase: 5,
    title: "CDK & CodeArtifact",
    domain: "Deployment",
    blurb:
      "CDK lets you write infrastructure in real code (TS/Py/Java/C#/Go) and compiles to CloudFormation. CodeArtifact is a managed package repo for npm/pip/Maven/NuGet/Gradle/Cargo — proxy + private registry.",
    sections: [
      {
        heading: "CDK essentials",
        bullets: [
          "**App → Stacks → Constructs**. Constructs come in 3 levels (L1 = raw CFN, L2 = curated, L3 = patterns).",
          "Workflow: `cdk init`, `cdk synth` (emit CFN), `cdk diff`, `cdk deploy`.",
          "Bootstrap: `cdk bootstrap` deploys a CFN stack with assets bucket + ECR repo + roles.",
          "Assets (zip files, container images) auto-uploaded to bootstrapped S3/ECR during deploy.",
          "Use `aws-cdk-lib` for the curated constructs; the old `@aws-cdk/aws-*` packages are deprecated v1.",
        ],
      },
      {
        heading: "CDK vs CloudFormation vs SAM",
        table: {
          headers: ["Tool", "Language", "Strengths"],
          rows: [
            ["CloudFormation", "YAML/JSON", "Native; no transpile; widely supported"],
            ["SAM", "YAML (CFN superset)", "Serverless shorthand + local emu"],
            ["CDK", "TS/Py/Java/C#/Go", "Real code, loops, reuse, type safety"],
          ],
        },
      },
      {
        heading: "CDK example (TypeScript)",
        code: `import { App, Stack } from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

class MyStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);
    new Function(this, 'Fn', {
      runtime: Runtime.PYTHON_3_12,
      handler: 'app.handler',
      code: Code.fromAsset('lambda/'),
      memorySize: 512,
    });
  }
}
const app = new App();
new MyStack(app, 'MyStack');`,
      },
      {
        heading: "CodeArtifact",
        bullets: [
          "Domain → Repositories → Packages. Domain provides org-wide encryption + dedupe.",
          "**Upstream repos** chain: your repo → public repo (npm.org, PyPI). On first request, package fetched & cached.",
          "Authentication: short-lived token via `aws codeartifact get-authorization-token` (12 h max).",
          "Used by CodeBuild via `aws codeartifact login` step.",
          "IAM controls access; KMS encrypts package versions.",
        ],
      },
      {
        heading: "Why use CodeArtifact",
        bullets: [
          "Private packages within the org (no public).",
          "Cache approved versions of public packages — auditable.",
          "Block known-bad versions / supply chain attacks.",
        ],
      },
    ],
    keyNumbers: [
      { k: "CodeArtifact token lifetime", v: "12 hours max" },
      { k: "CDK bootstrap version", v: "Pinned in synthesized template" },
    ],
    howAsked: [
      "“IaC in TypeScript / Python with loops and unit tests” → CDK.",
      "“Private package registry for npm / pip” → CodeArtifact.",
      "“Proxy public packages with caching + audit” → CodeArtifact upstream to public.",
    ],
    cases: [
      {
        title: "Stale CDK bootstrap",
        scenario: "Team gets a 'bootstrap stack version' error when deploying.",
        answer: "Run `cdk bootstrap --force` to upgrade the bootstrap stack to a newer template version.",
        why: "CDK assets format changes; older bootstrap stacks must be updated.",
      },
    ],
    questions: [
      {
        q: "What is the role of `cdk bootstrap`?",
        options: [
          "Compiles TypeScript.",
          "Deploys an environment-specific CFN stack with S3, ECR, IAM roles required for asset publishing.",
          "Generates IAM roles for every Lambda.",
          "Migrates from CloudFormation to CDK.",
        ],
        correct: 1,
        explanation: "Bootstrap sets up the supporting infra in each (account, region) pair.",
      },
    ],
    gotchas: [
      "CDK = code → CFN at synth time. Errors can come from either layer.",
      "CodeArtifact tokens are short-lived; re-issue in CI/CD.",
    ],
  },
  {
    id: "codepipeline-suite",
    number: 18,
    phase: 5,
    title: "CodeCommit / CodeBuild / CodeDeploy / CodePipeline",
    domain: "Deployment",
    blurb:
      "AWS's first-party CI/CD primitives. CodePipeline orchestrates stages; CodeBuild runs your build commands (buildspec); CodeDeploy ships artifacts to EC2/ECS/Lambda (appspec). CodeCommit is a managed git host (now in maintenance for new customers).",
    sections: [
      {
        heading: "CodePipeline",
        bullets: [
          "Workflow with stages (Source → Build → Test → Deploy → Approval...).",
          "Each stage has actions: AWS service or third-party.",
          "Source providers: CodeCommit, GitHub (v2 connection via CodeStar), S3, Bitbucket, ECR.",
          "Manual approval action: human gate (with optional SNS + reviewer comments).",
          "Artifacts pass between stages via S3 artifact store; encryption with KMS.",
          "Triggers: CodeCommit push, EventBridge (e.g., on CFN status), schedule.",
        ],
      },
      {
        heading: "CodeBuild",
        bullets: [
          "Builds in managed Docker containers; defined by `buildspec.yml` in repo root (or inline).",
          "Phases: install → pre_build → build → post_build → finally artifacts uploaded.",
          "Caching: S3 cache or LOCAL Docker/source/custom.",
          "Compute types: lambda-based (fast, small), EC2-based (more memory/CPU).",
          "Environment variables: plain or from Secrets Manager / Parameter Store.",
          "Reports: tests (JUnit, NUnit, etc.) + coverage.",
        ],
      },
      {
        heading: "buildspec.yml example",
        code: `version: 0.2
env:
  parameter-store:
    DB_HOST: /app/prod/db_host
  secrets-manager:
    DB_PASS: prod/db:password
phases:
  install:
    runtime-versions: { python: 3.12 }
    commands: [pip install -r requirements.txt]
  build:
    commands:
      - pytest -q
      - sam build
      - sam package --s3-bucket $BUCKET --output-template packaged.yaml
artifacts:
  files:
    - packaged.yaml
cache:
  paths: [/root/.cache/pip/**/*]`,
      },
      {
        heading: "CodeDeploy",
        bullets: [
          "Three platforms: **EC2/On-Premises**, **ECS**, **Lambda**.",
          "EC2 uses **CodeDeploy agent** + `appspec.yml`. Deployment groups define targets (tags, ASG).",
          "ECS uses blue/green via two task sets on an ALB.",
          "Lambda updates a function alias and shifts traffic.",
          "Lifecycle hooks: BeforeInstall, AfterInstall, ApplicationStart, ValidateService (EC2). BeforeAllowTraffic, AfterAllowTraffic (Lambda/ECS).",
          "Rollback: automatic on failed hook or CloudWatch alarm.",
        ],
      },
      {
        heading: "appspec.yml (Lambda example)",
        code: `version: 0.0
Resources:
  - myFunction:
      Type: AWS::Lambda::Function
      Properties:
        Name: myFunction
        Alias: live
        CurrentVersion: 1
        TargetVersion: 2
Hooks:
  - BeforeAllowTraffic: validateBeforeFn
  - AfterAllowTraffic:  validateAfterFn`,
      },
      {
        heading: "Deployment configs (Lambda)",
        bullets: [
          "**Canary**: e.g., `Canary10Percent5Minutes` — 10% for 5 min, then 100%.",
          "**Linear**: e.g., `Linear10PercentEvery1Minute` — 10% increments.",
          "**AllAtOnce** — 100% immediately.",
          "Set CloudWatch alarms in the deployment group → auto-rollback if triggered during canary/linear window.",
        ],
      },
      {
        heading: "Deployment configs (ECS)",
        bullets: [
          "Blue/Green via two target groups on the ALB.",
          "Same canary/linear/all-at-once shapes.",
          "Lifecycle hooks fire on Lambda invocations.",
        ],
      },
      {
        heading: "Deployment configs (EC2/On-Prem)",
        bullets: [
          "In-place (rolling): some/half/one-at-a-time on the same instances.",
          "Blue/green: provision a new ASG, shift LB traffic, terminate old.",
        ],
      },
      {
        heading: "Connecting it all",
        bullets: [
          "CodePipeline Source → CodeBuild builds & tests → CodeBuild emits CFN/SAM packaged template → CodeDeploy (or CloudFormation action) deploys.",
          "CodeStar Connections power GitHub/Bitbucket integration (v2) — no webhooks/tokens in CFN.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Pipeline artifact store", v: "S3 (encrypted, KMS optional)" },
      { k: "Manual approval timeout", v: "7 days" },
      { k: "CodeBuild compute", v: "Lambda (fast) up to EC2 LARGE+ (heavy)" },
    ],
    howAsked: [
      "“Build artifact + run tests on commit” → CodeBuild.",
      "“Shift 10% Lambda traffic then 100% with rollback on errors” → CodeDeploy Canary.",
      "“Require approval before prod stage” → CodePipeline manual approval action.",
      "“Connect GitHub repo as source” → CodeStar Connections.",
    ],
    cases: [
      {
        title: "Auto-rollback on errors",
        scenario: "Lambda canary deploy should auto-rollback if 5xx alarm fires.",
        answer: "CodeDeploy deployment group with CloudWatchAlarms set; choose `RollbackOnAlarm`. Use a Canary config so traffic shift waits for alarm window.",
        why: "Without alarms, CodeDeploy completes the shift even with errors.",
      },
      {
        title: "Secrets in build",
        scenario: "Build needs npm registry token; can't be in repo.",
        answer: "Use buildspec env `secrets-manager: NPM_TOKEN: npm/registry:token`.",
        why: "buildspec resolves the secret at build time; no plaintext.",
      },
    ],
    questions: [
      {
        q: "Which CodeDeploy config shifts 10% of traffic for 5 min, then 100%?",
        options: ["Linear10PercentEvery5Minutes", "Canary10Percent5Minutes", "AllAtOnce", "Custom Canary"],
        correct: 1,
        explanation: "Canary = two jumps. Linear = many equal increments.",
      },
      {
        q: "A CodeBuild project must pull DB password without committing it. The SAFEST option is:",
        options: [
          "Hard-code in buildspec.",
          "Env variable plain text.",
          "buildspec env `secrets-manager: VAR: secret:key`.",
          "Encrypted EBS volume.",
        ],
        correct: 2,
        explanation: "Built-in resolution from Secrets Manager / Parameter Store keeps secrets out of artifacts.",
      },
    ],
    gotchas: [
      "Lambda CodeDeploy works against an alias, not a function.",
      "Hooks run as Lambda functions you author (CodeDeploy invokes them).",
      "CodeCommit is in maintenance — exam still tests it; in practice, GitHub via CodeStar.",
    ],
  },
  {
    id: "deployment-strategies",
    number: 19,
    phase: 5,
    title: "Deployment Strategies",
    domain: "Deployment",
    blurb:
      "Know which strategy each service supports and the cost/risk trade-offs: All-at-once, Rolling, Rolling with additional batch, Immutable, Blue/Green, Canary, Linear, Traffic splitting.",
    sections: [
      {
        heading: "Strategy comparison",
        table: {
          headers: ["Strategy", "Downtime", "Cost", "Risk", "Rollback"],
          rows: [
            ["All-at-once", "Yes", "Lowest", "High", "Re-deploy old"],
            ["Rolling", "Maybe (reduced cap)", "Same", "Medium", "Rolling reverse"],
            ["Rolling w/ additional batch", "No", "Slightly higher", "Medium", "Rolling reverse"],
            ["Immutable", "No", "Higher (briefly)", "Low", "Terminate new ASG"],
            ["Blue/Green", "No", "Highest (2× briefly)", "Lowest", "Swap back"],
            ["Canary", "No", "Higher", "Low", "Stop traffic shift"],
            ["Linear", "No", "Higher", "Low", "Stop traffic shift"],
          ],
        },
      },
      {
        heading: "Service-by-service",
        table: {
          headers: ["Service", "Strategies"],
          rows: [
            ["Lambda (via CodeDeploy)", "AllAtOnce, Linear, Canary"],
            ["ECS (CodeDeploy)", "AllAtOnce, Linear, Canary (blue/green over two target groups)"],
            ["ECS (rolling)", "Native rolling update"],
            ["EC2 (CodeDeploy)", "In-place rolling OR Blue/Green (new ASG)"],
            ["Elastic Beanstalk", "All at once, Rolling, Rolling with additional batch, Immutable, Traffic splitting (canary), Blue/Green (via swap URLs)"],
            ["API Gateway", "Stage canary (route N%)"],
          ],
        },
      },
      {
        heading: "When to pick what",
        bullets: [
          "**Lowest risk, highest cost**: Blue/Green or Immutable. Run new and old in parallel; cut over when verified.",
          "**Lowest cost, high risk**: All-at-once. Acceptable for dev or stateless background workers.",
          "**Granular**: Canary (two jumps) for slow shift with monitoring; Linear for gradual ramp.",
          "**Stateful**: Avoid in-place rolling on EC2 if session affinity matters — use sticky sessions or externalize state.",
        ],
      },
    ],
    howAsked: [
      "“Zero downtime, can absorb 2× cost briefly” → Blue/Green or Immutable.",
      "“Need fastest deploy in dev” → AllAtOnce.",
      "“Beanstalk no capacity loss” → Rolling with additional batch (or Immutable).",
      "“Detect bad deploy with CloudWatch alarm + auto rollback” → CodeDeploy Canary/Linear + alarms.",
    ],
    cases: [
      {
        title: "Beanstalk with no capacity loss",
        scenario: "Site behind Beanstalk can't drop capacity during deploy.",
        answer: "Use 'Rolling with additional batch' (or Immutable for highest safety).",
        why: "Plain Rolling reduces fleet temporarily; the 'additional batch' option avoids that.",
      },
    ],
    questions: [
      {
        q: "Which Beanstalk strategy uses a separate temporary ASG to validate before swapping?",
        options: ["All at once", "Rolling", "Immutable", "Traffic splitting"],
        correct: 2,
        explanation: "Immutable creates a new ASG, validates with single instance + health checks, then swaps.",
      },
      {
        q: "An ECS service must shift traffic gradually and auto-rollback on 5xx alarm. Best option:",
        options: [
          "ECS rolling update.",
          "CodeDeploy blue/green with Canary config + CloudWatch alarm.",
          "Replace task definitions one by one manually.",
          "AllAtOnce with sanity checks.",
        ],
        correct: 1,
        explanation: "CodeDeploy adds traffic shift control + alarm-based rollback to ECS.",
      },
    ],
    gotchas: [
      "Beanstalk Blue/Green is via env URL swap, not first-class CodeDeploy.",
      "Lambda CodeDeploy needs an alias, not a function ARN.",
      "ECS 'rolling' (native) vs 'blue/green' (CodeDeploy) are different.",
    ],
  },
  {
    id: "elastic-beanstalk",
    number: 20,
    phase: 5,
    title: "Elastic Beanstalk",
    domain: "Deployment",
    blurb:
      "Platform-as-a-service for common web stacks (Node, Java, Python, .NET, Go, Docker, multi-container). You bring code, Beanstalk creates EC2/ASG/ALB/RDS automatically. Heavy exam love for deployment policies and `.ebextensions`.",
    sections: [
      {
        heading: "Components",
        bullets: [
          "**Application** = container for environments.",
          "**Environment** = running version: Web Server (EC2+ALB) or Worker (SQS-fed EC2).",
          "**Versions** = uploaded code bundles.",
          "Beanstalk creates the underlying resources (EC2, ASG, ALB, SG, optional RDS, optional S3 bucket).",
        ],
      },
      {
        heading: "Deployment policies",
        table: {
          headers: ["Policy", "Behavior", "Capacity"],
          rows: [
            ["All at once", "Deploy to all instances simultaneously", "Downtime"],
            ["Rolling", "Batches of instances", "Reduced (one batch is updating)"],
            ["Rolling with additional batch", "Adds a temporary batch first", "Full capacity"],
            ["Immutable", "New ASG, validate, swap", "Full capacity, safest"],
            ["Traffic splitting", "Canary: send % to new, then ramp", "Full"],
            ["Blue/Green", "Two environments, swap CNAMEs", "Full"],
          ],
        },
      },
      {
        heading: ".ebextensions",
        bullets: [
          "YAML/JSON files in `.ebextensions/*.config` inside your code bundle.",
          "Customize: install packages, write files, run commands, set option settings, create CFN resources.",
          "Order: option_settings → packages → groups → users → sources → files → commands → services → container_commands.",
          "Use `container_commands` for steps that need the app artifact deployed first.",
        ],
      },
      {
        heading: ".ebextensions example",
        code: `option_settings:
  aws:elasticbeanstalk:application:environment:
    LOG_LEVEL: info
packages:
  yum:
    htop: []
container_commands:
  01_migrate:
    command: "python manage.py migrate"
    leader_only: true`,
      },
      {
        heading: "Worker tier",
        bullets: [
          "Beanstalk creates an SQS queue + sqsd daemon on each instance.",
          "Daemon polls SQS → POSTs message body to `localhost/<path>` on your app.",
          "Use for: background processing, async jobs.",
          "Schedule cron-like tasks via `cron.yaml`.",
        ],
      },
      {
        heading: "Environment swap (blue/green)",
        bullets: [
          "Clone env (same config, new version), test, then **Swap Environment URLs** in console/CLI — CNAMEs flip.",
          "Sticky sessions and DNS caches mean traffic drains slowly; not instant.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Application versions", v: "1,000 (soft limit, configurable via lifecycle policy)" },
      { k: "Environments", v: "200 per application (soft)" },
    ],
    howAsked: [
      "“Zero downtime, lowest risk deploy on Beanstalk” → Immutable.",
      "“Customize EC2 instance setup” → .ebextensions.",
      "“Background SQS-fed processing” → Worker tier.",
      "“Blue/green on Beanstalk” → Swap Environment URLs.",
    ],
    cases: [
      {
        title: "Slow Beanstalk deploy",
        scenario: "Deploys take 25 minutes because Immutable spins up a new ASG.",
        answer: "If risk is acceptable, switch to Rolling with additional batch (faster). Otherwise tune autoscaling settings.",
        why: "Immutable trades time for safety; pick based on risk tolerance.",
      },
    ],
    questions: [
      {
        q: "Where should the database be created for a production Beanstalk app?",
        options: [
          "Inside the environment so it terminates with the env.",
          "Outside the environment (separate RDS) so the env can be terminated safely.",
          "On the same EC2 instance.",
          "In the .ebextensions package.",
        ],
        correct: 1,
        explanation: "Beanstalk-managed RDS dies with the env. Create RDS separately and reference its endpoint via env vars.",
      },
      {
        q: "Which file path can run shell commands AFTER the app is unpacked but BEFORE traffic flows?",
        options: [
          ".ebextensions/*.config under `commands`.",
          ".ebextensions/*.config under `container_commands`.",
          "Procfile.",
          "Dockerfile.",
        ],
        correct: 1,
        explanation: "`container_commands` run AFTER the app is deployed but BEFORE the env is set up to serve traffic. `commands` run BEFORE the app is set up.",
      },
    ],
    gotchas: [
      "Beanstalk-managed RDS is convenient for dev only.",
      "Worker tier expects a specific message → HTTP POST path bridge.",
      "Saved configurations make env templating easy.",
    ],
  },
];
