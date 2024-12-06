#!/usr/bin/env python

import subprocess
import sys
import traceback
from enum import Enum, auto, IntFlag
from pathlib import Path
from time import sleep

import colorama

# Fix path
_REAL_PATH = str(Path(__file__).parent.parent)
if _REAL_PATH not in sys.path:
    sys.path.append(_REAL_PATH)

from shared.data_model.context import execute_bool_query, execute_void_query, initialize_db_context, close_db_context
from scripts.utility import print_f, print_suc, print_err, query_yes_no
from scripts.image.interface import get_docker_image_path
from scripts.schema.interface import fetch_table_names, get_check_name_query, get_drop_query, load_query

HELP_MESSAGE = """\
Ensure that a database is set up for the PLANSPIEL single-server application. 
Also makes sure that the database has all tables setup and configured.

Usage:
setup_database [--create-temporary-persistence] [--help]

Parameters:
--create-temporary-persistence: 
If this flag is specified, a new docker container is created that temporarily persists the mysql database.

--configure-database:
If this flag is provided 
IMPORTANT: PROVIDING THIS OPTION WILL CLEAR ALL CONTENTS OF THE DATABASE. 

--help:
Only show this help message.\
"""


DOCKER_CONTAINER_NAME = "planspiel_tmp_mysql_backend"
DOCKER_IMAGE_NAME = "planspiel_tmp_mysql_image"
DOCKER_IMAGE_TAG = "1.0"


CONTAINER_REUSE_MESSAGE = f"""\
A viable container \"{DOCKER_CONTAINER_NAME}\" has been found on the system. 
This container will be used as the backend database server.

IMPORTANT: 
IF THERE IS AN ISSUE WITH THE EXISTING CONTAINER IT HAS TO BE DELETED BEFORE RUNNING THIS SCRIPT AGAIN.
THIS INCLUDES UPDATES TO E.G. THE DATABASE STRUCTURE THAT ARE NOT YET REFLECTED IN THE EXISTING CONTAINER.\
"""

DATABASE_NAME_CONFLICT_MESSAGE = """\
IMPORTANT:
YOU CAN CONFIGURE THE DATABASE ANYWAYS, RESULTING IN ALL CONFLICTING TABLES TO BE DROPPED.
THIS ACTION MIGHT LEAD TO UNRECOVERABLE DATA LOSS AND UNEXPECTED ERRORS FOR THE DATABASE.

If you understand the consequences choose (Y)es to continue or (N)o to cancel.\
"""


class ScriptOptions(IntFlag):
    CREATE_TEMPORARY_PERSISTENCE = auto()
    CONFIGURE_DATABASE = auto()


class ContainerAvailability(Enum):
    NOT_AVAILABLE = auto()
    AVAILABLE = auto()
    RUNNING = auto()
    ERROR = auto()


def parse_cli_arguments() -> ScriptOptions:
    """
    Parse the provided CLI arguments and potentially print the help message and exit immediately.
    :return: Whether a docker container for persisting the mysql database should be created.
    """

    print_help = None
    error = 0
    create_temporary_persistence = None
    configure_database = None
    for p in sys.argv[1:]:
        if p == "--create-temporary-persistence":
            if create_temporary_persistence is None:
                create_temporary_persistence = True
            else:
                print_f(colorama.Fore.RED, "Syntax Error: A flag can only be provided once.")
                error = -1
                print_help = True
                break
        elif p == "--configure-database":
            if configure_database is None:
                configure_database = True
            else:
                print_f(colorama.Fore.RED, "Syntax Error: A flag can only be provided once.")
                error = -1
                print_help = True
                break
        elif p == "--help":
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

    opts = ScriptOptions(0)
    if print_help is not None and print_help:
        print(HELP_MESSAGE)
        exit(error)

    if create_temporary_persistence is not None and create_temporary_persistence:
        opts |= ScriptOptions.CREATE_TEMPORARY_PERSISTENCE

    if configure_database is not None and configure_database:
        opts |= ScriptOptions.CONFIGURE_DATABASE

    return opts


def check_docker_available() -> bool:
    try:
        # Run the `docker --version` command to check Docker's availability
        result = subprocess.run(
            ["docker", "--version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if result.returncode == 0:
            print_suc(f"Docker is available. Version: {result.stdout.strip()}")
            return True
        else:
            print_err(f"Docker seems to be installed but returned an error:")
            print_f(colorama.Fore.LIGHTBLACK_EX, "\n".join(map(lambda s: f"\t\t{s}", result.stderr.strip().splitlines())))
    except FileNotFoundError:
        print_err("Docker is not installed or not in the system PATH.")
    except Exception:
        print_err("An unexpected error occurred. Please try again.")

    return False


def check_container_available() -> ContainerAvailability:
    try:
        result = subprocess.run(
            ["docker", "ps", "-a", "--format", "{{.Names}}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Check for errors in running the command
        if result.returncode != 0:
            print_f(colorama.Fore.RED, f"Querying Docker resulted in unexpected error: {result.stderr.strip()}")
            return ContainerAvailability.ERROR

        # Check if the container name exists
        containers = result.stdout.strip().split("\n")
        if DOCKER_CONTAINER_NAME not in containers:
            print_f(colorama.Fore.YELLOW, f"No container with name {DOCKER_CONTAINER_NAME} found.")
            return ContainerAvailability.NOT_AVAILABLE

        # Check if container already runs
        result = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Check for errors in running the command
        if result.returncode != 0:
            print_f(colorama.Fore.RED, f"Querying Docker resulted in unexpected error: {result.stderr.strip()}")
            return ContainerAvailability.ERROR

        # Check if the container name exists in running containers
        running_containers = result.stdout.strip().split("\n")
        if DOCKER_CONTAINER_NAME in running_containers:
            return ContainerAvailability.RUNNING
        else:
            return ContainerAvailability.AVAILABLE

    except Exception:
        print_f(colorama.Fore.RED, "An unexpected error occurred. Please try again.")

    return ContainerAvailability.ERROR


def compile_docker_image() -> bool:
    try:
        result = subprocess.run(
            ["docker", "build", "-t", f"{DOCKER_IMAGE_NAME}:{DOCKER_IMAGE_TAG}", get_docker_image_path()],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if result.returncode == 0:
            print_suc(f"Successfully built image \"{DOCKER_IMAGE_NAME}:{DOCKER_IMAGE_TAG}\".")
            return True
        else:
            print_err(f"An error occurred while building the image:")
            print_f(colorama.Fore.LIGHTBLACK_EX, "\n".join(map(lambda s: f"\t\t{s}", result.stderr.strip().splitlines())))
    except Exception:
        print_err("An unexpected error occurred. Please try again.")

    return False


def create_docker_container() -> bool:
    try:
        result = subprocess.run(
            ["docker", "create", "-p", "3306:3306", "--name", DOCKER_CONTAINER_NAME, f"{DOCKER_IMAGE_NAME}:{DOCKER_IMAGE_TAG}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if result.returncode == 0:
            print_suc(f"Successfully created container \"{DOCKER_CONTAINER_NAME}\".")
            return True
        else:
            print_err(f"An error occurred while creating the container:")
            print_f(colorama.Fore.LIGHTBLACK_EX, "\n".join(map(lambda s: f"\t\t{s}", result.stderr.strip().splitlines())))
    except Exception:
        print_err("An unexpected error occurred. Please try again.")

    return False


def start_docker_container() -> bool:
    try:
        result = subprocess.run(
            ["docker", "start", DOCKER_CONTAINER_NAME],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if result.returncode == 0:
            sleep(5)
            print_suc(f"Successfully started container \"{DOCKER_CONTAINER_NAME}\".")
            return True
        else:
            print_err(f"An error occurred while creating the container:")
            print_f(colorama.Fore.LIGHTBLACK_EX, "\n".join(map(lambda s: f"\t\t{s}", result.stderr.strip().splitlines())))
    except Exception:
        print_err("An unexpected error occurred. Please try again.")

    return False


def get_conflicting_table_names() -> list[str]:
    return list(table_name
                for table_name in fetch_table_names()
                if execute_bool_query(get_check_name_query(table_name)))


def drop_conflicting_tables(conflicts: list[str]):
    for table_name in conflicts:
        execute_void_query(get_drop_query(table_name))


def configure_database():
    execute_void_query(load_query("create_tables"))


def entrypoint():
    opts = parse_cli_arguments()
    configured = False

    if ScriptOptions.CREATE_TEMPORARY_PERSISTENCE in opts:
        print("Checking whether Docker is available...")
        if not check_docker_available():
            exit(-1)

        print("\nCheck whether container is already available...")
        availability = check_container_available()
        start_required = False
        if availability == ContainerAvailability.RUNNING:
            print_suc(f"A container {DOCKER_CONTAINER_NAME} is available and running.")
            print_f(colorama.Fore.YELLOW, f"\n{CONTAINER_REUSE_MESSAGE}")
        elif availability == ContainerAvailability.AVAILABLE:
            print_suc(f"A container {DOCKER_CONTAINER_NAME} is available but not yet running.")
            print_f(colorama.Fore.YELLOW, f"\n{CONTAINER_REUSE_MESSAGE}")
            start_required = True
        elif ContainerAvailability.NOT_AVAILABLE:
            print_suc("No viable container exists on the system.")
            print("\nCompiling latest Docker image...")
            if compile_docker_image() and create_docker_container():
                start_required = True
            else:
                exit(-1)
        else:
            print_f(colorama.Fore.RED, "An unexpected error occurred. Check the previous log for more info.")
            exit(-1)

        if start_required:
            print("\nStarting viable docker container...")
            if not start_docker_container():
                exit(-1)
    else:
        print("Expecting a mySQL server to be accessible via the default configuration:")
        print_f(colorama.Fore.CYAN, "\tlocalhost:3306")

    # Establish database connection
    print("\nEstablishing connection to database...")
    try:
        initialize_db_context("localhost", 3306, "mydatabase", "admin", "admin")
        print_suc("Initialized connection successfully.")
    except:
        print_err("The database is currently not available. More info:")
        print_f(colorama.Fore.LIGHTBLACK_EX, "\n".join(map(lambda l: f"\t\t{l}", traceback.format_exc().splitlines())))
        exit(-1)

    if ScriptOptions.CONFIGURE_DATABASE in opts:
        print("\nCheck database for naming conflicts...")
        conflicts = get_conflicting_table_names()
        actually_configure = False
        if len(conflicts) == 0:
            print_suc("The database can be configured safely.")
            actually_configure = True
        else:
            print_err("The database contains tables with CONFLICTING NAMES:")
            print_f(colorama.Fore.RED, f"\t{conflicts}")
            print_f(colorama.Fore.YELLOW, f"\n{DATABASE_NAME_CONFLICT_MESSAGE}")
            if query_yes_no():
                actually_configure = True
                print("\nDropping tables with conflicting names...")
                drop_conflicting_tables(conflicts)
                print_suc("Dropped corresponding tables.")
            else:
                print("\nThe database will not be configured.")

        if actually_configure:
            print("\nConfiguring database...")
            configure_database()
            print_suc("The database has been configured successfully.")
            configured = True

    print("\nClosing connection...")
    close_db_context()
    print_suc("Disconnected from database server.")

    print_f(colorama.Fore.CYAN, "\nEnvironment is ready. Use 'setup_prototype_roles.py' to populate.")
    if not configured:
        print_f(colorama.Fore.YELLOW, "\nWARNING:\n"
                                      "The script has not configured the database. "
                                      "There is no assurance that the database supports the schema of the planspiel.")


if __name__ == "__main__":
    entrypoint()
