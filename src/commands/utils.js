const { promisify } = require("util")
let downloadGit = require("download-git-repo")
const { config } = require("process")
const path = require("path")
const ora = require("ora")
const fs = require('fs')
const fse = require("fs-extra")
const axios = require("axios")
downloadGit = promisify(downloadGit)
const { dirName } = require("../constant.json")
// const { ncp }  = require("ncp")
const { execFile, spawn, exec, spawnSync } = require("child_process")

let packageJsonPath, projPath
const tempDir = `${process.env[process.platform === "darwin" ? "HOME" : "USERPROFILE"]}/${dirName}`

async function copy(from, to){
    let stat = fs.statSync(from)
    if(stat.isFile()){
        fs.copyFileSync(from, to)
    }
    else{
        newDirSync(to)
        let dirs = fs.readdirSync(from)
        dirs = dirs.map(dir => {
            let _from = `${from}\\${dir}`
            let _to = `${to}\\${dir}`
            copy(_from, _to)
        })

        await Promise.all(dirs)
    }
}

function newDirSync(dir) {
    if(fs.existsSync(dir)){
        return true
    }
    else{
        if(newDirSync(path.dirname(dir))){
            fs.mkdirSync(dir)
            return true
        }
    }
}

module.exports = {

    fecthReopLists: async () => {
        const { data } = await axios.get("https://api.github.com/orgs/w-front-cli/repos")
        return data
    },
    

    LoadingFetch: (fn, message) => async (...args) => {
        const spinner = ora()
        spinner.start(message)
        let result = await fn(...args)
        spinner.succeed("成功 !")
        return result
    },

    getTagLists: async (repo) => {
        const { data } = await axios.get(`https://api.github.com/repos/w-front-cli/${repo}/tags`)
        // console.log(data)
        return data
    },

    downDir: async (repo, tag) => {
        let project = `w-front-cli/${repo}`
        
        if(tag) {
            project += `#${tag}`
        }

        let dest = `${tempDir}/${repo}`


        try {
            await downloadGit(project, dest)
        }
        catch(e) {
            console.log("出现错误：", e)
        }

        return dest
    },

    copyTempToDir: async (target, projectName) => {
        projPath = path.resolve(__dirname, projectName)
        await copy(target, projPath)
        await fse.remove(target)

        //改名
        packageJsonPath = projPath+"\\package.json"
        return JSON.parse(fs.readFileSync(packageJsonPath, {encoding:"utf8"}))

    },

    writePackageJson: async (packageJson) => {
        await fse.remove(packageJsonPath)
        // console.log(packageJsonPath)
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4), {encoding:"utf8"})
    },

    downloaddependences: async () => {
        const command = process.platform === "win32" ? "yarn.cmd" : "yarn",
              args = ["--cwd", projPath]
        await new Promise((res, rej) => {
            spawn(command, args, {stdio: "inherit"}).on("close", code => {
                if(code !== 0) {
                    rej({
                        command: command + " " + args.join(" ")
                    })
                }
                res()
            })
        })
    }
}