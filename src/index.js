const { program } = require("commander")
const{ name, version } = require("./constant.json")

// import Action from "./action.json"
const{ init } = require("./commands")

/** @type { import("commander").Command } */
program.command("init")
.argument("<name>")
.description("新建项目")
.alias("i")
.action(init)

// program.command("help")

program.parse(process.argv)