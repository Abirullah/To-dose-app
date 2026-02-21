const DEFAULT_TIMEOUT_MS = 8_000;

const normalizeProvider = (provider) => (provider || "").trim().toLowerCase();

const resolveProvider = () => {
  const explicit = normalizeProvider(process.env.EMAIL_PROVIDER);
  if (explicit) return explicit;

  if ((process.env.RESEND_API_KEY || "").trim()) return "resend";
  if ((process.env.SMTP_HOST || "").trim()) return "smtp";
  if ((process.env.EMAIL_SERVICE || "").trim() && (process.env.APP_PASSWORD || "").trim())
    return "gmail";

  return "console";
};

const getFromAddress = (provider) => {
  if (provider === "resend") {
    return (process.env.RESEND_FROM || process.env.EMAIL_FROM || "").trim();
  }

  if (provider === "smtp") {
    return (process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || "").trim();
  }

  if (provider === "gmail") {
    return (process.env.EMAIL_FROM || process.env.EMAIL_SERVICE || "").trim();
  }

  return (process.env.EMAIL_FROM || "").trim();
};

export const assertEmailSenderConfigured = () => {
  const provider = resolveProvider();
  if (provider === "console") {
    return;
  }

  if (provider === "resend") {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    const from = getFromAddress("resend");
    if (!apiKey) throw new Error("RESEND_API_KEY is missing.");
    if (!from) throw new Error("RESEND_FROM (or EMAIL_FROM) is missing.");
    return;
  }

  if (provider === "smtp") {
    const host = (process.env.SMTP_HOST || "").trim();
    const user = (process.env.SMTP_USER || "").trim();
    const pass = (process.env.SMTP_PASS || "").trim();
    const from = getFromAddress("smtp");
    if (!host) throw new Error("SMTP_HOST is missing.");
    if (!user) throw new Error("SMTP_USER is missing.");
    if (!pass) throw new Error("SMTP_PASS is missing.");
    if (!from) throw new Error("SMTP_FROM (or EMAIL_FROM) is missing.");
    return;
  }

  if (provider === "gmail") {
    const user = (process.env.EMAIL_SERVICE || "").trim();
    const pass = (process.env.APP_PASSWORD || "").trim();
    const from = getFromAddress("gmail");
    if (!user || !pass) {
      throw new Error("Gmail SMTP is not configured (EMAIL_SERVICE / APP_PASSWORD).");
    }
    if (!from) throw new Error("EMAIL_FROM (or EMAIL_SERVICE) is missing.");
    return;
  }

  throw new Error(
    `Unsupported EMAIL_PROVIDER: "${provider}". Use "console", "resend", "smtp", or "gmail".`
  );
};

const withTimeout = async (promise, timeoutMs, message) => {
  const ms = Number(timeoutMs) || DEFAULT_TIMEOUT_MS;
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
};

const sendWithResend = async ({ to, subject, html, text, timeoutMs }) => {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const from = getFromAddress("resend");
  const recipients = Array.isArray(to) ? to : [to];

  const controller = new AbortController();
  const ms = Number(timeoutMs) || DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      }),
      signal: controller.signal,
    });

    const raw = await res.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : undefined;
    } catch {
      data = undefined;
    }

    if (!res.ok) {
      const message =
        data?.message ||
        data?.error?.message ||
        raw ||
        `Resend request failed (${res.status})`;
      const err = new Error(message);
      err.statusCode = res.status;
      throw err;
    }

    return { provider: "resend", id: data?.id };
  } finally {
    clearTimeout(timeoutId);
  }
};

const sendWithNodemailer = async ({
  provider,
  transport,
  to,
  subject,
  html,
  text,
  timeoutMs,
  from,
}) => {
  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport(transport);

  const info = await withTimeout(
    transporter.sendMail({
      from,
      to,
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
    }),
    timeoutMs,
    "Email send timeout"
  );

  return { provider, messageId: info?.messageId };
};

const sendWithConsole = async ({ to, subject, html, text }) => {
  const recipients = Array.isArray(to) ? to.join(", ") : to;
  console.log("\n[LOCAL EMAIL]");
  console.log(`To: ${recipients}`);
  console.log(`Subject: ${subject}`);
  if (text) console.log(`Text: ${text}`);
  if (html) console.log(`HTML: ${html}`);
  console.log("[/LOCAL EMAIL]\n");
  return { provider: "console", messageId: "local-console" };
};

export const sendEmail = async ({ to, subject, html, text, timeoutMs = DEFAULT_TIMEOUT_MS }) => {
  assertEmailSenderConfigured();

  const provider = resolveProvider();
  if (provider === "console") {
    return sendWithConsole({ to, subject, html, text });
  }

  if (provider === "resend") {
    return sendWithResend({ to, subject, html, text, timeoutMs });
  }

  if (provider === "smtp") {
    const host = (process.env.SMTP_HOST || "").trim();
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure =
      normalizeProvider(process.env.SMTP_SECURE) === "true" ? true : port === 465;

    const user = (process.env.SMTP_USER || "").trim();
    const pass = (process.env.SMTP_PASS || "").trim();
    const from = getFromAddress("smtp");

    return sendWithNodemailer({
      provider: "smtp",
      transport: {
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: Number(timeoutMs) || DEFAULT_TIMEOUT_MS,
        greetingTimeout: Number(timeoutMs) || DEFAULT_TIMEOUT_MS,
        socketTimeout: Number(timeoutMs) || DEFAULT_TIMEOUT_MS,
      },
      to,
      subject,
      html,
      text,
      timeoutMs,
      from,
    });
  }

  if (provider === "gmail") {
    const user = (process.env.EMAIL_SERVICE || "").trim();
    const pass = (process.env.APP_PASSWORD || "").trim();
    const from = getFromAddress("gmail");

    return sendWithNodemailer({
      provider: "gmail",
      transport: {
        service: "gmail",
        auth: { user, pass },
        connectionTimeout: Number(timeoutMs) || DEFAULT_TIMEOUT_MS,
        greetingTimeout: Number(timeoutMs) || DEFAULT_TIMEOUT_MS,
        socketTimeout: Number(timeoutMs) || DEFAULT_TIMEOUT_MS,
      },
      to,
      subject,
      html,
      text,
      timeoutMs,
      from,
    });
  }

  throw new Error(
    `Unsupported EMAIL_PROVIDER: "${provider}". Use "console", "resend", "smtp", or "gmail".`
  );
};
