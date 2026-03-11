/**
 * Node type constants for setup routing.
 * Integration nodes use type === INTEGRATION_TYPE and are configured via go_data.flow.
 * All other node types are treated as internal and use type-specific setup branches.
 */

export const INTEGRATION_TYPE = "Integration";

/**
 * Returns true if the given node type is an integration (extension) node.
 * @param {string} nodeType - The node type from the request
 * @returns {boolean}
 */
export function isIntegrationNode(nodeType) {
  return nodeType === INTEGRATION_TYPE;
}
