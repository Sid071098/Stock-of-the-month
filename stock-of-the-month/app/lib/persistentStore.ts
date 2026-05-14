export type PersistentUser = {
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
};

export type PersistentSubscription = {
  active: boolean;
  customerId?: string;
  email: string;
  status: string;
  updatedAt: string;
};

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export function isPersistentStoreConfigured() {
  return Boolean(redisUrl && redisToken);
}

export function normalizePersistentEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getPersistentUser(email: string) {
  const normalizedEmail = normalizePersistentEmail(email);
  const rawUser = await redisCommand<string | null>(["GET", userKey(normalizedEmail)]);

  return parseJson<PersistentUser>(rawUser);
}

export async function savePersistentUser(user: PersistentUser) {
  const normalizedEmail = normalizePersistentEmail(user.email);
  const nextUser = { ...user, email: normalizedEmail };

  await redisCommand<"OK">(["SET", userKey(normalizedEmail), JSON.stringify(nextUser)]);

  return nextUser;
}

export async function getPersistentSubscription(email: string) {
  const normalizedEmail = normalizePersistentEmail(email);
  const rawSubscription = await redisCommand<string | null>(["GET", subscriptionKey(normalizedEmail)]);

  return parseJson<PersistentSubscription>(rawSubscription);
}

export async function savePersistentSubscription({
  customerId,
  email,
  status
}: {
  customerId?: string;
  email: string;
  status: string;
}) {
  const normalizedEmail = normalizePersistentEmail(email);
  const subscription: PersistentSubscription = {
    active: status === "active" || status === "trialing",
    customerId,
    email: normalizedEmail,
    status,
    updatedAt: new Date().toISOString()
  };

  await redisCommand<"OK">(["SET", subscriptionKey(normalizedEmail), JSON.stringify(subscription)]);

  return subscription;
}

async function redisCommand<T>(command: Array<number | string>) {
  if (!redisUrl || !redisToken) {
    throw new Error("persistent_store_not_configured");
  }

  const response = await fetch(redisUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  if (!response.ok) {
    throw new Error(`persistent_store_failed_${response.status}`);
  }

  const payload = (await response.json()) as { error?: string; result?: T };
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result as T;
}

function parseJson<T>(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function subscriptionKey(email: string) {
  return `stockymonth:subscription:${email}`;
}

function userKey(email: string) {
  return `stockymonth:user:${email}`;
}
