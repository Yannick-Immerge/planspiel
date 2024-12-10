import sys
import traceback
from pathlib import Path

import colorama

# Fix path
_REAL_PATH = str(Path(__file__).parent.parent)
if _REAL_PATH not in sys.path:
    sys.path.append(_REAL_PATH)

from shared.data_model.context import initialize_db_context_default, close_db_context, execute_void_query
from scripts.utility import print_f, print_err, print_suc
from scripts.schema.interface import load_query

HELP_MESSAGE = """\
Register mysql database users for the game and data controller.

Usage:
setup_microservice_users [--help]

Parameters:
--help:
Only show this help message.\
"""


def configure_database_users():
    execute_void_query(load_query("create_users"))


def parse_cli_arguments():
    """
    Parse the provided CLI arguments and potentially print the help message and exit immediately.
    """

    print_help = None
    error = 0
    for p in sys.argv[1:]:
        if p == "--help":
            if print_help is None:
                print_help = True
            else:
                print_f(colorama.Fore.RED, "Syntax Error: A flag can only be provided once.")
                error = -1
                print_help = True
                break
        else:
            print_f(colorama.Fore.RED, f"Syntax Error: Unknown option: {p}")
            error = -1
            print_help = True
            break

    if print_help is not None and print_help:
        print(HELP_MESSAGE)
        exit(error)


if __name__ == "__main__":
    parse_cli_arguments()

    # Establish database connection
    print("Establishing connection to database...")
    try:
        initialize_db_context_default()
        print_suc("Initialized connection successfully.")
    except:
        print_err("The database is currently not available. More info:")
        print(colorama.Fore.LIGHTBLACK_EX + "\n".join(map(lambda l: f"\t{l}", traceback.format_exc().splitlines())) + colorama.Style.RESET_ALL)
        exit(-1)

    print("\nConfiguring database users...")
    error = False
    try:
        configure_database_users()
        print_suc("Database users have been configured.")
    except:
        print_err("An error occurred while configuring the user. More info:")
        print(colorama.Fore.LIGHTBLACK_EX + "\n".join(map(lambda l: f"\t{l}", traceback.format_exc().splitlines())) + colorama.Style.RESET_ALL)
        error = True

    print("\nClosing connection...")
    close_db_context()
    print_suc("Connection has been closed.")

    if error:
        exit(-1)

    print(f"\n{colorama.Fore.CYAN}Users have been configured.{colorama.Style.RESET_ALL}")