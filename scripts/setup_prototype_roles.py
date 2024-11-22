import sys
import traceback
from pathlib import Path

import colorama

# Fix path
_REAL_PATH = str(Path(__file__).parent.parent)
if _REAL_PATH not in sys.path:
    sys.path.append(_REAL_PATH)

from data_model.context import initialize_db_context, close_db_context
from prototype_roles.interface import post_roles
from scripts.utility import print_f, print_err, print_suc

HELP_MESSAGE = """\
Fill the database with the roles in \"prototype_roles/\".

Usage:
setup_prototype_roles [--help]

Parameters:
--help:
Only show this help message.\
"""


def parse_cli_arguments():
    """
    Parse the provided CLI arguments and potentially print the help message and exit immediately.
    :return: Whether a docker container for persisting the mysql database should be created.
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
        initialize_db_context("localhost", 3306, "mydatabase", "admin", "admin")
        print_suc("Initialized connection successfully.")
    except:
        print_err("The database is currently not available. More info:")
        print(colorama.Fore.LIGHTBLACK_EX + "\n".join(map(lambda l: f"\t{l}", traceback.format_exc().splitlines())) + colorama.Style.RESET_ALL)
        exit(-1)

    print("\nCollecting and pushing prototype roles...")
    error = False
    try:
        post_roles()
        print_suc("Prototype Roles have been pushed to the database.")
    except:
        print_err("An error occurred while parsing or pushing the prototype roles. More info:")
        print(colorama.Fore.LIGHTBLACK_EX + "\n".join(map(lambda l: f"\t{l}", traceback.format_exc().splitlines())) + colorama.Style.RESET_ALL)
        error = True

    print("\nClosing connection...")
    close_db_context()
    print_suc("Connection has been closed.")

    if error:
        exit(-1)

    print(f"\n{colorama.Fore.CYAN}Database has been populated.{colorama.Style.RESET_ALL}")