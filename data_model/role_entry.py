from data_model.role_entry_type import RoleEntryType


class RoleEntry:
    """
    View of an entry of the role_entry table.
    """

    @property
    def object_id(self) -> int:
        """
        Accesses the id of the role entry.
        :return:
        """
        return

    @property
    def role_entry_type(self) -> RoleEntryType:
        """
        Accesses the entry type of this role entry.
        :return:
        """
        pass

    @property
    def text_content(self) -> str | None:
        return

    @property
    def binary_content(self) -> bytes | None:
        """
        Accesses the binary content (which is a LONGBLOB in the MYSQL-backend)
        :return:
        """
        return