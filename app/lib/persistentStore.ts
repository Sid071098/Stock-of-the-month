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
  subscriptionId?: string;
  updatedAt: string;
};

export type PasswordResetToken = {
  createdAt: string;
  email: string;
  expiresAt: string;
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
  status,
  subscriptionId
}: {
  customerId?: string;
  email: string;
  status: string;
  subscriptionId?: string;
}) {
  const normalizedEmail = normalizePersistentEmail(email);
  const existingSubscription = await getPersistentSubscription(normalizedEmail).catch(() => null);
  const nextCustomerId = customerId ?? existingSubscription?.customerId;
  const nextSubscriptionId = subscriptionId ?? existingSubscription?.subscriptionId;
  const subscription: PersistentSubscription = {
    active: status === "active" || status === "trialing",
    customerId: nextCustomerId,
    email: normalizedEmail,
    status,
    subscriptionId: nextSubscriptionId,
    updatedAt: new Date().toISOString()
  };

  await redisCommand<"OK">(["SET", subscriptionKey(normalizedEmail), JSON.stringify(subscription)]);

  if (nextCustomerId) {
    await redisCommand<"OK">(["SET", customerKey(nextCustomerId), normalizedEmail]);
  }

  if (nextSubscriptionId) {
    await redisCommand<"OK">(["SET", stripeSubscriptionKey(nextSubscriptionId), normalizedEmail]);
  }

  return subscription;
}

export async function getEmailForPersistentCustomer(customerId: string) {
  return redisCommand<string | null>(["GET", customerKey(customerId)]);
}

export async function getEmailForPersistentSubscription(subscriptionId: string) {
  return redisCommand<string | null>(["GET", stripeSubscriptionKey(subscriptionId)]);
}

export async function updatePersistentUserPassword(email: string, passwordHash: string) {
  const normalizedEmail = normalizePersistentEmail(email);
  const user = await getPersistentUser(normalizedEmail);

  if (!user) {
    return null;
  }

  return savePersistentUser({
    ...user,
    passwordHash
  });
}

export async function savePasswordResetToken({
  email,
  token,
  ttlSeconds
}: {
  email: string;
  token: string;
  ttlSeconds: number;
}) {
  const normalizedEmail = normalizePersistentEmail(email);
  const createdAt = new Date();
  const resetToken: PasswordResetToken = {
    createdAt: createdAt.toISOString(),
    email: normalizedEmail,
    expiresAt: new Date(createdAt.getTime() + ttlSeconds * 1000).toISOString()
  };

  await redisCommand<"OK">(["SET", passwordResetKey(token), JSON.stringify(resetToken), "EX", ttlSeconds]);

  return resetToken;
}

export async function getPasswordResetToken(token: string) {
  const rawResetToken = await redisCommand<string | null>(["GET", passwordResetKey(token)]);

  return parseJson<PasswordResetToken>(rawResetToken);
}

export async function deletePasswordResetToken(token: string) {
  await redisCommand<number>(["DEL", passwordResetKey(token)]);
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

function customerKey(customerId: string) {
  return `stockymonth:stripe-customer:${customerId}`;
}

function stripeSubscriptionKey(subscriptionId: string) {
  return `stockymonth:stripe-subscription:${subscriptionId}`;
}

function userKey(email: string) {
  return `stockymonth:user:${email}`;
}

function passwordResetKey(token: string) {
  return `stockymonth:password-reset:${token}`;
}
