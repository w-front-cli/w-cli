const { target } = require("../../webpack.config")
const { downDir, copyTempToDir, LoadingFetch, getTagLists, fecthReopLists, writePackageJson, downloaddependences } = require("./utils")
const inquirer = require("inquirer")


module.exports = async (name) => {

    let repos = await LoadingFetch(fecthReopLists, "正在拉取列表")()
    const { repo } = await inquirer.prompt([
        {
            type: "list",
            name: "repo",
            message: "选择一个模板",
            choices: repos.map(repo => repo.name),
        },
    ])

    let tags = await LoadingFetch(getTagLists, `正在查找该模板${repo}的版本号`)(repo)
    const { tag } = await inquirer.prompt([
        {
            type: "list",
            name: "tag",
            message: "请选择版本",
            choices: tags.map(tag => tag.name)
        }
    ])


    const target = await LoadingFetch(downDir, "拉取模板中...")(repo, tag)

    // const { projName } = await inquirer.prompt([
    //     {
    //         type: "input",
    //         name: "projName",
    //         message: "输入项目名字",
    //         default: "app"
    //     }
    // ])
    
    let packageJson = await copyTempToDir(target, name)

    const { newRepo, version, author, description } = await inquirer.prompt([
        {
            type: "input",
            name: "newRepo",
            message: "请输入仓库地址",
            default: ""
        },
        {
            type: "input",
            name: "version",
            message: "请输入版本号",
            default: "1.0.0"
        },
        {
            type: "input",
            name: "author",
            message: "请输入作者",
            "default": ""
        },
        {
            type: "input",
            name: "description",
            message: "请输入描述信息"
        },
    ])

    packageJson = {
        ...packageJson,
        name,
        repository: newRepo,
        version,
        author,
        description
    }

    await LoadingFetch(writePackageJson, "生成package.json")(packageJson)
    downloaddependences()
}