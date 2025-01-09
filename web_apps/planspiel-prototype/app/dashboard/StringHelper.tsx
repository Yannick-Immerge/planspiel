
/* Takes a string that is formatted "like_this" and turns it into a nice camel case for display "Like This" */
export function ToCamelCase(text: string, cutLeadingID: boolean = false) {
    return text.split("_")
                .slice(cutLeadingID? 1 : 0)
                .map((n) => { return n.charAt(0).toUpperCase() + n.substring(1, n.length)})
                .join(" ");
}