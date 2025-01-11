import random
from typing import Callable, Literal

# 10 Characters max!
#   |          |
_OPTIONS_NOUN = [
    "Entchen"
    "Haus",
    "Känguru",
    "Notizbuch",
    "Veilchen",
    "Atom",
    "Molekül",
    "Xylophon",
    "Zebra",
    "Feuer",
    "Flusspferd",
    "Riff",
    "Xenon",
    "Joghurt",
    "Element",
    "Licht",
    "Paradies",
    "Flüstern",
    "Abenteuer",
    "Blau",
    "Rätsel",
    "Zen",
    "Echo",
    "Märchen",
    "Neutron",
    "Elektron",
    "Bernstein",
    "Glück",
    "Charisma",
    "Zwielicht",
    "Lachen",
    "Leben",
    "Schicksal",
    "Erbe",
    "Königreich",
    "Flimmern",
    "Erwachen",
    "Schimmern",
    "Herz",
    "Lächeln",
    "Vertrauen",
    "Eis",
    "Meer",
    "Schiff",
    "Gespräch",
    "Mikrofon",
    "Einhorn",
    "Klavier",
    "Brot",
    "Papier",
]

# 10 Characters max!
#   |          |
_OPTIONS_ADJECTIVE = [
    "altes",
    "blaues",
    "braves",
    "cooles",
    "dunkles",
    "dankbares",
    "ehrliches",
    "elegantes",
    "erfahrenes",
    "feuriges",
    "fröhliches",
    "funkelndes"
    "grünes",
    "geduldiges",
    "geheimes",
    "glattes",
    "heißes",
    "hohes",
    "helles",
    "hartes",
    "junges",
    "kreatives",
    "kühles",
    "kaltes",
    "kluges",
    "klares",
    "lautes",
    "lebendiges",
    "langes",
    "liebes"
    "modernes",
    "mutiges",
    "neues",
    "nices",
    "offenes",
    "pinkes",
    "rotes",
    "ruhiges",
    "reiches",
    "rauhes",
    "schönes",
    "starkes",
    "schnelles",
    "salziges",
    "süßes",
    "saueres",
    "stabiles",
    "sicheres",
    "scharfes",
    "sanftes",
    "treues",
    "tapferes",
    "uriges",
    "warmes",
    "weiches",
    "zahmes",
    "zitterndes",
]

_OPTIONS_PROPER_NOUN = [
    "einstein",
    "pascal",
    "hertz",
    "newton",
    "planck",
    "euler",
    "curie",
    "galilei",
    "fermi",
    "heisenberg",
    "galileo",
    "kepler",
    "newton",
    "tesla",
    "darwin",
    "hawking",
    "bohr",
    "faraday",
    "maxwell",
    "schrodinger",
    "dirac",
    "boyle",
    "boltzmann",
    "laplace",
    "brahe",
    "archimedes",
    "copernicus",
    "turing",
    "lavoisier",
    "gauss",
    "noether",
    "joule",
    "lemaitre",
    "oersted",
    "ohm",
    "marconi",
    "alvarez",
    "mendel",
    "lovelace",
    "feynman",
    "sagan",
    "edison",
    "bragg",
    "debroglie",
    "avogadro",
    "seaborg",
    "hubble",
    "meitner",
    "chandrasekhar",
    "pauli",
    "watt",
    "cavendish",
    "gell-mann",
    "wilkins",
    "crick",
    "watson",
    "franklin",
    "rutherford",
    "hooke",
    "snell",
    "becquerel",
    "raman",
    "townes",
    "zeeman",
]


def generate_name(
    in_use: Callable[[str], bool],
    generation_type: Literal["two_words", "word_number"] = "two_words",
    max_length: int = 20,
    max_tries: int = 1000,
) -> str:
    """Generates a name based on a generation type.

    Args:
        in_use (Callable[[str], bool]): A function that checks if a name is in use.
        generation_type (Literal["two_words", "word_number"], optional): The name generation type. Defaults to "two_words".
        max_length (int, optional): The maximum length of the generated name. Defaults to 20.
        max_tries (int, optional): The maximum number of tries to generate a valid name. Defaults to 1000.
    """
    def is_valid(option: str) -> bool:
        return not in_use(option) and len(option) <= max_length

    for _ in range(max_tries):
        if generation_type == "two_words":
            option = f"{random.sample(_OPTIONS_ADJECTIVE, 1)[0]}-{random.sample(_OPTIONS_NOUN, 1)[0]}"
        elif generation_type == "word_number":
            option = (
                f"{random.sample(_OPTIONS_PROPER_NOUN, 1)[0]}-{random.randint(1, 100)}"
            )
        else:
            raise ValueError(f"Unknown generation type: {generation_type}")

        if is_valid(option):
            return option

    raise RuntimeError(f"Could not generate a valid name after {max_tries} tries.")
