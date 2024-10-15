// @flow

export const getServerUrl = (
  serverUrlBase: string,
  organizationId: string,
  visitorId: string,
  sessionId: string,
): string => `${serverUrlBase}/feed/${organizationId}/${visitorId}/${sessionId}`;
