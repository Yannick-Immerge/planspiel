import random
from typing import Any

_OPTIONS_NOUN = [
    "apfel", "banane", "kirsche", "hund", "elefant", "fisch", "traube", "haus",
    "schneemann", "dschungel", "känguru", "zitrone", "berg", "notizbuch", "orange",
    "bleistift", "decke", "roboter", "sonnenblume", "tiger", "regenschirm", "veilchen",
    "wal", "xylophon", "wolle", "zebra", "flughafen", "luftballon", "kaktus",
    "delphin", "feuer", "gitarre", "flusspferd", "insel", "schakal", "kiwi",
    "lava", "mango", "nacht", "ozean", "papagei", "quicksand", "rakete",
    "schnee", "tornado", "einhorn", "vampir", "zauberer", "röntgen", "gelb", "zombie",
    "eichel", "bambus", "kerze", "wüste", "echo", "fee", "garten", "honig",
    "illusion", "qualle", "drachen", "leuchtturm", "berg", "neon", "oktopus",
    "pyramide", "köcher", "riff", "sand", "schatz", "utopia", "strudel", "windsturm",
    "xenon", "joghurt", "tierkreis", "luft", "brise", "wolke", "morgendämmerung", "element", "charme",
    "glitzer", "harmonie", "hölle", "jade", "schlüssel", "licht", "nebel", "abenddämmerung",
    "oase", "paradies", "quecksilber", "strahlen", "ruhe", "zwilling", "lebendig",
    "flüstern", "hauch", "abenteuer", "blau", "schlucht", "dämmerung", "rätsel", "frost",
    "bär", "horizont", "illusion", "reise", "kaleidoskop", "landschaft", "mystisch",
    "nova", "outback", "pionier", "suche", "rosig", "saphir", "pfad", "einheit", "leere",
    "wanderlust", "erkunden", "ferne", "zen", "erzielen", "balance", "kristall",
    "göttlich", "echo", "fall", "schimmer", "hafen", "inspire", "freude", "schlüsselstein",
    "lunar", "märchen", "neutron", "ursprung", "puls", "gepolstert", "strahlend", "stern",
    "triumph", "entwirren", "reise", "laune", "xklusiv", "yoga", "eifer", "bernstein",
    "glück", "charisma", "träumer", "energie", "flamme", "glanz", "harmonie", "ikonisch",
    "reise", "kinetisch", "luzid", "magma", "nostalgie", "pracht", "gipfel", "altmodisch",
    "roam", "funkeln", "zwielicht", "allgegenwärtig", "vanguard", "wirbel", "xenith", "jugend",
    "eifer", "begeisterung", "huldigung", "strahlen", "neutron", "kaleidoskop", "märchen",
    "hoffnung", "lachen", "glanz", "tanz", "zukunft", "blick", "grenzen", "leuchten", "regenbogen",
    "tropfen", "leben", "kraft", "wert", "schicksal", "glaube", "erbe", "träumer", "königreich",
    "fluss", "sonne", "welle", "glanz", "lebensweg", "flimmern", "erwachen", "ruhe",
    "schimmern", "magie", "regen", "horizont", "unendlich", "juwel", "licht", "leben",
    "rauch", "herz", "welt", "freund", "brücke", "reise", "erinnerung", "weisheit", "feder",
    "musik", "kraft", "heilung", "lächeln", "sternenstaub", "spuren", "klarheit", "erfüllung",
    "atem", "leben", "himmel", "tiefe", "glaube", "freiheit", "hoffnung", "blüte", "tropfen",
    "gitter", "abenteuer", "weg", "blicke", "erhebung", "durchbruch", "farbe", "seele", "lust",
    "garten", "hoffnung", "weg", "vertrauen", "kraft", "spiegel", "wunder", "fluss",
    "horizont", "nacht", "himmel", "eis", "tränen", "glaube", "wellen", "seite", "farbenspiel",
    "licht", "raum", "uhr", "reisen", "vulkan", "wind", "meer", "berg", "zeiten", "schicksal",
    "erholung", "abend", "kraftquelle", "zauber", "wind", "reise", "gepäck", "lichtblick",
    "blickwinkel", "magie", "energie", "klarheit", "seelenfrieden", "hoffnung", "ewigkeit"
]


_OPTIONS_ADJECTIVE = [
    "abenteuerlich", "alt", "neu", "modern", "klassisch", "kreativ", "intelligent", "schön",
    "hässlich", "freundlich", "unfreundlich", "stark", "schwach", "schnell", "langsam", "fröhlich",
    "traurig", "ruhig", "laut", "lebendig", "tödlich", "gesund", "krank", "heiß", "kalt", "warm",
    "kühl", "süß", "sauer", "bitter", "salzig", "hervorragend", "ausgezeichnet", "furchtbar",
    "gruselig", "langweilig", "interessant", "verrückt", "klug", "dumm", "schüchtern", "mutig",
    "selbstbewusst", "unsicher", "ruhig", "aufgeregt", "hoch", "niedrig", "erfahren", "unerfahren",
    "reich", "arm", "glücklich", "unglücklich", "stabil", "instabil", "klar", "verschwommen",
    "hell", "dunkel", "eindeutig", "unsicher", "sicher", "unsicher", "optimistisch", "pessimistisch",
    "ehrlich", "unehrlich", "geduldig", "ungeduldig", "treu", "untreu", "geheim", "offen",
    "lang", "kurz", "breit", "schmal", "hoch", "flach", "scharf", "stumpf", "glatt", "rauh",
    "weich", "hart", "sanft", "stark", "sicher", "unsicher", "abgeschieden", "geschäftig",
    "ruhig", "laut", "feucht", "trocken", "dicht", "locker", "gut", "schlecht", "sympathisch",
    "unsympathisch", "seltsam", "normal", "interessant", "langweilig", "unheimlich", "angenehm",
    "unangenehm", "heftig", "mild", "lebendig", "tote", "scharf", "glatt", "glänzend", "glücklich",
    "unglücklich", "verwirrt", "geklärt", "vergesslich", "achtsam", "verantwortungsvoll", "unsensibel",
    "kreativ", "unschuldig", "gebildet", "ignorant", "gutmütig", "gemein", "organisiert", "chaotisch",
    "kalt", "warm", "kühl", "gesellig", "einsam", "langweilig", "aufregend", "heftig", "sanft",
    "zerbrechlich", "robust", "entspannt", "nervös", "ausgeglichen", "gestresst", "schnell", "langsam",
    "hochnäsig", "demütig", "zufrieden", "unzufrieden", "weich", "hart", "heilig", "böse", "offen",
    "verschlossen", "faul", "fleißig", "unbeliebt", "beliebt", "unkompliziert", "kompliziert", "fortgeschritten",
    "einfach", "kompliziert", "menschlich", "unmenschlich", "geduldig", "ungeduldig", "schwach", "stark",
    "verantwortungsvoll", "leicht", "schwer", "selbstbewusst", "ängstlich", "wohlhabend", "arm", "nah",
    "weit", "gebirgig", "flach", "rund", "eckig", "symmetrisch", "asymmetrisch", "berühmt", "unbekannt",
    "cool", "uncool", "modisch", "altmodisch", "schick", "unscheinbar", "aufgeschlossen", "verschlossen",
    "fragil", "stabil", "romantisch", "praktisch", "bequem", "ungemütlich", "wirtschaftlich", "kostspielig",
    "intelligent", "geistesabwesend", "zuverlässig", "zuversichtlich", "verwirrt", "überzeugt", "verwirrt",
    "zuversichtlich", "entschlossen", "unentschlossen", "arbeitsam", "faul", "geduldig", "unruhig",
    "stark", "schwach", "lebendig", "tot", "hell", "dunkel", "leuchtend", "dämmernd", "grün", "braun",
    "blau", "rot", "gelb", "weiß", "schwarz", "rosa", "lila", "orange", "grau", "golden", "silbern",
    "windig", "sonnig", "regnerisch", "schneereich", "trocken", "feucht", "kalt", "warm", "heiß",
    "kühl", "klar", "trüb", "entspannt", "gespannt", "vertraut", "fremd", "freundlich", "unfreundlich",
    "gesellig", "einsam", "höflich", "unhöflich", "glücklich", "traurig", "fröhlich", "deprimiert",
    "respektvoll", "respektlos", "menschlich", "unmenschlich", "ehrlich", "unehrlich", "aufmerksam", "abwesend"
]


def generate_name(reserved: dict[str, Any] | set[str]) -> str:
    while True:
        option = f"{random.sample(_OPTIONS_NOUN, 1)[0]}-{random.sample(_OPTIONS_ADJECTIVE, 1)[0]}"
        if option not in reserved:
            return option
