import { env } from "@/lib/config/env";
import { tokenManager } from "@/lib/auth/tokenManager";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

type GraphqlError = {
  message: string;
};

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: GraphqlError[];
};

async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { data?: { accessToken?: string } };
    if (!payload.data?.accessToken) {
      return false;
    }

    tokenManager.setAccessToken(payload.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

function getGraphqlEndpoint(): string {
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");
  return `${baseUrl}/graphql`;
}

export async function graphqlQuery<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  document: string | TypedDocumentNode<TData, TVariables>,
  variables?: TVariables
): Promise<TData> {
  const execute = async () =>
    fetch(getGraphqlEndpoint(), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(tokenManager.getAccessToken() ? { Authorization: `Bearer ${tokenManager.getAccessToken()}` } : {})
      },
      body: JSON.stringify({ query, variables })
    });

  const query = typeof document === "string" ? document : print(document);
  let response = await execute();

  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await execute();
    }
  }

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors[0]?.message || "GraphQL request failed");
  }

  if (!payload.data) {
    throw new Error("GraphQL response does not contain data");
  }

  return payload.data;
}
