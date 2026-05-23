import type { Topic } from "./types";

export const phase4Topics: Topic[] = [
  {
    id: "cognito",
    number: 12,
    phase: 4,
    title: "Cognito — User Pools vs Identity Pools",
    domain: "Security",
    blurb:
      "Cognito is two services in a trench coat. User Pool authenticates end users (sign-up / sign-in, JWTs). Identity Pool exchanges any token for temporary AWS credentials. Confusing them is the most common DVA-C02 mistake.",
    sections: [
      {
        heading: "User Pool (authentication)",
        bullets: [
          "Managed user directory: sign-up, sign-in, MFA, password recovery.",
          "Returns three JWTs: **ID token** (identity claims), **Access token** (API GW auth), **Refresh token** (new access tokens).",
          "Hosted UI: drop-in sign-in pages.",
          "Federated identities: SAML, OIDC, social (Google, Facebook, Apple).",
          "Lambda triggers: pre/post sign-up, pre-authentication, custom message, define/create auth challenge (for custom flows like passwordless).",
          "Adaptive authentication: ML-based risk scoring (Cognito Advanced Security).",
        ],
      },
      {
        heading: "Identity Pool (authorization to AWS)",
        bullets: [
          "Exchange a token (Cognito User Pool, Google, Facebook, SAML, OIDC, custom developer-authenticated identity) for **temporary AWS credentials** via STS.",
          "Two roles: **authenticated** (signed-in users), **unauthenticated** (guests).",
          "**Role-based access control** via the `cognito-identity.amazonaws.com:roles` claim or rules-based mapping.",
          "Used for: mobile/web apps directly calling S3, DynamoDB, etc. (per-user scoped).",
        ],
      },
      {
        heading: "Pattern: User Pool + Identity Pool together",
        bullets: [
          "User signs in via User Pool → JWT.",
          "App passes JWT to Identity Pool → STS temp creds.",
          "App calls AWS services directly with those creds.",
          "IAM policy on the role can use `cognito-identity.amazonaws.com:sub` variable to scope to per-user S3 prefixes (e.g., `arn:...:bucket/${cognito-identity.amazonaws.com:sub}/*`).",
        ],
      },
      {
        heading: "JWT vs API Gateway",
        bullets: [
          "REST API: Cognito User Pool authorizer (validates ID/access token).",
          "HTTP API: native JWT authorizer (any OIDC provider including Cognito).",
          "Token validation is automatic — no Lambda code.",
        ],
      },
      {
        heading: "Token specifics",
        bullets: [
          "ID and Access tokens default to 60 min (min 5 min, max 24 h).",
          "Refresh token default 30 days (1 hour – 10 years).",
          "Tokens are signed JWTs (RS256). Validate against the public JWKS at `/.well-known/jwks.json`.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Access token min", v: "5 min" },
      { k: "Access token max", v: "24 hours" },
      { k: "Refresh token max", v: "10 years" },
      { k: "Identity pool roles", v: "Auth + unauth" },
    ],
    howAsked: [
      "“Sign-up / sign-in for web/mobile” → User Pool.",
      "“Get AWS credentials so the app can call S3 directly per user” → Identity Pool.",
      "“Customize sign-up validation” → User Pool Lambda triggers.",
      "“Federate corporate IdP for end users” → User Pool with SAML/OIDC provider.",
      "“Different IAM permissions for different user groups” → User Pool groups → Identity Pool role mapping.",
    ],
    cases: [
      {
        title: "Per-user S3 prefix",
        scenario: "A photo-sharing app must let each signed-in user list/upload only objects under their own folder in a shared bucket.",
        answer: "User Pool for sign-in → Identity Pool gives temp creds. Authenticated IAM role policy: `Resource: arn:aws:s3:::bucket/${cognito-identity.amazonaws.com:sub}/*`.",
        why: "Policy variables let one role enforce per-user isolation without per-user policies.",
      },
      {
        title: "Custom signup validation",
        scenario: "Domain restriction: only accept users with @company.com emails.",
        answer: "Pre Sign-up Lambda trigger that throws if email domain ≠ company.com.",
        why: "Triggers are the User Pool extensibility point.",
      },
      {
        title: "Single sign-on with Okta",
        scenario: "Corporate Okta should sign users into a customer-facing app.",
        answer: "Configure User Pool with Okta as a SAML IdP. Use hosted UI for federated sign-in.",
        why: "User Pool aggregates social/enterprise identities behind one JWT.",
      },
    ],
    questions: [
      {
        q: "An app must allow signed-in users to call DynamoDB directly from the browser. Which combination is required?",
        options: [
          "User Pool only.",
          "Identity Pool only.",
          "User Pool + Identity Pool.",
          "IAM user per user.",
        ],
        correct: 2,
        explanation: "User Pool authenticates; Identity Pool gives the STS creds the SDK needs.",
      },
      {
        q: "Which authorizer is the simplest way to validate a Cognito ID token at API Gateway?",
        options: [
          "Lambda TOKEN authorizer.",
          "Cognito User Pool authorizer.",
          "IAM (Sigv4) authorization.",
          "API keys.",
        ],
        correct: 1,
        explanation: "REST API has a native Cognito User Pool authorizer; no code.",
      },
    ],
    gotchas: [
      "User Pool ≠ AWS access. You still need Identity Pool to call AWS APIs directly.",
      "Group → IAM role mapping happens at Identity Pool, with priorities.",
      "`cognito-identity.amazonaws.com:sub` ≠ User Pool sub; both exist but are different IDs.",
    ],
  },
  {
    id: "kms",
    number: 13,
    phase: 4,
    title: "KMS — Keys & Envelope Encryption",
    domain: "Security",
    blurb:
      "AWS Key Management Service stores and uses encryption keys. Know key types (AWS-owned vs AWS-managed vs customer-managed), envelope encryption with data keys, grants vs key policies, automatic rotation, cross-account, and symmetric vs asymmetric.",
    sections: [
      {
        heading: "Key types",
        table: {
          headers: ["Type", "Created by", "Visible?", "Rotation"],
          rows: [
            ["AWS-owned", "AWS", "No (free)", "AWS-managed"],
            ["AWS-managed (`aws/<service>`)", "AWS per service", "Yes, can't edit policy", "Auto, yearly"],
            ["Customer-managed (CMK)", "You", "Yes, full control", "Optional auto-yearly, or manual"],
          ],
        },
      },
      {
        heading: "Symmetric vs asymmetric",
        bullets: [
          "**Symmetric** (AES-256): default; encrypt + decrypt with the same key. Used by integrated services (S3, EBS, RDS, Secrets Manager).",
          "**Asymmetric** (RSA, ECC): public + private; for signing/verification, encrypt by external systems that can't call KMS.",
          "Private key never leaves KMS — KMS performs the operation.",
        ],
      },
      {
        heading: "Envelope encryption (memorize)",
        bullets: [
          "Encrypt large data with a **Data Key** (DEK, AES-256).",
          "Encrypt the DEK with a **KEK** (CMK in KMS).",
          "Store ciphertext + encrypted DEK together. To decrypt: KMS decrypts the DEK; you decrypt the data locally.",
          "Why? KMS limits direct encrypt to 4 KB; DEK approach handles GB-scale data.",
          "API: `GenerateDataKey` returns plaintext + ciphertext copies of the DEK.",
        ],
      },
      {
        heading: "Access control: key policy + grants",
        bullets: [
          "**Key policy**: required, attached to the key. Default key policy grants account root full access; you add principals from there.",
          "**Grants**: programmatic, temporary, more granular — used when one service needs cross-account/temporary access (e.g., RDS encryption with a CMK in another account).",
          "**Via IAM**: identity policies must also grant `kms:*` actions; key policy must allow the principal.",
        ],
      },
      {
        heading: "Rotation",
        bullets: [
          "**Customer-managed CMK**: opt-in automatic rotation, yearly (older versions retained for decrypting old ciphertexts).",
          "**AWS-managed CMK**: auto-rotated yearly, you can't disable.",
          "**Manual rotation**: create a new CMK + alias swap to point to it.",
          "**Imported key material**: cannot use automatic rotation (you re-import or rotate manually).",
        ],
      },
      {
        heading: "Aliases",
        bullets: [
          "Friendly name `alias/<name>` that points to a CMK.",
          "Lets you rotate manually by repointing the alias to a new key without changing app config.",
        ],
      },
      {
        heading: "Multi-region keys",
        bullets: [
          "A primary key in one region with replica keys in others — same key ID, same key material.",
          "Used for: global apps decrypting locally, S3 CRR with KMS.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Direct encrypt limit", v: "4 KB" },
      { k: "Data key sizes", v: "AES_256 typical; AES_128 also supported" },
      { k: "Rotation cadence", v: "Yearly (automatic), older versions kept" },
    ],
    howAsked: [
      "“Audit every decrypt of S3 objects” → SSE-KMS with customer-managed CMK + CloudTrail.",
      "“Encrypt > 4 KB of data” → Envelope encryption (GenerateDataKey).",
      "“Cross-account decrypt” → key policy grants other account; their IAM also allows.",
      "“Rotate the key automatically” → enable automatic rotation on customer-managed CMK.",
      "“Sign payloads outside AWS, verify inside” → asymmetric KMS key.",
    ],
    cases: [
      {
        title: "Encrypting a 50 MB file",
        scenario: "Need to encrypt a 50 MB document client-side using a key from KMS.",
        answer: "Call `GenerateDataKey` → use plaintext DEK locally to encrypt the file → store ciphertext + encrypted DEK → delete plaintext DEK from memory.",
        why: "Direct KMS encrypt is capped at 4 KB; envelope encryption is the only way for big data.",
      },
      {
        title: "Cross-account S3 with KMS",
        scenario: "Account A's bucket uses SSE-KMS with a CMK in Account A. Account B's Lambda must read.",
        answer: "Update CMK key policy to allow Account B's role kms:Decrypt. Update bucket policy to allow Account B. Update B's role identity policy to allow s3:GetObject + kms:Decrypt.",
        why: "KMS adds a second axis to cross-account access; all three policies must align.",
      },
    ],
    questions: [
      {
        q: "Which is REQUIRED to encrypt data larger than 4 KB with KMS?",
        options: [
          "Asymmetric key.",
          "Envelope encryption via GenerateDataKey.",
          "Multi-region key.",
          "AWS-managed key.",
        ],
        correct: 1,
        explanation: "KMS Encrypt caps at 4 KB plaintext. Envelope encryption is the standard fix.",
      },
      {
        q: "Which key type allows automatic yearly rotation while letting the customer disable or delete the key?",
        options: ["AWS-owned", "AWS-managed", "Customer-managed CMK", "Imported key material"],
        correct: 2,
        explanation: "Customer-managed CMKs support optional rotation, disable, delete (with 7–30 day window).",
      },
    ],
    gotchas: [
      "Key policy is REQUIRED; even root must be in it.",
      "Automatic rotation only on symmetric customer-managed CMKs that did NOT import key material.",
      "Aliases let you rotate without code changes.",
      "Deletion = scheduled with 7–30 day waiting period (no immediate delete).",
    ],
  },
  {
    id: "secrets-params",
    number: 14,
    phase: 4,
    title: "Secrets Manager vs Systems Manager Parameter Store",
    domain: "Security",
    blurb:
      "Two stores, one decision: do you need automated rotation, cross-region replication, and a managed integration with RDS? Then Secrets Manager. Otherwise Parameter Store (especially the free SecureString tier).",
    sections: [
      {
        heading: "Side-by-side comparison",
        table: {
          headers: ["", "Secrets Manager", "Parameter Store"],
          rows: [
            ["Cost", "$0.40 / secret / month + API calls", "Free (Standard); $0.05 / advanced param / month"],
            ["Max value size", "64 KB", "4 KB (Standard) / 8 KB (Advanced)"],
            ["Auto rotation", "Yes (built-in Lambda rotation)", "No (DIY)"],
            ["Cross-region replication", "Yes (managed)", "Manual"],
            ["Versioning", "Yes, with stage labels", "Yes, version numbers"],
            ["RDS / DocDB / Redshift integration", "Native: rotation Lambdas managed by AWS", "DIY"],
            ["Encryption", "KMS (required)", "Plain (String/StringList) or KMS (SecureString)"],
            ["Hierarchy / tree", "Flat names", "Hierarchical (`/app/env/key`) with `GetParametersByPath`"],
          ],
        },
      },
      {
        heading: "When each wins",
        bullets: [
          "**Secrets Manager**: database creds with auto-rotation, third-party API keys you want rotated, secrets shared across regions.",
          "**Parameter Store**: feature flags, configuration values, public string parameters, large fleets where per-secret pricing would explode.",
        ],
      },
      {
        heading: "Reading from Lambda — the modern way",
        bullets: [
          "Use the **AWS Parameters and Secrets Lambda Extension**: caches values in-process, exposes `localhost:2773`.",
          "Massively reduces API calls (avoids throttling, cuts cost).",
          "Works for both Secrets Manager and SSM Parameter Store.",
        ],
      },
      {
        heading: "Rotation pattern (Secrets Manager + RDS)",
        bullets: [
          "Configure rotation: AWS deploys/uses a managed Lambda rotator.",
          "Lambda: 4 steps — createSecret, setSecret (set in DB), testSecret, finishSecret (move AWSPENDING→AWSCURRENT).",
          "Apps read the secret on each access (or cached for a short time); they always get the current credentials.",
        ],
      },
      {
        heading: "Parameter Store hierarchy",
        bullets: [
          "Naming convention: `/dva/notes/prod/dbPassword`.",
          "`GetParametersByPath` returns subtree with optional recursive flag.",
          "Combined with IAM resource-level perms (`arn:aws:ssm:...:parameter/dva/notes/prod/*`) for per-env access.",
        ],
      },
    ],
    keyNumbers: [
      { k: "Secrets Manager pricing", v: "$0.40 / secret / month" },
      { k: "SecureString cost", v: "Free (standard); $0.05 advanced" },
      { k: "Parameter Store standard size", v: "4 KB; advanced 8 KB" },
      { k: "Secrets Manager max size", v: "64 KB" },
    ],
    howAsked: [
      "“Automatically rotate database password” → Secrets Manager.",
      "“Cheapest way to store DB password (small org)” → Parameter Store SecureString.",
      "“Reduce Lambda calls to Secrets Manager” → Parameters & Secrets Extension.",
      "“Cross-region secret” → Secrets Manager replication.",
    ],
    cases: [
      {
        title: "Rotate Aurora password every 30 days",
        scenario: "Compliance demands rotation; ops doesn't want to write code.",
        answer: "Move credentials to Secrets Manager, enable rotation with the AWS-managed Lambda for the DB engine, set rotation = 30 days.",
        why: "Parameter Store has no built-in rotation.",
      },
      {
        title: "1000 microservice configs",
        scenario: "Each service has 10 config values across 3 environments; total ~30,000 values.",
        answer: "Parameter Store with `/svc/<name>/<env>/<key>` hierarchy. IAM resource-level access.",
        why: "Secrets Manager would cost $12,000/month at $0.40 each. Parameter Store is free for standard.",
      },
    ],
    questions: [
      {
        q: "Which option provides AUTOMATIC, NATIVE rotation of an RDS password?",
        options: [
          "Parameter Store SecureString with a custom Lambda.",
          "Secrets Manager with managed rotation enabled.",
          "IAM Database Authentication.",
          "KMS automatic rotation.",
        ],
        correct: 1,
        explanation: "Only Secrets Manager has built-in, AWS-maintained rotation Lambdas for RDS.",
      },
      {
        q: "Which approach minimizes Lambda cold-start latency when reading a frequently-used secret?",
        options: [
          "Call GetSecretValue at start of every invocation.",
          "Use the AWS Parameters and Secrets Lambda Extension to cache locally.",
          "Embed the secret in the deployment package.",
          "Pass the secret as an environment variable.",
        ],
        correct: 1,
        explanation: "The extension caches in-process; subsequent invocations read from localhost. Env vars in plaintext are insecure.",
      },
    ],
    gotchas: [
      "Secrets Manager is paid; Parameter Store SecureString standard tier is free.",
      "Parameter Store has hierarchy + GetParametersByPath; Secrets Manager is flat.",
      "Both use KMS under the hood.",
      "Use the Lambda Extension for caching — don't roll your own.",
    ],
  },
  {
    id: "acm-sts-iam-adv",
    number: 15,
    phase: 4,
    title: "ACM, STS, IAM Advanced",
    domain: "Security",
    blurb:
      "Round out security: ACM for TLS, deeper STS scenarios, advanced IAM patterns (resource policies, condition keys, confused deputy, ABAC).",
    sections: [
      {
        heading: "ACM — Certificate Manager",
        bullets: [
          "Free public TLS certs (DV) for use in CloudFront, ALB, API Gateway, App Runner, Cognito hosted UI.",
          "Auto-renews if you used DNS validation (recommended) and the validation record stays in place.",
          "Regional: cert in region of the resource. **CloudFront requires certs in us-east-1.**",
          "**AWS Private CA**: issue private certs (internal services, mTLS).",
          "ACM certs are NOT exportable to non-AWS systems (use ACM-PCA for that).",
        ],
      },
      {
        heading: "STS advanced",
        bullets: [
          "**AssumeRole**: cross-account / privilege escalation. Trust policy in target role allows the calling principal/account.",
          "**AssumeRoleWithWebIdentity**: bring an OIDC token (Cognito Identity Pool uses this internally).",
          "**AssumeRoleWithSAML**: SAML 2.0 assertion (corporate SSO).",
          "**External ID**: third-party cross-account access — partner sets a unique external ID in your trust policy. Prevents confused-deputy attacks.",
          "**Session policy**: scope a session further than the role's IAM policy (passed at AssumeRole time).",
          "**Source identity**: propagated identifier shown in CloudTrail; useful for audit when many users assume the same role.",
        ],
      },
      {
        heading: "Confused deputy prevention",
        bullets: [
          "When an AWS service (S3, EventBridge, SNS) invokes your resource on someone else's behalf, attackers could trick the service into acting on a victim's account.",
          "Mitigation: condition `aws:SourceAccount` + `aws:SourceArn` in resource policies.",
          "Example: SNS → SQS resource policy includes `\"aws:SourceArn\": \"arn:aws:sns:...:topic\"`.",
        ],
      },
      {
        heading: "ABAC — Attribute-Based Access Control",
        bullets: [
          "Use tags on resources + principals to drive access.",
          "Policy: `\"Condition\": { \"StringEquals\": { \"aws:ResourceTag/project\": \"${aws:PrincipalTag/project}\" } }`.",
          "Scales better than RBAC (one policy works for all projects).",
        ],
      },
      {
        heading: "IAM Access Analyzer",
        bullets: [
          "Identifies resources shared outside your account/org (S3, KMS, IAM roles, Lambda functions, SQS, Secrets Manager).",
          "Generates least-privilege policies from CloudTrail history.",
          "Lints your custom policies for syntax/security issues.",
        ],
      },
      {
        heading: "Useful condition keys recap",
        bullets: [
          "`aws:PrincipalOrgID` — restrict to your org.",
          "`aws:SourceVpc`, `aws:SourceVpce` — restrict to a VPC or VPC endpoint.",
          "`aws:SourceArn`, `aws:SourceAccount` — confused-deputy.",
          "`aws:MultiFactorAuthPresent`, `aws:MultiFactorAuthAge`.",
          "`aws:CalledVia`, `aws:CalledViaFirst` — restrict actions called through other services.",
        ],
      },
    ],
    keyNumbers: [
      { k: "ACM cert renewal", v: "Auto (DNS validation), 13 months default" },
      { k: "STS session", v: "15 min – 12 h" },
      { k: "ACM-PCA cert", v: "Up to 13 months max (DV) but PCA can issue arbitrary" },
    ],
    howAsked: [
      "“Free TLS cert for CloudFront” → ACM in us-east-1.",
      "“Internal mTLS certs” → ACM Private CA.",
      "“Third-party assumes your role” → trust policy + External ID.",
      "“Confused deputy” → aws:SourceArn + aws:SourceAccount.",
      "“Limit access only when MFA is used” → aws:MultiFactorAuthPresent.",
    ],
    cases: [
      {
        title: "External ID for SaaS",
        scenario: "Datadog must read CloudWatch metrics from your account.",
        answer: "Create a role trusting Datadog's account; trust policy condition `\"sts:ExternalId\": \"unique-id-only-Datadog-knows\"`.",
        why: "Without External ID, an attacker that knows the role ARN and Datadog's account could trick Datadog into using your role.",
      },
      {
        title: "ABAC for multi-project",
        scenario: "Developers should only access EC2/S3 resources tagged with the same project as themselves.",
        answer: "Tag principals + resources with `project=...`. Policy uses `aws:ResourceTag/project = ${aws:PrincipalTag/project}`.",
        why: "One policy scales across many projects.",
      },
    ],
    questions: [
      {
        q: "A SaaS partner needs to read your S3 bucket via cross-account role assumption. What additional protection should be enforced in the trust policy?",
        options: [
          "MFA condition.",
          "External ID condition.",
          "VPC source condition.",
          "Region condition.",
        ],
        correct: 1,
        explanation: "External ID is the AWS-recommended antidote to the confused-deputy attack between third parties.",
      },
      {
        q: "Where must an ACM certificate live to be used with a CloudFront distribution?",
        options: [
          "The same region as the origin.",
          "us-east-1 (N. Virginia).",
          "Any region.",
          "us-west-2.",
        ],
        correct: 1,
        explanation: "CloudFront is a global service whose certs live in us-east-1.",
      },
    ],
    gotchas: [
      "ACM for CloudFront = us-east-1.",
      "DNS validation auto-renews; email validation does NOT auto-renew.",
      "External ID matters when third parties assume your role.",
      "ABAC scales policies through tags; RBAC scales through groups & policies.",
    ],
  },
];
