import CardView from "@/app/components/general/card-view";

export default function ErrorView({errname, errcode, errdesc} : { errname: string, errcode?: number | undefined, errdesc?: string | undefined }) {
    return (
        <CardView title={`Error: ${errname}`} top_right={errcode ? `Err. No. ${errcode}` : undefined}>
            <p className="text-red-500 text-xl">{errdesc ? errdesc : "No further info."}</p>
        </CardView>
    );
}