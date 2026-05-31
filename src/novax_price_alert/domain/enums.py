from enum import Enum


class AlertCondition(str, Enum):
    ABOVE = "above"
    BELOW = "below"


class AlertEventStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
