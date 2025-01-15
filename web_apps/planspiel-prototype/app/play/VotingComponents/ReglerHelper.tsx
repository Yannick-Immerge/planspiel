import { UserVotingStatus } from "@/app/api/models"

export function GetSollte(id: string, value: number, statusQuo: number) : string {
    if (id === "fossil_fuel_taxes") {
        if (ApproximatelyEqual(statusQuo, value)) {
            return `Der Bürgerrat sieht keine Notwendigkeit, fossile Brennstoffe zu besteuern oder Richtwerte global vorzugeben.`
        } else {
            return `Der Bürgerrat stimmt für die Einführung einer globalen Richtlinie für die ${value > statusQuo? "Besteuerung" : "Subventionierung"} von Fossilen Brennstoffen in folgender Höhe: ${GetEinheitenText(id, value)}.`
        }
    }
    if (id === "reduction_infra")  {
        if (ApproximatelyEqual(statusQuo, value)) {
            return `Der Bürgerrat sieht keine Notwendigkeit, die Infrastruktur für fossile Brennstoffe gezielt zurückzubauen.`
        } else {
            return `Der Bürgerrat hält die Regierungen aller Länder der Vereinten Nationen an, ab 2030 zu beginnen, ${value}% der Infrastruktur für fossile Brennstoffe gezielt zurückzubauen.`
        }
    }
        
    if (id === "gases_agriculture") {
        if (ApproximatelyEqual(statusQuo, value)) {
            return "Der Bürgerrat sieht keine Notwendigkeit, die Abgase der Landwirtschaft, insbesondere Methan und Lachgas Gesetzlich, Steuerlich oder anders zu regulieren."
        } else {
            return `Der Bürgerrat ist der Meinung, dass ${value}% der Abgase aus der Landwirtschaft, insbesondere Methan und Lachgas mithilfe von Gesetzen, Steuern, Regularien, Bildung und anderen Rechtssicheren Mitteln reduziert werden müssen.`
        }
    }
        
    if (id === "reduction_meat") {
        if (ApproximatelyEqual(statusQuo, value)) {
            return `Im Weiteren sieht der Bürgerrat keine Verhältnismäßigkeit, durch Eingreifen der Regierungen den Anteil von Fleisch an der Ernährung der Menschen unseres Planeten zu verringern.`
        } else {
            return `Im weiteren befinden wir es für notwendig, dass der Anteil von Fleisch in der Ernährung der Menschen unseres Planeten durch Regularien, Steuern, Richtlinen, gezielte Bildung oder anders in den nächsten Jahren auf ${value}% ${statusQuo>value? "fällt":"steigt"} im Vergleich zu den jetzigen ${statusQuo}% der Lebensmittel.`
        }
    }
    
    if (id === "reduction_waste") {
        if (ApproximatelyEqual(statusQuo, value)) {
            return "Außerdem sieht der Bürgerrat keine Verhältnismäßigkeit, das Wegwerfen von Lebensmitteln global durch Eingreifen der Regierungen zu senken."
        } else {
            return `Außerdem ist der Bürgerrat der Überzeugung, dass das Wegwerfen von Lebensmitteln generell weltweit auf ${value}% der produzierten Lebensmittel ${value>statusQuo? "steigen":"fallen"} muss im Vergleich zu den jetzigen 30%.`
        }
        
    }

    else return " Äpfel"
}

export function GetEinheitenAverageMarker(id: string, value: number) : string { 
    if (id === "fossil_fuel_taxes") return `${value}% Besteuerung`
    if (id === "reduction_infra") return `${value}% Rückbau`
    if (id === "gases_agriculture") return `${value}% Verringerung`
    if (id === "reduction_meat") return `${value}% der Ernährung`
    if (id === "reduction_waste") return `${value}% der Produz. Lebensmittel`

    else return " Kilogramm"
}

export function GetEinheitenText(id: string, value: number) : string {
    if (id === "fossil_fuel_taxes") return `$${value.toFixed(1)} pro Tonne Kohle,  $${((20.0/17.0)*value).toFixed(1)} pro Fass Öl und  $${(value/20.0).toFixed(1)} pro CFM Erdgas`
    if (id === "reduction_infra") return `${value}%`
    if (id === "gases_agriculture") return `${value}%`
    if (id === "reduction_meat") return `${value}% `
    if (id === "reduction_waste") return `${value}%`

    else return " Kg"
}

function ApproximatelyEqual(a: number, b:number) : boolean {
    return Math.abs(a-b) < 1;
}

export function GetStatusQuo(id: string) : number {
    if (id === "fossil_fuel_taxes") return 0;
    if (id === "reduction_infra") return 0;
    if (id === "gases_agriculture") return 0;
    if (id === "reduction_meat") return 30;
    if (id === "reduction_waste") return 30;

    else return 0;
}

export function ComputeAbsoluteAverage(otherVotes: UserVotingStatus[], parameterName: string) : number {
    let sum : number = 0;

    for (let i : number = 0; i < otherVotes.length; i++) {
        const otherVote = otherVotes[i].parameterStatuses.find(n => n.parameter == parameterName)?.votedValue;
        sum += otherVote? otherVote : 0;
    }

    return sum / otherVotes.length;
}