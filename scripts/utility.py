import colorama


def print_f(style: colorama.Fore, msg: str):
    """
    Print with style support.
    """
    print(f"{style}{msg}{colorama.Style.RESET_ALL}")


def print_suc(msg: str):
    print_f(colorama.Fore.LIGHTBLACK_EX, f"\t> {msg}")


def print_err(msg: str):
    print_f(colorama.Fore.RED, f"\t> {msg}")


def query_yes_no() -> bool:
    """
    Query the user for a (y)es or (n)o input.
    """
    while True:
        answer = input("> ").lower()
        if answer == "y":
            return True
        elif answer == "n":
            return False


