import type { GraphNode } from "@spekjs/core";
import { specNodeTopic } from "@spekjs/core/graph-node-id";
import { specTopicLabel } from "@spekjs/core/spec-topic";

/**
 * The text a node shows. A spec shows its topic's final segment, because a nested topic does not fit
 * under a node; its full topic is the node's tooltip and, through `specNodeTopic`, its identity.
 */
export function nodeDisplayLabel(node: GraphNode): string {
  return node.type === "spec" ? specTopicLabel(specNodeTopic(node)) : node.label;
}
