export default function WarningArea({warning} : {warning: string | null}) {
    return warning === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Warnings</h1>
            <p>{warning}</p>
        </div>
    );
}