

export interface tool {
    icon: string;
    func: (index:number) => void;
}


function createTools() {
    let tools = $state([] as tool[]);
    let activeToolIndex = $state(0);


    function addTool(icon: string, func: () => void) {
        let tool: tool = {
            icon,
            func: (i) => {
                activeToolIndex = i;
                func();
            }
        };
        tools.push(tool);
    }





    return {
        get tools() { return tools; },
        get getACtiveToolIndex() { return activeToolIndex; },
        get activeTool() { return tools[activeToolIndex]; },
        addTool,
    };
}



export let tools = createTools();