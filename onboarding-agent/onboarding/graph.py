r"""Graph assembly.

Topology:

    START
      |
      v
  fetch_user
      |
      v
  draft_email
     / \
    /   \           <-- parallel fan-out
   v     v
send_email  sync_crm
    \     /
     \   /          <-- both converge here; finalize waits for both
      v
   finalize
      |
      v
     END

LangGraph runs `send_email` and `sync_crm` in the same superstep because they
share a common parent (`draft_email`) and neither depends on the other. The
state reducer on `events` / `errors` (operator.add) lets both branches
append concurrently without clobbering one another.
"""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from .nodes import (
    draft_email_node,
    fetch_user_node,
    finalize_node,
    send_email_node,
    sync_crm_node,
)
from .state import OnboardingState


def build_graph():
    workflow = StateGraph(OnboardingState)

    workflow.add_node("fetch_user", fetch_user_node)
    workflow.add_node("draft_email", draft_email_node)
    workflow.add_node("send_email", send_email_node)
    workflow.add_node("sync_crm", sync_crm_node)
    workflow.add_node("finalize", finalize_node)

    workflow.add_edge(START, "fetch_user")
    workflow.add_edge("fetch_user", "draft_email")

    # Parallel fan-out: both edges have the same source, no dependency between
    # them. LangGraph schedules them concurrently in one superstep.
    workflow.add_edge("draft_email", "send_email")
    workflow.add_edge("draft_email", "sync_crm")

    # Both must complete before finalize runs. LangGraph blocks finalize until
    # every incoming edge is satisfied — this is automatic with multiple
    # `add_edge(..., "finalize")` calls.
    workflow.add_edge("send_email", "finalize")
    workflow.add_edge("sync_crm", "finalize")

    workflow.add_edge("finalize", END)

    return workflow.compile()
