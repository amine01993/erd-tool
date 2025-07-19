import { memo } from "react";


const EntityNode = (props: any) => {
    console.log("EntityNode props:", props);
    return (
        <div className="border border-gray-800 rounded-md p-1">
            <h3 className="font-semibold border-b pb-1 text-center">Entity Name</h3>
            <ol className="text-sm text-gray-600 flex flex-col gap-1 mt-1">
                <li>Attribute 1</li>
                <li>Attribute 2</li>
                <li>Attribute 3</li>
            </ol>
        </div>
    );
}

export default memo(EntityNode);