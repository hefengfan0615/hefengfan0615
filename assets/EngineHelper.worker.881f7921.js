(function() {
    "use strict";
    var i = null;
    const t = "/wasm";
    self.onmessage = function(e) {
        if (e.data.command != null)
            i && i.send_command(e.data.command);
        else if (e.data.wasm_type != null) {
            let a = e.data.origin;
            console.log("Try to load: " + a + t + "/pikafish.js"),
            self.importScripts(a + t + "/pikafish.js"),
            self.Pikafish({
                read_stdout: s=>self.postMessage({
                    stdout: s
                }),
                onExit: s=>self.postMessage({
                    exit: s
                }),
                locateFile: s => a + t + "/" + s,
                setStatus: s=>{
                    self.postMessage({
                        download: s
                    })
                }
            }).then(s=>{
                i = s,
                self.postMessage({
                    ready: !0
                })
            }
            )
        }
    }
}
)();