import operator
from typing import Annotated, Literal, Optional, TypedDict


class UserRecord(TypedDict, total=False):
    user_id: str
    email: str
    first_name: str
    last_name: str
    company: Optional[str]
    role: Optional[str]
    signup_source: str
    created_at: str
    plan: Literal["free", "pro", "enterprise"]


class StepResult(TypedDict, total=False):
    status: Literal["ok", "failed", "skipped"]
    detail: Optional[str]
    error: Optional[str]
    elapsed_ms: int


class TimelineEvent(TypedDict):
    node: str
    phase: Literal["start", "done", "error"]
    t_ms: int
    detail: Optional[str]


class OnboardingState(TypedDict, total=False):
    # Input
    user_id: str

    # Fetched / derived data
    user: Optional[UserRecord]
    email_subject: Optional[str]
    email_body: Optional[str]

    # Per-step results
    fetch_result: StepResult
    draft_result: StepResult
    email_result: StepResult
    crm_result: StepResult

    # Accumulators — parallel-safe via operator.add reducers
    errors: Annotated[list[str], operator.add]
    events: Annotated[list[TimelineEvent], operator.add]

    # Final rollup
    final_status: Literal["complete", "partial", "failed"]
