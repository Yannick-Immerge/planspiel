import { StateDescription } from "./TransitionArea";

export function GetAllStateDescriptions() : StateDescription[] {
    return [
        
    {
        "stateID": "configuring",
        "substates": [],
        "stateName": "Konfiguration", 
        "stateDescription": "Die Schüler können noch nichts auf ihrem Gerät sehen. Wenn alle angemeldet sind, kannst du weiter machen.",
        "nextStateDescription": "In der nächsten Spielphase bekommen die Schüler eine Rolle zugeteilt und können sich mit dieser auseinandersetzen."                    
    },
    {
        "stateID": "identification1",
        "substates": [],
        "stateName": "Kennenlernen", 
        "stateDescription": "Die Schüler haben eine Rolle zugeteilt bekommen. Jetzt können sie sich durchlesen und anschauen, wen sie im Bürgerrat vertreten werden. Achtung! Ab jetzt heißt es: in der Rolle bleiben!",
        "nextStateDescription": "Als nächstes geht der Bürgerrat los. Die Teilnehmer sollten dann Eröffnende Worte parat haben, die sie zu ihrem Thema anbringen wollen."
    },
    {
        "stateID": "discussion1",
        "substates": [
            {
                "substateID":"preparing",
                "stateName":"Begrüßung",
                "stateDescription": "Die Teilnehmenden des Bürgerrates haben sich eingefunden. Die Moderation begrüßt die Teilnehmer.",
                "nextStateDescription": "Als nächstes geben die Teilnehmer der Reihe nach ihre eröffnenden Worte ab."
            },
            {
                "substateID":"introduction",
                "stateName": "Eröffnungs-Statements", 
                "stateDescription": "Die Teilnehmenden des Bürgerrates legen der Reihe nach ihre grundlegende Meinung zum Thema dar.",
                "nextStateDescription": "Als nächstes folgt die offene Debatte."
            },
            {
                "substateID":"free",
                "stateName": "Offene Debatte", 
                "stateDescription": "Die Teilnehmenden des Bürgerrates versuchen sich konstruktiv zusammen mit dem Thema auseinanderzusetzen um einen Konsensus zu erreichen.",
                "nextStateDescription": "Zum Schluss hat jeder Teilnehmer noch einmal die Gelegenheit, seine abschließende Stellungnahme abzugeben."
            },
            {
                "substateID":"closing",
                "stateName": "Abschließende Statements", 
                "stateDescription": "Die Teilnehmenden des Bürgerrates geben jetzt der Reihe nach ihre abschließenden Statements ab.",
                "nextStateDescription": "Als nächstes geben die Teilnehmenden ihre Meinungen in form eines Schiebereglers ab."
            },
            {
                "substateID":"voting",
                "stateName": "Abstimmung", 
                "stateDescription": "Die Teilnehmenden des Bürgerrates geben anonym ihre Endgültige Meinung ab.",
                "nextStateDescription": "Danach endet der Bürgerrat."
            },
            {
                "substateID":"completed",
                "stateName": "Abgeschlossen", 
                "stateDescription": "",
                "nextStateDescription": ""
    
            },
            {
                "substateID":"inactive",
                "stateName": "Inaktiv", 
                "stateDescription": "",
                "nextStateDescription": ""
            }
        ],
        "stateName": "Der Bürgerrat", 
        "stateDescription": "Es ist an den Teilnehmern, an wichtigen Entscheidungen ihrer Zukunft Teilzuhaben.",
        "nextStateDescription": "Als nächstes machen wir einen Zeitsprung 20 Jahre in die Zukunft"            
    },
    {
        "stateID": "identification2",
        "substates": [],
        "stateName": "Konsequenzen", 
        "stateDescription": "Wir sind 20 Jahre in die Zukunft gesprungen. Die Teilnehmer des Bürgerrates haben 20 Jahre mit den Konsequenzen ihrer Politischen Beteiligung gelebt. Die Schüler können jetzt erkunden, wie es ihrer Rolle die letzten 20 Jahre ergangen ist.",
        "nextStateDescription": "Als nächstes gehen wir ins Debriefing."
    },
    {
        "stateID": "debriefing",
        "substates": [],
        "stateName": "Debriefing",
        "stateDescription": "Die Bürgerräte kommen zusammen und debriefen gemeinsam.",
        "nextStateDescription": ""
    }]
}