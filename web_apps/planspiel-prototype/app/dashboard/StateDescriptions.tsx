import { StateDescription } from "./TransitionArea";

export function GetAllStateDescriptions() : StateDescription[] {
    return [
        
    {
        "stateID": "configuring",
        "stateName": "Konfiguration", 
        "stateDescription": "Die Schüler können noch nichts auf ihrem Gerät sehen. Wenn alle angemeldet sind, kannst du weiter machen.",
        "nextStateDescription": "In der nächsten Spielphase bekommen die Schüler eine Rolle zugeteilt und können sich mit dieser auseinandersetzen."                    
    },
    {
        "stateID": "identification",
        "stateName": "Kennenlernen", 
        "stateDescription": "Die Schüler haben eine Rolle zugeteilt bekommen. Jetzt können sie sich durchlesen und anschauen, wen sie im Bürgerrat vertreten werden. Achtung! Ab jetzt heißt es: in der Rolle bleiben!",
        "nextStateDescription": "Als nächstes geht der Bürgerrat los. Die Teilnehmer sollten dann Eröffnende Worte parat haben, die sie zu ihrem Thema anbringen wollen."
    },
    {
        "stateID": "discussion",
        "stateName": "Der Bürgerrat",
        "stateDescription": "Es ist an den Teilnehmern, an wichtigen Entscheidungen ihrer Zukunft Teilzuhaben.",
        "nextStateDescription": "Als nächstes machen wir einen Zeitsprung 20 Jahre in die Zukunft"            
    },
    {
        "stateID":"voting",
        "stateName": "Abstimmung",
        "stateDescription": "Die Teilnehmenden des Bürgerrates geben anonym ihre Endgültige Meinung ab.",
        "nextStateDescription": "Danach endet der Bürgerrat."
    },
    {
        "stateID": "debriefing",
        "stateName": "Debriefing",
        "stateDescription": "Die Bürgerräte kommen zusammen und debriefen gemeinsam.",
        "nextStateDescription": ""
    }]
}