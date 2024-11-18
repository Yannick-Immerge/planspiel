from enum import Enum


class RoleEntryType(Enum):
    """
    Enumerates over different types of descriptive entries for a role.
    These might be visualized differently to allow the student a more immersive discovery of his role.
    """
    PLAIN_TEXT = 0
    PROFILE = 1
