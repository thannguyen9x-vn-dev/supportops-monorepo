import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Query = {
  __typename?: 'Query';
  meSettings: UserPreferences;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  statusUpdateAlerts: Scalars['Boolean']['output'];
  mentionNotifications: Scalars['Boolean']['output'];
  assignmentAlerts: Scalars['Boolean']['output'];
  commentNotifications: Scalars['Boolean']['output'];
  requestUpdateDigest: Scalars['Boolean']['output'];
  slaRiskAlerts: Scalars['Boolean']['output'];
  escalationAlerts: Scalars['Boolean']['output'];
  resolutionReminders: Scalars['Boolean']['output'];
};

export type MeSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeSettingsQuery = { __typename?: 'Query', meSettings: { __typename?: 'UserPreferences', assignmentAlerts: boolean, statusUpdateAlerts: boolean, slaRiskAlerts: boolean, escalationAlerts: boolean, resolutionReminders: boolean, requestUpdateDigest: boolean, commentNotifications: boolean, mentionNotifications: boolean } };


export const MeSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MeSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignmentAlerts"}},{"kind":"Field","name":{"kind":"Name","value":"statusUpdateAlerts"}},{"kind":"Field","name":{"kind":"Name","value":"slaRiskAlerts"}},{"kind":"Field","name":{"kind":"Name","value":"escalationAlerts"}},{"kind":"Field","name":{"kind":"Name","value":"resolutionReminders"}},{"kind":"Field","name":{"kind":"Name","value":"requestUpdateDigest"}},{"kind":"Field","name":{"kind":"Name","value":"commentNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"mentionNotifications"}}]}}]}}]} as unknown as DocumentNode<MeSettingsQuery, MeSettingsQueryVariables>;