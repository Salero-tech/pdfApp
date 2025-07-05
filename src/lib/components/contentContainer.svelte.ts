import type Pdf from "./pdf/pdf.svelte";

export interface ContentContainer {
    titel: string;
    content: string | null;
    pdf: Pdf | null;
}



function createTabs() {
    let tabs = $state([] as ContentContainer[]);

    return {
        get tabs() {return tabs;}
    }

}


export let tabs = createTabs();
