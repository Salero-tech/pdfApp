import { type PickedFile } from '@capawesome/capacitor-file-picker';

export interface ContentContainer {
    fileName: string;
    file: PickedFile | null;
    filePath: string | null;
    content: Uint8Array | null;
}



function createTabs() {
    let tabs = $state([] as ContentContainer[]);
    let activeTabIndex = $state(0);



    // switching
    function removeTab(index: number) {
        if (tabs.length > 0) {
            tabs.splice(index, 1);
            if(tabs.length === 0) {
            addTab();
            return;
            }
            if (activeTabIndex >= tabs.length) {
                activeTabIndex = tabs.length - 1;
            }
        }
    }

    function switchTabTo(index: number) {
        if (index == activeTabIndex) return;
        if(tabs[activeTabIndex] && tabs[activeTabIndex].content === null) {
            removeTab(activeTabIndex);
        }
        if (tabs[index]) activeTabIndex = index;
        else activeTabIndex = tabs.length - 1;
    }

    function addTab() {
        tabs.push({ fileName: "*new", content: null, file: null } as ContentContainer);
        switchTabTo(tabs.length - 1);
    }

    return {
        get tabs() {return tabs;},
        get currentTab() {return tabs[activeTabIndex]},
        get currentTabIndex() {return activeTabIndex;},
        get isEmpty() {return tabs.length === 0;},
        getIndexOfTab(tab: ContentContainer) {return tabs.indexOf(tab);},
        removeTab,
        switchTabTo,
        addTab,
    }

}


export let tabs = createTabs();
