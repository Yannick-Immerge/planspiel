import sys
import traceback
from pathlib import Path

import colorama

# Fix path
_REAL_PATH = str(Path(__file__).parent.parent)
if _REAL_PATH not in sys.path:
    sys.path.append(_REAL_PATH)

from shared.data_model.context import initialize_db_context, close_db_context, execute_void_query, PostQuery, \
    execute_post_query
from scripts.utility import print_f, print_err, print_suc

HELP_MESSAGE = """\
Register the product key 1234-1234-1234 that does not expire and allows to create 100 sessions.

Usage:
setup_product_key [--help]

Parameters:
--help:
Only show this help message.\
"""


def push_product_key():
    query = PostQuery("INSERT INTO ProductKey(key_value, num_sessions) VALUES (\"123-123-123\", 100);", ())
    execute_post_query(query)


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
        initialize_db_context("localhost", 3306, "mydatabase", "admin", "admin")
        print_suc("Initialized connection successfully.")
    except:
        print_err("The database is currently not available. More info:")
        print(colorama.Fore.LIGHTBLACK_EX + "\n".join(map(lambda l: f"\t{l}", traceback.format_exc().splitlines())) + colorama.Style.RESET_ALL)
        exit(-1)

    print("\nPushing the product key...")
    error = False
    try:
        push_product_key()
        print_suc("Product key has been registered.")
    except:
        print_err("An error occurred while pushing the product key. More info:")
        print(colorama.Fore.LIGHTBLACK_EX + "\n".join(map(lambda l: f"\t{l}", traceback.format_exc().splitlines())) + colorama.Style.RESET_ALL)
        error = True

    print("\nClosing connection...")
    close_db_context()
    print_suc("Connection has been closed.")

    if error:
        exit(-1)

    print(f"\n{colorama.Fore.CYAN}Database has been populated.{colorama.Style.RESET_ALL}")