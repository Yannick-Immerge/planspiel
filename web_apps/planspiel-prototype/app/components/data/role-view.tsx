import {Role} from '@/app/data/queries'
import AttributeView from "@/app/components/general/attribute-view";
import CardView from "@/app/components/general/card-view";
import RelatedView from "@/app/components/general/related-view";

export default function RoleView({role} : { role: Role }) {
    return (
        <CardView title="Role Details" top_right={`#${role.id}`}>
            <AttributeView
                attr={[
                    {name: "Name", text: role.name},
                    {name: "Description", text: role.description}
                ]}
            />
            <RelatedView name="Related Scenarios" rel={
                role.scenarios.map(scenario => ({
                    href: `/explore/scenarios/${scenario.id}`,
                    text: `Scenario #${scenario.id}`
                }))
            }/>
        </CardView>
    );
}