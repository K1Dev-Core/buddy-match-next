const columns = [
  [
    "O(log n)",
    "binary_search(arr, x)",
    "2408",
    "heapify(node)",
    "time_complexity = n^2",
    "stack.push(frame)"
  ],
  [
    "adj[u].push(v)",
    "queue.pop()",
    "BFS_LEVEL = 3",
    "visited[i] = true",
    "if (dp[i] > best)",
    "graph.transpose()"
  ],
  [
    "lambda calculus",
    "10110101",
    "tail recursion",
    "memo[state] = ans",
    "parse(token_stream)",
    "return subtree;"
  ],
  [
    "compiler.frontend()",
    "LL(1) grammar",
    "AST.walk(node)",
    "lexeme_count = 64",
    "optimize(cfg)",
    "register spill"
  ],
  [
    "pointer->next",
    "segmentation fault",
    "malloc(sizeof(Node))",
    "free(list_head)",
    "cache miss ratio",
    "bitmask |= 1 << k"
  ],
  [
    "Dijkstra(source)",
    "dist[v] = INF",
    "priority_queue",
    "relax(edge)",
    "union_find(root)",
    "path compression"
  ],
  [
    "hash(key) % table_size",
    "red_black_rotate()",
    "AVL.balance = 0",
    "load_factor < 0.75",
    "collision chain",
    "lookup O(1)"
  ],
  [
    "thread.join()",
    "mutex.lock()",
    "deadlock_detected",
    "critical_section",
    "context switch",
    "race condition"
  ],
  [
    "SELECT * FROM lineage",
    "index scan",
    "normalized schema",
    "transaction.commit()",
    "serializable",
    "query_plan.cost"
  ],
  [
    "neural_net.forward()",
    "gradient descent",
    "loss -> 0.042",
    "epoch = 128",
    "tokenizer.encode()",
    "attention heads"
  ],
  [
    "T(n) = 2T(n/2) + n",
    "master theorem",
    "proof by induction",
    "automata state q1",
    "CFG => PDA",
    "regular language"
  ],
  [
    "buddy.match()",
    "guess_modal.open()",
    "reveal.success",
    "lineage.connect()",
    "CodeLineage::Node",
    "สายเลือดโค้ด"
  ]
];

export function CodeBackdrop() {
  return (
    <div className="code-backdrop" aria-hidden="true">
      {columns.map((items, index) => (
        <div
          key={index}
          className={`code-column code-column-${(index % 6) + 1}`}
        >
          {[...items, ...items, ...items].map((item, itemIndex) => (
            <span key={`${index}-${itemIndex}`} className="code-line">
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
