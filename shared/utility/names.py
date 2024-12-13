import random
from typing import Any, Callable

_OPTIONS_NOUN = [
    "Haus", "Känguru", "Notizbuch", "Veilchen", "Atom", "Molekül",
    "Xylophon", "Zebra", "Feuer", "Flusspferd", "Riff", 
    "Xenon", "Joghurt", "Element", "Licht", "Paradies", "Flüstern", 
    "Abenteuer", "Blau", "Rätsel", "Zen", "Echo", "Märchen", 
    "Neutron", "Elektron", "Bernstein", "Glück", "Charisma", 
    "Zwielicht", "Kaleidoskop", "Lachen", "Leben", "Schicksal", "Erbe", "Königreich",
    "Flimmern", "Erwachen", "Schimmern", "Herz", "Lächeln", 
    "Vertrauen", "Eis", "Farbenspiel", "Meer", "Schiff", "Gespräch", "Mikrofon", 
    "Seepferdchen", "Einhorn", "Klavier", "Brot", "Papier"
]


_OPTIONS_ADJECTIVE = [
    "abenteuerliches", "altes", "ausgezeichnetes", "aufgeregtes", 
    "blaues",
    "cooles"
    "dunkles", "dankbares",
    "ehrliches", "elegantes", "erfahrenes", "eindeutiges", 
    "feuriges", "freundliches", "fröhliches",
    "grünes", "glückliches", "geduldiges", "geheimes", "glattes", "geschäftiges"
    "heißes", "hervorragendes", "hohes", "helles", "hartes", 
    "intelligentes", "interessantes"
    "junges", "japanisches"
    "klassisches", "kreatives", "kühles", "kaltes", "kluges", "klares", 
    "lautes", "lebendiges", "langes", 
    "modernes", "mutiges",
    "neues", "nices"
    "optimistisches", "offenes",
    "pinkes", "plapperndes"
    "qiuetschendes" 
    "rotes", "ruhiges", "reiches", "rauhes",
    "schönes", "starkes", "schnelles", "salziges", "süßes", "saueres", "selbstbewusstes", "stabiles", "sicheres", "scharfes", "sanftes", 
    "treues", "tapferes"
    "ungeduldiges", "uriges"
    "verschwommenes",
    "warmes", "weiches", 
    "zahmes", "zitterndes"
]


def generate_name(in_use: Callable[[str], bool]) -> str:
    while True:
        option = f"{random.sample(_OPTIONS_ADJECTIVE, 1)[0]}-{random.sample(_OPTIONS_NOUN, 1)[0]}"
        if not in_use(option):
            return option
