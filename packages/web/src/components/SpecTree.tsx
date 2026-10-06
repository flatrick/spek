import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { SpecInfo } from "@spekjs/core";
import { buildSpecTree, pruneSpecTree, specChangeTotals, specRoute, type SpecTreeNode } from "@spekjs/core/spec-topic";

interface SpecTreeProps {
  specs: SpecInfo[];
  /** Case-insensitive substring of the full topic. Matches keep the folders above them. */
  filter: string;
}

/**
 * The Specs page's folder tree. A folder holding its own spec is a link and an expandable parent at
 * once; a folder without one only groups. Every label is one segment, so the full topic rides along as
 * the title — two folders may each hold a `pagination`.
 */
export function SpecTree({ specs, filter }: SpecTreeProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const tree = useMemo(() => buildSpecTree(specs), [specs]);
  // Totals come from the whole tree: a folder's total describes the folder, not what the filter shows.
  const totals = useMemo(() => folderTotals(tree), [tree]);
  const nodes = useMemo(() => {
    const needle = filter.toLowerCase();
    return needle ? pruneSpecTree(tree, (s) => s.topic.toLowerCase().includes(needle)) : tree;
  }, [tree, filter]);

  if (nodes.length === 0) return <p className="text-text-muted text-sm">No specs found</p>;

  // A filter shows every match, so it opens whatever it kept, and its toggles are inert: a collapse
  // recorded now would only surface once the filter is cleared.
  const filtering = filter !== "";
  const isOpen = (path: string) => filtering || !collapsed.has(path);
  const toggle = (path: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  return <SpecTreeLevel nodes={nodes} totals={totals} isOpen={isOpen} toggle={toggle} filtering={filtering} />;
}

/** Each path that has sub-levels, mapped to its distinct related changes. */
function folderTotals(tree: SpecTreeNode<SpecInfo>[]): ReadonlyMap<string, number> {
  const all = specChangeTotals(tree);
  const totals = new Map<string, number>();
  const visit = (node: SpecTreeNode<SpecInfo>) => {
    if (node.children.length === 0) return;
    totals.set(node.path, all.get(node.path) ?? 0);
    node.children.forEach(visit);
  };
  tree.forEach(visit);
  return totals;
}

const changeCount = (n: number) => `${n} ${n === 1 ? "change" : "changes"}`;

/** `1 change · 4 total` on a node with sub-levels (`—` when it holds no spec), the own count on a leaf. */
function countLabel(node: SpecTreeNode<SpecInfo>, total: number | undefined): string | null {
  const own = node.spec ? node.spec.historyCount : null;
  if (total === undefined) return own ? changeCount(own) : null;
  return `${own === null ? "—" : changeCount(own)} · ${total} total`;
}

function SpecTreeLevel({ nodes, totals, isOpen, toggle, filtering }: {
  nodes: SpecTreeNode<SpecInfo>[];
  totals: ReadonlyMap<string, number>;
  isOpen: (path: string) => boolean;
  toggle: (path: string) => void;
  filtering: boolean;
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const open = isOpen(node.path);
        const hasChildren = node.children.length > 0;
        const count = countLabel(node, totals.get(node.path));
        return (
          <li key={node.path}>
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded hover:border-accent transition-colors">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggle(node.path)}
                  disabled={filtering}
                  aria-expanded={open}
                  aria-label={`${open ? "Collapse" : "Expand"} ${node.path}`}
                  className="w-4 text-text-muted enabled:hover:text-accent"
                >
                  {open ? "▾" : "▸"}
                </button>
              ) : (
                <span className="w-4" aria-hidden="true" />
              )}
              {node.spec ? (
                <Link to={specRoute(node.spec.topic)} title={node.path} className="flex-1 text-text-primary font-medium hover:text-accent">
                  {node.name}
                </Link>
              ) : (
                <span title={node.path} className="flex-1 text-text-muted">
                  {node.name}/
                </span>
              )}
              {count && <span className="text-text-muted text-xs">{count}</span>}
            </div>
            {hasChildren && open && (
              <div className="pl-6 mt-1">
                <SpecTreeLevel nodes={node.children} totals={totals} isOpen={isOpen} toggle={toggle} filtering={filtering} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
