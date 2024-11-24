import {Scenario} from '@/app/data/queries'
import AttributeView from "@/app/components/general/attribute-view";
import TypedContentView from "@/app/components/general/typed-content-view";
import CardView from "@/app/components/general/card-view";

export default function ScenarioView({scenario} : { scenario: Scenario }) {
    return (
        <CardView title="Scenario Details" top_right={`#${scenario.id}`}>
            <AttributeView
                attr={[
                    {name: "Type", text: scenario.type},
                ]}
            />
            <TypedContentView type={scenario.type} text_content={scenario.text_content} binary_content={scenario.binary_content}/>
        </CardView>
    );
}