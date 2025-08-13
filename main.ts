import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.190.0/http/file_server.ts";

const port = 8082;

console.log(`Server running at http://localhost:${port}`);

const openBrowser = async () => {
    const os = Deno.build.os;
    const url = `http://localhost:${port}`;
    
    let cmd: string[];
    if (os === "darwin") {
        cmd = ["open", url];
    } else if (os === "windows") {
        cmd = ["cmd", "/c", "start", url];
    } else {
        cmd = ["xdg-open", url];
    }
    
    try {
        await new Deno.Command(cmd[0], { args: cmd.slice(1) }).spawn();
    } catch (error) {
        console.error("Failed to open browser:", error);
    }
};

setTimeout(openBrowser, 1000);

serve((req) => {
    return serveDir(req, {
        fsRoot: "public",
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
    });
}, { port });