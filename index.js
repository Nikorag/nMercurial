const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')
const cp = require('child_process');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win


let instance = null;

var args = process.argv.splice(2,process.argv.length);

var template = [{
    label: "Application",
    submenu: [
        { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));

function createWindow () {
    if (instance == null && !args.includes("no-server")){
        instance = cp.spawn('node',[path.join(__dirname, 'bin/www')]);

        instance.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });

        instance.stderr.on('data', (data) => {
            console.error(data.toString().trim());
        });
    }
    setTimeout(function(){
        // Create the browser window.
        win = new BrowserWindow({width: 1800, height: 900, title : "nMercurial", webPreferences : {'node-integration': false}})

        // and load the index.html of the app.
        win.loadURL(url.format({
            pathname: 'localhost:3000',
            protocol: 'http:',
            slashes: true,
        }))

        // Open the DevTools.
        //win.webContents.openDevTools()

        // Emitted when the window is closed.
        win.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null
        });
    }, 1000);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

process.on('exit', function () {
    if (instance !== null) {
        instance.kill();
    }
});