# dev
## browser
```bash
npm run dev -- --host
```
## capcacitor
```bash
npm build && npx cap run
```

### adb Android
(first on host machien the in container)
```bash
adb devices
adb tcpip 5555
adb connect <ip>

```


// Example of registering various event listeners - can uncomment as needed
//eventBus.on('pagerender', (evt) => console.log('Page render event:', evt));
      // eventBus.on('pagerendered', (evt) => console.log('Page rendered event:', evt));
      // eventBus.on('pagesloaded', (evt) => console.log('Pages loaded event:', evt));
      // eventBus.on('textlayerrendered', (evt) => console.log('Text layer rendered:', evt));
      // eventBus.on('annotationlayerrendered', (evt) => console.log('Annotation layer rendered:', evt));
      // eventBus.on('annotationeditorlayerrendered', (evt) => console.log('Annotation editor layer rendered:', evt));
      // eventBus.on('xfalayerrendered', (evt) => console.log('XFA layer rendered:', evt));
      // eventBus.on('outlineloaded', (evt) => console.log('Outline loaded:', evt));
      // eventBus.on('attachmentsloaded', (evt) => console.log('Attachments loaded:', evt));
      // eventBus.on('layersloaded', (evt) => console.log('Layers loaded:', evt));
      // eventBus.on('updateviewarea', (evt) => console.log('View area updated:', evt));
      // eventBus.on('updatefindcontrolstate', (evt) => console.log('Find control state updated:', evt));
      // eventBus.on('updatefindmatchescount', (evt) => console.log('Find matches count updated:', evt));
// Mouse events
      // eventBus.on('mousedown', (event) => console.log('Mouse down:', event));
      // eventBus.on('mouseup', (event) => console.log('Mouse up:', event));
      // eventBus.on('mouseover', (event) => console.log('Mouse over:', event));
      
      // Form interaction events
      // eventBus.on('resetform', (event) => console.log('Form reset:', event));
      // eventBus.on('formsubmit', (event) => console.log('Form submit:', event));
      // eventBus.on('forminputchanged', (event) => console.log('Form input changed:', event));
      // eventBus.on('sidebarviewchanged', (event) => console.log('Sidebar view changed:', event));
      
      // Document events
      // eventBus.on('documentloaded', (event) => console.log('Document loaded:', event));
      // eventBus.on('documentinit', (event) => console.log('Document initialized:', event));
      // eventBus.on('fileinputchange', (event) => console.log('File input changed:', event));
      
      // Navigation events
      // eventBus.on('namedaction', (event) => console.log('Named action:', event));
      // eventBus.on('presentationmodechanged', (event) => console.log('Presentation mode changed:', event));
      // eventBus.on('rotatecw', (event) => console.log('Rotate clockwise:', event));
      // eventBus.on('rotateccw', (event) => console.log('Rotate counter-clockwise:', event));