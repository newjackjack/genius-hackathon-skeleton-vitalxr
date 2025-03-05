// @flow

export const getServerUrl = (
  serverUrlBase: string,
  organizationId: string,
  sessionId: string,
): string => `${serverUrlBase}/hackathon/${organizationId}/feed/${sessionId}`;
