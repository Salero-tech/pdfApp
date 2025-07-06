import * as pdfjsLib from 'pdfjs-dist';

export interface tool {
    icon: string;
    type: number;
}

function createTools() {
    let tools = $state([] as tool[]);
    let activeToolIndex = $state(0);
    let registeredPdfToolFun: Array<(number) => void> = [];

    function addTool(icon: string, type: number) {
        tools.push({ icon, type });
    }

    // Add default tools (with no-op function)
    addTool("👁️", pdfjsLib.AnnotationEditorType.NONE);
    addTool("✏️", pdfjsLib.AnnotationEditorType.INK);
    addTool("🖍️", pdfjsLib.AnnotationEditorType.HIGHLIGHT);
    addTool("📝", pdfjsLib.AnnotationEditorType.FREETEXT);
    addTool("💾", -1);


    function registerPdf(func: (number) => void) {
        //func(tools[activeToolIndex].type);
        registeredPdfToolFun.push(func);
    }

    function removePdf(func: (number) => void) {
        const index = registeredPdfToolFun.indexOf(func);
        if (index !== -1) {
            registeredPdfToolFun.splice(index, 1);
        }
    }

    function onclick(index: number) {
        if (index < 0 || index >= tools.length) {
            console.error("Invalid tool index:", index);
            return;
        }
        activeToolIndex = index;
        const toolType = tools[activeToolIndex].type;
        registeredPdfToolFun.forEach(func => func(toolType));
    }


    return {
        get tools() { return tools; },
        get getACtiveToolIndex() { return activeToolIndex; },
        get activeTool() { return tools[activeToolIndex]; },
        registerPdf,
        removePdf,
        onclick,
    };
}

export let tools = createTools();