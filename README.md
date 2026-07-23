# Minecraft Text Editor

This is an online and open source Minecraft Text Component WYSIWYG editor, updated for modern versions, and easy-to-use, written in SvelteKit and TypeScript.

Check it out at: https://text.datapackhub.net/

![image](https://github.com/user-attachments/assets/2c16718a-c8dd-49cc-9eb5-90167834e76e)

:eyes: To prove it works, the generated text from the image above is below:

```
["",{italic:true,text:"so many "},{color:"yellow",text:"cool features!\n"},"- ",{bold:true,text:"bold"},", ",{italic:true,text:"italic"},", ",{strikethrough:true,text:"strikethrough"},", ",{underlined:true,text:"underlined"},", ",{obfuscated:true,text:"obfuscated\n"},"- ",{color:"red",text:"any "},{color:"blue",text:"colours "},"(",{color:"#DD7171",text:"including custom colours"},") and ",{shadow_color:4283782655L,text:"shadow colours\n"},"- ",{underlined:true,text:"",extra:[{color:"#f22f24",text:"c"},{color:"#f23922",text:"r"},{color:"#f24421",text:"e"},{color:"#f34e1f",text:"a"},{color:"#f3581e",text:"t"},{color:"#f3621c",text:"e "},{color:"#f37719",text:"g"},{color:"#f38118",text:"r"},{color:"#f48b16",text:"a"},{color:"#f49515",text:"d"},{color:"#f49f13",text:"i"},{color:"#f4aa12",text:"e"},{color:"#f4b410",text:"n"},{color:"#f4be0f",text:"t"},{color:"#f4c80d",text:"s "},{color:"#f5dd0a",text:"t"},{color:"#f5e709",text:"o"},{color:"#f5f107",text:"o!!!"}]},"\n- ",{bold:true,text:"custom sources"}," (",{color:"red",text:"nbt"},", ",{color:"gold",text:"scores"},", ",{color:"yellow",text:"translate keys"},", ",{color:"dark_green",text:"selectors"},", ",{color:"blue",text:"keybinds"},")\n- ",{text:"click events like this\n",click_event:{action:"open_url",url:"https://text.datapackhub.net/"}},"- ",{text:"hover events like this\n",hover_event:{action:"show_text",value:"i'm a hover event!"}},"- export to ",{color:"yellow",underlined:true,text:"json"}," and ",{color:"light_purple",underlined:true,text:"lore item components"}," (as well as normal nbt)\n- ",{color:"light_purple",underlined:true,text:"import from nbt into the editor\n"},"- save and load so you never lose your work\n\n",{color:"yellow",text:"check it out: "},{color:"aqua",underlined:true,text:"https://text.datapackhub.net",click_event:{action:"open_url",url:"https://text.datapackhub.net"}}]
```

## Bugs and feature requests

If you find a bug or have feature ideas or requests, please create an issue. It'll be considered and might become a reality!

## Contribution

Contributions are welcome! For general changes and fixes, please submit a pull request to the `main` branch. Or, if your pull request is specifically related to an indev feature, submit it to a `feature/*` branch.

Make sure you've tested the code locally before making any pull requests!!

### Local Environment

To develop locally, you will need node.js and a package manager (like npm, pnpm, etc).

1. Pull the code onto your local machine
2. Download required packages by running `npm i` (or `pnpm i`, or `bun i`)
3. Start the dev server with `npm run dev`. Info about the server will be visible in the console.
